import { execFileSync } from "node:child_process";

import { chromium } from "@playwright/test";

const account = JSON.parse(
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
      `select json_build_object(
        'email', u.email,
        'registration_name', p.registration_name
      )
      from auth.users u
      join public.profiles p on p.user_id=u.id
      where u.email like '%@accounts.fandom-harbor.invalid'
        and p.registration_name like 'B1Legacy%'
      order by u.created_at desc
      limit 1`,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).trim(),
);

if (!account.email || !account.registration_name) {
  throw new Error("Local legacy compatibility fixture is absent");
}

const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("http://localhost:3000/auth/sign-in");
  await page.getByLabel("注册名").fill(account.registration_name);
  await page.locator("#sign-in-password").fill("B1-legacy-local-password-42!");
  await page.getByRole("button", { name: "登录" }).click();
  await page.waitForURL(/\/archive/);
  if ((await page.content()).includes(account.email)) {
    throw new Error("Legacy internal email reached the browser UI");
  }
  console.log(
    JSON.stringify({
      legacyUsernamePasswordLogin: "passed",
      renderedInternalEmailDisclosure: "rejected",
    }),
  );
} finally {
  await browser.close();
}
