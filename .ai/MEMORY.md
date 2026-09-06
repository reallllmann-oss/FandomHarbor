# Project Memory

- 2026-09-06: P1-06B Manual Preview Acceptance and P1-06C Admin UI Polish are
  Product Owner PASS. P1-06C closes UI-01 Admin localization, UI-02 shrink-safe
  Review/responsive layout, UI-03 authenticated Admin global Header sign-out and
  UI-04 deterministic `Asia/Shanghai` timestamps rendered as
  `YYYY-MM-DD HH:mm（北京时间）`. Product Owner human verification passed 1440,
  1024, 768, 480 and 390 pixel layouts and the runtime Beijing-time result on
  protected Preview `dpl_HiF87dWBe54kXCMum3yN29nWHCxa`. Workspace TypeScript,
  ESLint, Admin 105, UI 5, Admin production build, Prettier, diff and sensitive
  scan passed. P1-06C changed presentation/layout only; Auth, governance,
  Service/Repository/Domain, database, Migration/RPC/RLS/Grant/ACL, Audit/Ledger,
  QA2 and Production contracts are unchanged. Formal Admin Production remains
  `paused=true`, Web Admin entry closed and Site Copy Version 7. P1-07 is ready
  for separate Product Owner authorization but not started; P1.1 remains
  deferred and unauthorized. Evidence is
  `docs/15_Sprint/Admin_P1/P1_06C_UI_POLISH_ACCEPTANCE_EVIDENCE.md`.

- 2026-08-23: P1-06A dedicated protected Preview acceptance passed at
  `b0148e051c622e0a0fce0141be8cbcbccee9401d`. Canonical Preview
  `dpl_84CzqyvoypWY213ESquzM9B6Ekap` is READY/preview, protected by Vercel
  Authentication and has zero automation bypass. The Product Owner completed
  human Vercel protection, QA2 Admin login, `/access` read-only and responsive
  visual acceptance; QA database Version 1 and the smoke-only identity proved
  QA2 `hicfnlwzmnbxhimyeviy`, not Production. The initial overflow defect and all
  deployment/bypass/network failures remain preserved in
  `P1_06A_DEDICATED_PREVIEW_EVIDENCE.md`. R1R7 revoked two sessions and two refresh
  tokens, deleted the exact smoke Auth/Profile/Membership/Admin fixture and
  Keychain credential, and returned synthetic state to zero. QA ACL remains old
  `0/12`, v2 `0/12`, read `3/12`, private `0/36`; writes are closed. Both aliases
  on incorrect Production deployment `dpl_9DCjUpLGAZ7RTEKGE65JkPz8KNy2` were
  removed before that deployment was deleted; the dedicated project has no active
  Production route. Canonical and pre-fix Previews remain READY/preview. Formal
  Admin Production remains unchanged and `paused=true`, Web Admin entry closed,
  and Production Site Copy Version 7. Direct executor browser scanning remained
  unavailable; equivalent configuration, local build/source and human runtime
  evidence passed. P1-06A awaits a docs-only evidence Commit; P1-06B is ready for
  separate Product Owner authorization but not started. P1-07 and P1.1 remain
  unauthorized.

- 2026-08-22: P1-05 Final Closure Audit passed at
  `065e7626119789845471351cfbc1e71329c5735e`. All seven required P1-05 commits
  are exact ancestors. P1-05A, hosted ACL R1, clean Attempt 2, B-2 and B-3R2 are
  PASS; both Attempt 1 failures and the accepted `QA-ONLY OPERATIONAL CREDENTIAL
RECOVERY` deviation remain explicit. Current-HEAD local regression passed Admin
  88, P1-03 17, P1-04B 17, composition 7, Service 57, Services 180, Repository 24,
  Database 143, Migration contract 23, governance/rollback/Hosted/dblink SQL,
  TypeScript, ESLint, Prettier, security and Admin production build. `REMOTE
FAILURE INJECTION` remains `NOT AVAILABLE BY CURRENT CONTRACT`; authoritative
  local rollback and atomicity tests pass. Dedicated QA final safety state remains old
  `0/12`, v2 `0/12`, read `3/12`, private `0/36`, synthetic zero; normal Migration
  D desired v2 ACL remains authenticated-only `3/12`. P1-05 is
  `PASS / READY TO CLOSE`, awaiting docs-only Closure Commit authorization. P1-06 is ready for
  separate Product Owner authorization but not started; P1-07 is not authorized;
  P1.1 remains deferred. No remote or Production operation occurred. Admin
  Production remains `paused=true`, Web Admin entry closed and P0 Site Copy
  Version 7.

- 2026-08-22: P1-05B-3R2 passed against dedicated QA2 at baseline
  `f00743c4e8ae7604b1b8114f29cf7fdec32f2e63`. The current local UI → Action raw
  request → Service parser → live authorization → strict Repository → v2 RPC path
  returned Saved for the original Membership scenario. Membership and Author
  Saved/Unchanged, replay/mismatch, stale Conflict, concurrency A/B/C,
  exactly-once, Detail/Audit and elevated/legacy denial all passed. Pre-cleanup
  proof was 17 unique Ledger rows (11 Saved, four Unchanged, two Conflict) and 11
  business Audits with no duplicate or orphan. Local authoritative rollback and
  dblink suites passed; no remote failure injector was created. Exact cleanup
  restored zero synthetic Auth/session/business/Audit/Ledger/invitation state;
  final ACL is old `0/12`, v2 `0/12`, read `3/12`, private `0/36`, with QA2
  `ACTIVE_HEALTHY`, 20/20 Migration and non-fixture baseline unchanged. P1-05B-3R2
  is PASS and P1-05 is ready for a separately authorized final closure audit.

- Historical Attempt 1 (2026-08-22): P1-05B-3 stopped at its first formal ordinary Membership Confirm.
  Review bound the database token, but Confirm returned sanitized `INVALID_INPUT`
  before any v2 RPC; target state, Audit and Ledger remained unchanged. Read-only
  trace shows the Action adapter passes an already-parsed branded command into the
  Service's unknown-input parser, which rejects the branded fields on the second
  parse. No fix was authorized. QA2 was emergency write-closed and fully sanitized:
  synthetic Auth/session/profile/membership/role/Audit/Ledger/request/invitation
  and local temporary credentials are zero; final ACL old `0/12`, v2 `0/12`, read
  `3/12`, private `0/36`; 20/20 Migration and non-fixture baseline unchanged.
  At that historical point P1-05B-3 was BLOCKED and P1-05 was not ready for
  closure.

## Admin P1-05B-2 Read Authorization and Denial QA（2026-08-22 historical snapshot）

- Dedicated QA Attempt 2 `hicfnlwzmnbxhimyeviy` now contains 14 named A–N
  synthetic fixtures plus one non-login invitation bootstrap controller. The
  temporary invitation is revoked; fixture credentials remain only in the local
  secure secret path for a separately authorized B-3.
- Local `/access` bound only to Attempt 2 proved Admin and Super Admin
  Search/Detail/Audit through page/loader → Service live-access → strict Repository
  → read RPC. Reader, Author, suspended Admin, revoked Admin and anonymous callers
  were denied without target-data exposure.
- Suspending an already signed-in Admin via fixture control caused the next
  protected read to deny. Suspending the actor between ordinary Review and Confirm
  also denied with zero business/Ledger/Audit delta. Both fixtures were restored.
- Elevated Admin, Super Admin and Membership targets were read-only in the UI and
  exact v2 calls returned `42501 / ELEVATED_MUTATION_DEFERRED`. With the other two
  Super Admin Memberships temporarily suspended, the last-active fixture rendered
  its protection flag and the attempted disable was denied; all control state was
  restored.
- All three legacy RPCs remained authenticated privilege denied. Post-test ACL is
  old `0/12`, v2 authenticated-only `3/12`, read authenticated-only `3/12`, private
  `0/36`; fixture/non-fixture hashes equal baseline, Audit remains 16 and Ledger 0.
- The privileged browser session was signed out and final synthetic session and
  refresh-token counts are zero. No ordinary successful mutation, Production
  credential/data/operation, Commit, Push/PR/Merge, Unpause or Deployment occurred.
  This was the B-2 handoff state. B-2 was later committed at
  `3f45ce7459e67e7f6b8844024bfd64181a1a8374`; the current B-3 result above
  supersedes its former ready/not-started statement.

## Admin P1-05B-1R2 Clean QA Bootstrap Attempt 2（2026-08-20）

- R1 is committed at `4f93db9a834843da7640bdf52a31817f2ff528e1`. R2 paused Attempt 1 `gqtchjrmpuxibxmurvfd` to `INACTIVE` without deleting, resetting, patching or reusing it.
- A new Free/Nano Attempt 2 `fandom-harbor-admin-p1-qa-2` / `hicfnlwzmnbxhimyeviy` was created in `ap-southeast-1`. Its ref, API/database host and Auth tenant differ from Production and Attempt 1; no source data, Auth, schema or credential was copied.
- Pre-apply state was clean: Auth 0, no public application objects, no private schema and no Migration catalog. The current HEAD's exact 20 Migration chain applied in order; remote catalog is exact and A/B/C/D are applied.
- Hosted default function execute grants to application roles were observed. Corrected D normalized the real Hosted state and finished with legacy `0/12`, v2 authenticated-only `3/12`, read authenticated-only `3/12` and P1 private `0/36`, for both direct and effective/PUBLIC-inherited checks.
- Read security modes/owner/search path, Data API non-exposure of private, Ledger/Audit RLS and immutable triggers pass. QA P0 remains the formal Version 1 seed; Auth/profile/Membership/Role/Ledger/non-P0 Audit counts remain zero.
- No fixture, business QA, emergency close-write or Production operation occurred. Creation output parsing did not retain the first Attempt 2 database password, and one Attempt 2-only password rotation was used before Migration. No secret was exposed. Product Owner accepted the event as `QA-ONLY OPERATIONAL CREDENTIAL RECOVERY`; it remains explicit and is not a precedent for wider remote scope. P1-05B-2 is ready for separate authorization but not started; P1-06/P1-07/P1.1 remain unauthorized.

## Admin P1-05B-1R1 Fresh-Bootstrap ACL Correction（2026-08-20）

- Attempt 1 on dedicated QA is historical failure evidence: Migrations 1–19 applied, D failed on `anon grant_role`, no fixtures/business QA, emergency fail-closed completed, Production untouched. The 19/20 Project is not reusable for continued P1-05B.
- Root cause is direct-versus-effective ACL drift. PostgreSQL grants function execute through `PUBLIC`; existing Supabase Hosted defaults additionally create direct `anon/authenticated/service_role` grants. The owning legacy Migration revoked `PUBLIC` only, so the Hosted `anon=true` seen by D was a remaining direct grant. Local reset had no such direct `anon/service_role` aclitems.
- Repository policy requires ordered Migration workflow and clean rebuilds but does not prohibit an explicitly authorized correction to a P1 Migration that remains unapplied to Production. R1 therefore minimally modifies D rather than adding a QA workaround or E.
- D retains exact catalog, legacy/v2 owner/security/search-path, v2 execute-closed and private deny hard gates. Legacy application ACL is now normalizable: exact revokes from `PUBLIC/anon/authenticated/service_role`, prove old `0/12`, then grant v2 authenticated-only and prove `3/12` plus private `0/36` in the same atomic `DO`.
- Hosted direct/PUBLIC regression, two clean 20-Migration rebuilds, 15 SQL suites, Database 143, Repository 24, Service 57, Services 180, Admin 82, TypeScript, ESLint and database lint pass. Read ACL/modes, elevated zero-write, rollback, final Super Admin and P0 remain unchanged.
- R1 performed no remote QA or Production operation. It is `LOCAL PASS / WAITING FOR PRODUCT OWNER COMMIT AUTHORIZATION`; clean QA reprovision/Attempt 2 and P1-05B-2 remain separate Owner gates.

## Admin P1-05A Dedicated QA Preparation（2026-08-20）

- P1-05A preparation is complete in Commit `4990440cb0a6e341ce242380480a06fe0c62ea14`. P1-05A2 created Free/Nano Project `fandom-harbor-admin-p1-qa` (`gqtchjrmpuxibxmurvfd`) in `ap-southeast-1`; non-sensitive metadata proves its ref, API/database host and Auth tenant differ from Production.
- The preparation contract is complete for synthetic fixtures, credential handling, write window, emergency revoke of the three exact v2 signatures, cleanup/retention, all 20 Migrations with A–D last, expected ACLs, the full QA matrix and sanitized evidence.
- P1-05B Attempt 1 later failed at Migration D and was fail-closed; R1 is now the current authority. The preparation-time environment readiness did not itself authorize execution.
- The only remote side effect was one dedicated QA Project provisioning. No QA data-plane access, remote Migration/SQL/Auth/ACL/fixture/write, Production access, stage, Commit, Push/PR, login, Unpause or Deployment occurred. P1-06/P1-07/P1.1 remain unauthorized.

## Admin P1 Final Status Reconciliation（2026-08-20）

- Current authority: P1-02G `370d7b0541a51ed63dd4076e4d912b2309c9d072`, P1-03 `9caac4a9affbd3ea9d13cbae266696f9c853490e`, P1-04A `2750205f2b9a3cce2c09d2e3f5e43ba1b7d421cd` and P1-04B `bf35f5a1e4b005e04bb4b9d054cf6310ffb0c74c` are complete local commits.
- Ordinary Identity & Access Governance is locally complete. This does not mean P1 Closure or remote/Production release.
- P1-05 `Local + Dedicated Non-Production Remote QA` is `REQUIRED / NOT AUTHORIZED / NOT EXECUTED` and is the current P1 Closure blocker. It must validate the ordinary chain and Migrations A–D in an isolated non-Production Supabase environment.
- P1-06 Protected Admin Preview Acceptance and P1-07 Production Release Review remain unauthorized. P1 is `NOT READY FOR CLOSURE`.
- P1.1 Elevated Access Governance remains `DEFERRED / NOT AUTHORIZED`; it requires P1 Closure, separate Product Owner authorization and a new Auth/Access ADR, with MFA/AAL2 reconsidered first. KI-033 is not technically resolved.
- No remote Migration/SQL/ACL apply, Production mutation, login, Unpause or Deployment occurred. Admin Production remains `paused=true`, Web Admin entry remains closed and P0 Production Site Copy remains Version 7.
- Earlier entries below are preserved as point-in-time history; their then-current “not started/not committed” statements are not the current project state.

## Admin P1-04A Ordinary Write RPC Atomic Cutover（2026-08-19）

- Product Owner accepted the P1-04 ACL blocker and authorized only a local atomic cutover Migration, ACL/rollback tests and documentation on P1-03 Commit `9caac4a9affbd3ea9d13cbae266696f9c853490e`.
- Migration `20260819225318_admin_p1_identity_access_cutover.sql` is one fail-closed `DO` statement under the global governance transaction lock: exact catalog/before-state → revoke legacy → prove deny → grant three v2 to authenticated → final/private assertions.
- Final local ACL is legacy `0/12`, ordinary v2 authenticated-only `3/12`, read authenticated-only `3/12`, and nine private helpers/executor `0/36`; no broad/PUBLIC/anon/service-role grant exists.
- Local failure rehearsal restores the pre-cutover ACL after a forced mid-cutover failure, rehearses the complete switch and rolls back all rehearsal changes. Operational rollback stays read-only and never reopens legacy RPCs.
- Two clean 20-Migration rebuilds, 14 SQL suites, Service 57, Services 180 and Database/Repository 142 pass. Idempotency, mismatch, expected-state Conflict, concurrency, Audit/Ledger rollback, elevated zero-write, final Super Admin and P0 Site Copy remain intact.
- No UI/Action/Service/Repository/Domain/Auth change, Commit, Push/PR, remote apply/SQL/write, login, Unpause or Deployment occurred. Admin Production remains `paused=true`; P1-04B and P1.1 were not started.

## Admin P1-03 Read-only Access UI（2026-08-19）

- 从已验收 P1-02G Commit `370d7b0541a51ed63dd4076e4d912b2309c9d072` 建立独立 P1-03 Worktree/Branch；不回退基线，不修改其他 P1 或受保护 release 工作区。
- 将 Admin `/access` 从旧 mutation 表单替换为只读目录、Search、Detail、active Role Grant、expected-state/protection flags 与治理 Audit 展示；响应式复用现有 Admin shell/styles。
- 新 server facade 只向页面暴露 P1-02F `searchSubjects/getSubjectDetail/listSubjectAudit`；初始 Search 先完成 auth gate，Detail 成功后才读取 Audit，每次 Service 调用均重新检查 verified Session、active Membership、live Admin/Super Admin 与 `admin:operate`。
- 页面无 direct table/RPC、provider error、`user_metadata`/JWT role auth 或业务逻辑复制；Repository 继续 unknown → strict Domain parser。Search/Audit/Detail 原 RPC 与最小字段合同不变。
- Loading/loaded/subject-empty/Audit-empty/unauthorized/safe read error/deferred capability 状态完整；stable cursor 仅做 URL-safe transport，仍由 Domain parser 校验，非法/超长输入 fail closed。
- 页面只含一个 GET Search 与链接；不引用旧 `access/actions.ts`，不调用三项 write Service，不包含 reason/requestId/Review/confirm/result 或 disabled mutation UI。旧 Action 文件与 RPC ACL 均未修改。
- P1-03 16、Admin 70、Service 57、Services 180、Database 138 测试通过；Admin production build、全工作区 TypeScript/ESLint 与本地匿名 `/access` → sign-in redirect smoke 通过。普通 write ACL 仍为 0/12，P1-04/P1.1 未开始。
- 未 Commit/Push/PR、Migration/RPC/RLS/Grant/Auth、远程数据库、Production login、Unpause 或 Deployment；Admin Production 仍 `paused=true`，Web Admin 入口关闭，P0 Production Site Copy 仍 Version 7。

## Admin P1-02G Backend Closure and UI Handoff（2026-08-18）

- 从 P1-02F Closure Commit `edd78c190002340eaa2091860e5eb997785b7528` 建立独立 P1-02G Worktree/Branch；P1-00–F 与受保护 release 工作区未修改。
- clean local reset 依序应用全部 19 个 Migration；P1-02A/B/C、Identity、P0 Site Copy 与两个并发 suite 等 13 个 SQL suite 全部通过。Database lint 无 error（仅两个既有 P0 cast warning），security advisor 无 issue。
- 最终 Catalog 保持 Search/Audit stable invoker、Detail 严格只读 stable definer；三个 read 仅向 authenticated 开放准确签名。三个 ordinary write 的 12 项应用角色 ACL 全部 false；private helper/executor deny、RLS、private schema 非暴露、Ledger/Audit 不可变和最后 active Super Admin guard 不变。
- Saved/Unchanged/Conflict、same-request replay、mismatch、同/异 request 并发、Audit/Ledger 原子回滚与 elevated-target 零写入回归通过；旧 RPC execute 不变且未 cutover。
- Domain 53、Repository 24、Service 57、Services 180、Database 138 测试与全工作区 TypeScript/ESLint 通过。Domain → strict Repository → live-access Service 继续保持 provider-neutral、strict unknown parsing、错误清洗、mutation no-retry 和单次 live-access/Port 边界。
- P1-03 handoff 仅允许 `/access` read UI 与三个读取 Service，不开放写 RPC、不显示写控件、不启用 Web Admin 入口。P1-04 handoff 只冻结 ordinary Membership/Author Role Review/Action/result 与原子 cutover；两者均未授权实施。
- ADR-022 Option 3 与 KI-033 未解决边界不变；elevated mutations 继续延期。P1.1 Elevated Access Governance 与邀请管理分别等待未来 Product Owner 明确授权，不得互相隐式扩围。
- P1-02G 仅六份 docs，未 Commit/Push/PR、远程数据库操作、UI wiring、execute 开放、cutover、登录/Unpause/Deployment；Admin Production 仍 `paused=true`，P0 Production 权威记录仍 Version 7。

## Admin P1-02F Live-Access Governance Service（2026-08-18）

- 从 P1-02E Closure Commit `cadb81053720a2e1885abe3e6f63a1b5196a64e1` 建立独立 P1-02F Worktree/Branch；P1-02E 与受保护 release 工作区未修改。
- `@fandom-harbor/services` 新增六用例 Governance Service、fake Port 测试和最小 export；只依赖 P1-02D Ports 与 injected live-access checker，无具体 Repository/provider/framework 依赖。
- 每个用例先解析调用者输入，再精确取得一次 fresh Trusted Access Context；只有 active Admin/Super Admin 可调用 Port，Guest/Reader/Author/inactive Admin 均零 Port。
- 三个普通 mutation 先读取 target detail 做 elevated precheck，再最多调用一次对应 write Port；数据库继续负责最终分类、并发和权限。不存在 elevated mutation method 或 KI-033 placeholder。
- requestId、target、expected-state、normalized reason 与 Saved/Unchanged/Conflict 保持；Conflict 不抛错/覆盖/重放，Service 不生成 requestId、token、Audit/Ledger 或 retry mutation。
- Domain Error 原样保留；unknown checker/Port failure 清洗为固定 `UNKNOWN_REPOSITORY_ERROR`，无 raw message/cause/payload/provider metadata。
- P1-02C write execute 继续对 `PUBLIC/anon/authenticated/service_role` closed；未 Commit/Push/PR，未开始 P1-02G，未执行远程操作、UI wiring、登录/Unpause/Deployment；Admin Production 仍 `paused=true`，P0 Site Copy 仍 Version 7。

## Admin P1-02E Strict Repository（2026-08-18）

- 从 P1-02D Closure Commit `ca300c234db6b4c9312dcc0e8b35c09b29b6f1f3` 建立独立 P1-02E Worktree/Branch；P1-02D 与受保护 release 工作区未修改。
- `@fandom-harbor/database` 新增严格 Governance Repository，实现 P1-02D 三读三写 Port，只调用 P1-02B/C 六个冻结 RPC；无 direct table、private helper 或旧 RPC fallback。
- 所有 provider result 保持 unknown，经过 exact-key Domain parser；null/extra/malformed/未知 enum/result、响应 ID 不一致与超限 page 均 fail closed 为 `DATA_CORRUPTION`。
- 错误只按 stable code 与 `REQUEST_ID_MISMATCH` / `ELEVATED_MUTATION_DEFERRED` safe detail 映射，raw message/hint/details/object 不进入 Domain。
- 当前官方 Supabase 合同说明 `.rpc()` 具备默认 retry 能力；三个 mutation builder 均逐请求显式关闭 retry，Repository 不自动重放不确定写入。
- P1-02C write execute 继续对 `PUBLIC/anon/authenticated/service_role` closed；本阶段不声称 authenticated mutation success，也不修改 Migration/RPC/RLS/Grant。
- 未 Commit/Push/PR，未开始 P1-02F，未执行远程 SQL/Migration/QA、登录/Unpause/Deployment；Admin Production 仍 `paused=true`，P0 Site Copy 仍 Version 7。

## Admin P1-02D Provider-Neutral Identity Access Domain（2026-08-17）

- 唯一父基线为 `0e1de6247a76b6e2bf94b050ce63a3b8fe80ba35`；独立 Worktree/Branch 为 `FandomHarbor-Admin-P1-02D` / `codex/admin-p1-02d-domain`。
- `@fandom-harbor/services` 新增 strict provider-neutral governance Domain：User/request ID、opaque expected-state、NFKC search、NFC reason、1–50 limit、两个稳定 cursor、Subject/Detail/Audit read models 与六方法 Port。
- 写入类型只包含 Grant Author、Revoke Author、Set ordinary Membership；Role Command 没有 role，Membership 不接受 pending；exact-key parser 拒绝 Admin/Super Admin/proof/actor/capability 注入。
- Mutation result 为可穷尽 Saved/Unchanged/Conflict；Conflict 保留数据库 current snapshot/token；安全错误使用固定 code/message，不接收或泄漏 provider error、SQLSTATE、Token、Cookie、Session 或 metadata。
- Domain 源码无 Supabase/PostgREST/Next.js/React/env/database import，不实现 Repository、Service、Action 或 UI；P1-02C execute、旧 RPC、P1-02B read、RLS/Grant、P0 与 Admin pause 不变。
- 定向 Domain 53 项、Services 10 files / 123 tests、Database 13 files / 114 tests 与 P1-02A/B/C/P0 7 个 SQL suites 全部通过；TypeScript、ESLint、Prettier、架构与静态门禁通过。
- P1-02D 未 Commit/Push/PR，未开始 P1-02E，未修改数据库/依赖/配置/lockfile，未执行远程操作、登录/Unpause/Deployment；Admin Production 仍 `paused=true`，P0 Site Copy 仍 Version 7。

## Admin P1-02C Ordinary Governance Write Definitions（2026-08-17）

- 唯一父基线为 `64bba75360e9f303819c42d1c08a2d6ec545983d`；独立 Worktree/Branch 为 `FandomHarbor-Admin-P1-02C` / `codex/admin-p1-02c-write-rpcs`。
- CLI 创建本地 Migration `20260817125140_admin_p1_identity_access_writes.sql`，定义 Author Grant/Revoke 与 ordinary Membership 三个 narrow v2 RPC；均为 postgres-owned volatile definer、空 search path、无重载，全部应用角色 execute deny。
- owner-only private executor 使用 requestId lock → replay/mismatch → global governance lock → legacy final-Super-Admin lock → target row locks → elevated deny → P1-02A state token → Saved/Unchanged/Conflict；不复制 fingerprint/expected-state 算法。
- Saved 精确一次 business/Audit/Ledger；Unchanged/Conflict 零 Audit；same payload replay 原结果，actor/target/operation/payload mismatch 稳定拒绝；Audit/Ledger 强制失败均证明全事务回滚。
- dblink 双连接证明同 request exactly-once、不同 request 同 target 串行 Saved + Conflict，并完整清理合成数据；P1-02A/B、旧 RPC、RLS/Grant 与 P0 Site Copy 不变。
- 本地验证通过 19-Migration clean reset、13 个 SQL suites、13 files / 114 Vitest tests、TypeScript、ESLint、database lint/security advisor；未 Commit/Push/PR、远程 Migration/SQL/写入、开放 execute、cutover、登录/Unpause/Deployment或开始 P1-02D。
- Admin Production 仍 `paused=true`，P0 Site Copy 仍 Version 7；ADR-022 Option 3、KI-033 `ACCEPTED DEFERRED BOUNDARY` 与 elevated mutation 延期不变。

## Admin P1-02B Identity Access Read RPC Implementation（2026-08-17）

- 唯一父基线为 `fc41ad153c75a326f76ca66c5219a889eb99a84e`；独立 Worktree/Branch 为 `FandomHarbor-Admin-P1-02B` / `codex/admin-p1-02b-read-rpcs`。
- CLI 创建本地 Migration `20260817121610_admin_p1_identity_access_reads.sql`：Search/Audit 为 stable invoker，Detail 为 ADR-023 唯一 stable definer read boundary；三者无重载、空 search path、authenticated-only execute。
- Search 支持 NFKC/case registration-name、full UUID、1–50 tuple keyset；Detail 在 target lookup 前 live-authorize caller 并调用既有 snapshot/token helper；Audit 仅返回 target Membership/Role 治理摘要。
- private helper execute deny、底层表 Grant/RLS、旧 RPC execute、单一 token 算法、Ledger/Audit immutability、ADR-022 Option 3、KI-033 与 elevated mutation 延期均不变。
- 本地验证通过 18-Migration clean reset、11 个 SQL suites、13 files / 108 Vitest tests、TypeScript、ESLint、database lint/security advisor、权限矩阵、target non-disclosure 和全事实零写入 snapshot。
- 未 Commit/Push/PR，未执行远程 Migration/SQL/写入，不登录/Unpause/Deployment，未开始 P1-02C；Admin Production 仍 `paused=true`，P0 Site Copy 仍 Version 7。

## Admin P1-02B Read Authority Contract Correction（2026-08-17）

- 唯一父基线为 `8f7ee546ab069c36658a1debdddbf64a7382133f`；独立 Worktree/Branch 为 `FandomHarbor-Admin-P1-02B` / `codex/admin-p1-02b-read-rpcs`。
- 一次性本地 rollback proof 证明：authenticated 对四张读取事实表具备 SELECT/RLS，但无法从 `SECURITY INVOKER` wrapper 调用已撤权的 P1-02A state-token helper。
- Product Owner 选择 ADR-023 最小混合权限：搜索/Audit 为 invoker；只有详情可为严格只读 definer，且必须先 live-authorize caller、再 lookup target、只调用现有 snapshot/token helper并保持零写入。
- private helper 对 `PUBLIC/anon/authenticated/service_role` 的 execute deny、底层表 Grant、单一 expected-state 算法、ADR-022 Option 3、KI-033 与 elevated mutation 延期均不变。
- 本次仅授权 docs-only 合同修正与本地 Commit；不授权 RPC/Migration 实现、P1-02C、SQL、远程写入、登录、Unpause 或 Deployment。Admin Production 仍 `paused=true`，P0 Site Copy 仍 Version 7。

## Admin P1-02A Private Ledger and Audit Immutability（2026-08-17）

- 唯一父基线为 `e3bb16c537d064808eeed8516b90ec3874b2ab26`；独立 Worktree/Branch 为 `FandomHarbor-Admin-P1-02A` / `codex/admin-p1-02a-private-ledger`。
- CLI 生成本地 Migration `20260817104616_admin_p1_identity_access_ledger.sql`，实现 `private.identity_access_request_ledger`、reason/expected-state/fingerprint 私有 helper、Ledger append-only 与全局 Audit UPDATE/DELETE guard。
- Ledger 仅接受 Author Grant/Revoke 与普通账户 Membership operation；RLS 开启、无 policy，应用角色无 table/function privilege，`private` 不在 Data API exposed schemas。
- 本 Step 未创建 read/write RPC，未改变旧 Membership/Role RPC execute，未实现 Repository/Service/Action/UI，也未触碰 KI-033 或 elevated mutation 延期边界。
- 本地验证通过 17-Migration clean reset、10 个 SQL suites、13 files / 102 Vitest tests、TypeScript、ESLint、database lint 与 security advisor；P0 Site Copy 和最后 active Super Admin 回归通过。
- 未 Commit/Push/PR，未执行远程 Migration/SQL/写入，不登录/Unpause/Deployment；Admin Production 仍 `paused=true`，P0 Site Copy 仍 Version 7。P1-02B–G 未授权。

## Admin P1-02 Implementation Plan and Engineering Gate Freeze（2026-08-17）

- 唯一父基线为 `37694f3550607e73d766471613357845a20fdc31`；独立 Worktree/Branch 为 `FandomHarbor-Admin-P1-02` / `codex/admin-p1-02-implementation-plan`。
- P1-02 规划分为 A–G：private ledger/Audit guard、read RPC、默认关闭执行权的 ordinary write RPC、Domain、Repository、Service、backend closure；每个 Step 均需 Product Owner 单独授权。
- 数据顺序固定为 private ledger 与不可变保护先行，再建 read RPC，再建只定义但不开放 authenticated execute 的 ordinary v2 write RPC；Domain/Repository/Service 后置，避免 UI 或 transport 反向定义数据库语义。
- P1-03 继续专属只读 Directory/Search/Detail/Audit UI；P1-04 继续专属 Review/confirm、Server Action、写入 UI 与旧 RPC 原子 cutover。P1-02 不修改 `/access` 页面或 Action。
- 旧 `grant_role/revoke_role/set_membership_state` 在新 P1-04 入口完成前不撤权；最终 cutover 必须在一个获准原子 Gate 中先关闭旧 execute、证明 deny，再开放三个窄 v2 RPC，禁止 old/new 双入口。
- ADR-022 Option 3 保持：Admin/Super Admin Role 和 elevated-account Membership 写入不进入实现；普通 Session、JWT `iat`、客户端 boolean、普通重复登录均不能替代 Reauth proof。
- 本规划仅修改文档，不创建产品代码/Migration，不执行 SQL/远程写入，不 Commit/Push/PR，不登录/Unpause/Deployment；Admin Production 仍 `paused=true`，P0 Site Copy 仍 Version 7。

## Admin P1-01 Data, Permission and Reauth Design（2026-08-17）

- 唯一基线为 `b634da010755e7768043eea41c426ad499a269fb`；独立 Worktree/Branch 为 `FandomHarbor-Admin-P1-01` / `codex/admin-p1-01-data-permission-design`。
- 读模型冻结为 active Admin/Super Admin 的精确注册名/完整 UUID 查询、1–50 keyset pagination、字段最小化详情和 target 治理 Audit；Guest/Reader/Author/inactive Admin fail closed。
- expected-state 由数据库对 Membership `state/updated_at` 和全部 active Role Grant `id/role/granted_at` 生成规范快照/SHA-256 token；所有 v2 写入在固定顺序全局治理事务锁内重算。
- P1 需要 `private.identity_access_request_ledger`，以 request UUID 主键保存 actor/target/operation、32-byte payload fingerprint、封闭结果快照和 Saved Audit 引用；不保存 password/完整 payload，不暴露 Data API，indefinite 保留。
- v2 结果为 `Saved | Unchanged | Conflict`；同 requestId/同 payload 原样 replay，同 ID 不同 payload 拒绝；只有 Saved 产生精确一次业务变化和一条 Audit。
- 旧 `grant_role/revoke_role/set_membership_state` 不能承载新合同；cutover 必须原子撤销 authenticated execute 再 grant v2，不存在可绕过的双入口兼容期。
- KI-033 技术结论仍未解决：现有 registration-name/password adapter 只能新建普通 `aal1` Session，不能向数据库证明与原 Admin Session/单次 Review payload 绑定的一次性 step-up。Product Owner 已选择 ADR-022 Option 3；当前 P1 状态为 `ACCEPTED DEFERRED BOUNDARY`，elevated mutations `DEFERRED`，普通治理 `AUTHORIZED FOR FUTURE P1-02 PLANNING`。
- 当前 P1 只允许 Author Role Grant/Revoke 与普通账户 Membership 状态治理；elevated 账户只读，任何 Admin/Super Admin Role 写入、elevated-account Membership 写入、旧 RPC/隐藏入口/客户端直写均禁止。未来重新开放必须独立授权并建立新 Auth ADR，优先评估 Supabase MFA/AAL2。
- 本 Mission 未 Commit/Push/PR，未创建 Migration，未执行 SQL/远程写入/登录/Unpause/Deployment；Admin Production 仍 `paused=true`，P0 Site Copy 仍 Version 7。

## Admin P1-00 Scope Freeze（2026-08-16）

- Product Owner 批准 Admin P1 为 Identity & Access Governance Console，Membership 与 Role Grant 同时纳入；不新增 role、capability 或第二套权限模型。
- 所有写操作要求规范化原因与二阶段 Review/confirm；Admin/Super Admin grant/revoke 和 elevated-account Membership 变更还要求当前 actor 单次 registration-name/password reauth。
- P1 暂不采用双人审批并接受当前残余风险；最后一个有效 Super Admin 防护、普通 Admin 权限限制、server + database 双层授权继续强制。
- P1 Mutation 目标合同为 UUID requestId、expected-state、`Saved | Unchanged | Conflict`、相同 payload replay、stale Conflict、Saved 单一 Audit 与旧写入口不可绕过。
- 邀请管理延期；Web Admin 入口保持关闭；远程写入 QA 只允许专用非 Production Supabase；Admin Production 保持 `paused=true`。
- 当前用户没有可投递 email/phone，Supabase nonce `reauthenticate()` 不能直接作为 Admin step-up；P1-01 必须先验证既有 registration-name/password adapter 能否提供 server-verifiable 单次 proof，不能则升级 Auth 决策。
- P1-00 只完成文档冻结与漂移修正。P1-01 未授权；未修改产品代码、Migration、RLS、RPC、Auth、dependency、lockfile、Supabase、Vercel 或 Production。

## Admin P0 Production Release Closure（2026-08-15）

- Web Production 已固定为 `dpl_AQ2cmyYP54rXjpLDn9oi2xvBZ5mM` / Source `d2c31d231abe971a7266094adfc0966d6de49fa9`，Production Smoke PASS，既有 Alias 保持不变。
- Admin Production 的唯一获准来源是 accepted Preview `dpl_3ayj6Rg8Y9qTk3xJ9Ef8ezn7XNHC`；官方 Preview Promotion 创建 `dpl_FfoexkkfWCk1wb8ZkJcDsbQdF5z7`，Source 精确为 `5463032a2aa5d98c8299c8d6e3dfeaae60818042`。
- Admin Production Smoke 只允许登录、读取、单字段 Review Without Save、权限边界和 `/access` 验收；本次未执行 Save，最终 Version 7、Revision/Audit 7/7、Audit ID 81、Pointer 与原始八字段保持不变，Version 8 不存在。
- Admin Project 发布后必须重新 Pause。本次 Unpause 窗口约 28 分 04 秒，`2026-08-15T07:52:22Z` 确认 `paused=true` 后才清理 Guard；Production Branch 始终为 `admin-production-disabled`。
- 旧式 Unpause 请求的 HTTP 400 与 Preview 直接切流端点的 HTTP 422 都是零状态变更的接口校正，不得解释为 Deployment、Alias 或 Project 状态变化；最终只使用一次官方 Preview Promotion。
- 上一稳定 Admin Production `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` 保留为直接回滚基线。本次无 P0/P1 问题，未执行 Rollback。
- Web 与 Admin Release 保持 Project 隔离；Admin Promotion 未改变 Web Production。Release Closure 只允许 docs-only 本地 Commit，不得 Push。

## Admin P0 QA-01 Remote Supabase and Browser Acceptance（2026-07-31）

- QA-01 安全目标固定为 Supabase Project `fandom-harbor` / `szfhngifsipsrxcpekti` / `ap-southeast-1`；Admin 与 Web 本地进程必须使用同一远程 URL 与 publishable key，浏览器进程禁止 Service Role Key。
- 远程变更前必须先创建仓库外新鲜逻辑导出、验证 public/auth/storage 与 hash，并确认 dry-run 只含已验收 DB-01 Foundation 和 DATA-01 Baseline；本次最终 Migration 历史为 16/16。
- 真实浏览器保存链路已证明 Review → Saved Version 2 → 新请求读取；无变化返回 Unchanged 且零 Audit；旧 Version 1 会话返回 Conflict、保留八字段/reason、不覆盖也不自动重试。
- request ID 的远程重试返回原 Version/Revision/Audit；同 ID 不同规范化 reason 返回 `INVALID_INPUT`。两次检查前后 Revision/Audit/Pointer 计数完全一致。
- Web 只渲染八字段 content；CTA `/archive`、`/search`，导航 Archive → Search → Studio 与 capability，Footer 三条法务链接继续由代码拥有。Guest 不显示 Studio，直接 `/studio` 进入既有登录边界。
- QA 临时内容必须通过同一 Admin Review/Save 恢复，不直接移动 Pointer 或删除 Audit。本次恢复后为 Version 3，八字段与 Version 1 逐字一致；两条 QA update Revision/Audit 作为真实审计证据永久保留。
- Profile、Membership、Role、作品、章节、文章、邀请和 Storage 均无 QA 污染；总 Audit 仅增加 DATA-01 初始化、QA 保存和 QA 恢复三条 Site Copy 事件。
- Fallback 不在远程故障注入；继续以 WEB-01 隔离自动化证明字段级/全量回退，并只在真实浏览器证明正常远程读取不造成 500。
- 正式 Web 未部署，Admin Production 保持 Paused；不得将 QA-01 本地验证解释为 Preview、Production、Push、PR 或 Admin 恢复授权。
- 2026-08-03 现有 Reader 完成人工登录；真实浏览器直接访问 `/studio` 后最终 URL 精确为 `/archive`，且不存在 Studio 工作台。QA-01 最后一项身份浏览器检查通过。

## Admin P0 WEB-01 Public Site Copy Consumption（2026-07-31）

- Web 公开文案链路固定为 `Server Component → request-shared Public Site Copy reader → accepted Public Service → accepted Public Repository → get_public_site_copy`；Web 不重写验证、Fallback 或 bigint transport。
- Exact Eight Fields 只映射 Homepage 主标题/介绍/两个 CTA label、Archive/Search/Studio label 和 Footer Brand Note。CTA 路径、导航路径/顺序/数量/显隐、Studio capability 与 Footer 法务链接不进入数据库驱动配置。
- Root Layout 与 Homepage 复用同一个 React request cache Snapshot，避免一次渲染内 Header、Hero、Footer 重复 RPC 或版本不一致；没有跨请求缓存、TTL、webhook 或部署钩子。
- 每个新的完整动态 Web 请求读取最新 Current Pointer。已打开页面不实时更新；读取失败由 Public Service 返回安全 Baseline，不触发 Site Copy 导致的公开页面 500。
- Public 页面只消费八字段 content，不输出 `version`，也没有 Revision/Audit/actor/reason/time；任何 Client Component 均不得导入 Site Copy Repository、RPC 或 Supabase transport。
- WEB-01 不修改 Admin Read/Review/Save/Conflict、Migration/RPC/RLS/Auth/Role/Membership/capability、依赖或 Admin Production Paused 状态。

## Admin P0 ADMIN-02 Review, Save and Conflict（2026-07-31）

- Admin Site Copy 保存链路固定为 `strict Admin Read → exact eight-field edit → normalized Review → Server Action trusted access check → accepted Domain Save → Repository → save_site_copy`。
- apps/admin 不重写 Role/Membership/capability 真相或数据库保存合同；Server Action 复用 `requireSiteCopyAdmin`，Domain Service 和 RPC 继续独立复核。
- 客户端只持有十进制 Version、Revision UUID、八字段 draft、reason 与单次 Review request UUID；不得将 bigint 转成 JavaScript number，不得接触 Supabase/RPC transport。
- 新 Review 生成新 request ID；同一 review 的失败重试复用原 ID。返回编辑、修改内容/reason/base 后再 Review 必须使用新 ID。pending 与同步 lock 防重复提交。
- Saved 的数据库 Version/Revision 成为继续编辑的新本地基线；Unchanged 不存在 Audit ID；Conflict 不改本地基线、不自动覆盖/重试，保留输入并要求确认后重新读取。
- Error 只显示稳定 Domain code 与安全文案，保留输入；不得泄漏 SQL、hint、PostgREST、Token 或内部 metadata。
- Exact Eight Fields 之外的 CTA path、导航 path/order/count/visibility、Studio capability 和 Footer 法务链接永远不进入 App save input。
- Web 在 ADMIN-02 后仍使用编译期 Baseline；Migration/RPC/Auth/RLS/Role/Membership/capability 与 Admin Production Paused 均未改变。

## Admin P0 ADMIN-01 Read-only Admin Surface（2026-07-30）

- Admin 根页面是 P0 Site Copy 的只读入口，展示当前数据库 Version 与 Homepage 4 项、Navigation 3 项、Footer 1 项；不得在 ADMIN-01 增加第九字段、动态字段、编辑、保存或发布。
- App 通过 `loadAdminHomeData → createAdminSiteCopyService → createSupabaseAdminSiteCopyRepository → get_admin_site_copy` 读取；权限上下文来自现有 Identity/Access 边界，Repository 调用前要求 `admin:operate`。
- 数据库 Snapshot 严格失败，不使用 Baseline 掩盖 Admin 数据损坏；现有根级 Error Boundary 负责受控失败界面。
- Version 保持 Domain `bigint` 并直接以十进制字符串展示，不经过 JavaScript number。
- `/access`、最后一个 Super Admin 保护、Web、Migration/RPC、Auth/Role/Membership/capability 与 packages/ui 保持不变；Admin Production 继续 Paused。

## Admin P0 DOMAIN-01 Service and Repository Contracts（2026-07-30）

- Site Copy Domain 固定为八个显式字段，不允许 index signature、动态 Record、额外/缺失字段或未知属性透传；Version 1 Baseline 与 DATA-01 逐字一致。
- 字段与 reason 在 Service 边界执行 NFC、数据库一致的边界空格移除、Unicode code point 长度与控制字符/换行拒绝；reason 最终为 4–200。
- Public Read 对文案逐字段验证并独立回退；无记录、RPC 不可用或整体 transport 损坏时返回全量 Baseline 与 `version=null`，不伪造 Revision/Audit/actor/time。
- Admin Read/Save 在 Repository 前复用既有 `admin:operate` capability；Admin/Super Admin allow，Reader/Author/anon/suspended/revoked deny。Admin 响应严格解析且不回退。
- `version`、`baseVersion`、`auditLogId` 的 Domain 类型为 bigint。入站只允许安全整数 number 或规范十进制 string；出站 `baseVersion` 直接 `toString(10)`，禁止不安全 number 恢复。
- Repository 使用结构化 SQLSTATE/PostgREST code 映射稳定 Domain Error，Supabase Client、PostgREST Error、RPC transport union 与 generated Row 不越过边界。
- DOMAIN-01 结束边界为合同可调用但 Admin UI/Web 未接入；三个既有 Commit、Migration/RPC、远程 Supabase、Push/PR/Deployment 与 Admin Production Paused 状态保持不变。

## Admin P0 DATA-01 Site Copy Baseline Initialization（2026-07-30）

- DATA-01 与 DB-01 Schema 分离，通过独立 owner-only Migration 原子创建 Version 1：一条 `site_copy.initialized` Audit（actor `null`）、一条严格八字段完整 Revision 和一个 global Current Pointer。
- 基线值逐项来自当前 Web 实际渲染来源：Homepage 的标题、介绍、两个 CTA，global shell 的 Archive/Search/Studio 标签，以及 `ReaderLayout` 的 Footer 品牌说明。
- 初始化复用 DB-01 文本 helper 和 global advisory lock；任何已有 site-copy State、Revision 或相关 Audit 都返回稳定 `SITE_COPY_ALREADY_INITIALIZED`，不做 Last Write Wins、修补或覆盖。
- 初始化不通过 Admin `save_site_copy`，nil UUID 只作为系统 Version 1 request marker，普通 Admin 继续使用 v4 request ID 与既有幂等合同。
- SQL 验证覆盖精确值、public projection、actor-null Audit/八字段 metadata、重复与残缺状态拒绝、强制失败原子回滚、权限矩阵、Version/Conflict/并发和 Identity/Access 回归。
- DATA-01 不修改 Admin/Web、Auth/capability、`/access`、远程 Supabase 或部署；DB-01 与 DB-01A Commit 保持不变。

## Admin P0 DB-01A Change Reason Contract Alignment（2026-07-30）

- Product Owner 要求将普通 Admin `save_site_copy` 的 change reason 合同从错误的 1–500 修正为冻结的 4–200。
- 最终数据库语义为 NFC → trim → Unicode code point 计数 4–200，并拒绝控制字符和换行；该限制在 RPC 内直接执行。
- Audit 保存规范化 reason，request ID 幂等比较同样使用规范化 reason；规范化等价输入返回原结果，规范化后不同则返回稳定 `INVALID_INPUT`。
- SQL 自动化覆盖 3/4/200/201、trim、NFC、控制字符、换行、非法输入零写入、Audit reason、幂等、Conflict、原子回滚和双连接并发。
- DB-01 Foundation Commit `651228c0d6c76bbba92339103bafdf9090f331b9` 必须保持不变；DB-01A 形成其后的独立本地修正 Commit。
- DATA-01、正式 Baseline、Admin/Web、远程 Supabase、Push 和 Deployment 仍未授权。

## Admin P0 DB-01 Schema and Security Foundation（2026-07-30）

- DB-01 在独立 `feature/admin-p0-site-copy-db-01` 分支实现，只包含 Migration、SQL 测试和获准数据库状态文档。
- 数据合同固定为 Current Pointer + immutable full Revision；Revision 只有八个可编辑文案列，不能存储导航路径/顺序/显隐、Studio capability、CTA target 或 Footer 法务链接。
- `save_site_copy` 的并发顺序固定为 global advisory transaction lock、`site_copy_state` row lock、锁内 request ID 复核；相同请求返回原结果，不同 payload 稳定返回 `INVALID_INPUT`，stale base 返回无副作用 conflict。
- 每次成功变更在同一事务写入一条 `site_copy.updated` Audit、一条完整 Revision 并移动 Pointer；Audit metadata 只含变化字段。失败和 conflict 不允许部分写入。
- `get_public_site_copy` 只返回八字段和版本；Admin Read/Save 仅允许既有 active Admin / Super Admin。Reader、Author、suspended/revoked Admin 与所有直接表访问均拒绝。
- 文本语义固定为 NFC 归一化、首尾空白移除、按 Unicode code point 计数并拒绝控制字符；数据库约束与 RPC 使用同一 helper。
- DB-01 不创建正式 Version 1。`site_copy.initialized`、actor null 的 Baseline 留给单独 DATA-01。
- 本地 Migration clean rebuild、existing upgrade、事务 SQL 和真实双连接同 Base concurrency 验证通过；远程数据库、Admin/Web、Auth、`/access`、Push 和 Deployment 未执行。

## V1.0.2 Final Release Closure（2026-07-29）

- V1.0.2 已正式发布：Release Status=`RELEASED`，Production Deployment=`COMPLETE`，Product Owner Final Acceptance=`PASS`，Production Functional Smoke=`PASS`，Final Release Closure=`CLOSED`。
- Release Commit 为 `9ede1c6813e658ea8d7197c74a6ab2703cd0b528`；Web Production Deployment 为 `dpl_GxM3T6HKB7dyyU9fYmXdpmqWpi74`，状态 READY，正式域名 `https://www.fandomharbor.com/` 已更新。
- 最终范围包括邀请码默认隐藏与独立显示/恢复、密码与邀请码独立状态、11 位 Base62 安全随机邀请码、最多 5 次结构化 `23505` 冲突重试、NULL 结果防御、非冲突不重试及旧邀请码兼容。
- Lint、TypeScript、193 / 193 tests、Web / Admin / Docs builds 与 Matrix A / B / C / D 全部 PASS。
- Product Owner Local Preview、Online Preview 与 Production Functional Smoke 全部 PASS；Production 功能验收包含 UI、键盘、响应式、主题、Console、Author 邀请码、Reader 注册/登录/阅读/权限与邀请码耗尽检查，发现问题为无。
- Admin Production Branch 为 `admin-production-disabled`，Frozen Commit 为 `e137c31f260d761fc2fdd6ebd9f7f0e30cf5630a`；V1.0.2 `main` Push 仅产生 Admin Preview。
- Admin Production 未更新，仍为 `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs`；公开 Alias 暂时仍公开，Product Owner 已接受该独立残余风险。
- 最终 Supabase Migration=`NONE`；无远程 Schema、Auth、RLS、RPC、环境变量或数据库结构修改。
- Unresolved V1.0.2 Blocker=`NONE`；唯一 Closure 权威记录为 `docs/19_Release/V1.0.2-RELEASE-CLOSURE.md`。
- 本记录不代表 Admin 已发布、私有化或退休，也不授权启动后续版本开发。

## V1.0.2 双向邀请码冲突兼容历史本地状态（2026-07-28，Superseded）

- V1.0.2 Invitation Visibility、11 位标准化与 Bidirectional Collision Compatibility 已在本地完成；Matrix A、B、C、D 全部 PASS。
- 最终数据库合同保留 V1.0.1 行为：`create_invitation` 成功返回非空 UUID，`code_hash` 唯一冲突抛出结构化 `23505`。旧应用不会收到 NULL 或显示幽灵邀请码。
- 未部署的 `20260727150707_standardize_invitation_code_collision_handling.sql` 已在新的修复 Commit 中删除；它唯一会把冲突改成 NULL，11 位生成不依赖 Schema 变化。最终 V1.0.2 Migration 集与 V1.0.1 相同。
- V1.0.2 Adapter 将 `23505`、`data=null` 和 `data={id:null}` 统一转换为 `InvitationCodeCollisionError`。Service 只重试该类型，最多 5 次；其他数据库错误立即以受控 `DatabaseAccessError` 结束。
- 每次重试生成新的 11 位 Base62 Secret 并重新计算 SHA-256；首次 / 两次冲突后成功、连续 5 次受控失败、第 6 次不调用、非 23505 只调用一次均有回归证据。
- 幽灵邀请码专项、成功审计、孤立记录、use_count 与 Secret/Hash 对应关系均 PASS；冲突不产生 invitation、成功审计或消费副作用。
- 新邀请码继续使用 `^[A-Za-z0-9]{11}$` 与 Web Crypto；Fixture 使用共享合同和 Node Crypto。旧长格式继续区分大小写，并按状态、过期、撤销和使用次数处理。
- 本地验证：14 / 14 Migrations、6 套 SQL、Fixture、QA credentials contract、Database lint 0 errors、format、lint、typecheck、193 / 193 tests 和三套 production builds 全部 PASS。
- UI 自动化回归继续覆盖邀请码默认隐藏、显示 / 恢复隐藏、密码与邀请码独立、`type="button"`、`aria-label`、`aria-pressed`、required、`autocomplete="off"`、18+、Invitation-only、政策链接、390px 与 Light / Dark。
- Secret Audit PASS；本轮未输出或提交 Project Ref、本地固定凭据、远程 URL / Key、真实邀请码或账号密码。
- 当前状态：`V1.0.2 BIDIRECTIONAL COLLISION COMPATIBILITY LOCAL COMPLETE`；未 Push、Deploy、Promote 或修改远程 Supabase。
- Vercel Preview / Production Supabase 拓扑与远程 Migration 历史仍等待 Product Owner 恢复只读审计能力；在完成前不得进入 Remote Migration、Preview 或 Production。

## V1.0.1 Password Visibility 本地就绪状态（2026-07-26）

- `/auth/sign-in` 与 `/auth/sign-up` 已在独立 V1.0.1 工作树完成密码显示/隐藏控件；默认隐藏，登录与注册分别独立控制。当前注册页没有确认密码字段，未创建新字段。
- 共享 `PasswordInput` 仅管理显示状态，使用现有 Lucide `Eye` / `EyeOff`、原生 `button type="button"`、动态中文 `aria-label`、`aria-pressed`、44×44 目标与明确焦点样式。
- 登录 `current-password`、注册 `new-password`、required / minLength、输入值保持及表单 Server Action 合同保持不变；邀请码、18+ 与三个政策链接无回退。
- 工程验证：frozen install、lint、typecheck、174 / 174 tests、targeted tests、Web / Admin / Docs production builds 全部 PASS。
- 本地浏览器验证：1280 / 390、Light / Dark、默认隐藏、显示/隐藏、值保持、登录错误状态、无横向溢出、44px、自动填充属性/布局与 console errors = 0 全部 PASS；键盘可达性由原生按钮语义、焦点顺序合同与组件测试覆盖。
- 当前状态：`LOCAL DEVELOPMENT COMPLETE / READY FOR PRODUCT OWNER LOCAL PREVIEW`；`Product Owner Local Preview Acceptance = PENDING`。
- 未 Push、Deploy、Redeploy 或 Promote；未修改 Vercel、Supabase、数据库、Auth、RLS、RPC、DNS、环境变量、dependency 或 lockfile。

## V1 Reader-only Beta 当前长期状态（2026-07-26 Final Closure）

- Release：`Fandom Harbor V1 Reader-only Invitation Beta`。
- Release Status=`RELEASED`；Production Ready=`YES FOR READER-ONLY INVITATION BETA`；Production Deployment=`COMPLETE`；Production Smoke=`PASS`；Product Owner Final Acceptance=`PASS`；Final Release Closure=`CLOSED`。
- `PDR-01 = CLOSED`；Closure basis 为 Owner policy decision complete、Public Policy V1.0 Production 部署、公开基础 Smoke PASS、Product Owner Reader Smoke PASS、正式域名正常及 Reader 权限/阅读链路通过。
- `PDR-02 = CLOSED FOR CURRENT RELEASE`；依据 2026-07-25 仓库外受控新鲜 Production 逻辑备份及已记录的恢复流程与责任。该状态不是永久关闭；PITR 仍未启用，也不声称 Supabase 已存在平台物理备份。
- 唯一政策规范来源：`docs/19_Release/V1-PUBLIC-POLICY-V1.0.md`；批准日期 2026-07-25，正式发布生效日期 2026-07-26。Draft 与旧政策仅为 Superseded / Legacy 历史。
- Production Deployment：`dpl_3dj8UwrQER7WukZYAk4rYmsbhwib`，Project=`fandom-harbor-web`，Environment=`Production`，Branch=`main`，Commit=`14f9af1c0b4fc440daab26fba9f2eb513f56142f`，Source=`GitHub Push`，Status=`READY`。
- 正式域名 `https://www.fandomharbor.com/` 正常；`https://fandomharbor.com` 308 跳转至 www。
- Product Owner Reader Smoke 已覆盖登录、Archive、作品详情、章节阅读、刷新、Reader `/studio` → `/archive`、草稿/后台隔离、退出登录权限恢复及 Console，全部 PASS；不保存任何 Reader 凭据或身份信息。
- Legal Review=`NOT COMPLETED`；Owner Risk Acceptance=`ACCEPTED FOR LIMITED INVITATION-ONLY READER BETA`。不得解释为法律批准、合规认证或完整法律许可。
- 当前 Release 仅为有限、邀请制、Reader-only Beta；不含 Author Production Beta、Admin Production、开放注册、公众大规模发布、社交/评论/推荐/排名、图片正文、PITR 或无限规模承诺。
- Admin Preview 独立跟踪且不阻挡 Reader-only Beta；Author 工程基础不等于 Author Production Beta 已发布。
- 下一阶段：V1.0.1 Password Visibility（登录/注册密码显示隐藏按钮与最小回归）；随后为首批 3–5 名受控 Reader Beta、P0/P1 收集、Header/Global Shell、About、Author 章节与发布体验、11 位随机邀请码、Author Production Smoke、Site Settings/Admin。
- 以下记录为按日期保留的历史时间线；其中 Pending、Blocked、Deployment Not Run 或 Deployment Authorized=NO 仅代表当时状态，已被本节 Final Closure 取代。

- 2026-07-14：V1 GitHub Baseline secret audit 在未跟踪的 `docs/18_Design/UX-06D-STEP02_ACCEPTANCE.md` 第 86–87 行发现两条 localhost-only QA 密码。立即停止 commit / push / Vercel 流程，将明文替换为安全凭据命令说明并再次轮换 QA 凭据。确认该文件未跟踪，实际密码模式未进入 HEAD 或 Git 历史；处置后 OpenAI / GitHub / Vercel / Supabase / JWT / private key / database URL / service role / Auth secret / QA password 复扫无匹配。依据 Mission 强制暂停点，等待 Product Owner 确认后才能重新进入 Release Baseline 门禁。

- 2026-07-14：执行 V1 Release Deployment 部署前检查。Node 24.18.0 / pnpm 11.7.0、offline frozen install、Supabase linked remote Migration 14 / 14、`pnpm validate`、169 tests、Web / Admin / Docs production builds、`git diff --check`、Local QA Fixture 与 Guest / Reader / Author Smoke 全部通过；Reader `/studio` 仍到 `/archive`，Author 可进入 Studio，Published-only / Draft isolation 无回退。当前 `main` 超前 `origin/main` 4 commits，但 UX-06 已验收实现仍在未提交工作区；仓库没有 Vercel Project 关联，CLI / Dashboard 无法完成核对，线上变量与 URL 未确认。因此 V1 Deployment Ready for Product Owner Review = NO，部署类型 Local only，Product P0 / P1 = 0 / 0，Release Gate P1 = 2。未执行 Preview / Production、远程 SQL、环境变量写入、DNS 或数据变更。新增中文 Deployment、Smoke、User Guide 与 Admin Guide；Admin 授权现状为已支持 Super Admin 通过 `/access` 受控 UI 授予 / 撤销 Admin，并写 audit log。

- 2026-07-14：Product Owner 最终验收 UX-06J。UX-06J = PASS；Release UI Sweep / V1 UI Consistency = Accepted；Product Owner Acceptance = PASS；P0 = 0、P1 = 0。确认 V1 主路径 UI 审计、三个低风险 P2 修复、UX-06H / UX-06I 无回退、Guest / Reader / Author / Admin 边界、1280 / 390、Light / Dark、零溢出与全部工程验证通过。确认未修改 Database、Supabase、Migration、RLS、RPC、Auth logic、Role、Published-only、Draft isolation、Reader preferences、theme persistence 或 dependency。移动端当前路由高亮、Root Loading / Error 共享架构边界与极端长连续文本 Fixture coverage 保留为非阻塞后续项。UX-06J 已关闭，停止在当前状态，等待 Product Owner 下一条明确指令。

- 2026-07-14：完成 UX-06J Release UI Sweep / V1 UI Consistency。审计 Homepage、Archive、Search、Work Detail、Published Reading、Author Profile、Studio Entry / Overview 与 Auth；1280 / 390、Light / Dark、44px、零溢出、Guest / Reader / Author、Reader Studio denial 与 browser console 0 通过。关闭三个 P2：Studio Mobile 内部导航由纵向收敛为三列，aside 高度约 262px 降至约 166px；Studio 四个入口提升到 44px；Auth `Phase 1 · Identity` 改为中文 Reader-facing 标签且登录 / 注册互链提升到 44px。未修改 Homepage、Global Shell、Auth logic、Permission、Role、Published-only、Database、Supabase、Migration、RLS、RPC 或业务逻辑。Web 81 / 81 tests、完整 `pnpm validate`、169 / 169 tests 与全部 production builds 通过。P0 = 0、P1 = 0；Release UI Sweep Ready for Product Owner Review = YES，等待验收，不进入下一项任务。

- 2026-07-14：Product Owner 正式验收 UX-06I。UX-06I = PASS；Global Shell / Navigation = Accepted；Product Owner Acceptance = PASS；P0 = 0、P1 = 0。确认桌面三分区、Guest / Reader / Author 导航、Reader Studio denial、Author Studio access、主要页面回归与所有工程验证通过；确认未改变 Database、RLS、RPC、Migration、Auth 或 Published-only。接受移动端原生 `details` 作为 V1 安全最小实现；当前路由高亮保留为非阻塞后续优化项。UX-06I 已关闭，不进入下一项 UX 任务，等待 Product Owner 下一条明确指令。

- 2026-07-14：完成 UX-06I 全局壳层与导航。桌面端继续使用左侧 Fandom Harbor、中间 Archive / Search / capability-gated Studio、右侧主题与账号的三分区结构；767px 以下新增默认收起、正常文档流内展开的“浏览站点”导航，Desktop / Mobile 复用同一导航数据源。将角色导航推导提取为纯函数并新增 2 个测试；右侧增加“显示与账号”组语义。Guest / Reader 不显示 Studio，Reader 直访 `/studio` 回到 `/archive`，Author 显示并可进入 Studio。Homepage、Archive、Search、Work Detail、Reading、Author Profile、Studio、390 / 1280、Light / Dark、44px、零溢出与 browser console 0 通过。未修改 Auth、Permission、Role、Published-only、Draft isolation、Database、Supabase、Migration、RLS、RPC 或页面产品逻辑。完整 `pnpm validate`、169 / 169 tests 与全部 production builds 通过。Global Shell / Navigation Ready for Product Owner Review = YES，等待验收，不进入下一项 UX 任务。

- 2026-07-14: Completed UX-06H Step04 Homepage Release Acceptance Slim against
  the frozen Step01–Step03 baseline. Step01 Audit Contract、Step02 Layout Upgrade
  and Step03 Slim QA are PASS. Homepage is finalized as the Quiet Editorial Harbor
  Entrance with Brand Orientation → Discovery Paths → Latest Published Works →
  Reader Return / Access → Quiet Recovery. Entry / role / Published-only / Draft
  isolation、1440 / 1280 / 768 / 390、Light / Dark、accessibility and browser console
  0 evidence are frozen for Release. Shared Header / Footer remain unchanged；Root
  Loading / Error stays Frozen；Auth / Permission / Invitation / login return and
  all data contracts remain unchanged. HP-AUDIT-007 remains Frozen；HP-QA-001
  remains a non-blocking Fixture enhancement；the stale chunked-cookie warning has
  no actual functional impact. P0 = 0、P1 = 0. Step04 changed documentation only；
  product implementation、data layer、shared architecture and remote Supabase were
  not changed. Web checks、full `pnpm validate`、167 / 167 tests、all production
  builds and diff checks pass. Homepage Ready for Release = YES，awaiting Product
  Owner Final Review，and no new UX Track is authorized.

- 2026-07-14: Completed UX-06H Step03 Homepage States & Responsive QA Slim under
  the Product Owner's UX closure slim mode. QA stayed within Step02's direct
  Homepage presentation impact: five-region rhythm、Archive / Search / Work /
  Sign-in / Sign-up / Reader Library / Access smoke、Guest / Reader / Author、
  Author shared Header Studio capability、Published-only and Draft Work / Chapter
  isolation all pass. 1440 / 1280 / 768 / 390、Light / Dark、44px targets、keyboard
  focus、semantics、zero overflow and browser console 0 pass. HP-AUDIT-007 remains
  Frozen；HP-QA-001 remains a non-blocking Fixture enhancement. The previously
  observed stale chunked-cookie warning was not reproduced in this fresh localhost
  run；login、logout、roles and isolation remain normal. P0 = 0、P1 = 0、Step02
  regression = 0，so no Allowed Fix was needed. Product implementation、data layer、
  shared architecture、Auth and remote Supabase were not changed. Web checks、full
  `pnpm validate`、167 / 167 tests、all production builds and diff checks pass.
  Homepage Ready for Step04 = YES，awaiting Product Owner review，and Step04 is not
  authorized.

- 2026-07-14: Completed UX-06H Step02 Homepage Layout Upgrade within the frozen
  Step01 contract. `/` now follows Brand Orientation → Discovery Paths → Latest
  Published Works → Reader Return / Access → Quiet Recovery. Hero keeps Archive
  primary and Search secondary；the static Reader Login and misleading `/author`
  entry are removed. Latest Works still use the existing Public Browse Gateway、
  newest order、three-item cap and `BrowseWork`，with one Work Detail main entry per
  item. Existing Sign-in、Sign-up、Access、Reader Library and recovery routes are
  clarified without changing Auth or Invitation behavior. Guest / Reader / Author、
  Published-only、Draft Work / Chapter isolation、1440 / 1280 / 768 / 390、Light /
  Dark、keyboard focus、44px targets、semantics、zero overflow and browser console 0
  pass. HP-AUDIT-001–006 / 008–009 are Closed；007 remains a frozen shared root
  state boundary；010 protection passes；HP-QA-001 is a non-blocking extreme-content
  Fixture enhancement. Product changes are limited to Homepage route-local React /
  CSS；data、Auth、Permission、Gateway、Service、Repository、query、Database、Supabase、
  RLS、RPC and Migration remain unchanged. Web checks、full `pnpm validate`、167 /
  167 tests、all production builds and diff checks pass. Homepage Layout Ready for
  Step03 = YES，awaiting Product Owner review，and Step03 is not authorized.

- 2026-07-14: Completed UX-06H Step01 Homepage UI Audit & Design Contract as a
  documentation-only Mission. Homepage is frozen as the Quiet Editorial Harbor
  Entrance with Brand Orientation → Discovery Paths → Latest Published Works →
  Reader Return / Access → Quiet Recovery. Audited Hero、five labelled regions、
  existing newest / three-item `BrowseWork` preview、Archive / Search / Work / Auth
  entries、shared Loading / Error、Empty、Closing and Footer boundaries. Guest、
  Reader、Author、Published-only、Draft Work / Chapter isolation、1280 / 390、Light /
  Dark、zero overflow and browser console 0 pass. HP-AUDIT-001–010 record static
  Login CTA、positioning、mixed language、44px targets、duplicate Work entry、Auth
  journey、shared state ownership、Empty recovery、misleading `/author` destination
  and long-content coverage as P2 findings；P0 / P1 are zero. Step01 changed no
  product implementation、data fetch、Auth、Permission、Gateway、Service、Repository、
  query、Database、Supabase、RLS、RPC or Migration. Web checks、full `pnpm validate`、
  167 / 167 tests、all production builds and diff checks pass. Homepage Ready for
  Step02 = YES，awaiting Product Owner review，and UX-06H Step02 is not authorized.

- 2026-07-14: Product Owner completed final acceptance of UX-06G Work Detail
  Track with PASS. Step01–Step04 are all Accepted；Work Detail remains the
  Literary Work Decision Space，Work Detail Ready for Release = YES，and the Track
  is completed / closed. WD-QA-001 remains a non-blocking QA Fixture enhancement.
  Do not continue Work Detail optimization.

- 2026-07-14: Completed UX-06G Step04 Work Detail Release Acceptance against
  the frozen Step01–Step03 baseline. Step01 audit / design contract、Step02
  route-local layout and Step03 states / responsive QA are PASS and frozen as
  the Work Detail Release baseline. Work Detail remains the Literary Work
  Decision Space with Work Orientation → Story Premise → Author / Published
  Context → Reading Decision → Chapter Overview → Recovery. Default、Guest / Reader /
  Author、no Published Chapters、Loading、Error contract、Not Found、Start / Continue /
  Download、discovery / Author / Reading / recovery routes、Published-only、Draft
  Work / Chapter isolation、1440 / 1280 / 768 / 390、Light / Dark、44px targets、
  semantics、focus and browser console 0 pass. `reading-history-client.tsx`
  remains presentation-only for Work Continue Reading；history data logic and
  Reading are unchanged. WD-AUDIT-001 / 009 remain accepted frozen boundaries；
  WD-AUDIT-010 passes；WD-QA-001 remains a non-blocking extreme-content Fixture
  enhancement. P0 / P1 and remaining product issues are zero. Step04 changed
  documentation only；Web checks、full `pnpm validate`、167 / 167 tests、all builds
  and diff checks pass. Work Detail Ready for Release = YES，awaiting Product
  Owner final review，and no new UX Track is authorized.

- 2026-07-14: Completed UX-06G Step03 Work Detail States & Responsive QA
  against the frozen Step02 baseline. Revalidated Work Orientation → Story
  Premise → Author / Published Context → Reading Decision → Chapter Overview →
  Recovery；default、no Published Chapters、Loading / Error source contract、Not
  Found、Start / Continue / Download、Archive / Search / Reader Library recovery、
  Guest / Reader / Author、Published-only and Draft Work / Chapter isolation pass.
  `reading-history-client.tsx` Step02 diff remains limited to Continue Reading
  classes、copy、heading hierarchy and 44px presentation；history data structure、
  storage、read / write、selection、sorting and Reading are unchanged. 1440 / 1280 /
  768 / 390、Light / Dark、single H1、named regions、semantic Chapter list、focus-
  visible、minimum 44px targets、zero overflow and browser console 0 pass.
  WD-AUDIT-001 / 009 remain accepted frozen boundaries；WD-AUDIT-010 passes；
  WD-QA-001 remains a non-blocking extreme-content Fixture enhancement. P0 / P1
  and Step02 remaining product issues are zero. Step03 changed documentation only；
  Web checks、full `pnpm validate`、167 / 167 tests、all builds and diff checks pass.
  Work Detail Ready for Step04 = YES，awaiting Product Owner review，and UX-06G
  Step04 is not authorized.

- 2026-07-14: Completed UX-06G Step02 Work Detail Layout Upgrade within the
  frozen Step01 contract. `/works/[slug]` now follows Work Orientation → Story
  Premise → Author / Published Context → Reading Decision → Chapter Overview →
  Recovery. The route uses only existing Work / Author / Chapter fields，clarifies
  Continue / Start / Download hierarchy without changing behavior，adds honest
  no-summary / no-chapter recovery and route-local Loading / Error / Not Found，
  and provides 44px targets plus long-content protection. Guest / Reader / Author、
  Archive / Search / Author Profile entries、Author / Start / Continue Reading
  exits、download、Published-only、Draft Work / Chapter isolation、1440 / 1280 /
  768 / 390、Light / Dark、semantics、zero overflow and browser console 0 pass.
  WD-AUDIT-002–008 are closed for presentation；WD-AUDIT-001 / 009 remain
  accepted Auth / data-contract boundaries；WD-QA-001 is a non-blocking extreme-
  content Fixture enhancement. P0 / P1 / remaining product P2 are zero. Step02
  changed only Work Detail route-local UI / CSS and its Continue Reading
  presentation；data、Auth、Permission、Gateway、Service、Repository、query、history、
  chapter order、download and Reading behavior are unchanged. Web checks、full
  `pnpm validate`、167 / 167 tests、all builds and diff checks pass；Work Detail
  Layout Ready for Step03 = YES，awaiting Product Owner review，and UX-06G Step03
  is not authorized.

- 2026-07-14: Completed UX-06G Step01 Work Detail UI Audit & Design Contract as
  a documentation-only Mission. `/works/[slug]` is frozen as a Literary Work
  Decision Space between Archive / Search / Author Profile discovery and Reading.
  Audited Work identity、summary、public author、tags、Published context、Continue /
  Start、Download、Chapter list、No Chapters、Loading、Error and Not Found. Archive /
  Search / Author Profile → Work Detail and Work Detail → Author Profile / Reading
  pass；Guest retains the existing sign-in boundary，Reader / Author pass，and
  page-local Studio actions remain zero. Published-only、Draft Work / Chapter
  isolation、1280 / 390 zero overflow、single H1、semantic Chapter list and browser
  console 0 pass. WD-AUDIT-001–010 record ten P2 hierarchy、accessibility、state、
  recovery and data-contract constraints；P0 / P1 are zero. Step01 changed no
  product implementation、data、Auth、Permission、Gateway、Service、Repository or
  query contract. Web checks、`pnpm validate`、167 / 167 tests、all production builds
  and diff checks pass；Work Detail Ready for Step02 = YES，awaiting Product Owner
  review，and UX-06G Step02 is not authorized.

- 2026-07-14: Product Owner completed final acceptance of UX-06F Author Profile
  Track with PASS. Step01–Step04 are all Accepted；Author Profile remains the
  Literary Creator Identity Space，Author Profile Ready for Release = YES，and the
  Track is completed / closed. AP-QA-001 remains a non-blocking QA Fixture
  enhancement. Do not continue Author Profile optimization.

- 2026-07-14: Completed UX-06F Step04 Author Profile Release Acceptance against
  the frozen Step01–Step03 baseline. Author Profile is finalized as a Literary
  Creator Identity Space with Public Identity → Bio → Quiet Relationship →
  Published Works Context → Body of Work → Recovery. Guest、Reader followed /
  unfollowed / real pending、Author self and final Follow restoration pass；4
  Published Works、Archive / Search / Work Detail routes、Published-only and Draft
  Work / Chapter isolation pass. Empty / Error contracts、real Profile-shaped
  Loading、1440 / 1280 / 768 / 390、Light / Dark、semantics、focus、44px targets、
  zero overflow and browser console 0 pass. P0 / P1 and Author Profile product P2 /
  post-Beta findings are zero；AP-QA-001 remains only a non-blocking QA Fixture
  enhancement. Step04 changed no product implementation、Follow business、data
  contract、permission or data layer. Web checks、`pnpm validate`、167 / 167 tests、
  all production builds and diff checks pass；Author Profile Ready for Release =
  YES，awaiting Product Owner final review，and no next UX Track is authorized.

- 2026-07-14: Completed UX-06F Step03 Author Profile States & Responsive QA
  against the frozen Step02 baseline. Guest、Reader followed / unfollowed / real
  pending、Author self、Archive / Search / Work Detail routes、Published-only and
  Draft Work / Chapter isolation pass；the local Reader Follow state was restored.
  Real client navigation exposed the Profile-shaped Loading with `aria-busy` and
  identity / works skeletons；Empty and Error contracts pass without fabricated
  data or broken dependencies. 1440 / 1280 / 768 / 390、Light / Dark、headings、
  named regions、focus-visible、44px targets、zero overflow and browser console 0
  pass. AP-AUDIT-001–008 and 010 remain Closed；AP-QA-001 remains a non-blocking
  extreme-content Fixture enhancement. Step03 changed no product implementation、
  Follow business、data contract、permission or data layer. Web checks、`pnpm
validate`、167 / 167 tests、all production builds and diff checks pass；Author
  Profile Ready for Step04 = YES，awaiting Product Owner review，and Step04 is not
  authorized.

- 2026-07-13: Completed UX-06F Step02 Author Profile Layout Upgrade within the
  frozen Step01 contract. `/author/[slug]` now follows Public Identity → Bio →
  Quiet Relationship → Published Works Context → Body of Work → Recovery；public
  name、bio and works lead while avatar、counts and Follow remain supporting. Work
  title and entry are 44px targets，existing `publishedAt` is shown，repeated author
  self-links are removed，and Empty / Loading / Error recovery is route-local.
  Guest / Reader / Author、Archive / Search / Work Detail routes、Published-only、
  Draft Work / Chapter isolation、1440 / 1280 / 768 / 390、Light / Dark、focus and
  console 0 pass. AP-AUDIT-001–008 and 010 are closed；AP-AUDIT-009 implementation
  protection is complete and the absent extreme-content Fixture remains `AP-QA-001`
  for Step03 evidence. No data layer、permission、Follow business or contract changed.
  Web checks、`pnpm validate`、167 / 167 tests、all production builds and diff checks
  pass；Author Profile Layout Ready for Step03 = YES，awaiting Product Owner review，
  and Step03 is not authorized.

- 2026-07-13: Completed UX-06F Step01 Author Profile UI Audit & Design Contract
  browser baseline and documentation draft. `/author/[slug]` is frozen as a
  Literary Creator Identity Space for public display name、bio and Published Works
  body of work. Archive / Search / Work Detail entries、Profile → Work Detail、
  Guest / Reader / Author、current Follow / self states、1280 / 390 zero overflow、
  Published-only and Draft Work / Chapter isolation pass with zero browser console
  errors. Ten P2 findings cover social-profile dominance、generic cards、24px Work
  entry、repeated self-attribution、metadata-light presentation、states、long-content
  coverage and recovery continuity；P0 / P1 are zero. Step01 changed no product、
  Follow、data、permission or query contract. Web checks、`pnpm validate`、167 / 167
  tests、all production builds and diff checks pass；Author Profile Ready for
  Step02 = YES，awaiting Product Owner review，and Step02 is not authorized.

- 2026-07-13: Product Owner completed final acceptance of UX-06E Search Track with
  PASS. Step01 Search UI Audit & Design Contract、Step02 Search Layout Upgrade、
  Step03 Search States & Responsive QA and Step04 Search Release Acceptance are
  all Accepted. Search is frozen as Active Story & Author Discovery；GET q、Initial、
  80 / 81 boundary、NFKC normalization、Work 20 / Author 20、Published-only and
  Draft isolation remain the final contract. P0 / P1 are zero，all Search findings
  are closed，Search P2 / post-Beta risk is zero，and Search Ready for Release = YES.
  UX-06E is Completed / Closed；do not continue Search optimization or start a new
  UX Track without an explicit Product Owner Mission.

- 2026-07-13: Completed UX-06E Step04 Search Release Acceptance final browser QA
  against the accepted Step01–Step03 baseline. Search remains the Active Story &
  Author Discovery entry and Archive remains Published Work browse / sort /
  pagination. Initial、Valid、Empty、Invalid、80 / 81 boundary、NFKC normalization、
  Loading、controlled Error、Work / Author Results、1440 / 1280 / 768 / 390、Light /
  Dark、accessibility、Guest / Reader / Author、Published-only and Draft Work /
  Chapter isolation all pass with zero clean-session browser errors. All Search
  findings remain closed；P0 / P1 are zero. Step04 changed no product implementation、
  data、permission or query contract. Web checks、`pnpm validate`、167 / 167 tests、
  all production builds and diff checks pass；Search Ready for Release = YES. The
  Product Owner subsequently recorded Final Decision PASS and closed UX-06E；no
  next UX Track is authorized.

- 2026-07-13: Completed UX-06E Step03 Search States & Responsive QA browser
  verification. Initial、GET q、Empty、Invalid 80 / 81 boundary、NFKC normalization、
  Loading、controlled Error、Work / Author Results、1440 / 1280 / 768 / 390、Light /
  Dark、focus、44px targets、Guest / Reader / Author、Published-only and Draft Work /
  Chapter isolation pass with zero clean-session browser errors. Controlled Error QA
  found that the `清空并重新搜索` same-route client navigation retained the Next.js
  segment error boundary；`search/error.tsx` now uses a native full navigation and
  correctly restores Initial State. No data、permission、Gateway、Service、Repository、
  RPC or query contract changed. Web checks、`pnpm validate`、167 / 167 workspace
  tests and all production builds pass. P0 / P1 are zero；Search Ready for Step04 =
  YES，and Step04 is not authorized.

- 2026-07-13: Completed UX-06E Step02 Search Layout Upgrade within the accepted
  Step01 contract. `/search` now uses an Orientation → visible-labeled Query →
  Query Context / State → Work Results → Author Results rhythm. Work / Author
  presentation、Initial / Empty recovery、Search-shaped Loading、single-owner Error、
  44px entries、Light / Dark and 1440 / 1280 / 768 / 390 responsive behavior pass.
  Product Owner authorized localhost QA Fixture rebuilding；Reader / Author login、
  Published-only、Draft isolation、Work / Author entries and zero console errors pass.
  `pnpm validate`、167 / 167 workspace tests、Web 79 / 79 and all production builds
  pass；Search Layout Ready for Step03 = YES.
  Only route-local Search UI changed；Database schema、Migration、RLS、RPC、Permission、
  Gateway、Service、Repository and query contracts remain unchanged. Step03 is not
  authorized and awaits Product Owner review.

- 2026-07-13: Completed UX-06E Step01 Search UI Audit & Design Contract as a
  documentation-only Mission. `/search` GET query、Work / Author results、Initial /
  Invalid / Empty / Loading / Error、1280 / 390 responsive、semantics、Published-only
  and Draft isolation were audited. Search is frozen as the active query entry and
  Archive remains the browse / sort / pagination path. Eight P2 design / accessibility
  findings were recorded；P0 / P1 are zero. `pnpm validate`、167 tests、Web 79 / 79
  and all production builds pass. No product、data、permission、dependency or
  deployment change was made. Search Ready for Step02 = YES；awaiting Product
  Owner review，and Step02 is not authorized.

- 2026-07-13: Product Owner issued final PASS for UX-06D Step04 and the full
  Archive Track. Step01–Step04 are accepted；Archive is formally Completed /
  Release Ready with `Archive Ready for Release = YES`. Curated Story Discovery
  Space positioning、official sort contract and Published-only boundaries are
  frozen. AR-AUDIT-003、AR-AUDIT-007 and KI-024 remain accepted P2 / post-Beta
  items. Do not continue Archive optimization or start another UX Track without
  a new explicit Mission.

- 2026-07-13: Completed UX-06D Step04 Archive Release Acceptance. Step01–Step03
  outputs were consolidated into the final release baseline. Curated Story
  Discovery Space positioning、four official sorts、all route states、1440 / 1280 /
  768 / 390、44px targets、accessibility、Guest / Reader / Author、Published-only、
  Draft isolation、Work / Author links and ReaderShelf all pass with zero browser
  errors. Full validation and 79 Web tests pass；P0 / P1 are zero. No product
  implementation changed. AR-AUDIT-003、AR-AUDIT-007 and KI-024 remain P2 /
  post-Beta. Archive Ready for Release = YES；subsequently accepted by Product Owner.

- 2026-07-13: Completed UX-06D Step03 Archive States & Responsive QA. Real
  Loading transition、default/sort/page boundaries、1440 / 1280 / 768 / 390、
  accessibility semantics、Guest / Reader / Author、Published-only、Draft
  isolation、Work / Author links and ReaderShelf regression pass with zero browser
  errors. One route-local CSS fix raised Work title、Author and Work-entry tap
  targets from 15–28px to at least 44px. Empty / Error contracts and live recovery
  destinations pass without creating data or breaking dependencies. AR-AUDIT-003、
  AR-AUDIT-007 and KI-024 remain；P0 / P1 are zero. Step04 is not authorized.

- 2026-07-13: Completed UX-06D Step02 Archive Layout Upgrade within the frozen
  Step01 contract. `/archive` now separates public discovery from private return,
  uses an editorial work list, unified page-level Chinese labels, actionable empty
  recovery and route-local loading continuity. Four sorts、URL pagination、
  Published-only、Reader Permission、Draft Isolation and ReaderShelf behavior are
  unchanged. 1440 / 1280 / 768 / 390 and Guest / Reader / Author browser QA pass
  with zero console errors；P0 / P1 are zero. Metadata expansion、real multi-page
  fixture coverage and KI-024 remain out of scope. Step03 is not authorized.

- 2026-07-12: Completed UX-06D Step01 Archive UI Audit & Design Contract as a
  documentation-only Mission. Current `/archive` Published-only browsing、four
  sorts、URL pagination、states、1440 / 390 responsive and semantics were audited.
  Seven P2 design / QA findings were recorded, led by weak Discovery / Return
  separation、generic inventory cards and the metadata-light `BrowseWork`
  contract. No implementation or data change was made；Archive Ready for Step02
  = YES, pending Product Owner review and separate Step02 authorization.

- 2026-07-12: Product Owner accepted UX-06C Step05 and the complete UX-06C
  Reading Track. Step01–Step05 all pass；Reading is formally Completed / Release
  Ready and Ready for Release = YES. Homepage Track and Reading Track are both
  Release Ready. The existing QA Fixture Library remains the mandatory reusable
  Reading regression baseline；the next UX Track requires separate authorization.

- 2026-07-12: UX-06C Step05 Reading Release Readiness completed with an
  engineering PASS and awaits Product Owner acceptance. Reading is Release
  Ready after 1440 / 1280 / 768 / 390 responsive、accessibility、Long-form、
  performance and full regression audits. `pnpm validate`、79 Web tests、all
  production builds、QA Fixture and zero-error browser checks pass；P0 and P1
  are zero. No implementation change was required.

- 2026-07-12: Product Owner accepted UX-06C Reading Track Step04. Long-form
  Reading QA、Desktop / Tablet、390 Mobile、Private Literary Reading Space、
  regression、QA infrastructure and documentation governance all passed.
  Step04 is formally closed；UX-06C Step05 Reading Release Readiness awaits
  separate Mission Authorization.

- 2026-07-12: UX-06C Step04 Long-form Reading QA rerun completed with an
  engineering PASS and awaits Product Owner acceptance. The frozen Long Watch
  fixture rendered 150 paragraphs consistently at 1440、768 and 390 with zero
  overflow；Settings、Navigation、Directory、three-Chapter transition、Reader /
  Author boundaries and Homepage / Archive / Reading / Author / Studio
  regression passed with zero browser errors. No implementation fix was needed.

- 2026-07-12: Product Owner accepted UX-06C Step04A QA Fixture Library
  Foundation. The reusable Reading QA infrastructure、fixture lifecycle、data
  isolation and regression results are frozen. Step04A is closed；the Step04
  long-form rerun remains separately authorized and Step05 stays blocked.

- 2026-07-12: Completed UX-06C Step04A QA Fixture Library Foundation by
  extending the existing localhost-only `qa:fixture` flow. Four fixed-ID QA
  Works and six Chapters now cover Short、150-paragraph Long-form、Multi Chapter、
  Empty and Draft isolation scenarios；content-only cleanup preserves identities.
  Idempotency、cleanup/recreate、Reader/Author isolation、1440/390 long scrolling
  and regression pass. Step04 must still be rerun before Step05.

- 2026-07-12: UX-06C Reading Track Step 04 passed all available real-content
  Desktop / Tablet / Mobile、interaction、permission、error-state and role
  regression checks，but is HOLD because local published content contains only
  short chapters. No honest 20–30 minute long-form scenario can be executed
  without separately authorized non-production QA content. Step 05 is blocked；
  no code、database、Supabase or permission change was made.

- 2026-07-12: Product Owner accepted UX-06C Reading Track Step 03. The
  low-distraction Reading Interaction state、Chapter Directory、Progressive
  Reading Settings、Chapter transition、scroll、responsive and accessibility
  results are frozen. Step 03 is closed；Step 04 remains separately gated.

- 2026-07-12: Completed UX-06C Reading Track Step 03 Reading Interaction.
  Chapter Directory、Mobile Reading Navigation and Reading Settings now share
  one route-local active panel；explicit close restores trigger focus，current
  Chapter remains marked，and Chapter end preserves quiet Previous / Next
  continuity. 1440 / 390 responsive、44px target、zero-overflow、Guest / Reader /
  Author and clean-browser regression pass. Product Owner subsequently accepted
  the Step；Step 04 remains unauthorized.

- 2026-07-12: Completed UX-06C Reading Track Step 02 Typography & Reading
  Rhythm. Existing Reader preference values and storage remain unchanged. Prose
  and Chapter title now use a mixed-language system-serif fallback；Chapter title
  uses discrete Desktop / Tablet / Mobile sizes，and paragraph、heading、list and
  blockquote rhythm is tuned for long reading. 1440、768 and 390 responsive QA，
  maximum preferences，persistence，contrast and regression pass. Product Owner
  later accepted Step 02 and separately authorized Step 03.

- 2026-07-12: Product Owner froze the Author Studio / Work Editor multi-chapter
  UX foundation. Multi-chapter works require collapsible management with one
  explicit active editing chapter；eligible-only Select All uses none、partial
  and all states，and zero selection cannot publish. Published、ineligible、
  invalid and unsaved chapters remain excluded. This is documentation only；a
  future independent Author Studio / Chapter Management Mission must authorize
  implementation.

- 2026-07-12: Product Owner accepted UX-06C Reading Track Step 01 and its
  Additional Mobile Reading Foundation. Reading Container、responsive long-text
  containment、page-local low-distraction exits and collapsible Chapter
  Navigation are now accepted foundations. Step 02 Typography & Reading Rhythm
  remains unauthorized.

- 2026-07-12: Completed the UX-06C Step 01 Additional Mobile Reading
  Foundation. Mobile Chapter Reading now has an always-visible Return to Work
  path and a native collapsible navigation panel for Homepage、Archive、Shelf、
  Search、previous / next and Chapter Directory. The panel expands in document
  flow and closes to full reading width. Desktop keeps its existing context and
  continuation rhythm while Chapter Directory is closed by default. Typography、
  Reader settings、bookmark、history、Auth、permission and data contracts remain
  unchanged.

- 2026-07-12: Added and froze the global Header three-zone structure within the
  authorized UX-06C Step 01 supplement. At 768px and above, Brand、Primary
  Navigation and Utility / Account are distinct; 390 Mobile keeps Brand and
  right-side Theme / Account while simplifying navigation. Reader navigation is
  Archive、Search、then existing capability-gated Studio. Auth、role、Studio
  access and theme persistence behavior remain unchanged.
  The same responsive audit exposed and fixed Reading grid overflow from
  uninterrupted prose using intrinsic-width containment and emergency wrapping;
  reader preference values remain unchanged.

- 2026-07-12: Completed UX-06C Reading Track Step 01 Layout Foundation. Chapter
  Reading now uses route-local Context, Content and Continuation regions plus a
  pure Chapter Header. Existing Reader access, hybrid published-only data,
  preference variables, history, bookmark and chapter flow contracts remain
  unchanged. Web typecheck, lint, 79/79 tests and production build pass; Step 02
  remains unauthorized pending Product Owner acceptance.

- 2026-07-11: Completed UX-06B Homepage Implementation Step 04 Release
  Readiness. No Homepage code change was required. Responsive audits at 1440,
  1280, 768 and 390 widths, semantic accessibility, visible focus, Light/Dark
  contrast, restrained interaction, production build/loading checks and complete
  Guest/Register/Reader/Reading/Author/Studio regression all pass. `pnpm validate`
  passes after mechanical formatting of existing Design documents. Homepage is
  Release Ready. Product Owner accepted Step 04 and closed the UX-06B Homepage
  Track. UX-06C Reading Track remains unauthorized.

- 2026-07-11: Product Owner authorized the permanent Manual QA Handoff Gate.
  Every Mission entering manual acceptance must proactively report the actual QA
  environment, local-only Fixture credentials, Guest/Reader/Author validation and
  the standard checklist. Fixture, credential, login, invitation or environment
  failures are P0 and block Completed/Awaiting Acceptance. The current local QA
  Fixture was repaired idempotently and Guest, Reader, Author, role boundaries,
  Studio/Profile, Desktop/Mobile and zero-error console all pass.

- 2026-07-11: Completed UX-06B Homepage Implementation Step 03 visual
  refinement. Homepage structure and Published Work data remain unchanged;
  typography, editorial measures, whitespace, semantic color usage and
  restrained interaction feedback were refined only in route-local CSS. Web
  typecheck, ESLint, 79/79 Vitest, production build, 1280 desktop, 768 tablet,
  390 mobile, Light/Dark theme, key entry boundaries and zero-error console all
  pass. Product Owner accepted Step 03; Step 04 remains unauthorized.

- 2026-07-11: Product Owner accepted UX-06B Homepage Implementation Step 02.
  Homepage content now follows Brand Introduction ->
  Quiet Discovery -> three newest Published Works -> Reading Return -> Closing.
  Published content reuses the existing public browse gateway and `BrowseWork`
  contract without recommendation, ranking, schema or permission changes. Web
  type, lint, 79 tests, production build, desktop/mobile Browser QA, real
  Published Work/Author links and zero-error console all pass. Step 03 remains
  unauthorized.

- 2026-07-11: Product Owner accepted UX-06B Homepage Implementation Step 01. The
  Homepage now uses a route-local shell with Entry,
  Archive Foundation, Preview Shelf and Calm Closing regions, semantic colors and
  responsive editorial rhythm. Existing Root Layout, SEO, Session, Reader gate,
  Archive, Author, Auth, data and business contracts remain unchanged. Web type,
  lint, 79 tests, production build, desktop/mobile/dark Browser QA and zero-error
  Homepage console all pass. Step 02 remains unauthorized.

- 2026-07-11: Product Owner accepted UX-06A Design System Implementation
  Foundation. The current Tailwind CSS 4 + `packages/ui`
  architecture, theme model and Reader preference variables are retained. The
  approved strategy uses semantic Token layers, shared-component ownership and
  mission-based page migration; no Token, Component, CSS, Tailwind, page,
  permission, data or business behavior changed. UX-06B remains unauthorized.

- 2026-07-11: Product Owner confirmed `Mission RR-1C PASS`. QA Fixture acceptance
  is complete; Author / Reader permission chains pass manual verification; Reader
  `/studio` redirects to `/archive`. Release Candidate baseline
  `8495bded5e0c78985be7410cceb902cd2c090421` is Product Owner Accepted and Beta
  Ready. RR-1C is formally closed. Git Tag, Go / No-Go, release actions and new
  development remain separately gated.

- 2026-07-11: RR-1C Product Owner acceptance found local Auth users empty after a
  clean rebuild. A localhost-guarded, idempotent QA fixture now restores synthetic
  Reader/Author identities, active Memberships, Author grant/profile and invitation
  redemption. Credentials remain only in Git-ignored `.local/qa-fixture.json` mode
  `0600`; `qa:web` injects local runtime values without overwriting `.env.local`.
  Clean rebuild recovery, both logins, Reader access, Author profile/Studio, Reader
  Studio denial and zero-error browser console all pass. This fixture was
  subsequently Product Owner accepted.

- 2026-07-10: Mission RR-1C Release Candidate engineering completed. Final
  Runtime, local/remote Migration parity, clean local rebuild, six SQL suites,
  schema lint, `pnpm validate`, desktop Browser QA, 390×844 Mobile QA,
  Documentation Audit, Known Issues Review and Beta Ready Checklist all pass with
  P0 at zero. The accepted Release Candidate Git baseline is
  `8495bded5e0c78985be7410cceb902cd2c090421`. No new
  feature, migration, dependency, permission model, framework, workflow or
  governance change was introduced. RR-1C was subsequently Product Owner accepted.

- 2026-07-07: Product Owner confirmed `Mission RR-1B. PASS` after final
  Production Deployment acceptance. Production URL, HTTPS, Environment Variables,
  Production Build, Home, Archive, Search, Author, Published Work, Sitemap,
  Robots, Metadata, Canonical, Open Graph, Browser Smoke, Console, Network and
  Responsive Layout all passed. Mission RR-1B is formally closed. RR-1C Release
  Candidate remains unauthorized and unstarted.

- 2026-07-04: Mission RR-1A Release Preparation engineering completed. Runtime
  Contract, frozen dependencies, clean 14-migration local rebuild, six SQL suites,
  local schema lint, local/remote 14/14 parity, 167-test validation, all builds,
  documentation and project structure pass with P0 at zero. Release and Browser QA
  checklists now exist. KI-027 through KI-030 record dependency, workspace-root, CI
  and Supabase preflight risks. RR-1A established the preparation baseline later
  carried into RR-1B deployment acceptance.

- 2026-07-04: Product Owner confirmed `Mission 3C-3. PASS` after final Sitemap,
  Robots, Published-only, Draft exclusion/noindex, Author/Work/Archive/Search,
  metadata, canonical, Open Graph, responsive, Browser QA and clean-console
  acceptance. Mission 3C-3 and Mission 3C are formally closed. Phase 3 is
  Completed — Product Owner Accepted. RR-1 remains unauthorized and unstarted.

- 2026-07-03: Mission 3C-3 SEO Foundation engineering completed. Public
  `sitemap.xml`, `robots.txt`, canonical URLs, Open Graph and route metadata now
  cover site, Archive, Search, Published Works and public Authors. Sitemap and
  metadata reuse existing Published-only boundaries; Draft and Studio routes are
  noindex. No Migration, permission or Auth change was introduced. Local/remote
  histories remain 14/14 aligned; validation and desktop/390px Browser QA pass
  with 167 tests, zero console errors and P0 at zero. Awaiting Product Owner
  acceptance; RR-1 was not started.

- 2026-07-03: Product Owner confirmed `Mission 3C-2. PASS` after final Archive,
  Published-only isolation, pagination, four-sort, URL recovery, state,
  responsive, accessibility and clean-console acceptance. Mission 3C-2 is
  formally closed. Mission 3C-3 is named SEO Foundation and remains
  unauthorized and unstarted.

- 2026-07-03: Mission 3C-2 Browse Experience engineering completed. Public
  `/archive` now provides published-only pagination, four deterministic sorts,
  shareable URL state, complete page states and responsive accessibility. Local
  rebuild, Mission SQL, remote 14/14 Migration parity, `pnpm validate` and
  desktop/390px Browser QA pass with P0 at zero. Mission 3C-2 awaits Product
  Owner acceptance; Mission 3C-3 was not started.

项目名称：
Fandom Harbor

项目目录名：
FandomHarbor

项目类型：
升级版 AO3 私域作品归档站

核心角色：

1. Super Admin 超级管理员
2. Admin 管理员
3. Author 作者
4. Reader 读者

访问规则：
半公开。
未认证用户可以看到介绍页，但不能查看正文。
通过邀请码后可以进入站内。
第一版统一为：通过门禁后可看站内内容。
作者权限只能由管理员手动开通。

内容类型：

- 长篇小说
- 短篇小说
- 随笔
- 图片
- 外部链接
- PDF
- EPUB

以上是产品规划能力，不代表全部进入 MVP。首发格式范围由 KI-003 确认；建议先完成安全、可靠的文本作品闭环。

作者系统：
作者可以有多个笔名 / 马甲。
真实账号在后台可见。
读者只看到作者选择展示的笔名。

AO3 核心功能：

- 自由标签 + 管理员规范化
- CP / 关系标签
- 作品分级
- 可选预警
- 搜索筛选
- 评论
- 回复评论
- 匿名评论
- Kudos
- 收藏
- 推荐

不做：

- 私信
- 关注作者
- 粉丝系统
- 社交动态
- 转发
- 公开社交排行榜

邀请码：
作者可以生成邀请码。
邀请码可以限制有效期和可用次数；当前 Phase 1C 不允许邀请码携带或授予角色权限。
管理员可以撤销邀请码。
邀请码必须形成邀请链。
邀请码只能控制进入门禁的范围，不能自动授予 Author、Admin 或 Super Admin。

举报系统：
超级管理员和管理员收到举报。
作者也知道有人举报。
举报必须填写理由。
举报可以上传截图。
后台需要有处理流程：
待处理 / 处理中 / 已驳回 / 已处理。

版本管理：
作品修改保留历史版本。
可以查看 Diff。
管理员可以恢复旧版本。

数据面板：
管理员后台需要展示：

- 阅读人数
- 阅读次数
- 收藏数
- Kudos
- 评论数
- 推荐数
- 阅读来源
- 热门标签
- 热门 CP
- 活跃作者
- 新增作品

最重要的产品优化目标：

1. UI 比 AO3 更现代
2. 移动端体验比 AO3 更好
3. 阅读体验比 AO3 更好

固定技术栈：

- Next.js App Router + TypeScript
- Supabase + PostgreSQL
- Tailwind CSS + shadcn/ui
- TipTap
- Zod + React Hook Form
- TanStack Query
- Lucide Icons
- Vercel

应用边界：

- apps/web：访客、读者、作者
- apps/admin：管理员、超级管理员
- apps/docs：未来只读项目文档在线浏览入口；根目录 docs 与 .ai 仍是唯一事实源
- 共享实现进入职责明确的 packages，不使用 apps/shared

共享包边界：

- ui、editor、auth、database、services、types、constants、config、utils

文档结构：

- 与产品负责人的沟通默认使用简体中文；正式产品文档使用中文内容，文件名保持英文
- 数据库、代码、API、变量和目录命名使用英文；不为统一语言而翻译已有文档
- `.ai/LANGUAGE_POLICY.md` 是每次新会话的强制启动上下文
- `.ai/ENVIRONMENT_POLICY.md` 是每次新会话的强制启动上下文；环境问题不等于产品、架构或 Sprint 失败
- 环境问题发生后停止操作、记录并汇报；同一根因仅允许一次经 Product Owner 批准的受控重试，重试失败后必须停止
- `.ai/WORKFLOW.md` 是每次新会话的强制启动上下文，定义 Tech Lead 自主决策与必须升级审批的边界
- 从 Sprint 002E 起，Codex 可在完成 Sprint/Step 后自动更新 Product Owner 指定的 README、Sprint、Architecture 与 `.ai` 路径，记录有证据的状态、验收、验证、边界、风险和下一步；最终报告必须披露自动记录文件与 Level 3 状态。
- 自动文档权限不授权业务代码、依赖、package/lockfile、Migration/RLS/SQL/RPC、权限模型、发布、上传/存储、删除、生产部署、技术栈或大范围重构。
- 每个 Sprint 必须先完成 Environment Check → Toolchain Check → Version Check → Dependency Check，全部通过后才能开发
- 环境问题必须优先查明根因，不得把重试当作第一处理动作
- Runtime Contract：Node.js 24.x LTS、当前批准版本 24.18.0、NVM、pnpm 11.7.0、官方 npm registry
- 本地、Codex、CI、Git Hooks、Playwright、Vercel 必须从环境层遵守同一运行时；工具只能检查，不能切换 Node
- docs 使用 00_Project 到 18_Research 的冻结数字分类
- 05_UI 描述体验，06_Design_System 定义复用规则，07_Component 定义实现契约
- 03_Database 使用 ERD/Migration/Policies/RLS/Seed/Indexes/Lifecycle 注册
- 04_API 使用 REST/ServerActions/Realtime/Webhooks/Events/Errors/Contracts 分类
- 17_Architecture_Decisions 保存永久 ADR，.ai/DECISIONS 保存精简记忆
- Phase 是产品阶段，Sprint 是 Phase 内工程执行单位
- 当前 Product Phase Roadmap 为 Phase 0、0.5、0.6、1–8

架构方向：

- 模块化单体，不提前拆微服务
- React Server Components 优先
- 服务端权限校验 + PostgreSQL RLS 双层强制
- TipTap JSON 为文本内容源，版本不可变，HTML/纯文本为派生数据
- RuntimeConfig、Auth provider、Database/Repository 与 ObjectStorage 是平台隔离边界；页面不得直接读取 `process.env` 或调用 Supabase client
- 当前 V1 身份方案为注册名/password：注册必须同时提供有效邀请码，密码至少 8 位，不要求用户邮箱或邮箱验证；active Membership 继续派生 Reader capability。
- Author/Admin/Super Admin 只允许手工授权与撤销；邀请兑换不得提权，所有安全关键变更必须审计

开发状态：

- Phase 0 Project OS 已完成
- Phase 0.5 Freeze Product Blueprint 已完成
- Phase 0.6 Product Freeze Review 已批准并冻结
- Phase 1 Sprint 1 Project Foundation 已完成
- Phase 1C Identity Access Core 工程实现完成：平台边界、Auth、Invitation、Membership、Role Grant、Audit、RLS、Web/Admin 壳层与测试已写入
- Sprint 002A Website Shell 已完成：Landing、Reader List/Detail、Reader Shell、Author Empty State、Admin Dashboard、Mock Data 与 Shared Layout 已交付
- Milestone v0.1 已发布到 GitHub，当前仓库基线固定为 Phase 1 Foundation + Sprint 002A Website Shell
- Frozen install、Type、Lint、Test、Build 已通过；Supabase CLI、Docker 与本地 Runtime 可用。
- 未创建 Supabase/Resend/Vercel 云资源，未配置生产 SMTP，未建立生产 Super Admin
- Phase 2 / Sprint 002A Content Domain Foundation 已于 2026-06-30 获 Product Owner 明确批准并开始：只建立 works/chapters/articles/category/tag 的 Migration、RLS、TypeScript 边界、测试与文档
- Phase 2 内容读取继续受 active Membership 门禁保护；Author 所有权与 Admin/Super Admin 管理复用 Phase 1 `role_grants`，不建立第二套权限体系
- `owner_user_id` 是隐藏的授权字段而非公开署名；公开 Pen Name/authorship 仍属于后续独立模型
- Sprint 002A 工程与数据库验证均已通过：ordered Migrations 可从零重建，Phase 2 事务 SQL 权限脚本通过。
- Sprint 002B-Step01 已完成作品详情、章节阅读、独立文章阅读、结构化正文渲染、章节导航与基础阅读显示控制；页面继续复用 Phase 1 Membership 门禁
- Reader 数据经 `ReaderContentGateway → Content Service → ContentStore`，当前只读 fixture 可在单一边界替换为后续 Supabase Repository
- Sprint 002B 未重试 Supabase、未连接远程生产库，也未新增依赖、权限体系、社区能力、推荐或作者后台
- Sprint 002B-Step02 使用 `fandom-harbor.reader-preferences.v1` 在当前浏览器保存 Light/Dark、字号、行高与阅读宽度；不依赖登录、不写数据库、不记录阅读行为
- 章节页明确展示章节进度、第一章/末章导航边界、目录直达入口，并用视觉标识与 `aria-current` 标记当前章节
- Sprint 002B-Step03 使用 `fandom-harbor.reading-history.v1` 保存最近访问的 work、chapter 与 article；章节记录包含位置、总章数和派生百分比，最多保留 30 条
- Continue Reading 位于作品详情页，只跳转到该作品最近阅读且仍存在于当前已发布目录的章节；历史不绑定账号、不写数据库、不代表书签或收藏
- Sprint 002D-Step02 已替代原 Create Article UI Shell，优先交付 Create Work Draft Persistence。
- V1 内容词表由生产 Migration 幂等写入：5 个 Category 与 10 个 `additional/canonical` Tag，均使用稳定 UUID。
- Work Draft 写入使用 `Server Action → Gateway → createWorkDraftService → createAuthorWorkDraft Repository → create_author_work_draft RPC`；页面不得直连 Supabase mutation。
- `create_author_work_draft` 在单一事务创建 Work 与 `work_tags`，owner 固定为 `auth.uid()`，status 固定为 `draft`，`published_at` 固定为 null。
- Publish、Edit、Archive、Delete、Article/Chapter 写入仍未开放；Work Draft Runtime 与 SQL 实测已通过。
- Sprint 002E 正式调整为 Minimal Draft Editor，优先推进 Write → Save → Publish → Read 闭环，不先做 Work Detail Polish。
- Sprint 002E-Step01 复用 `chapters.content` 作为正文来源；V1 编辑壳读取按 position 排序的首个 Chapter，没有 Chapter 时显示空正文。
- Draft Editor 经 `StudioDraftEditorGateway → createDraftWorkEditorService → DraftWorkEditorStore → Supabase Repository` 读取；Service 校验 Author，数据库 session/RLS 校验 owner。
- `/studio/works/[workId]/edit` 的 textarea 仅保存浏览器页面状态，保存正文与 Publish 均 disabled；Step01 不新增写入、RPC、Migration、RLS 或 Schema。
- Sprint 002E-Step02 已用最小列级 grant 打通 Draft Body Save：owner Author 可保存首章正文，没有 Chapter 时首次保存自动创建 `position = 1` 的默认首章。
- Step02 不新增 RPC、不修改表结构/RLS，不会改变 `work.status` 或触发 Publish；Reader published-only 合同保持成立。
- Sprint 002F 已打通最小 Publish 闭环：同一编辑表单支持发布，发布时会先保存当前正文，再把 Work 和首章流转到 `published`。
- Reader 现在通过 hybrid gateway 优先读取数据库中的 published 内容，未命中时回退到 fixture published 内容；新发布作品可立即进入 `/works/[slug]/chapters/[chapterSlug]` 阅读。
- Sprint 002B-Step04 使用 `fandom-harbor.reader-bookmarks.v1` 保存章节与文章书签；`/archive` 本地书架聚合书签和 Step03 最近阅读
- 本地书签最多保留 100 条，支持添加/取消与明确当前状态；不绑定账号、不写数据库、不等同于云端收藏
- Sprint 002B-Step05 固化阅读 QA：书架水合/空/Storage 错误状态、规范 slug 过滤、全局 404/error 恢复路径、命名阅读设置区、动态 Bookmark aria-label/status
- Sprint 002C-Step01 使用现有 `work:author` capability 建立 `/studio`、`/studio/works`、`/studio/articles` 与共享 Author Studio layout
- Studio 数据经 `StudioContentGateway → createStudioContentService → StudioContentStore`，Service 注入 trusted owner ID；当前使用含 draft/published 的 Author fixture
- Reader fixture 对 Work、Article 与 Chapter 显式过滤 published；真实 owner-only Supabase Studio Store 因 `owner_user_id` 列级隐私合同待后续批准，不用公开 feed 冒充
- Sprint 002C-Step02 已 Accepted：`/studio/works/[workId]` 提供 owner-scoped 作品与章节摘要只读详情；owner ID 由 Service 从 trusted context 注入，其他作者与未知 workId 返回 Not Found
- Studio 可查看当前 fixture 作者的 draft Work/Chapter，Reader 仍只读取 published；新建章节、编辑、发布、归档均保持 disabled
- Sprint 002C-Step03 已 Accepted：`/studio/articles/[articleId]` 提供 owner-scoped 文章元信息只读详情；owner ID 来自 `TrustedAccessContext.identity.id`，其他作者与未知 articleId 返回 Not Found
- Studio 可查看当前 fixture 作者的 draft Article，Reader 仍只读取 published Article；新建文章、编辑、发布、归档均保持 disabled
- Sprint 002C-Step04 已 Accepted：补齐 Studio 空列表、Work/Article 专用 Not Found、无章节/全草稿章节提示与返回 Studio/列表导航；错误状态不暴露内部 ID 或数据库字段
- Studio 写入入口统一保持 disabled 且不接收写入回调；Reader 对 draft Work、Article、Chapter 的 published-only 隔离继续通过
- Sprint 002C-Step05 已完成 Freeze & Handoff：002C 冻结为只读 Author Studio Foundation，可正式关闭；Create/Edit、Draft Save、Publish、Archive、Delete、Supabase Runtime、Owner Repository 与 Rich Text Editor 均需新授权
- Sprint 002C Freeze 时记录的两个 002D 候选方向中，Product Owner 已选择非写入的 Author Creation Experience UI Shell；Database Runtime Recovery 仍独立待授权
- Sprint 002D 最初选择 Author Creation Experience UI Shell；Product Owner 后续明确调整 Step02 优先级，仅开放 Work Draft Persistence。
- Sprint 002D 的手册批准与实现授权保持分离；Step02 只授权 Create Work Draft，任何 Edit/Publish/其他写入仍需再次明确批准。
- Sprint 002D-Step01 已完成 `/studio/works/new` UI Shell；Step02 已将 metadata fixture 替换为数据库读取，并只启用“保存草稿”。
- Reader published-only 与 Trusted Identity 状态保持不变；002A DB Runtime Pending 已于 2026-07-01 验证关闭。

## Last updated

- 2026-07-03: Product Owner confirmed `Mission 3C-1. PASS` after final browser,
  responsive, accessibility, console, URL synchronization, Published Work /
  Author search and Draft-isolation acceptance. Mission 3C-1 is formally
  closed. Mission 3C-2 is named Browse Experience and remains unauthorized and
  unstarted.

- 2026-07-03: Mission 3C-1 Search MVP engineering completed. Public `/search`
  supports GET/URL-synchronized Published Work title/slug and public Author
  name/slug matching. Drafts remain excluded by the database contract. The
  implementation uses existing Service / Repository boundaries and one narrow
  public read RPC; no schema, RLS, role, Auth, dependency or infrastructure
  change was introduced. Local/remote Migration histories are 13/13, full
  validation and desktop/390px Browser QA pass, P0 is zero, and Mission 3C-2
  remains unauthorized and unstarted.

- 2026-07-03: Product Owner completed final browser acceptance and confirmed
  `Mission 3B. PASS`. Create/Save/Publish/Reader readback, public Author profile,
  published-only and draft isolation, Follow / Unfollow, login return,
  Invitation Relationship and mobile baseline all passed. Acceptance-found
  publishing and Studio owner-read issues were repaired and re-verified. Full
  validation passes, P0 is zero, and local/remote Migration histories are 12/12.
  Mission 3B is closed; Mission 3C remains unauthorized and unstarted.

- 2026-07-03: Fixed the Phase 3 `/studio/works` P0. PostgREST filtering on the
  intentionally hidden `owner_user_id` caused legitimate Author reads to fail;
  removing the filter was rejected because Reader RLS can see all Published
  Works. Authenticated-only `list_my_studio_works` and `get_my_studio_work`
  now return only the active Author own Draft/Published management fields and
  never expose owner IDs. The Migration is deployed and local/remote histories
  are 12/12 aligned; Product Owner remote browser confirmation remains pending.

- 2026-07-03: Phase 3 Reader / Studio acceptance fix engineering completed.
  Reader surfaces expose only public Author names/slugs for Published Works,
  global auth state is visible, TXT export is published-only, and Studio uses
  owner-scoped real Work/Chapter data with Draft/Published management, Chapter
  creation/editing/publication selection and tag association editing. The
  authorized narrow `get_published_work_authors` Migration is deployed; local
  and remote histories are 11/11 aligned. Chapter deletion remains closed and
  Product Owner acceptance is pending.

- 2026-07-02: Mission 3B engineering completed under the authorized Social
  Relationship Foundation scope. `/author/{slug}` is publicly readable and
  published-only; active Readers can idempotently Follow / Unfollow Authors;
  invitation relationship summaries are own-only and reuse existing Redemption
  uniqueness. Local database rebuild, Mission SQL, full Validation and desktop /
  390px Browser QA passed. The additive Migration is deployed remotely and local /
  remote histories are 10/10 aligned. Mission 3B awaits Product Owner acceptance.

- 2026-07-02: Product Owner confirmed `Mission 3A. PASS`. Phase 3A Beta Blocking
  is accepted and closed with engineering P0 at zero. Mission 3B, Mission 3C and
  RR-1 remain unauthorized; the project waits at the Mission 3B authorization gate.
- 2026-07-02: Mission 3A engineering completed under Mission Authorization v1.
  Full workspace validation, local nine-migration rebuild, three SQL suites,
  remote 9/9 migration parity, remote Auth settings, real registration/login,
  Reader denial, Author grant, Studio create/save/publish/read and 390×844
  browser QA passed. Engineering P0 is zero; Mission 3A awaits Product Owner
  acceptance. Deployed Vercel URL smoke testing and Git Release Candidate
  archiving remain KI-017/KI-018 for Release Readiness.
- 2026-07-02: Product Owner replaced the planned Phase 3 Reading direction with
  V1 Fast Launch governance. Phase 3A (`3A-*`) is the only Beta-blocking stage;
  Phase 3B (`3B-*`) contains minimal invitation operations including
  Invitation Relationship; Phase 3C (`3C-*`) contains deferrable experience
  polish; former Sprint 3.10 is independent Release Readiness `RR-1`. All Sprints
  remain unauthorized and unstarted.
- 2026-07-02: Product Owner confirmed successful Studio entry with the remotely registered `Auther001` account. The nine-migration remote environment, disabled Email Confirm, real registration, registration-name/password login and audited manual Author grant acceptance chain passed; Phase 2 is Pass and Auth P0 is resolved. Phase 3 still requires separate planning and explicit authorization.
- 2026-07-02: Product Owner completed remote registration/login as Auther001. The account has active Membership and an audited manual Author grant; Phase 2 remained Conditional Pass until the subsequent successful Studio confirmation.
- 2026-07-02: Remote project szfhngifsipsrxcpekti is linked and has all nine migrations. Registration RPCs return HTTP 200, mailer_autoconfirm is true, a bounded QA invitation is valid, and all app env URLs point to the project. Phase 2 remains Conditional Pass until Product Owner completes real registration/login and, after the required manual Author grant, enters Studio.
- 2026-07-02: Product Owner marked Phase 2 Conditional Pass after manually checking Author and Reader surfaces with no other obvious issue found. Planning for the next step is allowed, but Phase 3 implementation remains prohibited until the same remote acceptance environment passes migration deployment, Email Confirm disabled, real registration, registration-name/password login and Studio entry.
- 2026-07-02: Phase 2 Auth P0 reopened after manual regression. The configured remote Supabase lacks the registration RPCs and returns PGRST202. Local code now classifies invitation and provider failures, all nine migrations/SQL suites/real Auth signup/workspace gates pass, but Phase 3 remains prohibited until remote migration and Auth verification complete.
- 2026-07-02: Established the mandatory Phase-level Product Handoff format. Phase 2 now has startup instructions, entry URLs, local-only Reader/Author QA accounts, route inventory, manual acceptance flow, limitations and a Product Owner result section. Local QA identities disappear after database reset.
- 2026-07-02: Phase 2 Auth P0 resolved. Registration now atomically creates the Auth identity, unique registration-name Profile, active Membership, Invitation Redemption and audit state; invalid invitations leave no residual account. Login uses registration name/password and no verification email is sent.

- 2026-06-30: Started approved Phase 2 / Sprint 002A Content Domain Foundation with the works + chapters + articles model, shared categories/tags and existing-RBAC RLS boundary.
- 2026-06-30: Completed Sprint 002A engineering implementation and local checks; disposable-database execution and Product Owner acceptance remain.
- 2026-06-30: Completed Sprint 002B-Step01 reader routes, replaceable fixture data flow, safe structured-content rendering, chapter navigation and baseline reading controls; 002A database execution remains pending without further retry.
- 2026-06-30: Completed Sprint 002B-Step02 local reader-preference persistence and chapter-navigation clarity; workspace checks and browser theme/guard regression pass without database writes, new dependencies or Supabase retries.
- 2026-06-30: Completed Sprint 002B-Step03 local work/chapter/article history and work-scoped Continue Reading with safe Storage fallback; workspace checks and public-shell/auth-guard browser regression pass.
- 2026-06-30: Completed Sprint 002B-Step04 local chapter/article bookmarks and the `/archive` Reader Shelf with safe Storage fallback; workspace checks and public-shell/shelf-guard browser regression pass.
- 2026-06-30: Completed Sprint 002B-Step05 reading-state QA and accessibility polish; workspace checks, 404 recovery, theme persistence and shelf-guard browser regression pass, with protected-page manual keyboard QA waiting on local identity Runtime.
- 2026-06-30: Product Owner accepted Sprint 002C-Step01 Author Studio Foundation after the draft Chapter isolation fix; 48 Vitest tests, full workspace checks and the Web production build pass while 002A DB Runtime remains pending, and Step02 awaits explicit authorization.
- 2026-06-30: Product Owner accepted Sprint 002C-Step02 owner-scoped Work Detail read-only foundation with trusted owner injection, draft Studio visibility, other-author/unknown-work Not Found boundaries, disabled write entrypoints, 52 Vitest tests and Web production build passing while 002A DB Runtime remains pending; Step03 was later authorized and tracked separately.
- 2026-07-01: Product Owner accepted Sprint 002C-Step03 owner-scoped Article Detail read-only foundation with owner identity sourced from `TrustedAccessContext.identity.id`, draft Studio visibility, other-author/unknown-article Not Found boundaries, Reader published-only isolation and disabled write entrypoints; lint, typecheck, 55/55 Vitest tests and Web production build pass while 002A DB Runtime remains pending and Step04 remains unauthorized.
- 2026-07-01: Product Owner accepted Sprint 002C-Step04 after safe empty/error/boundary states, disabled actions and Reader isolation passed review; lint, typecheck, 58/58 Vitest tests and Web production build pass.
- 2026-07-01: Completed Sprint 002C-Step05 Freeze & Handoff with Step01-Step04 accepted, read-only Studio and trusted identity/published-only contracts frozen, all write/runtime/editor capabilities separately gated, and Sprint 002D awaiting a newly authorized direction while 002A DB Runtime remains pending.
- 2026-07-01: Product Owner approved the Sprint 002D Author Creation Experience UI Shell handbook and selected the non-writing UI direction; Step01 remains separately gated, while real Create/Edit/Publish, owner-only Repository, DB Runtime, content schema validation, Revision and state-machine work remain unauthorized.
- 2026-07-01: Completed Sprint 002D-Step01 Create Work UI Shell with client-only validation, fixture metadata, cover/loading placeholders, local clearing and disabled save/publish actions; lint, typecheck, 64/64 Vitest and Web production build pass, no write/Repository/Supabase path exists, and Step02 remains unauthorized.
- 2026-07-01: Accepted Sprint 002D-Step02 after local Supabase rebuilt all six Migrations and the Phase 2 SQL suite verified Author success, non-Author denial, invalid metadata rollback and atomic Work/Tag creation; Publish remains disabled.
- 2026-07-01: Completed Sprint 002E-Step01 Minimal Draft Editor data contract and edit shell by reusing chapters.content, existing Author capability and owner RLS; lint, typecheck, 81/81 Vitest and Web production build pass, while save/publish remain disabled and Step02 requires new authorization.
- 2026-07-01: Product Owner granted standing factual documentation authority from Sprint 002E onward; verified Sprint/Step records may be synchronized automatically within listed paths, while all Level 3 product/code/database/security boundaries remain separately gated.
- 2026-07-01: Completed Sprint 002E-Step02 Draft Body Save with the minimal `chapters` body-update grant, owner-only Server Action persistence, first-save Chapter creation and same-Chapter updates; local Supabase reset, Phase 2 SQL suite, workspace lint/typecheck, 86/86 Vitest and Web production build all pass.
- 2026-07-01: Completed Sprint 002F Minimal Publish Workflow with owner-only draft publish, publish-time body persistence, first-Chapter publish fallback, Reader hybrid published reads, local Supabase reset, extended Phase 2 SQL suite, workspace lint/typecheck, full Vitest and Web production build all passing.
- 2026-07-01: Completed Sprint 002G Public Reading by moving `/articles/[slug]` onto the same hybrid published gateway as Work/Chapter routes; Reader now consistently prefers published database content with published fixture fallback, draft isolation remains intact, and workspace lint/typecheck/full Vitest plus the Web production build pass without any new database-side change.
- 2026-07-01: Completed Sprint 002H Bookshelf / Library by turning `/works` into a Reader Library Hub with continue-reading, latest-bookmark, local shelf summaries and minimal client-side filtering; `/archive` remains the detailed local shelf, published-only isolation stays intact, and workspace lint/typecheck/full Vitest plus the Web production build pass without any new database-side change.
- 2026-06-29: Published Milestone v0.1 release baseline to GitHub and archived release documentation for Phase 1 Foundation plus Sprint 002A Website Shell.
- 2026-06-29: Set the current repository milestone to v0.1 Released and moved the planning focus to Sprint 002B.
- 2026-06-29: Completed Phase 1C engineering implementation and all locally available gates; database rebuild/SQL role-matrix execution and Product Owner phase acceptance remain.
- 2026-06-29: Established verified email/password identity, invitation-only membership admission, derived Reader capability, manual elevated role grants and audited RLS workflows under D-033/ADR-018.
- 2026-06-29: Added RuntimeConfig, Trusted Identity/Session, repository/provider isolation and the provider-neutral ObjectStorage contract; pages do not consume raw environment or Supabase clients.
- 2026-06-29: Replaced the one-operation-only rule with a root-cause retry limit: one Product Owner-approved controlled retry per root cause, then mandatory stop on repeated failure.
- 2026-06-29: Established the permanent Runtime Contract: NVM-provided Node.js 24.x, current approved Node.js 24.18.0, pnpm 11.7.0 and the official npm registry across every project entry point.
- 2026-06-29: Added the mandatory Sprint startup gate and root-cause-first environment rule; development begins only after environment, toolchain, version and dependency checks pass.
- 2026-06-28: Added the permanent escalation workflow and made it mandatory startup context; product, UX, schema, auth, permission, dependency, technology, module-removal, roadmap and architecture changes require Product Owner approval.
- 2026-06-28: Added the permanent environment-issue policy and made it mandatory startup context; environment failures block operations without changing product status or architecture.
- 2026-06-28: Revised the permanent language policy: Product Owner communication and formal product-document content use Simplified Chinese; technical and filesystem naming remain in English; no translation-only migration is required.
- 2026-06-28: Added the initial language policy and made it mandatory startup context.
- 2026-06-28: Phase 0.6 completed final documentation architecture, registries, ADRs, Phase packages and AI behavior contract. No application code or packages introduced.
- 2026-07-12: Product Owner accepted UX-06C Step 02. Reading typography, rhythm and progressive Reading controls are frozen; existing preference values, storage and theme behavior remain unchanged. Step 03 is not authorized.

## Admin P1-04B Ordinary Governance UI（2026-08-20）

- P1-04B adds only ordinary Membership state and Author Grant/Revoke to the P1-03
  read UI. Review re-reads through Service, normalizes reason, binds expected-state
  and creates a server-owned stable requestId; confirm invokes at most one mutation.
- Safe explicit retry reuses the same requestId; Conflict retains current snapshot/
  token, clears the executable Review and requires refresh/new Review.
- Elevated writes remain non-executable and deferred by KI-033. No database, remote,
  Production or release action occurred; no Commit is authorized yet.
