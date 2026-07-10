# Phase 2 Auth P0 — Registration Model

状态：Resolved — Remote Product Acceptance Passed

日期：2026-07-02

## 问题

Phase 2 人工验收发现注册仍要求用户邮箱和验证邮件，且可能被邮件发送速率限制阻断；这与产品要求的私域邀请码注册不一致。

## 已批准规则

- 注册必要项：注册名、密码、邀请码。
- 登录必要项：注册名、密码。
- 密码只要求 8–128 位，不要求大小写、数字或特殊符号。
- 注册名必填，最多 64 字符，拒绝控制字符，并大小写不敏感唯一。
- 不发送或等待邮箱验证邮件。
- 有效邀请码只创建 active Membership；不授予任何高权限角色。

## 实现合同

```text
Sign-up Server Action
  → validate registration name/password/invitation
  → hash invitation secret
  → Auth provider invitation preflight
  → Supabase Auth password signup
  → auth.users AFTER INSERT trigger
      → lock and revalidate invitation
      → create Profile(registration_name)
      → create active Membership
      → create Invitation Redemption
      → increment invitation use_count
      → append audit record
  → commit all or roll back all
```

注册 metadata 只作为事务输入；运行期 Trusted Identity 只信任 Auth user ID，Membership 与 `role_grants` 继续是权限事实源。

## 验证证据

- `supabase db reset`：九条 Migration 从零应用通过。
- `phase_1c_identity_access.sql`：通过。
- `phase_2_content_domain.sql`：通过。
- `phase_2_auth_registration.sql`：通过，覆盖成功、无效邀请零残留、大小写重复名回滚及不授予高权限角色。
- 真实本地 Auth API signup/password login：均返回 200 与 Session，无邮件步骤。
- `pnpm lint`、`pnpm typecheck`、`pnpm test`：通过。
- Web、Admin、Docs production build：通过。
- 浏览器 QA：注册页仅三项，登录页仅两项，密码最少 8 位。

## 2026-07-02 P0 回归失败与根因

人工验收环境的 `.env.local` 指向远程 Supabase。浏览器提交注册后，Server Action 将 Provider 失败折叠为 `error=provider`，页面只显示“创建账号失败。请稍后重试。”

直接请求远程 REST RPC 得到：

```text
HTTP 404
PGRST202
Could not find the function public.validate_registration_invitation(p_code_hash)
```

因此真实根因是远程 Supabase 未部署 `20260702090000_registration_name_invitation_signup.sql` 及后续邀请码状态 Migration，不是当前输入的密码、注册名、邀请码、RLS 或本地 Trigger。远程项目未被 Supabase CLI link，当前环境也没有 Supabase Platform Access Token，所以本轮不能安全执行远程 `db push` 或查看远程 Dashboard 日志。

## P0 修复

- 新增 `registration_invitation_status` 安全函数，在不暴露邀请记录的前提下区分 `valid`、`invalid`、`expired`、`exhausted` 与 `revoked`。
- 保留 `validate_registration_invitation` boolean 兼容合同。
- Provider 明确区分邀请码状态、注册名重复、弱密码、Rate Limit、服务不可用与 RPC / Email Confirm 配置错误。
- Server Action 不再把所有 Provider 错误折叠为一个 query code。
- 注册页删除“创建账号失败。请稍后重试”的兜底文案，改为可理解、可行动的错误原因。

## 最新本地验证

- 九条 Migration clean reset 通过。
- 三套 SQL 回归通过，邀请状态覆盖有效、未知、过期、耗尽与撤销。
- 真实本地 Auth signup 返回 HTTP 200 + Session；Profile、active Membership 与 Redemption 同事务存在，未授予高权限角色。
- Browser console 无注册业务异常；远程失败现在显示“注册服务尚未完成配置，请联系管理员检查数据库 Migration 与 Auth 设置。”
- 全仓 lint、typecheck、测试与 Web/Admin/Docs production build 通过。

## P0 解除条件

以下 P0 解除条件已全部完成：

- [x] 将仓库中九条 Migration 按顺序部署到目标远程 Supabase。
- [x] 远程 `registration_invitation_status` RPC 返回受支持状态。
- [x] 远程 Email Confirm 明确关闭。
- [x] 远程准备一个有效邀请码。
- [x] 从 `/auth/sign-up` 完成一次真实浏览器注册，并确认 Profile、active Membership、Redemption、邀请码计数和审计记录。
- [x] 使用新注册名成功登录，确认不发送或等待验证邮件。
- [x] 手工授予 Author 后成功进入 Studio。

## Product Owner 当前验收结论

Phase 2 当前为 **Pass**。作者后台与读者后台已完成人工检查，远程注册 → 登录 → Studio 真实验收通过，Phase 2 Auth P0 已解除。Phase 3 尚未启动，仍需另行规划与明确授权。

## 远程验收环境准备结果

- 远程项目：`szfhngifsipsrxcpekti`。
- 九条 Migration 已部署，远程 Migration history 与本地顺序一致。
- `validate_registration_invitation` 与 `registration_invitation_status` 均返回 HTTP 200。
- 远程 `mailer_autoconfirm = true`，Email Confirm 已关闭。
- QA 邀请码已创建并通过远程 RPC 验证为有效。
- 根目录、Web 与 Admin 环境 URL 均指向该远程项目；Web 已从 `.env.local` 重新启动。

邀请码只授予 Reader；验收账号进入 Studio 前执行了独立的手工 Author grant，没有让邀请码自动提权。

Product Owner 已用注册名 `Auther001` 完成远程注册与登录。该账号的 Membership 为 `active`，手工 Author grant 已写入并审计，Product Owner 已确认成功进入 Studio。

## 部署前条件

目标 Supabase Project 已关闭 Email Confirm，九条 Migration 已部署。Product Owner 已在远程验收环境完成真实注册、登录与 Studio 进入确认。

## 边界

未新增 OAuth、Magic Link、MFA、邮件系统、复杂 Profile、密码找回、角色类型或第二套身份系统。未进入 Phase 3。
