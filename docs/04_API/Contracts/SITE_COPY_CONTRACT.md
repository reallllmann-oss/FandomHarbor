# Admin P0 Site Copy Domain Contract

Status: DOMAIN-01 implemented locally; ADMIN-01 connects the strict Admin Read
path to a read-only Admin surface. Admin write and Web consumers are not
connected.

## Ownership and flow

`packages/services` owns the provider-neutral Site Copy content, validation, capability, fallback, diff, save-result and Domain Error contracts. `packages/database` owns the Supabase/PostgREST RPC transport schemas, lossless bigint boundary, strict database response parsing and stable error mapping.

The approved public flow is:

`Web request → Public Site Copy Service → Public Repository → get_public_site_copy → field validation → Baseline merge → complete Snapshot`

The approved administrative flow is:

`TrustedAccessContext → Admin Site Copy Service → capability check → Admin Repository → get_admin_site_copy/save_site_copy`

No Supabase client, PostgREST error, generated Row, RPC Args/Returns or Auth User type crosses the Repository boundary.

## Exact eight fields and Version 1 Baseline

| Field                          | Version 1 value                                                                                                                                | Current product source                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `homepage_title`               | `Fandom Harbor`                                                                                                                                | `apps/web/src/app/page.tsx:22`                                |
| `homepage_introduction`        | `一座为公开故事发现与长久阅读保留安静位置的文学港湾。作品在这里以清楚的作者身份被认真归档，读者可以从一部故事开始，按自己的节奏停留，再回来。` | `apps/web/src/app/page.tsx:25`                                |
| `homepage_primary_cta_label`   | `浏览公开作品`                                                                                                                                 | `apps/web/src/app/page.tsx:32`                                |
| `homepage_secondary_cta_label` | `查找作品与作者`                                                                                                                               | `apps/web/src/app/page.tsx:35`                                |
| `navigation_archive_label`     | `Archive`                                                                                                                                      | `apps/web/src/lib/global-shell-navigation.ts:4`               |
| `navigation_search_label`      | `Search`                                                                                                                                       | `apps/web/src/lib/global-shell-navigation.ts:5`               |
| `navigation_studio_label`      | `Studio`                                                                                                                                       | `apps/web/src/lib/global-shell-navigation.ts:10`              |
| `footer_brand_note`            | `Fandom Harbor · 私域作品归档`                                                                                                                 | `packages/ui/src/components/layouts.tsx:106`, rendered by Web |

The Domain content object must contain all and only these fields. Missing fields, extra fields, index signatures, dynamic records and unknown-property passthrough are not Site Copy content.

## Normalization and validation

Every field is NFC-normalized, trimmed using the same boundary-space semantics as DB-01, rejected when it contains Unicode control characters or line breaks, and counted by Unicode code points rather than JavaScript UTF-16 length.

Field limits are:

- `homepage_title`: 1–40
- `homepage_introduction`: 1–180
- both CTA labels: 1–18
- Archive/Search/Studio labels: 1–12
- `footer_brand_note`: 1–80

The change reason uses the same normalization and control-character rules with a 4–200 code-point limit.

## Public read and fallback

The Public Store returns a provider-neutral candidate with exactly eight declared field positions plus a bigint version. The Public Service validates each text field independently:

- an invalid field uses only that field's Version 1 Baseline;
- other valid database fields remain visible;
- multiple invalid fields fall back independently;
- no RPC row or an unavailable RPC uses all eight Baseline values;
- corrupt or unsafe bigint transport fails at the Repository boundary and produces the stable full Public fallback;
- full fallback returns `version=null`; it does not fabricate a database Version, Revision, Audit, actor, reason or time.

The resulting Snapshot always contains all eight renderable fields. A later Web request may share one Snapshot across Header, Homepage and Footer, but DOMAIN-01 does not connect those consumers.

## Admin read and capability

Admin Read checks `admin:operate` before any Repository call. The capability continues to come from the existing active Membership plus Admin/Super Admin role derivation. Active Admin and active Super Admin are allowed; anon, Reader, Author, suspended and revoked contexts fail before Repository access.

Admin responses are strict. Missing fields, extra fields, noncanonical content, invalid UUIDs, invalid reasons, unsafe bigint transport and invalid timestamps return a stable Domain Error. Admin never uses Baseline fallback to hide database corruption.

## Admin save

The strict save input is:

- `baseVersion: bigint`
- `baseRevisionId: UUID string`
- `requestId: UUID string`, excluding the nil UUID reserved by DATA-01
- `content: ExactEightFieldSiteCopy`
- `reason: normalized 4–200 code-point string`

The Service validates and normalizes the input and computes a normalized field diff before the Repository save. The Repository serializes `baseVersion` directly with `baseVersion.toString(10)` and sends the eight explicit RPC arguments.

Closed results are:

- `Saved`: database Version, Revision ID, Audit Log ID, changed fields and database time;
- `Unchanged`: database Version and Revision ID, with no fabricated Audit Log ID;
- `Conflict`: current database Version and Revision ID, with no overwrite and no fabricated Audit Log ID.

The same request ID and same payload maps the original Saved response. DB-01 returns `INVALID_INPUT` for a reused request ID with a different normalized payload; the Repository preserves that stable error.

## Identity, bigint and time

- `requestId`, `revisionId` and `baseRevisionId` are strict UUID strings.
- The nil UUID is rejected only for normal Admin `requestId`.
- `version`, `baseVersion` and `auditLogId` are Domain `bigint`.
- Database timestamps are strict offset timestamps converted to valid `Date` values.

Inbound bigint transport accepts only:

- a nonnegative `Number.isSafeInteger` number, converted with `BigInt(value)`;
- a canonical nonnegative decimal string matching `^(0|[1-9][0-9]*)$`, converted directly with `BigInt(value)`.

Negative, fractional, nonfinite, unsafe numeric, empty, signed, exponent, hexadecimal, nonnumeric and noncanonical leading-zero forms return `DATA_CORRUPTION`. String parsing never uses `Number`, `parseInt`, `parseFloat` or unary numeric coercion.

Known transport limit: the approved RPCs currently use standard JSON numeric transport. Safe integer values are lossless. If PostgREST returns a JSON number greater than `Number.MAX_SAFE_INTEGER`, the Repository fails closed as `DATA_CORRUPTION`; it never guesses the original value. The string parser supports arbitrarily large bigint text, but current production RPCs are not claimed to return text. Supporting real values beyond the JavaScript safe range requires a separately authorized RPC text projection or reviewed lossless JSON transport.

## Stable error mapping

| Database/transport condition                   | Domain result                                 |
| ---------------------------------------------- | --------------------------------------------- |
| SQLSTATE `22023`                               | `INVALID_INPUT`                               |
| SQLSTATE `28000`                               | `UNAUTHENTICATED`                             |
| SQLSTATE `42501`                               | `FORBIDDEN`                                   |
| SQLSTATE `55000`                               | `DATA_CORRUPTION`                             |
| recognized PostgREST contract/unavailable code | `REPOSITORY_UNAVAILABLE`                      |
| unrecognized database error code               | `UNKNOWN_REPOSITORY_ERROR`                    |
| malformed RPC success data                     | `DATA_CORRUPTION`                             |
| Save response `status=conflict`                | typed `Conflict`, not an exception or success |

Mappings use structured codes, never fuzzy database message matching. Raw error objects, SQL details, table/function names, hints and sensitive metadata are not exposed to Apps.

## ADMIN-01 read-only connection

The Admin root page now calls the accepted Admin Service and Repository to
display the current database Version and all eight fields. The App derives the
existing trusted access context first; unauthenticated or non-`admin:operate`
contexts do not call the Site Copy Repository. The Service and database RPC
continue to enforce the same capability independently.

The surface contains no Site Copy inputs, edit state, save Server Action or
publish control. It does not expose Revision, Audit or RPC transport objects to
the page. Database corruption or unavailability remains a strict Admin failure
and is handled by the existing Admin error boundary; no Baseline is substituted.

## Current stop boundary

Admin Read is connected locally. Admin edit/save/publish, Web Homepage, Header,
Footer, SEO, metadata, Auth, capability, Migration, RLS and RPC are unchanged.
No remote Migration, Push, PR, Preview or Production deployment is part of
ADMIN-01. The next Mission requires separate Product Owner authorization.
