# Architecture and Product Decisions

Accepted decisions are authoritative until explicitly superseded. New entries include date, status, context, decision and consequences.

## D-001 — Product identity

- Date: 2026-06-28
- Status: Accepted
- Decision: Fandom Harbor is a modern private AO3-inspired archive, reading and creator platform with an invitation-only community. It is not social media, a forum, blog or generic novel website.
- Consequence: Features must improve reading, publishing, governance or maintainability; engagement mechanics without that value are rejected.

## D-002 — Product surfaces (superseded application count)

- Date: 2026-06-28
- Status: Superseded by D-017 for application topology; original product-role boundary retained
- Decision: Maintain two deployable Next.js applications: `apps/web` for Visitor/Reader/Author and `apps/admin` for Admin/Super Admin.
- Consequence: Role differences do not justify four duplicated applications. Admin remains separately navigated/deployed and tightly gated.

## D-003 — Invitation-gated archive

- Date: 2026-06-28
- Status: Accepted
- Decision: Visitors may see introduction/access pages but not gated work bodies. The first version uses unified archive admission after invitation redemption.
- Consequence: Search, caches, previews and assets must not leak archive content to visitors.

## D-004 — No heavy social features

- Date: 2026-06-28
- Status: Accepted
- Decision: No follows, private messages, feeds, fan pages, reposts or public competitive rankings.
- Consequence: Bookmarks, recommendations, Kudos and comments remain attached to archive/reading behavior.

## D-005 — Manual Author elevation

- Date: 2026-06-28
- Status: Accepted
- Decision: Author is granted manually by Admin or Super Admin. Invitation admission never elevates Author/Admin/Super Admin.
- Consequence: Membership and role grants are separate domain records and permissions.

## D-006 — Governed free-form tags

- Date: 2026-06-28
- Status: Accepted
- Decision: Authors use typed free-form tags; Admins can canonicalize, alias and merge them while preserving redirects and historical intent.
- Consequence: Tags require governance state and canonical relationships, not a flat comma-separated field.

## D-007 — Multiple pen names with identity separation

- Date: 2026-06-28
- Status: Accepted
- Decision: One private account may own multiple reader-facing pen names. Private account identity is not exposed through pen-name responses.
- Consequence: Auth/profile, pen name and work authorship are separate tables/security domains.

## D-008 — Approved technology stack

- Date: 2026-06-28
- Status: Accepted
- Decision: Next.js App Router, TypeScript, Supabase/PostgreSQL, Tailwind CSS, shadcn/ui, TipTap, Zod, React Hook Form, TanStack Query, Lucide Icons and Vercel.
- Consequence: Replacements require explicit product-owner approval. Exact compatible stable versions are pinned only when package installation is authorized.

## D-009 — Modular monolith

- Date: 2026-06-28
- Status: Accepted; “two applications” wording superseded by D-017
- Decision: Start as two applications over purpose-specific shared packages and one Supabase/PostgreSQL domain model; no premature microservices.
- Consequence: Apps depend on packages, packages never depend on apps, and extraction requires measured need.

## D-010 — Shared-code boundary

- Date: 2026-06-28
- Status: Accepted
- Decision: Do not use `apps/shared`. Reusable code belongs in a purpose-specific `packages/*` boundary.
- Consequence: The previously created empty `apps/shared` directory is removed during foundation rebuild.

## D-011 — Authorization defense in depth

- Date: 2026-06-28
- Status: Accepted
- Decision: Server workflow checks and PostgreSQL RLS/grants are both mandatory. UI hiding and route middleware/proxy checks are UX layers, not authorization boundaries.
- Consequence: Every affected feature includes role/ownership allow and deny tests.

## D-012 — Versioned structured content

- Date: 2026-06-28
- Status: Accepted
- Decision: TipTap JSON is the canonical editable representation for text content; immutable revisions store schema-versioned snapshots. Rendered HTML/plain text are derived.
- Consequence: Rendering is sanitized, restore creates a new revision, and schema evolution requires migrations/compatibility handling.

## D-013 — Documentation before development

- Date: 2026-06-28
- Status: Accepted
- Decision: Every feature follows Research → Requirement → Architecture → Database → API → UI → Review → Development → Testing → Documentation Update.
- Consequence: Sprint roadmap envelopes do not authorize code; an approved Sprint brief and acceptance criteria do.

## D-014 — Project identity

- Date: 2026-06-28
- Status: Accepted
- Decision: Public name is Fandom Harbor and project folder is `FandomHarbor`.

## D-015 — Product Phase and Sprint hierarchy

- Date: 2026-06-28
- Status: Accepted in completed Phase 0.5
- Decision: Phase is the product-stage roadmap unit; Sprint is an engineering execution unit inside a Phase.
- Consequence: Product progress is reported by Phase, while each implementation Sprint retains an approved brief and acceptance gate.

## D-016 — Numbered documentation taxonomy

- Date: 2026-06-28
- Status: Superseded by D-019 during Phase 0.6
- Decision: Detailed documentation uses `docs/00_Project` through `docs/16_Research` as the permanent category structure.
- Consequence: Existing documents are migrated without content deletion and all references must use the numbered paths.

## D-017 — Documentation browsing application

- Date: 2026-06-28
- Status: Accepted in completed Phase 0.5
- Decision: The repository has three application boundaries: `apps/web`, `apps/admin` and a reserved future `apps/docs` read-only documentation browsing surface. Root `.ai/` and `docs/` Markdown remain authoritative.
- Consequence: This supersedes D-002's two-application count and D-009's app-count wording without changing the modular-monolith decision. The docs app must not create an editable duplicate source or expose restricted operational documentation by default.

## D-018 — Decision separation

- Date: 2026-06-28
- Status: Accepted in completed Phase 0.5
- Decision: `DECISIONS.md` owns architecture/database/technology/permission/long-term engineering decisions; `DESIGN_DECISIONS.md` owns UI/interaction/product/reading experience decisions.
- Consequence: Cross-cutting decisions may link between both files but must have one clear owner.

## D-019 — Final documentation taxonomy

- Date: 2026-06-28
- Status: Accepted as an explicit Phase 0.6 instruction; overall Phase gate remains awaiting approval
- Supersedes: D-016
- Decision: Freeze the numbered taxonomy at `00_Project` through `18_Research`, with `06_Design_System`, `07_Component`, `17_Architecture_Decisions` and shifted downstream categories.
- Consequence: After Phase 0.6 approval, large-scale restructuring requires product-owner approval and a superseding ADR.

## D-020 — UI, Design System and Component separation

- Date: 2026-06-28
- Status: Accepted as an explicit Phase 0.6 instruction
- Decision: UI documents experience, Design System owns reusable tokens/layout/accessibility rules, and Component owns implementation contracts.
- Consequence: Raw token definitions cannot live in UI experience docs or component-local forks.

## D-021 — Database and interface traceability registries

- Date: 2026-06-28
- Status: Accepted as an explicit Phase 0.6 instruction
- Decision: Every database object and interface must belong to a documented registry category before implementation.
- Consequence: Migrations/RLS/indexes and REST/ServerActions/Realtime/Webhooks/Events gain explicit ownership and review paths.

## D-022 — Permanent ADR layer

- Date: 2026-06-28
- Status: Accepted as an explicit Phase 0.6 instruction
- Decision: `.ai/DECISIONS.md` remains compact memory while `docs/17_Architecture_Decisions/` stores permanent decision rationale and consequences.
- Consequence: Durable architecture changes update both the memory index and the relevant ADR.

## D-023 — Mandatory AI behavior contract and Phase packages

- Date: 2026-06-28
- Status: Accepted as an explicit Phase 0.6 instruction
- Decision: AI Tech Lead behavior is mandatory, and every Product Phase owns README, Goals, Scope, Acceptance, Risks, Sprint Template and Retrospective.
- Consequence: Speed-only generation and Phase/Sprint mixing are process violations.

## D-024 — Communication and project artifact language

- Date: 2026-06-28
- Status: Superseded by D-025 for language allocation; mandatory startup and Sprint approval requirements retained
- Decision: Product Owner communication defaults to Simplified Chinese unless explicitly requested otherwise. Code, database identifiers, API identifiers, formal project documentation and Git metadata use English. `.ai/LANGUAGE_POLICY.md` is mandatory startup context.
- Consequence: Every new conversation reads the language policy before work, Sprint reports follow the approved Simplified Chinese structure, and the next Sprint or Phase never begins without Product Owner approval.

## D-025 — Chinese product documentation with English technical naming

- Date: 2026-06-28
- Status: Accepted as an explicit Product Owner instruction
- Supersedes: D-024 language allocation; mandatory startup and Sprint approval requirements remain in force
- Decision: Product Owner communication and formal product-document content use Simplified Chinese. File names, directory names, database identifiers, code identifiers, variables and API identifiers use English. Existing documents do not require translation solely for language consistency.
- Consequence: `LANGUAGE_POLICY.md` remains mandatory startup context; documentation work preserves English file names while writing product content in Chinese, and no translation-only migration is authorized.

## D-026 — Permanent environment-issue workflow

- Date: 2026-06-28
- Status: Accepted as an explicit Phase 1 supplement from the Product Owner
- Decision: Network, registry, package installation, remote-service, runtime, browser-installation, Docker, CI, Sandbox and local operating-system failures are Environment Issues rather than product, architecture or Sprint failures. `.ai/ENVIRONMENT_POLICY.md` is mandatory startup context.
- Consequence: The affected technical operation stops after one recorded failure; the Sprint becomes Blocked for Environment Issue without changing protected product documents; retry, tool replacement, registry changes, dependency downgrade or architecture changes require explicit Product Owner approval.

## D-027 — Tech Lead escalation boundaries

- Date: 2026-06-28
- Status: Accepted as an explicit permanent rule from the Product Owner
- Decision: `.ai/WORKFLOW.md` defines the Tech Lead's autonomous decision boundary. Refactoring, file organization, component extraction, performance optimization, bug fixes, test improvements and documentation updates may proceed autonomously. Product features, user experience, database schema, authentication, permissions, new dependencies, technology replacement, module removal, roadmap and architecture changes require Product Owner approval.
- Consequence: `WORKFLOW.md` is mandatory startup context. When classification is uncertain, work stops and the Tech Lead requests approval rather than assuming authority.

## D-028 — Mandatory Sprint startup checks

- Date: 2026-06-29
- Status: Accepted as an explicit permanent rule from the Product Owner
- Decision: Every Sprint begins with Environment Check → Toolchain Check → Version Check → Dependency Check. Development starts only after all four checks pass with recorded evidence. Environment failures require root-cause diagnosis before any retry is considered.
- Consequence: Sprint templates and startup workflow include the four checks. A failed check blocks development under `ENVIRONMENT_POLICY.md`; retry is never the first diagnostic action and still requires Product Owner approval after an Environment Issue.

## D-029 — Canonical Runtime Contract

- Date: 2026-06-29
- Status: Accepted as an explicit permanent rule from the Product Owner
- Decision: Fandom Harbor uses NVM-provided Node.js 24.x LTS, currently approved at 24.18.0, pnpm 11.7.0 and `https://registry.npmjs.org/` across local development, Codex, CI, Git Hooks, Playwright and Vercel. `.nvmrc`, `packageManager` and `engines.node` bind the repository to this contract.
- Consequence: Node.js 16, per-command PATH switching, multiple project pnpm versions, registry mirrors and tool-level runtime switching are not accepted. Husky/Git Hooks may verify the contract and fail closed but may not install or switch runtimes.

## D-030 — One controlled retry per root cause

- Date: 2026-06-29
- Status: Accepted as an explicit permanent rule from the Product Owner
- Supersedes: Any interpretation that an Environment Issue can never be retried or can be retried repeatedly
- Decision: After an Environment Issue is diagnosed and reported, the same root cause may receive exactly one Product Owner-approved controlled retry. If that retry fails for the same root cause, the operation stops with no further retry.
- Consequence: Retry is never the first diagnostic action. A materially different root cause starts a new Environment Issue only when supported by evidence; renaming a failure cannot reset the retry limit. Internal reconnect attempts within one running tool process are recorded but do not count as a new top-level retry.

## D-031 — Vercel + Supabase deployment baseline with a staged cloud-server exit path

- Date: 2026-06-29
- Status: Accepted as an explicit Product Owner instruction
- Related ADR: `docs/17_Architecture_Decisions/ADR-017.md`
- Decision: 当前使用 Vercel 部署 Next.js 应用，使用 Supabase 提供 Auth、PostgreSQL 和 Storage。业务代码通过 `auth`、`database`、`services` 和 `config` 的最小边界使用平台能力，保持标准 Node.js 运行时、无状态计算、可重建 PostgreSQL 策略和可导出数据。当迁移触发条件成立时，先把 Next.js 计算层迁往传统云服务器并保持 Supabase 不变，再分别评审 Storage、PostgreSQL 和 Auth，不执行一次性整体切换。
- Consequence: 现阶段不引入双平台实现或新基础设施依赖；Vercel/Supabase SDK 类型不得泄漏到领域合同。未来迁移必须有新的执行 ADR、容量/成本证据、数据与权限等价性演练、流量切换和回滚方案。

## D-032 — Controlled autonomous engineering execution

- Date: 2026-06-29
- Status: Accepted as an explicit Product Owner instruction
- Supersedes: D-027's escalation classification and D-028's interpretation that routine checks or low-risk check repairs need per-operation approval; D-026/D-030 Environment Issue retry controls remain authoritative
- Decision: 已批准 Sprint/Phase 内的工程工作按 Level 1–3 分级。Level 1 允许不超过 5 个文件的 lint/type/hooks/format/build/test 与行为不变修复自动执行；Level 2 允许 6–10 个文件的局部 UI、测试、去重、可访问性和响应式调整自主执行并重点报告；Level 3 覆盖 manifest/lockfile/依赖、runtime/registry、API/schema/auth/permission、environment/deployment/CI、security/privacy/payment/deletion、产品决策、超过 10 个文件或无法分级的变更，必须写入前审批。
- Consequence: 已批准 Sprint 的 Environment/Toolchain/Version/Dependency/Type/Lint/Build/Test 检查可自动运行。Type/Lint/Build/Test 失败且修复属于 Level 1/2 时，Codex 直接修复并重跑；不得为例行低风险工程修复反复暂停。Environment Issue 、受控重试与 Level 3 仍保持审批边界。

## D-033 — Phase 1C identity, admission and role model

- Date: 2026-06-29
- Status: Superseded in part by D-037 / ADR-020 on 2026-07-02
- Related ADR: `docs/17_Architecture_Decisions/ADR-018.md`
- Resolves: KI-001, KI-006 and KI-011 for Phase 1
- Decision: Phase 1 使用 Supabase Auth email/password 与强制邮箱验证，Magic Link 延后独立评审。有效邀请码在数据库原子事务中只创建 active membership，active membership 本身提供 Reader capability；Author、Admin 和 Super Admin 只能通过手工、可审计的 `role_grants` 授予。邀请支持 hash、次数、期限、撤销和邀请链，不自动处罚后代。产品邮件选择 Resend 作为 Supabase Custom SMTP provider，不引入应用邮件 SDK。
- Consequence: 身份 provider claims 必须映射为项目内部 Trusted Identity；用户可编辑 metadata/JWT 不得作为角色事实源。敏感操作从 PostgreSQL membership/role grants 获取当前 capability，并由服务端授权 + RLS 双层强制。远程 Supabase/Resend 项目、SMTP 凭据与首个 Super Admin 仍由受控运维流程配置，不进入 seed 或仓库。

保留项：active Membership 派生 Reader capability、手工高权限 `role_grants`、邀请链、审计及服务端 + RLS 双层授权继续有效。Email/verified-email/SMTP Auth 部分由 D-037 替代。

## D-034 — Works, chapters and articles content foundation

- Date: 2026-06-30
- Status: Accepted as an explicit Product Owner approval for Phase 2 / Sprint 002A
- Related ADR: `docs/17_Architecture_Decisions/ADR-019.md`
- Decision: 内容领域以 `works` 承载可分章作品容器、`chapters` 承载作品内有序正文、`articles` 承载无需作品容器的独立文章；分类与标签词表由两类内容共享。slug 唯一范围与路由范围一致。私有 `owner_user_id` 仅用于授权，公开署名继续由后续 Pen Name/authorship 模型承担。
- Consequence: 已发布内容仅对 active Membership 可读；拥有 Author 角色的所有者管理自己的内容，Admin/Super Admin 管理全部内容。RLS 复用 Phase 1 Membership/`role_grants`，不建立第二套权限体系。正文 Revision/编辑器、公开访客阅读、删除和社区功能不在本 Sprint。

## D-035 — Autonomous factual Sprint documentation

- Date: 2026-07-01
- Status: Accepted as an explicit Product Owner instruction, effective from Sprint 002E
- Decision: Codex may automatically update the approved README, Sprint, Architecture and `.ai` documentation paths after completing a Sprint/Step to record only verified status, acceptance, command results, Runtime state, modified files, boundaries, risks, blockers and next steps.
- Consequence: Routine factual handoff documentation no longer requires per-Step approval. This authority cannot change code, product behavior, technology decisions, dependencies, package/lockfiles, database objects, auth/permission, publishing, storage/upload, deletion or deployment; those remain separately gated by Level 3. Final reports identify every automatic documentation update and whether further authorization is required.

## D-036 — Continuous Sprint Mode

- Date: 2026-07-01
- Status: Accepted as an explicit Product Owner instruction
- Decision: 在已批准 Sprint 内，Codex 的目标不再是完成单个 Step 后停下，而是持续推进后续 Step，直到整个 Sprint 完成或命中 Level 3 边界。完成一个 Step 后，如果下一 Step 仍属于已批准的 Level 1/Level 2 能力，则直接继续，不再等待新的普通工程授权。
- Consequence: 已批准 Sprint 的连续开发成为默认执行模式。完成每个 Step 后，Codex 自动更新 README、Sprint、docs 与 `.ai` 的事实记录，然后判断下一 Step 是否仍在现有授权边界内；若下一步需要 Migration/Schema/RLS/RPC/Auth/Package/Dependency/Publish 等 Level 3 变更，必须立即停止并提交新的授权申请。

## D-037 — Registration-name credentials and atomic invitation signup

- Date: 2026-07-02
- Status: Accepted as an explicit Product Owner Level 3 approval during Phase 2 acceptance
- Related ADR: `docs/17_Architecture_Decisions/ADR-020.md`
- Supersedes: D-033 的用户邮箱、强制邮箱验证与 Auth SMTP 部分；D-033 的 Membership、角色、邀请链和审计模型继续有效
- Decision: V1 注册只接受注册名、至少 8 位密码和邀请码；登录只接受注册名与密码。注册名在 `profiles` 中大小写不敏感唯一。Supabase Auth 使用由注册名派生的内部不可投递标识，Email Confirm 必须关闭。Auth 用户、Profile、active Membership、Invitation Redemption、邀请码计数和审计记录在 `auth.users` 插入事务内原子完成。
- Consequence: 邀请码无效、过期、撤销、耗尽或注册名冲突时整个注册事务回滚，不留下 Auth 用户。用户可编辑 metadata 只作为触发器输入，不作为运行期身份/角色事实源；Trusted Identity 继续只信任 Auth user ID，权限继续来自 Membership/`role_grants`。

## D-038 — Mission Authorization v1

- Date: 2026-07-02
- Status: Accepted as an explicit Product Owner governance instruction, effective
  from Phase 3
- Supersedes: D-036 and D-032 only where they require Step/Sprint-level pauses or
  separate approval for engineering work already contained in an authorized Mission
- Decision: Product Owner authorizes product direction, Roadmap, Mission scope,
  product decisions and final manual acceptance. Once a Mission is authorized,
  Codex continuously owns its engineering decomposition, implementation, Runtime,
  tests, SQL, Migration, in-scope refactor and bug fixes, documentation and
  regression validation. Mission 3A is authorized for 3A-0, 3A-1, 3A-2 and any
  real P0 work required under 3A-3.
- Escalation boundary: Stop only when Mission scope is insufficient; a new product
  decision, database direction, permission model, third-party dependency,
  Deployment architecture or Auth architecture is required; or a major risk affects
  the later Roadmap.
- Consequence: Internal Steps and Sprint boundaries no longer require repeated
  authorization inside a Mission. Existing security, RLS, migration, testing,
  environment and documentation quality rules remain mandatory. Mission completion
  produces one engineering report, Product Handoff and manual acceptance checklist,
  then stops before the next Mission.

## Pending decisions

Pending matters are not decisions. They are tracked in `KNOWN_ISSUES.md` and move here only after approval.

## Change protocol

Never rewrite an accepted historical decision to disguise a change. Add a new decision with `Supersedes: D-xxx`, migration impact and review trigger.
