import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  readingFixtureChapters,
  readingFixtureWorkIds,
  readingFixtureWorks,
} from "./qa-fixture-library.mjs";
import invitationCodeContract from "../packages/services/src/invitation-code-contract.json" with { type: "json" };

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const credentialPath = resolve(projectRoot, ".local/qa-fixture.json");
const authorUserId = "70000000-0000-4000-8000-000000000001";
const invitationId = "40000000-0000-4000-8000-000000000001";
const authorSlug = "harbor-qa-author";
const localDatabaseContainer = "supabase_db_FandomHarbor";

const identities = {
  author: { registrationName: "Harbor QA Author" },
  reader: { registrationName: "Harbor QA Reader" },
};

function runSupabase(args) {
  try {
    return execFileSync("supabase", args, {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const detail = [error.stderr, error.stdout]
      .map((value) => value?.toString().trim())
      .filter(Boolean)
      .join("\n");
    throw new Error(detail || "Local Supabase command failed");
  }
}

function localStatus() {
  const status = JSON.parse(runSupabase(["status", "-o", "json"]));
  const url = new URL(status.API_URL);
  if (!["127.0.0.1", "localhost", "::1"].includes(url.hostname)) {
    throw new Error("QA fixture refused: Supabase API is not local");
  }
  if (!status.SERVICE_ROLE_KEY || !status.PUBLISHABLE_KEY) {
    throw new Error("QA fixture refused: local Supabase keys are unavailable");
  }
  return status;
}

function generatedPassword() {
  return `Qa1!${randomBytes(18).toString("base64url")}`;
}

function generatedInvitationCode() {
  return Array.from(
    randomBytes(invitationCodeContract.length),
    (value) =>
      invitationCodeContract.alphabet[
        value % invitationCodeContract.alphabet.length
      ],
  ).join("");
}

function isStandardInvitationCode(value) {
  return new RegExp(invitationCodeContract.pattern).test(value);
}

async function loadCredentials() {
  let storedCredentials;
  try {
    const stored = JSON.parse(await readFile(credentialPath, "utf8"));
    if (
      typeof stored.author?.password === "string" &&
      typeof stored.reader?.password === "string" &&
      typeof stored.invitationCode === "string"
    ) {
      if (isStandardInvitationCode(stored.invitationCode)) return stored;
      storedCredentials = stored;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const credentials = storedCredentials
    ? {
        ...storedCredentials,
        generatedAt: new Date().toISOString(),
        environment: "local-only",
        invitationCode: generatedInvitationCode(),
      }
    : {
        generatedAt: new Date().toISOString(),
        environment: "local-only",
        author: {
          registrationName: identities.author.registrationName,
          password: generatedPassword(),
          slug: authorSlug,
        },
        reader: {
          registrationName: identities.reader.registrationName,
          password: generatedPassword(),
        },
        invitationCode: generatedInvitationCode(),
      };

  await mkdir(dirname(credentialPath), { recursive: true });
  await writeFile(credentialPath, `${JSON.stringify(credentials, null, 2)}\n`, {
    mode: 0o600,
  });
  await chmod(credentialPath, 0o600);
  return credentials;
}

function registrationEmail(registrationName) {
  const normalized = registrationName.normalize("NFKC").trim().toLowerCase();
  const localPart = createHash("sha256").update(normalized).digest("hex");
  return `${localPart}@accounts.fandom-harbor.invalid`;
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function uuidList(values) {
  return values.map((value) => `${sqlLiteral(value)}::uuid`).join(", ");
}

function readingFixtureCleanupSql() {
  const workIds = uuidList(readingFixtureWorkIds);
  return `
    begin;
    delete from public.work_tags where work_id in (${workIds});
    delete from public.chapters where work_id in (${workIds});
    delete from public.works where id in (${workIds});
    commit;
  `;
}

function readingFixtureSql() {
  const workValues = readingFixtureWorks
    .map(
      (work) => `(
        ${sqlLiteral(work.id)}::uuid,
        ${sqlLiteral(authorUserId)}::uuid,
        ${sqlLiteral(work.categoryId)}::uuid,
        ${sqlLiteral(work.title)},
        ${sqlLiteral(work.slug)},
        ${sqlLiteral(work.summary)},
        ${sqlLiteral(work.status)},
        ${work.publishedAt ? `${sqlLiteral(work.publishedAt)}::timestamptz` : "null"},
        ${sqlLiteral(work.createdAt)}::timestamptz,
        ${sqlLiteral(work.updatedAt)}::timestamptz
      )`,
    )
    .join(",\n");
  const chapterValues = readingFixtureChapters
    .map(
      (chapter) => `(
        ${sqlLiteral(chapter.id)}::uuid,
        ${sqlLiteral(chapter.workId)}::uuid,
        ${chapter.position},
        ${sqlLiteral(chapter.title)},
        ${sqlLiteral(chapter.slug)},
        ${sqlLiteral(chapter.status)},
        ${sqlLiteral(JSON.stringify(chapter.content))}::jsonb,
        1,
        ${chapter.publishedAt ? `${sqlLiteral(chapter.publishedAt)}::timestamptz` : "null"},
        ${sqlLiteral(chapter.createdAt)}::timestamptz,
        ${sqlLiteral(chapter.updatedAt)}::timestamptz
      )`,
    )
    .join(",\n");

  return `
    ${readingFixtureCleanupSql()}
    begin;
    insert into public.works (
      id, owner_user_id, category_id, title, slug, summary, status,
      published_at, created_at, updated_at
    ) values
    ${workValues};

    insert into public.chapters (
      id, work_id, position, title, slug, status, content,
      content_schema_version, published_at, created_at, updated_at
    ) values
    ${chapterValues};

    do $$
    begin
      if (
        select count(*) from public.works
        where id in (${uuidList(readingFixtureWorkIds)})
      ) <> ${readingFixtureWorks.length} then
        raise exception 'Reading QA works were not created completely';
      end if;

      if (
        select count(*) from public.chapters
        where work_id = '71000000-0000-4000-8000-000000000002'::uuid
          and status = 'published'
      ) <> 3 then
        raise exception 'Long-form QA published chapter set is incomplete';
      end if;

      if (
        select length(content::text) from public.chapters
        where id = '72000000-0000-4000-8000-000000000002'::uuid
      ) < 10000 then
        raise exception 'Long-form QA chapter is too short';
      end if;
    end;
    $$;
    commit;
  `;
}

function runLocalSql(sql) {
  const databaseContainer = execFileSync(
    "docker",
    [
      "ps",
      "--filter",
      `name=^/${localDatabaseContainer}$`,
      "--format",
      "{{.Names}}",
    ],
    { cwd: projectRoot, encoding: "utf8" },
  )
    .split("\n")
    .map((name) => name.trim())
    .find((name) => name === localDatabaseContainer);
  if (!databaseContainer) {
    throw new Error(
      "QA fixture refused: local Supabase database is unavailable",
    );
  }
  try {
    execFileSync(
      "docker",
      [
        "exec",
        "-i",
        databaseContainer,
        "psql",
        "-v",
        "ON_ERROR_STOP=1",
        "-U",
        "postgres",
        "-d",
        "postgres",
      ],
      { cwd: projectRoot, input: sql, stdio: ["pipe", "pipe", "pipe"] },
    );
  } catch (error) {
    const detail = [error.stderr, error.stdout]
      .map((value) => value?.toString().trim())
      .filter(Boolean)
      .join("\n");
    throw new Error(detail || "Local QA fixture SQL failed");
  }
}

async function apiRequest(status, path, options = {}) {
  const response = await fetch(`${status.API_URL}${path}`, {
    ...options,
    headers: {
      apikey: status.SERVICE_ROLE_KEY,
      authorization: `Bearer ${status.SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
      ...options.headers,
    },
  });
  const bodyText = await response.text();
  let body = null;
  if (bodyText) {
    try {
      body = JSON.parse(bodyText);
    } catch {
      body = bodyText;
    }
  }
  if (!response.ok) {
    const message =
      typeof body === "object" && body?.message
        ? body.message
        : `HTTP ${response.status}`;
    throw new Error(`Local Auth request failed: ${message}`);
  }
  return body;
}

async function listUsers(status) {
  const body = await apiRequest(
    status,
    "/auth/v1/admin/users?page=1&per_page=1000",
  );
  return Array.isArray(body?.users) ? body.users : [];
}

async function updateUser(status, userId, attributes) {
  return apiRequest(status, `/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(attributes),
  });
}

async function createReader(status, email, credentials, invitationHash) {
  const existing = (await listUsers(status)).find(
    (user) => user.email === email,
  );
  if (existing) {
    await updateUser(status, existing.id, {
      password: credentials.reader.password,
      email_confirm: true,
      user_metadata: {
        invitation_code_hash: invitationHash,
        registration_name: credentials.reader.registrationName,
      },
    });
    return existing;
  }
  return apiRequest(status, "/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: credentials.reader.password,
      email_confirm: true,
      user_metadata: {
        invitation_code_hash: invitationHash,
        registration_name: credentials.reader.registrationName,
      },
    }),
  });
}

async function signIn(status, registrationName, password) {
  const response = await fetch(
    `${status.API_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: status.PUBLISHABLE_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: registrationEmail(registrationName),
        password,
      }),
    },
  );
  const body = await response.json();
  if (!response.ok || !body.access_token) {
    throw new Error(`Local login validation failed for ${registrationName}`);
  }
  return body.access_token;
}

async function authenticatedRpc(status, accessToken, name, input) {
  const response = await fetch(`${status.REST_URL}/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: status.PUBLISHABLE_KEY,
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`Local permission validation failed for ${name}`);
  }
  return response.json();
}

async function main() {
  const status = localStatus();
  if (process.argv.includes("--clean-reading")) {
    runLocalSql(readingFixtureCleanupSql());
    console.log("Local Reading QA fixture content removed.");
    console.log("QA Reader and Author identities were preserved.");
    return;
  }
  const credentials = await loadCredentials();
  const invitationHash = createHash("sha256")
    .update(credentials.invitationCode.trim())
    .digest("hex");
  const authorEmail = registrationEmail(credentials.author.registrationName);
  const readerEmail = registrationEmail(credentials.reader.registrationName);

  runLocalSql(`
    begin;
    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      phone, phone_change, phone_change_token, email_change_token_current,
      reauthentication_token, created_at, updated_at
    ) values (
      ${sqlLiteral(authorUserId)}::uuid,
      '00000000-0000-0000-0000-000000000000'::uuid,
      'authenticated',
      'authenticated',
      ${sqlLiteral(authorEmail)},
      '',
      statement_timestamp(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('registration_name', ${sqlLiteral(credentials.author.registrationName)}),
      '', '', '', '', '', '', '', '', '',
      statement_timestamp(),
      statement_timestamp()
    )
    on conflict (id) do update
      set email = excluded.email,
          email_confirmed_at = coalesce(auth.users.email_confirmed_at, statement_timestamp()),
          raw_app_meta_data = excluded.raw_app_meta_data,
          raw_user_meta_data = excluded.raw_user_meta_data,
          confirmation_token = '',
          recovery_token = '',
          email_change_token_new = '',
          email_change = '',
          phone = '',
          phone_change = '',
          phone_change_token = '',
          email_change_token_current = '',
          reauthentication_token = '',
          updated_at = statement_timestamp();

    insert into auth.identities (
      provider_id, user_id, identity_data, provider, created_at, updated_at
    ) values (
      ${sqlLiteral(authorEmail)},
      ${sqlLiteral(authorUserId)}::uuid,
      jsonb_build_object(
        'sub', ${sqlLiteral(authorUserId)},
        'email', ${sqlLiteral(authorEmail)},
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      statement_timestamp(),
      statement_timestamp()
    )
    on conflict (provider_id, provider) do update
      set user_id = excluded.user_id,
          identity_data = excluded.identity_data,
          updated_at = statement_timestamp();

    insert into public.profiles (user_id, registration_name)
    values (${sqlLiteral(authorUserId)}::uuid, ${sqlLiteral(credentials.author.registrationName)})
    on conflict (user_id) do update
      set registration_name = excluded.registration_name,
          updated_at = statement_timestamp();

    insert into public.memberships (user_id, state, admitted_at)
    values (${sqlLiteral(authorUserId)}::uuid, 'active', statement_timestamp())
    on conflict (user_id) do update
      set state = 'active',
          admitted_at = coalesce(public.memberships.admitted_at, statement_timestamp()),
          suspended_at = null,
          revoked_at = null,
          updated_at = statement_timestamp();

    insert into public.role_grants (user_id, role, granted_by, grant_reason)
    select ${sqlLiteral(authorUserId)}::uuid, 'author', null, 'Local QA fixture'
    where not exists (
      select 1 from public.role_grants
      where user_id = ${sqlLiteral(authorUserId)}::uuid
        and role = 'author'
        and revoked_at is null
    );

    update public.author_profiles
    set slug = ${sqlLiteral(authorSlug)},
        display_name = ${sqlLiteral(credentials.author.registrationName)},
        bio = 'Synthetic local QA author.',
        updated_at = statement_timestamp()
    where user_id = ${sqlLiteral(authorUserId)}::uuid;

    insert into public.invitations (
      id, code_hash, inviter_user_id, max_uses, use_count, expires_at
    ) values (
      ${sqlLiteral(invitationId)}::uuid,
      ${sqlLiteral(invitationHash)},
      ${sqlLiteral(authorUserId)}::uuid,
      10,
      0,
      statement_timestamp() + interval '365 days'
    )
    on conflict (id) do update
      set code_hash = excluded.code_hash,
          inviter_user_id = excluded.inviter_user_id,
          max_uses = excluded.max_uses,
          expires_at = excluded.expires_at,
          revoked_by = null,
          revoked_at = null,
          revoke_reason = null;
    commit;
  `);

  runLocalSql(readingFixtureSql());

  await updateUser(status, authorUserId, {
    password: credentials.author.password,
    email_confirm: true,
    user_metadata: { registration_name: credentials.author.registrationName },
  });

  const reader = await createReader(
    status,
    readerEmail,
    credentials,
    invitationHash,
  );

  runLocalSql(`
    begin;
    insert into public.profiles (user_id, registration_name)
    values (${sqlLiteral(reader.id)}::uuid, ${sqlLiteral(credentials.reader.registrationName)})
    on conflict (user_id) do update
      set registration_name = excluded.registration_name,
          updated_at = statement_timestamp();

    insert into public.memberships (user_id, state, admitted_at)
    values (${sqlLiteral(reader.id)}::uuid, 'active', statement_timestamp())
    on conflict (user_id) do update
      set state = 'active',
          admitted_at = coalesce(public.memberships.admitted_at, statement_timestamp()),
          suspended_at = null,
          revoked_at = null,
          updated_at = statement_timestamp();

    insert into public.invitation_redemptions (invitation_id, user_id)
    values (${sqlLiteral(invitationId)}::uuid, ${sqlLiteral(reader.id)}::uuid)
    on conflict (user_id) do update
      set invitation_id = excluded.invitation_id;

    update public.invitations i
    set use_count = (
      select count(*)::integer
      from public.invitation_redemptions ir
      where ir.invitation_id = i.id
    )
    where i.id = ${sqlLiteral(invitationId)}::uuid;
    commit;
  `);

  const authorToken = await signIn(
    status,
    credentials.author.registrationName,
    credentials.author.password,
  );
  const readerToken = await signIn(
    status,
    credentials.reader.registrationName,
    credentials.reader.password,
  );
  await authenticatedRpc(status, authorToken, "list_my_studio_works", {
    p_limit: 1,
    p_offset: 0,
  });
  const readerStudio = await authenticatedRpc(
    status,
    readerToken,
    "list_my_studio_works",
    { p_limit: 1, p_offset: 0 },
  );
  if (!Array.isArray(readerStudio) || readerStudio.length !== 0) {
    throw new Error("Local Reader unexpectedly received Studio content");
  }

  console.log("Local QA fixture ready.");
  console.log(`Author login name: ${credentials.author.registrationName}`);
  console.log(`Reader login name: ${credentials.reader.registrationName}`);
  console.log(`Credentials: ${credentialPath}`);
  console.log("Reading fixtures:");
  console.log("  /works/qa-reading-short");
  console.log("  /works/qa-reading-longform");
  console.log("  /works/qa-reading-empty");
  console.log(
    "Passwords were not printed. The credential file is local and Git-ignored.",
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
