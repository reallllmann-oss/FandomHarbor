# Project Status

## 当前阶段

V1 Reader Beta — OWNER DECISION COMPLETE / LEGAL REVIEW NOT COMPLETED / PDR-01 DEPLOYMENT AND SMOKE PENDING / PDR-02 CLOSED FOR CURRENT RELEASE / PRODUCTION DEPLOYMENT NOT AUTHORIZED

## 当前状态

- 2026-07-25：完成 V1 Public Policy Owner Decision Application。DECISION-01–27 全部 `OWNER DECIDED` 并已应用；新增 `V1-PUBLIC-POLICY-V1.0.md` 作为唯一当前正式政策规范来源，Draft 与历史 `V1-PUBLIC-POLICY.md` 保留并标记 superseded。三个政策页面同步 V1.0、运营主体“Fandom Harbor，由刘祯莹个人运营”、批准日期 2026-07-25、正式网站发布生效、访问权限、数据请求 / 保留 / 备份、内容治理、侵权 / DMCA、中华人民共和国法律与争议决定。
- 独立法律审阅仍为 `NOT COMPLETED`；Product Owner 接受有限、邀请制、Reader-only Beta 风险，但不扩展为公开注册、外部 Author Beta 或大规模运营。`PDR-01 = OWNER DECISION COMPLETE / DEPLOYMENT AND SMOKE PENDING`；`PDR-02 = CLOSED FOR CURRENT RELEASE`；Production Deployment Authorized=`NO`；Production Policy Smoke=`NOT RUN`；Final Acceptance=`PENDING`。
- 精确 Policy APP RC 保持 11 个文件，Admin access 3 个文件、Legacy / Draft 政策与备份实物排除。下一项 Mission=`Production Policy Release Candidate Commit and Deployment Preparation`；当前不得直接部署或报告 Release Approved。
- `pnpm validate` 全部通过；本地 Production build 的 Guest、1280px Light、390px Dark、Footer、注册入口、redirect、metadata、sitemap 内容、无横向溢出及 Console 检查通过。Browser XML 直开项为 `MANUAL VERIFICATION REQUIRED`；Secret scan 30 个 changed/untracked 文件、0 个高风险发现；Product P0 / P1=0 / 0。

- 2026-07-25：完成 V1 Production Release Status Reconciliation and Owner Decision Pack，结论 `PASS WITH OWNER DECISION REQUIRED`。新增 `V1-PUBLIC-POLICY-OWNER-DECISION-PACK.md`，将政策唯一来源、主体、邮箱、版本、日期、Guest / Reader / Membership、数据与备份期限、内容治理、侵权 / DMCA、法律 / 争议、法律审阅、部署与最终 Release 授权整理为 DECISION-01–27 可填写清单；推荐仅为工程与产品治理建议，不构成法律意见。
- 新增 `V1-PRODUCTION-RELEASE-CLOSURE.md`，统一当前 Production 事实、17 项 Gate Matrix、29 个工作区文件分类、条件性 Policy APP RC、Admin 排除范围、政策来源冲突、产品 / 政策对照、全部 Blocker、Owner Action 与部署前最小动作。当前权威状态：Production 自定义域名 / Web / Supabase / Reader Smoke / Author loop PASS；Policy 本地实现 PASS WITH OWNER REVIEW，但批准、部署和 Production Policy Smoke 未完成。
- 当前候选规范来源为 `V1-PUBLIC-POLICY-DRAFT.md`；历史 `V1-PUBLIC-POLICY.md` 声称 2026-07-16 已批准，与当前 Draft 冲突，须由 DECISION-01 处理，不删除、不继续默认作为规范源。Guest 发现、详情 / 章节门禁、Reader Studio denial、Author 发布与邀请码要求总体一致；政策需澄清公开作者信息、browser localStorage 与独立 Articles。
- `PDR-01 = OWNER REVIEW REQUIRED`；`PDR-02 = CLOSED FOR CURRENT RELEASE`；Admin Preview 仍为独立外部 BLOCKED，不直接阻挡 Reader-only Beta；Production Deployment Authorized=`NO`，Release Approved=`NO`。下一项推荐 Mission=`Public Policy Owner Decision Application`，不能直接进入 Deployment。

- 2026-07-25：完成 V1 Current Production Fresh Backup and PDR-02 Closure，结论 `PASS`。Product Owner 通过仓库外一次性隐藏输入脚本为 linked `fandom-harbor` Production 创建新鲜 `public,private` Schema 与 Data-only + COPY 逻辑备份；创建时间 22:38:50 +08:00，晚于 Mission 开始时间。Schema / Data 退出码均为 0，大小 93,346 / 232,260 bytes，SHA-256 已写入仓库外 Manifest。
- 新备份目录 / 文件权限 `0700` / `0600`；15 / 15 表定义、COPY 段与 COPY 结束标记完整，表集合一致，Profiles、Memberships、Invitations、Works、Chapters、Articles 均覆盖。文件无明显错误、NUL 或截断，未进入 Git 跟踪、历史或 status；2026-07-16 历史备份保持未修改，状态 `VALID BUT STALE`。
- Product Owner 确认当前 Plan=Free、Database 约 28 MB、MAU=25、平台备份=0、PITR=false、Storage Bucket=0、Storage 对象=0。新逻辑备份不含 Auth 身份、密码散列、Session、MFA、OAuth identity、Storage 元数据或对象。Recovery Runbook 已更新，恢复演练仍为 `NOT RUN`。
- 当前 `PDR-02 = CLOSED FOR CURRENT RELEASE`。`PDR-01 = OWNER REVIEW REQUIRED` 保持不变；PDR-02 关闭不等于整体 Release 收口或 Deployment 授权，Production Deployment Authorized 继续为 `NO`。

- 2026-07-25：完成 V1 Supabase Production Backup Evidence and Recovery Readiness Audit，结论 `PASS WITH OWNER VERIFICATION`。2026-07-16 仓库外 `public,private` Schema / Data SQL 实物已复验：目录 / 文件权限 `0700` / `0600`，93,346 / 204,387 bytes，SHA-256 与原记录一致，15 / 15 表定义、COPY 段和结束标记完整，未被 Git 跟踪或进入历史；备份实物为 `VALID`，但早于当前 Production 状态，用于当前 Release 的新鲜度为 `STALE`。
- 2026-07-25 只读平台 API 确认 linked project=`fandom-harbor`、`ACTIVE_HEALTHY`、region=`ap-southeast-1`、平台备份记录=0、PITR=false。当前套餐未由 CLI 返回且 Dashboard 无法可靠访问，标记 `OWNER MANUAL VERIFICATION REQUIRED`。新鲜导出尝试在临时只读角色连接超时后要求显式数据库密码；遵守 Secret 边界停止，没有生成新备份、修改数据库或执行恢复。
- 已新增 `V1-SUPABASE-RECOVERY-RUNBOOK.md`，覆盖授权、停写、隔离目标、Schema→Data、Auth / RLS / RPC / Functions / Extensions、Storage、验证与失败回退；恢复演练仍为 `NOT RUN`。当前 `PDR-02 = OWNER VERIFICATION REQUIRED / NOT CLOSED FOR CURRENT RELEASE`，须由 Product Owner 核对套餐 / Dashboard 并完成覆盖当前 Production 状态的新鲜仓库外备份后重新评审。`PDR-01 = OWNER REVIEW REQUIRED` 保持不变；Production Release 不可收口，Deployment 仍未授权。

- 2026-07-25：完成 V1 Public Policy Web Pages Implementation。新增公开 `/privacy`、`/terms`、`/content-policy`，Web Footer 与注册页均提供三个直接入口；旧 `/legal` 保留兼容重定向。页面复用现有 ReaderLayout / 主题 / token，无页面级 Session 或角色守卫；本地 1280px / 390px、Light / Dark、Guest 直达 / 刷新、metadata、Footer / 注册链接、无横向溢出和 Console Error=0 均 PASS。Lint、TypeScript、自动化测试、Production Build、diff check 与 Secret 扫描通过。
- 当前唯一主要内容来源 `V1-PUBLIC-POLICY-DRAFT.md` 仍标记 Draft、待 Product Owner 批准、待确认生效状态且法律审阅未完成，并含待最终确认的备份保留期限、数据处理地区与法律条款。因此 `PDR-01 = WEB IMPLEMENTATION PASS WITH OWNER REVIEW / OWNER REVIEW REQUIRED`，不得据此声明 Release Approved。完整清单见 `V1-PUBLIC-POLICY-WEB-ACCEPTANCE.md`。
- PDR-02 状态不因本 Mission 改变；本 Mission 未执行或重新执行数据库备份、数据库 / Auth / RLS / RPC / Migration、权限操作、Production Deployment 或 Production Smoke。

- 2026-07-16：V1 PDR-01 Public Policy Finalization 完成。Product Owner Policy Review=`PASS WITH FINALIZATION CONDITIONS`，最终版本化政策文档 `V1-PUBLIC-POLICY.md`、Web `/legal` 页面和注册页“隐私与使用政策”入口已创建；Supabase Project Region 只读确认并披露为新加坡区域，Vercel 精确处理地区未可靠确认且未虚构。`/legal` 本地构建与访问、1280px / 390px、Light / Dark、无横向溢出、页面元信息和 mailto 均通过。PDR-01=`CLOSED FOR DEPLOYMENT`；实际 Production URL 留待部署后 Smoke。
- 2026-07-16：PDR-02 Supabase Free Plan Manual Backup Evidence 完成。Product Owner 已确认 Plan=Free、Project=`fandom-harbor`、Healthy、Region=`ap-southeast-1` / Singapore、Automatic Backup=`No backups`。使用 Supabase CLI 2.108.0 对已链接项目完成 `public,private` Schema 导出与 Data-only + COPY 导出；两个 SQL 文件均非空、权限 `0600`，私有目录权限 `0700`，大小和 SHA-256 已记录在非敏感证据文档。备份保存在 Product Owner 控制、Git 仓库之外的私有目录；Auth 管理数据、Storage 管理数据和实际 Storage 文件不在保证范围；Remote Database Mutation=`NO`、Restore=`NOT RUN`、Production Deployment=`NOT RUN`。PDR-02=`CLOSED FOR DEPLOYMENT`。
- V1 Production Deployment Review 整体仍为 `BLOCKED`。Production Preparation 保持完成，PRC-01 至 PRC-06 状态不变；PDR-01 / PDR-02 均已关闭。唯一剩余条件是刷新最终干净 RC baseline。
- 历史 RC SHA=`67f30c13452680738e1626eb33dbdfb4eead1e62`，但它早于最终政策、Web `/legal`、注册入口和 PDR-02 证据；当前工作区又含后续 Release 文档和冻结 `/access` Admin 改动，不能作为部署源。任何后续 Deployment 必须先通过独立 Mission 生成排除冻结 Admin 的新获批 SHA，并使用干净 checkout。
- Vercel `fandom-harbor-web`、`apps/web`、Next.js、Node 24.x 和三个 Production 变量名已只读确认；Custom Domain=0。当前 Production deployment=0，上一稳定 Production Deployment ID=`FIRST_PRODUCTION_DEPLOYMENT_PENDING`；Production Smoke=`NOT RUN`。
- `Production Ready = READY WITH CONDITIONS`，`Production Deployment Authorized = NO`，`Can authorize Production Deployment Mission = NO`。本次只执行只读远程逻辑导出和非敏感文档同步；未修改 Vercel / 数据库 / Auth / RLS / RPC / Migration、执行恢复 / Smoke、账号 / 权限 / break-glass、部署或创建 tag。

- 2026-07-16：PRC-06 Governance and Emergency Path Closeout 完成。Governance Owner、Super Admin Owner、Emergency Contact 与 Audit Reviewer 均为 Product Owner；Technical Operator 为 Codex / 技术执行者，但必须由 Product Owner 明确授权。
- 至少保留一个 active Super Admin；禁止删除最后一个 Super Admin、共享密码、向 Codex / 聊天窗口发送密码，所有权限变更必须走受控路径并保留 audit。Admin Preview 不可用时，可在受控工作站运行与 Production RC 同 SHA 的干净 Admin build，但仍须走 `/access`、`admin:operate`、RPC 与 audit，每次 break-glass 前必须获 Product Owner 明确批准。
- PRC-06 = `CLOSED FOR PREPARATION`。PRC-01 已关闭，PRC-02 至 PRC-06 均已关闭准备状态；该 Closeout 当时确认 `Production Preparation = PREPARATION COMPLETE / DEPLOYMENT REVIEW ELIGIBLE`，后续 Review 结论以上方最新 `BLOCKED` 记录为准。
- `Production Ready = READY WITH CONDITIONS`，`Production Deployment Authorized = NO`。本 Mission 未执行 Admin build、break-glass、权限 / 账号操作、部署或 Smoke，也未修改代码、Vercel、数据库、Auth、RLS、RPC、Migration 或 `/access` Admin。
- Production Deployment Review 前仍须核对 PRC-04 最终公开文案、PRC-03 套餐 / 备份执行项、上一稳定 Production Deployment ID 与 Production Smoke 尚未执行。

- 2026-07-15：PRC-05 Rollback and Production Smoke Closeout 完成。Product Owner 已批准 Rollback Approver / Backup Operator=Product Owner，Rollback Operator=Codex / 技术执行者但须明确授权，默认 Vercel 回滚到上一稳定 Production Deployment，数据库默认不回滚，内容优先 unpublish / archive / 暂停访问。
- P0 / P1 触发与处置、21 项 Production Smoke 和 10 项 Rollback Smoke 已固定。实际上一稳定 Production Deployment ID 须在 rollout 前记录；本 Mission 未部署、回滚或执行 Smoke。PRC-05 = `CLOSED FOR PREPARATION`。
- PRC-06 随后已按上方最新记录关闭准备状态；PRC-04 最终公开文案在该阶段仍待补齐，现已由 PDR-01 Finalization 完成。
- 本 Mission 仅修改 Markdown；未点击 Deploy / Redeploy / Promote，未绑定域名、修改 Vercel、数据库、Auth、RLS、RPC、Migration、账号、邀请码、角色或 `/access` Admin，也未创建 tag。

- 2026-07-15：PRC-04 Age Boundary Correction 完成。Product Owner 将当前有效年龄边界固定为 18+、仅限受邀用户；任何早期 16+ 决定或表述均被覆盖并作废。V1 仅文本、invite-only，禁止内容、隐私数据边界、Supabase / Vercel、30 天导出 / 删除目标、受控删除 / 下架路径、Product Owner 责任与联系邮箱 `fandomharbor@163.com` 已固定。
- PRC-04 = `CLOSED FOR PREPARATION`。该阶段尚未生成正式法律页面；最终可访问、版本化的公开文案现已由 PDR-01 Finalization 完成。PRC-05 / PRC-06 随后已按上方最新记录关闭准备状态。
- 本 Mission 仅修改 Markdown；未部署、修改产品代码、数据库、Auth、RLS、RPC、Migration、Vercel、账号、邀请码、角色或 `/access` Admin，也未创建 tag。

- 2026-07-15：PRC-02 / PRC-03 Closeout 完成。Product Owner 已确认 `fandom-harbor-web`、Root Directory=`apps/web`、Framework=Next.js、Production Branch=`main`、Production Domain=`fandom-harbor-web.vercel.app`、Vercel 默认 HTTPS、无 Custom Domain，以及三个获批变量名均已配置到 Production 作用域；未读取或输出变量值。
- Product Owner 已批准 7 天 invite-only observation window、Reader 25 / Author 5、99.0% best-effort、RPO 24h / RTO 8h、30 分钟事故确认、60 分钟暂停 / 回滚决定、Product Owner 责任边界、Dashboard + 人工反馈监控及条件备份方案。PRC-02 / PRC-03 = `CLOSED FOR PREPARATION`。
- 上线前仍须确认 Supabase 当前套餐和备份能力；如为 Free，至少完成一次手动数据库导出。该项没有在 PRC-02 / PRC-03 Mission 中执行；PRC-04 至 PRC-06 随后已按上方最新记录关闭准备状态。
- 本 Mission 未点击 Deploy / Redeploy / Promote，未绑定 Custom Domain、修改 Vercel 配置、数据库、Auth、RLS、RPC、Migration、账号、邀请码、角色或 `/access` Admin，也未创建 tag。

- 2026-07-15：PRC-01 RC Baseline Closeout 完成。已从 `903bf70` 创建 `codex/v1-production-rc`；RC commit 只纳入已验收 Reading Typography / Layout 与获批 Release / Production 文档，冻结 `/access` Admin 改动未进入 RC。PRC-01 = `CLOSED`。
- RC commit / SHA 可追踪、可回滚，完整验证在独立干净 detached worktree 执行。主工作区仍保留冻结 Admin 改动，不能作为部署源；后续只能引用已验证 RC SHA。
- linked Supabase 仍为 active healthy，Migration 14 / 14。PRC-02 至 PRC-06 现均已关闭准备状态。Product P0 / P1 = `0 / 0`。
- 详细证据、最低方案与关闭清单见 `docs/19_Release/V1-PRODUCTION-PREPARATION.md`。本 Mission 未部署、绑定域名、创建账号、发送邀请码、修改角色、数据库、Auth、RLS、RPC、Migration、Vercel 或 `/access` Admin 实现。

- 2026-07-15：V1 Production Readiness Review = `PASS`；Production Ready = `READY WITH CONDITIONS`；Production Deployment Authorized = `NO`。Product P0 / P1 = `0 / 0`。
- 邀请注册、Reader 登录 / Published 阅读、Author 登录 / Studio、创建、草稿保存、发布、Reader 回读、Draft isolation、Studio denial 与 Guest 登录边界均 PASS。
- Production Deployment Review 前核对：PRC-04 最终公开文案、PRC-03 套餐 / 备份执行项、上一稳定 Production Deployment ID 与 Production Smoke 尚未执行。
- `/access` Admin 既有改动继续冻结，Admin Preview 外部阻塞独立跟踪。当前可以进入 Production Preparation，但未授权 Production Deployment、域名绑定、账号、邀请码、角色或 Admin 操作。

- 2026-07-15：V1 External Beta Closeout = `PASS`。Product Owner 已确认 3 名 Reader 小范围外部测试 PASS、外部 Author 测试 PASS；此前 `GO — NOT OPENED` 仅作为历史评审节点保留。
- Reader-only Controlled Test、Reading Typography Alignment Fix、Author001 Publish E2E、3 Reader 外部测试与外部 Author 测试全部 PASS。Product P0 / P1 = `0 / 0`。
- Guest 点击作品详情或章节进入登录页属于当前 active Membership 产品规则，不作为缺陷。`/access` Admin 既有改动继续冻结到 Admin 阶段，不阻塞 Beta Closeout。
- External Beta Closeout 随后已进入并完成 Production Readiness Review；当前结论以上方 `PASS / READY WITH CONDITIONS / DEPLOYMENT NOT AUTHORIZED` 为准。

`PRODUCTION READINESS REVIEW PASS / READY WITH CONDITIONS / DEPLOYMENT NOT AUTHORIZED`

以下阶段条目按发生时间保留为历史记录；如与上方最新状态冲突，以上方 Production Readiness Review 结论为准。

- 2026-07-15：V1 External Beta Go / No-Go Review = `GO — NOT OPENED`。Phase 1 Reader-only 与 Phase 2 Author-controlled 均 PASS；Reader / Guest 规则、Author 发布、Draft isolation、Studio denial、邀请码治理、限制、停止 / 回退与反馈模板均完成检查，Product P0 / P1 = `0 / 0`。
- 推荐范围为 1 名外部 Author、5 名 Reader、7 天，仅限 Web Preview 与最小发布 / 阅读边界。Guest 可发现作品但详情和章节要求登录，这是当前 active Membership 规则，不作为缺陷。
- `/access` Admin 既有代码改动冻结到 Admin 阶段；Admin Preview 外部阻塞继续独立跟踪。唯一外部 Author 的真实授权仍需 Product Owner 单独批准并复用已验证的 `/access`、服务端校验与 audit 路径。
- 本评审未开放 Beta、创建账号、发送邀请码、授权角色、修改代码 / 数据库 / Auth / RLS / Migration / Vercel、执行 Deployment 或 Production。

- 2026-07-15：V1 Phase 2 Author-controlled Test / Author001 Publish E2E = PASS。Author001 使用注册名登录并通过 `/studio`、`/studio/works`、`/studio/works/new`；创建作品、保存章节草稿、Draft isolation、发布所选章节、Work Detail、Published Reading 与 Reader 回读均通过。
- Guest / Reader 均看不到未发布草稿；Reader 三条 Studio 路由返回 Archive，Guest `/studio` 进入登录页。Guest 可搜索到已发布作品，但点击作品或章节后进入登录页，符合当前 active Membership 规则。
- 390px 与 Light / Dark 无明显横向溢出或破版，Console 产品级错误为 0，Product P0 / P1 = `0 / 0`；`pnpm validate` 通过。
- Author Release evidence gate 已关闭。可以进入下一阶段外部 Beta 的 Product Owner Go / No-Go 评审，但尚未开放外部 Author、完整 Beta、Production、Deployment 或 Admin 测试。

## 当前 Release Mission

- 2026-07-15：Product Owner 已完成 V1 第一阶段 Reader-only 受控测试；Reader-only Controlled Test Closeout = PASS，Product P0 / P1 = `0 / 0`。
- 收口记录的唯一问题为 Reading Page UI / Typography / Content Layout P2。已用最小 CSS 让 Reading 容器保持视觉居中、正文段落两端对齐，并补齐 390px 安全宽度；未改变字号、行距、主题、阅读偏好、内容数据或 Published-only 权限边界。
- Reading Typography Alignment Fix = PASS。下一阶段 Author-controlled 测试可等待 Product Owner 单独授权；本 Mission 未自动进入 Author、Admin、Deployment 或 Production。

- V1 Phase 1 Reader-only Beta Testing Guide 已完成文档准备，入口为 `docs/19_Release/V1-PHASE1-BETA-TESTING-GUIDE.md`；尚未发送邀请码或创建真实测试账号。
- 指南固定第一批为 3 Reader / 0 外部 Author，包含 Guest / Reader、注册登录、公开页面、Published Reading、移动端、权限 P0、反馈模板与 PO 邀请前清单。
- 当前注册页只要求注册名、密码和邀请码，没有邮箱字段；密码至少 8 位。当前环境要求邮箱确认关闭，Email Confirm 不属于 Phase 1 测试重点。
- Phase 1 PASS 需要 3 名 Reader 均可注册、登录和重新登录，权限边界正常，公开页面与已发布阅读可用，移动端无严重横向溢出，Product P0 = 0，Product P1 = 0 或由 Product Owner 明确接受风险。
- 本 Mission 只完成测试引导文档，不授权自动邀请、真实账号创建、Author 授权、部署或 Beta 发布。

- 2026-07-15 Controlled Beta Invite Readiness：Reader 邀请注册与授权前 Studio denial PASS；建议首批 3 Reader / 0 外部 Author。
- Author001（masked `2cbd52b1…351d`）active Membership、唯一 active `author` grant、对应 `role.granted` audit、Super Admin operator 与 `admin:operate` 已只读确认。
- Author001 退出并重新登录后 `/studio`、`/studio/works`、`/studio/works/new` 均 PASS；Reader → Author Provisioning Block 已关闭。
- `/access` 页面、Server Action 与数据库函数具备登录 / `admin:operate` / 目标 Membership / audit 守卫，不依赖直接 SQL 或 Supabase 控制台改角色；Admin 最小治理对 Reader-only cohort 为 PASS。
- Author001 创建入口 PASS，但创建、保存、Draft isolation、发布与 Reader 回读为 `NOT RUN`。邀请外部 Author 或完整 Beta 收口继续受此 Evidence Gate 阻塞。
- Homepage、Archive、Search、Work Detail、Author Profile 当前可打开；Published Reading、Sign-in / Sign-up、390 × 844、Light / Dark 与 Console 沿用同一 Preview 既有 PASS 证据。Product P0 / P1 = `0 / 0`。
- 本结论只允许 Reader-only 小范围受控邀请，不授权发送邀请码、创建用户、再次授权、部署、Production 或完整 Beta 发布。

### 历史 Release 轨迹（已由上方最新 Gate 取代）

- Release 已拆分为四条线：Web V1 主站、Admin 最小治理、Admin Preview Deployment 解阻、Release 文档与中文教程。统一口径见 `docs/19_Release/V1-RELEASE-FLOW-OPTIMIZATION.md`。
- Web Preview Smoke 不再被 Admin Preview 阻塞；完整 Admin UI 不作为 V1 Beta 硬门槛。
- Admin 最小治理是独立 Beta 硬门槛：现有权限底座满足基础条件，但必须确认 Super Admin 连续性 / 恢复 runbook、Admin 授权操作入口、邀请码事故治理与 audit 责任。
- Beta Author Provisioning 审计确认邀请码注册只创建 active Membership / Reader，不授予 Author；Reader 无 `work:author`，直访 `/studio` 返回 `/archive`。
- Reader → Author 能力已存在：Admin App `/access` 可选择 `author`；Server Action 要求 `admin:operate`，数据库要求目标 active Membership、操作者 Admin / Super Admin 和非空原因，并写入 `role.granted` audit。
- Product Owner 已人工确认历史远程 Author 可在当前 Web Preview 登录并进入 `/studio`；受控浏览器也确认 Author Shell、Studio 入口、Studio 导航、作品管理、文章管理与邀请码管理入口。因此“既有 Preview Author 账号可用性”Block 已解除。
- 导航到 `/studio/works` 后页面最终回到 `/archive`，随后浏览器控制持续超时。为避免误判或重复提交，已停止浏览器操作；本轮没有创建、保存、发布任何作品，也没有修改账号或权限。
- Author 创建 / 保存 / 发布、Reader / Guest 回读、Draft isolation、Author 专项 390 × 844、Light / Dark 与控制台证据仍为 `BLOCKED / NOT RUN`。Guest / Reader 既有 Smoke 可继续，但 V1 Beta 与完整 Web Smoke 尚不能收口。
- Product Owner 下一步需在保留的 Preview 标签重新建立 Author 会话，从 `/studio/works` 人工完成剩余结果；不得在 Codex 中提供密码。当前没有确认产品 FAIL，Product P0 / P1 仍为 `0 / 0`。
- Reader → Author Provisioning E2E 已完成前半段：Product Owner 注册并登录新 Reader；页首无 Studio，直访 `/studio`、`/studio/works`、`/studio/works/new` 最终均返回 `/archive`。
- `http://localhost:3000/access` 已登录 Super Admin，完整 Role Grant 表单可用；Product Owner 已在第一个表单准备 User ID 与 `author`。手动提交后当前地址为 `/access?error=invalid`，Author grant 失败，没有新的 `role.granted` audit。
- 依据强制安全规则立即停止：未重试、未修改目标 ID，未使用 SQL、Supabase 控制台、Auth、Migration 或 RLS 绕过。
- `/access` 代码审计确认 `error=invalid` 仅来自 RPC 前的 `roleMutationSchema.safeParse`。表单字段、grant / revoke action、`author` role、capability 与 RPC 参数全部对齐；严格 UUID 输入此前未清理粘贴空白，且错误信息无法区分 userId / role / reason。
- 本地最小修复已完成：Role Grant UUID 校验前 trim，增加 `invalid-user-id`、`invalid-role`、`invalid-reason` 安全提示，并补充 4 个 targeted tests。Admin tests、lint、typecheck 已通过。
- 真实 Author grant 未由 Codex 执行；目标 active grant、`role.granted` audit 与授权后能力为 `PENDING`。在 Product Owner 使用更新后的 `/access` 手工成功提交并完成只读复核前，E2E Gate 保持 OPEN。
- 结论拆分：已有 Preview Author 可用性 Block 保持关闭；新 Reader → Author E2E Governance Block 保持 OPEN，并继续阻塞 V1 Beta 与完整 Web Smoke 收口。
- Product Owner 需在浏览器内自行确认目标 User ID 是本轮 Reader 的有效 UUID，并确认非空原因填写在第一个“授予角色”表单；不得在 Codex 中提供 ID、密码或邀请码，未获明确重试授权前不得再次提交。

- V1 Deployment Ready for Product Owner Review = NO；部署类型为 Vercel Preview Deployment。
- Supabase linked remote Migration 14 / 14 一致；未执行任何远程写入。
- `pnpm validate`、169 / 169 Workspace tests、Web 81 / 81、Admin 2 / 2、Web / Admin / Docs production builds 与 `git diff --check` 全部通过。
- Local QA Fixture、Guest / Reader / Author、Reader `/studio` → `/archive`、Author Studio、Published-only / Draft isolation、1280 / 390 与 Light / Dark 通过。
- Release Baseline `903bf70a6dc370090362098d26bedd6bf68af529` 已正常 push；`main` 与 `origin/main` 一致，工作区在项目创建前干净。
- Vercel CLI 登录已确认；team 为 `fandom-harbor`。
- Web Project `fandom-harbor-web` 已创建并关联，Root Directory 为 `apps/web`，Framework 为 Next.js；`.vercel/project.json` 被忽略且未跟踪。
- Preview 环境已存在必需的 `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`；只核对变量存在，未读取或输出值。`NEXT_PUBLIC_SITE_URL` 未配置但有 Vercel URL fallback。
- `fandom-harbor-web` Preview 已构建成功：`https://fandom-harbor-ilvpjubrm-fandom-harbor.vercel.app`，Deployment `dpl_2H2tUqGo7UXWrfhSC5FsmoeHGpX8`，状态 `Preview / Ready`。
- Codex 执行网络仍无法连接 `*.vercel.app:443`；Product Owner 已从本机浏览器提供人工 Smoke 结果，网络门禁不再阻止人工验收。
- Guest Homepage / Archive / Search / Reading / Auth / Studio denial、Reader 登录 / Archive / Search / Studio denial / Published-only / Draft isolation / logout、Light / Dark、390 × 844、1280、Global Shell 均 PASS，Console P0 / P1 = 0 / 0。
- Guest Work Detail、Guest Author Profile、Reader Published Work / Chapter 为 BLOCKED，具体原因待补充。
- Preview Author 登录、Author capability、Studio 入口与 `/studio` PASS；创建 / 保存 / 发布、Reader / Guest 回读和 Draft isolation 仍未完成。
- 现有 Super Admin Account Repair 已完成，仅对齐历史 Auth email；Preview Reader 已由 Product Owner 通过受控邀请码流程注册并登录。未向 Codex 提供密码、邀请码、token 或 secret。
- Product Owner 已在 Vercel Dashboard 删除或轮换 `vercel curl` 自动生成的 Protection Bypass for Automation secret；未读取、复制、记录或分享值。P1-RD-SEC-001 已关闭，后续不得重新生成 bypass secret。
- Product Owner 指定核对的 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 也不存在，但当前 Web 代码不读取该名称。
- 当前观察到 Product P0 = 0、Product P1 = 0。分线记账：Web 有 2 组未完成证据（公开内容、Author Web）；Admin 最小治理有 3 组待复核（恢复连续性、邀请责任、Reader → Author E2E）；Admin Preview 有 1 个独立外部阻塞。不得再用合计 P1 混写四条线。
- 已新增 V1 Release Deployment、Deployment Smoke Test、User Guide 与 Admin Guide。
- GitHub Baseline secret audit 发现未跟踪 UX 验收文档第 86–87 行曾包含两条 localhost-only QA 密码；已脱敏、轮换并确认未进入 HEAD / Git 历史，当前复扫无匹配。
- Vercel link 自动生成的本地会话变量仅保存在被忽略且权限为 `0600` 的 `.env.local`；未读取、输出或写入文档。
- Admin Project `fandom-harbor-admin` 已创建并关联 GitHub，Root Directory=`apps/admin`，两个必需 Preview 变量存在；Docs Project 未创建，未绑定域名。
- 远程 branch `codex/admin-preview-baseline` 已创建并固定到 `903bf70a6dc370090362098d26bedd6bf68af529`，`main` 未修改。
- Vercel 将该非 Production branch 的首次 deployment 判定为 Production；已立即删除并按 Mission 停止。Admin Preview / Production deployments 最终均为 0，没有 Admin Preview URL，`/auth/sign-in` 验收不能开始。
- Product Owner 已人工复核 Dashboard：Production Branch=`main`、Preview Branch Tracking=`All unassigned git branches`、Root Directory=`apps/admin`，Deploy Hooks=0，Custom Environments=0，Preview / Production deployments=0 / 0；未发现 Project / Git / Environment / Domain / Build 设置错配。
- 已新增 `docs/19_Release/V1-ADMIN-VERCEL-SUPPORT-EVIDENCE.md`，记录中文摘要、英文 Support Message、Dashboard 复核结论、已删除 Deployment 元信息与暂停声明。Admin Preview 继续 `BLOCKED`，等待 Vercel Support 解释或 Product Owner 授权新的受控方案。
- Admin 权限底座与 Admin Preview Deployment 明确分离：Membership、Role Grant、RLS、受控 RPC、audit 与最后一个有效 Super Admin 保护已经存在；最小 `/access` UI 已存在，完整 Admin UI 尚未完成。Admin Preview 的 Vercel 阻塞不等于权限底座或 UI 实现缺失。
- 现有 Super Admin 存在并可登录，历史 Account Repair 已成功；owner-only bootstrap 仅适用于没有未撤销 Super Admin grant 的场景。已有 grant 但身份不可登录时仍需受控账号修复或另一名 Super Admin，因此恢复 runbook 尚待独立验收。
- 邀请码只授予 Reader；Author 可通过 Web `/author/invitations` 创建并撤销自己的邀请码，Admin / Super Admin 在数据层可治理撤销，但完整 Admin 全局邀请码 UI 尚未实现。Beta 前需明确发行、有效期 / 次数、泄露停发、撤销和审计责任。
- Vercel CLI 误生成的临时 Production deployments 均已删除；Web Project 最终只保留 Preview，Admin Project 最终没有任何 deployment。未创建 Docs Project，未修改 DNS、数据库、Auth、RLS、RPC 或 Role。

## 当前 UX Mission

- UX-06J = PASS；Release UI Sweep / V1 UI Consistency = Accepted；Product Owner Acceptance = PASS。
- P0 = 0，P1 = 0；任务已正式关闭。
- Homepage、Archive、Search、Work Detail、Published Reading、Author Profile、Studio Entry / Overview 与 Auth 审计完成。
- 关闭 UIJ-AUDIT-001–003：Studio Mobile 导航高度、Studio 入口 44px、Auth 工程标签与互链 44px。
- 1280 / 390、Light / Dark、horizontal overflow = 0 与 browser console errors = 0 通过。
- Guest、Reader、Author、Reader Studio denial 与 Author Studio access 通过。
- UX-06H Homepage 与 UX-06I Global Shell 均无回退。
- Web 81 / 81 tests 与完整 `pnpm validate`、169 / 169 workspace tests、全部 production builds 通过。
- 未修改 Database、Supabase、Migration、RLS、RPC、Auth logic、Role、Published-only 或业务逻辑。
- 非阻塞后续项：移动端当前路由高亮、Root Loading / Error 共享架构边界、极端长连续文本 Fixture coverage。
- 停止在当前状态；不得进入部署、新功能或下一项 UX 任务，等待 Product Owner 下一条明确指令。

- UX-06I Global Shell / Navigation 已通过 Product Owner 验收；UX-06I = PASS，Global Shell / Navigation = Accepted。
- 桌面三分区结构保持稳定，移动端默认收起的原生 `details` 主要导航已获接受。
- Archive、Search 与 Studio 使用统一导航数据源；Studio 继续只对 `work:author` capability 显示。
- Guest / Reader 无 Studio 入口；Reader 直访 `/studio` 重定向 `/archive`；Author 可见并可进入 Studio。
- Homepage、Archive、Search、Work Detail、Reading、Author Profile、Studio、390 Mobile 与 1280 Desktop 回归通过，browser console errors = 0。
- Web 81 / 81 tests、Web / UI typecheck、UI lint 与完整 `pnpm validate` 通过；Workspace 169 / 169 tests 和全部 production builds 通过。
- 未修改 Auth、Permission、Role、Published-only、Draft isolation、Database、Supabase、Migration、RLS、RPC 或页面产品逻辑。
- P0 = 0，P1 = 0；Product Owner Acceptance = PASS。
- 移动端当前路由高亮记录为非阻塞后续优化项。
- UX-06I 已关闭；不得进入下一项 UX 任务，等待 Product Owner 下一条明确指令。

- UX-06H Step04 Homepage Release Acceptance Slim 已完成；Step01 / Step02 / Step03 均为 PASS。
- Homepage 的 Quiet Editorial Harbor Entrance 五段结构保持稳定。
- 现有 Public Browse Gateway、`newest`、最多三项与 `BrowseWork` contract 保持不变。
- Homepage → Archive / Search / Work Detail / Auth、Guest / Reader / Author、Published-only 与 Draft Work / Chapter isolation 全部 PASS。
- 1440 / 1280 / 768 / 390、Light / Dark、keyboard focus、44px、single H1、five labelled regions、zero overflow 与 browser console errors = 0。
- Web lint / typecheck / 79 tests / build、完整 `pnpm validate`、167 / 167 workspace tests、全部 production builds 与 diff check 通过。
- HP-AUDIT-007 Frozen；HP-QA-001 为 non-blocking Fixture enhancement；stale chunked-cookie warning 无功能影响。
- P0 = 0，P1 = 0；Homepage Ready for Release = YES。
- Step04 未修改产品实现或数据层；未修改 Auth、Permission、Published-only、Gateway、Service、Repository、query、Database、Supabase、RLS、RPC 或 Migration。
- UX-06G Step01–Step04 已通过 Product Owner 最终验收；Work Detail Ready for Release = YES，Track 已完成并关闭。

- Product Owner 已确认 UX-06F Step01–Step04 全部 PASS；Author Profile Ready for Release = YES，Track 已完成并关闭。

- UX-06E Step01–Step03 已验收并成为 Step04 冻结 Release QA 基线；UX-06E Step04 Search Release Acceptance 已完成最终浏览器复验。
- Initial、Query、Empty、Invalid、80 / 81-character、Loading、Error、Work / Author Results、Light / Dark 与四档响应式均通过。
- Guest / Reader / Author、Published-only、Draft Work / Chapter isolation、Work / Author entries 与 browser console 0 通过。
- Step03 发现 Error clear 同 route navigation 不会重置 segment error boundary；仅在 `search/error.tsx` 改为原生完整导航并复验通过。
- `/search` 已建立 Orientation、visible-labeled Query、Query Context / State、Work Results 与 Author Results 的 route-local 页面节奏。
- Initial / Empty recovery、Search-shaped Loading、single-owner Error、44px entries 与 Light / Dark responsive presentation 已完成。
- `/search` 已完成 route、GET query、Work / Author results、Initial / Invalid / Empty / Loading / Error、1280 / 390 responsive、semantics 与 boundary 的只读审计。
- Search 定位冻结为 Published Work / Public Author 的主动查询入口；Archive 继续承担 Published Work 浏览、排序与分页。
- Search 不承担 recommendation、ranking、Feed、Marketplace、advanced filters、Studio management 或 immersive Reading。
- Published-only、Draft isolation、Search Gateway / Service / Repository / RPC、query fields、matching、ordering 与 result cap 均未改变。
- 记录 8 个 P2 design / accessibility findings；P0 = 0，P1 = 0，Search Ready for Step02 = YES。
- `pnpm validate`、167 tests、Web 79 / 79 与 Web / Admin / Docs production builds 全部通过。
- Step01 未修改产品实现、Database、Supabase、RLS、RPC、Migration、Auth、Permission、dependency 或 deployment configuration。
- Guest / Reader / Author、Published-only、Draft isolation、Work / Author entries 与 browser console 0 已通过。
- `pnpm validate`、167 / 167 workspace tests、Web 79 / 79 与 Web / Admin / Docs production builds 通过；Search Layout Ready for Step03 = YES。
- Step02 修改产品实现但仅限 Search route-local UI；Search data / permission / query contracts 未改变。
- Web lint / typecheck / 79 tests / build 与 `pnpm validate`、167 / 167 workspace tests、全部 production builds 通过。
- Step04 复核所有 states、query contract、四档视口、Light / Dark、accessibility、Guest / Reader / Author、Published-only 与 Draft isolation，全部 PASS。
- SE-AUDIT-001 至 SE-AUDIT-008 与 Step03 Error clear finding 均保持 Closed；P0 = 0，P1 = 0。
- Step04 未修改产品实现；Web checks、`pnpm validate`、167 / 167 tests、全部 production builds 与 diff check 通过。
- P0 = 0，P1 = 0；Search Ready for Release = YES，Product Owner Final Decision：PASS。
- UX-06E Step01–Step04 全部 Accepted；Search Track 已完成并关闭。

- UX-01 至 UX-05E 已全部通过 Product Owner 验收，UX-05 Visual Intelligence Phase 已关闭。
- UX-06A Design System Implementation Foundation 已完成工程样式审查、Token Strategy、Component Strategy 与 UX Implementation Guidelines，并通过 Product Owner 验收。
- UX-06B Homepage Implementation Step 01 已建立 route-local Homepage Shell、四个 semantic content regions 与 Desktop / Mobile responsive foundation，并通过 Product Owner 验收。
- Step 01 保留 Root Layout、SEO、Session、`landingSignals`、`mockWorks` 和全部既有入口；未修改 Auth、Permission、Database、Supabase 或业务逻辑。
- UX-06B Step 02 已完成品牌入口、Story Discovery、真实 Published Work、Reading Entry 与 Closing 内容结构，并通过 Product Owner 验收。
- Homepage 复用现有 Published-only browse gateway 并展示 newest three；无推荐算法、数据库、Supabase、Auth、Permission 或业务逻辑变化。
- UX-06B Step 03 已完成 Homepage Typography、Spacing、semantic color usage、轻量反馈与 Desktop / Tablet / Mobile visual refinement，并通过 Product Owner 验收。
- Step 03 未改变 React 结构、Component、数据、Auth、Permission 或业务逻辑，并已作为 Step 04 Release Audit 的冻结实现基线。
- Product Owner 已授权永久 Manual QA Handoff Gate：所有人工验收 Mission 必须主动提供环境、动态 Fixture 凭据、身份验证结果和统一 Checklist；任何 QA 环境或凭据失败均为 P0，修复前不得交付。
- 当前 Step 03 QA Environment 已复验 Ready：Guest、Reader、Author、Reader Studio denial、Author Studio/Profile、Desktop/Mobile 与零错误控制台均通过。
- UX-06B Step 04 已完成 Homepage Responsive、Accessibility、Interaction、Performance、Visual Consistency 与完整 V1 Regression Audit；未发现需要修改 Homepage 代码的问题。
- Homepage 当前为 Release Ready：四档视口、WCAG 对比度、全仓 `pnpm validate`、Guest/Register/Login/Archive/Reading/Author/Studio 与角色边界全部通过。
- Product Owner 已确认 UX-06B Step 04 PASS，Homepage Track Completed。
- UX-06C Reading Track Step01–Step05 已全部完成并通过 Product Owner 验收。
- UX-06D Step02 已在 Step01 Design Contract 边界内完成 Archive route-local Layout Upgrade；Orientation、Browse Controls、编辑式 Results、Pagination 与 Private Return 层级已建立。
- Step02 保留四种排序、URL state、分页、Published-only、Reader Permission、Draft Isolation、Work / Author links 与 ReaderShelf 本地行为；未改变数据、权限或业务逻辑。
- 1440 / 1280 / 768 / 390、Guest / Reader / Author、Published Work / Draft isolation 与 console error 0 回归通过；P0 / P1 为 0。
- AR-AUDIT-003、AR-AUDIT-007 与 KI-024 按 Mission 边界保持为后续范围；未新增 QA 数据或伪造多页 PASS。
- UX-06D Step03 已完成 Archive Empty / Loading / Error / Pagination / Sort / URL、1440 / 1280 / 768 / 390、accessibility 与 Guest / Reader / Author 边界集中复验。
- Step03 仅在 Archive route-local CSS 中将作品标题、作者与作品入口补足为 44px minimum tap target；未修改页面结构、数据、Gateway、Repository、Permission 或其他 route。
- Published-only、Draft Work / Chapter 404、Work Detail、Author Profile、ReaderShelf 与 browser console error 0 回归通过；P0 = 0，P1 = 0。
- Archive Ready for Step04 = YES；Step04 subsequently authorized and completed below.
- UX-06D Step04 已完成 Archive 最终 Release Acceptance；Step01 / Step02 / Step03 均纳入最终基线并通过复核。
- Archive 最终定位为 Curated Story Discovery Space；四种正式排序、states、1440 / 1280 / 768 / 390、accessibility、Guest / Reader / Author、Published-only、Draft isolation、Work / Author links 与 ReaderShelf 全部 PASS。
- `pnpm validate`、Web 79 / 79 tests、production builds 与 browser console error 0 通过；P0 = 0，P1 = 0。
- Step04 未修改产品实现；AR-AUDIT-003、AR-AUDIT-007 与 KI-024 继续作为 P2 / post-Beta 风险保留。
- Product Owner Final Decision：PASS；UX-06D Step01–Step04 全部 Accepted，Archive Track 已完成并关闭。
- Archive Ready for Release = YES；不得继续优化 Archive，不自动开启新的 UX Track。
- UX-06C Step 01 已建立 Reading Context、Story Content 与 Continuation 三层 Layout Foundation，并提取 route-local Chapter Header / layout primitives。
- UX-06C Step 01 补充冻结全站 Header 三段式结构：Brand、Primary Navigation、Utility / Account 各自独立；Studio 继续由既有 `work:author` capability 控制。
- Reading grid 已增加移动端 intrinsic-width containment 与连续文本换行保护，不改变阅读偏好合同。
- UX-06C Step 01 Additional 已建立 page-local Mobile Reading Navigation：返回作品常驻，Homepage / Archive / Shelf / Search、上一 / 下一章与章节目录按需展开；Desktop 目录默认关闭。
- Product Owner 已确认 UX-06C Step 01 PASS，Reading Track 基础阶段完成。
- UX-06C Step 02 已完成并通过 Product Owner 验收：保留 Reader preference contract，建立 system-serif fallback、离散章节标题 scale、结构化正文节奏与 Progressive Disclosure 阅读控制。
- Author Studio / Work Editor 多章节管理与发布选择 UX 规则已记录并冻结；当前仅文档化，后续实现必须由独立 Author Studio / Chapter Management Mission 授权。
- UX-06C Step 03 已完成 Reading Interaction：Chapter Directory、Mobile Navigation 与 Reading Settings 一次仅展开一个，目录关闭后焦点返回触发按钮，章节末尾保持安静的 Previous / Next 延续语义。
- 1440 Desktop、390 Mobile、44px touch targets、zero overflow、Guest / Reader / Author QA 与零新页面运行错误通过。
- Product Owner 已确认 UX-06C Step 03 PASS；Reading Interaction 基础已冻结。
- UX-06C Step 04 已完成 1440、768、390 的真实短章节、设置、目录、切章、错误边界与全站角色回归，全部可执行项通过且 browser errors 为 0。
- UX-06C Step04A 已扩展现有 `qa:fixture`：4 个 fixed-ID QA Works、6 个 QA Chapters，覆盖 Short、Long-form、Multi Chapter、Empty 与 Draft isolation。
- Long-form Chapter 包含 150 个合成段落、约 14,242 rendered characters；1440 Desktop 与 390 Mobile 长滚动 geometry、zero overflow 和章节连续性验证通过。
- `qa:fixture` 重复创建、`qa:fixture:clean` 内容清理、重新创建与 `qa:credentials` 均通过；清理保留 QA identities 和 permissions。
- Reader 只见 3 个 Published Chapters；Author Studio 可见全部自有 QA Works；Draft Work / Chapter 不进入 Archive、Reader 或公开 Author Profile。
- Step04 原 Long-form 数据缺口已由 Step04A 解决，Step04 重跑与 Product Owner 验收均已完成。
- Product Owner 已确认 UX-06C Step04A PASS；Reading QA Infrastructure 已冻结并由 Step04 / Step05 成功复用。
- UX-06C Step04 已获授权并真实重跑：Long Watch 150 段在 1440 / 768 / 390 的连续阅读、长滚动、Typography、Settings、Navigation 与三章 Transition 全部 PASS。
- Homepage、Archive、Reading、Author 与 Studio 回归通过；Reader denial、Author Studio、Draft isolation 与 browser errors 0 通过。
- Step04 未发现需修复问题，未修改 UI、Fixture、Schema、Migration、RLS、Permission 或业务逻辑；Product Owner 已确认 PASS。
- UX-06C Step04 已正式关闭；UX-06C Step05 已获独立授权并完成。
- UX-06C Step05 已获授权并完成最终 Release Audit：1440 / 1280 / 768 / 390、Accessibility、Performance、Long-form 与完整 Regression 全部 PASS。
- `pnpm validate` 全绿，Web 79 / 79 tests 与三套 production builds 通过；browser errors 0，P0 = 0，P1 = 0。
- Reading Release Decision：Ready for Release = YES；未修改产品代码、Fixture、Database、Supabase、Permission 或业务逻辑。
- Product Owner 已确认 UX-06C Step05 PASS；Reading Track 正式 Completed / Release Ready。
- Homepage Track 与 Reading Track 当前均为 Release Ready；等待下一条 UX Track 独立授权。
- UX-06D Archive Track Step01 已获授权并完成：当前 `/archive` route、Published-only browse、sort、pagination、cards、states、responsive 与 semantic structure 已完成只读审计。
- Archive Design Contract 已冻结页面目标、信息优先级、页面分区、Work card、sort、pagination、empty/loading/error、mobile 与跨页面边界。
- 记录 7 个 P2 design / QA findings；P0 = 0，P1 = 0，没有必须先修改代码才能继续的阻塞。
- Archive Ready for Step02 = YES；Step02 未获授权且未开始。
- Step01 未修改产品代码、Database、Supabase、RLS、RPC、Migration、Auth、Permission、Published-only、data gateway 或 dependency。
- Schema、Migration、RLS、Permission、Reader logic、UI、Typography 与 Production data 均未改变。

## 已完成

- Milestone v0.1 已发布到 GitHub。
- Phase 1 Foundation 与 Sprint 002A Website Shell 已完成并归档。
- Auth Boundary、Identity Model、Invitation System、Membership、Role Model、Audit 与 Supabase Boundary 已固化。
- Landing、Reader List、Reader Detail、Reader Shell、Author Empty State、Admin Dashboard、Mock Data 与 Shared Layout 已交付。
- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build` 已通过。
- Phase 2 / Sprint 002A brief 已由 Product Owner 批准，四项启动门禁已通过。
- 七张内容表、Migration/RLS/约束/索引、TypeScript Service/Repository 边界、Vitest/SQL 测试和 ADR-019 已完成。
- 全仓 lint、typecheck、Vitest 与三套 Next.js production build 已通过。
- 作品详情、章节阅读与独立文章阅读路由已接入可替换的 `ReaderContentGateway → Content Service → ContentStore` 数据流。
- 结构化正文安全渲染、上一章/下一章、章节目录、Light/Dark、字号、行高与阅读宽度控制已完成。
- Sprint 002B-Step01 单元测试与浏览器公共壳/主题/登录守卫检查已通过。
- Sprint 002B-Step02 已实现版本化 localStorage 阅读偏好、Storage 安全回退和更清晰的章节进度/边界/当前章节状态；全仓门禁与浏览器回归通过。
- Sprint 002B-Step03 已实现本地 work/chapter/article 阅读历史、时间/章节位置记录与作品详情页 Continue Reading；不依赖登录且不写数据库。
- Sprint 002B-Step03 全仓 lint、typecheck、38 个 Vitest、三套 production build 与浏览器公共壳/登录守卫回归通过。
- Sprint 002B-Step04 已实现本地章节/文章书签、当前书签状态和 `/archive` 本地书架；书架聚合书签与最近阅读且不写数据库。
- Sprint 002B-Step04 全仓 lint、typecheck、43 个 Vitest、三套 production build 与浏览器公共壳/书架登录守卫回归通过。
- Sprint 002B-Step05 已完成作品/章节/文章/本地书架空状态与失效链接审计、全局 404/error 恢复路径、阅读控件与书签/书架无障碍打磨。
- Sprint 002B-Step05 全仓 lint、typecheck、43 个 Vitest、三套 production build 与浏览器 404/主题刷新/书架登录守卫回归通过。
- Sprint 002C-Step01 已建立 Studio Service/Store 注入边界、Author fixture 与 `/studio` route tree；全仓门禁和未登录浏览器守卫回归通过。
- Sprint 002C-Step01 草稿章节隔离缺口已修复，Reader published-only 合同覆盖 Work、Article 与 Chapter。
- Sprint 002C-Step01 全仓 lint、typecheck、48 个 Vitest、三套 production build 通过；最小修复后的 Web production build 再次通过。
- Product Owner 于 2026-06-30 确认 Sprint 002C-Step01 工程验收通过。
- Sprint 002C-Step02 已新增 owner-scoped `/studio/works/[workId]` 只读详情、作品元信息、章节摘要、Not Found 边界与 disabled 操作占位。
- Step02 的 owner ID 继续由 TrustedAccessContext 注入；其他作者详情返回 null，Reader published-only 合同保持通过。
- Step02 全仓 lint、typecheck、52 个 Vitest 与 Web production build 通过。
- Product Owner 于 2026-06-30 确认 Sprint 002C-Step02 工程验收通过。
- Sprint 002C-Step03 已新增 owner-scoped `/studio/articles/[articleId]` 只读详情、文章元信息、关联信息、Not Found 边界与 disabled 操作占位。
- Step03 的 owner ID 继续由 TrustedAccessContext 注入；其他作者文章详情返回 null，Reader article published-only 合同保持通过。
- Step03 全仓 lint、typecheck、55 个 Vitest 与 Web production build 通过。
- Product Owner 于 2026-07-01 确认 Sprint 002C-Step03 工程验收通过。
- Sprint 002C-Step04 已补齐 Studio 空列表、详情级 Not Found、无章节/全草稿章节状态与返回 Studio/列表的恢复路径。
- Step04 继续以 trusted owner、Reader published-only 和 disabled action contract 保持只读边界。
- Step04 全仓 lint、typecheck、58 个 Vitest 与 Web production build 通过。
- Product Owner 于 2026-07-01 确认 Sprint 002C-Step04 工程验收通过。
- Sprint 002C-Step05 已完成 Freeze & Handoff；Step01-Step04 全部 Accepted，Sprint 002C 可正式关闭。
- Studio 当前冻结能力包括首页、Works/Articles 列表、Work/Article 只读详情、空/错误/边界状态、恢复导航、Reader published-only 与 Trusted Identity Contract。
- Phase 2 Architecture Review 已完成：只读架构可维护，但真实写入仍受 owner-only Repository、DB Runtime、正文校验、Revision 与状态机阻塞。
- Product Owner 于 2026-07-01 批准 Sprint 002D Author Creation Experience UI Shell 开发手册；Step01 随后获得独立授权。
- Sprint 002D-Step01 已新增 `/studio/works/new`、客户端表单状态/校验、Category/Tag fixture、封面/loading 占位和 disabled 保存/发布 Action Bar。
- Step01 不包含 Service 写入、Repository、Supabase、Mutation、POST、RPC、SQL 或虚假保存成功状态。
- Step01 全仓 lint、typecheck、64/64 Vitest 与 Web production build 通过；`/studio/works/new` 已进入 production 路由表。
- Product Owner 将 Sprint 002D-Step02 调整为 Create Work Draft Persistence，替代原 Create Article UI Shell，并批准最小词表与原子 RPC 的 Level 3 变更。
- Step02 已新增 5 个 V1 Category、10 个 `additional/canonical` Tag、`create_author_work_draft` RPC，以及 Server Action → Gateway → Service → Repository 写入链路。
- RPC 只允许 active Author，owner 固定为 `auth.uid()`，status 固定为 `draft`，`published_at` 固定为 null；Work 与 `work_tags` 在单一事务内写入。
- `/studio/works/new` 已改为读取数据库 Category/Tag UUID，保存草稿可用并提供 pending/错误/成功状态；Publish 继续 disabled。
- Step02 全仓 lint、typecheck、74/74 Vitest 与 Web production build 通过；生产路由表包含 `/studio/works/new`。
- Local Supabase Runtime Validation 已完成：六条 Migration 从零重建通过，V1 词表重复执行为 0 新增行，Category/Tag 数量为 5/10。
- `phase_2_content_domain.sql` 在真实本地 PostgreSQL 通过，覆盖 Author 创建、anon/Reader 拒绝、非法 Category、deprecated Tag、无部分 Work 与 `works`/`work_tags` 原子性。
- Runtime Validation 发现并修复 RPC 对受限 `id`/`owner_user_id` 列的越权 `INSERT ... RETURNING *`；修复未放宽 grant 或 RLS。
- Sprint 002D-Step02 正式 Accepted；Sprint 002A 数据库实测也已完成。
- Product Owner 将快速上线 V1 下一阶段调整为 Sprint 002E Minimal Draft Editor，优先完成 Write → Save → Publish → Read 闭环。
- Sprint 002E-Step01 已复用 `chapters.content` 建立 owner-only Draft Editor 读取合同和 `/studio/works/[workId]/edit`。
- 编辑页展示真实 draft Work 的 title、summary、category、tags、status 与首个 Chapter 正文；无 Chapter 时提供空 textarea。
- textarea 只在浏览器页面内编辑，保存与发布均 disabled；没有新增 Mutation、RPC、Migration、RLS 或 Schema。
- Create Work Draft 成功后直接跳转新 Work 的编辑路由。
- Sprint 002E-Step01 全仓 lint、typecheck、81/81 Vitest 与 Web production build 通过；production route table 包含 `/studio/works/[workId]/edit`。
- Sprint 002E-Step02 已新增最小 `chapters` 正文更新 grant、owner-only Draft Body Save Server Action、首章创建/同章更新 Repository 路径与成功/失败反馈。
- Step02 不新增 RPC、不修改表结构、不修改 RLS，也不会改变 `work.status`、设置 `published_at` 或触发 Publish。
- Local Supabase `db reset --local --no-seed` 与 `phase_2_content_domain.sql` 真实通过，覆盖 anon/Reader/非 owner 拒绝、owner 更新、首存创建首章、同章更新与 published-only 合同。
- Sprint 002E-Step02 全仓 lint、typecheck、86/86 Vitest 与 Web production build 通过；`/studio/works/[workId]/edit` 保持在 production route table。
- Sprint 002F 已完成最小 Publish Workflow：`/studio/works/[workId]/edit` 现在支持 `save | publish` 双意图提交，发布前会保存当前正文。
- Publish 通过现有 Service/Repository 边界直接更新 `works` 与首章 `chapters` 的 `status/published_at`，不新增 RPC、Migration、Schema 或 RLS。
- Reader 已接入 hybrid published gateway；数据库中的新发布 Work 可立即出现在 `/works`、`/works/[slug]` 与 `/works/[slug]/chapters/[chapterSlug]`，fixture published 内容继续可读。
- Local Supabase reset 与扩展后的 Phase 2 SQL suite 再次真实通过，覆盖 Reader 拒绝发布、owner 发布 draft、空作品首章创建后发布以及 Reader published-only 计数变化。
- Sprint 002F 全仓 lint、typecheck、测试与 Web production build 通过。
- Sprint 002G 已完成 Public Reading 收口：`/articles/[slug]` 现已切换到与 Work/Chapter 一致的 hybrid published gateway。
- Reader 公共读取统一遵循“数据库 published 优先、fixture published 回退”，draft Work、Chapter、Article 均不会泄漏到公开页面。
- Sprint 002G 全仓 lint、typecheck、测试与 Web production build 通过；本 Sprint 无数据库侧变更，因此沿用 Sprint 002F 最近一次真实 Runtime Validation。
- Sprint 002H 已完成 Bookshelf / Library：`/works` 现在作为 Reader Library Hub，整合了继续阅读、最近书签、本地书架摘要与 published 内容浏览。
- `/archive` 继续保持本地书签与最近阅读详情页；`/works` 与 `/archive` 形成“浏览入口 + 回访详情”双入口结构。
- Sprint 002H 新增客户端筛选与 Library 纯逻辑测试；全仓 lint、typecheck、测试与 Web production build 通过。
- Phase 2 人工验收发现的注册 P0 已修复：注册改为注册名、至少 8 位密码和邀请码，登录改为注册名与密码，不再要求或发送邮箱验证。
- `profiles.registration_name` 作为大小写不敏感唯一的站内身份标识；Auth metadata 只承载注册事务输入，不作为会话权限或角色事实源。
- Auth 用户创建 Trigger 在同一事务校验并锁定邀请码，创建 Profile、active Membership、Redemption 与审计记录；失败会回滚 Auth 用户。
- 2026-07-02 本地 Supabase 从零重建、三套 SQL 脚本、真实 Auth 注册/登录、lint、typecheck、完整 Vitest 与 Web/Admin/Docs production build 全部通过。
- Phase 2 Product Handoff 已生成，包含启动方式、入口、QA 账号、路由、建议验收流程、已知限制与人工验收记录。
- 当前本地 Supabase 已准备 `Phase2Reader`、`Phase2Author` 与 QA 邀请码；两组账号通过 Auth API 登录验证，数据库重置后失效。
- Product Owner 已使用远程注册账号 `Auther001` 完成注册名 + 密码登录，并在手工 Author grant 后成功进入 Studio。
- Phase 2 Auth P0 已解除，Phase 2 人工验收状态为 Pass。
- Product Owner 于 2026-07-02 将 Phase 3 调整为 V1 Fast Launch Strategy。
- Phase 3 已重组为 Phase 3A Beta Blocking、Phase 3B Beta Operations 与 Phase 3C
  Beta Polish；原 Sprint 3.10 已迁为独立 Release Readiness `RR-1`。
- 新增 `3B-3 Invitation Relationship`，仅提供 Table、Tree Table 或简单
  Parent / Child 邀请关系，不包含复杂可视化或统计平台。
- Phase 3 Sprint Plan、Phase 文档和 Roadmap 已完成规划同步；未修改业务代码，
  未开始任何 Sprint。
- Product Owner 于 2026-07-02 批准 Mission Authorization v1，并一次性授权
  Mission 3A 的 3A-0、3A-1、3A-2 与必要时的 3A-3。
- Mission 3A 已完成环境与质量门禁、9/9 远程 Migration 对齐、Auth 配置验真、
  远程注册/登录/Studio/Create/Save/Publish/Read、未登录与 Reader 权限拒绝、
  390×844 移动端 QA。
- 全仓格式 P0 已修复；`pnpm validate`、本地 Supabase reset、三套 SQL suite、
  Web/Admin/Docs build 与浏览器回归通过。
- Mission 3A 工程范围内当前 P0 为零。
- Product Owner 于 2026-07-02 确认：`Mission 3A. PASS`。
- Product Owner 已授权并完成 Mission 3B：公开作者主页、Follow / Unfollow 与
  Invitation Relationship Foundation。
- 新增公开作者身份隔离、幂等关注关系、own-only 邀请关系摘要与 published-only
  作者作品读取；未引入通知、推荐、动态流或新的权限模型。
- 本地 10 条 Migration 从零重建、Mission 3B SQL、全仓 Validation 与 Browser QA
  通过；远程第 10 条 Migration 已应用并与本地 10/10 对齐。
- Phase 3 验收修复已补齐公开作者入口、作者作品、全站登录状态、作者信息、TXT 下载及真实 Studio Draft / Published 列表。
- Studio 已开放授权范围内的 Chapter 列表、新建、标题/正文编辑、保存、发布选择和标签关联编辑。
- 新增最小只读 `get_published_work_authors` RPC；仅返回 Published Work 的 `work_slug`、有效 Author `author_slug` 与 `display_name`。
- 第 11 条 Migration 已部署远程，本地/远程 11/11 对齐；远程 RPC HTTP 200。
- `/studio/works` 验收阻塞根因为 Repository 过滤不可读的 `owner_user_id`，导致 PostgreSQL column privilege 错误。
- 新增 authenticated-only `list_my_studio_works` 与 `get_my_studio_work`，只返回 active Author 自有 Draft / Published Work，不暴露 `owner_user_id`。
- 第 12 条 Migration 已部署远程，本地/远程 12/12 对齐；匿名远程调用被 HTTP 401 拒绝。
- Product Owner 于 2026-07-03 完成最终浏览器验收并确认 `Mission 3B. PASS`。
- Create Work、Save Draft、Publish、Reader 回读、Author Public Profile、Published
  Only、Draft 隔离、Follow / Unfollow、登录回跳、Invitation Relationship 与移动端
  基础布局全部通过。
- 验收期间发现的发布链路与 Studio owner-read 问题已修复并复验，不再构成阻塞。
- 2026-07-03 再次执行 `pnpm validate` 通过；本地数据库与远程数据库均为 12/12
  Migration，当前已知 P0 为零。
- Mission 3C-1 新增公开 `/search`、GET URL 参数同步、Published Work 标题/Slug
  与公开 Author 名称/Slug 搜索，以及初始、Empty、Loading、Error 状态。
- Search RPC 只返回 Published Work 与既有公开 Author 字段；Draft、私有 owner、
  注册身份和正文不进入结果，未修改 RLS、Permission Model 或 Auth。
- 本地第 13 条 Migration 从零应用和 Search SQL 通过；远程部署后本地/远程
  13/13 对齐，匿名 RPC HTTP 200。
- `pnpm validate`、桌面与 390px Browser QA 通过；浏览器 Error 为 0。
- Product Owner 于 2026-07-03 完成 Search、Published Work / Slug、Author /
  Author Slug、Draft 隔离、URL、状态、响应式、Accessibility 与 Console 人工验收，
  确认 `Mission 3C-1. PASS`。
- Mission 3C-2 已完成公开 `/archive`、Published Works 分页、最新/最早/标题排序、
  `page` / `sort` URL 恢复、越界页纠正及 Empty / Loading / Error 状态。
- Browse RPC 仅返回 Published Work 与既有公开 Author 字段，Draft、owner 与注册身份
  不进入结果；未修改表结构、RLS、Permission Model 或 Auth。
- 本地从零重建与 Browse SQL 通过；第 14 条 Migration 已部署远程，本地/远程
  14/14 对齐，匿名 RPC HTTP 200。
- `pnpm validate`、桌面与 390px Browser QA 通过；162 项测试通过，Console Error
  为 0，P0 为 0。
- Mission 3C-3 已完成 `sitemap.xml`、`robots.txt`、站点级 Metadata、Canonical、
  Open Graph，以及 Archive、Search、Author 与 Published Work 页面 Metadata。
- Sitemap 只包含 Published Works 与其公开 Author；Draft 直接访问输出
  `noindex, nofollow`，Studio 私有路由同样保持不可索引。
- 未新增 Migration、RLS、权限模型、第三方依赖或架构；本地/远程 Migration
  继续为 14/14 对齐。
- `pnpm validate`、桌面与 390px Browser QA 通过；167 项测试通过，Console Error
  为 0，P0 为 0。
- Product Owner 于 2026-07-04 完成 Mission 3C-3 最终人工验收并确认 PASS；
  Sitemap、Robots、Published-only、Author / Work 收录、Metadata、Canonical、
  Open Graph、Draft noindex、Browser QA、Console 与 Responsive 全部通过。
- Mission 3C-3 正式关闭；Mission 3A、Mission 3B 与 Mission 3C 均已完成验收，
  Phase 3 状态为 Completed（Product Owner Accepted）。
- Mission RR-1A 已完成 Runtime、Migration、Validation、Build、Documentation 与
  Project Structure Audit，并建立 Release Checklist 与 Browser QA Checklist。
- 本地 Supabase 已从零应用 14 条 Migration；六套 SQL、local schema lint 与
  Local / Remote 14/14 parity 通过。
- `pnpm validate` 全绿，167 项测试及 Web / Admin / Docs build 通过；P0 为零。
- Known Issues 已按 RR-1B、RR-1C、Go / No-Go 产品决策、Beta 限制与未来功能分类。
- Mission RR-1B 已完成 Production Deployment 并通过 Product Owner 最终人工验收。
- Production URL、HTTPS、Environment Variables、Production Build、首页、Archive、
  Search、Author、Published Work、`/sitemap.xml`、`/robots.txt`、Metadata、
  Canonical、Open Graph、Browser Smoke、Console、Network 与 Responsive Layout
  均通过验收。
- Mission RR-1B 正式关闭；随后 RR-1C Release Candidate 已获授权并完成工程收口。
- Mission RR-1C 已完成 Final Runtime Audit、Final Validation Audit、Final Browser
  QA、Final Mobile QA、Final Documentation Audit、Final Known Issues Review、Final
  Release Checklist 与 Beta Ready Checklist。
- 本地 Supabase clean rebuild 从零应用 14 条 Migration；本地/远程 Migration
  history 14/14 对齐；六套 SQL suites 与 local schema lint 通过。
- `pnpm validate` 全绿，167 项测试及 Web / Admin / Docs build 通过；P0 为零。
- 桌面与 390×844 移动端 QA 均通过；未登录正文与 Studio 守卫符合当前权限模型。
- Product Owner accepted Release Candidate baseline 为
  `8495bded5e0c78985be7410cceb902cd2c090421`。
- RR-1C 最终验收发现 local clean rebuild 后 Auth Users 为空；localhost-only
  QA Fixture 已完成工程修复，能够幂等恢复 Reader、Author、active Membership、
  Author grant/profile 与 Invitation Redemption。
- Fixture clean rebuild recovery、Reader/Author 登录、Reader Access、Author Public
  Profile、Author Studio 与 Reader Studio 拒绝路径已通过浏览器验证，Console Error 为 0。
- Product Owner 于 2026-07-11 完成最终人工验收并确认 Mission RR-1C PASS。
- QA Fixture 验收完成；Author / Reader 权限链路人工验证通过。
- Reader 访问 `/studio` 自动重定向 `/archive`；Release Candidate 达到 Beta Ready。
- Product Owner accepted Release Candidate baseline:
  `8495bded5e0c78985be7410cceb902cd2c090421`。

## 当前 Production Deployment Review blockers

- PRC-01 已关闭；PRC-02 至 PRC-06 已 `CLOSED FOR PREPARATION`。Production Preparation 已完成，但当前 Production Deployment Review=`BLOCKED`；这不改变 Product P0 / P1 = `0 / 0`，也不授权部署。
- PRC-02：Product Owner 已确认 Production Project、`main`、Vercel 默认 Domain / HTTPS 与三个 Production 环境变量名；未部署或输出变量值。
- PRC-03：Product Owner 已批准规模、SLO、RPO / RTO、事故时限、责任人、监控与条件备份方案；套餐确认和必要的手动导出仍是上线前执行项。
- PRC-04：18+、仅限邀请的最终版本化政策文档与 Web `/legal` 已完成；PDR-01=`CLOSED FOR DEPLOYMENT`。
- PRC-05：回滚 / Smoke 方案已批准；上一稳定 Production Deployment ID 须在 rollout 前记录，Smoke 仅可在获批部署后执行。
- PRC-06：治理责任与应急路径已批准；任何实际 break-glass 或权限操作仍须逐次授权，本 Mission 未执行。
- PDR-01：`CLOSED FOR DEPLOYMENT`；最终政策文档、`/legal`、注册入口和本地验证均已完成，Production URL 留待部署后 Smoke。
- PDR-02：Supabase 套餐未确认；Physical backups 无记录、PITR 关闭且没有手动导出证据。
- 首次 Production deployment 尚不存在，记录为 `FIRST_PRODUCTION_DEPLOYMENT_PENDING`；Production Smoke 保持 `NOT RUN`。

- Phase 2 当前无 P0 阻塞。
- Mission 3A 无剩余工程 P0，Beta Blocking 已解除。
- Mission 3B 已正式关闭，无已知工程 P0。
- Mission 3C-1 已正式关闭，无已知工程 P0。
- Mission 3C-2 已正式关闭，无已知工程 P0。
- Mission 3C-3 已正式关闭，无已知工程 P0。
- Phase 3 已完成 Product Owner 验收，无剩余 Phase 3 阻塞。
- Mission RR-1A 发布准备基线已完成。
- Mission RR-1B 已正式关闭，无已知工程 P0。
- Mission RR-1C 已正式关闭，无已知 P0；Release Candidate 为 Beta Ready。
- KI-018 Release Candidate Git 基线已由 RR-1C 处理。
- KI-027 Moderate PostCSS advisory、KI-029 CI 缺口与 KI-030 Supabase dry-run
  临时角色认证已作为 Beta accepted risks 分类，需在后续 Go / No-Go 或未来数据库部署前复核。

## Product Owner 人工验收结论

- Phase 2：Pass。
- 作者后台与读者后台已手动检查，暂未发现其他明显问题。
- 同一远程验收环境已完成：九条 Migration → Email Confirm 关闭 → 真实注册 → 注册名/密码登录 → 手工 Author grant → 成功进入 Studio。
- Phase 2 Auth P0 已解除。
- Product Owner 已批准 Phase 3 Fast Launch 治理方向和文档更新。
- Mission 3C-1、3C-2、3C-3 均已完成 Product Owner 验收，Mission 3C 正式关闭。
- Mission 3A：PASS。
- Mission 3B：PASS — Product Owner Accepted（2026-07-03）。
- Mission 3C-1：PASS — Product Owner Accepted（2026-07-03）。
- Mission 3C-2：PASS — Product Owner Accepted（2026-07-03）。
- Mission 3C-3：PASS — Product Owner Accepted（2026-07-04）。
- Phase 3：Completed — Product Owner Accepted（2026-07-04）。
- Mission RR-1A：Release Preparation Baseline Complete。
- Mission RR-1B：PASS — Product Owner Accepted（2026-07-07）。
- Mission RR-1C：PASS — Product Owner Accepted / Beta Ready（2026-07-11）。
- Mission RR-1C QA Fixture：PASS — Product Owner Accepted（2026-07-11）。
- UX-06F Author Profile Track：PASS — Product Owner Final Accepted（2026-07-14）。
- Phase 1 的数据库实测与产品验收记录仍需在独立流程中补齐，但不阻塞 v0.1 文档归档。
- 已登录 Author / Reader 的远程浏览器主链路已由 Product Owner 完整复验通过。

## 未完成

- Create/Edit Article、Work/Chapter Delete 与 Rich Text Editor。
- Revision 与状态机。
- 将 Reader fixture `ContentStore` 替换为真实 Supabase Repository（待 Sprint 002A 数据库实测恢复后另行批准）。
- 章节发布选择与标签替换的原子 RPC（本 Mission 未获授权）。
- 实现 Reader 登录流与 Dashboard 实时数据。

## 下一步

- Product Owner 审阅 `V1-SUPABASE-BACKUP-EVIDENCE.md`；PDR-01 / PDR-02 均已关闭，不进入重复 Finalization。
- 通过独立 RC Baseline Refresh Mission，只纳入最终政策、Web `/legal`、注册入口、SEO 与获批 Release / 备份证据，继续排除冻结 `/access` Admin 改动。
- 对新候选运行完整验证并记录不可变 RC SHA；重新执行只读 Production Deployment Review，PASS 前不要授权 Deployment Mission。
- 7 天 Production Observation Window 期间至少每天执行一次仓库外受控逻辑导出；恢复必须独立授权，不得在 Production 上试恢复。
- 保持 `FIRST_PRODUCTION_DEPLOYMENT_PENDING` 与 Production Smoke=`NOT RUN` 的真实状态，禁止虚构 Deployment ID 或提前运行 Smoke。
- 未获明确授权前不创建 Git tag、不部署、不绑定域名、不创建账号、不发送邀请码、不修改角色、数据库、Auth、RLS、RPC、Migration、Vercel 或 Admin 实现。

## 最后更新

2026-07-16

- UX-06H Step04 Homepage Release Acceptance Slim completed against the frozen Step01–Step03 baseline.
- Step01 Audit Contract、Step02 Layout Upgrade and Step03 Slim QA are PASS.
- Quiet Editorial Harbor Entrance、five-region structure、entry / role / isolation、responsive / theme / accessibility evidence are frozen as the final Release baseline.
- Shared Header / Footer、Root Loading / Error Frozen boundary、Auth / Permission / Invitation / login return and data contracts remain unchanged.
- HP-AUDIT-007 remains Frozen；HP-QA-001 remains non-blocking；the stale chunked-cookie warning has no actual functional impact.
- P0 = 0、P1 = 0；Step04 product implementation and data layer changes = NONE.
- Web checks、full `pnpm validate`、167 / 167 tests、all production builds and diff checks pass.
- Homepage Ready for Release = YES；awaiting Product Owner Final Review，and no new UX Track is authorized.

- UX-06H Step03 Homepage States & Responsive QA Slim completed under the UX closure slim mode.
- Five-region rhythm、entry smoke、Guest / Reader / Author、Author Header Studio capability、Published-only and Draft isolation pass.
- 1440 / 1280 / 768 / 390、Light / Dark、44px targets、focus、semantics、zero overflow and browser console 0 pass.
- HP-AUDIT-007 remains Frozen；HP-QA-001 remains non-blocking；the stale chunked-cookie warning was not reproduced and did not affect actual behavior.
- P0 = 0、P1 = 0、Step02 regression = 0；no Allowed Fix was needed，product implementation and data layer changes = NONE.
- Web checks、full `pnpm validate`、167 / 167 tests、all production builds and diff checks pass.
- Homepage Ready for Step04 = YES；awaiting Product Owner review，and UX-06H Step04 is not authorized.

- UX-06H Step02 Homepage Layout Upgrade completed within the frozen Step01 contract.
- Homepage now follows Brand Orientation → Discovery Paths → Latest Published Works → Reader Return / Access → Quiet Recovery.
- Static Reader Login and misleading `/author` entry were removed；Archive / Search hierarchy、neutral Auth paths、single Work Detail entry、Empty recovery、44px targets and long-content protection are complete.
- Existing Public Browse Gateway、newest / three-item limit、BrowseWork、Auth / Permission、Published-only and Draft isolation remain unchanged.
- Guest / Reader / Author、routes、Draft Work / Chapter isolation、1440 / 1280 / 768 / 390、Light / Dark、focus、semantics、zero overflow and console 0 pass.
- HP-AUDIT-001–006 / 008–009 are Closed；007 remains a frozen shared-state boundary；010 protection passes；HP-QA-001 is non-blocking.
- Web checks、full `pnpm validate`、167 / 167 tests、all production builds and diff checks pass.
- Homepage Layout Ready for Step03 = YES；awaiting Product Owner review，and UX-06H Step03 is not authorized.

- UX-06H Step01 Homepage UI Audit & Design Contract completed as a documentation-only Mission.
- Homepage is frozen as the Quiet Editorial Harbor Entrance with Brand Orientation → Discovery Paths → Latest Published Works → Reader Return / Access → Quiet Recovery.
- Default、Archive / Search / Work / Auth、Guest / Reader / Author、Published-only、Draft isolation、1280 / 390、Light / Dark and console 0 pass.
- Web checks、full `pnpm validate`、167 / 167 tests、all production builds and diff checks pass.
- HP-AUDIT-001–010 record P2 presentation / shared-state boundaries；P0 = 0，P1 = 0.
- Product implementation、data fetch、Auth、Permission、Gateway、Service、Repository、query and database contracts remain unchanged.
- Homepage Ready for Step02 = YES；awaiting Product Owner review，and UX-06H Step02 is not authorized.

- Product Owner accepted UX-06G Step01–Step04 and closed the Work Detail Track with Work Detail Ready for Release = YES.

- UX-06G Step04 Work Detail Release Acceptance completed against the frozen Step01–Step03 baseline.
- Step01 / Step02 / Step03 are PASS and frozen as the final Work Detail Release baseline.
- Literary Work Decision Space、six-region structure、states、roles、reading entries、routes、Published-only、Draft isolation、viewports、themes and accessibility pass.
- `reading-history-client.tsx` remains presentation-only for Work Continue Reading；history data logic and Reading are unchanged.
- WD-AUDIT-001 / 009 remain accepted frozen boundaries；WD-AUDIT-010 passes；WD-QA-001 remains non-blocking；P0 / P1 and remaining product issues are zero.
- Step04 changed documentation only；Web checks、full validation、167 / 167 tests、all builds and diff checks pass.
- Work Detail Ready for Release = YES；awaiting Product Owner final review，and no new UX Track is authorized.

- UX-06G Step03 Work Detail States & Responsive QA completed against the frozen Step02 baseline.
- Six-region structure、default / no-chapter / Loading / Error contract / Not Found、Start / Continue / Download and recovery paths pass.
- Guest / Reader / Author、Auth / Permission frozen boundary、Published-only and Draft Work / Chapter isolation pass.
- 1440 / 1280 / 768 / 390、Light / Dark、44px targets、semantics、focus-visible、zero overflow and browser console 0 pass.
- `reading-history-client.tsx` remains presentation-only for Work Continue Reading；history data logic、selection and Reading are unchanged.
- WD-AUDIT-001 / 009 remain accepted boundaries；WD-AUDIT-010 passes；WD-QA-001 remains non-blocking；P0 / P1 and Step02 remaining product issues are zero.
- Step03 changed documentation only；Web checks、full validation、167 / 167 tests、all builds and diff checks pass.
- Work Detail Ready for Step04 = YES；awaiting Product Owner review，and UX-06G Step04 is not authorized.

- UX-06G Step02 Work Detail Layout Upgrade completed within the frozen Step01 contract.
- Work Detail now follows Work Orientation → Story Premise → Author / Published Context → Reading Decision → Chapter Overview → Recovery.
- Guest / Reader / Author、cross-route entries、Start / Continue / Download、Published-only and Draft isolation pass.
- Default、No Chapters、Loading、Not Found、1440 / 1280 / 768 / 390、Light / Dark、44px targets、zero overflow and browser console 0 pass.
- WD-AUDIT-002–008 are closed for presentation；WD-AUDIT-001 / 009 remain accepted boundaries；WD-QA-001 is a non-blocking Fixture enhancement.
- Step02 changed Work Detail route-local UI only；data、Auth、Permission、Gateway、Service、Repository、query and Reading behavior are unchanged.
- Web checks、`pnpm validate`、167 / 167 tests、all production builds and diff checks pass；Work Detail Layout Ready for Step03 = YES.
- Awaiting Product Owner review；UX-06G Step03 is not authorized.

- UX-06G Step01 Work Detail UI Audit & Design Contract completed as a documentation-only Mission.
- Work Detail is frozen as a Literary Work Decision Space between discovery and Reading.
- Archive / Search / Author Profile entries、Author / Reading exits、Guest / Reader / Author、Published-only and Draft isolation pass.
- 1280 / 390 zero overflow、semantic structure and browser console 0 pass；P0 = 0，P1 = 0，WD-AUDIT-001–010 are P2 findings.
- Step01 changed no product implementation、data、Auth、Permission、Gateway、Service、Repository or query contract.
- Web checks、`pnpm validate`、167 / 167 tests、all production builds and diff checks pass；Work Detail Ready for Step02 = YES.
- Awaiting Product Owner review；UX-06G Step02 is not authorized.

- Product Owner accepted UX-06F Step01–Step04 and closed the Author Profile Track with Ready for Release = YES.

- UX-06F Step04 Author Profile Release Acceptance completed against the frozen Step01–Step03 baseline.
- Final positioning、structure、states、roles、Follow restoration、routes、Published-only、Draft isolation、viewports、themes and accessibility pass.
- Browser console errors are zero；P0 / P1 and Author Profile product P2 / post-Beta findings are zero.
- AP-QA-001 remains only a non-blocking extreme-content QA Fixture enhancement.
- Step04 changed no product implementation、Follow business、data contract、permission or data layer.
- Web checks、`pnpm validate`、167 / 167 tests、all production builds and diff checks pass；Author Profile Ready for Release = YES.
- Awaiting Product Owner final review；no next UX Track is authorized.

- UX-06F Step03 Author Profile States & Responsive QA completed against the frozen Step02 baseline.
- Guest、Reader followed / unfollowed / pending、Author self、cross-page routes、Published-only and Draft isolation pass.
- Real Profile-shaped Loading、Empty / Error contracts、four viewports、themes、focus、44px targets and console 0 pass.
- AP-QA-001 remains a non-blocking extreme-content Fixture enhancement；no product P2 / post-Beta finding remains.
- Step03 changed no product implementation、Follow business、data contract、permission or data layer.
- Web checks、`pnpm validate`、167 / 167 tests、all production builds and diff checks pass；Author Profile Ready for Step04 = YES.
- Awaiting Product Owner review；UX-06F Step04 is not authorized.

- UX-06F Step02 Author Profile Layout Upgrade completed within the frozen Step01 contract.
- Public identity、bio and Published Works now lead；relationship and counts remain supporting.
- 44px Work entries、publishedAt、recovery、Profile-shaped Loading and single-owner Error are implemented route-locally.
- Roles、cross-page routes、Published-only、Draft isolation、four viewports、themes、focus and console 0 pass.
- Product changes are limited to Author Profile UI；data、permission、Follow business and contracts remain unchanged.
- Web checks、`pnpm validate`、167 / 167 tests、all production builds and diff checks pass；Author Profile Layout Ready for Step03 = YES.
- Awaiting Product Owner review；UX-06F Step03 is not authorized.

- UX-06F Step01 Author Profile UI Audit & Design Contract browser audit completed.
- Public identity、bio、Follow / self states、Published Works、cross-page routes、roles and Draft isolation pass.
- 1280 / 390 are zero overflow and browser console errors are zero；10 P2 findings recorded，P0 / P1 are zero.
- Product implementation and all data / permission / Follow contracts remain unchanged.
- Web checks、`pnpm validate`、167 / 167 tests、all production builds and diff checks pass；Author Profile Ready for Step02 = YES.
- Awaiting Product Owner review；UX-06F Step02 is not authorized.

- Product Owner completed final acceptance of UX-06E Search Track with PASS.
- Step01 / Step02 / Step03 / Step04 are all Accepted；Search Ready for Release = YES.
- P0 / P1 are zero，all findings are closed，and Search P2 / post-Beta risk is zero.
- UX-06E is Completed / Closed；no Search optimization or next UX Track is authorized.

- UX-06E Step04 Search Release Acceptance final browser QA completed.
- Step01 / Step02 / Step03 are PASS and frozen as the Release baseline.
- All states、GET q contract、four viewports、themes、accessibility、roles、Published-only、Draft isolation and routes pass with zero clean-session console errors.
- All Search findings remain closed；P0 / P1 are zero，and Step04 changed no product implementation.
- Web checks、`pnpm validate`、167 / 167 tests、all production builds and diff checks pass；Search Ready for Release = YES.
- This pending decision was subsequently resolved by Product Owner Final Acceptance：PASS.

- UX-06E Step03 Search States & Responsive QA browser verification completed.
- Initial / Query / Empty / Invalid / Loading / Error / Results、four viewports、themes、roles、Published-only and Draft isolation pass.
- Fixed one route-local Error clear recovery issue in `search/error.tsx`；data、permission and query contracts remain unchanged.
- Web checks、`pnpm validate`、167 / 167 tests and all production builds pass；P0 / P1 are zero and Search Ready for Step04 = YES.
- UX-06E Step04 is not authorized.

- UX-06E Step02 Search Layout Upgrade completed within the frozen Step01 contract.
- Route-local Search hierarchy、Work / Author presentation、states、44px targets and responsive behavior are upgraded.
- Guest / Reader / Author、Published-only and Draft isolation browser QA pass with zero console errors.
- `pnpm validate`、167 / 167 tests and all production builds pass；Search Layout Ready for Step03 = YES.
- Product implementation changed only in Search presentation；data、permission and query contracts remain unchanged.
- Awaiting Product Owner review；UX-06E Step03 is not authorized.

- UX-06E Step01 Search UI Audit & Design Contract completed as documentation-only work.
- Search / Archive boundary, input, Work / Author results, states, responsive and accessibility contracts are recorded.
- Product implementation and Search data / permission contracts remain unchanged.
- Search Ready for Step02 = YES；awaiting Product Owner review，Step02 is not authorized.

- Product Owner confirmed Mission RR-1C PASS.
- QA Fixture and Author / Reader permission chains are accepted.
- Reader `/studio` redirects to `/archive`; Release Candidate is Beta Ready.
- Mission RR-1C is formally closed; no next Mission or release action is authorized.

- RR-1C local QA Fixture repair engineering complete.
- Local clean rebuild recovery, Reader/Author login and permission Browser QA pass.
- Credentials remain in a Git-ignored mode-0600 local file; no production change.

- Mission RR-1C Release Candidate engineering complete.
- Final Runtime, Migration, SQL, Validation, Browser QA, Mobile QA and
  Documentation audits pass with P0 at zero.
- Product Owner accepted Release Candidate baseline:
  `8495bded5e0c78985be7410cceb902cd2c090421`.
- Beta Ready Checklist and Release Candidate Report are created.
- Mission RR-1C is Product Owner Accepted and closed.

2026-07-07

- Product Owner confirmed `Mission RR-1B. PASS` after final Production
  Deployment acceptance.
- Accepted Production URL, HTTPS, Environment Variables, Production Build, Home,
  Archive, Search, Author, Published Work, Sitemap, Robots, Metadata, Canonical,
  Open Graph, Browser Smoke, Console, Network and Responsive Layout.
- Mission RR-1B is formally closed. RR-1C Release Candidate remains unauthorized
  and unstarted.

2026-07-04

- Mission RR-1A Release Preparation engineering completed with Runtime,
  Migration, Validation, Build, Documentation and Project Structure audits.
- Clean local rebuild, six SQL suites, local schema lint, local/remote 14/14
  migration parity and `pnpm validate` pass with P0 at zero.
- Release and Browser QA checklists are established; Known Issues are classified.
- RR-1A established the preparation baseline; RR-1B was later accepted and RR-1C
  remains unstarted.

- Product Owner confirmed `Mission 3C-3. PASS` after final Sitemap, Robots,
  Published-only, Author/Work inclusion, metadata, canonical, Open Graph,
  Draft-noindex, responsive, browser and clean-console acceptance.
- Mission 3C-3 and Mission 3C are formally closed. Phase 3 is Completed —
  Product Owner Accepted.
- RR-1 remains unauthorized and unstarted.

- Mission 3C-3 SEO Foundation engineering completed with sitemap, robots,
  canonical URLs, Open Graph and route-specific public metadata.
- Sitemap and metadata reuse existing Published-only read boundaries; Draft and
  Studio routes are noindex. No migration or permission change was introduced.
- Local/remote Migration histories remain 14/14 aligned; full validation and
  desktop/390px Browser QA pass with 167 tests, zero console errors and P0 at zero.
- Mission 3C-3 now awaits Product Owner acceptance; RR-1 was not started.

- Product Owner confirmed `Mission 3C-2. PASS`; Browse Experience is accepted
  and formally closed.
- Archive, Published-only isolation, pagination, four sorts, URL restoration,
  boundary correction, all page states, responsive layout, accessibility,
  Browser QA and clean console were accepted.
- Mission 3C-3 is named SEO Foundation and remains unauthorized and unstarted.

- Mission 3C-2 Browse Experience engineering completed with public
  published-only Archive pagination, deterministic sorting and shareable URL
  state.
- Local/remote Migration histories are 14/14 aligned; full validation and
  desktop/390px Browser QA pass with P0 at zero.
- Mission 3C-2 was subsequently accepted; Mission 3C-3 was not started.

- Product Owner confirmed `Mission 3C-1. PASS`; Search MVP is accepted and closed.
- Mission 3C-2 was subsequently authorized under its approved Browse Experience brief.

- Mission 3C-1 Search MVP engineering completed with public Published Work and
  Author title/name/slug matching, URL synchronization and complete page states.
- Local/remote Migration histories are 13/13 aligned; full validation and
  desktop/390px Browser QA pass with P0 at zero.
- Mission 3C-2 is Product Owner accepted and closed.

- Product Owner confirmed `Mission 3B. PASS`; Mission 3B is accepted and closed.
- Final validation passes, P0 is zero, and local/remote Migration histories are
  12/12 aligned.
- `main` and `origin/main` point to the same commit, while the accepted Phase 2
  through Mission 3B implementation remains uncommitted under KI-018.
- Mission 3C startup check is complete. Its existing Roadmap scope is Level 2;
  development remains prohibited until formal authorization.

- Phase 3 Reader / Author Studio acceptance fixes engineering complete.
- Remote and local migration histories are 12/12 aligned; the public Author and
  owner-scoped Studio read RPCs are deployed.
- Product Owner browser acceptance completed and passed on 2026-07-03.

- Mission 3B Social Relationship Foundation engineering completed.
- Added public Author Profile, idempotent Follow / Unfollow and own-only
  Invitation Relationship summary contracts.
- Local rebuild, SQL Runtime, full `pnpm validate`, Browser QA and remote 10/10
  Migration parity passed.
- Mission 3B now waits for one Product Owner acceptance; Mission 3C and RR-1 were
  not started.

- Product Owner updated Phase 3 governance to the V1 Fast Launch Strategy.
- Reorganized the roadmap into Phase 3A Beta Blocking, Phase 3B Beta Operations,
  Phase 3C Beta Polish and independent Release Readiness.
- Renumbered current references to `3A-*`, `3B-*`, `3C-*` and `RR-1`, with legacy
  number mapping preserved in the Fast Launch plan.
- Added planned `3B-3 Invitation Relationship`.
- No Sprint was started and no business code was changed.

- Product Owner accepted Sprint 002C-Step03 on 2026-07-01.
- `/studio/articles/[articleId]` read-only Article Detail passed engineering acceptance; owner ID comes only from `TrustedAccessContext.identity.id`, while other-author and unknown article IDs return Not Found.
- Reader remains published-only and every article write entrypoint remains disabled.
- Full workspace lint/typecheck, 55/55 Vitest tests and Web production build pass.
- package.json, pnpm-lock.yaml and Supabase configuration remain unchanged; Supabase was not executed and DB Runtime remains pending.
- Sprint 002C-Step04 engineering implementation completed with explicit Studio empty, Not Found, no-chapter and draft-only chapter states plus safe recovery navigation.
- Full workspace lint/typecheck, 58/58 Vitest tests and Web production build pass; Reader remains published-only and all write entrypoints remain disabled.
- Product Owner accepted Sprint 002C-Step04 on 2026-07-01 after the empty/error/boundary-state review and forced verification passed.
- Sprint 002C-Step05 Freeze & Handoff is complete; Sprint 002C is frozen and can be formally closed.
- Sprint 002D-Step01 Create Work UI Shell engineering implementation is complete with client-only validation, fixture metadata and disabled save/publish actions.
- Product Owner authorized Sprint 002D-Step02 Create Work Draft Persistence and the minimal V1 taxonomy/RPC Level 3 changes.
- Step02 engineering now includes database-backed metadata reads and atomic draft persistence; Publish remains disabled.
- Full workspace lint/typecheck, 74/74 Vitest tests and Web production build pass.
- Local Supabase rebuild, all six Migrations, V1 taxonomy idempotence and the full Phase 2 transactional SQL suite pass.
- Sprint 002D-Step02 and Sprint 002A database validation are Accepted; Runtime Pending is removed.
- Sprint 002E-Step01 Minimal Draft Editor read contract and UI shell are engineering complete; full verification is recorded in the Sprint document.
- Sprint 002E-Step02 Draft Body Save is complete: owner Authors can save draft body content into the first Chapter, first save creates a default Chapter, Publish remains disabled, and no new RPC/schema/RLS change beyond the minimal Chapter body grant was introduced.
- Full workspace lint/typecheck, 86/86 Vitest tests, Web production build, local Supabase migration reset and the Phase 2 SQL suite pass on the current files.
- Sprint 002F Minimal Publish Workflow is complete: owner Authors can publish their own draft Work from the draft editor, Reader can immediately read the published chapter page, and the existing published-only contract remains intact.
- Full workspace lint/typecheck, full Vitest, Web production build, local Supabase reset and the extended Phase 2 SQL suite pass on the current files.
- Sprint 002G Public Reading is complete: `/articles/[slug]` now uses the same hybrid published gateway as the Work routes, Reader public reads consistently prefer database-backed published content, and draft content remains isolated.
- Full workspace lint/typecheck, full Vitest and Web production build pass on the current files; no new database-side validation was required because 002G introduced no Migration, RPC, RLS or schema change.
- Sprint 002H Bookshelf / Library is complete: `/works` now acts as the Reader Library Hub with local shelf summaries, continue-reading, latest-bookmark shortcuts and minimal client-side filtering over published content.
- Full workspace lint/typecheck, full Vitest and Web production build pass on the current files; no new database-side validation was required because 002H introduced no Migration, RPC, RLS or schema change.
- UX-06C Step 02 is Product Owner accepted and formally closed. Step 03 remains unauthorized.
- Chapter Reading now combines the accepted responsive typography rhythm with progressive disclosure: the complete existing settings controls are hidden by default behind one accessible `Aa / 阅读设置` entry.
- Reader preference values、local storage、theme behavior、published-only access、navigation、history and bookmark contracts remain unchanged.
