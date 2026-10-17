import { execFileSync } from "node:child_process";

import { chromium } from "@playwright/test";

const root = new URL("..", import.meta.url).pathname;
const local = JSON.parse(
  execFileSync("pnpm", ["exec", "supabase", "status", "-o", "json"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }),
);
const publicKey = local.PUBLISHABLE_KEY ?? local.ANON_KEY;
if (!local.API_URL || !local.MAILPIT_URL || !publicKey) {
  throw new Error("Local Auth runtime is unavailable");
}

function dbJson(sql) {
  return JSON.parse(
    execFileSync(
      "docker",
      [
        "exec",
        "supabase_db_FandomHarbor",
        "psql",
        "-U",
        "postgres",
        "-d",
        "postgres",
        "-Atq",
        "-v",
        "ON_ERROR_STOP=1",
        "-c",
        sql,
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    ).trim(),
  );
}

const account = dbJson(`
  select json_build_object(
    'email', u.email,
    'registration_name', p.registration_name
  )
  from auth.users u
  join public.profiles p on p.user_id=u.id
  join public.memberships m on m.user_id=u.id and m.state='active'
  where u.email like 'b2-web-changed-%@example.test'
    and p.registration_name like 'B2Web%'
  order by u.created_at desc
  limit 1
`);
if (!account.email || !account.registration_name) {
  throw new Error("Local real-email compatibility fixture is absent");
}

dbJson(`
  with cleared as (
    delete from private.auth_rate_limits
    where scope like 'auth.login.%'
       or scope like 'auth.recovery_request.%'
       or scope like 'auth.recovery_verify.%'
       or scope like 'auth.password_change.%'
    returning 1
  ), aged as (
    update auth.users
    set confirmation_sent_at = coalesce(confirmation_sent_at, now()) - interval '61 seconds',
        recovery_sent_at = case
          when recovery_sent_at is null then null
          else recovery_sent_at - interval '61 seconds'
        end
    where email='${account.email}'
    returning 1
  )
  select json_build_object(
    'aged', (select count(*) from aged),
    'cleared', (select count(*) from cleared)
  )
`);

async function recoveryOtp() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const list = await fetch(`${local.MAILPIT_URL}/api/v1/messages`).then(
      (response) => response.json(),
    );
    const message = (list.messages ?? []).find(
      (candidate) =>
        candidate.Subject === "Fandom Harbor 密码恢复验证码" &&
        candidate.To?.some((recipient) => recipient.Address === account.email),
    );
    if (message) {
      const detail = await fetch(
        `${local.MAILPIT_URL}/api/v1/message/${message.ID}`,
      ).then((response) => response.json());
      const token = `${detail.Text ?? ""}\n${detail.HTML ?? ""}`.match(
        /\b\d{6}\b/,
      )?.[0];
      if (token) return token;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Recovery OTP was not captured locally");
}

const currentPassword = "B2-local-password-43!";
const temporaryPassword = "B2-local-password-44!";
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("http://localhost:3000/auth/sign-in");
  await page.getByLabel("注册名").fill("B2UnknownAccount");
  await page.locator("#sign-in-password").fill("B2-wrong-password-42!");
  await page.getByRole("button", { name: "登录" }).click();
  await page.waitForURL(/error=invalid/);
  const unknownLoginError = await page
    .getByText("登录失败。请检查注册名和密码。")
    .innerText();

  await page.goto("http://localhost:3000/auth/sign-in");
  await page.getByLabel("注册名").fill(account.registration_name);
  await page.locator("#sign-in-password").fill("B2-wrong-password-42!");
  await page.getByRole("button", { name: "登录" }).click();
  await page.waitForURL(/error=invalid/);
  if (
    (await page.getByText("登录失败。请检查注册名和密码。").innerText()) !==
    unknownLoginError
  ) {
    throw new Error("Login errors expose account existence");
  }

  await page.goto("http://localhost:3000/auth/sign-in");
  await page.getByLabel("注册名").fill(account.registration_name);
  await page.locator("#sign-in-password").fill(currentPassword);
  await page.getByRole("button", { name: "登录" }).click();
  await page.waitForURL(/\/archive/);

  const secondaryLogin = await fetch(
    `${local.API_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: { apikey: publicKey, "content-type": "application/json" },
      body: JSON.stringify({ email: account.email, password: currentPassword }),
    },
  );
  const secondarySession = await secondaryLogin.json();
  if (!secondaryLogin.ok || !secondarySession.refresh_token) {
    throw new Error("Secondary local session setup failed");
  }

  await context.addCookies([
    {
      domain: "localhost",
      httpOnly: true,
      name: "fh_password_recovery",
      path: "/account/security",
      sameSite: "Lax",
      value: "1",
    },
  ]);
  await page.goto("http://localhost:3000/account/security");
  await page.locator("#current-password").fill("forged-cookie-wrong-password");
  await page.locator("#new-password").fill(temporaryPassword);
  await page.locator("#new-password-confirmation").fill(temporaryPassword);
  await page.getByRole("button", { name: "保存新密码" }).click();
  await page.waitForURL(/error=current-password/);

  await context.clearCookies();
  await page.goto("http://localhost:3000/auth/forgot-password");
  await page.getByLabel("注册名").fill("B2UnknownAccount");
  await page.getByRole("button", { name: "发送验证码" }).click();
  await page.waitForURL(/\/auth\/reset-password\?status=sent/);
  const unknownRecoveryNotice = await page
    .getByText("如果该注册名已绑定可投递邮箱，验证码已经发送。")
    .innerText();

  await page.goto("http://localhost:3000/auth/forgot-password");
  await page.getByLabel("注册名").fill(account.registration_name);
  await page.getByRole("button", { name: "发送验证码" }).click();
  await page.waitForURL(/\/auth\/reset-password/);
  if (
    (await page
      .getByText("如果该注册名已绑定可投递邮箱，验证码已经发送。")
      .innerText()) !== unknownRecoveryNotice
  ) {
    throw new Error("Recovery responses expose account existence");
  }
  const token = await recoveryOtp();
  await page.getByLabel("注册名").fill(account.registration_name);
  await page.getByLabel("6 位验证码").fill(token);
  await page.getByRole("button", { name: "继续重置密码" }).click();
  await page.waitForURL(/status=recovery/);

  const grant = (await context.cookies()).find(
    (cookie) => cookie.name === "fh_password_recovery",
  );
  if (
    !grant?.httpOnly ||
    grant.sameSite !== "Lax" ||
    !/^v1\.[0-9a-f-]{36}\.\d+\.[0-9a-f]{64}$/.test(grant.value) ||
    grant.value.includes(account.email)
  ) {
    throw new Error("Password recovery grant cookie is not safely bound");
  }

  await page.locator("#new-password").fill(temporaryPassword);
  await page.locator("#new-password-confirmation").fill(temporaryPassword);
  await page.getByRole("button", { name: "保存新密码" }).click();
  await page.waitForURL(/status=password-updated/);

  const revokedRefresh = await fetch(
    `${local.API_URL}/auth/v1/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: { apikey: publicKey, "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: secondarySession.refresh_token }),
    },
  );
  if (revokedRefresh.ok) {
    throw new Error("Password update retained another refresh session");
  }

  await context.clearCookies();
  await page.goto("http://localhost:3000/auth/sign-in");
  await page.getByLabel("注册名").fill(account.registration_name);
  await page.locator("#sign-in-password").fill(temporaryPassword);
  await page.getByRole("button", { name: "登录" }).click();
  await page.waitForURL(/\/archive/);

  await page.goto("http://localhost:3000/account/security");
  await page.locator("#current-password").fill(temporaryPassword);
  await page.locator("#new-password").fill(currentPassword);
  await page.locator("#new-password-confirmation").fill(currentPassword);
  await page.getByRole("button", { name: "保存新密码" }).click();
  await page.waitForURL(/status=password-updated/);

  console.log(
    JSON.stringify({
      accountEnumerationResponses: "uniform",
      forgedRecoveryCookie: "rejected",
      otherRefreshSessionRevocation: "passed",
      signedRecoveryGrant: "passed",
      verifiedRecoveryPasswordChange: "passed",
    }),
  );
} finally {
  await browser.close();
}
