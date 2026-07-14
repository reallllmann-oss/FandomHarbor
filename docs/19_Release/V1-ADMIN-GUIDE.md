# Fandom Harbor V1 Admin 使用教程

状态：Admin 流程文档已完成；线上 Admin URL 与真实账号 Smoke 待部署门禁解除

## 1. Admin 入口

Admin 使用独立 `apps/admin`、独立 Admin Shell 与独立部署边界。

- 本地开发入口：`http://127.0.0.1:3001/auth/sign-in`
- 线上入口：`https://<Admin 独立域名>/auth/sign-in`

本轮没有确认 Admin Vercel Project 或线上域名，因此不得把模板地址替换成猜测 URL。正式地址必须由 Product Owner 从 Vercel Project 确认后补充。

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

## 8. 当前限制与 Release Follow-up

- Admin 线上域名尚未确认。
- Local QA Fixture 没有 Admin / Super Admin 测试账号。
- 本轮没有执行真实 Admin 授权、撤销或远程写入。
- Admin UI 没有用户搜索，只接受 User ID。
- Admin 没有自助管理邀请码、内容审核或后台配置的完整 UI。

需要 Product Owner 决策：为后续 Preview / Production Smoke 安全提供一个 Admin 与一个 Super Admin 验收账号，或授权建立独立的非生产 Admin QA Fixture。该事项不得通过新增 Migration、修改 Role / RLS / RPC 或直接远程 SQL 临时解决。

## 9. 安全要求

- 不在文档保存真实密码、Supabase secret、service role key 或 token。
- 不公开 Admin 链接给无关人员。
- 只在正确的独立 Admin 域名操作。
- 授权 Admin 属于高风险操作，必须由 Super Admin 受控执行并记录原因。
- 普通 Admin 不允许直接修改数据库。
- 若授权需要新增字段、修改角色模型、RLS、RPC、远程 SQL 或生产数据，立即停止并申请 Product Owner 明确授权。
