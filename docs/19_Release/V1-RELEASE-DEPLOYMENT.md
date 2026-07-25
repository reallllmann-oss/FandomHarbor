# Fandom Harbor V1 Release Deployment

状态：PDR-01 OWNER DECISION COMPLETE — DEPLOYMENT AND SMOKE PENDING / PDR-02 CLOSED FOR CURRENT RELEASE / READY WITH CONDITIONS / DEPLOYMENT NOT AUTHORIZED
日期：2026-07-25
部署类型：Production Policy Release Candidate Preparation（未授权部署）

## 当前 Release Closure（2026-07-25）

当前统一状态、Gate Matrix、工作区文件分类、RC 边界、政策冲突、Owner Action 与下一项 Mission 以 [`V1-PRODUCTION-RELEASE-CLOSURE.md`](./V1-PRODUCTION-RELEASE-CLOSURE.md) 为准。

- Mission=`PASS WITH LEGAL REVIEW PENDING AND DEPLOYMENT REQUIRED`
- 唯一政策规范来源=`V1-PUBLIC-POLICY-V1.0.md`
- PDR-01=`OWNER DECISION COMPLETE / DEPLOYMENT AND SMOKE PENDING`
- PDR-02=`CLOSED FOR CURRENT RELEASE`
- Production Deployment Authorized=`NO`
- Release Approved=`NO`

DECISION-01–27 已应用；独立法律审阅为 `NOT COMPLETED`；Production Policy Deployment 与 Smoke 均未执行。下一项 Mission 为 `Production Policy Release Candidate Commit and Deployment Preparation`。

## PDR-02 Backup Audit 更新（2026-07-25）

- 2026-07-16 历史备份保持 `VALID BUT STALE`，不再作为当前 Release 唯一证据。
- 2026-07-25 22:38:50 +08:00 已创建当前 Production `public,private` Schema 与 Data-only + COPY 仓库外备份；退出码、Manifest、SHA-256、15 / 15 表、权限和 Git 边界均 PASS。
- Owner 确认当前 Free、平台备份=0、PITR=false、Storage Bucket / 对象=0；Recovery Runbook 已更新但未演练。
- 当前 `PDR-02 = CLOSED FOR CURRENT RELEASE`，`PDR-01 = OWNER REVIEW REQUIRED`；Deployment 仍未授权。
- 详见 [`V1-SUPABASE-BACKUP-EVIDENCE.md`](./V1-SUPABASE-BACKUP-EVIDENCE.md) 与 [`V1-SUPABASE-RECOVERY-RUNBOOK.md`](./V1-SUPABASE-RECOVERY-RUNBOOK.md)。

## PDR-01 Web Implementation 更新（2026-07-25）

- `/privacy`、`/terms`、`/content-policy`、Web Footer 与注册页政策入口已实现；`/legal` 保留兼容重定向。
- 工程与本地浏览器验证结论为 `PASS WITH OWNER REVIEW`。
- 来源草稿仍待 Product Owner 批准、生效状态待确认且法律审阅未完成；不得把本轮实现表述为完全 Release Approved。
- 详见 [`V1-PUBLIC-POLICY-WEB-ACCEPTANCE.md`](./V1-PUBLIC-POLICY-WEB-ACCEPTANCE.md)。
- PDR-02 状态不变；未执行 Production Deployment。

## 结论

`Production Readiness Review = PASS`；`Production Deployment Review = BLOCKED`；`PDR-01 = CLOSED FOR DEPLOYMENT`；`PDR-02 = CLOSED FOR DEPLOYMENT`；`Production Ready = READY WITH CONDITIONS`；`Production Deployment Authorized = NO`

详细评审见 [`V1-PRODUCTION-DEPLOYMENT-REVIEW.md`](./V1-PRODUCTION-DEPLOYMENT-REVIEW.md)。当前产品链路、External Beta 与 Production Preparation 已完成，Product P0 / P1 = `0 / 0`；PRC-01 已关闭，PRC-02 至 PRC-06 已 `CLOSED FOR PREPARATION`。最终版本化政策文档、Web `/legal` 页面、注册入口和本地页面验证已完成，PDR-01=`CLOSED FOR DEPLOYMENT`。Supabase Free / No backups 已确认，仓库外 Schema/Data 手动逻辑导出及完整性证据已完成，PDR-02=`CLOSED FOR DEPLOYMENT`。

整体 Production Deployment Review 继续 `BLOCKED` 的唯一原因是最终 RC baseline 尚未刷新：当前 RC SHA 早于 PDR-01/02 最终改动，主工作区还混有冻结 `/access` Admin 改动，不能直接部署。

Product Owner 已确认 3 名 Reader 的小范围外部测试完成并 PASS，外部 Author 测试完成并 PASS。此前 `GO — NOT OPENED` 仅保留为历史评审节点，不再是当前最终状态。

## Production Preparation 最新结论（2026-07-16）

最新证据与最低方案已记录在 [`V1-PRODUCTION-PREPARATION.md`](./V1-PRODUCTION-PREPARATION.md)。PRC-01 已关闭：`codex/v1-production-rc` 的 RC commit 只包含已验收 Reading 与 Release 文档，冻结 `/access` Admin 改动未进入 RC。PRC-02 与 PRC-03 已 `CLOSED FOR PREPARATION`：Product Owner 确认 Web Project、`main`、Vercel 默认 Production Domain / HTTPS、三个 Production 变量名，以及 7 天 invite-only 最低运维包、责任人、监控、RPO / RTO 和条件备份方案。

PRC-04 已 `CLOSED FOR PREPARATION`：当前有效年龄边界为 18+、仅限受邀用户，任何早期 16+ 表述均已被覆盖并作废；V1 仅文本，禁止内容、隐私数据边界、Supabase / Vercel、30 天导出 / 删除目标、受控删除 / 下架责任与联系邮箱均已固定。最终 [`V1-PUBLIC-POLICY.md`](./V1-PUBLIC-POLICY.md) 与 Web `/legal` 已完成，PDR-01=`CLOSED FOR DEPLOYMENT`。

PRC-05 已 `CLOSED FOR PREPARATION`：Product Owner 已批准回滚责任人、默认 Vercel 回滚到上一稳定 Production Deployment、数据库 / 内容处理边界、P0 / P1 条件、21 项 Production Smoke 与 10 项 Rollback Smoke。实际上一稳定 Deployment ID 必须在 rollout 前记录；本 Mission 未部署、回滚或执行 Smoke。

PRC-06 已 `CLOSED FOR PREPARATION`：Product Owner 担任 Governance Owner、Super Admin Owner、Emergency Contact 与 Audit Reviewer；Technical Operator 为 Codex / 技术执行者且须明确授权。Admin Preview 不可用时，可在受控工作站运行与 Production RC 同 SHA 的干净 Admin build，但所有操作仍须走 `/access`、`admin:operate`、RPC 与 audit，且每次 break-glass 必须先获 Product Owner 批准。

当前不能从残留冻结 Admin 改动的未提交工作区部署；后续只能引用最终批准 RC SHA 的干净 checkout。PDR-01 / PDR-02 均已关闭，备份证据见 [`V1-SUPABASE-BACKUP-EVIDENCE.md`](./V1-SUPABASE-BACKUP-EVIDENCE.md)。Vercel 当前没有 Production deployment，上一稳定 Production Deployment ID=`FIRST_PRODUCTION_DEPLOYMENT_PENDING`；Production Smoke=`NOT RUN`。本节不执行 Vercel 配置、域名、部署、账号、邀请码、角色或数据库写操作；`Production Deployment Authorized = NO` 保持不变。

2026-07-15 最新 Gate 已确认 Author001 的 active Membership、active `author` grant、`role.granted` audit、授权后 Studio 三路访问，以及创建、保存草稿、Draft isolation、发布、Work Detail、Published Reading 与 Reader 回读均 PASS。Reader → Author Provisioning Block 与 Author Release evidence gate 均已解除，Product P0 / P1 = `0 / 0`。

Guest 可搜索到已发布作品，但点击作品或章节后进入登录页，符合当前 active Membership 产品规则。390px、Light / Dark 无明显横向溢出或破版，控制台无产品级错误。此前 Go / No-Go 评审结论为 GO；当前 External Beta Closeout 已更新为 PASS，但这仍不等于 Production Ready 或 Production Deployment 授权。

External Beta Closeout 确认 Reader / Guest 规则、Author 发布、Draft isolation、Studio denial、邀请码治理、已知限制、停止 / 回退与反馈模板均已通过实际测试，当前 Product P0 / P1 = `0 / 0`。此前 Online Smoke 的公开内容与 Author evidence 缺口已由 Phase 1、Phase 2 和外部 Beta 证据收口。

实际完成范围为 **3 名外部 Reader + 外部 Author**。测试已经结束，本 Mission 不新增 cohort。任何后续角色或 Membership 处置仍须另行授权并通过受控 `/access` / audit 路径执行。

`/access` Admin 既有改动继续冻结到 Admin 阶段，不在 Beta Closeout 中继续实现或部署。Admin Preview 外部阻塞独立跟踪，不阻塞 External Beta Closeout 或 Production Readiness Review。

Release 流程现已拆分为 Web V1 主站、Admin 最小治理、Admin Preview Deployment 解阻、Release 文档与中文教程四条线。Admin Preview 的 Vercel 外部阻塞不再阻止 Web Preview Smoke；完整 Admin UI 不作为 V1 Beta 硬门槛。详细口径见 [`V1-RELEASE-FLOW-OPTIMIZATION.md`](./V1-RELEASE-FLOW-OPTIMIZATION.md)。

## 已通过门禁

- Node.js `24.18.0`、pnpm `11.7.0` 符合 Runtime Contract。
- Offline frozen install 通过，Workspace 依赖完整。
- Supabase 本地与 linked remote Migration 为 14 / 14，一致。
- `pnpm validate` 通过：format、lint、typecheck、169 项 Workspace tests 与 Web / Admin / Docs production builds 全部通过。
- Web tests 81 / 81，Admin tests 2 / 2。
- `git diff --check` 通过。
- Local QA Fixture 重建与安全凭据命令通过；凭据文件权限为 `0600`。
- Guest、Reader、Author、本地主要页面、Reader Studio denial、Author Studio、Published-only / Draft isolation、1280、390 × 844、Light / Dark 均完成本地复核。

## Git 状态

- 当前分支：`main`。
- 当前 HEAD：`903bf70a6dc370090362098d26bedd6bf68af529`。
- Release Baseline commit：`chore(release): establish V1 release baseline`。
- `main` 与 `origin/main` 一致，ahead / behind = 0 / 0。
- Release Baseline 已正常 push 到 GitHub；未使用 force push。
- 未创建 tag 或 Git Release。

## Secret Audit

- 在 Release Baseline 审计中发现 `docs/18_Design/UX-06D-STEP02_ACCEPTANCE.md` 第 86–87 行曾包含两条 localhost-only QA 密码。
- Product Owner 已接受脱敏与轮换处置；实际密码模式未进入处置前 HEAD 或 Git 历史。
- 明文已经替换为安全凭据命令说明，本地 QA 凭据已重新生成并轮换。
- Release commit 前重新扫描 OpenAI、GitHub、Vercel、Supabase、JWT、private key、database URL、service role、Auth secret 与 QA password 模式，结果为 PASS。
- `.env.local`、应用本地 env、`.local/qa-fixture.json`、`.vercel/`、logs、cache、build output 与 dependencies 均由 `.gitignore` 覆盖。
- Vercel link 自动生成的本地会话变量只保存在被忽略的 `.env.local`；未读取或记录其值，本地 env 文件权限已收紧为 `0600`。
- 没有真实 secret、token、密码、service role key、数据库连接串或测试账号密码被输出或写入文档。

## Supabase

- Linked remote 连接成功。
- Local / Remote Migration：14 / 14 一致。
- 未执行 `db push`、Migration 写入、远程 SQL、RLS / RPC / Auth / Role 变更或数据写入。
- CLI 提示存在可用更新；本轮未升级工具或依赖。

## Environment Variables

代码要求的变量名：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Vercel Preview 环境已存在以下实际构建必需变量：

- `NEXT_PUBLIC_SUPABASE_URL`：Supabase 项目公开 URL。
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`：当前 Web 代码实际读取的浏览器公开 publishable key。

`NEXT_PUBLIC_SITE_URL` 未配置，但 RuntimeConfig 将其定义为可选项，SEO 层会优先使用 Vercel 自动提供的 Preview URL fallback，因此不阻塞本次 Preview；如 Product Owner 希望固定 canonical origin，可后续单独配置。

Product Owner 指定核对的 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 也不存在，但当前代码不读取该名称；V1 Web 使用 publishable key 命名，不得在未确认的情况下以 legacy anon 变量名替代。

本文及本轮其他文档未记录任何变量值、密码、token、service role key 或其他 secret。

## Vercel Project 与 Preview Deployment

- CLI 登录：Confirmed；active team 为 `fandom-harbor`。
- Project：`fandom-harbor-web`，创建成功。
- Root Directory：`apps/web`。
- Framework：Next.js。
- 本地关联：Linked；`.vercel/project.json` 存在但被 `.gitignore` 覆盖，未被 Git 跟踪。
- Git Repository integration：本轮未配置；Preview 从 GitHub baseline `903bf70a6dc370090362098d26bedd6bf68af529` 的临时干净 checkout 发起。
- Preview URL：`https://fandom-harbor-ilvpjubrm-fandom-harbor.vercel.app`。
- Deployment ID：`dpl_2H2tUqGo7UXWrfhSC5FsmoeHGpX8`。
- Deployment 状态：`Preview / Ready`。
- Admin Project：`fandom-harbor-admin` 已创建并关联 GitHub，Root Directory 为 `apps/admin`；Admin Preview Deployment 当前 BLOCKED。
- Docs Project：未创建。
- Production target：`https://fandom-harbor-web.vercel.app`；Custom Domain 未绑定。

新建空项目的首次 CLI 部署被 Vercel 55.0.0 标记为 Production，即使已显式请求 Preview。所有误生成的 Production deployment 均已立即删除；随后使用官方 `redeploy --target preview` 建立并核验当前 Preview。项目现在只保留一条 Preview deployment，没有 Production deployment 或 Custom Domain；V1 后续使用 Vercel 默认 Production Domain。

Codex 执行网络仍无法连接 Preview，但 Product Owner 人工验收已替代自动网络检查，因此旧的网络不可达门禁已关闭。Preview Reader 已通过受控邀请码流程注册并登录；现有 Super Admin 已完成受控 Account Repair，并使用 Registration Name 手动登录成功，因此旧的角色账号可用性门禁也已关闭。

Account Repair 的原因是历史 Bootstrap Auth email 与当前 Registration Name 派生规则不一致；修复范围仅为目标 Auth email 对齐。未再次修改密码，未修改 Profile、Membership 或 role grants，未创建新用户，未输出 secret。

Web 主线当前仍有两个 Release Gate：

- Guest Work Detail、Guest Author Profile、Reader Published Work / Chapter 为 `BLOCKED`，Product Owner 尚未提供具体原因。
- Preview Author 登录、Author capability、Studio 入口与 `/studio` 已确认 `PASS`，“既有 Preview Author 账号可用性”Block 已解除。
- Author 创建 / 保存 / 发布、Reader / Guest 回读与 Draft isolation 仍为 `BLOCKED / NOT RUN`。浏览器导航到 `/studio/works` 后最终回到 `/archive`，随后控制会话持续超时；当前没有确认产品级 FAIL。
- Reader → Author Provisioning Governance Gate 已关闭：新 Reader denial PASS；Product Owner 经 `/access` 手工提交后得到 `status=role-granted`；只读复核确认 Author001 的 active grant、audit 与授权后 Studio 能力均对齐。
- `/access` 早期 `error=invalid` 已由最小输入处理修复并完成人工授权验证。本 Readiness Mission 没有再次授权、修改数据库、部署或修复代码。

## Admin Preview Baseline Branch

- Project：`fandom-harbor-admin`。
- GitHub branch：`codex/admin-preview-baseline`，保留至 Product Owner 完成 Admin Preview 验收。
- Branch commit：`903bf70a6dc370090362098d26bedd6bf68af529`，已通过远程只读复核。
- Root Directory：`apps/admin`；Framework：Next.js。
- Preview 必需变量：`NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 均存在；只检查名称，不读取值。
- `NEXT_PUBLIC_SITE_URL` 未配置，为可选项。
- GitHub Integration 没有自动响应仅创建 branch 的事件；随后以该非 Production branch 作为 Git source 受控触发 deployment。
- Vercel 仍将该 deployment 判定为 Production，违反本 Mission 的 Preview-only 边界。该 deployment 已立即取消并删除，未继续尝试。
- 最终状态：Admin Preview deployments = 0，Admin Production deployments = 0，Admin Preview URL 尚未生成。
- 共享主工作区存在此前 Release / `.ai` 文档改动；没有应用代码或配置改动。远程分支直接固定到 baseline，并通过独立干净 worktree 复核，未修改 `main`。

## Admin Vercel Support Evidence

- Product Owner 已完成 Vercel Dashboard 人工复核：Production Branch=`main`，Preview Branch Tracking=`All unassigned git branches`，Root Directory=`apps/admin`，Deploy Hooks=0，Custom Environments=0，Preview / Production deployments=0 / 0。
- Dashboard 与 Vercel API 只读审计均未发现 Project、Git、Environment、Domain 或 Build 设置错配；仓库中也未发现 `vercel.json`、`vercel.ts` 或 GitHub Actions deployment workflow。
- `codex/admin-preview-baseline` 指向 `903bf70a6dc370090362098d26bedd6bf68af529`，但仍被判定为 `production / Production`。当前记录为 Vercel 平台环境判定异常，或存在公开配置与 API 未暴露的隐藏规则。
- 最终 Support Evidence Pack 已记录于 [`V1-ADMIN-VERCEL-SUPPORT-EVIDENCE.md`](./V1-ADMIN-VERCEL-SUPPORT-EVIDENCE.md)，包含中文摘要、可直接提交的英文 Support Message、Dashboard 复核结果与已删除 Deployment 的脱敏元信息摘要。
- 在 Vercel Support 给出解释，或 Product Owner 明确授权新的受控方案前，不再次触发 Admin Deployment，不进入 Production，不修改 Vercel 配置。

安全处置已完成：Product Owner 已在 Vercel Dashboard 删除或轮换 `vercel curl` 自动生成的 Protection Bypass for Automation secret，未读取、复制、记录或分享其值。该项不再构成 Release Gate；后续网络复核不得通过 `vercel curl` 或其他方式自动生成新的 bypass secret。

## 回滚建议

- 保留 GitHub baseline `903bf70a6dc370090362098d26bedd6bf68af529` 作为本轮回滚与追踪点。
- 保留 GitHub baseline 与当前 Preview deployment 作为追踪点。
- External Beta 发现 P0 或未接受的 P1 时，立即停发邀请码、暂停新发布并保留现场证据。
- 撤销未使用邀请码；如需撤销 Author role 或调整 Membership，必须另行授权并通过受控 `/access` 与 audit，禁止直接 SQL。
- 不执行 Production、DNS、数据库结构回滚或未经授权的数据删除。

## 分线 Release Gate

- 产品 P0：0。
- 产品 P1：0。
- Web Release Gate P0：0。
- Web Release Gate：0 组未完成证据。
  - WEB-CONTENT-001：CLOSED；Reader 已完成 Published Work / Chapter 回读，Guest 登录门禁规则已确认。
  - WEB-AUTHOR-001：CLOSED；Author001 创建、保存、发布、回读与 Draft isolation 均 PASS。
- Admin Minimum Governance Gate：PASS for controlled External Beta。
  - active Super Admin、受控 `/access`、服务端 / 数据库校验、audit 与邀请码责任边界均已记录。
  - `/access` 代码冻结到 Admin 阶段；真实外部 Author 授权仍需单独批准。
- Admin Preview External Blocker：1。
  - ADMIN-PREVIEW-001：Vercel 将 Admin 非 Production baseline branch 判定为 Production；误判 deployment 已删除，Admin Preview URL 未生成。

已关闭：P1-RD-NET-001、P1-RD-QA-001、P1-RD-SEC-001。Product Owner 已通过本机人工验收解决执行网络与账号门禁，并在 Dashboard 删除或轮换 bypass secret；没有向 Codex 提供密码、邀请码、token 或 secret。

## Product Owner 下一步授权

1. PDR-01 / PDR-02 已关闭；先通过独立 Mission 刷新最终干净 RC SHA，并排除冻结 `/access` Admin 改动。
2. 重新执行 Production Deployment Review；PASS 前不能授权 Production Deployment Mission。
3. 决定 External Beta 测试账号、邀请码和测试内容的收尾处置；任何角色或 Membership 变更必须另行授权。
4. Admin Preview 继续独立暂停；不得再次部署或修改 Vercel，除非另有明确 Mission。

不需要再次配置两个必需 Preview 环境变量。不得重新生成 bypass secret，不得在 Codex 中发送变量值或账号密码；不执行 Production、DNS、远程数据或权限变更；不创建 Admin / Docs Project。
