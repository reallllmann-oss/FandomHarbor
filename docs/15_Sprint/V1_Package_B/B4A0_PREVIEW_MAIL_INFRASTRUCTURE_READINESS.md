# Package B4a-0：Preview 邮件基础设施只读准备报告

- 日期：2026-10-15（Asia/Shanghai）
- 状态：`COMPLETE — READ-ONLY / B4a-1 NOT READY`
- 范围：公开 DNS、仓库与部署基线、Supabase/Vercel 只读状态、Resend 候选能力、B4a-1 执行与回滚计划
- 前置证据：Package B2 `PASS — LOCAL / NON-PRODUCTION`
- 不代表：Preview/Production 已配置、已部署、已应用 Migration、已发送真实邮件或 ADR-025 已 Accepted

## 1. 执行摘要

B4a-0 的只读准备工作已完成。`fandomharbor.com` 和 `www.fandomharbor.com` 当前解析、跳转及 HTTPS 正常，必须原样保护。建议的 `preview-auth.fandomharbor.com` 与 `auth.fandomharbor.com` 当前未发现已用记录，可分别作为 Preview 与 Production 认证邮件发送子域，但最终域名、From、Reply-To 仍需 Product Owner 批准，所有 DNS 记录值必须以未来 Resend 控制台实际生成值为准。

B4a-1 当前不具备安全执行条件，原因如下：

1. 只读项目清单中不存在 `ACTIVE_HEALTHY` 的非生产 Supabase 项目；两个历史 QA 项目均为 `INACTIVE`。在未明确专用 Preview Project Ref 前，禁止把 Preview Web 接到 Production。
2. 当前 Vercel 本地链接仅能确认项目名为 `fandom-harbor-web`；现有凭据对只读 API 返回 `403 Not authorized`，因此当前 Preview 的来源分支/SHA、Protection、环境变量及 Supabase Project Ref 均不能确认。
3. B1/B2 成果仍仅存在于独立未提交 worktree；HEAD 与 `origin/main` 均为 `b8c9869ef285f5cc08c7820ac5d4aed0eac829f2`，新 Migration 尚未进入任何远端发布链路。
4. Resend 账户、组织、发送域、Preview 专用 Credential、DNS 变更和收件箱名单均尚未获授权或实施。

## 2. 当前域名、DNS 与网站状态

以下结果来自 2026-10-15 的公开只读查询。

| 对象           | 当前事实                                | 判定                                                   |
| -------------- | --------------------------------------- | ------------------------------------------------------ |
| Nameserver     | `cathy.dnspod.net`、`gloves.dnspod.net` | PASS；与历史记录一致，当前仍由 DNSPod nameserver 托管  |
| Apex A         | `fandomharbor.com → 216.198.79.1`       | PASS；必须保护                                         |
| Apex AAAA      | 未返回记录                              | 当前不存在，不需要为本任务新增                         |
| `www`          | CNAME 指向现有 Vercel DNS 目标          | PASS；必须保护，报告不复制为邮件配置                   |
| Apex MX        | 未返回记录                              | 当前未发现域名收件服务；不得据此推断管理权限或未来用途 |
| Apex TXT / SPF | 未返回记录                              | 当前未发现；未来不可在未核对 Resend 实际要求前硬编码   |
| `_dmarc` TXT   | 未返回记录                              | 当前未发现；B4a-1 需按实际供应商与策略渐进配置         |
| Apex CAA       | 未返回记录                              | 本轮不新增                                             |
| DNSSEC DS      | 未返回记录                              | 仅记录，不属于 B4a 范围                                |
| `preview-auth` | A/AAAA/CNAME/MX/TXT 均未返回            | 可作为候选 Preview 发送子域，仍需 PO 批准              |
| `auth`         | A/AAAA/CNAME/MX/TXT 均未返回            | 可作为候选 Production 发送子域，B4a-1 不得配置         |

网站只读检查：

- `https://fandomharbor.com/` 返回 Vercel `308`，跳转至 `https://www.fandomharbor.com/`。
- `https://www.fandomharbor.com/` 返回 `200`，由 Vercel 提供，包含 HSTS。
- 当前证书分别覆盖 apex 与 `www`，检查时处于有效期内。
- `www` 响应当前为 `private, no-cache, no-store, max-age=0, must-revalidate`。

保护边界：不得修改 apex A、`www` CNAME、Vercel Production Domain 或任何未来发现的收件记录。DNSPod 的实际账户权限无法由公开 DNS 推断，必须由 Product Owner 人工确认。

## 3. 邮件子域建议与 DNS 变更边界

建议保持认证邮件与网站及未来营销邮件隔离：

| 环境       | 建议发送域                      | 建议 From                                                | 用途                          |
| ---------- | ------------------------------- | -------------------------------------------------------- | ----------------------------- |
| Preview    | `preview-auth.fandomharbor.com` | `Fandom Harbor <no-reply@preview-auth.fandomharbor.com>` | QA/Preview 真实投递           |
| Production | `auth.fandomharbor.com`         | `Fandom Harbor <no-reply@auth.fandomharbor.com>`         | V1 正式认证邮件；不属于 B4a-1 |

Reply-To 仍为待决策项。若不监控 `no-reply` 收件，应避免配置不可达或误导性 Reply-To，并在模板中给出已批准的支持渠道。

B4a-1 只允许新增 Resend 控制台为 **Preview 子域**实际生成的记录，典型类别包括：

- 域名所有权/DKIM 验证记录；
- SPF/Return-Path/MX 等供应商明确要求的发送记录；
- 经审阅的 DMARC TXT；初始策略、报告地址与升级节奏需由 PO/运营确认；
- 供应商要求的其他验证记录。

不得凭经验预填 record name、value、priority 或 TTL；实施前必须先导出 DNSPod 现状快照并逐条做冲突检查。Production 子域的记录不得随 Preview 一起创建。

## 4. Git、代码与部署基线

- Worktree：`codex/v1-package-b0-auth-architecture`
- HEAD：`b8c9869ef285f5cc08c7820ac5d4aed0eac829f2`
- `origin/main`：同一 SHA
- 当前状态：13 个 tracked 文件修改，另有 26 个 untracked 路径/文件项；全部为 B0/B1/B2 及本报告成果，未执行 reset/clean/stash。
- B1 Migration：`20261013170940_v1_email_identity_reservations.sql`
- B2 Migration：`20261014112425_b2_auth_flow_server_boundaries.sql`
- 中文模板：confirmation、recovery、email-change 三份文件均已版本化。
- 当前环境变量合同：
  - 浏览器可见：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`、`NEXT_PUBLIC_SITE_URL`；
  - server-only：`SUPABASE_SECRET_KEY`、`AUTH_RATE_LIMIT_SECRET`。
- `SUPABASE_SECRET_KEY` 与 `AUTH_RATE_LIMIT_SECRET` 不得带 `NEXT_PUBLIC_` 前缀，不得进入 Client Component、构建日志、错误响应或 Preview 评论。
- 定向高熵凭据检查未发现已提交的真实 Resend/Supabase secret；示例值、测试夹具和 SQL 中的安全术语不等于真实凭据。
- `git diff --check` 通过。

历史 Production release 文档记录了 `fandom-harbor-web` 的旧 Production 发布，但该证据早于 B1/B2。当前 B1/B2 代码没有 commit、push 或 deploy，任何旧 Preview/Production 均不得视为具备新注册功能。

## 5. Preview / Production 环境隔离状态

| 检查项                  | 状态                             | 证据与影响                                                                                                 |
| ----------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Production Supabase     | PASS（只读识别）                 | `fandom-harbor` 为 `ACTIVE_HEALTHY`；远端 Migration 仅到 P1-07C，未包含 B1/B2，符合“未触碰 Production”要求 |
| 非生产 Supabase         | BLOCKED                          | 两个历史 QA 项目均为 `INACTIVE`；无可确认的 active Preview 项目                                            |
| Preview Project Ref     | UNKNOWN / STOP GATE              | 未能从 Vercel 只读环境核对；禁止猜测或复用 Production                                                      |
| Vercel Project          | PARTIAL                          | 本地链接可识别项目名，不能确认当前远端 Preview 状态                                                        |
| Preview branch/SHA      | UNKNOWN                          | 只读 API 权限不足；旧 release 证据不能替代当前状态                                                         |
| Preview Protection      | UNKNOWN                          | 必须在 B4a-1 前由授权账户核对并启用                                                                        |
| Preview env scope       | UNKNOWN                          | 必须证明 Preview 与 Production 的 Supabase、server secret、site URL 全部隔离                               |
| B1/B2 Preview Migration | NOT APPLIED / UNCONFIRMED TARGET | Production 明确未应用；非生产目标尚未选定，不能执行                                                        |
| Redirect URL            | NOT CONFIGURED FOR TARGET        | 需在目标项目确定后设置精确 Preview Site URL 与认证回调路径                                                 |

结论：环境隔离尚未形成可验证闭环。创建/恢复独立非生产 Supabase 项目和恢复 Vercel 只读管理权限，均是 B4a-1 的前置 Stop Gate。

## 6. Resend 候选接入清单

Resend 当前公开资料表明其提供 Supabase 可用的 SMTP relay、域名验证、自动 suppression、bounce/complaint 事件、webhook 与邮件指标。2026-10-15 公开价格页显示 Free 层为 3,000 封/月、100 封/日、3 个域和 1 个 webhook endpoint；任何开通或采购前必须在实际账户重新核价、核区域/合规条款及限制。

### 6.1 账户与组织

- 由 Product Owner 指定组织所有者、账单责任人和至少一名备份管理员；启用账户 MFA。
- Preview 与 Production 使用不同 Credential；推荐不同 API key/SMTP credential、不同发送子域、不同 Supabase Project、不同 Vercel scope。
- Key 名称包含环境和用途，不包含明文密钥；最小权限、定期轮换，离职/泄漏时可单独撤销。
- Free 层只有 1 个 webhook endpoint，若 Preview 与 Production 未来同组织共用会形成运营冲突；正式启用前决定升级或拆分组织/环境。

### 6.2 域名与认证

- 先在 Resend 创建 `preview-auth.fandomharbor.com`，再逐条复制控制台实际显示的 DNS 记录到 DNSPod。
- 等待 Resend 完成 DKIM/SPF 等验证；检查 received headers 中的 SPF、DKIM、DMARC alignment，而不是只看控制台“已验证”。
- DMARC 策略从可观测阶段开始，报告邮箱、数据保留和升级到 quarantine/reject 的节奏需单独批准。
- 关闭 click/link tracking，避免认证链接或单次凭据被重写；当前验证码模板仍应保持少链接、非营销内容。

### 6.3 SMTP 与 Supabase

Resend 当前文档给出的 SMTP 参考为 host `smtp.resend.com`、username `resend`、password 使用 API key，并推荐加密端口；实际接入值必须从届时账户页面复核。Supabase Dashboard 配置入口为 Authentication → Emails → SMTP Settings，需要 host、port、user、password、From 和 sender name。

Supabase 默认 SMTP 仅适合项目团队授权邮箱且无生产 SLA；配置 Custom SMTP 后 Auth email 初始限额通常为 30 封/小时，必须与 Resend 日/月额度、应用 60 秒 resend cooldown 和 CAPTCHA 一并校准。不得为突破限额而关闭 Email Confirmation。

### 6.4 运营与监控

- 事件：sent、delivered、delivery delayed、bounced、complained、failed、suppressed。
- 监控：发送失败率、硬退信率、投诉率、抑制新增、额度接近阈值、SMTP/Auth 错误、DNS 验证丢失。
- Webhook：必须验签、限制 payload 日志、幂等处理；不得记录 OTP、完整邮箱、Session/Refresh token 或 SMTP credential。
- Suppression：Resend 自动处理 hard bounce/complaint；解除 suppression 必须有运营审核，不允许注册流程自动解除。
- 状态查询：优先 Resend Dashboard/metrics/webhook；应用只保留最少的脱敏关联 ID 和结果分类。
- 错误策略：面向用户使用防枚举的中文通用错误；内部告警使用 request/event ID，不输出凭据。
- 轮换：新增 Preview credential → 更新 Preview secret scope → 验证 → 撤销旧 credential；任何疑似泄漏立即暂停发送并撤销。

Resend 当前未发现明确功能阻断，暂不需要展开 Postmark 迁移设计；仍应在 Production 前保留备用 SMTP 供应商决策。

## 7. B4a-1 安全执行顺序

以下顺序是待授权 runbook，不在 B4a-0 执行：

1. **代码封存门禁**：复核 B0/B1/B2 diff、测试证据、Migration checksum 和 secret scan；按数据库/服务端链路、Web/模板、文档证据形成可审阅 commit。禁止把本地配置或测试数据提交。
2. **分支与 PR**：push 独立分支、建立 PR；CI 只验证代码，不触发 Production deploy/migration。
3. **隔离环境门禁**：创建或恢复独立 Preview Supabase，并证明 ref 与 Production 不同；确认备份/重建策略。恢复 Vercel 管理可见性并启用 Preview Protection。
4. **环境变量先行**：在 Preview scope 配置 Preview Supabase URL/publishable key、独立 secret key、独立 rate-limit secret、精确 `NEXT_PUBLIC_SITE_URL`。逐项确认没有 Production credential。
5. **受保护 Preview build**：从已审阅的精确 commit SHA 构建，保持数据库 registration mode=`legacy`、Email Confirmation 关闭、外部注册暂停或不可公开访问。
6. **Preview Migration**：只对已确认的 Preview ref 应用 B1/B2 Migration；核对 migration list、grants、RLS、trigger、旧登录。失败即停止，不启用新模式。
7. **Auth URL/模板**：配置精确 Site URL/Redirect allow-list 和已版本化中文模板；不使用宽泛 Production wildcard。保持 Email Confirmation 未开启。
8. **Resend 与 DNS**：创建 Preview 专用域与 credential；仅新增供应商实际给出的 Preview 子域记录；验证 DNS 与认证结果。Production 子域保持未配置。
9. **Preview SMTP**：在 Preview Supabase 配置 Custom SMTP、From/sender name；保留 registration mode=`legacy` 且注册暂停。使用供应商合成地址/PO 批准邮箱做受控连通测试。
10. **安全切换**：确认限流/CAPTCHA/监控后，在维护窗口先保持注册暂停，启用 Email Confirmation（autoconfirm=false），再切换数据库到 `email_required`，完成最小 smoke 后才开放合成账号注册。
11. **真实投递验收**：执行第 8 节矩阵；记录精确代码 SHA、Migration、Auth 配置（脱敏）、DNS、SMTP 事件和回滚状态。
12. **关闭或保留**：测试结束后按 PO 决定保持受保护 Preview，或恢复 legacy/关闭注册并撤销 Preview SMTP credential。不得提升到 Production。

## 8. B4a-1 Preview 真实投递验收矩阵

| 场景               | B1/B2 本地证据                              | B4a-1 新证据                                     | 通过标准                                         |
| ------------------ | ------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| 新注册投递         | 已 PASS                                     | PO 批准收件箱收到 Preview 发件域邮件             | 仅一封有效验证码；未验证仍 pending               |
| 中文模板           | 已 PASS                                     | 主流客户端/移动端真实渲染                        | 主题、正文、品牌、错误提示简体中文且无乱码       |
| 6 位 OTP / 15 分钟 | 已 PASS（真实 GoTrue/Mailpit + 确定性边界） | 核对 Preview 配置并做有效、错误、重放最小测试    | 一次使用；过期/错误/重放拒绝                     |
| 重发               | 已 PASS                                     | 真实供应商第二封邮件与 60 秒 cooldown            | 不延长 Reservation；旧码行为符合 GoTrue 配置     |
| 2 小时 Reservation | 已 PASS（边界与并发）                       | 核对 Preview mode/config，做最小跨流程验证       | 不因重发/刷新延长；过期不占容量                  |
| pending → active   | 已 PASS                                     | 真实 Preview OTP 后查验                          | Redemption/use_count/Audit/Membership 原子且幂等 |
| 密码恢复           | 已 PASS                                     | 真实 recovery 邮件与 OTP                         | 防枚举；改密成功；旧密码失效；Session 规则正确   |
| 普通邮箱变更       | 已 PASS                                     | 真实旧/新邮箱确认                                | UID、角色、Membership 不变；未完成时不提前切换   |
| 投递失败/退信      | 未由 Mailpit 证明                           | 使用 Resend 合成 bounce/complaint 地址或批准方法 | 事件可见、告警触发、用户信息不泄漏               |
| Suppression        | 未由 Mailpit 证明                           | hard bounce/complaint 后检查 suppression         | 后续发送受控；人工解除有审核                     |
| SPF/DKIM/DMARC     | NOT RUN                                     | DNS 与真实邮件 headers                           | 结果 aligned；不影响 apex/www                    |
| 额度/滥用          | 本地应用限流 PASS                           | Preview Supabase/Resend 限额与 CAPTCHA           | 重发/注册滥用被限制；正常流量可用                |
| Session/Cookie/RLS | 已 PASS                                     | Preview 最小差异回归                             | 无跨账号邮箱；未验证无 active 权限；无共享缓存   |
| 日志/告警          | 本地静态/最小运行检查 PASS                  | Vercel/Supabase/Resend Preview logs              | 无 OTP、密码、token、secret 或完整敏感 payload   |

不得重跑整套 B1/B2。B4a-1 只验证真实供应商投递、DNS 认证和 Preview 配置差异。

## 9. Stop Gate 与回滚

| 失败点                            | 立即动作                                               | 可恢复路径                                                                                           |
| --------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Preview ref 不明或等于 Production | 停止一切 migration/deploy/config                       | 选择独立项目并重新核对全部 env                                                                       |
| 未提交成果有丢失风险              | 停止远端操作                                           | 先形成审阅 commit/补丁与 checksum；不 reset/clean/stash                                              |
| Migration 失败                    | 保持 legacy、确认注册关闭，不部署依赖新 RPC 的开放流量 | 使用 Preview 备份/可重建环境和 forward fix；不可用 Git revert 假装回滚 schema                        |
| Secret 作用域错误                 | 阻止/撤销部署                                          | 从错误 scope 移除，轮换已暴露 key，重新部署精确 SHA                                                  |
| Preview 含 Production credential  | 立即 Stop Gate                                         | 撤销/轮换可能暴露的 Production credential；审计访问日志                                              |
| DNS 冲突                          | 不保存变更                                             | 依据变更前快照，只调整拟新增的 Preview 子域记录；不得动 apex/www/MX                                  |
| SMTP/投递失败                     | 不开放新注册、不切 email_required                      | 禁用 Preview custom SMTP 或恢复 Preview 原基线；撤销 Preview credential                              |
| Auth 切换失败                     | 暂停注册                                               | 数据库 mode 恢复 `legacy`，Email Confirmation 恢复 Preview 原基线，保留旧登录；schema 不做破坏性删除 |
| 新模式 smoke 失败                 | 暂停注册并回滚 Vercel 到上一个已知 SHA                 | 保留故障证据；关闭 Preview sender；不提升 Production                                                 |
| 凭据泄漏                          | 立即暂停发送/部署                                      | 撤销并轮换 Resend、Supabase、Vercel 受影响凭据；重新扫描日志与构建产物                               |

DNS 回滚只能删除/恢复本轮明确记录且必须以变更前快照为依据。Resend credential 撤销不会自动恢复 Supabase 配置，因此两边必须分别验证。

## 10. Product Owner 待确认/手动事项

1. 最终采用 Resend，还是要求先做采购/合规复核。
2. 批准 `preview-auth.fandomharbor.com` 作为 Preview 发送域。
3. 原则批准 `auth.fandomharbor.com` 作为未来 Production 发送域；本阶段不配置。
4. 批准 From 与 sender name；确定 Reply-To/支持渠道。
5. 确认 DNSPod 当前账户、MFA、修改权限和操作人。
6. 指定 Resend 组织 owner、账单责任人、备份管理员与 MFA 要求。
7. 批准创建 Preview domain、Credential 和 DNS 记录的 B4a-1 写入授权。
8. 指定或批准独立 Preview Supabase 项目；决定恢复历史 QA 还是新建，并接受相应成本/暂停策略。
9. 恢复 Vercel 项目只读/管理权限，确认 Preview Protection、分支与 SHA。
10. 批准 Preview 专用 Supabase/Resend/Vercel secrets 的作用域和轮换责任人。
11. 提供合成测试账号命名规则和批准的测试收件邮箱名单。
12. 决定 Preview 额度、Supabase Auth rate limits、Resend 日/月阈值和 CAPTCHA（建议 Cloudflare Turnstile）策略。
13. 授权后续 commit/push/PR、Preview deploy 与仅 Preview Migration；这些授权必须与 Production 明确分离。
14. 决定退信/投诉/额度/DNS 验证丢失的告警接收人和响应时限。

## 11. B4a-1 启动门禁

B4a-1 只有在以下条件全部满足后才可启动：

- PO 明确批准 Resend、Preview 子域、From/Reply-To 和合成收件箱；
- DNSPod 管理权限及变更/回滚责任人已确认；
- 独立且 active 的 Preview Supabase Project Ref 已确认，明确不同于 Production；
- Vercel Preview 分支/SHA、Protection 和 env scope 可只读核验；
- Preview secret 已获单独写入授权，且没有 Production credential；
- B0/B1/B2 已形成可审阅 commit/PR，CI 通过；
- Preview Migration、Auth、SMTP、DNS、部署分别获得明确授权；
- 回滚快照、告警责任人和测试时窗已就绪。

当前判定：`NOT READY / STOP GATE`。主要阻断是无 active 非生产 Supabase 项目及 Vercel Preview 状态不可核验，不是 B1/B2 本地功能失败。

## 12. 官方参考

- Supabase Custom SMTP：https://supabase.com/docs/guides/auth/auth-smtp
- Supabase Production Checklist：https://supabase.com/docs/guides/deployment/going-into-prod
- Supabase Redirect URLs：https://supabase.com/docs/guides/auth/redirect-urls
- Supabase CAPTCHA：https://supabase.com/docs/guides/auth/auth-captcha
- Resend Pricing：https://resend.com/pricing
- Resend SMTP：https://resend.com/changelog/smtp-service
- Resend Supabase integration：https://resend.com/supabase
- Resend Suppressions：https://www.resend.com/changelog/suppression-list-support
- Resend Webhooks：https://www.resend.com/features/webhooks

## 13. 本轮变更声明

本轮仅新增本地只读准备报告。未修改 DNS、Resend、Vercel、Supabase Auth、远端数据库或 Production；未发送邮件；未创建远端账号；未执行 commit、push、PR、merge 或 deploy。

最终状态：`WAITING FOR PRODUCT OWNER B4a-1 AUTHORIZATION`
