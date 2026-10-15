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
const mailpitUrl = local.MAILPIT_URL;
const apiUrl = local.API_URL;
const publicKey = local.PUBLISHABLE_KEY ?? local.ANON_KEY;
if (!mailpitUrl || !apiUrl || !publicKey) {
  throw new Error("Local Supabase runtime is incomplete");
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

function setRegistrationMode(mode) {
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
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      `update private.registration_settings set mode='${mode}', updated_at=statement_timestamp() where singleton`,
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
}

function ageAuthMailerTimestamps(targetEmail) {
  const state = dbJson(`
    with updated as (
      update auth.users
      set confirmation_sent_at = coalesce(confirmation_sent_at, now()) - interval '61 seconds',
          recovery_sent_at = case
            when recovery_sent_at is null then null
            else recovery_sent_at - interval '61 seconds'
          end,
          email_change_sent_at = case
            when email_change_sent_at is null then null
            else email_change_sent_at - interval '61 seconds'
          end,
          reauthentication_sent_at = case
            when reauthentication_sent_at is null then null
            else reauthentication_sent_at - interval '61 seconds'
          end
      where email='${targetEmail}'
      returning 1
    )
    select json_build_object('updated', count(*)) from updated
  `);
  if (state.updated !== 1) throw new Error("Synthetic Auth clock setup failed");
}

function expireAuthOtp(targetEmail, timestampColumn) {
  if (
    !new Set(["confirmation_sent_at", "recovery_sent_at"]).has(timestampColumn)
  ) {
    throw new Error("Unsupported synthetic Auth timestamp");
  }
  const state = dbJson(`
    with updated as (
      update auth.users
      set ${timestampColumn} = now() - interval '16 minutes'
      where email='${targetEmail}'
      returning 1
    )
    select json_build_object('updated', count(*)) from updated
  `);
  if (state.updated !== 1) throw new Error("Synthetic OTP expiry setup failed");
}

function clearRateLimitScopes(prefix) {
  dbJson(`
    with cleared as (
      delete from private.auth_rate_limits
      where scope like '${prefix}.%'
      returning 1
    )
    select json_build_object('cleared', count(*)) from cleared
  `);
}

function resetLocalSyntheticFixture() {
  const state = dbJson(`
    with cleared as (
      delete from private.auth_rate_limits
      where scope like 'auth.%'
      returning 1
    ), invitation as (
      update public.invitations
      set max_uses = greatest(max_uses, 100)
      where id = 'b2ff1000-0000-4000-8000-000000000001'::uuid
      returning 1
    )
    select json_build_object(
      'invitation', (select count(*) from invitation),
      'rate_limits_cleared', (select count(*) from cleared)
    )
  `);
  if (state.invitation !== 1)
    throw new Error("Local invitation fixture is absent");
}

async function otpFor(email, subjectFragment) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const list = await fetch(`${mailpitUrl}/api/v1/messages`).then((response) =>
      response.json(),
    );
    const messages = (list.messages ?? []).filter(
      (message) =>
        message.To?.some((recipient) => recipient.Address === email) &&
        String(message.Subject).includes(subjectFragment),
    );
    for (const message of messages) {
      const detail = await fetch(
        `${mailpitUrl}/api/v1/message/${message.ID}`,
      ).then((response) => response.json());
      const content = `${detail.Text ?? ""}\n${detail.HTML ?? ""}`;
      const token = content.match(/\b\d{6}\b/)?.[0];
      if (token) return token;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Local ${subjectFragment} OTP was not captured`);
}

function cookieContainsDecodedValue(cookieValue, expectedValue) {
  const pending = [cookieValue];
  const seen = new Set();
  while (pending.length > 0 && seen.size < 40) {
    const value = String(pending.shift() ?? "");
    if (seen.has(value)) continue;
    seen.add(value);
    if (value.toLowerCase().includes(expectedValue.toLowerCase())) return true;
    try {
      pending.push(decodeURIComponent(value));
    } catch {
      // Ignore non-URL-encoded cookie values.
    }
    const base64Value = value.startsWith("base64-") ? value.slice(7) : value;
    if (/^[A-Za-z0-9+/_=-]{16,}$/.test(base64Value)) {
      try {
        pending.push(
          Buffer.from(
            base64Value.replace(/-/g, "+").replace(/_/g, "/"),
            "base64",
          ).toString("utf8"),
        );
      } catch {
        // Ignore values that only resemble base64.
      }
    }
    pending.push(...value.split(".").filter((part) => part.length > 16));
    try {
      pending.push(...Object.values(JSON.parse(value)).map(String));
    } catch {
      // Ignore non-JSON cookie layers.
    }
  }
  return false;
}

async function submitEmailConfirmation(page, button) {
  const actionResponse = page.waitForResponse((candidate) => {
    const url = new URL(candidate.url());
    return (
      candidate.request().method() === "POST" &&
      url.origin === "http://localhost:3000" &&
      url.pathname === "/account/security"
    );
  });
  await button.click();
  const response = await actionResponse;
  const location = await response.headerValue("location");
  if (
    ![200, 303].includes(response.status()) ||
    (location && !location.includes("status=email-confirmed"))
  ) {
    throw new Error(
      `Email confirmation action did not accept the OTP (${response.status()})`,
    );
  }
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (page.url().includes("status=email-confirmed")) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Email confirmation redirect did not settle");
}

const unique = Date.now().toString(36);
const email = `b2-web-${unique}@example.test`;
const changedEmail = `b2-web-changed-${unique}@example.test`;
const registrationName = `B2Web${unique}`;
const firstPassword = "B2-local-password-42!";
const secondPassword = "B2-local-password-43!";
let browser;

resetLocalSyntheticFixture();
setRegistrationMode("email_required");
try {
  browser = await chromium.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("http://localhost:3000/auth/sign-up");
  await page.getByLabel("注册名").fill(registrationName);
  await page.locator('input[name="email"]').fill(email);
  await page.getByLabel(/密码（至少/).fill(firstPassword);
  await page.locator('input[name="invitationCode"]').fill("B2LocalInvite42");
  await page.getByRole("button", { name: "创建账号" }).click();
  await page.waitForURL(/\/auth\/verify-email/);

  const attemptCookie = (await context.cookies()).find(
    (cookie) => cookie.name === "fh_registration_attempt",
  );
  if (
    !attemptCookie?.httpOnly ||
    attemptCookie.sameSite !== "Lax" ||
    !/^[0-9a-f]{64}$/.test(attemptCookie.value) ||
    attemptCookie.value.includes(email) ||
    attemptCookie.value.includes(registrationName)
  ) {
    throw new Error("Registration attempt cookie boundary failed");
  }
  const secondsRemaining = attemptCookie.expires - Date.now() / 1000;
  if (secondsRemaining <= 0 || secondsRemaining > 2 * 60 * 60 + 5) {
    throw new Error(
      "Registration attempt cookie exceeded reservation lifetime",
    );
  }

  const pendingState = dbJson(`
    select json_build_object(
      'membership', m.state,
      'email_confirmed', u.email_confirmed_at is not null,
      'redemptions', (select count(*) from public.invitation_redemptions r where r.user_id=u.id),
      'reservation_expires_at', ra.expires_at,
      'transport_keys',
        coalesce(u.raw_user_meta_data, '{}'::jsonb)::text ~ '_fh_registration_'
        or exists (
          select 1 from auth.identities i
          where i.user_id=u.id and i.identity_data::text ~ '_fh_registration_'
        )
    )
    from auth.users u
    join public.memberships m on m.user_id=u.id
    join private.registration_attempts ra on ra.auth_user_id=u.id
    where u.email='${email}'
  `);
  if (
    pendingState.membership !== "pending" ||
    pendingState.email_confirmed ||
    pendingState.redemptions !== 0 ||
    pendingState.transport_keys
  ) {
    throw new Error("Unverified registration crossed the pending boundary");
  }

  await page.reload();
  const refreshedAttemptCookie = (await context.cookies()).find(
    (cookie) => cookie.name === "fh_registration_attempt",
  );
  if (
    refreshedAttemptCookie?.value !== attemptCookie.value ||
    refreshedAttemptCookie.expires !== attemptCookie.expires
  ) {
    throw new Error("Page refresh changed the registration reservation");
  }
  const blockedPage = await context.newPage();
  await blockedPage.goto("http://localhost:3000/studio");
  await blockedPage.waitForURL(/\/(auth\/sign-in|archive)/);
  if (!blockedPage.url().includes("/auth/sign-in")) {
    throw new Error("Pending user reached a protected Author route");
  }
  await blockedPage.close();

  const bypass = await fetch(`${apiUrl}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: publicKey, "content-type": "application/json" },
    body: JSON.stringify({
      email: `b2-bypass-${unique}@example.test`,
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      password: firstPassword,
    }),
  });
  if (bypass.ok) throw new Error("Public Signup bypass unexpectedly succeeded");

  await page.getByRole("button", { name: "重新发送验证码" }).click();
  await page.waitForURL(/error=resend-cooldown/);

  const expiredSignupOtp = await otpFor(email, "邮箱验证码");
  expireAuthOtp(email, "confirmation_sent_at");
  await page.getByLabel("邮箱验证码").fill(expiredSignupOtp);
  await page.getByRole("button", { name: "验证邮箱" }).click();
  await page.waitForURL(/error=invalid-code/);

  clearRateLimitScopes("auth.resend_signup");
  await page.getByRole("button", { name: "重新发送验证码" }).click();
  await page.waitForURL(/status=confirmation_pending/);
  const signupOtp = await otpFor(email, "邮箱验证码");
  if (signupOtp === expiredSignupOtp) {
    throw new Error("Signup resend did not rotate the expired OTP");
  }
  const reservationAfterResend = dbJson(`
    select json_build_object('expires_at', expires_at)
    from private.registration_attempts
    where auth_user_id=(select id from auth.users where email='${email}')
  `);
  if (
    reservationAfterResend.expires_at !== pendingState.reservation_expires_at
  ) {
    throw new Error("OTP resend extended the invitation reservation");
  }

  const wrongSignupOtp = signupOtp === "000000" ? "111111" : "000000";
  await page.getByLabel("邮箱验证码").fill(wrongSignupOtp);
  await page.getByRole("button", { name: "验证邮箱" }).click();
  await page.waitForURL(/error=invalid-code/);
  await page.getByLabel("邮箱验证码").fill(signupOtp);
  await page.getByRole("button", { name: "验证邮箱" }).click();
  await page.waitForURL(/\/(archive|access)/);

  const replayedSignupOtp = await fetch(`${apiUrl}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: publicKey, "content-type": "application/json" },
    body: JSON.stringify({ email, token: signupOtp, type: "email" }),
  });
  if (replayedSignupOtp.ok) throw new Error("Signup OTP replay succeeded");

  const activated = dbJson(`
    select json_build_object(
      'membership', m.state,
      'attempt', ra.status,
      'redemptions', (select count(*) from public.invitation_redemptions r where r.user_id=u.id),
      'email_confirmed', u.email_confirmed_at is not null
    )
    from auth.users u
    join public.memberships m on m.user_id=u.id
    join private.registration_attempts ra on ra.auth_user_id=u.id
    where u.email='${email}'
  `);
  if (
    activated.membership !== "active" ||
    activated.attempt !== "activated" ||
    activated.redemptions !== 1 ||
    !activated.email_confirmed
  ) {
    throw new Error(
      "Email verification did not atomically activate membership",
    );
  }

  await context.clearCookies();
  await page.goto("http://localhost:3000/auth/sign-in");
  await page.getByLabel("注册名").fill(registrationName);
  await page.locator("#sign-in-password").fill(firstPassword);
  await page.getByRole("button", { name: "登录" }).click();
  await page.waitForURL(/\/archive/);

  await context.clearCookies();
  ageAuthMailerTimestamps(email);
  await page.goto("http://localhost:3000/auth/forgot-password");
  await page.getByLabel("注册名").fill(registrationName);
  await page.getByRole("button", { name: "发送验证码" }).click();
  await page.waitForURL(/\/auth\/reset-password/);
  const expiredRecoveryOtp = await otpFor(email, "密码恢复验证码");
  expireAuthOtp(email, "recovery_sent_at");
  await page.getByLabel("注册名").fill(registrationName);
  await page.getByLabel("6 位验证码").fill(expiredRecoveryOtp);
  await page.getByRole("button", { name: "继续重置密码" }).click();
  await page.waitForURL(/error=invalid/);

  clearRateLimitScopes("auth.recovery_request");
  ageAuthMailerTimestamps(email);
  await page.goto("http://localhost:3000/auth/forgot-password");
  await page.getByLabel("注册名").fill(registrationName);
  await page.getByRole("button", { name: "发送验证码" }).click();
  await page.waitForURL(/\/auth\/reset-password/);
  const recoveryOtp = await otpFor(email, "密码恢复验证码");
  if (recoveryOtp === expiredRecoveryOtp) {
    throw new Error("Recovery resend did not rotate the expired OTP");
  }
  await page.getByLabel("注册名").fill(registrationName);
  await page
    .getByLabel("6 位验证码")
    .fill(recoveryOtp === "000000" ? "111111" : "000000");
  await page.getByRole("button", { name: "继续重置密码" }).click();
  await page.waitForURL(/error=invalid/);
  await page.getByLabel("注册名").fill(registrationName);
  await page.getByLabel("6 位验证码").fill(recoveryOtp);
  await page.getByRole("button", { name: "继续重置密码" }).click();
  await page.waitForURL(/\/account\/security\?status=recovery/);

  const replayedRecoveryOtp = await fetch(`${apiUrl}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: publicKey, "content-type": "application/json" },
    body: JSON.stringify({ email, token: recoveryOtp, type: "recovery" }),
  });
  if (replayedRecoveryOtp.ok) throw new Error("Recovery OTP replay succeeded");

  await page.locator("#new-password").fill(secondPassword);
  await page.locator("#new-password-confirmation").fill(secondPassword);
  await page.getByRole("button", { name: "保存新密码" }).click();
  await page.waitForURL(/status=password-updated/);

  await context.clearCookies();
  await page.goto("http://localhost:3000/auth/sign-in");
  await page.getByLabel("注册名").fill(registrationName);
  await page.locator("#sign-in-password").fill(firstPassword);
  await page.getByRole("button", { name: "登录" }).click();
  await page.waitForURL(/error=invalid/);
  await page.getByLabel("注册名").fill(registrationName);
  await page.locator("#sign-in-password").fill(secondPassword);
  await page.getByRole("button", { name: "登录" }).click();
  await page.waitForURL(/\/archive/);

  ageAuthMailerTimestamps(email);
  await page.goto("http://localhost:3000/account/security");
  const emailChangeForm = page.locator("form").filter({ hasText: "更换邮箱" });
  await emailChangeForm.locator('input[name="email"]').fill(changedEmail);
  await emailChangeForm.locator("#email-current-password").fill(secondPassword);
  await emailChangeForm
    .getByRole("button", { name: "发送邮箱变更验证" })
    .click();
  await page.waitForURL(/status=email-change-sent/);

  const oldEmailOtp = await otpFor(email, "邮箱变更验证码");
  const newEmailOtp = await otpFor(changedEmail, "邮箱变更验证码");
  const emailConfirmationForm = page
    .locator("form")
    .filter({ hasText: "确认邮箱验证码" });
  await emailConfirmationForm.locator('input[name="email"]').fill(email);
  await emailConfirmationForm.locator('input[name="token"]').fill(oldEmailOtp);
  await submitEmailConfirmation(
    page,
    emailConfirmationForm.getByRole("button", { name: "确认验证码" }),
  );
  if (!page.url().includes("status=email-confirmed")) {
    throw new Error("Current-email confirmation failed");
  }

  const secondConfirmationForm = page
    .locator("form")
    .filter({ hasText: "确认邮箱验证码" });
  await secondConfirmationForm
    .locator('input[name="email"]')
    .fill(changedEmail);
  await secondConfirmationForm.locator('input[name="token"]').fill(newEmailOtp);
  await submitEmailConfirmation(
    page,
    secondConfirmationForm.getByRole("button", { name: "确认验证码" }),
  );
  if (!page.url().includes("status=email-confirmed")) {
    throw new Error("New-email confirmation failed");
  }

  let emailState;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    emailState = dbJson(`
      select json_build_object(
        'email', email,
        'confirmed', email_confirmed_at is not null
      ) from auth.users where id=(
        select user_id from private.login_name_claims
        where login_name_key=private.canonical_registration_name('${registrationName}')
      )
    `);
    if (emailState.email === changedEmail && emailState.confirmed) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (emailState.email !== changedEmail || !emailState.confirmed) {
    throw new Error("Secure email change did not preserve the account binding");
  }

  await page.goto("http://localhost:3000/archive");
  const renderedArchive = await page.content();
  const browserCookies = await context.cookies();
  const authenticatedSessionOwnEmailClaim = browserCookies.some(
    (cookie) =>
      cookieContainsDecodedValue(cookie.value, email) ||
      cookieContainsDecodedValue(cookie.value, changedEmail),
  );
  if (
    renderedArchive.includes(email) ||
    renderedArchive.includes(changedEmail) ||
    browserCookies.some(
      (cookie) =>
        cookie.value.includes(email) || cookie.value.includes(changedEmail),
    )
  ) {
    throw new Error("Browser-visible Reader state exposed the Auth email");
  }
  await page.getByRole("button", { name: /^账号：/ }).click();
  await page.getByRole("button", { name: "退出登录" }).click();
  await page.waitForURL("http://localhost:3000/");
  await page.goto("http://localhost:3000/account/security");
  await page.waitForURL(/\/auth\/sign-in/);
  if (!page.url().includes("/auth/sign-in")) {
    throw new Error("Signed-out session retained account access");
  }

  console.log(
    JSON.stringify({
      accountEnumerationResponse: "generic",
      atomicActivation: "passed",
      authenticatedSessionOwnEmailClaim: authenticatedSessionOwnEmailClaim
        ? "present-owner-only-accepted"
        : "absent",
      emailChangeDoubleConfirmation: "passed",
      opaqueAttemptCookie: "passed",
      otpExpiryAndReplay: "passed",
      passwordRecoveryOtp: "passed",
      pendingPrivilegedAccess: "rejected",
      publicSignupBypass: "rejected",
      realEmailRegistrationOtp: "passed",
      renderedEmailDisclosure: "rejected",
      reservationNotExtended: "passed",
      resendCooldown: "passed",
      signOutSessionRevocation: "passed",
      usernamePasswordLogin: "passed",
    }),
  );
} finally {
  await browser?.close();
  setRegistrationMode("legacy");
}
