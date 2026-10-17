# Package B4a-0.6：QA1 恢复与 Preview 前置核验

- 日期：2026-10-15（Asia/Shanghai）
- 状态：`QA1 RESTORED / PREFLIGHT BLOCKED / B4a-1 NOT READY`
- 范围：仅恢复 QA1、恢复后只读检查、Vercel 授权状态复核、B4a-1 门禁整理
- 唯一远端写入：恢复 Supabase QA1 `fandom-harbor-admin-p1-qa`

## 1. 执行结论

QA1 已按授权成功恢复，项目身份明确，Project Ref 为 `gqtchjrmpuxibxmurvfd`，与 Production `szfhngifsipsrxcpekti` 不同，恢复后状态为 `ACTIVE_HEALTHY`。恢复前组织为 Free 计划且只有 Production 一个 active 项目；恢复 QA1 后仍处于两个 active Free 项目的现有限额内，未出现付费升级或套餐变更要求。

严格只读 preflight 触发 Stop Gate。Migration catalog 与历史 20/21 证据一致，但数据库中的身份、Membership、角色、邀请、审计和 elevated commissioning 数据并不符合历史“合成身份及相关数据清理为零”的记录。所有 32 个 Auth 用户均为软删除，活跃用户为 0，Membership 与 Role Grant 均已 revoked，且未发现 Session、Refresh Token、MFA factor、Vault secret 或 transport proof 残留；但这仍是明确的数据状态冲突，不能据此擅自把 QA1 判为可复用。

因此：**QA1 当前不适合直接承担 V1 Preview，不得应用 Migration D、B1 或 B2，也不得现场清理或修复。** 推荐 Product Owner 选择新建独立 Preview；若坚持复用 QA1，需要另行授权专门的数据取证、历史对账和清理方案。

Vercel 访问尚未恢复。旧本机 Access Token 已过期，既有只读调用返回 403，本轮未循环重试或绕过认证。Preview Project、Branch/SHA、Deployment Protection、环境变量作用域、Supabase ref 与 Redirect URL 均保持 `UNKNOWN`。

## 2. QA1 恢复身份与费用门禁

| 检查项             | 结果                        |
| ------------------ | --------------------------- |
| 项目名称           | `fandom-harbor-admin-p1-qa` |
| Project Ref        | `gqtchjrmpuxibxmurvfd`      |
| 恢复前状态         | `INACTIVE`                  |
| 恢复后状态         | `ACTIVE_HEALTHY`            |
| Production Ref     | `szfhngifsipsrxcpekti`      |
| 与 Production 隔离 | Ref 层面 PASS               |
| QA2                | 未恢复，仍为 `INACTIVE`     |
| 组织计划           | Free                        |
| 恢复前 active 项目 | 1（Production）             |
| 恢复后 active 项目 | 2（Production + QA1）       |
| 付费/升级提示      | 未出现                      |

本轮未创建第三个项目、未恢复 QA2、未升级计划。QA1 当前保持 active，占用一个 Free active project 名额；暂停 QA1属于新的远端状态变更，本轮未获授权，因此未执行。

## 3. PostgreSQL、Extension 与 Migration History

- PostgreSQL：`17.6`，平台版本 `17.6.1.155`。
- 恢复过程中未观察到 minor upgrade。
- 已安装 Extension：`pg_stat_statements 1.11`、`pgcrypto 1.3`、`plpgsql 1.0`、`supabase_vault 0.3.1`、`uuid-ossp 1.1`。
- 恢复后项目健康：`ACTIVE_HEALTHY`。

Migration History 精确为 20 项：

1. `20260629210000 identity_access_foundation`
2. `20260629211000 invitation_workflows`
3. `20260629212000 membership_role_workflows`
4. `20260630100000 content_domain_foundation`
5. `20260701100000 v1_content_taxonomy`
6. `20260701101000 create_author_work_draft`
7. `20260701113000 chapters_body_update_grant`
8. `20260702090000 registration_name_invitation_signup`
9. `20260702120000 registration_invitation_status`
10. `20260702150000 social_relationship_foundation`
11. `20260703090000 published_work_public_authors`
12. `20260703100000 studio_owner_read_rpcs`
13. `20260703110000 search_mvp`
14. `20260703120000 browse_experience`
15. `20260730110000 admin_p0_site_copy_foundation`
16. `20260730120000 admin_p0_site_copy_baseline`
17. `20260817104616 admin_p1_identity_access_ledger`
18. `20260817121610 admin_p1_identity_access_reads`
19. `20260817125140 admin_p1_identity_access_writes`
20. `20260818120000 admin_p1_option_b_elevated_access_pred`

结论：Pre-D 已存在；Migration D `20260819225318_admin_p1_identity_access_cutover` 不存在；B1/B2 Migration 均不存在。Catalog 与历史 QA1 20/21 证据一致。本轮未执行、修复或伪造任何 migration history。

## 4. 恢复后身份与数据 Stop Gate

仅执行计数和状态分类，不读取或输出真实邮箱、用户名、UID、Token 或凭据。

| 对象                          | 数量/状态                                     |
| ----------------------------- | --------------------------------------------- |
| `auth.users`                  | 32；全部 `deleted_at is not null`，活跃用户 0 |
| `auth.identities`             | 0                                             |
| `auth.sessions`               | 0                                             |
| `auth.refresh_tokens`         | 0                                             |
| `auth.mfa_factors`            | 0                                             |
| `auth.one_time_tokens`        | 0                                             |
| `public.profiles`             | 32                                            |
| Membership                    | 23；全部 `revoked`                            |
| Role Grant                    | 23；全部 revoked，active role 为空            |
| Invitations / Redemptions     | 18 / 18                                       |
| `public.audit_logs`           | 37                                            |
| identity access ledger        | 11                                            |
| elevated commissioning policy | 1                                             |
| elevated access intents       | 13                                            |
| Vault secrets                 | 0                                             |
| transport metadata keys       | 0                                             |

一致性补充：未发现 profile、Membership 或 Role Grant 的孤立外键；32 个 Auth 用户均有 Profile；32 个账号全部符合历史 QA/管理员/Reader/Author 合成命名分类，27 个含明确 QA 标记。邮箱只做类别统计：9 个为 `.invalid`，其余 23 个为其他域名；没有输出具体值，也无法仅凭域名类别证明其一定不是真实地址。

历史清理证据要求 Auth、Profile、Membership、Role、Audit、Ledger 等合成状态为零。恢复后的实际 catalog 与该要求明显冲突。即使当前没有 active Auth user、Session、MFA 或 active role，也不得把“软删除/撤销”解释成“已清空”。

Stop Gate 处理：

- 未运行 Migration D、B1 或 B2；
- 未删除、修改或重新激活任何身份数据；
- 未修复 migration history；
- 未重置数据库；
- QA1 标记为 `NOT SUITABLE FOR PREVIEW PENDING PO DECISION`。

## 5. RLS、Trigger、RPC 与权限检查

- 已核查的 public/private 表均启用 RLS。
- `auth.users` 存在历史 `on_auth_user_registered` AFTER INSERT Trigger，调用 `private.register_identity_from_invitation`。
- B1 Trigger 不存在，与 B1 Migration 尚未应用一致。
- `private.execute_identity_access_ordinary_mutation` 为 invoker，`search_path` 为空，anon/authenticated/service_role 均无 EXECUTE。
- `grant_author_role_v2`、`revoke_author_role_v2`、`set_ordinary_membership_state_v2` 为 SECURITY DEFINER，`search_path` 为空，anon/authenticated/service_role 均无 EXECUTE，符合历史 QA safety-close 状态。
- Identity Access 读取函数对 anon 禁止、authenticated 允许、service_role 禁止。
- Pre-D elevated 与 legacy 管理函数仍允许 authenticated EXECUTE；这是 Migration D 尚未应用的历史状态，不是 Preview 最终安全状态。
- `private` schema：anon 无 USAGE，authenticated 有 USAGE，service_role 无 USAGE。
- Security Advisor 仍报告若干 RLS-enabled/no-policy 信息项、Security Definer 函数暴露告警及 leaked-password protection 关闭。部分公开浏览/搜索 RPC 属于既有公开合同，不能仅凭 advisor 结果判错；Pre-D 管理函数权限必须在未来获批的 Migration D 后重新核验。

由于数据 Stop Gate 已触发，这些 catalog 结果仅用于描述现状，不构成 QA1 可部署结论。

## 6. Auth Email Confirmation 与凭据检查

- Hosted Auth Email Confirmation 的实际管理配置未能获得权威读数，状态为 `UNKNOWN / NOT VERIFIED`。
- 本地 Supabase CLI 可列出 QA1 API key 元数据，仅确认存在 anon/service_role/default 类别；未输出任何 key 值。
- 使用发布级 anon key只读请求 `/auth/v1/settings` 两次均在连接层被重置，未获得配置；按“不循环重试”要求停止。
- 未修改 Auth、Mailer、Redirect URL、SMTP 或 Email Confirmation。
- 未发现 Vault secret、transport proof metadata、Session、Refresh Token、OTP 或 MFA factor 残留。

在 Hosted Auth 配置不可证明且 QA1 数据状态冲突的情况下，QA1 不满足 B4a-1 Migration/Auth 配置前置条件。

## 7. Vercel 访问与 Preview 隔离

Vercel 当前状态为 `NOT RESTORED`：

- 本机旧 Access Token 已于 2026-10-14 06:14:28 +0800 过期；
- 既有只读 API 尝试返回 `403 Not authorized`；
- 当前 worktree 无 `.vercel/project.json`；
- 本轮未刷新旧 Token、未尝试其他账号、未循环调用 API；
- Project `fandom-harbor-web` 的 Preview Branch/SHA、Protection、环境变量名称及 scope、Supabase Project Ref、Auth Redirect URL 均未核实。

Product Owner 需要进行一次人工操作：

1. 在浏览器登录拥有 `fandom-harbor-web` 的正确 Vercel 账户与 Team；
2. 完成 Passkey、Touch ID 或 MFA；
3. 打开该项目并确认可读取 Deployments、Settings、Environment Variables、Deployment Protection；
4. 保持会话并告知 Codex已登录且已打开项目；
5. 不提供 Token、Secret 或环境变量值。

Supabase 项目 Ref 层面的 QA1/Production 隔离已证明；Vercel 部署绑定仍为 UNKNOWN，因此端到端 Preview/Production 隔离尚未证明。

## 8. Git 与 B0/B1/B2 发布准备

- Branch：`codex/v1-package-b0-auth-architecture`
- HEAD / `origin/main`：`b8c9869ef285f5cc08c7820ac5d4aed0eac829f2`
- B0/B1/B2 运行时代码、Migration、测试、ADR 与验收材料保持完整。
- 自 B4a-0.5 后没有新的依赖变化；既有依赖修改仍为 `apps/web/package.json` 与 `pnpm-lock.yaml`。
- `git diff --check`：PASS。
- 本轮新增本验收记录；未修改业务代码、Migration 或配置。
- Reset/Clean/Stash/Commit/Push/PR/Merge/Deploy：NONE。

B4a-0.5 的 Commit 分组和顺序仍有效：Database foundation → Application Auth flow → Architecture/evidence。任何 Git 远端操作仍需单独授权。

## 9. B4a-1 最终门禁与 Product Owner 决策

B4a-1 当前为 `NOT READY`。至少需要关闭以下门禁：

1. **Preview Supabase 目标决策**：推荐授权新建独立 Preview 项目；若继续使用 QA1，必须先授权专门的身份数据取证、对账和清理方案，且不得把本报告视为清理授权。
2. **QA1 资源状态决策**：QA1 已恢复并占用 Free active slot；若选择新建 Preview，需先单独授权暂停 QA1，避免超过 Free active project 限额。
3. **Vercel 人工认证**：在正确 Team 完成浏览器登录和 Passkey/Touch ID/MFA，再授权只读续查。
4. **端到端隔离证明**：必须证明 Preview Vercel scope 指向唯一 Preview Supabase ref，且绝不指向 Production。
5. **Auth 配置证明**：在目标 Preview 上读取并记录 Email Confirmation、Redirect URL、registration mode、Hook 与 SMTP 基线。
6. **后续每阶段独立授权**：Commit/PR、Preview Deploy、Migration、Auth 配置、Resend/DNS/SMTP、合成邮箱发送必须分别授权。

在上述门禁关闭前，不得进入 Preview Migration、Auth 配置或外部邮件联调。

## 10. 远端与安全边界声明

本轮唯一远端状态改变是经批准恢复 QA1。未访问或修改 Production，未恢复 QA2，未新建项目，未执行 Migration，未修改 Auth/SMTP/DNS/Vercel，未发送邮件，未修改真实用户、Role 或 TOTP，未部署任何代码。

最终状态：`WAITING FOR PRODUCT OWNER B4a-1 AUTHORIZATION`
