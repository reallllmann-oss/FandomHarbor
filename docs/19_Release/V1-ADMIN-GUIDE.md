# Fandom Harbor V1 Admin 使用教程

状态：权限底座与最小治理 UI 已存在；Preview Deployment 独立 BLOCKED

## Controlled Beta 邀请 Gate 更新（2026-07-15）

- Author001（masked `2cbd52b1…351d`）已由 Product Owner 通过本地 `/access` 手工授予 `author`，页面返回 `status=role-granted`。
- 只读复核确认 active Membership、唯一 active `author` grant、对应 `role.granted` audit 均对齐；operator 具有 active Super Admin 与 `admin:operate`。
- Author001 退出并重新登录后可进入 `/studio`、`/studio/works`、`/studio/works/new`。Reader → Author Provisioning Block 已解除。
- `/access` 具有页面级登录 / `admin:operate` 守卫，Server Action 与数据库函数再次校验并写 audit；本链路未依赖直接 SQL 或 Supabase 控制台改角色。
- 当前只允许 Reader-only 受控 cohort。Author001 的创建、保存、Draft isolation、发布与 Reader 回读仍待 Product Owner 人工完成；不要再次授权 Author001。

## 1. Admin 入口

Admin 使用独立 `apps/admin`、独立 Admin Shell 与独立部署边界。

- 本地开发入口：`http://127.0.0.1:3001/auth/sign-in`
- Preview 登录入口：尚未生成

Admin Project `fandom-harbor-admin` 已在 `fandom-harbor` Team 创建并关联当前 GitHub Repository，Root Directory 为 `apps/admin`。远程验收 branch `codex/admin-preview-baseline` 固定指向 baseline `903bf70a6dc370090362098d26bedd6bf68af529`。Vercel 将该非 Production branch 的首次 deployment 判定为 Production，因此已按安全要求删除并停止；当前没有 Admin Preview URL，不得使用 Web Preview 地址代替 Admin 入口。

登录后：

- `/`：Admin Dashboard 概览。
- `/access`：Membership 与 Role Grant。
- `/auth/sign-in`：Admin 专用登录页。

Web Homepage、Archive、Search、Reader 页面与 Author Studio 都不属于 Admin 区域。

## 2. 登录教程

1. 准备一个已经存在的 Supabase 账号。
2. 确认该账号 Membership 为 active，并具有未撤销的 `admin` 或 `super_admin` Role Grant。
3. 打开 Admin 独立域名的 `/auth/sign-in`。
4. 输入与普通 Web 相同账号体系的注册名和密码。
5. 成功后会进入 Admin Dashboard；页面会显示 Membership、角色与当前能力。

登录失败时检查：

- 是否误用了普通 Web 域名。
- 注册名、密码是否属于当前环境。
- Membership 是否 active。
- Admin / Super Admin Role Grant 是否存在且未撤销。
- Admin App 的 Supabase URL 与 publishable key 是否指向正确环境。
- linked remote Migration 是否完整。

不得在本文或任何公开材料中写入密码、token、service role key、数据库密码或 Supabase secret。测试账号只能通过安全凭据命令查看，或由 Product Owner 单独提供。

## 3. Admin 与 Super Admin 权限

### Admin

- 可以进入 Admin Dashboard 与 `/access`。
- 可以授予 / 撤销 Author。
- 可以修改普通成员 Membership 状态。
- 不能授予或撤销 Admin / Super Admin。
- 不能停用受保护的 elevated account，也不能直接修改数据库。
- 当前没有完整内容审核、站点配置、用户搜索或邀请码管理后台。

### Super Admin

- 包含 Admin 能力。
- 可以授予 / 撤销 Author、Admin、Super Admin。
- 可以管理 elevated account 的 Membership。
- 不能撤销或停用最后一个有效 Super Admin。

所有操作由 Server Action 调用受控 RPC；数据库再次验证操作者、目标 active Membership、角色边界与原因，并写入 audit log。

## 4. 授权其他 Admin

V1 已存在受控 Admin 授权 UI，但只有 Super Admin 可以执行。

1. 目标用户必须已完成注册，并具有 active Membership。
2. Super Admin 登录独立 Admin App。
3. 打开 `/access`。
4. 在「授予角色」填写目标用户的 User ID。
5. 选择 `admin`，填写具体授权原因。
6. 点击「授予并审计」。
7. 页面显示成功状态后，让目标用户在 Admin `/auth/sign-in` 登录。
8. 目标用户进入 Dashboard，并显示 Admin capability，即视为生效。

当前表单使用 User ID，不支持按注册名搜索。User ID 必须从可信内部流程取得，不得要求普通 Admin 查询或修改数据库。

## 5. 撤销 Admin

1. 由 Super Admin 打开 `/access`。
2. 在「撤销角色」输入目标 User ID。
3. 选择 `admin`，填写撤销原因。
4. 点击「撤销并审计」。
5. 让目标账号重新登录，确认不能再进入 Admin。

如需处理 Super Admin，仍须由 Super Admin 操作；系统会拒绝撤销最后一个有效 Super Admin。

## 6. Membership 管理

`/access` 支持将 Membership 设置为 `active`、`suspended` 或 `revoked`。操作必须填写原因。普通 Admin 不能停用自己，也不能处理受保护的 Admin / Super Admin；这类操作要求 Super Admin。

## 7. 审计与记录

- `grant_role` 写入 `role.granted`。
- `revoke_role` 写入 `role.revoked`。
- Membership 变更写入 `membership.state_changed`。
- 操作结果应同步记录到项目状态或 Changelog。
- UI 提示成功不替代目标账号重新登录验证。

## 8. Super Admin 连续性与恢复边界

当前已有 Super Admin 账号存在，并已由 Product Owner 在 Web Preview 确认注册名登录成功。历史 Account Repair 只对齐 Auth 标识，没有修改密码、Membership 或 Role Grant。

恢复场景必须分开处理：

1. **仍有另一个有效 Super Admin**：由其通过 `/access` 处理角色或 Membership，填写原因并复核 audit log。
2. **数据库中不存在未撤销的 Super Admin grant**：数据库提供 owner-only 的一次性 bootstrap 能力；它不是 Admin UI，也不能由普通 Admin 执行。任何实际使用都需要独立高风险 Mission 与 Product Owner 授权。
3. **Super Admin grant 仍存在，但账号无法登录**：一次性 bootstrap 会拒绝。必须走受控身份修复或由另一名有效 Super Admin 处理，不能通过创建第二个未审计入口绕过。

V1 Beta 前应记录不含密码或内部标识的账号所有人、紧急联系人、审批人和 audit 复核人，并完成一次不执行真实高风险变更的 runbook 走查。本文不授权任何账号、数据库或 Auth 操作。

## 9. 创建与管理邀请码

当前可用 UI 位于 Web Author 区域 `/author/invitations`，不是 Admin `/access`：

1. 具有 Author capability 的账号登录 Web，并进入「邀请码管理」。
2. 填写未来过期时间和正整数使用次数，创建邀请码。
3. 原始邀请码只在创建结果显示一次；只通过受控渠道交付给目标用户，不粘贴到文档、Issue、截图或群聊。
4. 记录 Invitation ID、用途、到期时间和责任人，但不记录原始邀请码。
5. 需要撤销时，创建者输入 Invitation ID 和具体原因，提交后确认审计记录。

权限与限制：

- Author 可创建邀请码并撤销自己创建的邀请码。
- Admin / Super Admin 在数据层具有撤销邀请码的治理权限，但当前没有完整的 Admin 全局邀请码 UI。
- 邀请码只授予 active Membership / Reader，不授予 Author、Admin 或 Super Admin。
- V1 Beta 前必须由 Product Owner 指定发行责任人、默认次数 / 有效期、泄露停发和撤销负责人。没有获批的全局治理入口时，不得让普通人员直接修改数据库。

## 10. Beta Author 开通路径

邀请码注册只创建 active Membership，因此新注册用户默认是 Reader，不会自动获得 Author，也不能进入 Studio。Author 必须通过独立、可审计的 Role Grant 开通。

现有受控路径：

1. 测试用户先使用邀请码在 Web 完成注册，并确认 Reader 登录正常。
2. Product Owner 通过可信内部记录取得该用户的 User ID；不要让测试用户在聊天中发送密码或邀请码。
3. Super Admin 登录与 Web Preview 使用同一后端环境的 Admin App，打开 `/access`。
4. 在「授予角色」中填写 User ID，选择 `author`，填写具体的 Beta 测试原因。
5. 提交「授予并审计」。Server Action 先要求 `admin:operate`，数据库再检查目标是 active Membership、操作者具有 Admin 或 Super Admin 权限、原因非空。
6. 数据库创建 Author Role Grant，并写入 `role.granted` audit event，记录操作者、目标、角色和原因。
7. 目标用户退出并重新登录 Web；确认出现 Studio 入口，且 `/studio` 可以进入。

普通 Admin 和 Super Admin 都具备授予 / 撤销 Author 的底层权限；本次建议由现有 Super Admin 执行，以减少 Beta 准备期间的治理依赖。

当前证据边界：

- 历史远程验收账号 `Auther001` 曾获得手工 Author grant、写入 audit，并由 Product Owner 成功进入 Studio。
- Product Owner 与受控浏览器已确认既有 Author 可在当前 Web Preview 登录并进入 Studio，因此“既有 Preview Author 账号可用性”已确认；创建、保存、发布和回读仍未完成。
- 新 Reader → Author E2E 是独立治理门槛：本轮 `/access` 提交返回 `error=invalid`，没有成功 grant 或新的 audit，不能用既有 Author 账号的可用性替代该结果。
- Admin Preview Deployment 不在本 Mission 处理范围。若历史 Author 不可用，任何通过现有 Admin UI 对真实用户授予 Author 的操作，都必须先取得 Product Owner 明确授权；不得用直接 SQL、修改 Auth / RLS 或临时 Migration 代替。

### Reader → Author E2E Smoke 前置条件

一次可验收的真实 Provisioning Smoke 必须同时具备：

1. Product Owner 已在 Web Preview 自行完成新 Reader 注册和登录，不向 Codex 提供邀请码或密码。
2. 已验证新 Reader 不能进入 `/studio`、`/studio/works` 和 `/studio/works/new`。
3. 目标 Reader 的 User ID 已通过可信内部流程确认；`/access` 没有用户搜索，不能猜测 ID。
4. Product Owner 已在与 Web Preview 相同后端环境的 Admin App 登录，并将浏览器停留在 `/access`。
5. 授权只能在 `/access` 选择 `author`、填写非空原因并提交；成功后确认 `role.granted` audit，再让目标用户退出并重新登录。

2026-07-15 E2E 最终结果：新 Reader 注册、登录和三条 Studio denial 均 PASS；Product Owner 随后通过更新后的 `/access` 手工提交 Author001 授权并得到 `status=role-granted`。只读复核确认 active Author grant、`role.granted` audit、operator 权限和重新登录后的三条 Studio 路由均 PASS。早期 `/access?error=invalid` 为修复前历史记录，E2E Provisioning Gate 现已 `CLOSED`。

`error=invalid` 表示表单输入未通过 Server Action schema。Product Owner 应在浏览器内自行确认：目标 User ID 是有效 UUID、对应本轮新 Reader；角色为 `author`；非空原因填写在第一个“授予角色”表单。不要把 User ID、密码或邀请码发到 Codex；未获得明确重试授权前不要再次提交。

#### `/access` invalid blocker 最小修复

2026-07-15 代码审计确认：`error=invalid` 只来自 `grantRole` / `revokeRole` 在 RPC 前执行的 `roleMutationSchema.safeParse`。表单字段 `userId`、`role`、`reason` 与 Server Action 一致；grant / revoke action 没有混用；`author` 与数据库 enum、`work:author` capability 一致；RPC 名称及 `p_user_id`、`p_role`、`p_reason` 参数一致。Admin session 或数据库拒绝会返回其他路径，不会生成 `error=invalid`。

最小代码修复已在本地完成：Role Grant 的 Auth UUID 在校验前先清理首尾空白；UUID、role、reason 分别返回安全、非敏感的错误提示；表单关闭 User ID 自动大小写、自动填充和拼写修正。该修复没有修改数据库、Auth、RLS、Migration 或 Vercel 配置。

修复后的人工授权步骤：

1. Product Owner 确认当前 `/access` 使用更新后的本地 Admin 代码并自行登录。
2. 只在第一个「授予角色」表单填写目标 Reader 的完整 Auth UUID；不要填写注册名或 masked ID。
3. 角色选择 `author`。
4. 原因填写 `V1 Beta Reader to Author provisioning smoke`。
5. 点击「授予并审计」。成功状态必须为 `/access?status=role-granted`；如出现字段级错误或 `error=denied`，立即停止。
6. 成功后另行只读确认 active grant 与 `role.granted` audit，再让目标用户退出并重新登录。

真实授权已由 Product Owner 手工执行并完成只读复核；不要再次授权 Author001。剩余 Gate 是 Author 发布链证据，不是 Provisioning。

## 11. 当前限制与 Release Follow-up

- Admin Vercel Project 已创建并关联 GitHub；两个必需 Preview 变量存在，未读取变量值。
- Admin Preview Deployment 因 Vercel 将非 Production branch 判定为 Production 而 BLOCKED；误判 deployment 已删除，Preview / Production deployments 最终均为 0。
- Baseline branch 将按 Product Owner 要求保留，但在获得新的明确授权前不得再次尝试部署。
- Local QA Fixture 没有 Admin / Super Admin 测试账号。
- Author001 已通过 `/access` 获得 active Author grant，且 audit 与 Studio 能力已确认；本 Readiness Mission 没有新增授权、撤销或远程写入。
- Admin UI 没有用户搜索，只接受 User ID。
- Admin 没有自助管理邀请码、内容审核或后台配置的完整 UI。

完整 Admin UI 不阻塞 Reader-only 受控邀请；Reader → Author E2E 已通过。Author 创建、保存、发布、Draft isolation 和 Reader 回读仍须在邀请外部 Author 前完成。

需要 Product Owner 决策：为后续 Preview / Production Smoke 安全提供一个 Admin 与一个 Super Admin 验收账号，或授权建立独立的非生产 Admin QA Fixture。该事项不得通过新增 Migration、修改 Role / RLS / RPC 或直接远程 SQL 临时解决。

## 12. 安全要求

- 不在文档保存真实密码、Supabase secret、service role key 或 token。
- Web Preview 的 Protection Bypass for Automation secret 已由 Product Owner 删除或轮换；Admin 文档与后续测试不得记录或重新生成该值。
- 不公开 Admin 链接给无关人员。
- 只在正确的独立 Admin 域名操作。
- 授权 Admin 属于高风险操作，必须由 Super Admin 受控执行并记录原因。
- 普通 Admin 不允许直接修改数据库。
- 若授权需要新增字段、修改角色模型、RLS、RPC、远程 SQL 或生产数据，立即停止并申请 Product Owner 明确授权。
