# Admin P1-05B-2 Synthetic Fixtures, Read Authorization and Denial QA Evidence

Status: `PASS / WAITING FOR PRODUCT OWNER COMMIT AUTHORIZATION`

Date: 2026-08-22
Baseline: `75efba48e57381f13398b63c0cadc44c4b9b2e17`
Branch: `codex/admin-p1-04-ordinary-mutations`

This evidence records P1-05B-2 execution against the dedicated non-Production
Attempt 2 only. It does not authorize ordinary successful mutations, P1-05B-3,
P1-06, P1-07, P1.1, Production access, deployment or a Git commit.

## 1. Target and isolation gate

| Item                                   | Result                                         |
| -------------------------------------- | ---------------------------------------------- |
| QA display name                        | `fandom-harbor-admin-p1-qa-2`                  |
| QA Project ref                         | `hicfnlwzmnbxhimyeviy`                         |
| Region / health                        | `ap-southeast-1` / `ACTIVE_HEALTHY`            |
| Repository Migration catalog           | 20/20 exact                                    |
| Production ref                         | `szfhngifsipsrxcpekti` — not used              |
| Attempt 1 ref                          | `gqtchjrmpuxibxmurvfd` — inactive and not used |
| Production credential/data/side effect | none / none / none                             |

The local Admin process received only the QA API URL and QA publishable key.
The QA service credential was used only by the server-side fixture bootstrap and
never entered the browser, Admin client, repository, documentation or Git.

## 2. Synthetic fixture inventory

All identifiers use the `qa_p1_synthetic_` namespace. Passwords, access tokens,
refresh tokens, cookies and API/database secrets are intentionally omitted.

| ID  | Logical fixture                  | Registration name                              | QA UUID                                | Membership | Role state            | Class                  |
| --- | -------------------------------- | ---------------------------------------------- | -------------------------------------- | ---------- | --------------------- | ---------------------- |
| A   | Admin operator                   | `qa_p1_synthetic_admin_operator`               | `ad8111e2-afcd-4e71-ae69-8412ebc064d0` | active     | active admin          | elevated operator      |
| B   | Super Admin operator             | `qa_p1_synthetic_super_admin_operator`         | `82e77490-e2ea-4c8a-9045-f8af63b9d494` | active     | active super_admin    | elevated operator      |
| C   | Reader operator                  | `qa_p1_synthetic_reader_operator`              | `93245699-b688-40aa-929c-f8573aa3411f` | active     | none                  | ordinary operator      |
| D   | Author-only operator             | `qa_p1_synthetic_author_operator`              | `cdbbf49e-3d5b-40b5-9a7f-6f465ceec58a` | active     | active author         | ordinary operator      |
| E   | Inactive Admin operator          | `qa_p1_synthetic_inactive_admin_operator`      | `8d6e29ec-b7e0-4fb1-9f88-a4d31c425c01` | suspended  | active admin retained | elevated/inactive      |
| F   | Revoked Admin operator           | `qa_p1_synthetic_revoked_admin_operator`       | `49d6559b-4666-4eeb-b6c6-d0596ccf44b6` | active     | revoked admin         | ordinary/no live admin |
| G   | Ordinary Reader target           | `qa_p1_synthetic_ordinary_reader_target`       | `fa96f3c0-6022-4132-a078-e6859bd7fc17` | active     | none                  | ordinary target        |
| H   | Ordinary Author target           | `qa_p1_synthetic_ordinary_author_target`       | `be7fbe2e-3da4-496d-ba38-9b70fe12d9c9` | active     | active author         | ordinary target        |
| I   | Suspended ordinary target        | `qa_p1_synthetic_suspended_ordinary_target`    | `d0c42c30-ddbf-4c60-8ec7-8b0ebffe6f9d` | suspended  | none                  | ordinary target        |
| J   | Revoked ordinary target          | `qa_p1_synthetic_revoked_ordinary_target`      | `a008da94-7c9f-4c01-890f-75addf2f8a60` | revoked    | none                  | ordinary target        |
| K   | Protected Admin target           | `qa_p1_synthetic_protected_admin_target`       | `a5bbf0c9-b136-4e42-a193-8fe822380aee` | active     | active admin          | elevated target        |
| L   | Protected Super Admin target     | `qa_p1_synthetic_protected_super_admin_target` | `358bc55e-41e7-4a95-9079-dd2743a7f5ae` | active     | active super_admin    | elevated target        |
| M   | Elevated Membership target       | `qa_p1_synthetic_elevated_membership_target`   | `3ca96f35-2ded-470f-b993-6fc36ff8ffa9` | active     | active admin          | elevated target        |
| N   | Last active Super Admin scenario | `qa_p1_synthetic_last_active_super_admin`      | `77164d35-1017-478a-a904-9033ab4573a2` | active     | active super_admin    | protected target       |

One additional non-login control identity,
`qa_p1_synthetic_fixture_controller`
(`ff2ea537-86f0-4622-8bf2-e2e193b6a836`), exists only to support the invitation
bootstrap. Its 14-use invitation was revoked immediately after provisioning.
Credential material remains in the local secure secret path for an authorized
future B-3; no plaintext credential is retained in the repository.

## 3. Post-provision baseline

| Fact                          | Baseline                                                           |
| ----------------------------- | ------------------------------------------------------------------ |
| Auth users / fixture profiles | 15 / 15                                                            |
| Memberships                   | 15                                                                 |
| Role Grants                   | 10                                                                 |
| Audit rows                    | 16                                                                 |
| P1 request Ledger rows        | 0                                                                  |
| Fixture state hash            | `2b3ad344c71328cd37092fe142218bd9366d68c908021ce87332a381e0092050` |
| Non-fixture profile hash      | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

The 16 Audit rows are fixture baseline: the existing P0 Migration seed Audit,
14 invitation-redemption rows and one synthetic Author-role Audit used to prove
the target Audit read. They predate every denial attempt in this Mission.

## 4. Local Admin binding and authorized reads

The local `/access` route was bound only to Attempt 2. Both A and B authenticated
with synthetic registration-name/password credentials and passed the complete
runtime chain:

`/access -> page/loader -> live-access Service -> strict Repository -> read RPC`

| Case                                  | Admin                              | Super Admin                         |
| ------------------------------------- | ---------------------------------- | ----------------------------------- |
| Search by synthetic registration name | PASS                               | PASS                                |
| Detail                                | PASS                               | PASS                                |
| Audit                                 | PASS — fixture Role grant rendered | PASS — valid empty history rendered |

Observed detail data matched the database fixture: masked identity contained only
registration name and public User ID; Membership and active Author/Admin roles were
correct; the database expected-state token was present; elevated and only-active-
Super-Admin metadata rendered correctly. No email, Auth metadata or credential was
returned.

## 5. Caller authorization denial

| Caller                    | Result | Boundary                                      |
| ------------------------- | ------ | --------------------------------------------- |
| Reader C                  | DENY   | sign-in access check; no governance Data Port |
| Author-only D             | DENY   | sign-in access check; no governance Data Port |
| Suspended Admin E         | DENY   | inactive Membership; no governance Data Port  |
| Revoked Admin F           | DENY   | no live Admin role; no governance Data Port   |
| Invalid/anonymous session | DENY   | `/access` redirected to sign-in               |
| Missing `admin:operate`   | DENY   | C/D lack the capability                       |

All denied sign-ins returned the fixed forbidden page and exposed no target Search,
Detail or Audit data.

## 6. Live authorization revalidation

Admin A first loaded a protected Search successfully. Fixture control then changed
A's Membership from active to suspended. The next `/access` read immediately
redirected to the forbidden sign-in state. The Membership was restored directly by
fixture control; no ordinary governance success path, Ledger row or Audit row was
used. This proves protected reads do not rely on page-load-only authorization.

## 7. Elevated and protected denial

The UI rendered K, L, M and N as protected/elevated read-only accounts and rendered
no mutation controls. An authenticated Admin application-role call to the exact v2
backend authority then tested the fail-closed boundary:

| Target / attempt                      | Database result                        |
| ------------------------------------- | -------------------------------------- |
| K Admin / Grant Author                | `42501` / `ELEVATED_MUTATION_DEFERRED` |
| L Super Admin / Grant Author          | `42501` / `ELEVATED_MUTATION_DEFERRED` |
| M elevated Membership / set suspended | `42501` / `ELEVATED_MUTATION_DEFERRED` |

This verifies both the UI/Service prevention boundary and the database final
authority. No elevated success path or Admin/Super Admin Role mutation exists.

For N, fixture control temporarily suspended the other two active Super Admin
Memberships. Detail reported `Only active Super Admin = true`. The attempted
Membership revoke returned `42501 / ELEVATED_MUTATION_DEFERRED`; N remained active.
The two control Memberships were restored, returning the active Super Admin count
to three.

## 8. Legacy RPC and Review-to-Confirm denial

Using an authenticated synthetic Admin application session, all legacy calls were
privilege denied with SQLSTATE `42501`:

- `grant_role(uuid,elevated_role,text)`
- `revoke_role(uuid,elevated_role,text)`
- `set_membership_state(uuid,membership_state,text)`

Admin A then prepared an ordinary Membership `active -> suspended` Review for G.
The Review contained a new requestId and the database expected-state token. Fixture
control suspended A before Confirm. Confirm was denied and redirected to the fixed
forbidden state; G remained active. A was restored after the assertion.

## 9. Zero-write and post-test security evidence

| Fact                     |        Baseline |           Final | Delta |
| ------------------------ | --------------: | --------------: | ----: |
| Profiles                 |              15 |              15 |     0 |
| Memberships              |              15 |              15 |     0 |
| Role Grants              |              10 |              10 |     0 |
| Audit                    |              16 |              16 |     0 |
| P1 request Ledger        |               0 |               0 |     0 |
| Fixture state hash       | `2b3ad344…2050` | `2b3ad344…2050` | equal |
| Non-fixture profile hash | `e3b0c442…b855` | `e3b0c442…b855` | equal |

No ordinary `Saved`, `Unchanged` or `Conflict` mutation was executed. No Author
Grant/Revoke succeeded. No requestId replay, concurrency or forced-failure success
path was run; those remain reserved for P1-05B-3.

Post-test ACL remained exact:

| Matrix                                           |            `execute=true` |
| ------------------------------------------------ | ------------------------: |
| Legacy write RPC × four application roles        |                      0/12 |
| Ordinary v2 write RPC × four application roles   | 3/12 — authenticated only |
| Read RPC × four application roles                | 3/12 — authenticated only |
| Private helper/executor × four application roles |                      0/36 |

## 10. Session and completion state

The browser synthetic Admin session was explicitly signed out. Final Auth catalog
inspection found zero synthetic sessions and zero synthetic refresh tokens. Fixture
users remain for B-3, but no privileged browser session or plaintext credential
remains.

P1-05B-2 is `PASS / WAITING FOR PRODUCT OWNER COMMIT AUTHORIZATION`.
P1-05B-3 is technically ready for a separate Product Owner authorization but was
not started. P1-06, P1-07 and P1.1 remain not authorized. Admin Production remains
`paused=true`; Web Admin entry remains closed; the accepted P0 Production Site Copy
authority remains Version 7.
