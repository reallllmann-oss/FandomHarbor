import { execFileSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const runtime = JSON.parse(
  execFileSync("pnpm", ["exec", "supabase", "status", "-o", "json"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }),
);
const apiUrl = runtime.API_URL;
const publicKey = runtime.PUBLISHABLE_KEY ?? runtime.ANON_KEY;
const secretKey = runtime.SECRET_KEY ?? runtime.SERVICE_ROLE_KEY;
const password = "B1-admin-security-password-42!";
const publicHeaders = { apikey: publicKey, "content-type": "application/json" };
const adminHeaders = {
  apikey: secretKey,
  authorization: `Bearer ${secretKey}`,
  "content-type": "application/json",
};

async function request(path, options) {
  const response = await fetch(`${apiUrl}${path}`, options);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { body, response };
}

function sql(command, json = false) {
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
      ...(json ? ["-Atq"] : ["-q"]),
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      command,
    ],
    { encoding: "utf8", stdio: ["ignore", json ? "pipe" : "ignore", "pipe"] },
  );
  return json ? JSON.parse(output.trim()) : undefined;
}

async function prepare(codeCharacter, registrationName, email, existing) {
  const result = await request("/rest/v1/rpc/prepare_email_registration", {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      p_registration_name: registrationName,
      p_email: email,
      p_code_hash: codeCharacter.repeat(64),
      p_existing_attempt_id: existing?.attempt_id ?? null,
      p_existing_proof: existing?.attempt_proof ?? null,
    }),
  });
  const attempt = result.body?.[0];
  if (!result.response.ok || !attempt?.expected_auth_user_id) {
    throw new Error("Trusted prepare failed");
  }
  return attempt;
}

async function createUser(attempt, email) {
  return request("/auth/v1/admin/users", {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      id: attempt.expected_auth_user_id,
      email,
      password,
      email_confirm: false,
      user_metadata: {},
    }),
  });
}

function assertResponseClean(value, proof) {
  const serialized = JSON.stringify(value ?? null);
  if (
    serialized.includes("_fh_registration_attempt") ||
    serialized.includes("_fh_registration_proof") ||
    serialized.includes(proof)
  ) {
    throw new Error("Auth response exposed a registration credential");
  }
}

function attemptState(attempt) {
  return sql(
    `select json_build_object(
      'status', status,
      'auth_user_id', auth_user_id,
      'expected_auth_user_id', expected_auth_user_id,
      'proof_consumed', proof_consumed_at is not null,
      'auth_user_count', (
        select count(*) from auth.users where id = expected_auth_user_id
      ),
      'membership_count', (
        select count(*) from public.memberships where user_id = expected_auth_user_id
      ),
      'transport_rows', (
        select count(*) from auth.users u
        where u.id = expected_auth_user_id
          and coalesce(u.raw_user_meta_data, '{}'::jsonb)::text ~
            '_fh_registration_(attempt|proof)'
      ) + (
        select count(*) from auth.identities i
        where i.user_id = expected_auth_user_id
          and coalesce(i.identity_data, '{}'::jsonb)::text ~
            '_fh_registration_(attempt|proof)'
      )
    ) from private.registration_attempts where id = '${attempt.attempt_id}'::uuid;`,
    true,
  );
}

async function release(attempt, reason) {
  const result = await request("/rest/v1/rpc/release_email_registration", {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      p_attempt_id: attempt.attempt_id,
      p_attempt_proof: attempt.attempt_proof,
      p_reason: reason,
    }),
  });
  if (!result.response.ok) throw new Error("Attempt release failed");
}

const unique = Date.now().toString(36);

const afterFailure = await prepare(
  "e",
  `B1AfterFail${unique}`,
  `b1-after-fail-${unique}@example.test`,
);
sql(`
  create or replace function private.b1_r3_fail_pending_membership()
  returns trigger language plpgsql set search_path = '' as $fn$
  begin
    if new.user_id = '${afterFailure.expected_auth_user_id}'::uuid then
      raise exception 'B1 R3 forced AFTER INSERT failure';
    end if;
    return new;
  end;
  $fn$;
  create trigger b1_r3_fail_pending_membership
  before insert on public.memberships
  for each row execute function private.b1_r3_fail_pending_membership();
`);
let failedAfter;
try {
  failedAfter = await createUser(
    afterFailure,
    `b1-after-fail-${unique}@example.test`,
  );
} finally {
  sql(`
    drop trigger if exists b1_r3_fail_pending_membership on public.memberships;
    drop function if exists private.b1_r3_fail_pending_membership();
  `);
}
if (failedAfter.response.ok) {
  throw new Error("Forced AFTER INSERT failure unexpectedly committed");
}
const afterFailureState = attemptState(afterFailure);
if (
  afterFailureState.status !== "prepared" ||
  afterFailureState.auth_user_id !== null ||
  afterFailureState.proof_consumed !== false ||
  afterFailureState.auth_user_count !== 0 ||
  afterFailureState.membership_count !== 0
) {
  throw new Error("AFTER INSERT failure did not roll back the claim");
}
await release(afterFailure, "r3_after_insert_failure_complete");

const insertFailureEmail = `b1-insert-fail-${unique}@example.test`;
const insertFailure = await prepare(
  "f",
  `B1InsertFail${unique}`,
  insertFailureEmail,
);
sql(`
  create or replace function private.b1_r3_fail_auth_insert()
  returns trigger language plpgsql set search_path = '' as $fn$
  begin
    if new.id = '${insertFailure.expected_auth_user_id}'::uuid then
      raise exception 'B1 R3 forced auth insert failure';
    end if;
    return new;
  end;
  $fn$;
  create trigger z_b1_r3_fail_auth_insert
  before insert on auth.users
  for each row execute function private.b1_r3_fail_auth_insert();
`);
let failedInsert;
try {
  failedInsert = await createUser(insertFailure, insertFailureEmail);
} finally {
  sql(`
    drop trigger if exists z_b1_r3_fail_auth_insert on auth.users;
    drop function if exists private.b1_r3_fail_auth_insert();
  `);
}
if (failedInsert.response.ok) {
  throw new Error("Forced auth insert failure unexpectedly committed");
}
const insertFailureState = attemptState(insertFailure);
if (
  insertFailureState.status !== "prepared" ||
  insertFailureState.auth_user_id !== null ||
  insertFailureState.proof_consumed !== false ||
  insertFailureState.auth_user_count !== 0
) {
  throw new Error("Auth insert failure left a claim");
}
await release(insertFailure, "r3_auth_insert_failure_complete");

const mismatchEmail = `b1-mismatch-${unique}@example.test`;
const mismatch = await prepare("a", `B1Mismatch${unique}`, mismatchEmail);
const mismatchedCreate = await createUser(mismatch, `wrong-${mismatchEmail}`);
if (
  mismatchedCreate.response.ok ||
  attemptState(mismatch).status !== "prepared"
) {
  throw new Error("Mismatched email was not rejected atomically");
}
await release(mismatch, "r3_email_mismatch_complete");

const concurrentEmail = `b1-concurrent-${unique}@example.test`;
const concurrent = await prepare("b", `B1Concurrent${unique}`, concurrentEmail);
const concurrentResults = await Promise.all([
  createUser(concurrent, concurrentEmail),
  createUser(concurrent, concurrentEmail),
]);
for (const result of concurrentResults) {
  assertResponseClean(result.body, concurrent.attempt_proof);
}
const concurrentState = attemptState(concurrent);
if (
  concurrentResults.filter((result) => result.response.ok).length !== 1 ||
  concurrentState.status !== "auth_created" ||
  concurrentState.auth_user_count !== 1 ||
  concurrentState.membership_count !== 1 ||
  concurrentState.transport_rows !== 0
) {
  throw new Error("Concurrent Admin Create did not produce one identity");
}

const bypassEmail = `b1-bypass-${unique}@example.test`;
const bypass = await prepare("c", `B1Bypass${unique}`, bypassEmail);
const retriedPrepare = await prepare(
  "c",
  `B1Bypass${unique}`,
  bypassEmail,
  bypass,
);
if (
  retriedPrepare.attempt_id !== bypass.attempt_id ||
  retriedPrepare.expected_auth_user_id !== bypass.expected_auth_user_id ||
  retriedPrepare.reservation_expires_at !== bypass.reservation_expires_at
) {
  throw new Error("Prepare retry changed the reservation or expected UID");
}
const bypassResult = await request("/auth/v1/signup", {
  method: "POST",
  headers: publicHeaders,
  body: JSON.stringify({
    email: bypassEmail,
    password,
    data: {
      _fh_registration_attempt: bypass.attempt_id,
      _fh_registration_proof: bypass.attempt_proof,
    },
  }),
});
if (bypassResult.response.ok || attemptState(bypass).status !== "prepared") {
  throw new Error("Public Signup bypass was not rejected before claim");
}
await release(bypass, "r3_public_bypass_complete");

console.log(
  JSON.stringify({
    afterInsertRollback: "passed",
    authInsertRollback: "passed",
    emailBinding: "passed",
    concurrentAdminCreate: "passed",
    publicSignupWithLegacyProofRejected: "passed",
    retryKeptUidAndReservation: "passed",
  }),
);
