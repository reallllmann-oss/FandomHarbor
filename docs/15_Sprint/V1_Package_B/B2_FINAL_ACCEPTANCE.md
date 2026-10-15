# Fandom Harbor V1 Package B2 最终验收记录

- 日期：2026-10-15
- 结论：**PASS — LOCAL / NON-PRODUCTION**
- ADR-025：`Proposed`（未 Accepted）
- Production / Preview：未配置、未发布、未授权

## 产品隐私决策

Product Owner 接受当前登录用户的真实邮箱存在于 Supabase 原生 JWT / SSR Session。保留 `@supabase/ssr` Cookie 和 Session 刷新机制，不另建自定义 opaque Session。

该决策仅适用于账号本人的 Auth Session，不放宽以下边界：公开 Profile、作者页、作品、搜索、普通 Data API、其他用户响应、日志、analytics 和共享缓存不得包含真实邮箱或认证凭据。

## 验收结果

| 项目                              | 状态            | 证据摘要                                                                                                                 |
| --------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 真实邮箱注册与 6 位 OTP           | PASS            | 真实本地 GoTrue `v2.191.0` + Mailpit；当前本地 OTP 有效期 15 分钟                                                        |
| 2 小时 invitation reservation     | PASS            | 重发/刷新不续期；过期释放；撤销阻止激活                                                                                  |
| pending → active 原子激活         | PASS            | Redemption、`use_count`、Membership 和 Audit 原子写入；重试幂等                                                          |
| 密码恢复、修改与普通邮箱变更      | PASS            | Recovery OTP、UID-bound 10 分钟 HMAC grant、其他 Session 撤销、Secure Email Change 双确认                                |
| 注册名 + 密码登录                 | PASS            | real-email 与 legacy `.invalid` 账号连续性通过                                                                           |
| 公开数据邮箱隐私                  | PASS            | `public` schema 无 email-like 列，无 email / `auth.users` 公开 view；公开页面与业务响应无邮箱投影                        |
| 跨账号 RPC / API                  | PASS            | 匿名 Profile API 与 service-only login resolver RPC 均返回 401；resolver 对 `anon` / `authenticated` 无 EXECUTE          |
| 本人 Supabase Session email claim | PASS — ACCEPTED | 仅当前登录用户本人原生 Session 可见；不作为公开或他人数据投影                                                            |
| 缓存边界                          | PASS            | B2 认证/账号页面为动态渲染；本地请求实测 `Cache-Control: no-cache, must-revalidate`；无认证 Route Handler 或显式共享缓存 |
| 日志、错误与密钥                  | PASS            | 运行时认证模块无凭据日志/analytics；错误为统一原因码；客户端 bundle 与仓库 secret scan 已通过                            |
| RLS / Grant / P1-07C 边界         | PASS            | B2 RPC 仅 `service_role`，限流表启用 RLS；未改动 Role、TOTP/AAL2 或 Super Admin                                          |

## 复用的测试证据

- Web：122 项 PASS。
- Auth：41 项 PASS。
- Database：161 项 PASS；B2 pgTAP PASS。
- TypeScript、ESLint、Production build PASS。
- B1 的 Admin Create User、Auth insert claim、并发、回滚、metadata/identity/proof 脱敏与公开 Signup 绕过防护证据继续有效。

本次未重跑上述大型测试，只执行公开数据/RPC 权限、动态响应缓存头、运行时日志和文档一致性的最小增量检查。

## 不在 B2 PASS 内的项目

- Preview Custom SMTP、发送域名、DNS、额度、真实投递、退信/投诉与告警属于 B4a。
- 存量 `.invalid` 邮箱、UID/TOTP 连续性迁移属于 B3，前置是 B4a PASS。
- Production SMTP、Email Confirmation、身份迁移和发布需要独立授权。
- ADR-025 继续为 Proposed；ADR-020 历史记录不变。

## B4a 启动前置

1. Product Owner 单独授权 B4a，并确定 Preview-only 范围。
2. 选定邮件供应商（Resend 或 Postmark）、独立发送子域、From 与 Reply-To。
3. 准备 SPF、DKIM、DMARC 验证和 Preview 专用 Custom SMTP credential；与 Production secret 完全隔离。
4. 批准仅合成收件人的确认、重发、恢复、普通邮箱变更中文模板和真实投递测试。
5. 明确 bounce/complaint/suppression、额度、基础限流、CAPTCHA、脱敏告警和运营责任人。
6. 建立停用 Preview SMTP、撤销 credential 且不触碰 Production 的回滚清单。
