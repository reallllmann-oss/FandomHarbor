# Package B4a-0.5：Preview 环境解阻与启动准备

- 日期：2026-10-15（Asia/Shanghai）
- 状态：`ASSESSMENT COMPLETE / B4a-1 NOT READY`
- 范围：历史 QA 恢复可行性、Vercel 授权诊断、B0/B1/B2 发布准备和 B4a-1 门禁
- 远端写入：`NONE`

## 1. 结论

B4a-0.5 的只读评估已完成。推荐路径是：**经 Product Owner 单独授权后，仅恢复历史 QA1 `fandom-harbor-admin-p1-qa` 作为首选候选，并在任何 Migration 前完成严格只读 preflight；若 catalog、Auth 配置或清理状态与历史证据不一致，则放弃复用并新建独立 `fandom-harbor-v1-preview`。**

QA2 不作为首选，因为它在旧 20-Migration 链中已经应用 Migration D，而后来插入的 Pre-D Migration 是否已补齐无法在 inactive 状态下证明。不得通过手工修 migration history、跳过 Pre-D 或重置项目解决此歧义。

B4a-1 仍未满足启动条件。当前 Vercel 缓存访问令牌已经过期，Preview 分支/SHA、Protection、环境变量 scope 和 Supabase ref 均未能核实；同时任何 QA 恢复、新项目创建、Migration、部署或配置写入都尚未获得授权。

## 2. 历史 QA 项目状态

Supabase 组织当前为 Free 计划。只读项目清单如下：

| 项目                              | Ref                    | 创建时间   | 当前状态         | 历史权威状态                                                             | 恢复判断                               |
| --------------------------------- | ---------------------- | ---------- | ---------------- | ------------------------------------------------------------------------ | -------------------------------------- |
| Production `fandom-harbor`        | `szfhngifsipsrxcpekti` | 2026-06-29 | `ACTIVE_HEALTHY` | 21 个正式 Migration，B1/B2 未应用                                        | 仅作隔离对照，禁止作为 Preview         |
| QA1 `fandom-harbor-admin-p1-qa`   | `gqtchjrmpuxibxmurvfd` | 2026-08-20 | `INACTIVE`       | P1-07C 最后已知为 20/21：Pre-D 已应用、D 未应用；合成身份清理为零        | **首选恢复候选**，但恢复后必须重新证明 |
| QA2 `fandom-harbor-admin-p1-qa-2` | `hicfnlwzmnbxhimyeviy` | 2026-08-20 | `INACTIVE`       | 早期 20/20 clean bootstrap 和业务 QA PASS；之后的 Pre-D 是否补齐缺乏证据 | 不推荐作为 B4a Preview 首选            |

管理接口只返回 `INACTIVE`，不返回 paused_at 或暂停原因，因此不能把当前停用状态绝对归因为自动暂停：

- QA1 曾在第一次失败后人工暂停，后来又恢复并用于 P1-07C；2026-09-28 仍有 active QA 证据。当前再次 inactive 可能是 Free 计划低活动自动暂停，也可能是人工暂停，证据不足。
- QA2 在 2026-08-22 清理完成时仍为 active，当前 inactive 的具体触发时间和原因同样未知。

当前官方规则允许 Free 项目在暂停后一年内从 Dashboard 恢复，并恢复原有数据与配置。两个项目创建时间均距今不足两个月，因此时间上处于恢复窗口；最终仍须由 Product Owner 在 Dashboard 确认存在 `Resume project`、剩余窗口和账单提示。

Free 项目恢复时会升级到当前最新 minor version。两个 QA 当前记录为 PostgreSQL `17.6.1.155`，恢复后可能进入 17.11；恢复后的 extension、Auth、trigger、RLS 和性能检查不可省略。仓库使用 pgcrypto 的 digest/random 能力，未发现受 2026-09-25 breaking change 影响的 legacy PGP cipher、ltree、btree_gist float 或自定义 operator 用法。

## 3. QA1 恢复后的强制只读 preflight

恢复本身须独立授权。恢复成功后，在 B1/B2 Migration 前只允许读取并满足以下全部条件：

1. Project ref 与 API/database host 明确不同于 Production。
2. Migration catalog 精确为当前期望的历史前缀；首选候选应为 20/21，Pre-D 已应用且 D 未应用。
3. 不存在未知 Migration、手工 patch 或 repair 标记。
4. Auth users、identities、sessions、refresh tokens、MFA factors 和 P1 synthetic namespace 均为零。
5. Profiles、Memberships、Role Grants、invitation/redemption、临时 policy binding、elevated intent、synthetic Audit/Ledger 均无残留。
6. 历史 Site Copy seed/Audit 等非合成基线与证据一致，不做清空或重建。
7. Data API schema、RLS、function grants、private schema、Auth Hook 和 URL/SMTP 配置全部盘点。
8. 恢复后 PostgreSQL/service version 和 2026-09-25 breaking-change 检查无阻断。
9. 先生成脱敏 catalog/config 快照，再讨论任何 Migration。
10. 任一项不一致立即 Stop Gate，转为新建 Preview，不对旧项目做现场修理。

QA1 通过以上门禁后，缺失 Migration 顺序必须是：

1. `20260819225318_admin_p1_identity_access_cutover.sql`（D）
2. `20261013170940_v1_email_identity_reservations.sql`（B1）
3. `20261014112425_b2_auth_flow_server_boundaries.sql`（B2）

新建项目则从 `20260629210000` 到 `20261014112425` 按文件名顺序完整应用 23 个 Migration。不得跳过、重排、复制 schema 或手工插入 migration history。

## 4. 费用与配额

- 当前组织为 Free；官方当前规则为一个账户最多两个 active Free 项目，paused 项目不计额度。
- 当前只有 Production active。恢复 **一个** QA 后将是两个 active 项目，按当前规则应仍为 `$0/月`，前提是没有该账户在其他组织中的未显示 active Free 项目或付费 add-on。
- 同时恢复 QA1 和 QA2 会达到三个 active 项目，超出 Free 限额；不建议也未授权。
- paused 项目本身不产生 compute 费用。
- Free 项目低活动一周后可能再次自动暂停；短期 B4a-1 可接受，但持续 Preview 可用性不能据此保证。
- 若升级当前组织到 Pro，计划起价为 `$25/月`；两个默认 compute 项目按当前定价估算约 `$35/月`（一个组织订阅、两个约 `$10` compute、减 `$10` credit）。实际 Checkout、税费和用量必须由 Product Owner 确认。组织升级会同时改变 Production 所在组织的计划，因此不得仅为 Preview 擅自升级。
- 新建第二个 Free Preview 项目在 Free 配额内也可为 `$0`，但创建仍是远端写入并需授权。

## 5. Vercel 授权诊断

本地状态：

- 当前 worktree 没有 `.vercel/project.json`，不会误用另一个 checkout 的本地链接。
- 主工作区的忽略文件存在有效结构，项目名为 `fandom-harbor-web`；orgId/projectId 未输出。
- 本机未安装 Vercel CLI。
- Vercel auth 文件存在 access/refresh token 字段，但 access token 已于 `2026-10-14 06:14:28 +0800` 过期。
- 先前唯一一次只读 API 核查返回 `403 Not authorized`；与过期 token 一致。未进行 refresh、login 或重复重试。

受影响的 Preview branch/SHA、Deployment Protection、environment variables、Supabase ref、Redirect URL 和 Production 误连风险继续标记 `UNKNOWN / STOP GATE`。

### Product Owner 一次性人工操作

1. 在浏览器打开 Vercel Dashboard，并登录拥有 `fandom-harbor-web` 的正确账户/Team。
2. 如提示，完成 Passkey、Touch ID 或账户 MFA。
3. 打开 `fandom-harbor-web` 项目，确认自己能读取 Deployments、Settings、Environment Variables 和 Deployment Protection。
4. 保持该浏览器会话，不需要复制或发送 token、secret、project ID。
5. 告知 Codex“Vercel Dashboard 已登录并打开该项目”，再授权一次只读续查。

在此操作完成前，本任务停止 Vercel 相关探测，不尝试其他账号、密钥、API 或自动刷新。

## 6. B0/B1/B2 发布文件清单

### 6.1 必须进入正式 Commit 的运行时代码与配置合同

- `.env.example`
- `apps/web/package.json`
- `pnpm-lock.yaml`
- `apps/web/src/app/access/page.tsx`
- `apps/web/src/app/auth/actions.ts`
- `apps/web/src/app/auth/sign-in/page.tsx`
- `apps/web/src/app/auth/sign-up/page.tsx`
- `apps/web/src/app/auth/forgot-password/page.tsx`
- `apps/web/src/app/auth/reset-password/page.tsx`
- `apps/web/src/app/auth/verify-email/page.tsx`
- `apps/web/src/app/account/security/page.tsx`
- `apps/web/src/app/web-account-menu.tsx`
- `apps/web/src/lib/server-action-security.ts`
- `apps/web/src/lib/server-auth-security.ts`
- `apps/web/src/lib/server-registration.ts`
- `packages/auth/src/provider.ts`
- `supabase/config.toml`
- `supabase/migrations/20261013170940_v1_email_identity_reservations.sql`
- `supabase/migrations/20261014112425_b2_auth_flow_server_boundaries.sql`
- `supabase/templates/confirmation.html`
- `supabase/templates/recovery.html`
- `supabase/templates/email-change.html`

`supabase/config.toml` 是可版本化的本地/目标配置合同，但不会自动等价为 hosted Auth 配置；B4a-1 必须对 Dashboard 实际值逐项核对。

### 6.2 必须 Commit、但不得进入 Production runtime 的测试材料

- `apps/web/src/app/auth/actions.test.ts`
- `apps/web/src/lib/server-action-security.test.ts`
- `apps/web/src/lib/server-auth-security.test.ts`
- `apps/web/src/lib/server-registration.test.ts`
- `packages/database/src/migration-contract.test.ts`
- `supabase/tests/b2_auth_flow_server_boundaries.sql`
- `supabase/tests/v1_email_identity_reservations.sql`
- `supabase/tests/v1_email_identity_reservations_concurrency.sql`
- `supabase/tests/v1_email_identity_runtime_fixture.sql`
- `scripts/test-b1-admin-auth-expired-activation.mjs`
- `scripts/test-b1-admin-auth-feasibility.mjs`
- `scripts/test-b1-admin-auth-security.mjs`
- `scripts/test-b1-legacy-auth-compatibility.mjs`
- `scripts/test-b2-legacy-web-login.mjs`
- `scripts/test-b2-recovery-grant.mjs`
- `scripts/test-b2-web-auth.mjs`

这些脚本与 SQL 是可审阅的本地/隔离环境验收工具，应保留在仓库，但不得由 Vercel build、Production startup 或远端 deploy hook 自动执行。

### 6.3 必须 Commit 的架构与验收文档

- `docs/17_Architecture_Decisions/ADR-025.md`
- `docs/17_Architecture_Decisions/README.md`
- `docs/15_Sprint/V1_Package_B/B0_AUTH_ARCHITECTURE_AND_IMPLEMENTATION_PLAN.md`
- `docs/15_Sprint/V1_Package_B/B2_FINAL_ACCEPTANCE.md`
- `docs/15_Sprint/V1_Package_B/B4A0_PREVIEW_MAIL_INFRASTRUCTURE_READINESS.md`
- `docs/15_Sprint/V1_Package_B/B4A0_5_PREVIEW_ENVIRONMENT_UNBLOCK_READINESS.md`

### 6.4 必须排除的本地状态

- `.env`、`.env.*` 的真实值；
- `.vercel/` 本地 project link 和任何 auth 文件；
- `supabase/.temp/`、本地数据库 volume、Mailpit 邮件；
- `.next/`、`node_modules/`、coverage、test-results、临时 runner、trace、截图；
- 真实 Supabase secret、Resend/API/SMTP credential、Vercel token；
- OTP、密码、refresh/session token、真实邮箱名单和真实账号导出。

上述关键目录当前均由 `.gitignore` 覆盖；正式 commit 前仍需对 staged diff 单独执行 secret scan。

## 7. 建议 Commit / PR 分组

1. **Database foundation**：B1/B2 两个 Migration、migration contract、全部 SQL tests。要求从零 23/23 回放和 upgrade 21→23 都通过。
2. **Application Auth flow**：server-only modules、provider、Actions/UI、模板与 `config.toml`、Web tests、package/lockfile、`.env.example`、真实 GoTrue test scripts。该 commit 内保持代码与页面合同一致。
3. **Architecture and evidence**：ADR-025、B0 plan、B2 acceptance、B4a readiness 文档。

PR 依赖：三个 commit 完成 secret scan、`git diff --check`、历史 PASS 证据映射及必要增量 CI 后才可建立。PR 合并或 Preview deploy 不得自动触发 Production Migration；Preview target、ref 和变量必须先完成独立核验。

部署前安全检查：

- staged 文件精确清单与 Migration checksum；
- secret/high-entropy/token scan；
- `server-only` import 与 browser bundle 检查；
- Preview/Production env scope diff；
- Preview ref 非 Production 的双人确认；
- Migration dry-run 只列出预期缺失版本；
- Auth hooks/grants/RLS/search_path 合同；
- registration mode=`legacy`、Email Confirmation 关闭、注册暂停；
- 回滚快照、负责人和测试时窗。

## 8. B4a-1 分阶段授权与 Stop Gate

| 阶段                       | 所需授权                                            | Stop Gate                                              |
| -------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| 1. 恢复 QA1 或创建 Preview | 指定唯一目标；确认 Free/付费影响；允许远端资源写入  | 目标 ref 不明、无法恢复、出现费用提示未批准            |
| 2. 恢复后只读 preflight    | 允许读取 catalog/Auth/config                        | 非零合成身份、未知 Migration、与 Production ref 相同   |
| 3. Vercel 只读核验         | PO 完成浏览器登录/MFA并授权续查                     | Protection/env/ref 任一 UNKNOWN 或指向 Production      |
| 4. Commit/Push/PR          | 分别批准 Git 写入与远端 PR                          | secret scan/CI/diff 不通过                             |
| 5. 隔离 Preview deploy     | 指定精确 SHA、Preview scope 和 Protection           | Production deploy/alias/env 被触发                     |
| 6. Preview Migration       | 明确批准目标 ref 与版本序列                         | dry-run 多出、缺失或重排任何版本                       |
| 7. Preview Auth 配置       | 批准 URL、Hook、Email Confirmation 和 mode 切换窗口 | legacy/新模式出现可绕过中间态                          |
| 8. Resend/DNS/SMTP         | 批准供应商、子域、记录、Credential、From/Reply-To   | DNS 冲突、credential scope 混用、Production 子域被触碰 |
| 9. 合成邮箱投递            | 批准收件箱名单、额度、CAPTCHA和发送窗口             | 真实用户、跨环境、日志泄漏或投递认证失败               |
| 10. 最终验收               | 批准验收窗口与证据保留                              | 未验证 active、超售、泄漏、回滚不可用                  |

每一阶段是独立授权，不得用前一阶段授权推导后一阶段或 Production 权限。

## 9. 当前 Git 状态与本轮边界

- Branch：`codex/v1-package-b0-auth-architecture`
- HEAD / `origin/main`：`b8c9869ef285f5cc08c7820ac5d4aed0eac829f2`
- tracked 修改：13 项
- `git status` untracked 顶层/路径项：26 项；其中包含 B0/B1/B2/B4a 文档目录
- `git diff --check`：PASS
- Reset/Clean/Stash/Commit/Push/PR/Merge/Deploy：NONE
- Supabase restore/create/migration/config：NONE
- Vercel/DNS/Resend/SMTP/Production 修改：NONE

最终状态：`WAITING FOR PRODUCT OWNER B4a-1 AUTHORIZATION`
