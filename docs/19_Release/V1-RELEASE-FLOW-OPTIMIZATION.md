# Fandom Harbor V1 Release Flow Optimization

状态：PRODUCTION READINESS REVIEW PASS / READY WITH CONDITIONS / DEPLOYMENT NOT AUTHORIZED
日期：2026-07-15
变更类型：Release evidence closeout documentation

## 0F. V1 Production Preparation

Production Preparation 尚未全部关闭：PRC-01 已通过 RC Baseline Closeout Mission 关闭；PRC-02 至 PRC-06 仍为 `BLOCKED`，没有 Product Owner 逐项 `ACCEPTED RISK`。

- RC：`codex/v1-production-rc` 已从 `903bf70` 建立；RC commit 只包含已验收 Reading 与 Release 文档，冻结 `/access` Admin 改动被排除。
- Production 配置：Web Project / Root Directory / Framework 正常；Production 变量为 0，正式域名为 0，正式 URL / HTTPS 未建立。
- 运维：linked Supabase active healthy 且 Migration 14 / 14；预算、套餐、RPO / RTO、备份恢复演练、监控和值班责任未批准。
- 法律 / 数据：KI-004、KI-005、KI-012 仍 Open，最低 Privacy / Terms / Content / Data / Takedown 政策未发布。
- 回滚 / 治理：上一稳定 Git baseline 可固定为 `903bf70`，但当前 RC SHA、Production Deployment ID、实名回滚 / 治理联系人和无 Admin Preview 时的应急路径未固定。

详细记录见 [`V1-PRODUCTION-PREPARATION.md`](./V1-PRODUCTION-PREPARATION.md)。PRC-02 至 PRC-06 关闭前仍不能进入 Production Deployment Mission 授权评审，`Production Deployment Authorized = NO` 保持不变。

## 0E. V1 Production Readiness Review

- `Production Readiness Review = PASS`。
- `Production Ready = READY WITH CONDITIONS`。
- `Production Deployment Authorized = NO`。
- Product P0 / P1 = `0 / 0`。

Web 产品主链路和 External Beta 已完成；Production Preparation 前仍须关闭候选基线 / 工作区、Production 项目与环境、域名 / HTTPS、RPO / RTO、备份恢复、监控值班、法律 / 数据政策、回滚 runbook、最低治理连续性和部署后 Smoke 条件。

`/access` Admin 既有改动继续冻结，Admin Preview 外部阻塞独立跟踪；两者不把产品 P0 / P1 改写为失败，但最低治理应急路径必须在 Production Preparation 中获得 Product Owner 批准。详细结论见 [`V1-PRODUCTION-READINESS-REVIEW.md`](./V1-PRODUCTION-READINESS-REVIEW.md)。

## 0D. V1 External Beta Closeout

本节为当前权威状态。Product Owner 已确认：

- 3 名 Reader 的小范围外部测试：`PASS`。
- 外部 Author 测试：`PASS`。
- Reader-only Controlled Test：`PASS`。
- Reading Typography Alignment Fix：`PASS`。
- Author001 Publish E2E：`PASS`。
- Guest 点击作品详情或章节进入登录页，属于当前 active Membership 产品规则，不作为缺陷。
- `/access` Admin 既有改动继续冻结到 Admin 阶段，不作为 V1 Beta Closeout 阻断项。
- Product P0 / P1：`0 / 0`。

结论：`V1 External Beta Closeout = PASS`。该阶段随后已进入并完成 Production Readiness Review；当前结论以上方 0E 为准。

## 0C. External Beta Go / No-Go Review（历史）

历史评审结论：`GO — NOT OPENED`。Phase 1 Reader-only 与 Phase 2 Author-controlled 均 PASS，Product P0 / P1 = `0 / 0`，当时外部 Beta 最小条件已满足。实际执行结果现以上方 Closeout 为准。

- 推荐范围：1 名外部 Author、5 名 Reader、7 天。
- 测试边界：Web Preview 的邀请注册、Reader 阅读、Author 最小创建 / 草稿 / 发布、Reader 回读、Draft isolation、Studio denial、390px、Light / Dark 和反馈收集。
- Guest 规则：可发现作品；点击作品详情或章节后进入登录页。这是当前 active Membership 产品规则，不作为缺陷。
- 邀请治理：邀请码只创建 Reader；按用途记录、短期有效、限制次数、单独发放，不公开传播。Author 仍须独立审批后通过 `/access` 授权。
- 停止 / 回退：P0 或未接受 P1 立即暂停新邀请和新发布；撤销未使用邀请码。角色或 Membership 处置必须另行授权并走受控 `/access`、服务端校验和 audit，禁止直接 SQL。
- `/access` 既有代码改动冻结到 Admin 阶段，不继续扩展或部署；若 Product Owner 后续批准唯一外部 Author，可复用已验证的最小授权路径。
- Admin Preview 外部阻塞继续独立跟踪；完整 Admin UI、邀请码短码优化与 Production 均不属于本次 GO。

`GO` 不等于已经开放外部 Beta。账号创建、邀请码发送、Author 授权、Beta 启动和 Production 均等待 Product Owner 单独明确授权。

## 0B. Phase 2 Author-controlled Test 收口

Product Owner 已授权并完成 Author001 Publish E2E：

- Author001 使用注册名登录，`/studio`、`/studio/works`、`/studio/works/new` 均 PASS。
- 创建作品、保存章节草稿、发布所选章节均 PASS。
- Guest 与 Reader 均看不到未发布草稿；Reader 三条 Studio 路由返回 Archive，Guest `/studio` 进入登录页。
- Published Work Detail、Published Reading 与 Reader 回读均 PASS。
- Guest 可在搜索结果看到作品，点击作品或章节后进入登录页；该行为符合当前 active Membership 访问规则。
- 390px、Light / Dark 无明显横向溢出或破版；控制台无产品级错误。
- Product P0 / P1：`0 / 0`。
- `Author-controlled Test = PASS`；`Author001 Publish E2E = PASS`；`Author Release evidence gate = CLOSED`。

当前可以进入外部 Beta 的 Product Owner Go / No-Go 评审，但本结论不自动开放外部 Author、不宣布完整 Beta Ready，也不授权 Production、Deployment 或 Admin 测试。

## 0A. Reader-only 第一阶段收口与 Reading Typography 修复

Product Owner 已完成 V1 第一阶段 Reader-only 受控测试。本阶段状态从邀请前 `CONDITIONAL GO` 更新为 `PASS / COMPLETED`。

- Reader-only Controlled Test Closeout：`PASS`。
- Product P0 / P1：`0 / 0`。
- 唯一记录问题归类为 Reading Page UI / Typography / Content Layout，优先级 P2。
- Reading 正文区域保持页面视觉居中，正文段落启用两端对齐；390px、Light / Dark、字号、行距、宽度偏好与 Published-only 边界不变。
- Reading Typography Alignment Fix：`PASS`。
- 第一阶段完成不自动解除 Author001 Publish E2E evidence gate，不宣布完整 Beta Ready，也不授权外部 Author、Deployment 或 Production。
- 下一阶段 Author-controlled 测试可进入 Product Owner 授权评审；本 Mission 不自动开始。

## 0. Controlled Beta Invite Readiness 最新结论

以下是 2026-07-15 邀请前 Gate 的历史结论：`CONDITIONAL GO — READER-ONLY CONTROLLED COHORT`。当前状态以上方第一阶段收口为准。

- Reader 邀请注册与授权前边界 PASS：新用户默认是 active Reader，不自动成为 Author，不能进入三条 Studio 路由。
- Author001（masked `2cbd52b1…351d`）的 active Membership、唯一 active `author` grant、对应 `role.granted` audit、Super Admin operator 与 `admin:operate` 均已只读确认。
- Author001 退出并重新登录后，`/studio`、`/studio/works`、`/studio/works/new` 均 PASS；Reader → Author Provisioning Block 已关闭。
- Author001 的创建、保存、Draft isolation、发布与 Reader 回读仍为 `NOT RUN`。因此可以先启动 Reader-only 小范围邀请，不允许把该结论扩展为混合角色 Beta Ready。
- 第一批建议为 3 名 Reader、0 名外部 Author；先由 Product Owner 使用 Author001 完成内部发布 E2E，再新增 1 名受控 Author 测试用户。
- Web Preview 基础页面与既有 390 × 844、Light / Dark、Console 证据支持 Reader-only cohort；Product P0 / P1 为 `0 / 0`。
- 完整 Admin UI 与 Admin Preview Deployment 仍不是本次 Reader-only Gate 的阻塞项；Admin Preview 外部阻塞继续独立跟踪。
- Phase 1 测试执行文档已建立：[`V1-PHASE1-BETA-TESTING-GUIDE.md`](./V1-PHASE1-BETA-TESTING-GUIDE.md)。它只准备 3 名 Reader 的注册、Guest / Reader、移动端、权限和反馈流程，不构成自动邀请或 Beta 发布授权。

## 1. 最终结论

Fandom Harbor V1 Release 从单一串行流程拆分为四条独立主线：

1. Web V1 主站 Release 主线。
2. Admin 最小治理主线。
3. Admin Preview Deployment 解阻线。
4. Release 文档与中文使用教程线。

四条线不再使用“Admin Preview 未完成，所以所有 Web 验收停止”的串行规则。

- **Web Preview Smoke Test 可以立即继续**。现有 Web Preview 为 `Ready`，Admin Preview 的 Vercel 外部阻塞不影响 Web URL、Web baseline 或 Web 人工 Smoke。
- **完整 Admin UI 不是 V1 Beta 硬门槛**。V1 Beta 只要求最低安全治理能力，不要求内容审核、用户搜索、完整邀请码后台、站点配置、报表或分析等完整后台体验。
- **Admin Preview Deployment 继续作为独立阻塞线跟踪**。它是平台交付问题，不应被删除、误报为已完成，也不应继续计入 Web Preview Smoke 的阻塞项。
- **Admin 最小治理仍是 V1 Beta 前硬门槛**。权限底座存在不等于远程治理已经完成验收；必须单独确认 Super Admin 连续性、Admin 授权路径、邀请码治理责任和安全操作说明。

## 2. 四条 Release 主线

### 2.1 Web V1 主站 Release 主线

当前状态：`PREVIEW READY / PHASE 2 AUTHOR-CONTROLLED PASS`

已完成：

- Reader / Author 主链路、Homepage、Archive、Search、Work Detail、Reading、Author Profile、Studio Entry、Global Shell、Auth 页面与移动端 UI Sweep 已完成本地 V1 级别验收。
- Release baseline `903bf70a6dc370090362098d26bedd6bf68af529` 已 push，`main` 与 `origin/main` 一致。
- `fandom-harbor-web` Preview 已构建成功，状态为 `Preview / Ready`。
- Guest、Reader、Light / Dark、390 × 844、1280 与 Global Shell 的多数人工 Smoke 已通过；控制台当前没有 Product Owner 报告的 P0 / P1 错误。
- Product P0 / P1 当前观察值为 `0 / 0`。

V1 Beta 前剩余硬门槛：

- 补齐 Guest Work Detail、Guest Author Profile、Reader Published Work / Chapter 三项 `BLOCKED` 的原因与最终结果。
- 补齐 Author / Super Admin 账号在 Web 侧的 Studio 入口、`/studio`、Overview、Author Invitations、邀请码状态、Reader 侧 Published 内容和 Draft isolation 七项结果。
- 对任何 `FAIL` 按 P0 / P1 规则处置，并重新确认 Web Preview Smoke 没有未关闭的产品级 P0 / P1。
- Product Owner 完成 Web V1 Beta go / no-go 验收。Production Deployment、正式域名和 DNS 不属于当前文档 Mission，也未获授权。

判断：

- Web Preview Smoke **允许继续**。
- Web 主线 **不再被 Admin Preview Deployment 阻塞**。
- Admin Preview 的状态不得再计入 Web 主线的 Release Gate 数量；Web 当前未完成证据为两组：公开内容路径、Author Web 路径。

### 2.2 Admin 最小治理主线

当前状态：`MINIMUM GOVERNANCE PASS / AUTHOR PUBLISHING EVIDENCE OPEN`

已确认的权限底座：

- Membership、`author` / `admin` / `super_admin` Role Grant、服务端 capability、数据库函数、RLS 与 audit log 已存在。
- Reader / Author 不具备 `admin:operate`；Admin / Super Admin 由 Admin App 服务端 Access Context 与数据库函数再次校验。
- 普通 Admin 只能授予 / 撤销 Author；只有 Super Admin 可以授予 / 撤销 Admin 或 Super Admin。
- 系统禁止撤销或停用最后一个有效 Super Admin。
- 邀请码只创建 active Membership / Reader 门禁，不得自动授予 Author、Admin 或 Super Admin。
- Author 可通过 Web `/author/invitations` 创建邀请码、查看一次性原始码并撤销自己创建的邀请码；邀请码支持有效期和使用次数。
- 数据层允许 Admin / Super Admin 撤销邀请码，但当前没有完整 Admin 邀请码治理 UI。

当前 Super Admin 状态：

- 现有 Super Admin 账号存在，已完成一次受控 Account Repair，并由 Product Owner 在 Web Preview 确认注册名登录成功。
- Account Repair 只对齐历史 Auth 标识，没有修改密码、Membership 或 Role Grant，也没有创建新用户。
- 数据库存在 owner-only 的一次性 Super Admin bootstrap 能力，且只允许在不存在未撤销 Super Admin grant 时使用；它不是普通 Admin 自助恢复入口。
- 因此“Super Admin 存在并可登录”为 **YES**；“任意故障下均有可重复、已演练的恢复流程”为 **尚未完全证明**。现有 active grant 仍存在但账号不可登录时，bootstrap 会拒绝，必须走受控账号修复或由另一名有效 Super Admin 处理。

Admin 授权路径：

1. 目标用户先完成邀请注册并具有 active Membership。
2. Super Admin 登录独立 Admin App。
3. 在 `/access` 使用可信 User ID 选择 `admin`，填写原因并提交。
4. 服务端与数据库再次验证操作者权限、目标 Membership 和角色边界，并写入 audit log。
5. 目标 Admin 重新登录并验证 capability；UI 成功提示不能替代重新登录验证。

该路径在实现与本地门禁层面明确，但由于 Admin Preview 尚未生成，远程 `/access` 授权 / 撤销 Smoke 尚未执行。

邀请码最低治理边界：

- 邀请注册只授予 Reader；Author、Admin、Super Admin 必须独立手工授权。
- 原始邀请码只在创建结果显示一次，数据库只保存 hash；不得在文档、Issue、截图或聊天中保存真实邀请码。
- 创建者可撤销自己的邀请码；Admin / Super Admin 在数据层具有更广的撤销权限。
- 当前 Web UI 是 Author 自助创建 / 撤销路径，不是完整 Admin 全局邀请码后台。
- 在完整 Admin 邀请码 UI 上线前，Beta 必须指定邀请码发行责任人、默认有效期 / 次数上限、泄露后的停发与撤销负责人，以及审计记录复核责任人。

最低治理结论：

- 权限模型、最后一个 Super Admin 保护、授权审计和邀请码不提权边界已经具备。
- 当前受控 Gate 已确认 active Super Admin、受守卫的 `/access`、服务端 / 数据库双重校验、真实 `role.granted` audit 与授权后能力，最低 Author 授权治理为 **PASS**。
- Super Admin 灾难恢复演练与完整 Admin UI 仍应继续独立治理，但不阻止本次 Reader-only 小范围邀请；任何新角色授权仍需 Product Owner 明确批准。

#### Beta Author Provisioning Check

当前结论：`PROVISIONING PASS / AUTHOR WEB FLOW BLOCKED`

| 检查项                  | 结论                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| 邀请注册默认角色        | active Membership / Reader                                                                       |
| 邀请是否授予 Author     | 否；Author 必须独立手工授权                                                                      |
| Reader Studio 权限      | 无 `work:author`；直访 `/studio` 返回 `/archive`                                                 |
| 历史远程 Author         | `Auther001` 曾获手工 Author grant、写入 audit 并成功进入 Studio                                  |
| 当前可用 Preview Author | 已确认登录与 `/studio`；创建 / 保存 / 发布链尚未完成                                             |
| Super Admin 授权入口    | Admin App `/access` → 授予角色 → `author`                                                        |
| 服务端与数据库校验      | Server Action 要求 `admin:operate`；数据库要求 active Membership、Admin / Super Admin 和非空原因 |
| Audit                   | `grant_role` 写入 `role.granted`，包含操作者、目标、角色与原因                                   |

授权链路本身已存在，且历史远程验收曾走通。2026-07-15 本轮补充证据：

- Product Owner 已人工确认历史远程 Author 可在当前 Web Preview 登录并进入 `/studio`。
- 受控浏览器会话读取到已登录 Author Shell、Studio Header 入口、Studio 导航、作品管理、文章管理和邀请码管理入口。
- 导航到 `/studio/works` 后页面最终回到 `/archive`，随后浏览器控制持续超时。没有提交创建表单，也没有创建、保存或发布任何作品。
- 因会话无法继续，本轮 Reader / Guest 回读、Draft isolation、Author 专项 390 × 844、Light / Dark 与控制台检查均未运行。
- Admin Preview Deployment 不在本 Mission 处理范围；当前也没有已验证的远程 `/access` UI 证据。

风险判断：

- 缺少可用 Author 不阻止 Guest / Reader 与公开页面 Smoke 继续。
- 当前 Preview Author 已确认可登录并进入 Studio，因此 Author Provisioning Block **解除**。
- Author Web Smoke 仍阻止创建、保存、发布、Reader / Guest 回读与 Draft isolation 证据收口；该阻塞不应继续命名为 Provisioning Block。
- 当前没有确认产品级 FAIL，Product P0 / P1 保持 `0 / 0`；`/studio/works` 返回 `/archive` 需要 Product Owner 在重新登录后人工复核，才能判断是会话问题还是产品问题。
- 完整 Web Preview Smoke 暂不允许收口；本轮不自动进入 Beta 发布。

#### Reader → Author Provisioning E2E Check

当前状态：`PASS — AUTHOR001 GRANT / AUDIT / STUDIO VERIFIED`

最新证据：Product Owner 已通过 `/access` 手工提交 Author001 授权并看到 `status=role-granted`。只读复核确认 masked Auth user `2cbd52b1…351d` 的 active Membership、唯一 active `author` grant、对应 `role.granted` audit 和 Super Admin operator 均对齐；目标用户重新登录后可打开三条 Studio 路由。下列 `error=invalid` 描述为修复前历史过程，不再代表当前 Gate。

- Product Owner 已在 Web Preview 完成新 Reader 注册和登录；Codex 未读取或记录邀请码、密码。
- 新 Reader 页首无 Studio；直访 `/studio`、`/studio/works`、`/studio/works/new` 最终均返回 `/archive`，授权前边界 PASS。
- `http://localhost:3000/access` 已登录 Super Admin；完整 Role Grant 表单可见，Product Owner 已准备非空 User ID，角色为 `author`。
- Product Owner 手动提交后页面进入 `/access?error=invalid`，表示表单输入校验拒绝。没有成功 Author grant，也没有新的 `role.granted` audit。
- 按安全规则立即停止：没有重试、修改目标 ID，也没有使用 SQL、Supabase 控制台、Auth、Migration 或 RLS 绕过。
- 后续代码审计确认 `error=invalid` 位于 RPC 前的 Server Action schema；表单字段、`author` role、grant action、RPC 名称和参数均对齐。严格 UUID 输入没有先清理粘贴空白，且所有字段错误共用一个提示，构成当前 `/access` 输入链的最小阻塞。
- 本地最小修复已完成：UUID 校验前 trim，并区分 `invalid-user-id`、`invalid-role`、`invalid-reason`；未修改数据库、Auth、RLS、Migration 或 Vercel。

因此需区分两个结论：

- **已有 Preview Author 可用性 Block：已解除**。已有 Author 可以登录并进入 Studio。
- **新 Reader → Author E2E Provisioning Block：已解除**。真实 active grant、audit 与授权后 Studio 能力已经只读复核。

该治理链不需要再次授权 Author001。当前剩余硬门槛转为 Author 发布 E2E：创建、保存、Draft isolation、发布和 Reader 回读；未完成前仅允许 Reader-only 受控 cohort。

### 2.3 Admin Preview Deployment 解阻线

当前状态：`BLOCKED — EXTERNAL PLATFORM / SUPPORT`

| 检查项                  | 当前状态                                                            |
| ----------------------- | ------------------------------------------------------------------- |
| Admin Project           | `fandom-harbor-admin` 已创建                                        |
| GitHub 连接             | 已关联当前 Repository                                               |
| Root Directory          | `apps/admin`                                                        |
| Preview baseline branch | `codex/admin-preview-baseline`，固定到 Release baseline             |
| Environment Variables   | 两个必需 Preview 变量名称存在；未读取或记录值                       |
| Preview Deployment      | 0；未生成 Admin Preview URL                                         |
| Production Deployment   | 0；误判 Deployment 已取消并删除                                     |
| Vercel 判定             | 非 Production branch 被判定为 `production / Production`             |
| Dashboard 复核          | 未发现 Project / Git / Environment / Domain / Build 设置错配        |
| Support 状态            | Evidence Pack 已准备，等待 Product Owner 提交或 Vercel Support 解释 |

处理规则：

- 本线继续独立标记为 `BLOCKED`，不能标记为完成。
- 在 Vercel Support 给出解释，或 Product Owner 明确授权新的受控方案前，不再次触发 Admin Deployment，不进入 Production，不修改 Vercel 配置。
- 本线阻塞 **不停止 Web Preview Smoke**。
- 本线本身 **不是完整 Admin UI 的功能门禁**，也不代表 Admin 权限底座失效。
- Admin Preview 不是天然的 V1 Beta 硬门槛；但如果它是当时唯一获批的最低治理操作入口，则会通过“Admin 最小治理主线”间接成为运营依赖。两者必须分别记录。

### 2.4 Release 文档与中文使用教程线

当前状态：`DOCUMENTED / 本轮完成流程重组，待 Product Owner 验收`

当前文档覆盖：

- Admin 登录与独立入口说明。
- Super Admin 权限、最后一个有效 Super Admin 保护和恢复边界。
- 通过 `/access` 授权 / 撤销 Admin 的步骤。
- Author 创建 / 管理邀请码、邀请码只授予 Reader、一次性原始码与安全边界。
- Guest / Reader / Author / Admin / Super Admin 角色边界。
- 密码、邀请码、Token、Secret、环境变量值不得进入文档或聊天的安全要求。
- Web Preview Smoke Test 清单和当前未完成证据。
- Admin Preview Support Evidence 与暂停规则。
- Phase 1 Reader-only 测试范围、注册与邀请码说明、Guest / Reader 清单、移动端检查、严重程度、通过标准、反馈模板和可直接发送的测试者说明。

文档入口：

- [`V1-USER-GUIDE.md`](./V1-USER-GUIDE.md)
- [`V1-ADMIN-GUIDE.md`](./V1-ADMIN-GUIDE.md)
- [`V1-DEPLOYMENT-SMOKE-TEST.md`](./V1-DEPLOYMENT-SMOKE-TEST.md)
- [`V1-RELEASE-DEPLOYMENT.md`](./V1-RELEASE-DEPLOYMENT.md)
- [`V1-ADMIN-VERCEL-SUPPORT-EVIDENCE.md`](./V1-ADMIN-VERCEL-SUPPORT-EVIDENCE.md)
- [`V1-PHASE1-BETA-TESTING-GUIDE.md`](./V1-PHASE1-BETA-TESTING-GUIDE.md)

## 3. Admin 三层定义

| 层级                     | 定义                                                                                                 | 当前状态                                 | 是否阻塞 V1 Beta                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| Admin 权限底座           | Membership、Role Grant、capability、RLS、受控 RPC、audit、最后一个 Super Admin 保护                  | 已存在，本地门禁与迁移记录已验证         | 最低安全能力必须存在；当前底座满足基础条件                       |
| Admin UI                 | Admin Shell、登录、Dashboard、`/access` 等操作界面；完整 UI 还包括用户搜索、全局邀请码、审核、配置等 | 最小 `/access` UI 已存在；完整 UI 未完成 | 完整 UI 不阻塞；最低治理操作路径必须明确且可执行                 |
| Admin Preview Deployment | 将 Admin App 交付为可访问 Vercel Preview，涉及 Project、Git、变量名称、Build 与 URL                  | 外部平台判定异常，0 个 Deployment        | 不阻塞 Web Smoke；是否影响 Beta 取决于最低治理是否有其他获批路径 |

## 4. External Beta 前必须完成项（当前结果）

### Web Release 硬门槛

- Phase 1 Reader-only 与 Phase 2 Author-controlled 均已完成并 PASS。
- Published Work / Chapter、Guest 登录门禁、Author 创建 / 保存 / 发布 / 回读、Draft isolation 与 Studio denial 证据已完整。
- Product P0 / P1 = `0 / 0`；External Beta 已实际完成并 Closeout PASS。

### Admin 最小治理硬门槛

- 至少一个 active Super Admin 可登录；`/access` 授权路径、服务端 / 数据库双重校验、原因与 audit 已验证。
- Reader → Author provisioning 与 Author001 Publish E2E 已通过，没有使用直接 SQL 或控制台改角色。
- 邀请码只创建 Reader；发行、次数 / 有效期、泄露停发、撤销和审计责任已记录。
- `/access` 既有代码冻结到 Admin 阶段；实际外部 Author grant、撤销或 Membership 处置仍需 Product Owner 单独授权。
- Beta 启动前由 Product Owner 指定邀请码发行责任人、反馈位置、起止时间和紧急联系人；这是人工启动清单，不是工程阻塞。

### Release 文档硬门槛

- 中文用户指南、Admin 指南、安全说明和 Smoke 清单保持与实际 Beta baseline 一致。
- 所有验收记录只保存状态和脱敏标识，不保存密码、真实邀请码、Token、Secret 或环境变量值。

## 5. V1 Beta 后置项

- 完整 Admin UI：用户搜索、全局邀请码列表与治理、内容审核、站点配置、报表、分析和更完整审计浏览。
- Admin 体验优化、移动端 Admin 深度适配和 P2 视觉优化。
- 第二审批人、强制重新认证等更高等级的职责分离增强；团队规模允许时再启用。
- Admin Preview Vercel 平台问题的长期修复可独立继续；若 Beta 前已有获批最低治理路径，它不阻塞 Web Beta。
- Docs Project、Production Deployment、正式域名、DNS 与 Production 运维流程，均需要独立 Mission 与 Product Owner 授权。

## 6. Release Gate 记账方式

为避免再次把独立阻塞混在一起，状态按主线分别记录：

| 主线               | 当前未完成项                       | Gate 含义                                       |
| ------------------ | ---------------------------------- | ----------------------------------------------- |
| Web V1 主站        | 0 个产品证据 Gate                  | 所有 Beta 阶段 PASS，P0 / P1 = 0 / 0            |
| Production 准备    | PRC-01 至 PRC-06                   | 候选基线、环境、运维、法律、回滚与治理连续性    |
| Admin Preview 解阻 | 1 个独立外部阻塞                   | Vercel 将非 Production branch 判定为 Production |
| Release 文档       | Production Readiness Review 已记录 | 等待 PO 授权 Production Preparation，不代表部署 |

不得再用一个合计 P1 数字表达四条线，也不得把 Admin Preview 外部阻塞解释为 Web 产品 P1。

## 7. 下一步最小 Mission 建议

以下 Mission 相互独立，本轮不自动开始：

1. **V1 Production Preparation Mission**：关闭 PRC-01 至 PRC-06，建立候选基线、核对 Production 配置并完成运维 / 法律 / 回滚签署；不自动部署。
2. **External Beta Evidence Archive Mission**：如 Product Owner 需要，只整理脱敏截图、反馈与测试账号处置清单；不自动修改账号或数据。
3. **Admin Preview Unblock Mission**：只处理 Vercel Support 回复或 Product Owner 新授权的受控 Preview 方案；继续禁止 Production。
4. **Production Deployment Go / No-Go Mission**：仅在所有条件关闭后评审是否授权部署；不得由 Preparation 自动进入。

## 8. 本轮边界

本轮只整理文档。没有修改产品代码、数据库结构、Migration、RLS、Policy、Auth、Role、Supabase、Vercel 配置或环境变量；没有执行 Preview / Production Deployment、DNS、远程写入或 Production 操作。

如后续检查发现最低治理必须依赖工程变更，应立即停止，说明原因并等待 Product Owner 单独授权。
