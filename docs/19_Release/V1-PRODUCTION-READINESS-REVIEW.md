# Fandom Harbor V1 Production Readiness Review

状态：`PASS / READER-ONLY BETA READY WITH CONDITIONS / PUBLIC POLICY PRODUCTION DEPLOYMENT NOT RUN / DEPLOYMENT NOT AUTHORIZED`
日期：2026-07-26

## 当前权威 Readiness 结论

- Reader-only Beta readiness：`PASS / READY WITH CONDITIONS`；邀请制与 active Membership 边界保持。
- Public Policy Production readiness：工程、Owner Decision、RC Preview 与 Preview Smoke 均 PASS；正式 Production Deployment 与 Production Policy Smoke 为 `NOT RUN`。
- Author Beta readiness：既有受控 Author 测试证据保持 PASS，不扩大当前有限 Reader-only Beta 授权。
- Admin Preview：独立平台阻塞；不阻挡 Reader-only Beta，也不代表完整 Admin Production Ready。
- `PDR-01 = OWNER DECISION COMPLETE / PRODUCTION DEPLOYMENT AND SMOKE PENDING`。
- `PDR-02 = CLOSED FOR CURRENT RELEASE`。
- Legal Review=`NOT COMPLETED`；Final Release Approval=`PENDING`。
- Production Deployment Authorized=`NO`。
- 当前下一步仅为本地 Main Integration Owner Review，之后才可单独授权 Push。

## 历史 Production Readiness 记录

以下 2026-07-25 及更早评审内容完整保留。其旧 PDR、政策来源、Custom Domain、Deployment 数量和授权结论均是历史快照，如与上方当前权威结论冲突，以上方结论为准。

日期：2026-07-25

## PDR-01 Owner Decision Application 更新（2026-07-25）

本节覆盖下方历史 PDR-01 表述。DECISION-01–27 已应用，当前唯一正式政策规范来源为 [`V1-PUBLIC-POLICY-V1.0.md`](./V1-PUBLIC-POLICY-V1.0.md)，历史 Draft 与旧政策均已标记 superseded。页面实现完成；独立法律审阅 `NOT COMPLETED`，Owner 接受有限 Reader-only Beta 风险。

当前 `PDR-01 = OWNER DECISION COMPLETE / DEPLOYMENT AND SMOKE PENDING`；Production Deployment Authorized=`NO`，Production Policy Smoke Test=`NOT RUN`，Final Acceptance=`PENDING`。

## PDR-02 Backup Audit 更新（2026-07-25）

本节覆盖下方 PDR-02 历史表述。Product Owner 已确认当前 Free、平台备份=0、PITR=false、Storage Bucket / 对象=0；2026-07-25 22:38:50 +08:00 的仓库外 `public,private` Schema 与 Data-only + COPY 新鲜备份退出码均为 0，Manifest、SHA-256、15 / 15 表覆盖、COPY 结束、权限和 Git 边界验证通过。历史备份保持 `VALID BUT STALE`，恢复演练 `NOT RUN`。

当前 `PDR-02 = CLOSED FOR CURRENT RELEASE`；`PDR-01 = OWNER REVIEW REQUIRED` 保持不变。PDR-02 关闭不等于整体 Release 或 Deployment 授权。详见 [`V1-SUPABASE-BACKUP-EVIDENCE.md`](./V1-SUPABASE-BACKUP-EVIDENCE.md) 和 [`V1-SUPABASE-RECOVERY-RUNBOOK.md`](./V1-SUPABASE-RECOVERY-RUNBOOK.md)。

## PDR-01 Web Implementation 更新（2026-07-25）

本节是当前 PDR-01 Web 页面状态，并在 PDR-01 页面形态、验证结果与待审状态上覆盖下方历史记录：

- `/privacy`、`/terms`、`/content-policy`、Web Footer 三入口与注册页三入口已实现并通过本地工程与浏览器验证；`/legal` 保留兼容重定向。
- 来源仍为 `V1-PUBLIC-POLICY-DRAFT.md`，其 Draft、待 Product Owner 批准、生效日期待确认、法律审阅未完成和其他待决内容均未被工程实现擅自批准。
- 当前结论：`PDR-01 = PASS WITH OWNER REVIEW / OWNER REVIEW REQUIRED`，不等于 Release Approved。
- Owner Review 与验证证据见 [`V1-PUBLIC-POLICY-WEB-ACCEPTANCE.md`](./V1-PUBLIC-POLICY-WEB-ACCEPTANCE.md)。
- PDR-02 沿用进入本 Mission 前状态，本 Mission 未修改或重新执行数据库备份。

## 1. 评审结论

- `Production Readiness Review = PASS`。
- `Production Deployment Review = BLOCKED`。
- `Production Ready = READY WITH CONDITIONS`。
- `Production Deployment Authorized = NO`。
- Product P0 / P1 = `0 / 0`。
- `PDR-01 = CLOSED FOR DEPLOYMENT`。
- `PDR-02 = CLOSED FOR DEPLOYMENT`。

产品主链路和 External Beta 证据支持 Production Preparation 完成；PRC-01 至 PRC-06 状态保持关闭 / 关闭准备状态。2026-07-16 已完成最终版本化政策文档、Web `/legal` 页面、注册入口与本地页面验证，PDR-01=`CLOSED FOR DEPLOYMENT`。Product Owner 已确认 Supabase Free / No backups，仓库外 Schema/Data 手动逻辑导出及完整性证据已完成，PDR-02=`CLOSED FOR DEPLOYMENT`。

重新执行只读 Deployment Review 后，当前历史 RC SHA 尚未纳入最终政策、`/legal` 和 PDR-02 证据，主工作区又包含冻结 Admin 改动，不能作为部署源。因此整体 Review 继续 `BLOCKED`，Production Ready 不能更新为 YES。

## 1A. Production Preparation 跟进（2026-07-16）

V1 Production Preparation 已完成。PRC-01 已关闭；Product Owner 已完成 PRC-02 手动核对，并批准 PRC-03 最低运维方案、PRC-04 最低政策方案、PRC-05 回滚 / Smoke 方案及 PRC-06 治理 / 应急方案；PRC-02 至 PRC-06 均为 `CLOSED FOR PREPARATION`。

- `codex/v1-production-rc` 已从 `903bf70` 建立；RC commit 只包含已验收 Reading 与 Release 文档，并排除冻结 `/access` Admin 改动。
- Web Production Project=`fandom-harbor-web`、Root Directory=`apps/web`、Framework=Next.js、Production Branch=`main`；V1 使用 `fandom-harbor-web.vercel.app` 与 Vercel 默认 HTTPS，不绑定 Custom Domain。
- 三个获批变量名已由 Product Owner 确认配置在 Production 作用域；未读取或输出任何值，也未执行 Deploy / Redeploy / Promote。
- 7 天 invite-only、25 Reader / 5 Author、99.0% best-effort、RPO 24h / RTO 8h、事故时限、责任人、Dashboard + 人工反馈监控及条件备份方案已获批准。
- PRC-04 当前有效年龄边界统一为 18+、仅限受邀用户；任何早期 16+ 表述均已被覆盖并作废。仅文本、禁止内容、隐私数据边界、Supabase / Vercel、30 天导出 / 删除目标、受控删除 / 下架路径与联系邮箱均已批准。
- PRC-04 获批方案已整理为最终 [`V1-PUBLIC-POLICY.md`](./V1-PUBLIC-POLICY.md) 和 Web `/legal` 页面；PDR-01=`CLOSED FOR DEPLOYMENT`，实际 Production URL 留待部署后 Smoke。
- PRC-05 已固定 Rollback Approver、Rollback Operator、Backup Operator、默认 Vercel 回滚方式、数据库 / 内容边界、P0 / P1 条件、Production Smoke 与 Rollback Smoke；上一稳定 Production Deployment ID 须在 rollout 前记录。
- PRC-06 已固定 Governance Owner、Super Admin Owner、Emergency Contact、Audit Reviewer、Technical Operator、Super Admin 守则及 Admin Preview 不可用时的同 SHA 干净 Admin build 应急路径；本 Mission 未执行 break-glass 或权限操作。

详细 Review 见 [`V1-PRODUCTION-DEPLOYMENT-REVIEW.md`](./V1-PRODUCTION-DEPLOYMENT-REVIEW.md)。PDR-01 与 PDR-02 均已关闭；备份证据见 [`V1-SUPABASE-BACKUP-EVIDENCE.md`](./V1-SUPABASE-BACKUP-EVIDENCE.md)。上一稳定 Production Deployment ID 记录为 `FIRST_PRODUCTION_DEPLOYMENT_PENDING`，Production Smoke 为 `NOT RUN`。唯一剩余条件是建立包含最终 Web / Release 改动、排除冻结 Admin 的新干净获批 RC SHA；`Production Deployment Authorized = NO` 保持不变。

## 2. 已完成测试阶段

| 阶段                             | 状态 |
| -------------------------------- | ---- |
| Reader-only Controlled Test      | PASS |
| Reading Typography Alignment Fix | PASS |
| Author001 Publish E2E            | PASS |
| 3 Reader 小范围外部测试          | PASS |
| 外部 Author 测试                 | PASS |
| V1 External Beta Closeout        | PASS |

## 3. Production 主链路检查

| 主链路                         | 状态 | 证据摘要                                                    |
| ------------------------------ | ---- | ----------------------------------------------------------- |
| 邀请注册                       | PASS | 邀请码只创建 active Reader，不自动创建 Author               |
| Reader 登录                    | PASS | 注册名 / 密码登录、退出和重新登录已通过                     |
| Reader 阅读 Published 内容     | PASS | Work Detail、Chapter Reading 与回读已通过                   |
| Author 登录与 Studio           | PASS | Author001 与外部 Author 测试均通过                          |
| 创建作品 / 保存草稿 / 发布章节 | PASS | Author001 Publish E2E 已通过                                |
| Draft isolation                | PASS | Reader / Guest 均看不到未发布草稿                           |
| Studio 权限边界                | PASS | Reader 返回 Archive；Guest 进入登录页                       |
| Guest 登录边界                 | PASS | 可发现作品，详情与章节要求登录，符合 active Membership 规则 |

## 4. 文档完整性

以下当前 Release 文档均已同步：

- `V1-RELEASE-DEPLOYMENT.md`
- `V1-DEPLOYMENT-SMOKE-TEST.md`
- `V1-RELEASE-FLOW-OPTIMIZATION.md`
- `V1-PHASE1-BETA-TESTING-GUIDE.md`
- `V1-PUBLIC-POLICY-DRAFT.md`
- `V1-PUBLIC-POLICY.md`
- `docs/15_Sprint/Release_Readiness/README.md`
- `RR_1C_BETA_READY_CHECKLIST.md`
- `.ai/PROJECT_STATUS.md`
- `.ai/MEMORY.md`
- `.ai/CHANGELOG.md`

RR-1B / RR-1C 资料保留为历史 Deployment / Release Candidate 基线，不能替代当前 V1 Production Preparation、最终环境核对或新的 Production Deployment 授权。

## 5. 已知限制

- Guest 不能直接打开作品详情或章节，点击后进入登录页；这是当前 active Membership 产品规则，不作为缺陷。
- `/access` Admin 既有改动冻结到 Admin 阶段；本评审不修改、部署或扩展 Admin UI。
- Admin Preview 的 Vercel 外部阻塞继续独立跟踪，不阻止 Web Production Preparation Review，但生产启动前必须确认获批的最低治理操作和应急联系人。
- Production 尚未授权；V1 仅选定 Vercel 默认域名，未绑定 Custom Domain，未执行当前 V1 Production Deployment 或 Production Smoke。
- 邀请码短码优化、完整 Admin UI 与文章管理不属于当前 V1 Production 条件。

## 6. Production 前必须关闭的条件

### PRC-01 候选基线与工作区

- 当前 `main` 与 `origin/main` 指向同一历史 baseline，但工作区仍有已验收文档、Reading CSS 和冻结的 Admin `/access` 改动。
- Production 前必须由 Product Owner 授权独立 Mission，审阅全部差异，明确 Admin 冻结改动的归属，建立干净、可追踪、可回滚的 V1 Release Candidate commit。
- 不得直接从未提交工作区部署，也不得在本评审中自动丢弃既有改动。

### PRC-02 Production 环境与入口

- 状态：`CLOSED FOR PREPARATION`。
- Product Owner 已确认 Web Production Project、Root Directory、Framework、Production Branch、默认域名 / HTTPS、三个 Production 环境变量名和目标 URL。
- 本次未读取或输出变量值，未点击 Deploy / Redeploy / Promote，未绑定 Custom Domain 或修改 Vercel 配置。
- 实际 Production Deployment 与部署后 URL / HTTPS / canonical Smoke 必须另行授权。

### PRC-03 运维、监控与灾备

- 状态：`CLOSED FOR PREPARATION`。
- Product Owner 已批准 7 天 invite-only observation window、25 Reader / 5 Author、99.0% best-effort、RPO 24 小时、RTO 8 小时、30 分钟事故确认与 60 分钟暂停 / 回滚决定。
- Release Commander 与 Emergency Contact 为 Product Owner；Technical Operator 为 Codex / 技术执行者，但必须由 Product Owner 授权。
- 监控使用 Vercel Dashboard、Supabase Dashboard 与 Product Owner 人工反馈。
- Supabase Free、Automatic Backup=`No backups` 已确认；仓库外 Schema/Data 手动逻辑导出、权限、大小、SHA-256 和范围限制证据已完成，PDR-02=`CLOSED FOR DEPLOYMENT`。恢复未运行。

### PRC-04 法律与数据政策

- 状态：`CLOSED FOR PREPARATION`。
- 年龄边界为 18+、仅限受邀用户；任何早期 16+ 决定或表述均已被覆盖并作废。
- V1 仅文本、invite-only；禁止违法、侵权、骚扰、仇恨、威胁、暴力煽动、未成年人色情或性剥削、真实隐私泄露、诈骗、垃圾信息、恶意链接或破坏平台安全的内容。
- Product Owner 负责暂停访问、下架、归档或通过受控流程删除违规内容；禁止直接 SQL 临时删除用户、角色、作品或章节。
- 隐私边界、Supabase / Vercel 第三方服务、30 天导出 / 删除目标及联系邮箱 `fandomharbor@163.com` 已固定。
- 最终版本化政策文档与 Web `/legal` 页面已创建并完成本地验证；PDR-01=`CLOSED FOR DEPLOYMENT`。
- KI-026 以“Guest 发现、登录后阅读”的当前产品规则接受，不在本 Mission 修改 Auth / Permission。

### PRC-05 回滚与最终 Smoke

- 状态：`CLOSED FOR PREPARATION`。
- Rollback Approver 与 Backup Operator 为 Product Owner；Rollback Operator 为 Codex / 技术执行者，但必须由 Product Owner 明确授权。
- 默认使用 Vercel 回滚到上一稳定 Production Deployment；实际 Deployment ID 必须在 rollout 前记录。
- 默认不回滚数据库；未经 Product Owner 单独授权，不执行数据库恢复、数据删除、角色修改或直接 SQL。内容风险优先 unpublish / archive / 暂停访问。
- P0 条件覆盖登录、Published Reading、Author 保存 / 发布、Draft isolation、Studio denial、邀请 / 角色 / Membership、域名 / HTTPS / 环境变量、secret、数据完整性、持续产品级错误及无法控制的严重违规内容。
- P1 先暂停发放邀请码和新增发布，Product Owner 在 60 分钟内决定修复、暂停或回滚。
- Production Smoke 21 项与 Rollback Smoke 10 项清单已固定；本 Mission 未执行部署、回滚或 Smoke。

### PRC-06 最低治理连续性

- 状态：`CLOSED FOR PREPARATION`。
- Governance Owner、Super Admin Owner、Emergency Contact 与 Audit Reviewer 均为 Product Owner；Technical Operator 为 Codex / 技术执行者，但必须由 Product Owner 明确授权。
- 至少保留一个 active Super Admin；不得删除最后一个 active Super Admin、共享密码或把密码发给 Codex / 聊天窗口；所有权限变更必须走受控路径并保留 audit。
- Admin Preview 不可用时，可在受控工作站运行与 Production RC 同 SHA 的干净 Admin build，但仍必须走 `/access`、`admin:operate`、RPC 和 audit；每次 break-glass 前必须由 Product Owner 明确批准。
- 禁止直接 SQL 或 Supabase Dashboard 绕过 audit 改角色，禁止共享密码 / Cookie / Token / Session，禁止 Codex 自行执行权限操作。
- 本 Mission 未执行 Admin build、break-glass、权限变更、账号操作或部署。

## 7. Go / No-Go

`Production Preparation = PREPARATION COMPLETE`，但 `Production Deployment Review = BLOCKED`。PDR-01 与 PDR-02 均已关闭；唯一剩余条件是刷新干净、获批、排除冻结 Admin 的最终 RC SHA，并再次执行只读 Review。在此之前不能授权 Production Deployment Mission。

当前不得将状态从 `READY WITH CONDITIONS` 更新为 `Production Ready = YES`。关闭 Review blockers 并重新评审后再决定。

本评审未修改产品代码、数据库、Auth、RLS、RPC、Migration 或 Vercel 配置，未绑定域名、创建账号、发送邀请码、执行角色操作或部署 Production。
