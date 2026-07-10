# Phase 1 · Sprint 2 / Phase 1C — Identity Access Core

状态：Product Owner 已批准  
批准日期：2026-06-29  
Product Phase：Phase 1 — Identity

## Sprint 结果

建立 email/password 身份、邀请门禁、Membership、手工 Role Grant、审计基线和 RLS 双层强制，使 Visitor、Reader、Author、Admin 与 Super Admin 的基础允许/拒绝路径可验证。

> 2026-07-02 supersession note：本 Sprint 的邮箱凭据、邮箱验证与 Auth 邮件决策已由 Phase 2 D-037/ADR-020 替代。当前产品使用注册名/password 和原子邀请码注册；Membership、角色、审计与 RLS 模型保持有效。

## 已批准决策

- Supabase Auth email/password，必须验证邮箱；Magic Link 不进入本 Sprint。
- Resend 通过 Supabase Custom SMTP 发送 Auth 邮件；应用不引入邮件 SDK。
- 邀请兑换只产生 active membership；active membership 即 Reader capability。
- Author/Admin/Super Admin 仅通过手工 `role_grants` 授予与撤销，并写入审计日志。
- 角色不使用用户可编辑 metadata 或未验证 JWT claims 作为事实源。
- 首个 Super Admin 通过受控运维流程建立，不进入 seed 或仓库。

## 范围内

- RuntimeConfig 的 public/server 环境分离与 Zod 校验。
- TrustedIdentity、Session 与 capability 内部类型。
- Supabase browser/server/proxy client adapter，provider 类型不进入业务层。
- `profiles`、`memberships`、`role_grants`、`invitations`、`invitation_redemptions`、`audit_logs` migration。
- 邀请 hash、次数、期限、撤销、邀请链与原子兑换。
- Membership 暂停/撤销与 Role Grant 授予/撤销。
- 数据库 RLS/grant/helper function 与 allow/deny 测试基线。
- Web/Admin 只读访问壳层，不引入 Phase 2 业务。
- ObjectStorage interface 只定义 contract，不实现第二 provider。

## 范围外

- Magic Link、OAuth、MFA 与社交登录。
- 远程 Supabase/Resend 账号、SMTP 凭据、DNS 或云资源创建。
- Pen Name、Works、Chapters、文件上传、评论、举报与分析。
- 自动传播邀请链制裁。
- 任何公开注册或邀请自动提权。

## 验收标准

- [x] Provider User/Session 类型不出现在 app/domain 公开合同。
- [x] 缺失或非法环境变量在系统边界失败，且不泄漏密钥。
- [x] Visitor 与 inactive/suspended/revoked member 的服务端 capability 和 RLS 合同默认拒绝。
- [x] 有效邀请的原子兑换、active membership 与 audit event 已进入同一数据库函数。
- [x] 过期、撤销、耗尽、重放或不匹配邀请均有数据库拒绝分支。
- [x] 邀请兑换不创建 Author/Admin/Super Admin role grant。
- [x] Author/Admin/Super Admin 授予/撤销与 audit event 已实现并通过静态迁移合同检查。
- [x] Membership 暂停/撤销在数据库 helper 与服务端 capability 中立即失效。
- [ ] Migration 从空库重建及 SQL allow/deny 脚本实际执行（当前环境无 Supabase CLI、psql 或 Docker）。
- [x] Type、Lint、Test 与 Build 通过。

## 验证证据

- Frozen install：通过，13 个 workspace 与 lockfile 一致。
- Type：8/8 workspace tasks 通过。
- Lint：8/8 workspace tasks 通过；仅有非阻塞的共享 ESLint pages/react 探测提示。
- Test：8/8 workspace tasks 通过，16 个可执行测试全部通过；无测试的 app 使用显式 `passWithNoTests`。
- Build：web/admin/docs 三个 Next.js 应用通过；沙箱内 Turbopack 端口限制经受控非沙箱等价重跑确认。

## 执行边界

本 Sprint 已获得 Phase 1C 认证、Schema、RLS、package manifest 和 lockfile 的 Level 3 授权。任何新依赖、第二 provider、远程资源、未批准 API Contract 或超出上述数据对象的 Schema 变更必须重新审批。
