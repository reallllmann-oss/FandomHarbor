# Fandom Harbor V1 Production Preparation

状态：`PREPARATION COMPLETE / PDR-01 OWNER DECISION COMPLETE — PRODUCTION DEPLOYMENT AND SMOKE PENDING / PDR-02 CLOSED FOR CURRENT RELEASE / DEPLOYMENT NOT AUTHORIZED`
日期：2026-07-26
Mission：V1 Public Policy Documentation Conflict Reconciliation

## 当前权威状态

- Public Policy 工程、DECISION-01–27、唯一规范源 `V1-PUBLIC-POLICY-V1.0.md`、RC Preview 与 Product Owner Preview Smoke 均已完成。
- Public Policy Production Deployment 与正式域名 Policy Smoke 均为 `NOT RUN`；Final Release Approval=`PENDING`。
- `PDR-01 = OWNER DECISION COMPLETE / PRODUCTION DEPLOYMENT AND SMOKE PENDING`。
- `PDR-02 = CLOSED FOR CURRENT RELEASE`；关闭依据是 2026-07-25 新鲜仓库外逻辑备份及完整性证据，恢复演练仍为 `NOT RUN`。
- Legal Review=`NOT COMPLETED`；Product Owner 仅接受有限、邀请制、Reader-only Beta 风险。
- Production Deployment Authorized=`NO`。当前只允许本地 Main Integration Owner Review，不允许 Push、Merge 或 Production Deployment。
- Admin Preview 独立阻塞不阻挡 Reader-only Beta；冻结 Admin 文件继续排除。

## 历史 Production Preparation 记录

以下 2026-07-25 及更早记录完整保留。其旧 PDR-01、政策源、部署授权、域名或 Production 数量表述均为历史快照，如与上方当前权威状态冲突，以上方状态为准。

Mission：V1 Production Preparation

## PDR-01 Owner Decision Application 更新（2026-07-25）

本节是当前 PDR-01 权威状态，并覆盖下方历史 PDR-01 表述：

- DECISION-01–27 已由 Product Owner 确认并应用。
- 当前唯一正式政策规范来源为 [`V1-PUBLIC-POLICY-V1.0.md`](./V1-PUBLIC-POLICY-V1.0.md)；Draft 与旧 `V1-PUBLIC-POLICY.md` 已保留并标记 superseded。
- 页面实现与 Owner Decision Application 已完成；独立法律审阅为 `NOT COMPLETED`，Owner 已接受有限 Reader-only Beta 风险。
- `PDR-01 = OWNER DECISION COMPLETE / DEPLOYMENT AND SMOKE PENDING`。
- Production Deployment Authorized=`NO`；Production Policy Smoke Test=`NOT RUN`；Final Acceptance=`PENDING`。

## PDR-02 Backup Audit 更新（2026-07-25）

本节是当前 PDR-02 权威状态，并覆盖下方历史表述：

- Product Owner 已确认当前 Plan=Free、平台备份记录=0、PITR=false、Storage Bucket / 对象=0。
- 2026-07-25 22:38:50 +08:00 已为 linked Production 创建仓库外 `public,private` Schema 与 Data-only + COPY 新鲜逻辑备份；退出码均为 0。
- Schema / Data 为 93,346 / 232,260 bytes，SHA-256、Manifest、15 / 15 应用表、COPY 结束、权限与 Git 边界验证通过；2026-07-16 备份保持 `VALID BUT STALE`。
- Auth 管理数据与 Storage 不在逻辑备份范围；恢复 Runbook 已更新，恢复演练 `NOT RUN`。
- 当前 `PDR-02 = CLOSED FOR CURRENT RELEASE`。`PDR-01 = OWNER REVIEW REQUIRED` 保持不变，Production Deployment 仍未授权。
- 证据见 [`V1-SUPABASE-BACKUP-EVIDENCE.md`](./V1-SUPABASE-BACKUP-EVIDENCE.md)，恢复准备见 [`V1-SUPABASE-RECOVERY-RUNBOOK.md`](./V1-SUPABASE-RECOVERY-RUNBOOK.md)。

## PDR-01 Web Implementation 更新（2026-07-25）

本节仅更新 PDR-01，且在 PDR-01 页面形态、验证结果与待审状态上覆盖下方 2026-07-16 历史记录：

- 新的公开政策规范路由为 `/privacy`、`/terms`、`/content-policy`；旧 `/legal` 仅保留兼容重定向。
- Web Footer 与注册页三个政策入口已实现；本地 Guest、1280px / 390px、Light / Dark、metadata、刷新、链接、无横向溢出、Lint、TypeScript、测试与 Build 均通过。
- 唯一主要来源 `V1-PUBLIC-POLICY-DRAFT.md` 仍为 Draft、待 Product Owner 批准、生效状态待确认且法律审阅未完成，因此当前 PDR-01 工程状态为 `PASS WITH OWNER REVIEW / OWNER REVIEW REQUIRED`，不得把本轮工作表述为完全 Release Approved。
- 完整证据与 Owner Review 清单见 [`V1-PUBLIC-POLICY-WEB-ACCEPTANCE.md`](./V1-PUBLIC-POLICY-WEB-ACCEPTANCE.md)。
- PDR-02 状态不变；本 Mission 未执行备份、数据库变更、Production Deployment 或 Production Smoke。

## 1. 结论

- `Production Readiness Review = PASS`。
- `Production Ready = READY WITH CONDITIONS`。
- `Production Deployment Authorized = NO`。
- Product P0 / P1 = `0 / 0`。
- `Production Preparation = PREPARATION COMPLETE`：PRC-01 已关闭，PRC-02 至 PRC-06 均已由 Product Owner 确认为 `CLOSED FOR PREPARATION`。
- Production Deployment Review 已执行，结论为 `BLOCKED`；不授权 Production Deployment，也不能从当前未提交工作区部署。
- PDR-01 已通过最终 `V1-PUBLIC-POLICY.md`、Web `/legal` 页面、注册页入口与本地页面验证关闭为 `CLOSED FOR DEPLOYMENT`。
- PDR-02 已通过 Supabase Free / No backups 确认及仓库外 Schema/Data 手动逻辑导出证据关闭为 `CLOSED FOR DEPLOYMENT`。
- 重新 Review 后唯一剩余条件为刷新干净 RC baseline：当前 RC SHA 早于最终政策、`/legal` 与 PDR-02 证据，且主工作区仍混有冻结 Admin 改动。
- 上一稳定 Production Deployment ID 状态为 `FIRST_PRODUCTION_DEPLOYMENT_PENDING`；Production Smoke 保持 `NOT RUN`。

本 Mission 只执行只读核对、方案整理和文档同步。没有部署 Production、绑定域名、修改 Vercel、修改数据库 / Auth / RLS / RPC / Migration、创建账号、发送邀请码、授权 / 撤销角色或继续实现 `/access` Admin。

## 2. PRC 状态表

| PRC    | 状态                   | 当前证据                                                                                                                                                  | 关闭条件                                                                                                        |
| ------ | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| PRC-01 | CLOSED                 | 从 `903bf70` 创建历史 RC；RC commit 只包含当时 Reading 与 Release 文档，排除 `/access` Admin                                                              | PDR-01/02 后续最终改动须通过独立 Baseline Refresh 进入新干净 SHA；冻结 Admin 继续排除                           |
| PRC-02 | CLOSED FOR PREPARATION | Product Owner 确认 `fandom-harbor-web`、`apps/web`、Next.js、Production Branch=`main`、默认 Production Domain / HTTPS，以及三个 Production 变量名均已配置 | Deployment Mission 只能使用已确认配置；不得读取或输出密钥值，不得在本状态记录中执行 Deploy / Redeploy / Promote |
| PRC-03 | CLOSED FOR PREPARATION | 获批运维方案；Free / No backups 已确认，仓库外 Schema/Data 手动逻辑导出证据已完成                                                                         | 观察期至少每天备份；恢复、自动化或套餐变更仍须 Product Owner 独立授权                                           |
| PRC-04 | CLOSED FOR PREPARATION | Product Owner 批准 18+ invite-only、仅文本、禁止内容、隐私数据边界、第三方服务、30 天导出 / 删除目标、受控删除 / 下架路径与联系邮箱                       | 已完成最终 `V1-PUBLIC-POLICY.md` 与 `/legal`；PDR-01=`CLOSED FOR DEPLOYMENT`，部署后 Smoke 复核实际 URL         |
| PRC-05 | CLOSED FOR PREPARATION | Product Owner 已批准回滚责任、默认 Vercel 回滚方式、数据库 / 内容边界、P0 / P1 条件、Production Smoke 与 Rollback Smoke                                   | 部署前记录上一稳定 Production Deployment ID；获批部署后执行并记录完整 Production Smoke                          |
| PRC-06 | CLOSED FOR PREPARATION | Product Owner 已确认治理 / Super Admin / 应急 / audit 责任人、Super Admin 守则、Admin Preview 不可用时的同 SHA 干净 Admin build 路径及禁止操作            | 任何 break-glass、权限变更或回滚仍须 Product Owner 逐次明确授权并保留 audit；本 Mission 未执行                  |

除非 Product Owner 对剩余 PRC 明确记录 `ACCEPTED RISK`、接受范围、到期日、责任人和补救条件，否则不得把 `BLOCKED` 自动改为 `ACCEPTED RISK`。

## 3. PRC-01：Release Candidate 基线

### 3.1 当前 Git 事实

- 基础 commit：`903bf70a6dc370090362098d26bedd6bf68af529`。
- RC 分支：`codex/v1-production-rc`。
- 历史 RC commit：message 为 `chore(release): prepare V1 production candidate`，SHA=`67f30c13452680738e1626eb33dbdfb4eead1e62`。
- 该 SHA 早于最终政策、Web `/legal` 和 PDR-02 证据，不再覆盖当前完整候选内容；主工作区仍保留冻结 `/access` Admin 改动，因此必须刷新干净 RC baseline。

### 3.2 改动归属

已验收 Reading 改动：

- `apps/web/src/app/globals.css`
- `docs/18_Design/UX-06C-STEP05_ACCEPTANCE.md`

冻结至 Admin 阶段的 `/access` 改动：

- `apps/admin/src/app/access/actions.ts`
- `apps/admin/src/app/access/page.tsx`
- `apps/admin/src/app/access/actions.test.ts`

Release / 状态 / 使用文档改动：

- `.ai/PROJECT_STATUS.md`
- `.ai/MEMORY.md`
- `.ai/CHANGELOG.md`
- `docs/15_Sprint/Release_Readiness/README.md`
- `docs/15_Sprint/Release_Readiness/RR_1C_BETA_READY_CHECKLIST.md`
- `docs/19_Release/V1-ADMIN-GUIDE.md`
- `docs/19_Release/V1-ADMIN-VERCEL-SUPPORT-EVIDENCE.md`
- `docs/19_Release/V1-DEPLOYMENT-SMOKE-TEST.md`
- `docs/19_Release/V1-PHASE1-BETA-TESTING-GUIDE.md`
- `docs/19_Release/V1-PRODUCTION-READINESS-REVIEW.md`
- `docs/19_Release/V1-PUBLIC-POLICY-DRAFT.md`
- `docs/19_Release/V1-PUBLIC-POLICY.md`
- `docs/19_Release/V1-RELEASE-DEPLOYMENT.md`
- `docs/19_Release/V1-RELEASE-FLOW-OPTIMIZATION.md`
- `docs/19_Release/V1-USER-GUIDE.md`
- 本文档

### 3.3 建议的 RC 策略

1. 已从 `903bf70a6dc370090362098d26bedd6bf68af529` 创建 `codex/v1-production-rc`。
2. RC commit 只纳入已验收 Reading 改动和获批 Release / 状态文档。
3. 冻结 `/access` Admin 改动没有进入 RC commit，继续作为未提交工作区改动保留；后续如需归档，必须由独立 Admin Mission 处理。
4. RC commit message 固定为 `chore(release): prepare V1 production candidate`。
5. 在独立干净 detached worktree 对候选 commit 运行完整验证并记录不可变 SHA；部署必须引用该 SHA，禁止引用当前混合工作区。
6. 在 Production Deployment Mission 获单独授权前不创建 tag。授权后可评审 annotated tag `v1.0.0-rc.1`；正式发布 tag 只能在 Production Smoke PASS 后创建。

本 Mission 创建了 RC 分支和 commit，但没有 push、创建 tag 或执行 Deployment。

## 4. PRC-02：Production 配置准备状态

### 4.1 Vercel Web Project

| 检查项                | 结果                           |
| --------------------- | ------------------------------ |
| Team                  | `fandom-harbor`                |
| Project               | `fandom-harbor-web`            |
| Root Directory        | `apps/web`                     |
| Framework             | Next.js                        |
| Node.js               | 24.x                           |
| 本地 Project Link     | 存在，且被 Git ignore          |
| Production Branch     | `main`，Product Owner 已确认   |
| Production Deployment | 未执行                         |
| Production Domain     | `fandom-harbor-web.vercel.app` |
| Custom Domain         | 无；V1 首发不绑定              |
| HTTPS                 | Vercel 默认 HTTPS              |

### 4.2 Production 环境变量

代码使用的变量名：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Product Owner 已在 Vercel 手动核对并确认以下三个变量名均已配置到 **Production** 作用域：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

V1 域名策略为先使用 `https://fandom-harbor-web.vercel.app` 与 Vercel 默认 HTTPS，不绑定自定义域名。`NEXT_PUBLIC_SITE_URL` 必须继续与该获批 HTTPS origin 一致，以固定 canonical、Open Graph 和 Sitemap origin。`NEXT_PUBLIC_SUPABASE_ANON_KEY` 不是当前代码读取的变量名，不应作为替代。

本 Mission 只核对名称与作用域，没有读取、输出或写入任何值。

### 4.3 Supabase

- linked Project：`fandom-harbor`。
- Project ref：`szfhngifsipsrxcpekti`。
- Region：`ap-southeast-1`。
- 状态：`ACTIVE_HEALTHY`。
- PostgreSQL：17。
- Local / Remote Migration：`14 / 14`。
- 本 Mission 未执行 `db push`、远程 SQL、数据写入或配置变更。

### 4.4 PRC-02 关闭清单

- [x] Product Owner 确认 Web Production Project、Root Directory、Framework 和 Production Branch。
- [x] Product Owner 确认三个获批变量名均已配置到 Production 作用域；值只保存在 Vercel，不在文档中读取或输出。
- [x] Product Owner 确认 V1 使用 Vercel 默认 Production Domain 与默认 HTTPS，不绑定 Custom Domain。
- [x] 记录 Production URL：`https://fandom-harbor-web.vercel.app`。
- [ ] 在单独获批的 Deployment Mission 中验证实际响应、HTTPS、canonical、Open Graph、Sitemap 与 Production origin；本项是部署后验证，不重新打开 PRC-02 Preparation 状态。

PRC-02 状态：`CLOSED FOR PREPARATION`。Product Owner 明确确认未点击 Deploy / Redeploy / Promote，未绑定自定义域名、修改数据库或输出密钥值。

## 5. PRC-03：运维、备份、监控和值班最低方案

以下保守 V1 运行包已由 Product Owner 批准，PRC-03 状态为 `CLOSED FOR PREPARATION`。这项批准定义上线运维边界，不代表已执行部署、备份或恢复操作。

### 5.1 上线规模和预算

- Launch 模式：invite-only、非公开传播邀请码。
- 初始 7 天观察窗口：最多 25 个 active Reader、最多 5 个 active Author、仅文本作品主链路。
- 扩容触发：账号 / Author 数量、错误率、延迟或平台配额接近获批阈值时暂停新邀请，由 Product Owner 复核。
- 预算边界：使用当前 Vercel / Supabase 套餐；任何付费升级、附加监控或存储扩容均需 Product Owner 单独批准。
- Release Commander 与 Emergency Contact：Product Owner。
- Technical Operator：Codex / 技术执行者，但每次执行必须由 Product Owner 明确授权。

### 5.2 获批的可用性、RPO 与 RTO

| 指标         | V1 获批值                                                 |
| ------------ | --------------------------------------------------------- |
| 可用性目标   | 99.0%，7 天 invite-only observation window 内 best-effort |
| RPO          | 24 小时                                                   |
| RTO          | 8 小时                                                    |
| 严重事故响应 | 30 分钟内确认，60 分钟内给出暂停 / 回滚决定               |

如果当前平台套餐不能满足以上值，Product Owner 必须降低并明确接受风险，或批准套餐升级；不得默认平台具备未验证能力。

### 5.3 备份与恢复

- 上线前只读确认 Supabase 当前套餐的数据库备份频率、保留期、PITR 可用性和 Storage 覆盖范围。
- 如果当前套餐为 Free，上线前至少完成一次手动数据库导出备份，并将导出物存放在 Product Owner 控制的安全位置。
- 备份目标必须支持已批准的 RPO 24 小时；关键配置和 Migration 继续由 Git 保存。
- 后续恢复验证不得覆盖 Production，不得复制不必要的真实私有数据到 Preview；必须记录开始 / 完成时间、完整性、权限验证、失败处理和批准人。

套餐与备份能力确认、以及 Free 套餐下的手动导出，是 Deployment 授权前的执行项；本 Mission 不执行数据库导出，也不把它们误记为已完成。

### 5.4 监控、值班与事故升级

- 最低信号：Vercel Deployment / Runtime errors、HTTP 5xx、Auth 登录失败、Supabase health、核心页面 Smoke、权限泄漏报告。
- 监控方式：Vercel Dashboard、Supabase Dashboard 与 Product Owner 人工反馈。
- Release Commander：Product Owner；Technical Operator：Codex / 技术执行者，但必须由 Product Owner 授权；Emergency Contact：Product Owner。
- P0、安全边界失效或数据完整性风险：立即停发邀请码、暂停新发布、保存证据并升级 Product Owner。
- 不得为恢复服务绕过 RLS、直接 SQL 改角色、删除账号 / 内容或回滚已确认的用户写入。
- 每次事故记录开始时间、影响、决定、操作人、恢复证据和后续事项。

## 6. PRC-04：法律、隐私、内容与数据最低方案

以下最低 V1 政策方案已由 Product Owner 批准，PRC-04 状态为 `CLOSED FOR PREPARATION`。该状态表示政策决策已固定，不表示正式法律页面已经生成或发布；Production 前仍须将本方案整理为可访问、版本化的最终公开文案。

年龄边界修正：当前有效政策统一为 **18+，仅限受邀用户**。任何此前出现的 16+ 决策或表述均已被本决定覆盖并作废，不得再作为当前 Production Preparation 或 Production 政策使用。

### 6.1 年龄与内容

- 年龄边界：18+，仅限受邀用户。
- 开放方式：invite-only。
- 内容形态：V1 仅允许文本作品；图片、外链文件上传、PDF / EPUB 上传不在 V1 Production 范围。
- 禁止内容：违法、侵权、骚扰、仇恨、威胁、暴力煽动、未成年人色情或性剥削、真实隐私泄露、诈骗、垃圾信息、恶意链接或破坏平台安全的内容。
- 违规处理：Product Owner 可暂停访问、下架、归档或删除违规内容；删除必须走受控流程，不得直接 SQL。

### 6.2 隐私与条款

Product Owner 批准的隐私边界包括：

- 记录注册名、认证相关信息、邀请码、角色和 Membership。
- 记录作品章节、阅读偏好、书签与阅读记录。
- 记录访问日志、错误日志和安全审计记录。
- 第三方服务：Supabase 与 Vercel。
- 联系邮箱：[fandomharbor@163.com](mailto:fandomharbor@163.com)。

Production 前必须发布可访问的版本化页面，至少将上述决定整理为最终公开文案，并说明：

- 运营法律主体、适用地区和联系渠道。
- 收集的数据类别、用途、访问边界、保存与删除原则。
- 使用目的、访问边界、平台处理方（Vercel / Supabase）和安全限制。
- active Membership 规则：Guest 可发现作品，但详情和章节要求登录。
- 用户行为规则、内容许可、作者责任、禁止内容、账号暂停和下架流程。
- 政策版本、生效日期和重大变更通知方式。

当前仓库尚无可作为 Production 公布面的完整 Privacy / Terms / Content Policy。该公开文案缺口是部署前执行项，不改变 PRC-04 `CLOSED FOR PREPARATION`，但在补齐前不得授权 Production Deployment。

### 6.3 删除、导出与保留

- V1 请求入口为 [fandomharbor@163.com](mailto:fandomharbor@163.com)；不得要求用户在公开 Issue 提供私密数据。
- 身份核验后，导出请求目标在 30 天内处理；导出文件必须私密、限时且不进入搜索 / 分析。
- 删除请求目标在 30 天内处理；账号 / 内容先暂停访问并 unpublish / archive，再进入受控删除流程。
- 禁止直接 SQL 临时删除用户、角色、作品或章节。
- 最终 purge、tombstone 和备份老化只有在获批流程与工具存在后执行；恢复备份时不得把已删除数据重新投入 active service。
- 精确保留期必须写入最终公开文案；本 Preparation 决定不虚构尚未批准的保留天数。

### 6.4 下架路径

1. 通过 [fandomharbor@163.com](mailto:fandomharbor@163.com) 接收理由、目标 URL 和必要证据。
2. 下架责任人为 Product Owner；紧急安全、明显违法或其他严重违规内容可立即限制访问。
3. Product Owner 可暂停访问、下架、归档或通过受控流程删除违规内容；没有获批工具时停止并升级，不直接 SQL 删除。
4. 记录决定、操作者、时间、依据和恢复条件；需要时通知作者并保留申诉入口。
5. 涉及法律要求时由法律责任人决定保留、披露或彻底删除范围。

## 7. PRC-05：回滚与 Production Smoke Runbook

### 7.1 版本与责任

- 当前上一稳定 Git baseline：`903bf70a6dc370090362098d26bedd6bf68af529`。
- 当前 Production RC：已在 `codex/v1-production-rc` 建立；部署只能引用本 Mission Final Output 记录的最终不可变 SHA。
- 当前上一稳定 Production Deployment ID：`PENDING`，必须在 Deployment Mission rollout 前只读确认并记录。
- Rollback Approver：Product Owner。
- Rollback Operator：Codex / 技术执行者，但必须由 Product Owner 明确授权。
- Backup Operator：Product Owner。
- 默认回滚方式：Vercel 回滚到上一稳定 Production Deployment。
- 数据库回滚：默认不做；除非 Product Owner 单独授权，否则不执行数据库恢复、数据删除、角色修改或直接 SQL。
- 内容处理：优先 unpublish / archive / 暂停访问，不直接删除数据库记录。

PRC-05 状态：`CLOSED FOR PREPARATION`。本状态只固定方案和责任边界，不表示已部署、回滚或执行 Smoke。

### 7.2 立即停止 / 回滚触发条件

以下任一 P0 信号触发立即停止 rollout、保存证据并由 Product Owner 评估回滚：

1. 登录主链路失败。
2. Published Reading 大面积不可用。
3. Reader 无法读取 Published 内容。
4. Author 无法保存草稿或发布章节。
5. Draft 泄露。
6. Reader / Guest 越权进入 Studio。
7. 邀请码、角色或 Membership 边界失效。
8. 域名 / HTTPS / 环境变量导致 Production 不可用。
9. Secret 泄露。
10. 数据完整性异常。
11. 核心路径持续产品级错误。
12. 严重违法、未成年人、侵权或隐私泄露内容无法通过下架流程控制。

P1 定义为影响部分用户或非核心路径，但未造成权限泄露、数据破坏或核心阅读 / 发布中断。P1 发生时先暂停发放邀请码和新增发布，Product Owner 在 60 分钟内决定修复、暂停或回滚。

### 7.3 回滚步骤

1. 停止继续 rollout；停发邀请码并暂停新发布。
2. 保存 Deployment ID、时间、错误、请求路径和必要截图，不记录 secret。
3. Product Owner 作出回滚决定；经其明确授权后，由 Codex / 技术执行者在 Vercel 将 Web 恢复到已确认的上一稳定 Production Deployment。
4. 默认不回滚数据库，不删除用户写入，不修改 Auth / RLS / Role，不执行直接 SQL；任何例外必须由 Product Owner 单独授权。
5. 内容风险优先通过暂停访问、unpublish 或 archive 控制，不直接删除数据库记录。
6. 对回滚版本执行下方 Rollback Smoke；失败则保持服务暂停并升级事故处理。
7. 记录操作人、目标版本、开始 / 完成时间、Smoke 结果和后续修复 Mission。

### 7.4 Production Smoke 清单

部署后必须记录 Production URL、Deployment ID、RC SHA、身份、时间和结果，并逐项执行：

1. HTTPS。
2. 首页。
3. Archive。
4. Search。
5. Guest 发现 Published 作品。
6. Guest 点击作品进入登录页。
7. Reader 登录。
8. Reader 阅读 Published 内容。
9. Reader Studio denial。
10. Author 登录。
11. Author Studio。
12. Author 创建 / 编辑测试作品。
13. 保存章节草稿。
14. 发布章节。
15. Reader 回读。
16. Draft isolation。
17. Guest Studio denial。
18. 390px 移动端。
19. Light / Dark。
20. canonical / sitemap / robots。
21. Console 产品级错误 = 0。

### 7.5 Rollback Smoke 清单

回滚后必须逐项验证并记录：

1. Production URL。
2. HTTPS。
3. 首页 / Archive / Search。
4. Reader 登录。
5. Reader Published 阅读。
6. Author 登录。
7. Studio denial。
8. Draft isolation。
9. Console 产品级错误。
10. 回滚记录。

Production 尚未部署，因此本 Mission 不执行浏览器 Production Smoke。

## 8. PRC-06：Super Admin 与治理应急路径

### 8.1 当前证据

- 至少一个 active Super Admin 存在并有既有登录证据。
- 现有 Role Grant、`admin:operate`、`/access`、数据库二次校验、最后一个 Super Admin 保护和 audit 路径均已有证据。
- `/access` 既有改动冻结至 Admin 阶段，本 Mission 不继续实现。
- Admin Preview 没有可用 URL，不能把它视为已准备的 Production 治理入口。

### 8.2 治理责任

- Governance Owner：Product Owner。
- Super Admin Owner：Product Owner。
- Emergency Contact：Product Owner。
- Audit Reviewer：Product Owner。
- Technical Operator：Codex / 技术执行者，但必须由 Product Owner 明确授权。

### 8.3 Super Admin 要求

1. 至少保留 1 个 active Super Admin。
2. 不得删除最后一个 active Super Admin。
3. 不得共享 Super Admin 密码。
4. 不得把 Super Admin 密码发给 Codex 或任何聊天窗口。
5. 所有权限变更必须走受控路径，并保留 audit 记录。

### 8.4 Admin Preview 不可用时的应急路径

1. 如果 Admin Preview 仍不可用，允许在受控工作站运行与 Production RC 同 SHA 的干净 Admin build。
2. 应急操作仍必须走 `/access`、`admin:operate`、RPC 和 audit 路径。
3. 任何 break-glass 操作前必须由 Product Owner 明确批准。
4. 不得通过 Supabase Dashboard 或直接 SQL 临时改角色。
5. 不得绕过 audit。
6. 不得共享密码、Cookie、Token 或 Session。

本 Mission 只批准并记录该应急路径，没有运行 Admin build、执行 break-glass、登录账号、变更权限或读取任何凭据。

### 8.5 紧急处理范围

1. 暂停邀请码发放。
2. 暂停新 Author 授权。
3. 暂停新发布。
4. 检查 active Super Admin。
5. 检查 audit 记录。
6. 必要时经 Product Owner 明确批准，通过受控路径撤销异常 Membership 或角色。
7. 必要时经 Product Owner 明确批准，执行已批准的 Vercel 回滚。

### 8.6 禁止操作

1. 禁止直接 SQL 改角色。
2. 禁止通过 Supabase Dashboard 绕过 audit 改角色。
3. 禁止删除最后一个 Super Admin。
4. 禁止共享 Super Admin 密码。
5. 禁止无记录新增、撤销或恢复角色。
6. 禁止 Codex 自行执行权限操作。
7. 禁止在 Production Deployment 未授权时执行部署。

PRC-06 状态：`CLOSED FOR PREPARATION`。任何实际应急或权限操作仍须独立授权；`/access` Admin 实现继续冻结，不属于本 Mission。

## 9. Product Owner 关闭记录

以下字段必须在 Production Deployment 授权评审前完成；可以引用受控内部记录，不得填入 secret。

| 决策项                           | 当前值                                                       |
| -------------------------------- | ------------------------------------------------------------ |
| RC commit SHA                    | 见 PRC-01 Mission Final Output                               |
| RC branch                        | `codex/v1-production-rc`                                     |
| Production Branch                | `main`                                                       |
| Production URL / domain          | `https://fandom-harbor-web.vercel.app`；无 Custom Domain     |
| Production env names / scopes    | 三个获批变量名均已配置到 Production；值未读取 / 输出         |
| 实际平台套餐 / 月预算上限        | 上线前确认套餐；付费变更须单独批准                           |
| 可用性 / RPO / RTO               | 99.0% best-effort / 24h / 8h                                 |
| 备份能力 / 恢复演练证据          | Free / No backups；仓库外手动逻辑导出已完成；恢复未运行      |
| Release Commander                | Product Owner                                                |
| Technical Operator               | Codex / 技术执行者，须 Product Owner 授权                    |
| Rollback Approver / Operator     | Product Owner；Codex / 技术执行者，须 Product Owner 明确授权 |
| Backup Operator                  | Product Owner                                                |
| 法律主体 / 政策负责人 / 联系渠道 | 刘祯莹；Fandom Harbor 运营方；`fandomharbor@163.com`         |
| Governance Owner / Emergency     | Product Owner / Product Owner                                |
| Active Super Admin Owner         | Product Owner                                                |
| Audit Reviewer                   | Product Owner                                                |
| PRC-01 最终状态                  | CLOSED                                                       |
| PRC-02 最终状态                  | CLOSED FOR PREPARATION                                       |
| PRC-03 最终状态                  | CLOSED FOR PREPARATION                                       |
| PRC-04 最终状态                  | CLOSED FOR PREPARATION                                       |
| PRC-05 最终状态                  | CLOSED FOR PREPARATION                                       |
| PRC-06 最终状态                  | CLOSED FOR PREPARATION                                       |

## 10. Production Preparation Closeout

当前结论：`PREPARATION COMPLETE`。

原因：PRC-01 已关闭，PRC-02 至 PRC-06 均已 `CLOSED FOR PREPARATION`。Preparation Closeout 曾确认具备 Deployment Review 资格；Review 现已执行，权威结论见下一节。

Deployment Review 核对项：

1. PRC-04 最终公开文案与 `/legal`：已完成，PDR-01=`CLOSED FOR DEPLOYMENT`。
2. PRC-03 套餐与备份执行项：已完成，PDR-02=`CLOSED FOR DEPLOYMENT`。
3. 上一稳定 Production Deployment ID。
4. Production Smoke 尚未执行，且只能在获批部署后执行。

`Production Ready = READY WITH CONDITIONS` 与 `Production Deployment Authorized = NO` 必须继续保持不变。

## 11. Production Deployment Review（2026-07-16）

详细 Review 见 [`V1-PRODUCTION-DEPLOYMENT-REVIEW.md`](./V1-PRODUCTION-DEPLOYMENT-REVIEW.md)。结论：

- `Production Deployment Review = BLOCKED`。
- `Production Ready = READY WITH CONDITIONS`。
- `Production Deployment Authorized = NO`。
- `Can authorize Production Deployment Mission = NO`。
- `PDR-01 = CLOSED FOR DEPLOYMENT`。
- `PDR-02 = CLOSED FOR DEPLOYMENT`。

PRC-01 至 PRC-06 状态保持不变；Preparation 仍为完成。PDR-01 已关闭：最终版本化政策文档、Web `/legal` 页面与注册页入口已完成，并通过本地构建、1280px / 390px、Light / Dark、无横向溢出和页面内容检查。实际 Production URL 留待部署后 Smoke。

PDR-02 已关闭：Product Owner 确认 Supabase Free、Healthy、Singapore、Automatic Backup=`No backups`；受控 Schema/Data 逻辑导出成功，文件位于仓库外且权限、大小、SHA-256 与范围限制均已记录。证据见 [`V1-SUPABASE-BACKUP-EVIDENCE.md`](./V1-SUPABASE-BACKUP-EVIDENCE.md)。

重新 Review 后唯一剩余条件是刷新干净 RC baseline。当前历史 RC SHA 不包含最终政策、`/legal`、注册入口及 PDR-02 证据，当前工作区又含冻结 `/access` Admin 改动，因此 `Production Ready = READY WITH CONDITIONS`、`Production Deployment Authorized = NO` 保持不变。

Vercel Project、三个 Production 环境变量名、默认域名策略和 Smoke 计划已核对。Vercel 当前没有 Production deployment，因此上一稳定 Production Deployment ID 记录为 `FIRST_PRODUCTION_DEPLOYMENT_PENDING`。
