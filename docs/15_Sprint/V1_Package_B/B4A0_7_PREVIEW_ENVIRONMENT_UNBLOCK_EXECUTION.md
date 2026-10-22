# Package B4a：Preview 环境解阻执行记录

- 日期：2026-10-15（Asia/Shanghai）
- 状态：`SUPABASE READY / VERCEL PROTECTION PASS / DEPLOYMENT PRECHECK PARTIAL`
- 授权范围：暂停 QA1、创建全新 Free Preview、环境只读核验、Vercel 只读认证核验

## 1. 结论

QA1 已安全暂停；新的 `fandom-harbor-v1-preview` 已在原 Supabase Free Organization 中创建，Project Ref 为 `bniqsjnjqesnpcfkpqcz`，状态 `ACTIVE_HEALTHY`。新项目数据库、Auth、Storage、Vault 与 Migration History 均为空，未导入 Production 数据、用户或凭据。

Product Owner 已在浏览器完成 Vercel 登录并打开 `fandom-harbor/fandom-harbor-web`，Production Deployment 人工可见为 Ready；Vercel Authentication 已开启，Protection Mode 为 Standard Protection，历史 Preview `04a1a67` 在无痕窗口中要求 Vercel 登录，保护实测 PASS。正式网站 `www.fandomharbor.com` 同时保持可访问。Preview 的 `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 已由 Product Owner 手工更新，Production 对应变量未修改。

以上证明项目保护和变量修改边界，但不证明历史 Preview 已切换数据库。Vercel 环境变量变更只在后续 deployment/redeployment 生效；历史 deployment `04a1a67` 仅作为保护证据，不得作为新 Supabase 隔离或 B1/B2 部署证据。

B4a-1 Deployment 当前不具备授权前置条件。

## 2. QA1 暂停

- 名称：`fandom-harbor-admin-p1-qa`
- Ref：`gqtchjrmpuxibxmurvfd`
- 暂停前：`ACTIVE_HEALTHY`
- 暂停后：`INACTIVE`
- 未删除、清理或修改任何历史数据。
- 未修改 Migration History。
- QA2 `hicfnlwzmnbxhimyeviy` 保持 `INACTIVE`。

暂停前流量门禁：

- 数据库除本轮检查外没有 active client backend。
- Auth 日志只显示恢复后的 GoTrue 启动、索引和 worker 生命周期事件。
- Storage 唯一请求为平台 tenant 初始化；未发现用户文件访问。
- 未发现登录、注册、业务 API、邮件发送或活跃 Session/MFA 证据。

## 3. Free 名额与新 Preview 创建

- Organization：`xvinmfkqosgvjdobeebf`
- Plan：`free`
- QA1 暂停后 active project：仅 Production 一个。
- 官方当前规则：Free 计划允许两个 active project，paused project 不占额度。
- 平台未要求套餐升级、高可用或付费 add-on。
- 创建时使用 Free 默认计算规格，未启用高可用或附加项。
- 创建区域：`ap-southeast-1`，与现有项目同区域，但资源和 Ref 完全独立。

新项目：

| 项目                       | Ref                    | 状态             | PostgreSQL                       |
| -------------------------- | ---------------------- | ---------------- | -------------------------------- |
| `fandom-harbor-v1-preview` | `bniqsjnjqesnpcfkpqcz` | `ACTIVE_HEALTHY` | `17.11.0.003` / PostgreSQL 17.11 |

项目数据库密码由执行过程临时生成，未输出、未写入仓库或文档。

## 4. 新 Preview 空白基线

- Application Migration History：0。
- `auth.users`：0。
- `auth.identities`：0。
- `auth.sessions`：0。
- Storage buckets / objects：0 / 0。
- public application tables：0。
- private schema：不存在。
- public/private application functions：0。
- application Auth/public/private trigger：0。
- Vault secret：0。
- Security Advisor：当前无 lint。
- 默认安装 Extension：`supabase_vault 0.3.1`、`uuid-ossp 1.1`、`pgcrypto 1.3`、`plpgsql 1.0`、`pg_stat_statements 1.11`。

新 Preview URL/数据库 host 均使用 `bniqsjnjqesnpcfkpqcz`，与 Production `szfhngifsipsrxcpekti`、QA1 `gqtchjrmpuxibxmurvfd` 和 QA2 `hicfnlwzmnbxhimyeviy` 不同。

因此，Supabase 资源、Auth 数据和数据库基线隔离为 PASS。

## 5. Auth 默认配置核验限制

使用项目 publishable/anon key 对 `/auth/v1/settings` 进行了两次只读请求，两次均在连接层返回 `ECONNRESET`。请求未输出 key，未创建用户，也未修改 Auth 配置。根据非循环重试要求停止。

因此下列 hosted Auth 实际值仍需在 Dashboard 或服务稳定后的获批只读窗口确认：

- Email Confirmation；
- Signup enabled/disabled；
- Site URL 与 Redirect URL allowlist；
- SMTP/mailer baseline；
- Hook 配置。

以上未知项不影响“项目为空且隔离”的结论，但会阻断 Migration/Auth 配置及邮件联调。

## 6. Vercel 状态

- 旧 Access Token 已过期，历史 API 检查为 `403 Not authorized`。
- 本轮未循环重试旧 Token、未刷新或提取 Token、未尝试其他账户。
- Product Owner 已在浏览器打开 `https://vercel.com/fandom-harbor/fandom-harbor-web`，并报告 Production Deployment 为 Ready。
- 当前本地 `.vercel/project.json` 也只确认链接的项目名为 `fandom-harbor-web`；orgId/projectId 存在但未输出。
- Codex 对已登录 in-app browser tab 的三种只读绑定方式均超时，未取得页面 DOM 或设置数据，已停止自动化重试。
- Vercel Authentication：已开启，人工核验 PASS。
- Protection Mode：Standard Protection，人工核验 PASS。
- 历史 Preview `04a1a67`：无痕访问要求 Vercel 登录，Protection E2E PASS。
- Production：`www.fandomharbor.com` 正常访问；Production 变量未修改。
- Preview public Supabase 变量：Product Owner 已手工更新；Codex 未读取实际值或 fingerprint。
- Preview Branch Tracking：已开启；任何 push 都可能触发自动 Preview Deployment。

仍需在下一授权窗口核对：

1. Shared Variables 是否向 Preview 注入 Production Supabase 值；
2. 是否存在 Branch-specific override 覆盖 Preview scope；
3. 被 tracking 的精确 branch 名称；
4. `NEXT_PUBLIC_SUPABASE_URL` 的生效值是否精确为 `https://bniqsjnjqesnpcfkpqcz.supabase.co`；
5. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 是否精确匹配新 Preview 项目中 enabled 的 `default` publishable key，而非 Production key 或 legacy anon key；
6. `NEXT_PUBLIC_SITE_URL`、`SUPABASE_SECRET_KEY`、`AUTH_RATE_LIMIT_SECRET` 的 Preview-only scope；
7. 新 deployment 的 Branch、Commit SHA、状态及运行时 Ref。

Vercel Protection 为 PASS；Shared Variables、branch override、最新 Preview SHA 和运行时 Ref 尚未核验，因此端到端隔离保持 `PARTIAL / DEPLOYMENT STOP GATE`。

## 7. Preview 环境变量合同

仓库运行时代码实际需要以下变量：

| 变量                                   | 可见性             | Preview 要求                                                                    |
| -------------------------------------- | ------------------ | ------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | 浏览器公开         | 精确指向 `https://bniqsjnjqesnpcfkpqcz.supabase.co`；Preview scope only         |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 浏览器公开         | 使用 Preview 项目 enabled 的 `default` publishable key；必须与 URL 属于同一项目 |
| `NEXT_PUBLIC_SITE_URL`                 | 浏览器公开         | 使用最终选定的受保护 Preview URL，不得填写 `www.fandomharbor.com`               |
| `SUPABASE_SECRET_KEY`                  | server-only secret | 使用 Preview 项目的 secret key；绝不能带 `NEXT_PUBLIC_` 前缀或进入客户端 bundle |
| `AUTH_RATE_LIMIT_SECRET`               | server-only secret | Preview 独立随机值，至少 32 字符；不得与 Production 共用                        |

仓库没有以 `SUPABASE_SERVICE_ROLE_KEY` 为变量名读取服务端密钥。不得因为旧文档或惯例而新增同义变量替代 `SUPABASE_SECRET_KEY`。

新 Preview 当前存在 enabled 的 legacy `anon` key 和 enabled 的 `default` publishable key。配对验证不能依赖变量名或 key 外观，必须在 Supabase Dashboard 的该 Project Ref 下逐字比对 enabled `default` key，或使用不泄漏原值的 fingerprint 比较。任何 URL/key 跨项目组合都应 fail closed。

## 8. Migration 前置条件

- 新 Preview 状态：`ACTIVE_HEALTHY`，PostgreSQL 17.11。
- Hosted application Migration History：0。
- Auth user、identity、session、Storage 和 Vault 均为空。
- 仓库共有 23 个 Migration，必须从 `20260629210000_identity_access_foundation.sql` 到 `20261014112425_b2_auth_flow_server_boundaries.sql` 按文件名顺序完整应用。
- Migration D `20260819225318_admin_p1_identity_access_cutover.sql` 必须位于 Pre-D 后、B1/B2 前，不得跳过或手工插入 history。
- 复用此前从零回放、Migration Contract、B1/B2 数据库和真实 Auth PASS 证据；本轮不重复大型测试。
- PostgreSQL 17.11 兼容性检查复用 B4a-0.5 结果：仓库未使用已知受影响的 legacy PGP cipher、ltree、btree_gist float 或自定义 operator 模式。

执行远端 Migration 前仍必须固定 23 个文件的 commit SHA 与 checksum、再次确认目标 Ref，并取得独立授权。目标不等于 `bniqsjnjqesnpcfkpqcz`、history 非零、文件数非 23 或顺序漂移时立即停止。

## 9. 建议 B4a-1 安全执行顺序

Preview Branch Tracking 已开启，因此 **Push/PR 必须放在数据库与环境变量就绪之后**。建议下一轮按一个授权包执行，但每阶段保留 Stop Gate：

1. **Vercel scope freeze**：核对 Shared Variables、branch override、tracking branch 和五个变量的 Preview scope；Production diff 必须为零。
2. **本地封存**：按 Database foundation、Application Auth flow、Architecture/evidence 三组 commit；不 push。运行 targeted CI、secret scan、`git diff --check`，记录最终 SHA 与 Migration checksum。
3. **Preview DB 准备**：对 Ref `bniqsjnjqesnpcfkpqcz` 再确认 history=0，按顺序执行 23 个 Migration；验证 RLS/Grant/Trigger/advisor，registration mode 保持 `legacy`。
4. **Preview server secrets**：设置 Preview-only `SUPABASE_SECRET_KEY`、`AUTH_RATE_LIMIT_SECRET` 和 `NEXT_PUBLIC_SITE_URL`；再次验证 public URL/key 与 server secret 来自同一 Preview 项目。
5. **Push / PR / 自动 Preview 部署**：最后才 push。记录自动产生的 deployment、branch、commit SHA；不得 Promote、Merge 或绑定 Production alias。
6. **部署后只读验收**：确认 Standard Protection、运行时 Supabase Ref、无 Production Ref、无 secret bundle 泄漏、数据库连接正常；历史 `04a1a67` 不参与新部署 PASS 判定。

### Stop Gate

- Shared Variable 或 branch override 指向 Production；
- 任一 Preview 变量同时带 Production scope，或修改造成 Production diff；
- public URL/key 不是同一 Project Ref；
- server secret 出现在 `NEXT_PUBLIC_`、build log、客户端 bundle 或错误响应；
- Migration history 非零、文件不是 23 个、checksum/顺序与封存 commit 不一致；
- push 在数据库和变量准备前触发自动部署；
- deployment SHA 不是批准的 commit；
- Preview Protection 失效或出现 Production alias/promotion；
- 需要修改 Production、SMTP、DNS、Resend 或真实用户才能继续。

### 当前只读封存基线

- Migration 文件数：23。
- 当前 Migration manifest SHA-256：`c1ff6b81c836c973287361afd660704ee49e3bf02fe7434b8aa4068d372f3d38`（按排序文件名、NUL 分隔符与各文件 SHA-256 组合计算）。
- `sb_secret_`、`sb_publishable_`、JWT-like、Vercel token 模式扫描：0 命中。
- Git 跟踪的 env 文件仅 `.env.example`。
- `git diff --check`：PASS。

该 manifest 只是当前未提交工作树的预封存指纹。下一轮完成本地 commit 后必须重新计算，并以 commit 内文件为唯一远端 Migration 来源。

本轮未执行 Migration、Auth/SMTP/DNS/Resend 配置、代码提交、PR、部署或邮件发送。

最终状态：`WAITING FOR PRODUCT OWNER B4a-1 DEPLOYMENT AUTHORIZATION`
