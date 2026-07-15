# Changelog

All notable project changes are recorded here. Dates use `YYYY-MM-DD`.

## 2026-07-15 — PRC-01 RC Baseline Closeout

- 从 `903bf70a6dc370090362098d26bedd6bf68af529` 创建 `codex/v1-production-rc`。
- RC commit message 固定为 `chore(release): prepare V1 production candidate`；精确 SHA 记录在 Mission Final Output。
- RC 只纳入已验收 Reading Typography / Layout 修复与获批 Release / Production Readiness / Production Preparation 文档。
- 冻结 `/access` Admin 改动 `actions.ts`、`page.tsx`、`actions.test.ts` 未暂存、未进入 RC；没有处理或修改 Admin 实现。
- 在独立干净 detached worktree 运行 `pnpm validate`、Prettier、`git diff --check`、Secret 特征扫描和 git status 检查。
- PRC-01 = `CLOSED`；PRC-02 至 PRC-06 保持 `BLOCKED`；`Production Deployment Authorized = NO`。
- 未 push、部署、绑定域名、创建 Production tag、修改 Vercel、数据库、Auth、RLS、RPC、Migration、创建账号、发送邀请码或授权 / 撤销角色。

## 2026-07-15 — V1 Production Preparation

- 只读确认 `main`、`origin/main` 与 HEAD 均为 `903bf70a6dc370090362098d26bedd6bf68af529`，但工作区混有已验收 Reading、冻结 `/access` Admin 与 Release / 状态文档改动，不能作为 RC 或部署源。
- 只读核对 `fandom-harbor-web`：Root Directory=`apps/web`、Framework=Next.js、Node=24.x；Production 作用域 Environment Variables 为 0，团队正式域名为 0，正式 URL / HTTPS 未建立。
- 只读确认 linked Supabase `fandom-harbor` 为 ACTIVE_HEALTHY，Local / Remote Migration 14 / 14；未执行远程写入。
- 新增 `docs/19_Release/V1-PRODUCTION-PREPARATION.md`，记录 PRC-01 至 PRC-06 状态、RC 分离策略、Production 配置清单、运维 / 备份 / 监控 / 值班最低方案、法律 / 隐私 / 内容 / 数据政策、回滚 / Smoke 和 Super Admin 应急路径。
- 当前 PRC-01 至 PRC-06 均为 `BLOCKED`：没有 Product Owner 逐项 `ACCEPTED RISK`，Production Preparation 未完成，不能进入 Production Deployment Mission 授权评审。
- `Production Ready = READY WITH CONDITIONS`、`Production Deployment Authorized = NO`、Product P0 / P1 = `0 / 0` 保持不变。
- 本 Mission 只修改 Markdown；未部署、绑定域名、修改 Vercel、数据库、Auth、RLS、RPC、Migration、创建账号、发送邀请码、授权 / 撤销角色或继续实现 `/access` Admin。

## 2026-07-15 — V1 Production Readiness Review

- 汇总邀请注册、Reader / Author、创建 / 草稿 / 发布 / 回读、Draft isolation、Studio denial、Guest 门禁与 External Beta 证据，全部 PASS。
- 确认 Product P0 / P1 = 0 / 0。
- 新增 `docs/19_Release/V1-PRODUCTION-READINESS-REVIEW.md`，记录 Production 主链路、文档完整性、限制、阻断条件与 Go / No-Go。
- 结论为 `Production Readiness Review = PASS`、`Production Ready = READY WITH CONDITIONS`、`Production Deployment Authorized = NO`。
- Production 前条件包括干净候选基线、Production 环境 / 域名、RPO / RTO、备份恢复、监控值班、法律 / 数据政策、回滚、最低治理连续性和部署后 Smoke。
- `/access` Admin 改动继续冻结，Admin Preview 外部阻塞独立跟踪；未修改产品代码、数据库、Auth、RLS、RPC、Migration 或 Vercel，未部署或绑定域名。

## 2026-07-15 — V1 External Beta Evidence Reconciliation and Closeout

- 将 `External Beta Go / No-Go = GO — NOT OPENED` 修正为历史评审节点，不再作为当前状态。
- 记录 Product Owner 已确认 3 名 Reader 小范围外部测试 PASS、外部 Author 测试 PASS。
- 汇总 Reader-only Controlled Test、Reading Typography Alignment Fix、Author001 Publish E2E、3 Reader 外部测试和外部 Author 测试全部 PASS。
- 确认 Product P0 / P1 = 0 / 0；Guest 详情 / 章节登录门禁属于 active Membership 产品规则，不作为缺陷。
- `/access` Admin 既有改动继续冻结到 Admin 阶段，不阻塞 Beta Closeout。
- `V1 External Beta Closeout = PASS`；项目可进入 V1 Release Candidate / Production Readiness Review，但本轮未授权或执行 Production、部署、账号、邀请码、角色或 Admin 操作。

## 2026-07-15 — V1 External Beta Go / No-Go Review

- 汇总 Phase 1 Reader-only 与 Phase 2 Author-controlled 结果，两阶段均 PASS，Product P0 / P1 = 0 / 0。
- 完成 Reader / Guest 规则、Author 发布、Draft isolation、Studio denial、邀请码治理、已知限制、停止 / 回退和反馈收集的外部 Beta 最小门槛评审。
- 记录 Guest 可发现作品但点击详情或章节后进入登录页为当前 active Membership 产品规则，不作为缺陷。
- 结论为 `External Beta Go / No-Go = GO — NOT OPENED`；推荐后续单独授权 1 名外部 Author、5 名 Reader、7 天，仅限 Web Preview。
- `/access` Admin 既有代码改动冻结到 Admin 阶段，不在本评审继续开发或部署；真实 Author 授权仍需单独批准并经受控 `/access`、服务端校验与 audit。
- 本 Mission 仅更新文档；未开放 Beta、创建账号、发送邀请码、授权角色、修改产品代码 / 数据库 / Auth / RLS / RPC / Migration / Vercel，未执行 Deployment 或 Production。

## 2026-07-15 — V1 Phase 2 Author-controlled / Author001 Publish E2E

- Product Owner 使用 Author001 完成注册名登录与 `/studio`、`/studio/works`、`/studio/works/new` 三路访问。
- 创建最小测试作品、保存章节草稿、发布所选章节、Work Detail、Published Reading 与 Reader 回读均 PASS。
- Guest / Reader 均看不到未发布草稿；Reader 三条 Studio 路由返回 Archive，Guest `/studio` 进入登录页。
- Guest 可搜索到已发布作品，点击作品或章节后进入登录页，符合当前 active Membership 产品规则。
- 390px、Light / Dark 无明显横向溢出或破版；Console 产品级错误为 0，Product P0 / P1 = 0 / 0。
- `pnpm validate` 通过；Author Release evidence gate 关闭。仅允许进入外部 Beta 的 Product Owner Go / No-Go 评审，未开放外部 Author、完整 Beta、Production、Deployment 或 Admin 测试。
- 本 Mission 只更新 Release / 状态文档；未修改产品代码、数据库、Auth、RLS、Migration 或 Vercel 配置，未执行 Deployment、Production、直接 SQL、用户创建或角色授权。

## 2026-07-15 — Reader-only Closeout and Reading Typography Alignment

- Product Owner 已完成 V1 第一阶段 Reader-only 受控测试；Closeout 记录为 PASS，Product P0 / P1 = 0 / 0。
- 将正文视觉位置与排版反馈记录为 Reading Page UI / Typography / Content Layout P2。
- `.reader-canvas` 增加水平居中与完整可用宽度，`.reader-prose` 使用移动端安全的受限宽度，正文段落启用两端对齐。
- 保持现有字号、行距、主题、阅读宽度偏好、正文数据与 Published-only / Membership 权限边界不变；未引入依赖或重构 Reading Page。
- 同步 Release Smoke、Release Flow、Phase 1 测试指南、UX-06C 验收记录、Project Status 与 Memory。
- 未修改数据库、Supabase、Auth、Role、RLS、Policy、RPC、Migration 或 Vercel 配置，未执行 Deployment、Production、Author / Admin 测试或新功能开发。

## 2026-07-15 — V1 Phase 1 Reader-only Beta Testing Guide

- 新增 `docs/19_Release/V1-PHASE1-BETA-TESTING-GUIDE.md`，面向 Product Owner 与第一批 3 名 Reader 测试者。
- 根据实现核对注册流程：只填写注册名、至少 8 位的测试专用密码和邀请码；页面没有邮箱字段，当前环境要求邮箱确认关闭，Email Confirm 不属于 Phase 1 测试重点。
- 记录 Guest / Reader 测试清单、三条 Studio denial、Draft isolation、公开阅读、移动端、Light / Dark、P0–P3 严重程度、反馈模板和第一阶段 PASS 标准。
- 增加 Product Owner 邀请前清单与可直接发送给 Reader 测试者的中文说明；固定 3 Reader / 0 外部 Author，Author001 继续走独立 Publish E2E。
- 本 Mission 只更新文档；未自动邀请、创建真实账号、授权 Author、修改产品代码 / 数据库 / Auth / RLS / Migration / Vercel，未执行 Deployment、Production 或 Beta 发布。

## 2026-07-15 — V1 Controlled Beta Invite Readiness Gate

- Reader 邀请注册、默认 active Reader 与授权前 `/studio`、`/studio/works`、`/studio/works/new` denial 均 PASS。
- 只读确认 Author001（masked `2cbd52b1…351d`）active Membership、唯一 active `author` grant、对应 `role.granted` audit、Super Admin operator 与 `admin:operate` 对齐。
- Author001 退出并重新登录后三条 Studio 路由均 PASS；Reader → Author Provisioning Block 已关闭。
- Homepage、Archive、Search、Work Detail、Author Profile 当前可打开；Published Reading、Auth、390 × 844、Light / Dark 与 Console 沿用同一 Preview 既有 PASS，Product P0 / P1 = 0 / 0。
- Author 创建入口 PASS；创建、保存、Draft isolation、发布与 Reader 回读为 NOT RUN。Gate 结论为 `CONDITIONAL GO — READER-ONLY`，建议首批 3 Reader / 0 外部 Author。
- 本 Mission 只更新文档；未自动邀请、授权、修改产品代码、数据库、Auth、RLS、Migration 或 Vercel 配置，未执行 Deployment、Production 或 Beta 发布。

## 2026-07-15 — `/access` Invalid Blocker Local Fix

- 定位 `error=invalid`：只在 Role Grant / Revoke Server Action 的 Zod schema 校验失败时产生，发生在 Admin session、RPC 和数据库函数之前。
- 确认表单字段、grant / revoke action、`author` role、`work:author` capability、RPC 名称与参数没有错配。
- Role Grant Auth UUID 改为 trim 后再执行严格 UUID 校验，避免复制粘贴首尾空白导致拒绝。
- 增加 `invalid-user-id`、`invalid-role`、`invalid-reason` 安全提示；不回显输入或敏感值。
- 新增 4 个 `/access` grant targeted tests；Admin tests 6 / 6、lint、typecheck PASS。
- 未执行真实授权，未产生 grant / audit；未修改数据库、Auth、RLS、Migration、Vercel，未执行 Deployment 或 Production 操作。Reader → Author E2E 仍待 Product Owner 手工授权与只读复核。

## 2026-07-15 — Reader to Author E2E Grant INVALID

- Product Owner 已在 Web Preview 注册并登录新 Reader；Codex 未读取或记录邀请码、密码。
- 新 Reader 页首无 Studio；直访 `/studio`、`/studio/works`、`/studio/works/new` 最终均返回 `/archive`，授权前边界 PASS。
- `http://localhost:3000/access` 已登录 Super Admin，完整 Role Grant 表单可见；目标 User ID 字段非空，角色为 `author`，Codex 未读取或输出 ID。
- Product Owner 手动提交后页面为 `/access?error=invalid`；Author grant 未成功，没有新的 `role.granted` audit。
- 依据安全规则停止，没有重试、修改目标 ID，也没有使用 SQL、Supabase 控制台、Auth、Migration 或 RLS 绕过 `/access`。
- Product P0 / P1 保持 `0 / 0`；当前为表单输入 / 治理链阻塞，尚未确认产品代码 FAIL。
- 已有 Preview Author 可用性结论保持有效；新 Reader → Author E2E Governance Block 继续阻塞 V1 Beta 与完整 Web Preview Smoke 收口。
- 本轮只更新 Markdown；未修改产品代码、数据库、Auth、RLS、Vercel 配置，未创建 Deployment 或执行 Production 操作。

## 2026-07-15 — Reader to Author Provisioning E2E BLOCKED

- 在端到端 Smoke 前置检查中确认当前 Web Preview 标签为未登录 Guest，未准备新 Reader 会话。
- 浏览器没有已登录 Admin / Super Admin `/access` 标签；受控检查 `http://127.0.0.1:3001/access` 返回连接被拒绝，Admin Preview 不在本 Mission 处理范围。
- 依据安全规则立即停止：未注册用户、未输入或读取邀请码 / 密码、未确认或输出 User ID、未授予 Author、未产生新的 `role.granted` audit。
- 未使用直接 SQL、Supabase 控制台角色修改、Auth、Migration 或 RLS 变更绕过 `/access`。
- 已有 Preview Author 登录 / Studio 可用性结论保持有效；新 Reader → Author E2E Governance Block 独立保持 OPEN，继续阻塞 V1 Beta 与完整 Web Preview Smoke 收口。
- Product P0 / P1 保持 `0 / 0`；当前为 Release / Governance Gate，不是已确认产品代码 FAIL。
- Product Owner 需准备可访问且已登录的受控 `/access`、已注册并登录的新 Reader 会话，以及可信流程确认的目标 User ID；不得在 Codex 中提供密码或邀请码。
- 本轮只更新 Markdown；未修改产品代码、数据库、Migration、Auth、RLS、Role、Supabase、Vercel 配置或环境变量，未创建 Deployment 或执行 Production 操作。

## 2026-07-15 — Preview Author Web Smoke Evidence Partial

- Product Owner 确认历史远程 Author 可在当前 Web Preview 登录并进入 `/studio`。
- 受控浏览器确认已登录 Author Shell、Studio Header 入口、Studio 导航、作品管理、文章管理与邀请码管理入口；Web Shell 未显示 Admin 入口。
- 将 Preview Author Provisioning Block 标记为解除：当前账号已证明具有 Author capability 并可进入 Studio。
- 导航到 `/studio/works` 后页面最终回到 `/archive`，随后浏览器控制持续超时；按安全规则停止，未提交创建表单，未创建、保存或发布作品。
- Reader / Guest 回读、Draft isolation、Author 专项 390 × 844、Light / Dark 与控制台复核为 `NOT RUN`；Author Web Flow 继续 `BLOCKED`，完整 Web Preview Smoke 不可收口。
- 当前没有确认产品级 FAIL，Product P0 / P1 为 `0 / 0`；`/studio/works` 行为需 Product Owner 重新登录后人工复核，才能判断是否为产品问题。
- Preview 标签已保留供 Product Owner 重新建立 Author 会话；不得在 Codex 中提供密码。
- 本轮只更新 Markdown；未修改产品代码、数据库、Migration、Auth、RLS、Role、Supabase、Vercel 配置或环境变量，未创建账号、授予角色、执行 Deployment 或 Production 操作。

## 2026-07-15 — Admin Governance Minimum Check and Beta Author Provisioning

- 确认邀请注册只创建 active Membership / Reader；不会自动创建 Author Role Grant，Reader 无 `work:author` 且不能进入 Studio。
- 确认 Reader → Author 受控路径已存在：Admin App `/access` 选择 `author`，Server Action 要求 `admin:operate`，数据库要求目标 active Membership、Admin / Super Admin 操作者和非空原因。
- 确认 Author grant 写入 `role.granted` audit，记录操作者、目标、角色和原因；历史远程 `Auther001` grant 与 Studio 进入曾验收通过。
- 将当前 Preview Author 状态记为 `UNCONFIRMED`：历史 Author 尚未在当前 Web Preview 复核，`Phase2RemoteInviter` 只确认 Super Admin 登录，Author capability 与发布结果仍为 PENDING。
- 明确 Guest / Reader Smoke 可继续；Author Studio、创建、保存、发布、Reader 回读和 Draft isolation 在可用 Preview Author 确认前 BLOCKED，该项阻塞 V1 Beta。
- 记录 Product Owner 最小人工动作：先验证历史远程 Author；如不可用，再单独授权现有 Super Admin 通过受控 `/access` 为指定 active Reader 授予 Author。未执行任何真实授权。
- 同步 Admin Guide、User Guide、Release Flow、Smoke Test、Project Status 与 Memory。
- 本轮只更新 Markdown；未修改产品代码、数据库、Migration、Auth、RLS、Role、Supabase、Vercel 配置或环境变量，未登录、创建账号、授予角色或执行 Deployment / Production 操作。

## 2026-07-15 — V1 Release Flow Optimization and Admin Governance Split

- 将 V1 Release 拆分为 Web V1 主站、Admin 最小治理、Admin Preview Deployment 解阻、Release 文档与中文教程四条独立主线。
- 明确 Web Preview Smoke 可在 Admin Preview 外部阻塞期间继续，完整 Admin UI 不阻塞 V1 Beta，Admin Preview 继续作为独立外部阻塞项跟踪。
- 明确 Admin 三层定义：权限底座、Admin UI、Admin Preview Deployment；外部 Preview 阻塞不代表权限底座或现有最小 UI 缺失。
- 将 Admin 最小治理列为独立 Beta 硬门槛：Super Admin 存在并可登录，但连续性 / 恢复 runbook、远程 Admin 授权路径、邀请码事故治理与 audit 责任仍需单独验收。
- 记录 owner-only bootstrap 只适用于没有未撤销 Super Admin grant 的场景；已有 grant 但身份不可登录时必须走受控账号修复或由另一名有效 Super Admin 处理。
- 补充 Author `/author/invitations` 创建 / 撤销流程、邀请码只授予 Reader、一次性原始码与完整 Admin 全局邀请码 UI 后置边界。
- 新增 `docs/19_Release/V1-RELEASE-FLOW-OPTIMIZATION.md`，并同步 Release Deployment、Smoke Test、Admin / User Guide、Project Status 与 Memory。
- 本轮只更新 Markdown；未修改产品代码、数据库结构、Migration、RLS、Policy、Auth、Role、Supabase、Vercel 配置或环境变量，未执行 Deployment、DNS、远程写入或 Production 操作。

## 2026-07-15 — Admin Vercel Support Evidence Pack

- 汇总 Vercel API 只读审计、已删除 Deployment 元信息与 Product Owner Dashboard 人工复核结果。
- 确认 `fandom-harbor-admin` 的 Production Branch=`main`、Preview Branch Tracking=`All unassigned git branches`、Root Directory=`apps/admin`，Deploy Hooks=0，Custom Environments=0，Preview / Production deployments=0 / 0。
- 确认未发现 Project / Git / Environment / Domain / Build 设置错配，也未发现 `vercel.json`、`vercel.ts`、GitHub Actions deployment workflow 或强制 Production branch pattern。
- 新增 `docs/19_Release/V1-ADMIN-VERCEL-SUPPORT-EVIDENCE.md`，包含中文问题摘要、可直接提交的英文 Support Message、Dashboard 复核结论、已删除 Deployment 脱敏摘要与暂停声明。
- Admin Preview 继续 `BLOCKED`；在 Vercel Support 给出解释或 Product Owner 明确授权新方案前，不再次触发 Deployment、不进入 Production、不修改 Vercel 配置。
- 本轮只修改本地 Markdown；未创建 Deployment，未修改 Git 分支、数据库、Supabase、Auth、Role、RLS、RPC、DNS 或 Docs Project，未记录任何敏感凭据值。

## 2026-07-15 — Admin Preview Baseline Branch Deployment BLOCKED

- 创建远程 branch `codex/admin-preview-baseline`，固定指向 Release Baseline `903bf70a6dc370090362098d26bedd6bf68af529`；`main` 未修改，branch 按 Product Owner 要求保留。
- 确认 `fandom-harbor-admin` 已关联当前 GitHub Repository，Root Directory=`apps/admin`，Framework=Next.js。
- 确认两个必需 Preview 环境变量名称存在，`NEXT_PUBLIC_SITE_URL` 未配置但为可选项；未读取或输出任何值。
- GitHub Integration 未自动响应仅创建 branch 的事件；以该非 Production branch 为 Git source 受控触发后，Vercel 仍将首次 deployment 判定为 Production。
- 依据 Mission 强制安全条款立即取消、删除并停止；Admin Preview / Production deployments 最终均为 0，没有生成可用 Admin Preview URL。
- 共享主工作区只有既有 Release / `.ai` 文档变更，没有应用代码或配置变更；baseline 已在独立干净 worktree 中复核。
- 未执行数据库、Migration、RLS、RPC、Policy、Auth、Role、DNS、Docs Project 或 Release Tag 变更；未输出密码、环境变量值、token 或 secret。

## 2026-07-15 — Web Preview 人工 Smoke 部分完成

- Product Owner 从本机浏览器提交 Guest、Reader、Super Admin 与通用显示的人工验收结果，替代 Codex 不可访问 Preview 网络的自动检查。
- Guest Homepage / Archive / Search / Published Chapter Reading / Sign-in / Sign-up / Studio denial，Reader 登录 / Archive / Search / Studio denial / `/studio` → `/archive` / Published-only / Draft isolation / logout，以及 Light / Dark、390 × 844、1280、Global Shell 均为 PASS。
- 浏览器控制台 P0 / P1 错误为 0 / 0；当前没有报告产品 FAIL，观察到 Product P0 / P1 = 0 / 0。
- Guest Work Detail、Guest Author Profile、Reader Published Work / Chapter 为 BLOCKED，具体原因待 Product Owner 补充。
- Super Admin 登录为 PASS；Author / Super Admin 其余 7 项仍是未选择的结果占位，不能标记为 PASS。
- Online Smoke 记录为 PARTIAL / BLOCKED；Release Gate P0 / P1 = 0 / 2，分别对应公开内容路径证据与 Author 结果未完成。
- 记录 Super Admin Account Repair 仅对齐历史 Auth email；Preview Reader 由 Product Owner 通过受控邀请码流程注册并登录。没有记录密码、邀请码、token、secret 或完整内部 email。
- Admin Preview Project 尚未创建，Admin App 为本轮 Web Preview 范围外 BLOCKED；未执行 Production、DNS、Admin / Docs Project 创建或新的远程写入。

## 2026-07-15 — Vercel Web Preview Deployment 与 Online Smoke 阻塞

- 确认 GitHub Release Baseline `903bf70a6dc370090362098d26bedd6bf68af529` 已 push，`main` 与 `origin/main` 一致。
- 在 `fandom-harbor` team 创建并关联 Vercel Project `fandom-harbor-web`。
- 确认 Root Directory 为 `apps/web`、Framework 为 Next.js，`.vercel/project.json` 被忽略且未跟踪。
- Product Owner 已在 Preview 配置 `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`；只核对变量名存在，未读取或输出值。
- 基于 GitHub baseline `903bf70a6dc370090362098d26bedd6bf68af529` 完成 Web Preview：`https://fandom-harbor-ilvpjubrm-fandom-harbor.vercel.app`，Deployment `dpl_2H2tUqGo7UXWrfhSC5FsmoeHGpX8`，状态 `Preview / Ready`。
- Vercel CLI 在新建空项目首次 deploy 时错误生成的临时 Production deployments 均已删除；最终项目只保留 Preview。
- 当前执行网络无法连接 `*.vercel.app:443`，且缺少 Preview Reader / Author 安全测试账号，因此 Online Smoke 保持 `NOT RUN`。
- `vercel curl` 自动生成的项目级 Protection Bypass for Automation secret 已由 Product Owner 在 Dashboard 删除或轮换；未读取、复制、记录或分享值。P1-RD-SEC-001 已关闭，后续不得重新生成 bypass secret。
- `NEXT_PUBLIC_SITE_URL` 也未配置，但代码存在 Vercel Preview URL fallback，不阻塞首次 Preview。
- 指定核对的 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 也不存在，但当前 Web 代码实际使用 publishable key 变量名。
- Vercel link 自动生成的本地会话变量只保存在权限为 `0600` 的忽略文件中；没有读取、输出或写入文档。
- 未创建 Admin / Docs Project，未执行 Production、域名绑定、DNS、线上变量写入、远程数据库或 Supabase 权限变更。
- Product P0 / P1 = 0 / 0；Release Gate P0 / P1 = 0 / 2。

## 2026-07-14 — V1 GitHub Baseline Secret Audit 安全暂停

- 在未跟踪的 `docs/18_Design/UX-06D-STEP02_ACCEPTANCE.md` 第 86–87 行发现两条 localhost-only QA 密码。
- 立即暂停 Release commit、push、Vercel link 与 Preview Deployment。
- 将明文替换为安全凭据命令说明，并重新生成 / 轮换本地 QA 凭据。
- 确认实际密码模式未进入 HEAD 或 Git 历史；处置后高风险凭据模式复扫无匹配。
- 确认 `.env.local`、QA credential file、`.vercel/`、logs、cache、build output 与 dependencies 均被 `.gitignore` 覆盖。
- 等待 Product Owner 确认处置结果后重新进入 GitHub Baseline 门禁。

## 2026-07-14 — V1 Release Deployment 本地门禁与使用教程

- 完成 Git、Runtime、Workspace、Supabase Remote、Environment Variables 名称、QA Fixture 与部署安全边界检查。
- 确认 Supabase Local / Remote Migration 14 / 14 一致，未执行远程写入。
- 通过 `pnpm validate`、169 / 169 Workspace tests、Web 81 / 81、Admin 2 / 2、Web / Admin / Docs production builds 与 `git diff --check`。
- 通过 Local Guest / Reader / Author、Reader Studio denial、Author Studio、Published-only / Draft isolation、1280 / 390 与 Light / Dark Smoke。
- 记录当前 `main` 超前 `origin/main` 4 commits，UX-06 已验收 diff 尚未形成可追溯 Release baseline。
- 记录仓库无 Vercel Project 关联、平台核对未完成、线上环境变量和 URL 未确认；因此未执行 Preview / Production Deployment 或 Online Smoke。
- 新增 `docs/19_Release/V1-RELEASE-DEPLOYMENT.md`、`V1-DEPLOYMENT-SMOKE-TEST.md`、`V1-USER-GUIDE.md` 与 `V1-ADMIN-GUIDE.md`。
- 记录 Admin 已支持 Super Admin 通过独立 Admin App `/access` 授予 / 撤销 Admin，并由数据库校验与审计；未执行任何真实授权操作。
- 未写入任何密码、token、Supabase secret、service role key 或 Environment Variable 值。

## 2026-07-14 — UX-06J Product Owner 最终验收

- Product Owner 确认 UX-06J Release UI Sweep / V1 UI Consistency 验收通过。
- 记录 UX-06J = PASS、Release UI Sweep / V1 UI Consistency = Accepted、Product Owner Acceptance = PASS、P0 = 0、P1 = 0。
- 确认 V1 主路径 UI 审计、三个低风险 P2 修复、UX-06H / UX-06I 无回退、角色边界、响应式、主题与全部工程验证通过。
- 确认未修改 Database、Supabase、Migration、RLS、RPC、Auth logic、Role、Published-only、Draft isolation、Reader preferences、theme persistence 或 dependency。
- 保留移动端当前路由高亮、Root Loading / Error 共享架构边界与极端长连续文本 Fixture coverage 为非阻塞后续项。
- UX-06J 正式关闭；停止在当前状态，等待 Product Owner 下一条明确指令。

## 2026-07-14 — UX-06J Release UI Sweep / V1 UI Consistency

- 审计 Homepage、Archive、Search、Work Detail、Published Reading、Author Profile、Studio Entry / Overview 与 Auth 的 V1 UI 一致性。
- 将 Studio Mobile 内部导航收敛为三列，保留 Desktop 纵向侧栏与现有权限逻辑。
- 将 Studio 顶部恢复入口与 Overview 管理入口提升到至少 44px，并清理旧的 Step / Dashboard 工程文案。
- 将 Auth `Phase 1 · Identity` 改为“账号入口”“门禁注册”，Sign-in / Sign-up 互链提升到至少 44px。
- 通过 1280 / 390、Light / Dark、零溢出、Guest / Reader / Author、Reader Studio denial、Author Studio 与 browser console 0 回归。
- 保持 UX-06H Homepage 与 UX-06I Global Shell 不回退；未修改 Database、Supabase、Migration、RLS、RPC、Auth logic、Role、Published-only 或业务逻辑。
- 新增 `UX-06J-RELEASE-UI-SWEEP.md` 与 `UX-06J-STEP_ACCEPTANCE.md`，并同步 Design Status、Roadmap、Project Status 与 Memory。
- Web 81 / 81 tests、完整 `pnpm validate`、169 / 169 workspace tests 与全部 production builds 通过。
- P0 = 0、P1 = 0；Release UI Sweep Ready for Product Owner Review = YES。等待验收，不进入下一项任务。

## 2026-07-14 — UX-06I Product Owner 最终验收

- Product Owner 确认 UX-06I Global Shell / Navigation 验收通过。
- 记录 UX-06I = PASS、Global Shell / Navigation = Accepted、Product Owner Acceptance = PASS、P0 = 0、P1 = 0。
- 确认桌面三分区、Guest / Reader / Author 导航、Reader Studio denial、Author Studio access、主要页面回归与全部工程验证通过。
- 确认未引入 Database、RLS、RPC、Migration、Auth 或 Published-only 逻辑变更。
- 接受移动端原生 `details` 作为 V1 安全最小实现；当前路由高亮作为非阻塞后续优化项保留。
- UX-06I 正式关闭；停止在当前状态，等待 Product Owner 下一条明确指令。

## 2026-07-14 — UX-06I 全局壳层与导航

- 保持桌面端 Fandom Harbor / Primary Navigation / Utility & Account 三分区结构。
- 为 767px 以下新增默认收起、正常文档流内展开的“浏览站点”导航，所有触发器与链接最小 44px。
- 提取 Archive、Search 与 capability-gated Studio 导航纯函数并新增 Guest / Reader、Author 测试。
- 为右侧主题与账号区域增加“显示与账号”组语义。
- 通过 Guest、Reader、Author、Reader Studio denial、Author Studio、Homepage、Archive、Search、Work Detail、Reading、Author Profile、390 / 1280、零溢出与 browser console 0 回归。
- 未修改 Auth、Permission、Role、Published-only、Draft isolation、Database、Supabase、Migration、RLS、RPC 或页面产品逻辑。
- 新增 `UX-06I-GLOBAL-SHELL-NAVIGATION.md` 与 `UX-06I-STEP_ACCEPTANCE.md`，并同步 Design Status、Roadmap、Project Status 与 Memory。
- Web 81 / 81 tests、Web / UI typecheck、UI lint 与完整 `pnpm validate` 通过；Workspace 169 / 169 tests 与全部 production builds 通过。
- Global Shell / Navigation Ready for Product Owner Review = YES；等待验收，不进入下一项 UX 任务。

## 2026-07-14 — UX-06H Step04 Homepage Release Acceptance Slim

- Accepted Step01 Audit Contract、Step02 Layout Upgrade and Step03 Slim QA as the frozen Homepage Release baseline.
- Finalized Homepage as the Quiet Editorial Harbor Entrance with Brand Orientation → Discovery Paths → Latest Published Works → Reader Return / Access → Quiet Recovery.
- Frozen Archive / Search / Work / Auth entry、Guest / Reader / Author、Published-only and Draft Work / Chapter isolation evidence.
- Frozen 1440 / 1280 / 768 / 390、Light / Dark、accessibility、44px targets、focus、zero overflow and browser console 0 evidence.
- Confirmed shared Header / Footer unchanged、Root Loading / Error Frozen、Auth / Permission / Invitation / login return unchanged and all data contracts unchanged.
- Retained HP-AUDIT-007 as Frozen、HP-QA-001 as a non-blocking Fixture enhancement and stale chunked-cookie warning as non-blocking with no actual functional impact.
- Confirmed P0 = 0、P1 = 0；Step04 changed no product implementation or data layer.
- Added `UX-06H-STEP04_ACCEPTANCE.md` and synchronized Design Contract、Design Status、Roadmap、Project Status and Memory.
- Passed Web lint / typecheck / 79 tests / build and full `pnpm validate` with 167 / 167 workspace tests plus Web / Admin / Docs production builds.
- Passed `git diff --check`；Homepage Ready for Release = YES，awaiting Product Owner Final Review，and no new UX Track is authorized.

## 2026-07-14 — UX-06H Step03 Homepage States & Responsive QA Slim

- Applied the Product Owner's UX closure slim mode and limited QA to Step02's direct Homepage presentation impact.
- Passed Brand Orientation、Discovery Paths、Latest Published Works、Reader Return / Access and Quiet Recovery smoke QA.
- Passed Archive / Search / Work Detail / Sign-in / Sign-up / Reader Library / Access entry smoke.
- Passed Guest / Reader / Author、Author shared Header Studio capability、Homepage page-local Studio = 0、Published-only and Draft Work / Chapter isolation.
- Passed 1440 / 1280 / 768 / 390、Light / Dark、44px targets、keyboard focus、semantics、zero overflow and browser console errors = 0.
- Retained HP-AUDIT-007 as Frozen and HP-QA-001 as a non-blocking Fixture enhancement.
- Did not reproduce the prior stale chunked-cookie warning；login、logout、roles、Published-only and Draft isolation remained normal.
- Confirmed P0 = 0、P1 = 0、Step02 regression = 0；no Allowed Fix was required and product implementation / data layer changes = NONE.
- Added `UX-06H-STEP03_ACCEPTANCE.md` and synchronized Design Contract、Design Status、Roadmap、Project Status and Memory.
- Passed Web lint / typecheck / 79 tests / build and full `pnpm validate` with 167 / 167 workspace tests plus Web / Admin / Docs production builds.
- Passed `git diff --check`；Homepage Ready for Step04 = YES，awaiting Product Owner review，and Step04 is not authorized.

## 2026-07-14 — UX-06H Step02 Homepage Layout Upgrade

- Established Brand Orientation → Discovery Paths → Latest Published Works → Reader Return / Access → Quiet Recovery on `/`.
- Clarified Archive primary、Search secondary and Latest Published Works as non-recommendation / non-ranking discovery paths.
- Removed static Reader Login and misleading `/author` root entry；shared Header remains the only account / capability state owner.
- Preserved existing Public Browse Gateway、`newest`、three-item limit and `BrowseWork`；reduced each preview to one Work Detail main entry.
- Added neutral Sign-in / Sign-up / Access context、honest Empty recovery、44px targets、focus-visible and long-content wrap protection.
- Passed Homepage → Archive / Search / Work Detail / Auth、Guest / Reader / Author、Published-only and Draft Work / Chapter isolation.
- Passed 1440 / 1280 / 768 / 390、Light / Dark、semantics、keyboard focus、zero overflow and browser console errors = 0.
- Closed HP-AUDIT-001–006 / 008–009；retained HP-AUDIT-007 as frozen shared-state boundary；HP-AUDIT-010 protection PASS；HP-QA-001 non-blocking.
- Added `UX-06H-STEP02_ACCEPTANCE.md` and synchronized Design Contract、Design Status、Roadmap、Project Status and Memory.
- Changed product implementation only in Homepage route-local React / CSS；data、Auth、Permission、Gateway、Service、Repository、query、Database、Supabase、RLS、RPC、Migration、dependency and deployment remain unchanged.
- Passed Web lint / typecheck / 79 tests / build and full `pnpm validate` with 167 / 167 workspace tests plus Web / Admin / Docs production builds.
- Passed `git diff --check`；Homepage Layout Ready for Step03 = YES，awaiting Product Owner review，and Step03 is not authorized.

## 2026-07-14 — UX-06H Step01 Homepage UI Audit & Design Contract

- Audited `/` Homepage Hero、Discovery、Latest Published Works、Reader Return、Auth、Closing、shared Loading / Error and Footer boundaries.
- Confirmed Homepage as the Quiet Editorial Harbor Entrance with Brand Orientation → Discovery Paths → Latest Published Works → Reader Return / Access → Quiet Recovery.
- Confirmed existing Public Browse Gateway、`newest` order、three-item limit and `BrowseWork` contract；Homepage does not provide recommendation、ranking、Feed、filter or personalization.
- Passed Homepage → Archive / Search / Work / Auth、Guest / Reader / Author、Published-only and Draft Work / Chapter isolation.
- Passed 1280 / 390、Light / Dark、single H1、five labelled regions、zero overflow and browser console errors = 0.
- Recorded HP-AUDIT-001–010 as P2 findings；P0 = 0，P1 = 0.
- Added `UX-06H-HOMEPAGE-DESIGN-CONTRACT.md` and synchronized Design Status、Roadmap、Project Status and Memory.
- Recorded Product Owner final acceptance and closure of UX-06G Work Detail Track.
- Changed no product implementation、Homepage data fetch、Database、Supabase、RLS、RPC、Migration、Auth、Permission、Gateway、Service、Repository、query contract、dependency or deployment configuration.
- Passed Web lint / typecheck / 79 tests / build and full `pnpm validate` with 167 / 167 workspace tests plus Web / Admin / Docs production builds.
- Passed `git diff --check`.
- Homepage Ready for Step02 = YES；awaiting Product Owner review，and UX-06H Step02 is not authorized.

## 2026-07-14 — UX-06G Work Detail Track Product Owner Final Acceptance

- Product Owner accepted UX-06G Step01、Step02、Step03 and Step04 with PASS.
- Confirmed Work Detail as the Literary Work Decision Space with the frozen six-region structure.
- Confirmed P0 / P1 at zero；Work Detail Ready for Release = YES.
- Retained WD-AUDIT-001 / 009 as accepted frozen boundaries and WD-QA-001 as a non-blocking Fixture enhancement.
- Closed UX-06G Work Detail Track；no further Work Detail optimization is authorized.

## 2026-07-14 — UX-06G Step04 Work Detail Release Acceptance

- Accepted Step01 Design Contract、Step02 Layout Upgrade and Step03 States / Responsive QA as the frozen Work Detail Release baseline.
- Confirmed Work Detail as the Literary Work Decision Space with Work Orientation → Story Premise → Author / Published Context → Reading Decision → Chapter Overview → Recovery.
- Passed default、Guest / Reader / Author、no Published Chapters、Loading、Error contract、Not Found、Start / Continue / Download and all discovery / Author / Reading / recovery routes.
- Passed Published-only、Draft Work / Chapter isolation、page-local Studio / private identity isolation、1440 / 1280 / 768 / 390、Light / Dark、44px targets、semantics、focus and browser console errors = 0.
- Confirmed `reading-history-client.tsx` remains limited to Work Continue Reading presentation；history data structure、storage、read / write、sorting、selection、synchronization and Reading behavior are unchanged.
- Retained WD-AUDIT-001 / 009 as accepted frozen boundaries；WD-AUDIT-010 remains PASS；WD-QA-001 remains non-blocking；P0 / P1 and remaining product issues = 0.
- Changed no product implementation、Database、Supabase、Migration、RLS、RPC、Auth、Permission、Gateway、Service、Repository、query、Reading History or Reading behavior；Step04 is Release QA / documentation-only.
- Passed Web lint / typecheck / 79 tests / build and full `pnpm validate` with 167 / 167 workspace tests plus Web / Admin / Docs production builds.
- Passed `git diff --check`；Work Detail Ready for Release = YES，awaiting Product Owner final review，and no new UX Track is authorized.

## 2026-07-14 — UX-06G Step03 Work Detail States & Responsive QA

- Revalidated the frozen Work Orientation → Story Premise → Author / Published Context → Reading Decision → Chapter Overview → Recovery structure.
- Passed default、no Published Chapters、Loading / Error source contract、Not Found、Start / Continue / Download and Archive / Search / Reader Library recovery.
- Passed Guest / Reader / Author、Auth / Permission frozen boundary、Published-only、Draft Work isolation、Draft Chapter isolation and private / Studio data isolation.
- Confirmed `reading-history-client.tsx` Step02 changes remain limited to Work Continue Reading presentation；history data structure、storage、read / write、selection、sorting and Reading behavior are unchanged.
- Passed 1440 / 1280 / 768 / 390、Light / Dark、single H1、heading hierarchy、named regions、semantic Chapter list、focus-visible、minimum 44px targets、zero overflow and browser console errors = 0.
- Retained WD-AUDIT-001 / 009 as accepted frozen boundaries；WD-AUDIT-010 remains PASS；WD-QA-001 remains a non-blocking Fixture enhancement；P0 / P1 and Step02 remaining product issues = 0.
- Changed no product implementation、Database、Supabase、Migration、RLS、RPC、Auth、Permission、Gateway、Service、Repository、query、Reading History or Reading behavior；Step03 is QA / documentation-only.
- Passed Web lint / typecheck / 79 tests / build and full `pnpm validate` with 167 / 167 workspace tests plus Web / Admin / Docs production builds.
- Passed `git diff --check`；Work Detail Ready for Step04 = YES，awaiting Product Owner review，and Step04 is not authorized.

## 2026-07-14 — UX-06G Step02 Work Detail Layout Upgrade

- Established Work Orientation → Story Premise → Author / Published Context → Reading Decision → Chapter Overview → Recovery on `/works/[slug]`.
- Reworked Work identity、summary、public author attribution and Published context using only existing fields；no metadata or data-contract expansion.
- Clarified Continue / Start / Download hierarchy while preserving history、first Chapter selection、ordering、href and download behavior.
- Added honest no-summary / no-chapter recovery plus route-local Work-shaped Loading、Work-specific Error and accurate Not Found presentation.
- Added at least 44px Author、breadcrumb、reading、Chapter and recovery targets plus long-content wrap protection.
- Passed Guest / Reader / Author、Archive / Search / Author Profile entries、Author / Start / Continue Reading exits、download、Published-only and Draft Work / Chapter isolation.
- Passed Default、No Chapters、Loading、Not Found、1440 / 1280 / 768 / 390、Light / Dark、semantic structure、zero overflow and browser console errors = 0.
- Closed WD-AUDIT-002–008 for presentation；retained WD-AUDIT-001 / 009 as accepted boundaries and WD-QA-001 as a non-blocking Fixture enhancement；P0 / P1 / remaining product P2 = 0.
- Changed only Work Detail route-local UI / CSS and page-specific Continue Reading presentation；Database、Supabase、Migration、RLS、RPC、Auth、Permission、Gateway、Service、Repository、query and Reading behavior remain unchanged.
- Passed Web lint / typecheck / 79 tests / build and full `pnpm validate` with 167 / 167 workspace tests plus Web / Admin / Docs production builds.
- Passed `git diff --check`；Work Detail Layout Ready for Step03 = YES，awaiting Product Owner review，and Step03 is not authorized.

## 2026-07-14 — UX-06G Step01 Work Detail UI Audit & Design Contract

- Audited `/works/[slug]` access、Work identity、summary、public author、tags、Published context、Continue / Start、Download、Chapter list and all route states.
- Confirmed Work Detail as the Literary Work Decision Space between Archive / Search / Author Profile discovery and Reading.
- Passed Archive / Search / Author Profile → Work Detail、Work Detail → Author Profile / Reading、Guest boundary、Reader / Author access and page-local Studio action = 0.
- Passed Published-only、Draft Work / Chapter isolation、No Chapters fixture、1280 / 390 zero overflow、semantic baseline and browser console errors = 0.
- Recorded WD-AUDIT-001–010 as P2 hierarchy、accessibility、state、recovery and data-contract findings；P0 = 0，P1 = 0。
- Added `UX-06G-WORK-DETAIL-DESIGN-CONTRACT.md` and synchronized Design Status、Roadmap、Project Status and Memory.
- Recorded Product Owner final acceptance and closure of UX-06F Author Profile Track.
- Changed no product implementation、Database、Supabase、RLS、RPC、Migration、Auth、Permission、Gateway、Service、Repository、query contract、dependency or deployment configuration.
- Passed Web lint / typecheck / 79 tests / build and full `pnpm validate` with 167 / 167 workspace tests plus Web / Admin / Docs production builds.
- Passed `git diff --check`；Work Detail Ready for Step02 = YES，awaiting Product Owner review，and Step02 is not authorized.

## 2026-07-14 — UX-06F Author Profile Track Product Owner Final Acceptance

- Product Owner accepted UX-06F Step01、Step02、Step03 and Step04 with PASS.
- Confirmed Author Profile as the Literary Creator Identity Space with the frozen six-region structure.
- Confirmed P0 / P1、product P2 and post-Beta product findings at zero；Author Profile Ready for Release = YES.
- Retained AP-QA-001 only as a non-blocking QA Fixture enhancement.
- Closed UX-06F Author Profile Track；no further Author Profile optimization is authorized.

## 2026-07-14 — UX-06F Step04 Author Profile Release Acceptance

- Accepted Step01 Design Contract、Step02 Layout Upgrade and Step03 States / Responsive QA as the frozen Author Profile Release baseline.
- Finalized Author Profile as the Literary Creator Identity Space with the Public Identity → Bio → Quiet Relationship → Published Works Context → Body of Work → Recovery structure.
- Passed Guest、Reader followed / unfollowed / real Pending、Author self and restored the localhost Follow state to its initial stable value.
- Passed Empty / Error contracts、real Profile-shaped Loading、Archive / Search / Work Detail routes、4 Published Works、Published-only and Draft isolation.
- Passed 1440 × 900、1280 × 800、768 × 1024、390 × 844、Light / Dark、semantics、focus、44px targets、zero overflow and zero browser console errors.
- Confirmed P0 = 0、P1 = 0 and Author Profile product P2 / post-Beta finding = 0.
- Retained AP-QA-001 only as a non-blocking extreme-content QA Fixture enhancement；it does not block Release or Beta.
- Added `UX-06F-STEP04_ACCEPTANCE.md` and synchronized Design Contract、Design Status、Roadmap、Project Status and Memory.
- Changed no product implementation、Follow / Unfollow business、data contract、permission、data layer、other route、dependency or deployment configuration.
- Passed Web lint / typecheck / 79 tests / build and `pnpm validate` with 167 / 167 workspace tests plus Web / Admin / Docs production builds.
- Passed `git diff --check`；Author Profile Ready for Release = YES，awaiting Product Owner final review，and no next UX Track is authorized.

## 2026-07-14 — UX-06F Step03 Author Profile States & Responsive QA

- Revalidated the frozen Step02 Public Identity、Bio、Quiet Relationship、Published Works Context、Body of Work and Recovery structure.
- Passed Guest、Reader followed / unfollowed / real Pending、Author self and restored the localhost Reader Follow state to its initial value.
- Captured real Profile-shaped Loading；audited honest Empty and single-owner Error contracts without fabricated data or broken dependencies.
- Passed Archive / Search / Work Detail round trips、4 Published Works、publishedAt、zero repeated self-links and Draft Work / Chapter isolation.
- Passed 1440 × 900、1280 × 800、768 × 1024、390 × 844、Light / Dark、keyboard focus、named regions、44px targets and zero horizontal overflow.
- Confirmed browser console errors = 0、P0 = 0、P1 = 0 and no Author Profile P2 / post-Beta product finding.
- Retained `AP-QA-001` only as a non-blocking extreme-content QA Fixture enhancement；explicit long-content protection remains active.
- Added `UX-06F-STEP03_ACCEPTANCE.md` and synchronized Design Contract、Design Status、Roadmap、Project Status and Memory.
- Changed no product implementation、Follow / Unfollow business、data contract、permission、data layer、other route、dependency or deployment configuration.
- Passed Web lint / typecheck / 79 tests / build and `pnpm validate` with 167 / 167 workspace tests plus Web / Admin / Docs production builds.
- Passed `git diff --check`；Author Profile Ready for Step04 = YES，awaiting Product Owner review，and Step04 is not authorized.

## 2026-07-13 — UX-06F Step02 Author Profile Layout Upgrade

- Upgraded `/author/[slug]` with route-local Public Identity、Bio、Quiet Relationship、Published Works Context、Body of Work and Recovery regions.
- Demoted avatar、counts and Follow presentation while preserving Guest sign-in、Reader Follow state、Author self hidden、pending、error、permission and redirect behavior.
- Made Work title and「查看作品」44px Work Detail entries，displayed existing `publishedAt` and removed repeated current-author self-links.
- Added Empty Archive / Search recovery、Profile-shaped Loading and a single-owner Error with Retry / discovery recovery.
- Passed Archive / Search / Work Detail entries、Guest / Reader / Author、Published-only、Draft isolation、1440 / 1280 / 768 / 390、Light / Dark、focus and zero browser console errors.
- Closed AP-AUDIT-001–008 and 010；completed AP-AUDIT-009 wrap protection and retained `AP-QA-001` for future extreme-content runtime evidence because current Fixture has no such data.
- Changed product implementation only in Author Profile route-local UI / CSS；changed no data layer、Follow business、permission、data contract、other route、dependency or deployment configuration.
- Added `UX-06F-STEP02_ACCEPTANCE.md` and synchronized Design Contract、Design Status、Roadmap、Project Status and Memory.
- Passed Web lint / typecheck / 79 tests / build and `pnpm validate` with 167 / 167 workspace tests plus Web / Admin / Docs production builds.
- Passed `git diff --check`；Author Profile Layout Ready for Step03 = YES，awaiting Product Owner review，and Step03 is not authorized.

## 2026-07-13 — UX-06F Step01 Author Profile UI Audit & Design Contract

- Audited `/author/[slug]` route、public Author eligibility、identity、bio、Follow / self states、statistics、Published Works and all route states.
- Confirmed Archive / Search / Work Detail author entries and Author Profile → Work Detail path.
- Passed Guest / Reader / Author、Published-only、Draft Work / Chapter isolation、1280 / 390 zero overflow and zero browser console errors.
- Recorded 10 P2 findings covering social-profile hierarchy、generic cards、touch targets、self-attribution、metadata、states、long-content and recovery；P0 / P1 are zero.
- Added `UX-06F-AUTHOR-PROFILE-DESIGN-CONTRACT.md` and synchronized Design Status、Roadmap、Project Status and Memory.
- Changed no product implementation、Follow / Unfollow business、Database、Supabase、Migration、RLS、RPC、Auth、Permission、Gateway、Service、Repository、data field、dependency or deployment configuration.
- Passed Web lint / typecheck / 79 tests / build and full `pnpm validate` with 167 / 167 workspace tests plus Web / Admin / Docs production builds.
- Passed `git diff --check`；Author Profile Ready for Step02 = YES，awaiting Product Owner review，and Step02 is not authorized.

## 2026-07-13 — UX-06E Search Track Product Owner Final Acceptance

- Product Owner accepted UX-06E Step01、Step02、Step03 and Step04 with PASS.
- Confirmed Search as Active Story & Author Discovery with the frozen Orientation → Query → Query Context / State → Work Results → Author Results → Recovery structure.
- Confirmed GET q、Initial empty query、80 / 81-character boundary、NFKC / whitespace normalization、Work 20 / Author 20 cap、Published-only and Draft isolation as the final query contract.
- Confirmed P0 / P1 at zero，all Search findings closed，Search P2 / post-Beta risk at zero and Search Ready for Release = YES.
- Closed UX-06E Search Track. No further Search optimization or new UX Track is authorized；awaiting the next explicit Product Owner Mission.
- Updated governance documents only；changed no product implementation、data、permission、Search query contract、dependency or deployment configuration.

## 2026-07-13 — UX-06E Step04 Search Release Acceptance

- Accepted Step01–Step03 as the frozen Search Release baseline and reconfirmed Search as Active Story & Author Discovery complementary to Archive browse / sort / pagination.
- Passed Initial、Valid Query、Empty、Invalid、80 / 81-character、NFKC normalization、Loading、controlled Error、Work Results and Author Results final QA.
- Passed 1440 / 1280 / 768 / 390、Light / Dark、focus、44px targets、semantics、zero overflow and zero clean-session browser errors.
- Passed Guest / Reader / Author、Published-only、Draft Work / Chapter isolation、Work Detail、Author Profile and recovery routes.
- Confirmed SE-AUDIT-001–008 and the Step03 Error clear finding remain Closed；P0 / P1 are zero.
- Added `UX-06E-STEP04_ACCEPTANCE.md` and synchronized Search Design Contract、Design Status、Roadmap、Project Status and Memory.
- Changed no product implementation、Database、Supabase、Migration、RLS、RPC、Auth、Permission、Gateway、Service、Repository、query fields、matching、ordering、result cap、dependency or deployment configuration.
- Passed Web lint / typecheck / 79 tests / build and full `pnpm validate` with 167 / 167 workspace tests plus Web / Admin / Docs production builds.
- Passed `git diff --check`；Search Ready for Release = YES. Product Owner subsequently recorded Final Decision PASS and closed UX-06E；no next UX Track is authorized.

## 2026-07-13 — UX-06E Step03 Search States & Responsive QA

- Revalidated Initial、GET q、Empty、Invalid 80 / 81-character、NFKC normalization、Loading、controlled Error、Work Results and Author Results.
- Passed 1440 / 1280 / 768 / 390、Light / Dark、focus-visible、44px targets and zero horizontal overflow.
- Passed Guest / Reader / Author、Published-only、Draft Work / Chapter isolation、Work / Author entries and zero clean-session browser errors.
- Found that Error `清空并重新搜索` changed the URL but retained the Next.js segment error boundary under same-route client navigation.
- Changed only `search/error.tsx` to use native full navigation for that recovery action；retest restores `/search` Initial State.
- Added `UX-06E-STEP03_ACCEPTANCE.md` and synchronized Search Design Contract、Design Status、Roadmap、Project Status and Memory.
- Changed no Database、Supabase schema、Migration、RLS、RPC、Auth、Permission、Gateway、Service、Repository、query fields、matching、ordering、result cap、dependency or deployment configuration.
- Passed Web lint / typecheck / 79 tests / build and `pnpm validate` with 167 / 167 workspace tests plus all production builds.
- P0 / P1 are zero；Search Ready for Step04 = YES，and UX-06E Step04 is not authorized.

## 2026-07-13 — UX-06E Step02 Search Layout Upgrade

- Upgraded `/search` with route-local Orientation、visible-labeled Query、Query Context / State、Work Results and Author Results regions.
- Replaced internal MVP / raw Slug presentation with Reader-facing active-query language while preserving slug matching.
- Used only existing Work / Author fields；added existing `publishedAt` to Work presentation without expanding the data contract.
- Added Initial / Empty Archive and Homepage recovery、Search-shaped Loading and a single-owner Error announcement.
- Raised Work / Author primary entries to at least 44px and passed focus、heading、Light / Dark and 1440 / 1280 / 768 / 390 zero-overflow QA.
- Rebuilt the Product Owner-authorized localhost QA Fixture and passed Guest / Reader / Author、Published-only、Draft isolation、Work / Author entries and zero browser errors.
- Passed `pnpm validate`、167 / 167 workspace tests、Web 79 / 79 and Web / Admin / Docs production builds；Search Layout Ready for Step03 = YES.
- Added `UX-06E-STEP02_ACCEPTANCE.md` and synchronized Search Design Contract、Design Status、Roadmap、Project Status and Memory.
- Changed only Search route-local product presentation；Database schema、Migration、RLS、RPC、Auth、Permission、Gateway、Service、Repository、query fields、matching、ordering、result cap、dependency and deployment configuration remain unchanged.
- UX-06E Step03 is not authorized and was not started.

## 2026-07-13 — UX-06E Step01 Search UI Audit & Design Contract

- Audited `/search` route、GET `q` query、normalization、input validation、Work / Author results and existing query boundaries.
- Audited Initial、Invalid、Empty、Loading、Error and Results states plus heading、list、live-region and recovery semantics.
- Passed 1280 Desktop and 390 × 844 Mobile baseline with zero overflow、44px input / submit and zero browser errors.
- Passed Published Work query、public Author query、no-result、Work / Author entries、Published-only and known Draft-isolation checks.
- Passed `pnpm validate`、167 workspace tests、Web 79 / 79 and Web / Admin / Docs production builds.
- Frozen Search as the active query entry and Archive as the complementary Published Work browse / sort / pagination path.
- Recorded eight P2 design / accessibility findings and a bounded Step02 recommendation；P0 / P1 are zero.
- Added `UX-06E-SEARCH-DESIGN-CONTRACT.md` and synchronized Design Status、Roadmap、Project Status and Memory.
- Changed no product implementation、Database、Supabase、RLS、RPC、Migration、Auth、Permission、Search data contract、dependency or deployment configuration. Search Ready for Step02 = YES；awaiting Product Owner review.

## 2026-07-13 — UX-06D Archive Track Product Owner Final Acceptance

- Product Owner approved UX-06D Step04 and the full Archive Track with final status PASS.
- Marked Step01、Step02、Step03 and Step04 Product Owner Accepted；Archive Track is Completed / Closed / Release Ready.
- Frozen Archive as the Curated Story Discovery Space with official sorts newest、oldest、title-asc and title-desc.
- Confirmed final P0 / P1 at zero and Archive Ready for Release = YES.
- Retained AR-AUDIT-003、AR-AUDIT-007 and KI-024 as accepted P2 / post-Beta items.
- No product implementation changed；no new UX Track was started.

## 2026-07-13 — UX-06D Step04 Archive Release Acceptance

- Consolidated UX-06D Step01–Step03 into the final Archive release baseline.
- Passed final default、Loading、Empty / Error contract、pagination、sort、URL、responsive and accessibility audits.
- Passed 1440 / 1280 / 768 / 390 with zero overflow、no abnormal clipping and 44px minimum Archive targets.
- Passed Guest / Reader / Author、Published-only、Draft Work / Chapter 404、Work Detail、Author Profile and ReaderShelf regression with zero browser errors.
- Confirmed official sort contract as newest、oldest、title-asc and title-desc.
- Retained AR-AUDIT-003、AR-AUDIT-007 and KI-024 as P2 / post-Beta risks；P0 / P1 are zero.
- Added no product、data、permission、dependency or deployment change. Archive Ready for Release = YES；subsequently accepted by Product Owner.

## 2026-07-13 — UX-06D Step03 Archive States & Responsive QA

- Revalidated Archive default、Loading、Empty / Error contracts、sort、page、invalid / out-of-range URL and Private Return states.
- Raised Archive Work title、Author and Work-entry targets to a 44px minimum after 390px QA found 15–28px interactive heights.
- Passed 1440 / 1280 / 768 / 390 with zero overflow、no abnormal text clipping and 44px minimum Archive interaction targets.
- Passed Guest / Reader / Author、Published-only、Draft Work / Chapter 404、Work Detail、Author Profile and ReaderShelf regression with zero browser errors.
- Preserved `BrowseWork`、Gateway、Repository、Service、pagination architecture、Database、Supabase、RLS、RPC、Migration、Auth、Permission and other routes.
- Kept AR-AUDIT-003、AR-AUDIT-007 and KI-024 unchanged；P0 / P1 are zero and Step04 remains unauthorized.

## 2026-07-13 — UX-06D Step02 Archive Layout Upgrade

- Upgraded `/archive` into a clearer Curated Story Discovery Space using route-local layout and styling only.
- Separated Orientation、Browse Controls、editorial Results、Pagination and secondary Private Return regions.
- Replaced generic inventory-card presentation with a content-first work list using only existing `BrowseWork` fields.
- Added Homepage / Search empty recovery and a route-local static loading composition；kept Error recovery clear.
- Preserved four sorts、URL state、pagination、Published-only、Reader Permission、Draft Isolation、ReaderShelf behavior and Work / Author links.
- Passed 1440 / 1280 / 768 / 390 responsive、Guest / Reader / Author、79 Web tests and zero-error browser regression；P0 / P1 are zero.
- Added no dependency、QA data、Database、Supabase、RLS、RPC、Migration、Auth、Permission or business-logic change. Step03 remains unauthorized.

## 2026-07-12 — UX-06C Step04A QA Fixture Library Foundation

- Product Owner accepted UX-06C Step04A；the reusable Reading QA Infrastructure is frozen and the Mission is closed.
- UX-06C Step04 remains pending separate rerun authorization；Step05 remains blocked until Step04 passes.
- Extended the existing localhost-only `qa:fixture` path with a reusable Reading QA Fixture Library；no second QA system was introduced.
- Added fixed-ID Short、Long-form、Multi Chapter、Empty Published and Draft Isolation content using synthetic text only.
- Added `qa:fixture:clean` to remove only Reading QA Works / Chapters while preserving QA identities、credentials and role grants.
- Verified repeated creation at 4 Works / 6 Chapters，exact cleanup to zero，recreation，credentials and local-only guards.
- Verified Reader Archive / Work / Long Chapter、150-paragraph long scrolling、3 Published Chapter continuity、Draft isolation、Author Studio / Profile and Guest / role regression with zero browser errors.
- Added no Migration、Schema、RLS、Permission、Reader logic、UI、Typography or production-data change.

## 2026-07-12 — UX-06C Reading Track Step 04 Long-form QA

- Passed available real-content QA at 1440 Desktop、768 Tablet and 390 Mobile，including scroll、Settings、Directory、Chapter switch and preference persistence.
- Passed Guest、Reader、Author、Homepage、Archive、Work Detail、Chapter Reading、Author Profile、Studio and role-boundary regression with zero browser errors.
- Passed unknown Chapter、Draft isolation、unpublished Work and Guest sign-in recovery states without technical error exposure.
- Recorded LFQA-001: local published content is too short to validate a 20–30 minute long-form scenario；Step 04 is HOLD and Step 05 is blocked.
- Applied no code、database、Supabase、permission or business-logic change.

## 2026-07-12 — UX-06C Reading Track Step 03

- Product Owner accepted UX-06C Step 03；the Reading Interaction foundation is frozen and the Step is formally closed.
- UX-06C Step 04 remains unauthorized and was not started.
- Unified Chapter Directory、Mobile Reading Navigation and Reading Settings under one route-local active-panel state，preventing simultaneous supporting surfaces.
- Added explicit low-distraction close actions with trigger focus restoration and retained current-Chapter `aria-current` semantics.
- Added restrained Chapter-end continuity copy while preserving existing Previous / Next routes and unavailable states.
- Passed 1440 Desktop、390 Mobile、44px touch targets、zero horizontal overflow、Guest / Reader / Author regression and clean-page browser error checks.
- No Database、Supabase、Migration、Auth、Permission、Reader preference or Reading business logic changed.

## 2026-07-12 — UX-06C Reading Track Step 02

- Product Owner accepted UX-06C Step 02；Typography、Reading Rhythm and Progressive Disclosure are now frozen foundations for the Reading Track。
- UX-06C Step 03 was subsequently authorized and is tracked in its own entry。

- Added a route-local mixed-language system-serif fallback for Reading prose and
  Chapter title without adding font files or external dependencies.
- Replaced viewport-scaled Chapter title typography with discrete 36px Desktop、
  32px Tablet and 30px Mobile sizes.
- Refined paragraph、in-prose heading、list、blockquote and Chapter-opening rhythm
  while retaining the existing 17 / 19 / 21px、1.65 / 1.8 / 2 and 58 / 68 / 78ch
  Reader preference contract.
- Passed 1440、768 and 390 responsive typography QA，maximum preference and
  persistence checks，Light / Dark contrast review and existing Reading regression.
- No Database、Supabase、Migration、Auth、Permission or business logic changed.

## 2026-07-12 — Frozen Studio Chapter Management UX Foundation

- Added the frozen Author Studio / Work Editor rules for collapsible
  multi-chapter management and an explicitly identified active editing chapter.
- Defined eligible-only Select All with none、partial and all selection states；
  published、ineligible、invalid and unsaved chapters remain excluded，and zero
  selection cannot publish.
- Recorded responsive and accessibility guardrails without changing Studio code、
  Database、Supabase、RLS、Auth、permissions、routes or publish behavior.
- Implementation requires a separate Author Studio / Chapter Management Mission.

## 2026-07-12 — UX-06C Reading Track Step 01

- Added route-local Reading Page layout primitives for Chapter context, story
  content and chapter continuation.
- Added a pure-presentational Chapter Header and moved Chapter identity out of
  route-level utility-class composition.
- Constrained context, controls and continuation to a stable editorial container
  while retaining the existing adjustable prose measure.
- Corrected Reading heading order by retaining the settings accessible label
  without introducing an H2 before the Chapter H1.
- Reworked the shared Header into explicit Brand、Primary Navigation and Utility /
  Account regions. The brand is the sole Homepage anchor; Reader navigation is
  Archive、Search、then capability-gated Studio; theme remains right-aligned.
- Added responsive Header behavior for 1440、1280、768 and 390 widths plus 44px
  primary interaction targets without changing Auth、role、Studio or theme logic.
- Prevented uninterrupted Chapter prose from expanding the Reading grid beyond
  the mobile viewport; typography and reader preference values are unchanged.
- Added page-local Mobile Reading Navigation with Return to Work and a native
  collapsible panel for Homepage、Archive、Shelf、Search、previous / next and
  Chapter Directory.
- Changed Chapter Directory from permanently open to on-demand；mobile expansion
  stays in document flow and desktop continuation remains low-distraction.
- Product Owner accepted UX-06C Step 01 and the Additional Mobile Reading
  Foundation. Reading Track foundation is complete；Step 02 remains unauthorized.
- Preserved Session / Reader capability checks, hybrid published-only reads,
  preferences, history, bookmark, previous/next and directory behavior.
- Web TypeScript、ESLint、79/79 Vitest and production build pass. No Database、
  Supabase、Migration、Auth、Permission or business logic changed.

## 2026-07-11 — UX-06B Homepage Implementation Step 04

- Completed Homepage Release Readiness without changing Homepage code, content,
  components, styles or business behavior.
- Passed 1440 Desktop、1280 Laptop、768 Tablet and 390 Mobile responsive audits.
- Passed heading/landmark/name/ID/focus accessibility checks and Light/Dark WCAG
  contrast review.
- Passed restrained interaction, no-image/no-external-font, stable geometry and
  local production TTFB checks.
- Passed Guest Homepage、Register with valid Invitation、Login、Archive、Reader
  Works/Work/Chapter、Author Profile、Author Studio and Reader Studio denial.
- Repaired the initial full validation blocker by mechanically formatting existing
  `docs/18_Design` Markdown; no design decision changed.
- Full `pnpm validate` and Web / Admin / Docs production builds pass. Product
  Owner accepted Homepage Release Readiness and closed the UX-06B Homepage Track;
  UX-06C Reading Track remains unauthorized.

## 2026-07-11 — Mandatory Manual QA Handoff Gate

- Added the permanent requirement that every manual-acceptance Mission proactively
  supplies QA Environment, dynamic local Fixture credentials, actual identity
  validation results and a standard Product Owner checklist.
- Classified broken QA environments, missing/invalid credentials, failed Reader or
  Author login and invalid required invitations as P0 handoff blockers.
- Added `docs/13_Test/MANUAL_QA_HANDOFF.md` and linked the rule from Project Rules,
  Workflow, Acceptance Checklist, Testing Strategy and Local QA Fixture guidance.
- Repaired and revalidated the current local Fixture with `pnpm qa:fixture`;
  Guest Homepage, Reader login/Studio denial, Author login/Studio/Profile,
  Desktop/Mobile and zero-error console all pass.
- Kept plaintext passwords and invitation codes outside tracked documentation.

## 2026-07-11 — UX-06B Homepage Implementation Step 03

- Refined Homepage Hero、Section heading、body and Work preview typography while
  retaining the existing system serif fallback and semantic color tokens.
- Replaced repeated section bottom borders with whitespace and quiet surface
  rhythm, narrowed editorial reading measures and increased preview spacing.
- Added restrained color and underline feedback without transforms, complex
  animation, new colors or decorative effects.
- Preserved full-width mobile command buttons while returning supporting text
  links to natural width.
- Web TypeScript、ESLint、79/79 Vitest and production build pass.
- Desktop 1280 x 720、Tablet 768 x 1024、Mobile 390 x 844 and Light/Dark theme
  Browser QA pass with no horizontal overflow or console errors.
- Homepage still renders five regions and three current Published Works; Archive
  public access and existing Reader / Author sign-in boundaries remain intact.
- No React structure、Component、database、Supabase、Auth、permission or business
  logic change was introduced. Product Owner accepted Step 03; Step 04 remains
  unauthorized.

## 2026-07-11 — UX-06B Homepage Implementation Step 02

- Replaced Homepage engineering placeholders and fixture previews with a quiet,
  user-facing literary content hierarchy.
- Added Brand Introduction, Story Discovery, Published Work, Reading Entry and
  Closing content regions.
- Added a route-local `HomepageWorkPreview` component for title, public author,
  summary and publication date.
- Reused the existing Published-only browse gateway and displayed the first three
  newest works without recommendation, ranking or popularity logic.
- Preserved Root Layout, SEO, Reader gate, Archive, Author, Auth, database,
  Supabase, permission and business contracts.
- Web typecheck, lint, 79/79 tests, production build, desktop/mobile Browser QA,
  real Published Work/Author links and zero-error Homepage console pass.
- Product Owner accepted Step 02; Step 03 remains unauthorized.

## 2026-07-11 — UX-06B Homepage Implementation Step 01

- Added a route-local Homepage Shell and semantic Section primitive.
- Reframed Homepage into Entry Hero, Archive Foundation, Preview Shelf and Calm
  Closing regions without legacy gradient hero or dashboard-card composition.
- Added Homepage-specific responsive editorial styling with full-width mobile
  actions and no horizontal overflow at 390 x 844.
- Preserved Root Layout, SEO, Session, Reader gate, Archive, Author, Auth, existing
  data sources and all Homepage link destinations.
- Web typecheck, lint, 79/79 tests, production build, desktop/mobile/dark Browser
  QA and zero-error Homepage console pass.
- No dependency, database, Supabase, Auth, permission or business-logic change was
  introduced. Product Owner accepted Step 01; Step 02 is unauthorized.

## 2026-07-11 — UX-06A Design System Implementation Foundation

- Reviewed the current `apps/web` and `packages/ui` styling architecture against
  the accepted UX-01 through UX-05E design foundation.
- Added implementation strategy for semantic Tokens, typography, color, spacing,
  radius, elevation, motion and gradual page migration.
- Added shared-component ownership, candidate, responsibility and anti-pattern
  guidance.
- Added responsive, accessibility, reading-protection, visual-consistency and
  functional-safety implementation rules.
- Updated UX Design status, roadmap and the UX-06A acceptance record.
- No Token, Component, CSS, Tailwind, page, dependency, Auth, permission,
  database, Supabase or business-logic change was introduced.
- Product Owner accepted UX-06A. UX-06B remains unauthorized.

## 2026-07-11 — Mission RR-1C PASS / V1 Beta Ready

- Product Owner completed final Mission RR-1C acceptance and confirmed PASS.
- QA Fixture acceptance completed.
- Author / Reader permission chain passed manual verification.
- Reader `/studio` correctly redirects to `/archive`.
- Release Candidate baseline `8495bded5e0c78985be7410cceb902cd2c090421`
  is Product Owner Accepted and Beta Ready.
- Mission RR-1C is formally closed. No Git tag, Go / No-Go, release action or new
  development was authorized.

## 2026-07-11 — Mission RR-1C Local QA Fixture Repair

- Added `pnpm qa:credentials` so the Product Owner can read local-only acceptance
  credentials in the current terminal without placing passwords in tracked files
  or public documentation.
- Added localhost-guarded `qa:fixture`, `qa:reset` and `qa:web` workflows for
  authenticated local Product Owner acceptance.
- Added synthetic `Harbor QA Reader` and `Harbor QA Author` identities with active
  memberships, Author grant/profile and invitation relationship.
- Kept passwords and plaintext invitation data exclusively in Git-ignored local
  credentials with mode `0600`.
- Rebuilt all 14 local migrations and restored the fixture afterward; repeated
  execution is idempotent.
- Browser QA passes Author login/Profile/Studio, Reader login/content access and
  Reader Studio denial with zero console errors.
- No production data, Migration, RLS, Auth architecture or Permission Model changed.
- This repair was subsequently Product Owner accepted as part of RR-1C PASS.

## 2026-07-10 — Mission RR-1C Release Candidate Engineering Complete

- Completed final Runtime, Migration, SQL, Validation, Browser QA, Mobile QA,
  Documentation and Known Issues audits.
- Rebuilt local Supabase from zero with 14 migrations, confirmed local/remote
  14/14 parity, passed local schema lint and six SQL suites.
- `pnpm validate` passes formatting, lint, typecheck, 167 tests and Web/Admin/Docs
  builds with P0 at zero.
- Final desktop and 390×844 mobile QA pass on public discovery, SEO endpoints,
  metadata, unauthenticated guards and responsive overflow checks.
- Created the Release Candidate Report and Beta Ready Checklist.
- Established the Release Candidate Git baseline later accepted at
  `8495bded5e0c78985be7410cceb902cd2c090421` after the QA Fixture supplement.
- No new business feature, migration, dependency, permission model, framework,
  workflow or governance change was introduced.
- Mission RR-1C was subsequently Product Owner accepted; no Git tag was created.

## 2026-07-07 — Mission RR-1B PASS

- Product Owner completed final Production Deployment acceptance and confirmed
  Mission RR-1B PASS.
- Accepted Production URL, HTTPS, Environment Variables, Production Build, Home,
  Archive, Search, Author, Published Work, Sitemap, Robots, Metadata, Canonical,
  Open Graph, Browser Smoke, Console, Network and Responsive Layout.
- Added RR-1B acceptance report and deployment notes.
- Updated Release Readiness, Roadmap, Project Status, Acceptance, Memory and Known
  Issues to close RR-1B and wait for RR-1C authorization.
- No business code, migration, dependency, environment variable or deployment
  configuration was changed by this documentation closure.
- Mission RR-1C Release Candidate remains unauthorized and unstarted.

## 2026-07-04 — Mission RR-1A Release Preparation Engineering Complete

- Completed Runtime Contract, Migration, Validation, Build, Documentation and
  Project Structure audits without changing business code or deployment state.
- Rebuilt local Supabase from 14 migrations and passed six PostgreSQL SQL suites;
  local/remote migration histories remain 14/14 aligned.
- `pnpm validate` passes 167 tests and Web/Admin/Docs builds with P0 at zero.
- Established the V1 Beta Release Checklist and deployed Browser QA Checklist.
- Classified release gates and added KI-027 through KI-030 for dependency,
  workspace-root, CI and Supabase preflight risks.
- RR-1A established the preparation baseline; at that time RR-1B and RR-1C were
  not started.

## 2026-07-04 — Mission 3C-3 PASS / Phase 3 Completed

- Product Owner completed final Mission 3C-3 browser acceptance and confirmed PASS.
- Accepted Sitemap XML, Robots, Published-only inclusion, Draft exclusion,
  Author/Work/Archive/Search inclusion, metadata, canonical, Open Graph,
  Draft noindex, responsive behavior and clean console.
- Mission 3C-3 and Mission 3C are formally closed. Phase 3 is Completed —
  Product Owner Accepted.
- Release Readiness `RR-1` remains unauthorized and unstarted.

## 2026-07-03 — Mission 3C-3 SEO Foundation Engineering Complete

- Added dynamic `sitemap.xml` and `robots.txt` using the existing Published-only
  public catalog boundary; Draft works are excluded.
- Added site, Archive, Search, Author and Published Work metadata with canonical
  URLs, descriptions, robots directives and Open Graph fields.
- Added noindex protection for missing/unpublished Work metadata and Studio routes.
- Added `NEXT_PUBLIC_SITE_URL` runtime configuration with Vercel and localhost
  fallbacks; no framework, dependency, migration or permission change was made.
- Full validation, runtime checks and desktop/390px Browser QA pass. Mission 3C-3
  awaits Product Owner acceptance; RR-1 was not started.

## 2026-07-03 — Mission 3C-2 Browse Experience PASS

- Product Owner completed final Browse Experience acceptance and confirmed PASS.
- Accepted Archive, Published-only isolation, pagination, four sorts, URL state
  recovery, out-of-range correction, all page states, responsive layout,
  accessibility, Browser QA and a clean console.
- Mission 3C-2 is formally closed. Mission 3C-3 is SEO Foundation and remains
  unauthorized and unstarted.

## 2026-07-03 — Mission 3C-2 Browse Experience Engineering Complete

- Added public `/archive` Published Works browsing with deterministic pagination,
  newest/oldest/title sorting, shareable URL state and out-of-range correction.
- Added published-only Browse Service/Repository/RPC boundaries plus loading,
  empty and recoverable error states; Draft and private identity fields remain
  excluded.
- Local rebuild, SQL checks, remote 14/14 Migration parity, full validation and
  desktop/390px Browser QA pass with P0 at zero.
- Mission 3C-2 now awaits Product Owner acceptance; Mission 3C-3 was not started.

## 2026-07-03 — Mission 3C-1 Search MVP PASS

- Product Owner completed final Search MVP acceptance and confirmed PASS.
- Accepted Published Work, Work Slug, Author and Author Slug search, Draft
  isolation, URL synchronization, all page states, responsive layout,
  accessibility and Browser QA with a clean console.
- Mission 3C-1 is formally closed. Mission 3C-2 Browse Experience remains
  unauthorized and unstarted.

## 2026-07-03 — Mission 3C-1 Search MVP Engineering Complete

- Added public `/search` with GET-based URL synchronization and accessible Search,
  Results, Empty, Loading and Error states.
- Added bounded, case-insensitive Published Work title/slug and public Author
  name/slug matching without full text, fuzzy search, ranking or analytics.
- Added Search Service / Repository boundaries and a narrow public read RPC that
  exposes no Draft or private identity fields.
- Added unit, Migration contract and PostgreSQL permission/isolation coverage.
- Deployed the additive Migration; local/remote histories are 13/13 aligned and
  anonymous remote search returns HTTP 200.
- Full validation and Browser QA pass. Mission 3C-2 was not started.

## 2026-07-03 — Mission 3B PASS

- Product Owner completed the final browser acceptance and confirmed Mission 3B PASS.
- Accepted Create Work, Save Draft, Publish, Reader readback, Author Public
  Profile, published-only isolation, Follow / Unfollow, login return,
  Invitation Relationship and baseline mobile layout.
- Closed the acceptance-found publishing and Studio owner-read P0 after repair
  and successful re-verification.
- Reconfirmed full `pnpm validate`, zero known P0 and local/remote 12/12
  Migration parity.
- Mission 3B is closed. Mission 3C remains unauthorized and unstarted.

## 2026-07-03 — Studio Works P0 Owner Read Repair

- Reproduced `/studio/works` failure as a PostgreSQL privilege error caused by
  filtering on the intentionally non-readable `owner_user_id` column.
- Added authenticated-only `list_my_studio_works` / `get_my_studio_work` RPCs
  instead of widening grants or relying on public Published Work visibility.
- Updated Studio list, detail and editor ownership preflight reads to use the
  owner-scoped RPCs; all writes remain protected by existing RLS.
- Added contract and PostgreSQL coverage for anon denial, Reader empty results,
  Author own-only results and no owner ID disclosure.
- Deployed the Migration remotely; local/remote histories are 12/12 aligned and
  anonymous remote invocation returns HTTP 401.

## 2026-07-03 — Phase 3 Reader / Studio Acceptance Fix Engineering Complete

- Added clickable public Author identity across landing, Reader Work cards,
  Work detail, Chapter reading, Author profile and new local shelf records.
- Added global signed-out Login / Register and signed-in registration name /
  Studio / Sign-out header state.
- Added published-only TXT Work export with ordered Chapter content.
- Replaced fixture Studio Work lists/details with owner-scoped Supabase data,
  including Draft and Published management paths.
- Added Chapter create/title/body save, publish selection and governed Work tag
  association editing without expanding delete permissions.
- Added and remotely deployed the narrow `get_published_work_authors` RPC;
  local/remote Migration histories are 11/11 aligned and remote RPC returns 200.
- Product Owner acceptance remains pending.

## 2026-07-02 — Mission 3B Engineering Complete

- Added public Author Profile routes with public identity, Bio, initials avatar,
  statistics, published-only works and complete page states.
- Added idempotent Reader-to-Author Follow / Unfollow with login return path and
  consistent follower/following counts.
- Added own-only invitation relationship summaries over existing Invitation and
  Redemption facts.
- Added the social relationship Migration, Service / Repository boundaries,
  transactional SQL coverage, Browser QA and Mission 3B handoff.
- Rebuilt local Supabase and deployed the additive Migration remotely; local and
  remote histories are 10/10 aligned.
- Mission 3B awaits Product Owner acceptance; Mission 3C and RR-1 were not started.

## 2026-07-02 — Mission 3A PASS

- Product Owner confirmed `Mission 3A. PASS`.
- Closed the Phase 3A Beta Blocking acceptance gate with engineering P0 at zero.
- Preserved KI-017 and KI-018 for Release Readiness.
- Mission 3B, Mission 3C and RR-1 remain unauthorized.

## 2026-07-02 — Mission 3A Engineering Complete

- Completed the authorized Mission 3A scope across 3A-0, 3A-1, 3A-2 and the
  required 3A-3 formatting blocker repair.
- Passed the full workspace validation, local nine-migration rebuild and all
  three SQL permission suites.
- Confirmed local/remote 9/9 migration parity, remote signup availability and
  Email Autoconfirm.
- Completed real remote registration, registration-name login, Reader denial,
  audited Author grant, Studio, draft creation, body save, publish and Reader
  readback.
- Verified unauthenticated guards and 390×844 auth, Reader, shelf and Studio
  layouts without horizontal overflow; browser application errors remained zero.
- Added the Mission 3A report, Product Handoff, manual acceptance checklist and
  KI-017/KI-018 release-readiness risks.
- Stopped before Mission 3B pending Product Owner acceptance.

## 2026-07-02 — Phase 3 Fast Launch Governance

- Replaced the planned Phase 3 Reading scope with the Product Owner-approved V1
  Fast Launch governance model.
- Organized work into Phase 3A Beta Blocking, Phase 3B Beta Operations and Phase
  3C Beta Polish.
- Made Phase 3A the only Beta-blocking stage; Phase 3B and Phase 3C may run after
  Beta and do not delay launch.
- Added `3B-3 Invitation Relationship` for a simple Admin Table, Tree Table or
  Parent / Child invitation tree without analytics or complex visualization.
- Moved former Sprint 3.10 out of Phase 3 as independent Release Readiness `RR-1`.
- Added the new numbering map and updated Phase documents, Roadmaps and project
  status.
- This was a documentation-only governance change. No business code changed and
  no Sprint started or received implementation authorization.

## 2026-07-02 — Phase 2 Pass / Auth P0 Resolved

- Product Owner confirmed successful Studio entry with the remotely registered `Auther001` account.
- Confirmed the accepted chain: nine remote migrations deployed, Email Confirm disabled, real remote registration, registration-name/password login, audited manual Author grant and Studio entry.
- Updated Phase 2 from Conditional Pass to Pass and closed the Phase 2 Auth P0.
- Phase 3 implementation has not started and still requires separate planning and explicit authorization.

## 2026-07-02 — Remote QA Author Grant

- Confirmed remote registration name `Auther001` maps to an active Membership.
- Bootstrapped the controlled remote QA operator and manually granted Author to `Auther001` under explicit Product Owner authorization.
- Wrote the corresponding role-grant audit record.
- Phase 2 remains Conditional Pass until Product Owner confirms successful Studio entry.

## 2026-07-02 — Phase 2 Remote P0 Environment Preparation

### Remote changes

- Linked Supabase CLI to project `szfhngifsipsrxcpekti`.
- Deployed all nine ordered migrations and verified local/remote migration history parity.
- Verified `validate_registration_invitation` and `registration_invitation_status` through the remote REST API.
- Set remote `mailer_autoconfirm` to true without pushing unrelated local Auth configuration.
- Created a bounded remote QA invitation with three uses and seven-day expiry.
- Restarted Web without local overrides; root/Web/Admin env URLs all target the linked remote project.

### Acceptance boundary

- Phase 2 remains Conditional Pass and P0 remains open until Product Owner completes real registration and login.
- Invitation admission still grants Reader only. Entering Studio with the new acceptance account requires a separate manual Author grant.
- Phase 3 implementation remains prohibited.

## 2026-07-02 — Phase 2 Conditional Pass

### Product Owner acceptance

- Recorded Phase 2 as Conditional Pass.
- Product Owner manually checked the Author and Reader surfaces and found no other obvious issue besides registration P0.
- Allowed preparation of next-step planning while explicitly prohibiting Phase 3 implementation.

### Pass conditions

- Deploy the latest migrations to the configured remote Supabase.
- Disable remote Email Confirm.
- Complete one real registration in the remote acceptance environment.
- Sign in successfully with registration name + password.
- Enter Studio successfully in the same acceptance environment.

## 2026-07-02 — Phase 2 Auth P0 Regression Repair

### Root cause

- Reproduced `/auth/sign-up` redirecting to the generic Provider error.
- Browser console contained no registration exception because the Server Action caught and collapsed the Provider error.
- The remote Supabase RPC response was HTTP 404 / `PGRST202`: the configured project does not contain `validate_registration_invitation`.
- Local clean migrations, Trigger and Auth signup succeed, excluding local RLS, registration-name validation and Trigger logic as the primary cause.

### Changed

- Added non-disclosing invitation status classification for valid, invalid, expired, exhausted and revoked invitations.
- Added explicit Provider and Server Action error categories for invitation states, duplicate registration name, password rejection, rate limit, missing remote Migration and temporary service failure.
- Replaced the generic signup failure text with specific, actionable messages.
- Added Provider, Server Action, Migration-contract and SQL status-matrix coverage.

### Verification and blocker

- Nine local migrations, three transactional SQL suites and a real local Auth signup pass.
- Workspace lint, typecheck, full Vitest and all three production builds pass.
- Remote deployment was not performed: Supabase CLI has no Platform token and the repository is not linked to the remote project.
- Phase 2 remains P0 Blocked and Phase 3 is prohibited until remote Migration/Auth deployment and browser registration pass.

## 2026-07-02 — Phase 2 Product Handoff

### Added

- Added the Phase 2 QA handoff with startup instructions, application entry, local Reader / Author test accounts, route inventory, recommended manual acceptance flow and known limitations.
- Added a reusable Product Handoff template that is required after every future Product Phase.
- Prepared local-only `Phase2Reader` and `Phase2Author` accounts plus a bounded QA invitation in the current local Supabase Runtime.

### Verification and boundaries

- Both QA accounts return valid sessions through the local Auth API.
- The existing repository `.env.local` points to remote Supabase, so QA must switch all local env files to the local Supabase URL and publishable key before using these accounts in the Web UI.
- No business code, dependency, package manifest, lockfile, Migration, Schema, RLS, permission model or deployment configuration changed.
- Local QA identities are Runtime data only and disappear after `supabase db reset`.

## 2026-07-02 — Phase 2 Auth P0 Registration Model

### Changed

- Replaced user-facing email/password signup and login with registration-name/password credentials.
- Made invitation code a required signup field and kept the password rule at a simple minimum of eight characters.
- Removed email-confirmation UI, login gating and email-delivery rate-limit messaging.
- Added `profiles.registration_name`, a case-insensitive unique index, invitation preflight and an atomic Auth signup trigger.

### Security and runtime

- The Auth insert, Profile, active Membership, Invitation Redemption, invite consumption and audit record now commit or roll back together.
- Invalid invitations and duplicate registration names leave no partial Auth user or membership state.
- Registration metadata is validated only as transaction input; trusted runtime identity and authorization continue to use Auth user ID, Membership and `role_grants`.
- Local Supabase reset, Phase 1C/Phase 2 content/Phase 2 Auth SQL scripts, real local Auth signup/login, lint, typecheck, full Vitest and all three production builds pass.

## 2026-06-28 — Sprint 0

### Added

- Created the `FandomHarbor` project directory structure.
- Added the mandatory AI memory and development-governance documents.
- Recorded the confirmed product vision, roles, access model, scope boundaries, and decisions.
- Added documentation areas for product, architecture, database, API, UI, Sprints, meetings, and research.
- Added empty application, package, Supabase, and scripts directories without introducing code or choosing a technical stack.
- Added Sprint 0–5 prompt documents as planning guardrails.

### Not added

- No business functionality, dependencies, database schema, framework configuration, or deployment configuration.

## 2026-06-28 — Foundation Rebuild

### Added

- Expanded mandatory startup memory with `KNOWN_ISSUES.md`, `TECH_STACK.md` and `ACCEPTANCE_CHECKLIST.md`.
- Recorded the product-owner-approved Next.js/Supabase/Tailwind/shadcn/TipTap stack without installing packages.
- Added complete PRD, feature acceptance, role/permission, information architecture and navigation documentation.
- Added modular-monolith architecture, deployment, risk and technical-debt strategies.
- Added foundation threat model and testing strategy, including explicit permission/RLS negative-test coverage.
- Added conceptual domain model, Supabase schema blueprint, RLS matrix and data lifecycle documentation.
- Added API/server contract catalog and UI Design Bible, token and component rules.
- Added research protocol, official stack references, Sprint roadmap and review templates.
- Added repository-neutral `.editorconfig`, `.gitignore` and boundary READMEs.

### Changed

- Defined `apps/web` as Visitor/Reader/Author and `apps/admin` as Admin/Super Admin.
- Removed the empty `apps/shared` directory; shared implementation must use purpose-specific packages.
- Reframed Sprint 0–5 files as milestone envelopes that require approved outcome-sized briefs.
- Converted decision history into dated, status-bearing records with consequences.

### Not added

- No application code, pages, business logic, packages, lockfile, SQL migration, Supabase project, Git repository or deployment.

## 2026-06-28 — Phase 0.5: Freeze Product Blueprint

### Added

- Added `apps/docs` with a read-only documentation application boundary README.
- Expanded packages structure with `editor`, `auth`, `services`, `types` and `constants`; all nine package directories now contain purpose READMEs.
- Added `.ai/DESIGN_DECISIONS.md` for UI, interaction, product and reading-experience decisions.
- Added `.ai/FEATURE_FLAGS.md` with approved blueprint defaults and flag governance.
- Added `.ai/STYLE_GUIDE.md` with concrete reading, control, navigation, form, table and tag rules.
- Added `docs/00_Project/PRINCIPLES.md` with the ten Product and Engineering Principles.

### Changed

- Reorganized docs into numbered folders `00_Project` through `16_Research` without deleting existing document content.
- Updated all repository references from legacy docs paths to numbered paths.
- Updated `START_HERE.md` read order from 10 to 13 mandatory memory files.
- Reworked `docs/14_Sprint/ROADMAP.md` into the Product Phase Roadmap for Phase 0, 0.5 and 1–8.
- Defined Phase as the product stage and Sprint as an engineering unit within a Phase.
- Updated `PROJECT_STATUS.md` to Phase 0.5 — Freeze Product Blueprint.
- Updated app/package ownership, root documentation map, memory, rules and acceptance checklist.

### Conflicts preserved and resolved by supersession

- D-002's two-application count and D-009's app-count wording are retained historically but superseded by D-017, which adds the reserved `apps/docs` boundary.
- Legacy `SPRINT_1.md` through `SPRINT_5.md` content is retained and marked Superseded as product-stage planning; the Product Phase Roadmap is now authoritative.

### Not added

- No application code, page, business logic, dependency, lockfile, SQL migration, Supabase project or deployment configuration.

## 2026-06-28 — Phase 0.6: Product Freeze Review

### Added

- Added a dedicated `06_Design_System` layer with Color, Typography, Spacing, Grid, Radius, Elevation, Motion, Responsive, Dark Mode, Accessibility, Reader Layout and Admin Layout rules.
- Added Database registries for ERD, Migration, Policies, RLS, Seed, Indexes and Lifecycle; migrated existing schema/model/RLS/lifecycle documents into their owners.
- Added API registries for REST, ServerActions, Realtime, Webhooks, Events, Errors and Contracts; migrated the API specification into Contracts.
- Added `VISION.md`, `NON_GOALS.md`, `GLOSSARY.md` and `PRODUCT_RISKS.md`.
- Added `docs/17_Architecture_Decisions/` with ADR registry/template and ADR-001 through ADR-016.
- Added `.ai/AI_BEHAVIOR.md` and made it mandatory startup context.
- Added complete seven-document packages for Phase 0, 0.5, 0.6 and 1–8.

### Changed

- Frozen documentation taxonomy at `00_Project` through `18_Research`.
- Separated UI experience, Design System rules and Component implementation documentation.
- Inserted Phase 0.6 — Product Freeze Review into the Product Phase Roadmap.
- Updated startup order from 13 to 14 mandatory AI files.
- Updated root/docs indexes, rules, memory, status, decisions, acceptance gates and all live path references.
- Marked D-016 as superseded by D-019 and recorded final traceability/ADR/AI behavior decisions.

### Remaining gates

- Phase 0.6 still requires product-owner approval.
- Phase 1 remains blocked by unresolved authentication, invitation permission/lineage and transactional-email decisions.

### Not added

- No application code, page, business logic, dependency, lockfile, SQL migration, Supabase project or deployment configuration.

## 2026-06-28 — Phase 0.6 Supplement: Language Policy

### Added

- Added `.ai/LANGUAGE_POLICY.md` as the permanent policy for Product Owner communication, project artifact language and Sprint reporting.
- Recorded D-024 and made the language policy mandatory startup context.

### Changed

- Expanded the mandatory startup context from 14 to 15 files.
- Set Simplified Chinese as the default Product Owner communication language.
- Confirmed English for code, database and API identifiers, formal project documentation and Git metadata.
- Synchronized startup instructions, project memory, rules, status, acceptance references and the master prompt.

### Not added

- No application code, business logic, dependency, package installation, SQL migration or deployment configuration.

## 2026-06-28 — Phase 0.6 Supplement: Language Policy Revision

### Changed

- Replaced the English-document-content rule with Simplified Chinese content for formal product documentation.
- Retained English for file names, directory names, database identifiers, code identifiers, variables and API identifiers.
- Explicitly prohibited translation-only work for existing documents.
- Added D-025 to supersede D-024's language allocation while preserving mandatory startup and Sprint approval requirements.
- Synchronized the language policy, project memory, project rules and master prompt.

### Not changed

- Existing documents were not translated or rewritten for language consistency.
- Phase 0.6 remains awaiting Product Owner approval, and application development remains prohibited.

## 2026-06-28 — Phase 1 Supplement: Environment Policy

### Added

- Added `.ai/ENVIRONMENT_POLICY.md` as the permanent workflow for network, package installation, remote-service, runtime, CI, Sandbox and local environment failures.
- Added D-026 and made the environment policy mandatory startup context.

### Changed

- Expanded the mandatory startup context from 15 to 16 files.
- Required environment failures to stop the affected operation, enter Blocked status for Environment Issue and wait for Product Owner approval.
- Prohibited repeated retries, silent tool replacement, package-manager or registry changes, dependency downgrades and architecture workarounds.

### Protected

- No environment issue changed `PROJECT_STATUS.md`, Roadmap, Product Vision, Architecture or Sprint Acceptance.

## 2026-06-28 — Phase 1 Supplement: Escalation Rules

### Added

- Added `.ai/WORKFLOW.md` with permanent Tech Lead autonomy and Product Owner escalation boundaries.
- Added D-027 and made the workflow mandatory startup context.

### Changed

- Expanded the mandatory startup context from 16 to 17 files.
- Authorized autonomous refactoring, file organization, component extraction, performance optimization, bug fixes, test improvements and documentation updates.
- Required Product Owner approval for product, UX, schema, authentication, permission, dependency, technology, module-removal, roadmap and architecture changes.

### Protected

- The blocked dependency installation was not retried.
- No protected product or Sprint document was changed.

## 2026-06-29 — Phase 1 Supplement: Sprint Startup Gate

### Added

- Added the permanent Environment Check → Toolchain Check → Version Check → Dependency Check startup sequence to AI workflow and Sprint templates.
- Added D-028 and required recorded evidence before development begins.

### Changed

- Required root-cause diagnosis before any environment retry is considered.
- Updated the environment policy, project memory, project rules, global Sprint template and every Phase Sprint template.

### Protected

- No dependency installation was started.
- No application, product, database, permission or architecture behavior changed.

## 2026-06-29 — Phase 1 Supplement: Runtime Contract

### Added

- Added the permanent Runtime Contract to `.ai/ENVIRONMENT_POLICY.md`.
- Added D-029 for NVM-provided Node.js 24.x, current approved Node.js 24.18.0, pnpm 11.7.0 and the official npm registry.

### Changed

- Initialized NVM in login and non-interactive zsh through an append-only `~/.zprofile` change.
- Unified the NVM Node.js 24 environment and project commands on pnpm 11.7.0.
- Required local, Codex, CI, Git Hooks, Playwright and Vercel to inherit the canonical runtime from their environment.
- Limited Husky/Git Hooks to runtime verification; they may not switch Node.js.

### Protected

- No project dependency installation, migration, authentication, RLS, business code or page development was executed.

## 2026-06-29 — Phase 1 Supplement: Root-Cause Retry Limit

### Changed

- Replaced the one-operation-only interpretation with one Product Owner-approved controlled retry per root cause.
- Required mandatory stop when the controlled retry fails for the same root cause.
- Clarified that a materially different root cause requires evidence and a new Environment Issue report.
- Clarified that tool-internal reconnect attempts belong to one top-level operation and must be reported.

### Protected

- Retry remains prohibited before diagnosis and Product Owner approval.
- No installation, dependency, registry, architecture or business change was executed.

## 2026-06-29 — Milestone v0.1 Release Documentation

### Added

- Added `docs/releases/v0.1.md` as the formal release note for Phase 1 Foundation and Sprint 002A Website Shell.
- Added `docs/ROADMAP.md` as the milestone-level roadmap index for completed, in-progress and future delivery buckets.

### Changed

- Updated `README.md` with the current milestone, current Sprint and GitHub repository status.
- Updated `PROJECT_STATUS.md` and `MEMORY.md` to reflect `v0.1 Released` and the transition into Sprint 002B planning.

### Verification

- `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass for the release-documentation state.

### Not changed

- No business code, runtime contract, database schema, Supabase project, deployment configuration, provider, ORM or SDK was modified.

## 2026-06-29 — Phase 1C: Identity Access Core

### Added

- Added validated `RuntimeConfig`, provider-neutral trusted identity/session and capability types, repository/database adapters and an `ObjectStorage` interface.
- Added Supabase SSR auth adapters for verified email/password without exposing provider `User`/`Session` contracts to business modules.
- Added invitation service orchestration with one-time plaintext secrets and SHA-256 persistence boundaries.
- Added ordered migrations for profiles, Membership, elevated role grants, invitations/redemptions, audit logs, RLS/grants and atomic security-definer workflows.
- Added Web/Admin access shells for sign-in/sign-up, invitation redemption/management and audited membership/role administration.
- Added unit, repository, static migration-contract and transactional SQL role-matrix tests.
- Added ADR-018 and the approved Phase 1C Sprint brief.

### Changed

- Added exact `@supabase/ssr@0.12.0`, reusing approved `zod@4.4.3` and `@supabase/supabase-js@2.108.2`; updated only the approved manifests and lockfile.
- Synchronized database/API contracts, RLS matrix, migration registry, package boundaries, project status and phase documentation.
- Resolved KI-001, KI-006 and KI-011 through D-033/ADR-018.

### Verification

## 2026-06-30 — Codex Git Execution Validation

### Added

- Added a validated Codex Git execution entry to `.ai/TROUBLESHOOTING.md`, documenting `.git` write checks, SSH remote usage and GitHub access verification.

### Changed

- Updated `.ai/WORKFLOW.md` with the explicit Git execution boundary: Git write/push is allowed only after Product Owner confirmation, successful sensitive-file checks and a healthy Git execution chain.
- Updated `.ai/START_HERE.md` to route Git delivery tasks to the troubleshooting guidance and the existing SSH remote setup.

### Verification

- `git status`, `.git` write test, `git ls-remote origin` and `git push origin main` have all been validated successfully in the current Codex execution environment.

### Not changed

- No business code, dependency, database schema, Supabase project, deployment configuration or runtime contract was modified.

- Frozen install, Node/pnpm/registry checks, typecheck, lint, unit/contract tests and all three Next.js production builds pass.
- Transactional SQL tests are prepared but not executed because the current environment provides no Supabase CLI, PostgreSQL client or Docker runtime.

### Not changed

- No cloud resource, registry, package manager, second infrastructure provider, ORM, email SDK, Storage SDK or deployment configuration was added.
- No Phase 2 publishing/content feature was implemented.

## 2026-06-29 — Monorepo Dev Server And Env Troubleshooting

### Added

- Added `.ai/TROUBLESHOOTING.md` to centralize local development troubleshooting for env loading, Turborepo dynamic ports, Supabase CLI, pnpm workspace behavior and Next multi-lockfile warnings.

### Changed

- Updated `START_HERE.md` to route dev-startup, local-port and env-loading issues to `TROUBLESHOOTING.md`.
- Updated `PROJECT_RULES.md` to forbid fixed port assumptions across `apps/web`, `apps/admin` and `apps/docs`.
- Updated `README.md` with the authoritative dev-server rule: always use the terminal `Local:` address instead of assumed ports.
- Recorded the current `.env.local` synchronization expectation for `apps/web` and `apps/admin`, plus the first-response checklist for Runtime Zod env failures.

### Not changed

- No business code, package manifest, lockfile, runtime contract, Supabase configuration or deployment configuration was modified.

## 2026-06-30 — Phase 2 / Sprint 002A Content Domain Foundation

### Added

- Added the `works`, `chapters`, `articles`, `content_categories`, `content_tags`, `work_tags` and `article_tags` migration with foreign keys, indexes, Check Constraints, scoped slug uniqueness and updated-at triggers.
- Added active-Membership published reads, owning-Author mutation, Admin/Super Admin management and private owner-column grants while reusing Phase 1 RBAC.
- Added provider-neutral content domain/Service contracts, typed database rows and a Supabase Repository adapter.
- Added Vitest Migration/Repository/Service coverage and a transactional SQL role matrix.
- Added ADR-019 and the approved Sprint 002A brief.

### Changed

- Updated README, System Architecture, database ERD/schema/migration/RLS/index/lifecycle registries and project memory for the works + chapters + articles model.

### Verification

- Environment, toolchain, version and frozen dependency checks pass without manifest, lockfile or workspace-config changes.
- Workspace lint, typecheck, Vitest and all three Next.js production builds pass.
- Database package tests pass 12/12; Services package tests pass 7/7.
- Transactional SQL is prepared but not executed because the environment has no PostgreSQL client/server or container runtime; no Supabase core configuration was added without approval.
- Full repository `format:check` remains blocked by 123 pre-existing unformatted files; all Sprint-modified files pass scoped formatting.

### Not changed

- No package manifest, lockfile, dependency, ORM, editor, Storage, UI, comment, Kudos, bookmark, notification, recommendation, auth model or Supabase core configuration was changed.

## 2026-06-30 — Phase 2 / Sprint 002B-Step01 Reading Experience Foundation

### Added

- Added work detail, chapter reading and standalone article reading routes under the existing Reader Membership guard.
- Added a replaceable `ReaderContentGateway → Content Service → ContentStore` flow with read-only fixtures while the local database Runtime is unavailable.
- Added safe structured-document rendering, previous/next chapter navigation, chapter directory and Light/Dark, font-size, line-height and reading-width controls.
- Added gateway and structured-renderer Vitest coverage plus the approved Sprint brief.

### Changed

- Updated the Reader list/detail experience, Reader layout rules, Web README, project status and Phase 2 records for Step01.

### Verification

- Frozen/offline dependency verification passed without changing `package.json`, `pnpm-lock.yaml` or workspace configuration.
- Workspace lint, typecheck, Vitest and all three Next.js production builds pass.
- Browser QA confirmed the public shell, theme toggle, zero console errors and unauthenticated redirect to sign-in.
- Authenticated route visual QA remains pending a working approved local identity/database Runtime; no auth bypass was introduced.

### Not changed

- No dependency, package manifest, lockfile, Supabase configuration, database schema, permission model, editor, community feature, recommendation feature or author dashboard was changed.
- Supabase Runtime was not retried and no remote production database was contacted.

## 2026-06-30 — Phase 2 / Sprint 002B-Step02 Reader Preferences + Navigation Persistence

### Added

- Added a versioned `fandom-harbor.reader-preferences.v1` localStorage contract for Light/Dark, font size, line height and reading width.
- Added safe parsing and Storage failure fallbacks with Vitest coverage.
- Added chapter progress, direct directory navigation, explicit first/last chapter states and an accessible current-chapter marker.
- Added a provider-contained `useAppTheme` adapter in the existing shared UI package.

### Changed

- Updated Reader controls, navigation styling, Reader/Web README, design rules and Sprint acceptance records for Step02.

### Verification

- Frozen/offline dependency verification passed without changing manifests, lockfile or workspace configuration.
- Workspace lint, typecheck, 33 Vitest tests and all three Next.js production builds pass.
- Browser regression confirms theme persistence across reload, zero console errors and the unchanged unauthenticated chapter-route guard.

### Not changed

- No database write, Supabase retry, dependency, permission model, reading history, bookmark, favorite, comment, notification, recommendation or author workflow was added.

## 2026-06-30 — Phase 2 / Sprint 002B-Step03 Reading History + Continue Reading

### Added

- Added the versioned `fandom-harbor.reading-history.v1` localStorage contract for work, chapter and article history.
- Added reading timestamps, chapter position/count, derived progress percentage, identity-based updates and a 30-entry retention bound.
- Added client-side history tracking to work detail, chapter reading and article reading pages.
- Added a work-scoped Continue Reading card that validates the saved chapter against the current published chapter list.
- Added Vitest coverage for all entry types, progress, ordering/upsert, localStorage round-trip, corrupt data, blocked Storage and retention bounds.

### Changed

- Updated Reader documentation and project memory for local-only reading history and Continue Reading.

### Verification

- Workspace lint, typecheck, 38 Vitest tests and all three Next.js production builds pass.
- Browser regression confirms the public shell, zero console errors and the unchanged unauthenticated work-route redirect.
- Authenticated Continue Reading visual QA remains pending the approved local identity/database Runtime; no auth bypass was introduced.

### Not changed

- No dependency, manifest, lockfile, database, Supabase Runtime, permission model, bookmark, favorite, comment, notification, recommendation or author workflow was changed.

## 2026-06-30 — Phase 2 / Sprint 002B-Step04 Bookmark + Reader Shelf

### Added

- Added the versioned `fandom-harbor.reader-bookmarks.v1` localStorage contract for chapter and article bookmarks.
- Added add/remove behavior, explicit current-bookmark state, stable bookmark hrefs and a 100-entry retention bound.
- Added bookmark controls and local-shelf entry links to chapter and article reading pages.
- Added a Reader Shelf at `/archive` that aggregates local bookmarks and recent reading without changing the existing Membership guard.
- Added Vitest coverage for chapter/article bookmark behavior, hrefs, persistence, corrupt data, blocked Storage and retention bounds.

### Changed

- Updated Reader documentation and project memory for local-only bookmarks and Reader Shelf behavior.

### Verification

- Workspace lint, typecheck, 43 Vitest tests and all three Next.js production builds pass.
- Browser regression confirms the public shell/Reader entry, zero console errors and the unchanged unauthenticated `/archive` redirect.
- Authenticated Bookmark/Reader Shelf visual QA remains pending the approved local identity/database Runtime; no auth bypass was introduced.

### Not changed

- No dependency, manifest, lockfile, database, Supabase Runtime, permission model, cloud favorite, comment, Kudos, notification, recommendation or author workflow was changed.

## 2026-06-30 — Phase 2 / Sprint 002B-Step05 Reading Experience QA & Accessibility Polish

### Changed

- Added a distinct Reader Shelf hydration state so persisted data does not briefly appear empty.
- Rejected non-canonical work/chapter/article slugs from local Bookmark and Reading History data before rendering links.
- Improved global missing-content recovery with Reader directory and local-shelf actions.
- Improved the global error state with alert semantics, retry and Reader-directory recovery.
- Added named Reader settings semantics, explicit option aria-labels, polite preference status and content-specific Bookmark labels/status.
- Added descriptive accessible names for shelf bookmark and recent-reading links.

### Verification

- Workspace lint, typecheck, 43 Vitest tests and all three Next.js production builds pass.
- Browser QA confirms 404 recovery links, Light/Dark click and reload persistence, the unchanged `/archive` login guard and zero console errors.
- The theme button receives keyboard focus, but in-app browser Enter/Space injection did not emit the native click; protected-page manual keyboard QA remains pending the approved local identity Runtime.

### Not changed

- No business feature, dependency, manifest, lockfile, database, Supabase Runtime, permission model, comment, Kudos, notification, recommendation or author workflow was added.

## 2026-06-30 — Phase 2 / Sprint 002C-Step01 Author Studio Foundation

### Added

- Added `/studio`, `/studio/works` and `/studio/articles` under a shared Author-only Sidebar/Header/Content layout.
- Added works and articles lists with draft/published status, update metadata and disabled create/edit placeholders.
- Added `StudioContentStore` and `createStudioContentService`, reusing trusted identity injection, pagination and existing `work:author` authorization.
- Added a Web `StudioContentGateway` with author fixtures and Service/Gateway tests.
- Added the approved Sprint brief and Author Studio route/data documentation.

### Changed

- Redirected the legacy `/author` landing route to `/studio`; `/author/invitations` remains available.
- Added draft Work/Article fixtures while explicitly filtering Reader fixture reads to published content.
- Added a draft Chapter fixture and completed the Reader published-only boundary by filtering chapter lists on both work ownership and published status.
- Updated root/Web README and Phase/project status for Sprint 002C.

### Verification

- Frozen/offline dependency verification passes without manifest or lockfile changes.
- Services lint/typecheck and 9 tests pass; Web lint/typecheck and 20 tests pass.
- Full workspace lint/typecheck, 48 Vitest tests and all three Next.js production builds pass; Web production build passes again after the draft Chapter isolation fix.
- Browser QA confirms `/studio`, `/studio/works` and legacy `/author` redirect unauthenticated visitors to `/auth/sign-in` with zero console errors.
- Authenticated Studio visual QA remains dependent on the approved local identity/database Runtime; no authentication bypass or Supabase retry was introduced.

### Acceptance

- Product Owner accepted Sprint 002C-Step01 on 2026-06-30.
- Step02 was outside Step01 acceptance scope and is tracked in its own later changelog entry.

### Not changed

- No dependency, manifest, lockfile, database Schema, RLS, permission system, Supabase Runtime, editor, chapter editing, cover upload, statistics, comments or publishing action was added.

## 2026-06-30 — Phase 2 / Sprint 002C-Step02 Studio Work Detail Read-Only Foundation

### Added

- Added owner-scoped `/studio/works/[workId]` with work metadata, chapter count and ordered chapter summaries.
- Added a Works-list detail entry and disabled placeholders for new chapter, edit, publish and archive actions.
- Added `StudioWorkDetail` and owner-injected `getWork` across the existing Service/Store/Gateway boundary.
- Added Service and Web tests for trusted owner injection, draft Work/Chapter visibility, unknown IDs and other-author isolation.

### Verification

- Workspace lint and typecheck pass.
- 52 Vitest tests pass: Services 10 and Web 23.
- Web production build passes with the dynamic Studio Work Detail route.

### Acceptance

- Product Owner accepted Sprint 002C-Step02 on 2026-06-30.
- `/studio/works/[workId]` read-only Work Detail passed engineering acceptance and is reachable from `/studio/works`.
- Owner ID is injected only from trusted identity context; the URL carries only `workId`.
- Other-author works and unknown work IDs return Not Found.
- Reader remains published-only, while current-author draft/published Work and Chapter visibility stays Studio-scoped.
- New chapter, edit, publish and archive entrypoints remain disabled and do not write.

### Not changed

- No dependency, manifest, lockfile, Supabase Runtime, Migration, RLS, Database Contract, editor or write action changed.
- Sprint 002A DB Runtime remains pending; Step03 was not part of Step02 scope and is tracked in its own later changelog entry after separate authorization.

## 2026-06-30 — Phase 2 / Sprint 002C-Step03 Studio Article Detail Read-Only Foundation

### Added

- Added owner-scoped `/studio/articles/[articleId]` with article metadata, summary, status, category/association display and tag empty state.
- Added an Articles-list detail entry and disabled placeholders for new article, edit, publish and archive actions.
- Added `StudioArticleDetail` and owner-injected `getArticle` across the existing Service/Store/Gateway boundary.
- Added Service and Web tests for trusted owner injection, draft Article visibility, unknown article IDs, other-author isolation and Reader draft-article filtering.

### Verification

- Workspace lint and typecheck pass.
- 55 Vitest tests pass: Services 10 and Web 26.
- Web production build passes with the dynamic Studio Article Detail route.

### Acceptance

- Product Owner accepted Sprint 002C-Step03 on 2026-07-01.
- `/studio/articles/[articleId]` passed read-only route and owner-boundary acceptance.
- Owner ID comes only from `TrustedAccessContext.identity.id`; other-author and unknown article IDs return Not Found.
- Reader remains published-only and all article write entrypoints remain disabled.
- Workspace lint, typecheck, 55/55 Vitest tests and Web production build all pass.

### Not changed

- No dependency, manifest, lockfile, Supabase Runtime, Migration, RLS, Database Contract, editor or write action changed.
- Supabase was not executed; Sprint 002A DB Runtime remains pending and Step04 remains unauthorized.

## 2026-07-01 — Phase 2 / Sprint 002C-Step04 Studio Empty / Error / Boundary States

### Added

- Added explicit Works/Articles empty states with disabled create placeholders and a return-to-Studio path.
- Added Studio-specific Work/Article Not Found states with safe copy and return paths to Studio and the matching list.
- Added distinct no-chapter and all-draft-chapter Work states without exposing internal identifiers or database fields.
- Added a draft-only Work fixture and a shared disabled Studio action contract for read-only verification.

### Verification

- Workspace lint and typecheck pass with zero cached tasks.
- 58/58 Vitest tests pass, including Web 29/29.
- Web production build passes with Studio list and dynamic detail routes present.
- Tests cover empty owner lists, unknown/other-owner content isolation, draft Work/Article/Chapter Reader isolation and disabled Studio actions.

### Not changed

- No dependency, manifest, lockfile, Supabase Runtime, Migration, RLS, Database Contract, editor or write action changed.
- Supabase was not executed; Sprint 002A DB Runtime remains pending.

### Acceptance

- Product Owner accepted Sprint 002C-Step04 on 2026-07-01.
- Empty lists, safe owner-scoped Not Found states, no-chapter/all-draft boundaries, recovery navigation, disabled actions and Reader published-only isolation passed review.
- Forced lint, typecheck, 58/58 Vitest tests and Web production build all passed.

## 2026-07-01 — Phase 2 / Sprint 002C-Step05 Freeze & Handoff

### Frozen

- Marked Sprint 002C-Step01 through Step04 Accepted and Step05 Freeze & Handoff complete.
- Frozen the read-only Studio home, Works/Articles lists, Work/Article details, empty/Not Found states, navigation, Reader published-only and Trusted Identity contracts.
- Recorded Create/Edit Work, Create/Edit Article, Draft Save, Publish, Archive, Delete, Supabase Runtime, Owner Repository and Rich Text Editor as explicitly unimplemented and separately gated.
- Recorded Sprint 002D candidates: Draft Creation / Editing UI Shell or Database Runtime Recovery; neither direction is authorized.

### Verification

- Workspace lint, typecheck and 58/58 Vitest tests pass.
- Web production build passes.
- No product code, page, component, test, dependency, package manifest, lockfile, Supabase, Migration, RLS or Database Contract changed in Step05.

### Final status

- Sprint 002C Freeze & Handoff is complete and the Sprint can be formally closed.
- Sprint 002A DB Runtime Pending remains unchanged; Supabase was not executed.

## 2026-07-01 — Phase 2 / Sprint 002D Author Creation Experience UI Shell Planning

### Planned

- Added the approved Sprint 002D development handbook covering Create Work, Create Article, owner-scoped Edit, Form Experience, Draft Workflow and Freeze/Handoff Steps.
- Fixed the Sprint boundary to input-capable UI shells, client validation, fixture-prefill and disabled actions only.
- Preserved the Phase 2 Architecture Review blockers for real writes: owner-only Repository, DB Runtime, content schema validation, Revision, state machine and transactional publishing.
- Selected the UI Shell direction for Sprint 002D while leaving Database Runtime Recovery separately gated.

### Authorization boundary

- This approval covers planning and handbook documentation only.
- Step01 implementation still requires explicit Product Owner authorization.
- No code, route, component, test, dependency, package manifest, lockfile, Supabase, Migration, RLS, Database Contract or Repository changed.

## 2026-07-01 — Phase 2 / Sprint 002D-Step01 Create Work UI Shell

### Added

- Added `/studio/works/new` with the existing Author guards, Studio breadcrumb and explicit return navigation.
- Added an input-capable client form for title, description, fixture category/tags, cover placeholder and local clearing.
- Added client-only required, length and illegal-control-character validation with character counts and accessible error messaging.
- Added a shared Studio Form Action Bar whose save-draft and publish actions are disabled and have no write callbacks.
- Added a route loading skeleton and enabled the Works list/empty-state links to the UI Shell.

### Tests

- Added validation coverage for required title, title/description limits, illegal characters and valid local form state.
- Extended the disabled Studio action contract for Create Work save/publish actions.
- Web scoped tests pass 35/35; full workspace lint, typecheck and 64/64 Vitest pass with zero cached tasks.
- Web production build passes with `/studio/works/new` in the production route table.

### Not changed

- No Service write, Repository, Supabase query, Mutation, POST, RPC, SQL, fake save result, editor, Revision or status transition was added.
- package.json, pnpm-lock.yaml, Supabase Runtime, Migration, RLS and Database Contract remain unchanged.
- Reader remains published-only; Sprint 002A DB Runtime remains pending and Step02 is unauthorized.

## 2026-07-01 — Phase 2 / Sprint 002D-Step02 Create Work Draft Persistence

### Added

- Added an idempotent production Migration with five approved V1 Categories and ten stable-UUID `additional/canonical` Tags.
- Added the authenticated `create_author_work_draft` PostgreSQL RPC, which atomically creates a Work and `work_tags`.
- Fixed draft ownership and lifecycle inside PostgreSQL: owner is `auth.uid()`, status is `draft`, and `published_at` is null.
- Added Zod-validating Repository and `createWorkDraftService` boundaries plus an Author-only Web Server Action.
- Replaced Create Work metadata fixtures with database-backed Category/Tag reads.
- Enabled Save Draft with pending, accessible failure and honest success states while keeping Publish disabled.

### Tests

- Added static Migration checks for taxonomy idempotence, stable tag mapping and RPC privilege/lifecycle contracts.
- Added Service/Repository tests for Author authorization, Zod validation and draft-only output.
- Added Server Action tests for unauthenticated, non-Author, Author-success and persistence-failure paths.
- Extended SQL tests for RPC authorization, invalid Category, deprecated Tag and no-partial-Work rollback behavior.
- Workspace lint, typecheck and 74/74 Vitest tests pass.
- Web production build passes with `/studio/works/new` in the production route table.

### Boundaries

- No Publish, Edit, Archive, Delete, editor, cover upload or adult-content behavior was added.
- Existing RLS, table structures, tag-type union, package manifests and lockfile remain unchanged.
- Database Runtime remains pending; Migration and SQL tests have not yet run against PostgreSQL.
- A read-only `supabase status` check could not connect to the local Docker daemon; no Runtime start, image pull, remote connection or retry was attempted.

### Runtime validation and acceptance

- Product Owner confirmed the local Supabase Runtime had recovered and authorized controlled validation.
- `supabase db reset --local --no-seed` rebuilt the database and applied all six ordered Migrations.
- Runtime testing exposed that `INSERT ... RETURNING *` and explicit `id` insertion exceeded the authenticated column grants.
- Narrowed the RPC to let PostgreSQL generate `works.id` and return only application-visible columns; no grant, RLS or table structure was widened.
- `phase_2_content_domain.sql` then passed in local PostgreSQL, including Author success, anon/Reader denial, invalid Category rollback, deprecated Tag rollback and atomic Work/Tag creation.
- Reapplying the V1 taxonomy Migration inserted zero rows; the database retained exactly five Categories and ten canonical additional Tags.
- Sprint 002D-Step02 is Accepted and the Phase 2 content-domain database Runtime Pending state is closed.

## 2026-07-01 — Phase 2 / Sprint 002E-Step01 Minimal Draft Editor

### Added

- Added `/studio/works/[workId]/edit` as an owner-only draft editing shell.
- Added `DraftWorkEditorStore`, `createDraftWorkEditorService`, a Zod-validating Repository and Studio Gateway.
- Reused existing `chapters.content` and `content_schema_version`; the first Chapter by position supplies the current V1 body.
- Added Work metadata, current Chapter context and a plain textarea that edits only browser memory.
- Redirected successful Create Work Draft actions directly to the new editor route.

### Security and boundaries

- Service requires `work:author`; the Supabase query requires `status = draft`; existing RLS enforces owner through the authenticated session.
- URL accepts only a UUID `workId`; invalid, unknown, published and non-owner resources resolve to Not Found.
- Save and Publish remain disabled. No Server Action, write Repository, RPC, Migration, RLS, Schema, package or lockfile change was added.

### Tests

- Added Service allow/deny tests, Repository mapping/Not Found/input validation tests and structured-document plain-text projection tests.
- Existing Reader published-only and Create Draft contracts remain covered.
- Workspace lint, typecheck and 81/81 Vitest tests pass.
- Web production build passes with `/studio/works/[workId]/edit` in the route table.

## 2026-07-01 — Autonomous Sprint Documentation Authorization

### Governance

- Recorded the Product Owner's standing authorization, effective from Sprint 002E, for automatic factual documentation updates after Sprint/Step completion.
- Allowed records include verified status, acceptance, commands/results, Runtime state, modified files, boundaries, risks, Level 3 blockers and next-step recommendations.
- Preserved all Level 3 gates for database, auth/permission, Publish, dependencies, package/lockfiles, uploads/storage, deletion, production deployment, large refactors and technology changes.
- Required every final report to disclose automatically updated files, recorded content, Level 3 involvement and whether the next step needs authorization.

## 2026-07-01 — Phase 2 / Sprint 002E-Step02 Draft Body Save

### Added

- Added the minimal Migration `20260701113000_chapters_body_update_grant.sql` to allow authenticated Chapter body updates on `content` and `content_schema_version`.
- Added `saveDraftWorkBody` to the existing Draft Editor Service/Store/Repository boundary.
- Added a Web Server Action and client form shell so `/studio/works/[workId]/edit` can save draft body content with pending, success and error states.
- Added minimal plain-text to `ContentDocument` projection for draft persistence.
- Added first-save Chapter creation when a draft Work has no Chapter yet; later saves update the same first Chapter.

### Security and boundaries

- Kept owner enforcement on trusted identity plus existing `chapters_update_owner_or_admin` RLS; no owner identity is accepted from URL, query or form fields.
- Did not add any RPC, REST endpoint, Publish path, status transition, schema change or RLS policy change.
- Saving body content does not alter `work.status`, does not set `published_at` and does not expose draft content to Reader.

### Tests and runtime

- Added Service, Repository, plain-text projection and Web Server Action coverage for owner success, non-Author denial, Not Found and failure states.
- Extended SQL runtime tests for anon/Reader/non-owner rejection, owner update, first-save Chapter creation, same-Chapter update and no-accidental-publish behavior.
- `supabase db reset --local --no-seed` and the Phase 2 SQL suite pass against local PostgreSQL.
- Workspace lint, typecheck and 86/86 Vitest tests pass.
- Web production build passes with `/studio/works/[workId]/edit` in the route table.

## 2026-07-01 — Phase 2 / Sprint 002F Minimal Publish Workflow

### Added

- Added minimal draft publish support to the existing Studio draft editor form through a single `submitDraftEditor` Server Action with `save | publish` intent.
- Added `publishDraftWork` to the existing Studio draft editor Service/Repository boundary.
- Added Reader hybrid published-content gateway support so newly published database-backed Works become readable immediately while existing published fixture content remains available.
- Added publish redirects from the Studio editor to the public Reader chapter route.

### Security and boundaries

- Reused existing owner capability, `works` update grants, `chapters` update grants and current RLS.
- Added no new Migration, RPC, Schema, RLS policy, dependency or package change for Sprint 002F.
- Publish updates only the Work and the first Chapter; it does not introduce revision history, archive, delete or workflow orchestration.
- Reader remains published-only; draft Works never become readable before Work and Chapter lifecycle fields are set.

### Tests and runtime

- Added Service/Repository coverage for publish allow/deny and publish result mapping.
- Added Web Server Action coverage for publish success, empty-body rejection and honest failure handling.
- Added Reader hybrid gateway coverage for database-first published reads with fixture fallback.
- Extended SQL runtime tests for Reader publish denial, owner publish success, first-Chapter publish path and Reader published-count visibility after publish.
- Workspace lint, typecheck and full Vitest pass.
- Web production build passes with `/studio/works/[workId]/edit`, `/works/[slug]` and `/works/[slug]/chapters/[chapterSlug]` in the route table.
- `supabase db reset --local --no-seed` and the extended Phase 2 SQL suite pass against local PostgreSQL.

## 2026-07-01 — Phase 2 / Sprint 002G Public Reading

### Added

- Moved `/articles/[slug]` onto the same hybrid published-content gateway already used by the public Work and Chapter routes.
- Completed the minimum public-reading closure so published database-backed Works, Chapters and Articles are preferred automatically while published fixture content remains as fallback.
- Added hybrid Reader article tests to verify runtime-first published reads and continued draft isolation.

### Security and boundaries

- Reader remains strictly published-only across Work, Chapter and Article routes.
- Added no Migration, RPC, Schema, RLS, dependency, package or lockfile change for Sprint 002G.
- Draft content stays invisible to Reader even when fixture fallback is active.

### Tests and verification

- Workspace lint, typecheck and full Vitest pass.
- Web production build passes with `/articles/[slug]`, `/works/[slug]` and `/works/[slug]/chapters/[chapterSlug]` in the route table.
- No new database-side validation was required because Sprint 002G changed only the read-path gateway wiring; the latest local Supabase reset and Phase 2 SQL suite remain the passing baseline from Sprint 002F.

## 2026-07-01 — Phase 2 / Sprint 002H Bookshelf / Library

### Added

- Added a Reader Library Hub client shell to `/works` with continue-reading, latest-bookmark and local shelf summary cards.
- Added lightweight client-side filtering over published Works and Articles by content type and text query.
- Added pure Reader Library tests for shelf snapshots and browse filtering.

### Security and boundaries

- Reader remains strictly published-only for Work and Article browse results.
- Local shelf data remains browser-only and does not write to the database.
- Added no Migration, RPC, Schema, RLS, dependency, package or lockfile change for Sprint 002H.

### Tests and verification

- Workspace lint, typecheck and full Vitest pass.
- Web production build passes with `/archive`, `/articles/[slug]`, `/works/[slug]` and `/works/[slug]/chapters/[chapterSlug]` in the route table.
- No new database-side validation was required because Sprint 002H changed only client-side Reader browse/shelf composition on top of existing published-only data paths.

# 2026-07-12 — UX-06D Step01 Archive UI Audit & Design Contract

### Documentation

- Added the Archive Design Contract covering product position、information priority、page regions、work cards、sort、pagination、empty/loading/error、mobile and cross-page boundaries.
- Recorded the current `/archive` implementation、Published-only contract、responsive evidence、preserved strengths and seven P2 findings.
- Defined an executable Step02 scope that does not expand data、filters、search、recommendations、pagination architecture or permissions.

### Validation and boundaries

- Current Archive 1440 / 390、sorting、URL state、out-of-range recovery、zero overflow and browser-error checks passed.
- Product implementation、Database、Supabase、RLS、RPC、Migration、Auth、Permission、Published-only、gateway and dependencies were unchanged.
- Archive Ready for Step02 = YES；Step02 awaits Product Owner acceptance and separate authorization.

# 2026-07-12 — UX-06C Step 05 Reading Release Readiness

### Product Owner Acceptance

- Product Owner approved UX-06C Step05 and the complete UX-06C Reading Track.
- Step01–Step05：PASS；Reading Track：Completed / Release Ready；Ready for Release：YES。
- Homepage Track and Reading Track are both Release Ready.
- Existing QA Fixture Library remains the required Reading regression baseline；no next UX Track or Mission is authorized.

### Validation

- Completed final Reading Release Audit across 1440、1280、768 and 390 viewports using the existing Long Watch Fixture.
- Accessibility、Long-form rendering、scroll/layout stability、Homepage、Archive、Reading、Author、Studio、Search、Reader Permission and Draft Isolation regression passed.
- `pnpm validate`、79 Web tests、Web / Admin / Docs production builds and zero-error browser checks passed.

### Release Decision

- Reading is Ready for Release；P0 = 0 and P1 = 0.
- No product code、Fixture、Database、Supabase、Permission、dependency or business-logic change was required.
- UX-06C Step05 is Product Owner Accepted and the Reading Track is formally closed.

# 2026-07-12 — UX-06C Step 04 Long-form Reading QA Rerun

### Product Owner Acceptance

- Product Owner approved UX-06C Reading Track Step04.
- Long-form Reading、Desktop / Tablet、390 Mobile、Private Literary Reading Space、Regression、QA Infrastructure and Documentation Governance：PASS。
- Step04 is formally closed；UX-06C Step05 Reading Release Readiness awaits separate authorization.

### Validation

- Recreated the existing localhost-only QA Fixture and verified dynamic Reader / Author credentials.
- Completed Long Watch 150-paragraph QA at 1440 × 900、768 × 1024 and 390 × 844 with stable typography and zero horizontal overflow.
- Completed Reading Settings、Chapter Directory、Mobile Navigation and Long Watch → Tide Ledger → Return Log transition QA.
- Completed Homepage、Archive、Reading、Author、Studio、Reader denial、Author access and Draft isolation regression with zero browser errors.

### Boundaries

- No issue requiring a fix was found.
- No Reader UI、Fixture、Schema、Migration、RLS、Permission、dependency or business-logic change was introduced.
- UX-06C Step04 engineering result is PASS and awaits Product Owner final acceptance；Step05 remains unauthorized.

# 2026-07-12 — UX-06C Step 02 Typography, Rhythm and Reading Control Disclosure

### Changed

- Refined route-local Chapter Reading typography、responsive title scale and prose rhythm for long-form comfort.
- Replaced the permanently visible Reading settings toolbar with an accessible `Aa / 阅读设置` disclosure control.
- Kept the existing font size、line height、measure and light / dark controls and persistence contract unchanged.

### Validation

- Desktop、Tablet and Mobile typography/reflow checks pass without horizontal overflow.
- Default-closed、open / adjust / close、preference persistence and theme compatibility checks pass.
- No database、Supabase、Migration、Auth、permission or business-logic change was introduced.
