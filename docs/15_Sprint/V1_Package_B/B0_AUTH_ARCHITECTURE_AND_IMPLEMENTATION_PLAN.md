# Fandom Harbor V1 Package B0 — 真实邮箱认证架构与实施计划

状态：`B2 PASS — LOCAL / NON-PRODUCTION / ADR PROPOSED / PRODUCTION NOT AUTHORIZED`

代码基线：`origin/main` / `b8c9869ef285f5cc08c7820ac5d4aed0eac829f2`

## 1. B0 结论

- 新账号采用 Supabase Auth email + password、Email Confirmation 和 6 位 OTP，保留“注册名 + 密码”登录界面。
- 真实邮箱只保存在 Supabase Auth；服务端通过注册名解析 UID，再在 server-only secret boundary 中读取 Auth email 并执行密码登录。
- 邀请码采用固定 2 小时 reservation；邮箱验证成功才创建 Redemption、增加 `use_count` 和激活 Membership，重发不续期。
- 注册采用 server-only prepare → 预分配 Auth UID → Auth Admin Create User → Auth insert triggers 的可信握手；Before User Created Hook 只拒绝公开 Signup，不把邀请码预检与 Auth 创建误写为同一事务，也不使用 `user_metadata` 运输敏感凭据。
- 存量账号必须在相同 Auth UID 上原地把 `.invalid` email identity 改为真实邮箱；不删除、不重建、不改角色/作品归属。
- Reader/Author 可在完成旧密码证明后自助迁移；Admin/Super Admin 使用独立、逐账号、AAL2/fresh TOTP 变更窗口。
- Supabase 原生 6 位 OTP 对 signup、recovery 和普通 email change 可行。legacy `.invalid` 邮箱的双确认编排必须先在隔离项目验证，是 B3 Stop Gate。
- 正式邮件使用 Custom SMTP。首选候选为 Resend Supabase integration，Postmark 为备选；Production 配置不属于 B0–B3 普通开发授权。

完整决策草案见 [`ADR-025`](../../17_Architecture_Decisions/ADR-025.md)。

## 2. Supabase 技术可行性

| 能力                     | 当前官方能力                                                                     | B0 判定                               |
| ------------------------ | -------------------------------------------------------------------------------- | ------------------------------------- |
| Signup 6 位验证码        | 模板可使用 `{{ .Token }}`；项目当前 `otp_length=6`                               | 可行，推荐                            |
| Signup 前置门            | PostgreSQL Before User Created Hook 可在插入前检查并拒绝 user；Hook 在事务中运行 | 可行；B1 必须实证回滚语义             |
| OTP expiry               | `auth.email.otp_expiry` 可配置；当前为 3600 秒                                   | 推荐改为 15 分钟，待 PO 确认          |
| 重发                     | `auth.resend({ type: "signup" })`                                                | 可行；60 秒冷却且不延长邀请预留       |
| 密码恢复                 | `resetPasswordForEmail` + `verifyOtp(type: "recovery")` + `updateUser`           | 可行                                  |
| 当前密码修改             | `updateUser({ password, current_password })`，当前 SDK 版本满足要求              | 可行；同时开启 secure password change |
| 常规邮箱变更             | `updateUser({ email })` + Secure Email Change                                    | 可行；旧、新邮箱双确认                |
| 存量 `.invalid` 邮箱变更 | Admin native email-change 两臂可生成；旧地址不可收信且 new-arm hash 存在已知风险 | 条件可行；B4a 后执行 B3 Stop Gate     |
| Session 撤销             | `signOut` 支持 global/local/others；access JWT 在 expiry 前仍可能有效            | 可行；敏感操作继续核对 session_id     |
| TOTP/AAL2                | factor 绑定 Auth UID；email change 理论上不应换 UID/factor                       | 必须以隔离前后 inventory 证明         |
| Custom SMTP              | Hosted Supabase 支持标准 SMTP，官方建议 Production 使用                          | 可行；Preview 和 Production 分离      |

Supabase 2026-06-03 起对新 Free 项目默认邮件服务的模板定制有限制；默认服务还只适合测试。正式 V1 不以默认 SMTP 作为回退生产通道。

## 3. 注册、邀请与 Membership 状态表

| 事件                        | Auth email                         | Reservation       | Membership      | Invitation use_count | 用户结果                      |
| --------------------------- | ---------------------------------- | ----------------- | --------------- | -------------------- | ----------------------------- |
| prepare 成功、Auth 未创建   | 尚无 user                          | reserved，最多 2h | 尚无            | 不变                 | opaque attempt 可安全重试     |
| Auth 创建成功               | unconfirmed                        | reserved，最多 2h | pending         | 不变                 | 显示输入验证码页              |
| 邮件即时发送失败            | unconfirmed                        | 保持 reserved     | pending         | 不变                 | 通用失败 + 安全重试           |
| 重发                        | unconfirmed                        | 不变、不延长      | pending         | 不变                 | 新 OTP，旧 OTP 失效行为需测试 |
| OTP 错误                    | unconfirmed                        | 不变              | pending         | 不变                 | 统一错误，计入限流            |
| OTP 成功且 reservation 有效 | confirmed                          | consumed          | active          | +1                   | 建立 Session，进入 Reader     |
| OTP 成功但 reservation 过期 | confirmed                          | expired           | pending         | 不变                 | 登录后要求新邀请码            |
| invitation 被撤销           | 不变                               | released          | pending         | 不变                 | 不再允许激活                  |
| 重复 OTP / 网络重试         | confirmed                          | consumed          | active          | 不重复增加           | 返回幂等成功                  |
| 数据库任一步失败            | 原 Auth transaction 按实际结果核对 | 不得留下部分写入  | 不得错误 active | 不变                 | Stop，记录脱敏错误            |

### 3.1 并发不变量

1. invitation 行锁仍是名额串行化边界。
2. `use_count + active reservations <= max_uses`。
3. 同一 registration attempt / UID 同时最多一个 reservation；同一 reservation 最多一个 redemption。
4. activation 必须在单个数据库事务中完成 reservation、redemption、counter、membership 和 audit。
5. 已过期 reservation 在所有容量查询中立即无效，后台清理失败不影响正确性。
6. resend、页面刷新和重复提交不创建第二个 reservation。
7. legacy 与 email-required signup 的切换由数据库受控 mode 决定，不接受 `user_metadata` 提供的模式声明。

### 3.2 Auth 创建与邀请码可信关联（B1-R3 修订）

真实 GoTrue `v2.191.0` 证明 `signUp(options.data)` 会同时复制数据到 user metadata、identity data 和 Signup 响应；数据库脱敏 trigger 不能保证响应不回显。因此废弃“proof 通过 Auth metadata 运输”的方案，改为 **数据库预分配 UID + server-only Auth Admin Create User + Auth insert 原子 claim**：

1. Server Action 调用仅 server secret 可执行的 `prepare_registration_attempt`。事务 T1 对 invitation `FOR UPDATE`，计算数据库权威 `login_name_key`，声明唯一 login-name claim，生成随机 UUID v4 `expected_auth_user_id`，创建 registration attempt 与 `least(now() + interval '2 hours', invitation.expires_at)` reservation。
2. T1 仍生成至少 256-bit CSPRNG proof，但 proof 只用于受保护的 status/retry/release 和未来 opaque HttpOnly cookie；数据库只存 hash。proof/attempt ID 不进入 GoTrue `user_metadata`、identity、Auth 响应或 Session。数据库另存 `SHA-256(canonical email || NUL || expected UID)` 绑定。
3. Server Action 在单个 `server-only` 高权限边界调用 Auth Admin Create User，提交 expected UID、email、password、`email_confirm=false` 和空 metadata。随机 UID 本身不是唯一授权依据；服务端 secret、私有 attempt、邮箱 binding、状态/时间谓词和 insert trigger 共同构成安全边界。
4. Before User Created Hook 在 `email_required` mode 只读 fail-closed 拒绝普通公开 Signup。Admin Create User 实际不会执行该 Hook，因此不再让 Hook claim，也不假设 Hook 与 Auth insert 同事务。
5. `auth.users BEFORE INSERT` 在 T2 内锁定 invitation/attempt/reservation，核对 expected UID、email binding、短期 attempt 窗口、2 小时 reservation、撤销/过期和 login-name claim，然后用条件 `UPDATE ... RETURNING` 一次性 claim。延迟 FK 保持完整。
6. `auth.users AFTER INSERT` 在同一 T2 创建 Profile/pending Membership、转换 login-name claim；任何写入失败连同 Auth user 和 claim 整体回滚。不创建 Redemption、不增加 `use_count`。
7. Admin Create 不发送确认邮件。成功后调用 Supabase 原生 signup resend；`generateLink(type: signup)` 仅作为版本行为验证，不作为投递路径，因为它不发送邮件且会更新 resend 冷却时间。
8. T1 与 T2 是两个事务。明确失败且确认 user 未创建时使用 proof 幂等 release；网络结果不明时只信任私有 attempt 状态，`auth_created` 转 resend，仍为 `prepared` 才受控释放，否则保留至硬 expiry。重试和 proof 轮换不得改变 expected UID 或 reservation expiry。
9. T3 由首次 email confirm 触发，在一个数据库事务内完成 reservation consume、Redemption、`use_count`、Membership active 和 Audit；verified 但过期/撤销时仍保持 pending。

`login_name_key` 的规范化仅由数据库 `canonical_login_name(text)` 决定：NFKC → trim → 数据库 `lower`。现有 `lower(registration_name)` 数据须先做冲突盘点；冲突即 Stop Gate。登录 broker 调用只授予 `service_role` 的解析 RPC，应用层 JS 结果只能用于输入提示。

## 4. 存量迁移方案

### 4.1 准备和盘点

- 只读统计 `.invalid` / real / null email 状态、UID、Profile、Membership、active roles、content ownership、verified MFA factor count。
- 不导出或记录真实邮箱、密码、TOTP secret、QR、OTP、refresh token。
- 为每个 UID 生成非敏感 migration ledger：状态、开始/结束时间、操作 ID、旧身份类型、验证结果和失败原因码。
- 在隔离环境对 2026-10-10 备份恢复或等价合成数据完成 Auth schema 兼容验证。

### 4.2 Reader / Author 自助绑定

1. 旧登录保持可用。
2. 用户输入真实邮箱，以当前 `.invalid` email + 现有密码重新完成 `signInWithPassword`，并核对 UID 与当前 Session 相同。
3. 创建短期、单 UID、单 `session_id`、单目标 keyed fingerprint 的 binding operation；不保存真实邮箱或 token。
4. Admin `generateLink` 生成 `email_change_current` / `email_change_new` 两臂。current arm 只能在 fresh password 证明后由无持久 Session 的服务器 client 提交；不得发送到不可投递旧地址。
5. migration-only sender 把 new-arm `properties.email_otp` 发送到新邮箱；用户提交后由 Supabase `verifyOtp({ email: newEmail, token, type: "email_change" })` 证明所有权。不得使用 new-arm `properties.hashed_token`，除非未来上游修复且重新完成版本锁定验证。
6. 两臂完成前旧登录保持可用；完成 native email identity change 后核对 Auth UID、identity row 和 password continuity 未变。
7. 标记 `verified`，global sign-out，清除旧 Session/reauth 上下文，再以注册名 + 密码登录。
8. Author 额外验证 draft/work owner UUID 与迁移前一致。

`generateLink` 不会自行投递邮件。Supabase Auth open issue #2538 表明 `email_change_new.properties.hashed_token` 可能与实际存储的新邮箱 token 不一致，而 `action_link` token 来源正确。B3 必须在版本/配置与 Production 目标一致的隔离项目验证：两臂生成和确认顺序、raw OTP、从 action link 解析的 token、expiry/replay、Secure Email Change、`mailer_autoconfirm`、identity row 和 Session。任何一项不稳定即 Stop Gate，禁止用 Admin 直接确认新邮箱或改 `auth.users` 内部 token 列绕过。

### 4.3 冲突处理

- Auth 返回 email already exists 时只显示“该邮箱无法绑定，请联系支持”，不透露关联账号。
- 不自动 merge、delete、transfer role 或 transfer content。
- 同一人有多个账号时，默认要求不同真实邮箱；账号合并需要独立产品与数据迁移决策。
- binding pending/expired 可以重试；已验证邮箱不能被另一个 UID 抢占。

### 4.4 未完成迁移过渡

- 保持旧用户名 + 密码登录和现有 UID。
- 明确提示未绑定账号无法使用密码恢复。
- 真实存量账号获批后的迁移分批：Super Admin → Admin → Author/Reader；Production 新注册切换由 Package E 独立 Gate 决定，不以真实账号试迁移代替 Preview 验证。
- 截止后的能力限制由 Product Owner 决定；B0 不自动封禁或撤销 Membership。

### 4.5 回滚和恢复

- 两臂均未完成：取消/过期 binding operation，旧 alias 和旧登录不变。
- current arm 已完成但 new arm 未完成：允许在 operation 期内重发 new-arm OTP；到期后只使用隔离验证过的 Supabase 支持路径重启。若无法安全清理 pending change，停止该批次并转人工恢复，不直接改 Auth 内部列。
- new arm 失败、退信或冲突：旧 email 必须仍可登录；统一错误，不暴露邮箱归属。
- 绑定完成后：优先关闭功能旗标、停止下一批并保留已验证邮箱；不批量回写 `.invalid`。
- 单用户 identity 损坏时：global sign-out，停止后续迁移，在获批事故窗口对相同 UID 执行恢复，并核对 identity、Membership、roles、content 和 factor inventory；禁止删除重建。
- 数据库 Migration 采用前向兼容；reservation/account-security 表可停用但不破坏已有数据。

## 5. Super Admin 迁移门禁

每名 Super Admin 必须单独完成以下清单：

- [ ] 另一名 Super Admin 保持可登录和 fresh TOTP 能力。
- [ ] 迁移前 UID、Membership、roles、verified factor IDs/count、Session ID 和未消费 elevated intents 已做脱敏快照。
- [ ] 当前密码验证 PASS。
- [ ] AAL2 + fresh TOTP PASS。
- [ ] legacy current-arm operation 与 UID、session_id、target email fingerprint、expiry 绑定。
- [ ] 新邮箱 OTP PASS。
- [ ] Auth UID 未变。
- [ ] 两个 verified TOTP factors 的 ID/status/count 未变。
- [ ] old sessions 已撤销；新 session_id 与 fresh TOTP 建立。
- [ ] protected Admin read、ordinary Admin denial、role ledger 和 audit PASS。
- [ ] 无第三名 Super Admin、无新 role grant、无 Membership 变化。

任一项失败立即停止，不迁移第二名。该验证不重跑 Migration D 或 commissioning。

### 5.1 用户名登录代理安全合同

- 只有单个 `server-only` 模块可读取 `SUPABASE_SECRET_KEY`；变量不得使用 `NEXT_PUBLIC_`，模块不得被 Client Component、共享 barrel 或 browser test import。
- secret client 仅调用受限 login resolver RPC 和 Auth Admin `getUserById`；密码校验与 Session 签发仍由普通 publishable-key SSR client 的 `signInWithPassword` 完成。
- resolver RPC 在数据库内执行权威 NFKC/trim/lower 规范化，只返回 UID；随后读取的真实邮箱只在服务器内存存在，不进入响应、URL、日志、analytics、Profile 或普通 Data API。
- 不存在的注册名、错误密码、未迁移/已迁移账号均返回同一中文错误、HTTP 状态和跳转。不存在账号走固定成本 decoy Auth/等价时间路径，并对 IP + login fingerprint 分层限流。
- 监控只记录脱敏 reason code、rate-limit bucket 和 request correlation ID；严禁记录注册名原文、邮箱、密码、Auth user object、secret 或 Supabase 完整错误。
- legacy `.invalid` 与已迁移真实邮箱都通过 UID→`getUserById` 动态解析，因此同一登录界面连续可用，不在业务表维护第二份 email mapping。
- 必须有 build artifact/secret scan、客户端 bundle 检查、响应快照和计时分布测试；发现 secret/email 泄露或可利用枚举差异即 Stop Gate。

## 6. 正式邮件方案

### 推荐

1. **首选：Resend Custom SMTP** — Supabase 有直接 integration，适合当前小规模事务邮件和 Preview 联调。
2. **备选：Postmark Transactional SMTP** — bounce/complaint 和 transactional stream 运维能力明确。
3. **扩展选项：AWS SES** — 适合更高量级，但 sandbox、IAM、DNS 和运营工作更多。

### 必要配置

- Preview 和 Production 独立 SMTP credential、发送子域和额度。
- From 使用受控域名；Reply-To 指向有人处理的支持邮箱。
- DKIM verified；SPF/Return-Path aligned；DMARC 从监控策略逐步收紧。
- 关闭 click/open tracking；模板不使用会被邮件扫描器预取的一次性直达链接，主要采用 6 位 OTP。
- Supabase Auth URL allowlist 只包含明确的 local、Preview、Production callback。
- 邮件模板全部为简体中文，包含用途、有效期、非本人操作说明和官方域名提示。
- 监控 immediate SMTP error、bounce、complaint、suppression 和发送量异常；不得记录 OTP 或邮件正文。

### Preview 验收矩阵

- 主流邮箱至少覆盖两个不同供应商；验证码到达、延迟和垃圾箱行为有记录。
- signup、resend、recovery、normal email change、password changed notification 均 PASS。
- OTP 一次性、错误次数、expiry、旧验证码、跨邮箱使用全部拒绝。
- 发送失败不激活 Membership、不消费 invitation。
- 链接跟踪关闭，模板不泄露 registration name 以外的账号资料。
- Production credential、真实用户地址和正式 DNS 不参与 Preview 测试。

## 7. 数据库和代码修改清单

以下均为下一阶段计划，B0 未创建这些实现：

### Database / Supabase

- `supabase/migrations/<cli-generated>_v1_email_identity_reservations.sql`
  - `canonical_login_name`、login-name claims、account security state、registration attempts、2 小时 invitation reservations、受控 registration mode、原子 prepare/claim/release/consume、email-confirm activation trigger、RLS/grants/audit。
- PostgreSQL Before User Created Hook（随同一个 CLI 生成的 Migration 版本化）
  - 仅 `supabase_auth_admin` 可执行；revoke `PUBLIC`/`anon`/`authenticated`；`email_required` mode 默认拒绝无有效 attempt proof 的密码注册。
- `supabase/tests/v1_email_identity_reservations.sql`
- `supabase/tests/v1_email_identity_reservations_concurrency.sql`
- `supabase/tests/v1_email_signup_hook.sql`
- `supabase/tests/v1_email_identity_migration_continuity.sql`
- `supabase/config.toml`
  - local Email Confirmation、6 位 OTP、expiry、secure password change、rate limit、local templates；Production 值不写入仓库。
- `supabase/templates/`
  - confirmation、recovery、email change、reauthentication 和 security notifications 中文模板。

### Packages

- `packages/config/src/runtime-config.ts`
  - 新建独立 server-secret parser；明确禁止 secret 进入 public config。
- `packages/auth/src/provider.ts`
  - signup pending、verify/resend、recovery、password/email update API。
- `packages/auth/src/registration-policy.ts`
  - real email 和注册名 UX validation；数据库 canonical login-name contract；退休派生 `.invalid` 的新注册用途，但保留 legacy helper 至迁移结束。
- `packages/auth/src/*.test.ts`
  - 防枚举、OTP/error mapping、Session 和 UID contract。
- `packages/database/src/`
  - registration-attempt/reservation/login-claim/account-security repositories 和 migration contract tests。
- `packages/services/src/`
  - registration application、activation、legacy binding orchestration 与幂等错误合同。

### Web

- `apps/web/src/lib/server-registration.ts`（B1 已新增，`server-only` 注册 broker）
- `apps/web/src/lib/server-auth-broker.ts`（B2 用户名登录 broker）
- `apps/web/src/lib/identity-access.ts`
- `apps/web/src/app/auth/actions.ts`
- `apps/web/src/app/auth/sign-up/page.tsx`
- 新增：`/auth/verify-email`、`/auth/resend`、`/auth/forgot-password`、`/auth/reset-password`
- 新增：账号安全页和 legacy email binding 页面
- 相应 action/component tests、无障碍和 390px/1280px browser smoke。

### Deployment / operations

- `.env.example` 只增加 secret 变量名和假值，不记录真实 credential。
- Preview/Production Vercel 与 Supabase Dashboard 分别保存 `SUPABASE_SECRET_KEY`、SMTP credential、CAPTCHA secret。
- 新增 legacy migration 和 SMTP/DNS runbook；不修改 Admin/Author Studio 业务页面。

## 8. B1–B4 连续工作包

### B1 — Trusted Signup Handshake、Reservation 与 Pending Membership（约 5 小时）

状态：**PASS — LOCAL / NON-PRODUCTION**。B1 关键链路已完成并成为 B2 的已验证基础；Migration 仍未获 Production 批准，ADR-025 仍为 Proposed。

范围：一个 additive Migration；数据库 login-name claims、registration attempt、expected Auth UID + email binding、2 小时 reservation 和受控 registration mode；server-only prepare/status/release；公开 Signup fail-closed Hook；Auth BEFORE INSERT 原子 claim；AFTER INSERT pending Membership；验证后原子激活；兼容旧 redemption；新增最小 `server-only` 注册 broker，统一持有 Admin secret、prepare→Admin Create→status/release 补偿→resend 调用边界。功能旗标默认 `legacy`，broker 尚不暴露为浏览器 Action。

已验证：真实 GoTrue Admin Create 保留预分配 UID且不发送邮件；公开 Signup 被拒；proof 不进入 Auth metadata/identity/API/Session/JWT；错误邮箱、同 UID 并发、AFTER INSERT 和后续 BEFORE INSERT 故障均 fail closed/回滚；两连接最后名额不超售；2 小时/邀请码提前到期/撤销/幂等；Mailpit 原生确认驱动 T3；过期确认保持 pending 并可用新邀请码恢复；Migration 从零回放和 159 项 database tests PASS；Web 111 项 tests 与 typecheck PASS，覆盖 broker 不接受 caller UID、secret 不进入 resend/返回值、明确失败 release、模糊网络失败不错误释放和投递失败保留 pending。

风险：B2 已在本地接入 broker、opaque cookie、注册限流/防枚举和真实邮箱 UI；Preview SMTP/DNS、供应商额度/退信、CAPTCHA 和存量注册名 NFKC 冲突盘点仍属于发布前 Gate。

Stop Gate：公开 Signup 可绕过；expected UID/email 可被冒用；proof 出现在 GoTrue identity/响应/Session/log；任何半写入、超售、未验证 active Membership、存量 UID/role/TOTP 变化或 login-key 冲突未处理，立即停止。

回滚：registration mode 保持 legacy；Migration 只做 additive/forward-compatible，未开启新流量前可停用新 trigger path，不删除新表历史。正式切换必须先暂停注册，禁止依赖客户端 metadata 做模式选择。

### B2 — OTP、恢复与用户名登录代理（约 5 小时）

状态：**PASS — LOCAL / NON-PRODUCTION**。Product Owner 已接受登录用户本人真实邮箱存在于 Supabase 原生 JWT / SSR Session；未配置 Preview/Production SMTP，未切换 Production。

已完成：B1 broker 接入受控 Server Action；service-only UID resolver、真实邮箱注册、opaque attempt cookie、verify/resend、forgot/reset、当前密码修改、UID-bound 短期 HMAC recovery grant、普通真实邮箱双确认变更、中文本地模板、统一错误、Origin/CSRF 校验和 HMAC subject 限流。未重新引入 Auth metadata transport proof，浏览器不能提供 expected UID。

已验证：真实 GoTrue/Mailpit 的 signup/recovery/email-change 6 位 OTP（当前本地有效期 15 分钟）；错误、过期、重放拒绝；刷新/重发不延长 2 小时 reservation；pending 权限隔离和 T3 原子激活；公开 Signup 绕过拒绝；real-email/legacy 注册名登录连续性；旧密码失效、伪造 recovery cookie 拒绝、其他 refresh session 撤销；客户端 bundle/metadata/identity/日志无 secret 或 proof。公开页面和业务响应不显示邮箱，标准 `@supabase/ssr` Session Cookie 中的本人 email claim 按产品决策接受；不引入自定义 Session。Web 122、Auth 41、Database 161 项测试、B2 pgTAP、typecheck、lint 与 Production build PASS。

最小隐私增量验收：`public` schema 无 email-like 列及相关 view；匿名 Profile API 与 service-only login resolver RPC 均返回 401；普通 invitation RPC 不返回 email；认证相关动态页面实测返回 `Cache-Control: no-cache, must-revalidate`；服务端认证模块无 analytics 或凭据日志调用，最小请求日志仅含路径、状态与耗时。

剩余风险：本地 Mailpit 不证明外部送达、DNS 信誉、bounce/complaint 或正式额度；Turnstile 和 Preview 计时分布验收留在 B4a；legacy `.invalid` 邮箱绑定留在 B3。公开/跨账号邮箱泄露、凭据进入日志或认证响应进入共享缓存仍是 Stop Gate。

Stop Gate：secret 或凭据出现在客户端 bundle、URL、日志或普通 API；真实邮箱出现在公开或他人响应；认证响应进入跨用户共享缓存；未验证用户获得 capability；枚举响应分叉。本人 Supabase Session 的 email claim 不属于泄露。

回滚：数据库 registration mode 保持/恢复 `legacy`，Email Confirmation 关闭并保留旧登录；Preview 清理只操作合成账号。当前本地环境已恢复该基线。

### B4a — Preview 邮件基础设施前置（约 3–5 小时）

范围：PO 选定供应商；仅 Preview 发送子域/DNS/Custom SMTP/中文模板/额度/CAPTCHA；关闭 tracking；建立 migration-only sender 的隔离 credential 与脱敏监控；只使用合成收件地址。

测试：DKIM/SPF/DMARC、signup/resend/recovery/normal email change、OTP 到达/过期/重放、bounce/complaint/suppression、限流和模板中文回退。

风险：DNS 生效、供应商 sandbox/额度、邮件扫描器、异步退信、Preview credential 泄露。

Stop Gate：DKIM/SPF/DMARC 未验证、默认 SMTP 被误用、tracking 改写凭据、模板回退英文、真实用户收到测试邮件。B4a 未 PASS 不进入 B3。

回滚：停用 Preview SMTP/hook/sender、撤销 Preview credential；不触碰 Production。

### B3 — 存量 UID 迁移与 Elevated Identity Continuity（首轮约 5 小时）

前置：B4a PASS。范围：legacy binding operation、current/new native email-change 编排、migration-only sender 接线、migration ledger、Reader/Author continuity tests、Super Admin dry-run checklist；只在版本/配置匹配的隔离项目使用合成身份。若证据未在 5 小时内闭合，拆分下一轮，不压缩 Stop Gate。

测试：两臂顺序、`email_otp`、action-link token、#2538 hash divergence、expiry/replay、collision、pending failure/restart；相同 UID/password/Profile/Membership/roles/content/identities/TOTP factors；Session rotation；AAL2/fresh TOTP。

风险：`.invalid` current arm 替代凭据证明、Supabase generated-link 上游行为、Secure Email Change/`mailer_autoconfirm` 组合、factor/session 意外变化、pending change 无安全取消路径。

Stop Gate：无法用 Supabase 原生 new-arm OTP 证明新邮箱所有权并保留 UID/TOTP；必须信任 `properties.hashed_token` 或直接确认邮箱；current-only pending 无安全恢复路径；任何 continuity 差异。

回滚：取消/过期 binding operation、关闭 binding 旗标、保留旧 alias；已完成的合成账号仅作为隔离证据，不推导 Production 已安全。

### B4b — Preview 最终 Auth 回归（约 3–5 小时）

范围：串联 B1/B2/B4a/B3 的合成账号 E2E；覆盖注册→2 小时 reservation→OTP→Membership active、恢复、常规邮箱变更、legacy binding、用户名登录、移动/桌面错误态；形成 Production 配置和逐项回滚清单。

测试：全链路 happy/failure/retry、direct signup bypass、邮件失败、2 小时过期、bounce/complaint、限流、监控、secret scan、build/typecheck 与轻量浏览器 smoke。

Stop Gate：任何 P0 路径失败、中文模板/错误缺失、未验证 capability、邮箱/secret 泄露、Production 配置无法独立执行或回滚。

回滚：关闭 Preview 新注册/绑定 flag，撤销 Preview credential，保留旧登录；不触碰 Production。

最终依赖顺序固定为 **B1 → B2 → B4a（Preview 邮件基础设施）→ B3（隔离迁移验证）→ B4b（最终回归）**。Production SMTP、Production Email Confirmation、真实账号迁移和正式发布属于 Package E/独立安全授权，不由 B4 自动执行。

## 9. Product Owner 决策与待确认

1. 已决策：邀请码 reservation 固定 2 小时，resend 不续期，撤销立即阻止未完成激活；6 位 OTP 当前本地验证有效期为 15 分钟。
2. 已决策：接受“预分配 Auth UID + server-only Admin Create + Auth insert claim”和 Supabase 原生 SSR Session 中的本人 email claim；不引入自定义 Session。该批准不等于授权 Production Migration。
3. 邮件供应商选择：Resend（推荐）或 Postmark；是否保留 AWS SES 作为未来扩展。
4. Preview/Production 发送子域和 From/Reply-To 地址命名。
5. 密码修改后是撤销“其他 Session”（推荐）还是所有 Session。
6. 存量迁移截止时间，以及截止后 Reader/Author 的能力限制。
7. 一个自然人拥有多个现有账号时，是否接受“每账号不同邮箱”；账号合并明确不在 Package B。
8. B3 隔离验证全部 PASS 后，是否允许另行申请按 Super Admin → Admin → Author/Reader 顺序的 Production 迁移授权。
9. DMARC 从 `p=none` 升级到 `quarantine/reject` 的观察期和运营负责人。

## 10. Production Stop Gate（延续 B0 安全边界）

本地 B1/B2 授权已完成，但 ADR-025 仍为 Proposed。在 Product Owner 对后续阶段和 Production 另行批准前：

- 不在 Preview/Production 执行本地 Migration；
- 不开启 Preview/Production Email Confirmation；
- 不配置 Preview/Production SMTP/DNS；
- 不迁移任何真实账号；
- 不写入 Production；
- 不自行进入 B4a、B3 或 B4b。
