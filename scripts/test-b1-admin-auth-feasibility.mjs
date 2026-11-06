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
const mailpitUrl = runtime.MAILPIT_URL;
const publicKey = runtime.PUBLISHABLE_KEY ?? runtime.ANON_KEY;
const secretKey = runtime.SECRET_KEY ?? runtime.SERVICE_ROLE_KEY;
if (!apiUrl || !mailpitUrl || !publicKey || !secretKey) {
  throw new Error("Local Supabase runtime is incomplete");
}

const publicHeaders = { apikey: publicKey, "content-type": "application/json" };
const adminHeaders = {
  apikey: secretKey,
  authorization: `Bearer ${secretKey}`,
  "content-type": "application/json",
};

async function request(path, options, expectedOk = true) {
  const response = await fetch(`${apiUrl}${path}`, options);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (response.ok !== expectedOk) {
    throw new Error(`Unexpected ${response.status} for ${path}`);
  }
  return { body, response };
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

function assertNoCredential(value, proof, label) {
  const serialized = JSON.stringify(value ?? null);
  if (
    serialized.includes("_fh_registration_attempt") ||
    serialized.includes("_fh_registration_proof") ||
    serialized.includes(proof)
  ) {
    throw new Error(`${label} exposed a registration credential`);
  }
}

async function recipientMessageCount(email) {
  const response = await fetch(`${mailpitUrl}/api/v1/messages`);
  const body = await response.json();
  return (body.messages ?? []).filter((message) =>
    message.To?.some((recipient) => recipient.Address === email),
  ).length;
}

async function confirmationLink(email) {
  for (let index = 0; index < 30; index += 1) {
    const listResponse = await fetch(`${mailpitUrl}/api/v1/messages`);
    const list = await listResponse.json();
    const message = list.messages?.find((candidate) =>
      candidate.To?.some((recipient) => recipient.Address === email),
    );
    if (message?.ID) {
      const detailResponse = await fetch(
        `${mailpitUrl}/api/v1/message/${message.ID}`,
      );
      const detail = await detailResponse.json();
      const content = `${detail.Text ?? ""}\n${detail.HTML ?? ""}`.replaceAll(
        "&amp;",
        "&",
      );
      const link = content.match(
        /https?:\/\/[^\s"'<>]+\/auth\/v1\/verify\?[^\s"'<>]+/,
      )?.[0];
      if (link) return link;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Local confirmation mail was not captured");
}

const unique = Date.now().toString(36);
const email = `b1-admin-${unique}@example.test`;
const registrationName = `B1Admin${unique}`;
const password = "B1-admin-local-password-42!";

const { body: preparedRows } = await request(
  "/rest/v1/rpc/prepare_email_registration",
  {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      p_registration_name: registrationName,
      p_email: email,
      p_code_hash: "d".repeat(64),
      p_existing_attempt_id: null,
      p_existing_proof: null,
    }),
  },
);
const prepared = preparedRows?.[0];
if (
  !prepared?.attempt_id ||
  !prepared?.expected_auth_user_id ||
  !/^[0-9a-f]{64}$/.test(prepared.attempt_proof)
) {
  throw new Error("Prepare did not return a trusted Auth binding");
}

const mailBeforeCreate = await recipientMessageCount(email);
const { body: createdUser } = await request("/auth/v1/admin/users", {
  method: "POST",
  headers: adminHeaders,
  body: JSON.stringify({
    id: prepared.expected_auth_user_id,
    email,
    password,
    email_confirm: false,
    user_metadata: {},
  }),
});

if (
  createdUser.id !== prepared.expected_auth_user_id ||
  createdUser.email_confirmed_at ||
  createdUser.confirmed_at
) {
  throw new Error(
    "Admin Create User did not preserve the prepared unverified UID",
  );
}
assertNoCredential(createdUser, prepared.attempt_proof, "Admin Create User");

const { body: adminReadUser } = await request(
  `/auth/v1/admin/users/${prepared.expected_auth_user_id}`,
  { headers: adminHeaders },
);
assertNoCredential(adminReadUser, prepared.attempt_proof, "Admin Auth read");

const { body: adminUpdatedUser } = await request(
  `/auth/v1/admin/users/${prepared.expected_auth_user_id}`,
  {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify({ user_metadata: { locale: "zh-CN" } }),
  },
);
if (adminUpdatedUser.user_metadata?.locale !== "zh-CN") {
  throw new Error("Ordinary user metadata update was not preserved");
}
assertNoCredential(
  adminUpdatedUser,
  prepared.attempt_proof,
  "Admin Auth metadata update",
);

const mailAfterCreate = await recipientMessageCount(email);
if (mailAfterCreate !== mailBeforeCreate) {
  throw new Error("Admin Create User unexpectedly sent confirmation mail");
}

const stateAfterCreate = dbJson(`
  select json_build_object(
    'attempt_status', (
      select status from private.registration_attempts
      where id = '${prepared.attempt_id}'::uuid
    ),
    'bound_uid', (
      select auth_user_id = expected_auth_user_id
      from private.registration_attempts
      where id = '${prepared.attempt_id}'::uuid
    ),
    'membership_state', (
      select state from public.memberships
      where user_id = '${prepared.expected_auth_user_id}'::uuid
    ),
    'redemptions', (
      select count(*) from public.invitation_redemptions
      where user_id = '${prepared.expected_auth_user_id}'::uuid
    ),
    'use_count', (
      select use_count from public.invitations
      where id = 'b1400000-0000-4000-8000-000000000001'::uuid
    ),
    'user_transport_keys', (
      select count(*) from auth.users
      where id = '${prepared.expected_auth_user_id}'::uuid
        and coalesce(raw_user_meta_data, '{}'::jsonb)::text ~
          '_fh_registration_(attempt|proof)'
    ),
    'identity_transport_keys', (
      select count(*) from auth.identities
      where user_id = '${prepared.expected_auth_user_id}'::uuid
        and coalesce(identity_data, '{}'::jsonb)::text ~
          '_fh_registration_(attempt|proof)'
    )
  );
`);

if (
  stateAfterCreate.attempt_status !== "auth_created" ||
  stateAfterCreate.bound_uid !== true ||
  stateAfterCreate.membership_state !== "pending" ||
  stateAfterCreate.redemptions !== 0 ||
  stateAfterCreate.use_count !== 0 ||
  stateAfterCreate.user_transport_keys !== 0 ||
  stateAfterCreate.identity_transport_keys !== 0
) {
  throw new Error(
    "Admin-created identity did not satisfy the pending boundary",
  );
}

await request(
  "/auth/v1/signup",
  {
    method: "POST",
    headers: publicHeaders,
    body: JSON.stringify({
      email: `b1-public-${unique}@example.test`,
      password,
    }),
  },
  false,
);

const generateLinkResponse = await fetch(
  `${apiUrl}/auth/v1/admin/generate_link`,
  {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ type: "signup", email, password }),
  },
);
const generateLinkBody = await generateLinkResponse.text();
assertNoCredential(generateLinkBody, prepared.attempt_proof, "Generate Link");

// Generate Link updates the confirmation-send timestamp even though it does
// not deliver mail. Respect the configured local one-second resend interval.
await new Promise((resolve) => setTimeout(resolve, 1_100));

await request("/auth/v1/resend", {
  method: "POST",
  headers: publicHeaders,
  body: JSON.stringify({ type: "signup", email }),
});

const link = await confirmationLink(email);
const verifyResponse = await fetch(link, { redirect: "manual" });
if (![200, 302, 303].includes(verifyResponse.status)) {
  throw new Error("Native local email confirmation failed");
}

const finalState = dbJson(`
  select json_build_object(
    'email_confirmed', (
      select email_confirmed_at is not null from auth.users
      where id = '${prepared.expected_auth_user_id}'::uuid
    ),
    'attempt_status', (
      select status from private.registration_attempts
      where id = '${prepared.attempt_id}'::uuid
    ),
    'membership_state', (
      select state from public.memberships
      where user_id = '${prepared.expected_auth_user_id}'::uuid
    ),
    'redemptions', (
      select count(*) from public.invitation_redemptions
      where user_id = '${prepared.expected_auth_user_id}'::uuid
    ),
    'use_count', (
      select use_count from public.invitations
      where id = 'b1400000-0000-4000-8000-000000000001'::uuid
    )
  );
`);

if (
  finalState.email_confirmed !== true ||
  finalState.attempt_status !== "activated" ||
  finalState.membership_state !== "active" ||
  finalState.redemptions !== 1 ||
  finalState.use_count !== 1
) {
  throw new Error("Native confirmation did not atomically activate membership");
}

const { body: session } = await request("/auth/v1/token?grant_type=password", {
  method: "POST",
  headers: publicHeaders,
  body: JSON.stringify({ email, password }),
});
assertNoCredential(session, prepared.attempt_proof, "Password session");

const { body: currentUser } = await request("/auth/v1/user", {
  headers: {
    apikey: publicKey,
    authorization: `Bearer ${session.access_token}`,
  },
});
assertNoCredential(currentUser, prepared.attempt_proof, "getUser");

const jwtPayload = JSON.parse(
  Buffer.from(session.access_token.split(".")[1], "base64url").toString("utf8"),
);
assertNoCredential(jwtPayload, prepared.attempt_proof, "JWT");

console.log(
  JSON.stringify({
    adminCreateCustomUid: "passed",
    adminCreateSentMail: false,
    generateLinkExistingUserStatus: generateLinkResponse.status,
    publicSignupRejected: "passed",
    metadataAndIdentityClean: "passed",
    adminAuthReadAndMetadataUpdateClean: "passed",
    resendConfirmation: "passed",
    nativeConfirmationAndActivation: "passed",
    sessionAndJwtClean: "passed",
  }),
);
