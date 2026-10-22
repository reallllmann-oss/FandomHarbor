import { execFileSync } from "node:child_process";

const projectRoot = new URL("..", import.meta.url).pathname;
const runtime = JSON.parse(
  execFileSync("pnpm", ["exec", "supabase", "status", "-o", "json"], {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }),
);

const apiUrl = runtime.API_URL;
const publicKey = runtime.PUBLISHABLE_KEY ?? runtime.ANON_KEY;
if (!apiUrl || !publicKey)
  throw new Error("Local Supabase runtime is incomplete");

const headers = { apikey: publicKey, "content-type": "application/json" };
async function request(path, options) {
  const response = await fetch(`${apiUrl}${path}`, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok)
    throw new Error(`Unexpected ${response.status} for ${path}`);
  return body;
}

function dbJson(sql) {
  const output = execFileSync(
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
  ).trim();
  return JSON.parse(output);
}

const unique = Date.now().toString(36);
const registrationName = `B1Legacy${unique}`;
const email = `${registrationName.toLowerCase()}@accounts.fandom-harbor.invalid`;
const password = "B1-legacy-local-password-42!";

const signup = await request("/auth/v1/signup", {
  method: "POST",
  headers,
  body: JSON.stringify({
    email,
    password,
    data: {
      invitation_code_hash: "e".repeat(64),
      registration_name: registrationName,
    },
  }),
});
if (!signup.user?.id || !signup.access_token) {
  throw new Error("Legacy signup did not return its established session shape");
}

const state = dbJson(`
  select json_build_object(
    'mode', (select mode from private.registration_settings where singleton),
    'membership_state', (
      select state from public.memberships where user_id = '${signup.user.id}'::uuid
    ),
    'redemptions', (
      select count(*) from public.invitation_redemptions
      where user_id = '${signup.user.id}'::uuid
    ),
    'b1_attempts', (
      select count(*) from private.registration_attempts
      where auth_user_id = '${signup.user.id}'::uuid
    )
  );
`);
if (
  state.mode !== "legacy" ||
  state.membership_state !== "active" ||
  state.redemptions !== 1 ||
  state.b1_attempts !== 0
) {
  throw new Error("Legacy registration behavior changed");
}

const session = await request("/auth/v1/token?grant_type=password", {
  method: "POST",
  headers,
  body: JSON.stringify({ email, password }),
});
if (session.user?.id !== signup.user.id || !session.access_token) {
  throw new Error("Legacy password login changed");
}

console.log(
  JSON.stringify({
    legacySignup: "passed",
    legacyPasswordLogin: "passed",
    b1AttemptIsolation: "passed",
  }),
);
