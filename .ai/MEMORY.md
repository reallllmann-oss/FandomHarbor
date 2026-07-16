# Project Memory

- 2026-07-16：完成 V1 Final Clean RC Baseline and Deployment Review Recheck。保护原始 `codex/v1-production-rc` 工作区并记录内容指纹；15 个 `APPROVED_RC_CHANGE`、3 个 `FROZEN_ADMIN_CHANGE`、`UNKNOWN_OR_UNCLASSIFIED=0`。从 Historical RC / Parent `67f30c13452680738e1626eb33dbdfb4eead1e62` 在仓库外创建 `codex/v1-production-rc-final` 独立 Worktree，只逐文件纳入最终政策、Web `/legal`、注册入口、SEO、PDR-02 证据及获批 Release / `.ai` 文档；Admin、备份 SQL、Manifest、Secret、环境文件和构建产物均为 0。离线 frozen install 未下载依赖、未改 lockfile；`pnpm validate`、Web 81 / 81 tests、显式 Web production build、`/legal` route、SEO、格式、差异、18+、政策和候选敏感信息检查均通过。唯一一次浏览器尝试被客户端在打开本地 URL 前阻止，按规则停止并记录 Manual Verification Handoff；候选四个 Web 文件与既有 PDR-01 UI PASS 版本逐字节一致，HTTP 200、title、description、canonical、mailto、注册入口与无复选框再次通过。PDR-01 / PDR-02 保持 CLOSED，Deployment Review=`PASS`，Product P0 / P1=`0 / 0`，Production Ready=`YES / AWAITING PRODUCT OWNER AUTHORIZATION`；Deployment Authorized=`NO`、Deployment / Production Smoke=`NOT RUN`。Final RC 完整 SHA 仅记录在 Mission Final Output；未推送、创建 tag、合并 main、部署或修改原始工作区。

- 2026-07-16：完成 PDR-02 Supabase Free Plan Manual Backup Evidence。Product Owner 确认 Supabase Plan=Free、Project=`fandom-harbor`、Healthy、Region=`ap-southeast-1` / Singapore、Automatic Backup=`No backups`。Supabase CLI 2.108.0 与 Docker 可用，linked ref 仅以 `szfh…ekti` 核对；CLI help 确认 `--linked`、`--file`、`--data-only`、`--role-only`、`--use-copy` 仍受支持。识别应用自有 Schema=`public,private`；CLI role-only 临时检查为 0 个角色声明 / 0 个密码字段，Migration 也无自建数据库角色，因此 Custom Role Backup=`NOT REQUIRED`，临时文件已删除。仓库外私有目录中 Schema dump（93346 bytes，SHA-256 `252e605784de4d75f72c7f8afbe4cf2b9d5128ba1319856591a2999e727ac3e5`）与 Data-only + COPY dump（204387 bytes，SHA-256 `4317c21e8e63aedcc1f824d3b5da6df777026850873549d685474ce47593bbc3`）均退出码 0；目录 `0700`、SQL/Manifest `0600`，15/15 应用表定义与 COPY 段存在。Auth / Storage 管理数据及实际 Storage 文件不在范围，恢复未运行。未输出 Secret、业务数据或完整路径，未修改远程数据库、部署或处理冻结 Admin。PDR-02=`CLOSED FOR DEPLOYMENT`；PDR-01 保持关闭。重新 Review 后唯一剩余条件是建立包含最终政策、`/legal` 和备份证据、排除冻结 Admin 的新干净获批 RC SHA，因此 Production Ready 保持 READY WITH CONDITIONS，Production Deployment Authorized 保持 NO。

- 2026-07-16：完成 V1 PDR-01 Public Policy Finalization。Product Owner Policy Review=`PASS WITH FINALIZATION CONDITIONS`，Policy Copy=`APPROVED FOR FINALIZATION`。只读确认 Supabase linked project `fandom-harbor` 为 `ACTIVE_HEALTHY`、Project Region=`ap-southeast-1`（新加坡）；未读取或输出密码、连接串、Key、Token 或 Secret。Vercel 官方 CLI 确认 Project=`fandom-harbor-web`、Root=`apps/web`、Framework=Next.js、Node=24.x；未可靠确认精确运行地区，因此最终文案保留概括表述。创建最终 `docs/19_Release/V1-PUBLIC-POLICY.md`、Web `/legal` 页面及注册页最小政策入口；最终公开文案不含 Draft / Internal Notes / PDR 状态，保持刘祯莹、中华人民共和国、18+、仅限邀请、仅文本、成熟文学题材与严格禁止边界、数据保留、用户权利、普通侵权投诉、责任边界和中华人民共和国法律。`/legal` 本地 1280px / 390px、Light / Dark、无横向溢出、页面元信息、mailto 与公开正文检查通过；实际 Production URL 留待部署后 Smoke。PDR-01=`CLOSED FOR DEPLOYMENT`；PDR-02=`BLOCKED`；Production Ready=`READY WITH CONDITIONS`；Production Deployment Authorized=`NO`；Product P0 / P1=`0 / 0`。未部署、点击 Deploy / Redeploy / Promote、绑定域名、修改 Vercel / 数据库 / Auth / RLS / RPC / Migration、处理备份、账号 / 权限 / break-glass、冻结 `/access` Admin 或创建 tag。

- 2026-07-16：完成 V1 Production Deployment Review，结论 `BLOCKED`。Production Preparation 保持 COMPLETE，PRC-01 至 PRC-06 状态不变；Production Ready 保持 READY WITH CONDITIONS，Production Deployment Authorized 保持 NO。只读确认 RC branch=`codex/v1-production-rc`、SHA=`67f30c13452680738e1626eb33dbdfb4eead1e62`，但当前工作区混有后续 Release 文档和冻结 `/access` Admin 改动，不能作为部署源。仓库没有最终 Privacy / Terms / Content Policy 文案或 Web 法律页面，PDR-01 BLOCKED。Supabase project `fandom-harbor` ACTIVE_HEALTHY，但套餐名称未确认、physical backups 返回 null、PITR=false，且没有手动数据库导出证据，PDR-02 BLOCKED。Vercel Project=`fandom-harbor-web`、Root=`apps/web`、Next.js、Node 24.x 与三个 Production 环境变量名已只读确认；变量值保持 Encrypted，Custom Domain=0，Production deployment=0，因此上一稳定 Production Deployment ID=`FIRST_PRODUCTION_DEPLOYMENT_PENDING`。Production Smoke 21 项、Rollback Smoke 10 项完整但 NOT RUN。`Can authorize Production Deployment Mission = NO`。仅更新 Markdown，未部署、点击 Deploy / Redeploy / Promote、绑定域名、修改 Vercel / 数据库 / Auth / RLS / RPC / Migration、执行 Smoke、账号 / 权限 / break-glass 或创建 tag。

- 2026-07-16：完成 V1 Production Preparation PRC-06 Governance and Emergency Path Closeout。Governance Owner、Super Admin Owner、Emergency Contact、Audit Reviewer 均为 Product Owner；Technical Operator 为 Codex / 技术执行者但必须由 Product Owner 明确授权。至少保留一个 active Super Admin；禁止删除最后一个 Super Admin、共享密码、把密码发给 Codex / 聊天窗口，所有权限变更必须走受控路径并保留 audit。Admin Preview 不可用时，允许在受控工作站运行与 Production RC 同 SHA 的干净 Admin build，但所有应急操作仍须走 `/access`、`admin:operate`、RPC、audit，且每次 break-glass 前必须获 Product Owner 明确批准；禁止 Supabase Dashboard / 直接 SQL 临时改角色、绕过 audit、共享密码 / Cookie / Token / Session 或 Codex 自行执行权限操作。PRC-06 = CLOSED FOR PREPARATION；PRC-01 CLOSED，PRC-02 至 PRC-06 CLOSED FOR PREPARATION，因此 `Production Preparation = PREPARATION COMPLETE / DEPLOYMENT REVIEW ELIGIBLE`。Production Ready 保持 READY WITH CONDITIONS，Production Deployment Authorized 保持 NO。评审前仍须核对 PRC-04 最终公开文案、PRC-03 套餐 / 备份执行项、上一稳定 Production Deployment ID 与 Production Smoke 尚未执行。仅更新 Markdown，未执行 Admin build、break-glass、权限 / 账号操作、部署、Smoke，未修改代码 / Vercel / 数据库 / Auth / RLS / RPC / Migration / `/access` Admin 或创建 tag。

- 2026-07-15：完成 V1 Production Preparation PRC-05 Rollback and Production Smoke Closeout。Product Owner 批准 Rollback Approver / Backup Operator=Product Owner，Rollback Operator=Codex / 技术执行者但必须由 PO 明确授权；默认 Vercel 回滚到上一稳定 Production Deployment，实际 Deployment ID 须在 rollout 前记录；数据库默认不回滚，未经单独授权不执行数据库恢复、数据删除、角色修改或直接 SQL；内容优先 unpublish / archive / 暂停访问。固定 12 项 P0 回滚评估条件、P1 暂停邀请 / 新增发布与 60 分钟决策规则、21 项 Production Smoke 和 10 项 Rollback Smoke。PRC-05 = CLOSED FOR PREPARATION；本 Mission 未部署、回滚或执行 Smoke。PRC-01 保持 CLOSED，PRC-02 / PRC-03 / PRC-04 保持 CLOSED FOR PREPARATION，PRC-06 保持 BLOCKED；PRC-04 最终公开文案仍须 Production 前补齐；Production Ready 保持 READY WITH CONDITIONS，Production Deployment Authorized 保持 NO。仅更新 Markdown，未点击 Deploy / Redeploy / Promote、绑定域名、修改 Vercel / 数据库 / Auth / RLS / RPC / Migration、创建账号、发送邀请码、修改角色、处理 `/access` Admin 或创建 tag。

- 2026-07-15：完成 V1 Production Preparation PRC-04 Age Boundary Correction。Product Owner 将当前有效年龄边界固定为 18+、仅限受邀用户；任何早期 16+ 决定或表述均被覆盖并作废，不再作为当前 Preparation / Production 政策。V1 为 invite-only、仅文本；禁止违法、侵权、骚扰、仇恨、威胁、暴力煽动、未成年人色情或性剥削、真实隐私泄露、诈骗、垃圾信息、恶意链接或破坏平台安全的内容。记录注册 / 认证、邀请码、角色 / Membership、作品章节、阅读偏好 / 书签 / 阅读记录、访问 / 错误 / 安全审计日志；第三方为 Supabase / Vercel；导出 / 删除请求目标 30 天；先暂停访问 / unpublish / archive 再走受控流程，禁止直接 SQL 临时删除；下架责任人为 Product Owner，联系邮箱为 `fandomharbor@163.com`。PRC-04 = CLOSED FOR PREPARATION；Production 前仍须补齐最终公开文案。PRC-01 保持 CLOSED，PRC-02 / PRC-03 保持 CLOSED FOR PREPARATION，PRC-05 / PRC-06 保持 BLOCKED；Production Ready 保持 READY WITH CONDITIONS，Production Deployment Authorized 保持 NO。仅更新 Markdown，未生成法律页面、部署、修改代码 / 数据库 / Auth / RLS / RPC / Migration / Vercel、创建账号、发送邀请码、修改角色、处理 `/access` Admin 或创建 tag。

- 2026-07-15：完成 V1 Production Preparation PRC-02 / PRC-03 Closeout。Product Owner 手动确认 Vercel Web Project=`fandom-harbor-web`、Root Directory=`apps/web`、Framework=Next.js、Production Branch=`main`、Production Domain=`fandom-harbor-web.vercel.app`、Custom Domain=无、HTTPS=Vercel 默认 HTTPS，并确认 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`、`NEXT_PUBLIC_SITE_URL` 三个变量名均已配置到 Production 作用域；未读取或输出值。Product Owner 批准 7 天 invite-only observation window、Reader 25 / Author 5、99.0% best-effort、RPO 24h、RTO 8h、30 分钟事故确认、60 分钟暂停 / 回滚决定、Release Commander / Emergency Contact=Product Owner、Technical Operator=Codex / 技术执行者但须 PO 授权、Vercel + Supabase Dashboard + PO 人工反馈监控，以及上线前确认 Supabase 套餐 / 备份能力、Free 套餐至少手动导出一次的备份策略。PRC-02 / PRC-03 = CLOSED FOR PREPARATION；PRC-01 保持 CLOSED，PRC-04 / PRC-05 / PRC-06 保持 BLOCKED；Production Ready 保持 READY WITH CONDITIONS，Production Deployment Authorized 保持 NO。仅更新 Markdown，未部署、点击 Deploy / Redeploy / Promote、绑定 Custom Domain、修改 Vercel / 数据库 / Auth / RLS / RPC / Migration、创建账号、发送邀请码、修改角色、处理 `/access` Admin 或创建 tag。

- 2026-07-15：完成 V1 Production Preparation PRC-01 RC Baseline Closeout。从稳定 baseline `903bf70a6dc370090362098d26bedd6bf68af529` 创建 `codex/v1-production-rc`，RC commit message 为 `chore(release): prepare V1 production candidate`。提交只包含已验收 Reading Typography / Layout 修复与获批 Release / Production Readiness / Production Preparation 文档；`apps/admin/src/app/access/actions.ts`、`page.tsx` 与 `actions.test.ts` 三个冻结 `/access` Admin 文件明确未暂存、未进入 RC。完整 `pnpm validate`、Prettier、diff check、Secret 特征扫描和 git status 在独立干净 detached worktree 验证；精确 SHA 记录在 Mission Final Output。PRC-01 = CLOSED；PRC-02 至 PRC-06 仍 BLOCKED；Production Deployment Authorized 保持 NO。未 push、部署、绑定域名、创建 tag、修改 Vercel / 数据库 / Auth / RLS / RPC / Migration、创建账号、发送邀请码或修改角色。

- 2026-07-15：执行 V1 Production Preparation。只读确认 `main == origin/main == 903bf70`，但工作区混有已验收 Reading CSS、冻结 `/access` Admin 修复 / tests 与 Release / 状态文档，不能作为 RC 或部署源。实时核对 `fandom-harbor-web` 的 Root Directory=`apps/web`、Framework=Next.js、Node=24.x；Production 作用域 Environment Variables 为 0、团队正式域名为 0，正式 URL / HTTPS 未建立。linked Supabase `fandom-harbor` 为 ACTIVE_HEALTHY，Local / Remote Migration 14 / 14。建立 `V1-PRODUCTION-PREPARATION.md`，记录干净 RC 策略、Production 配置清单、建议的 invite-only 运维包、RPO 24h / RTO 8h、备份恢复演练、监控 / 值班、18+ 与最低法律 / 数据政策、回滚 / Smoke 和 Super Admin 应急路径。由于预算 / 套餐 / 责任人 / 政策 / 备份演练 / 域名 / RC SHA 均未获 Product Owner 逐项批准，PRC-01 至 PRC-06 全部 `BLOCKED`；Production Preparation 未完成，不能进入 Deployment 授权评审。Production Ready 保持 READY WITH CONDITIONS，Production Deployment Authorized 保持 NO。仅更新文档，未部署、绑定域名、创建账号、发送邀请码、修改角色、数据库、Auth、RLS、RPC、Migration、Vercel 或 Admin 实现。

- 2026-07-15：完成 V1 Production Readiness Review。产品主链路、Reader-only、Reading Typography、Author001 Publish E2E、3 Reader 外部测试、外部 Author 测试与 External Beta Closeout 全部 PASS，Product P0 / P1 = 0 / 0。结论为 `Production Readiness Review = PASS`、`Production Ready = READY WITH CONDITIONS`、`Production Deployment Authorized = NO`。Production 前须关闭干净候选基线、Production 项目 / 环境 / 域名、RPO / RTO、备份恢复、监控值班、法律 / 数据政策、回滚、最低治理连续性与部署后 Smoke。`/access` 继续冻结，Admin Preview 独立跟踪。仅更新文档，未部署或执行 Production 操作。

- 2026-07-15：完成 V1 External Beta Evidence Reconciliation + Beta Closeout。Product Owner 已确认 3 名 Reader 小范围外部测试 PASS、外部 Author 测试 PASS；此前 `GO — NOT OPENED` 改为历史评审节点。Reader-only Controlled Test、Reading Typography Alignment Fix、Author001 Publish E2E、3 Reader 外部测试和外部 Author 测试全部 PASS，Product P0 / P1 = 0 / 0。Guest 点击作品详情或章节进入登录页属于 active Membership 产品规则。`/access` Admin 既有改动继续冻结到 Admin 阶段，不阻塞 Closeout。`V1 External Beta Closeout = PASS`；项目可进入 V1 Release Candidate / Production Readiness Review，但未授权 Production、部署、账号、邀请码或角色操作。

- 2026-07-15：完成 V1 External Beta Go / No-Go Review，结论为 `GO — NOT OPENED`。Phase 1 Reader-only 与 Phase 2 Author-controlled 均 PASS，Product P0 / P1 = 0 / 0；Reader / Guest 访问、Author 发布、Draft isolation、Studio denial、邀请码治理、已知限制、停止 / 回退和反馈模板均满足小范围外部 Beta 最低条件。Guest 可发现作品但点击详情或章节后进入登录页，属于当前 active Membership 规则。推荐 1 外部 Author、5 Reader、7 天，仅限 Web Preview。`/access` Admin 既有代码改动冻结到 Admin 阶段；真实外部 Author 授权仍需另行批准并使用受控 `/access` + audit。未开放 Beta、创建账号、发送邀请码、授权角色、部署或进入 Production。

- 2026-07-15：完成 V1 Phase 2 Author-controlled Test / Author001 Publish E2E。Author001 使用注册名登录并通过三条 Studio 路由，创建最小测试作品、保存章节草稿并成功发布；Work Detail、Published Reading、Reader 回读均 PASS。Guest 与 Reader 均看不到未发布草稿；Reader 三条 Studio 路由返回 Archive，Guest `/studio` 进入登录页。Guest 可搜索到已发布作品，但点击详情或章节后进入登录页，符合当前 active Membership 产品规则。390px、Light / Dark 无明显横向溢出或破版，Console 产品级错误为 0，Product P0 / P1 = 0 / 0，`pnpm validate` PASS。Author Release evidence gate 已关闭；只允许进入外部 Beta 的 Product Owner Go / No-Go 评审，未自动开放外部 Author、完整 Beta、Production、Deployment 或 Admin 测试。

- 2026-07-15：完成 V1 Reader-only Controlled Test Closeout + Reading Typography Alignment Fix。Product Owner 已完成第一阶段 Reader-only 测试并提交收口记录；唯一问题归类为 Reading Page UI / Typography / Content Layout P2，Product P0 / P1 = 0 / 0。以最小 CSS 为 `.reader-canvas` 补充水平居中和完整宽度，为 `.reader-prose` 使用 `max-width: min(100%, var(--reader-measure))`，正文段落启用 `text-align: justify` / `text-justify: auto`。既有字号、行距、主题、阅读偏好、正文数据、Published-only、Membership、Auth、Role、RLS、Migration 与发布逻辑均未改变。Reader-only Controlled Test Closeout = PASS；Reading Typography Alignment Fix = PASS。下一阶段 Author-controlled 测试只可等待 Product Owner 单独授权，本 Mission 未部署或进入 Production。

- 2026-07-15：完成 `V1-PHASE1-BETA-TESTING-GUIDE.md`，为 CONDITIONAL GO 下的首批 3 Reader / 0 外部 Author 提供可直接执行的中文测试引导。只读核对当前注册页字段为注册名、密码和邀请码，无邮箱字段，密码至少 8 位；当前注册实现要求邮箱确认关闭，Email Confirm 不属于 Phase 1 测试重点。指南覆盖 Guest / Reader 身份说明、邀请码保密、注册 / 登录 / 退出 / 重登、Homepage / Archive / Search / Work Detail / Author Profile / Published Reading、三条 Studio denial、Draft isolation、移动端与 Light / Dark、P0–P3、反馈模板、PASS 标准、PO 邀请前清单及可直接发送给测试者的中文说明。仅更新文档；未发送邀请码、创建账号、授权 Author、修改产品代码 / 数据库 / Auth / RLS / Migration / Vercel，未部署或进入 Beta 发布。

- 2026-07-15：完成 V1 Controlled Beta Invite Readiness Gate。Reader 邀请注册、默认 active Reader 与授权前三条 Studio denial 均 PASS。Author001（masked `2cbd52b1…351d`）的 active Membership、唯一 active `author` grant、对应 `role.granted` audit、Super Admin operator 与 `admin:operate` 已只读确认；退出并重新登录后 `/studio`、`/studio/works`、`/studio/works/new` 均可打开，Reader → Author Provisioning Block 已解除。Homepage、Archive、Search、Work Detail、Author Profile 当前可打开；Published Reading、Auth、390 × 844、Light / Dark、Console 沿用同一 Preview 既有 PASS，Product P0 / P1 = 0 / 0。Author001 创建入口 PASS，但创建、保存、Draft isolation、发布与 Reader 回读为 NOT RUN。因此 Gate 为 CONDITIONAL GO：首批建议 3 Reader / 0 外部 Author；先由 Product Owner 完成 Author001 内部发布 E2E，再考虑 1 名 Author。仅更新文档；未自动邀请、授权、修改数据库 / Auth / RLS / Migration / Vercel、部署或进入 Beta 发布。

- 2026-07-15：完成 Reader → Author `/access` invalid blocker 代码审计与本地最小修复。确认 `error=invalid` 只来自 RPC 前的 `roleMutationSchema.safeParse`；`userId` / `role` / `reason` 字段、grant / revoke action、`author` enum、`work:author` capability、`grant_role` RPC 名称与参数均对齐。问题集中在严格 UUID 输入未先清理粘贴首尾空白，且所有字段校验失败共用模糊提示。现已在 Role Grant schema 中 trim UUID，并增加 `invalid-user-id` / `invalid-role` / `invalid-reason` 安全提示及 4 个 targeted tests。Admin tests 6 / 6、lint、typecheck PASS。没有修改数据库、Auth、RLS、Migration、Vercel 或执行授权 / 部署。真实 grant、audit 和授权后能力仍 PENDING，E2E Gate 保持 OPEN。

- 2026-07-15：Reader → Author Provisioning E2E 前半段完成、授权失败。Product Owner 已在 Web Preview 注册并登录新 Reader；新 Reader 页首无 Studio，直访 `/studio`、`/studio/works`、`/studio/works/new` 最终均返回 `/archive`。`http://localhost:3000/access` 已登录 Super Admin，完整 Role Grant 表单可用，User ID 非空且角色为 `author`；Product Owner 手动提交后页面为 `/access?error=invalid`，表单输入校验拒绝，未创建 Author grant 或新的 `role.granted` audit。依据 Mission 规则立即停止，没有重试、修改目标 ID或用 SQL、Supabase 控制台、Auth、Migration、RLS 绕过。现有 Preview Author 可用性结论不回退，但新 Reader → Author E2E Governance Block 仍 OPEN，V1 Beta 与完整 Web Smoke 不可收口。

- 2026-07-15：尝试 Reader to Author Provisioning End-to-End Smoke，在前置条件阶段按安全规则停止。当前 Web Preview 标签为未登录 Guest，浏览器没有已登录 Admin / Super Admin `/access` 标签，受控检查 `http://127.0.0.1:3001/access` 返回连接被拒绝；Admin Preview 不在 Mission 范围。因此未注册新 Reader、未输入或读取邀请码 / 密码、未确认 User ID、未执行 Author grant、未产生 `role.granted` audit，也未用 SQL、Supabase 控制台、Auth、Migration 或 RLS 绕过。已有 Preview Author 登录 / Studio 可用性结论不回退，但新 Reader → Author E2E Governance Block 仍 OPEN，V1 Beta 与完整 Web Smoke 不可收口。Product Owner 需先准备已登录的 `/access`、新 Reader 会话和可信 User ID。本轮只更新 Markdown，未修改代码 / 数据库 / Auth / RLS / Vercel、创建 Deployment 或执行 Production 操作。

- 2026-07-15：执行 Preview Author Web Smoke Evidence Completion。Product Owner 已确认历史远程 Author 可在当前 Web Preview 登录并进入 `/studio`；受控浏览器进一步确认已登录 Author Shell、Studio Header 入口、Studio 导航、作品管理、文章管理与邀请码管理入口，Web Shell 未显示 Admin 入口。因此当前 Preview Author Provisioning Block 已解除。导航到 `/studio/works` 后页面最终回到 `/archive`，随后浏览器控制持续超时；按安全规则停止，没有创建、保存或发布作品，没有执行 Reader / Guest 回读、Draft isolation、Author 专项 390 × 844、Light / Dark 或控制台复核。当前没有确认产品 FAIL，Product P0 / P1 为 0 / 0；Author Web Flow 仍 BLOCKED，完整 Web Preview Smoke 不可收口。Preview 标签已保留给 Product Owner 重新登录并人工完成剩余项。本轮仅更新 Markdown，未读取凭据、修改代码 / 数据库 / Auth / RLS / Vercel、创建 Deployment 或执行 Production 操作。

- 2026-07-15：完成 Admin Governance Minimum Check and Beta Author Provisioning Path 文档审计。确认邀请注册只创建 active Membership / Reader，不自动授予 Author；Reader 无 `work:author`，不能进入 Studio。Reader → Author 路径已存在于 Admin `/access`：Admin / Super Admin 可为 active Reader 授予 `author`，Server Action、数据库权限与非空原因会再次校验，并写 `role.granted` audit。历史远程账号 `Auther001` 曾完成手工 Author grant、audit 与 Studio 验收，但当前 Web Preview 尚未复核可用性；`Phase2RemoteInviter` 只确认 Super Admin 登录，Author capability 与 7 个 Web 结果仍为 PENDING。因此 Guest / Reader Smoke 可继续，Author 专项 Smoke 与 V1 Beta 在至少一个 Preview Author 被确认前保持阻塞。Product Owner 应先人工验证历史 Author；如不可用，再另行授权现有 Super Admin 通过受控 `/access` 为指定 Reader 授予 Author。本轮仅更新 Markdown，未登录、创建账号、授予角色、修改数据库 / Auth / RLS / Vercel 或执行 Deployment。

- 2026-07-15：完成 V1 Release Flow Optimization 文档治理，将 Release 拆分为 Web V1 主站、Admin 最小治理、Admin Preview Deployment 解阻、Release 文档与中文教程四条独立主线。Web Preview Smoke 可在 Admin Preview 外部阻塞期间继续；完整 Admin UI 不阻塞 V1 Beta；Admin Preview 继续作为独立外部阻塞跟踪。Admin 权限底座已存在，最小 `/access` UI 已存在，但远程最低治理仍为 CONDITIONAL：V1 Beta 前需独立确认 Super Admin 连续性 / 恢复 runbook、Admin 授权入口、邀请码事故治理与 audit 责任。现有 Super Admin 已登录成功；owner-only bootstrap 只适用于没有未撤销 Super Admin grant 的场景，已有 grant 但账号不可登录时仍需受控修复或另一名 Super Admin。Author 可在 Web 创建 / 撤销自己的邀请码，邀请码只授予 Reader；完整 Admin 全局邀请码 UI 后置。本轮只更新 Markdown，没有修改产品代码、数据库、Migration、Auth、RLS、Role、Supabase、Vercel 配置或环境变量，没有执行 Deployment 或 Production 操作。

- 2026-07-15：完成 Admin Vercel Support Evidence Pack。Product Owner 已在 Dashboard 确认 `fandom-harbor-admin` 的 Production Branch=`main`、Preview Branch Tracking=`All unassigned git branches`、Root Directory=`apps/admin`、Deploy Hooks=0、Custom Environments=0、Preview / Production deployments=0 / 0；未发现 Project / Git / Environment / Domain / Build 设置错配。`codex/admin-preview-baseline` 固定到 Release Baseline 但仍被判定为 `production / Production`，当前记录为 Vercel 平台环境判定异常或隐藏规则未暴露。已新增 `docs/19_Release/V1-ADMIN-VERCEL-SUPPORT-EVIDENCE.md`，包含中文摘要、英文 Support Message、Dashboard 复核、已删除 Deployment 脱敏摘要与暂停声明。在 Vercel Support 解释或 Product Owner 新授权前，不再次触发 Deployment、不进入 Production、不修改配置。

- 2026-07-15：Product Owner 授权 Admin Preview Baseline Branch Deployment。已在 GitHub 创建并保留 `codex/admin-preview-baseline`，远程 SHA 严格等于 Release Baseline `903bf70a6dc370090362098d26bedd6bf68af529`；`main` 未修改。`fandom-harbor-admin` 已关联 GitHub，Root Directory=`apps/admin`，两个必需 Preview 变量存在且未读取值。GitHub Integration 未自动响应仅创建 branch 的事件，受控 Git-source 触发后 Vercel 仍将该非 Production branch 判定为 Production；依据 Mission 立即取消、删除并停止。Admin Preview / Production deployments 最终均为 0，没有 Preview URL，不能开始 `/auth/sign-in` 验收。共享工作区只有既有 Release / `.ai` 文档改动；部署源通过独立干净 worktree 复核。未输出密码、变量值、token 或 secret，未修改数据库、Auth、Role、RLS、RPC、DNS 或 Docs Project。

- 2026-07-15：Product Owner 从本机浏览器提交 Web Preview 人工 Smoke：Guest Homepage / Archive / Search / Reading / Sign-in / Sign-up / Studio denial、Reader 登录 / Archive / Search / Studio denial / `/studio` → `/archive` / Published-only / Draft isolation / logout、Light / Dark、390 × 844、1280、Global Shell 均 PASS，Console P0 / P1 错误为 0 / 0；Super Admin 登录 PASS。Guest Work Detail、Guest Author Profile、Reader Published Work / Chapter 为 BLOCKED 且原因待补充；Author / Super Admin 其余 7 项仍为结果占位，不能推断为 PASS。Online Smoke = PARTIAL / BLOCKED，当前观察到 Product P0 / P1 = 0 / 0，Release Gate P0 / P1 = 0 / 2。Super Admin Account Repair 仅对齐历史 Auth email，Preview Reader 由 Product Owner 受控注册登录；没有向 Codex 提供密码、邀请码、token 或 secret。Admin Preview Project 未创建，Admin 检查属于本轮 Web Preview 范围外 BLOCKED。

- 2026-07-15：Product Owner 在 Vercel Dashboard 为 `fandom-harbor-web` Preview 配置了 `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`；只核对变量名存在，未读取或输出值。基于 GitHub baseline `903bf70a6dc370090362098d26bedd6bf68af529` 完成 Preview deployment `dpl_2H2tUqGo7UXWrfhSC5FsmoeHGpX8`，URL 为 `https://fandom-harbor-ilvpjubrm-fandom-harbor.vercel.app`，状态 `Preview / Ready`。Vercel CLI 55.0.0 在新建空项目首次 deploy 时错误生成 Production，所有临时 Production deployments 已删除，最终只保留 Preview。当前执行网络无法连接 `*.vercel.app:443`，并缺少 Preview Reader / Author 安全测试账号，Online Smoke 未运行。`vercel curl` 自动生成的项目级 Protection Bypass for Automation secret 已由 Product Owner 在 Dashboard 删除或轮换，未读取、复制、记录或分享值；P1-RD-SEC-001 已关闭，后续不得重新生成 bypass secret。Product P0 / P1 = 0 / 0，Release Gate P0 / P1 = 0 / 2；未创建 Admin / Docs Project，未修改 DNS、远程数据库、Supabase、RLS、RPC、Auth、Role 或 Migration。

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
- 2026-07-02: Remote project `szfh…ekti` is linked and has all nine migrations. Registration RPCs return HTTP 200, mailer_autoconfirm is true, a bounded QA invitation is valid, and all app env URLs point to the project. Phase 2 remains Conditional Pass until Product Owner completes real registration/login and, after the required manual Author grant, enters Studio.
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
