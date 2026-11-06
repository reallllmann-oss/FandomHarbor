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
const email = `b1-expired-${unique}@example.test`;
const password = "B1-expired-local-password-42!";

const { body: preparedRows } = await request(
  "/rest/v1/rpc/prepare_email_registration",
  {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      p_registration_name: `B1Expired${unique}`,
      p_email: email,
      p_code_hash: "7".repeat(64),
      p_existing_attempt_id: null,
      p_existing_proof: null,
    }),
  },
);
const prepared = preparedRows?.[0];
if (!prepared?.attempt_id || !prepared.expected_auth_user_id) {
  throw new Error("Expired-path prepare failed");
}

await request("/auth/v1/admin/users", {
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

dbJson(`
  with shifted as (
    update private.registration_attempts
    set created_at = statement_timestamp() - interval '3 hours',
        proof_expires_at = statement_timestamp() - interval '2 hours 45 minutes',
        expires_at = statement_timestamp() - interval '1 hour',
        updated_at = statement_timestamp()
    where id = '${prepared.attempt_id}'::uuid
    returning id
  ), reservation as (
    update private.invitation_reservations
    set created_at = statement_timestamp() - interval '3 hours',
        expires_at = statement_timestamp() - interval '1 hour',
        updated_at = statement_timestamp()
    where attempt_id = '${prepared.attempt_id}'::uuid
    returning id
  )
  select json_build_object(
    'attempts', (select count(*) from shifted),
    'reservations', (select count(*) from reservation)
  );
`);

await request("/auth/v1/resend", {
  method: "POST",
  headers: publicHeaders,
  body: JSON.stringify({ type: "signup", email }),
});
const link = await confirmationLink(email);
const verifyResponse = await fetch(link, { redirect: "manual" });
if (![200, 302, 303].includes(verifyResponse.status)) {
  throw new Error("Expired-path native confirmation failed");
}

const expiredState = dbJson(`
  select json_build_object(
    'email_confirmed', u.email_confirmed_at is not null,
    'attempt_status', ra.status,
    'reservation_status', ir.status,
    'membership_state', m.state,
    'redemptions', (
      select count(*) from public.invitation_redemptions r
      where r.user_id = u.id
    ),
    'expired_invitation_use_count', (
      select use_count from public.invitations
      where id = 'b1400000-0000-4000-8000-000000000007'::uuid
    )
  )
  from auth.users u
  join private.registration_attempts ra on ra.auth_user_id = u.id
  join private.invitation_reservations ir on ir.attempt_id = ra.id
  join public.memberships m on m.user_id = u.id
  where u.id = '${prepared.expected_auth_user_id}'::uuid;
`);
if (
  expiredState.email_confirmed !== true ||
  expiredState.attempt_status !== "verified_pending" ||
  expiredState.reservation_status !== "expired" ||
  expiredState.membership_state !== "pending" ||
  expiredState.redemptions !== 0 ||
  expiredState.expired_invitation_use_count !== 0
) {
  throw new Error(
    "Expired confirmation crossed the pending membership boundary",
  );
}

const { body: session } = await request("/auth/v1/token?grant_type=password", {
  method: "POST",
  headers: publicHeaders,
  body: JSON.stringify({ email, password }),
});
await request("/rest/v1/rpc/redeem_invitation", {
  method: "POST",
  headers: {
    apikey: publicKey,
    authorization: `Bearer ${session.access_token}`,
    "content-type": "application/json",
  },
  body: JSON.stringify({ p_code_hash: "8".repeat(64) }),
});

const recoveryState = dbJson(`
  select json_build_object(
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
    'original_use_count', (
      select use_count from public.invitations
      where id = 'b1400000-0000-4000-8000-000000000007'::uuid
    ),
    'replacement_use_count', (
      select use_count from public.invitations
      where id = 'b1400000-0000-4000-8000-000000000008'::uuid
    )
  );
`);
if (
  recoveryState.attempt_status !== "activated" ||
  recoveryState.membership_state !== "active" ||
  recoveryState.redemptions !== 1 ||
  recoveryState.original_use_count !== 0 ||
  recoveryState.replacement_use_count !== 1
) {
  throw new Error("Verified-pending replacement invitation recovery failed");
}

console.log(
  JSON.stringify({
    nativeConfirmationAfterReservationExpiry: "passed",
    expiredReservationStayedPending: "passed",
    replacementInvitationRecovery: "passed",
  }),
);
