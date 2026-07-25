# Fandom Harbor V1 Production Deployment Review

状态：`BLOCKED / PDR-01 OWNER DECISION COMPLETE — DEPLOYMENT AND SMOKE PENDING / PDR-02 CLOSED FOR CURRENT RELEASE / PRODUCTION READY WITH CONDITIONS / DEPLOYMENT NOT AUTHORIZED`
日期：2026-07-25
Mission：V1 Production Deployment Review

## PDR-01 Owner Decision Application 更新（2026-07-25）

本节覆盖下方历史 PDR-01 表述：

- DECISION-01–27 已应用；[`V1-PUBLIC-POLICY-V1.0.md`](./V1-PUBLIC-POLICY-V1.0.md) 是唯一当前规范源。
- 历史 Draft 与旧 `V1-PUBLIC-POLICY.md` 已保留并标记 superseded。
- 独立法律审阅为 `NOT COMPLETED`；Owner 已接受有限 Reader-only Beta 风险。
- `PDR-01 = OWNER DECISION COMPLETE / DEPLOYMENT AND SMOKE PENDING`。
- 当前 Review 仍因精确 RC、commit/push/deploy 授权、部署、Smoke 和 Final Acceptance 未完成而 BLOCKED；Deployment Authorized=`NO`。

## PDR-02 Backup Audit 更新（2026-07-25）

本节覆盖下方 PDR-02 历史表述：

- Product Owner 已确认当前 Free、平台备份=0、PITR=false、Storage Bucket / 对象=0。
- 2026-07-25 22:38:50 +08:00 的仓库外 `public,private` Schema / Data-only + COPY 新鲜备份退出码均为 0。
- Manifest、SHA-256、15 / 15 表定义与 COPY、必要应用表、权限、错误 / NUL / 截断和 Git 边界验证均通过；历史备份保持未修改。
- Recovery Runbook 已更新，恢复演练 `NOT RUN`。`PDR-02 = CLOSED FOR CURRENT RELEASE`。
- `PDR-01 = OWNER REVIEW REQUIRED` 保持不变；Production Deployment Review 继续 `BLOCKED`，Production Deployment Authorized=`NO`。

完整证据见 [`V1-SUPABASE-BACKUP-EVIDENCE.md`](./V1-SUPABASE-BACKUP-EVIDENCE.md) 与 [`V1-SUPABASE-RECOVERY-RUNBOOK.md`](./V1-SUPABASE-RECOVERY-RUNBOOK.md)。

## PDR-01 Web Implementation 更新（2026-07-25）

本节仅更新 PDR-01，并在 PDR-01 页面形态、验证结果与待审状态上覆盖下方 2026-07-16 历史记录：

- 当前规范公开路由为 `/privacy`、`/terms`、`/content-policy`；Footer 与注册页入口已实现，旧 `/legal` 仅为兼容重定向。
- 本地 Lint、TypeScript、测试、Build、Guest 直达 / 刷新、1280px / 390px、Light / Dark、链接、metadata、横向溢出与 Console 检查通过。
- 来源草稿仍明确待 Product Owner 批准、生效状态待确认且法律审阅未完成，因此 `PDR-01 = PASS WITH OWNER REVIEW / OWNER REVIEW REQUIRED`，不能基于本轮实现宣称完全 Release Approved。
- 证据和完整待审项见 [`V1-PUBLIC-POLICY-WEB-ACCEPTANCE.md`](./V1-PUBLIC-POLICY-WEB-ACCEPTANCE.md)。
- PDR-02 状态保持不变；本 Mission 未执行数据库备份、Deployment 或 Production Smoke。

## 1. 评审结论

- `Production Preparation = PREPARATION COMPLETE`。
- `Production Deployment Review = BLOCKED`。
- `Production Ready = READY WITH CONDITIONS`。
- `Production Deployment Authorized = NO`。
- Product P0 / P1 = `0 / 0`。
- `PDR-01 = CLOSED FOR DEPLOYMENT`。
- `PDR-02 = CLOSED FOR DEPLOYMENT`。

PRC-01 至 PRC-06 状态一致，Production 环境变量名称、Vercel Project、默认域名策略和 Smoke 计划均已准备。PDR-01 已通过最终版本化政策文档、Web `/legal` 页面、注册页入口和本地页面验证关闭。Product Owner 已确认 Supabase Free / Healthy / Singapore / `No backups`，受控 Schema 与 Data 逻辑导出已成功保存在仓库外并完成权限、大小和 SHA-256 验证，因此 PDR-02 已关闭。

重新执行只读 Deployment Review 后，整体 Review 继续 `BLOCKED`：当前 RC SHA `67f30c13452680738e1626eb33dbdfb4eead1e62` 早于最终政策、`/legal` 和 PDR-02 证据，主工作区又混有冻结 `/access` Admin 改动，不能作为部署源。唯一剩余条件是建立包含本轮获批 Web / Release 改动、明确排除冻结 Admin 的干净可追踪 RC SHA。该条件关闭前，不能把 Production Ready 更新为 YES，也不能进入 Production Deployment Mission 授权。

本 Review 只执行只读核对和文档同步。没有点击 Deploy / Redeploy / Promote，没有部署、绑定 Custom Domain、修改 Vercel / 数据库 / Auth / RLS / RPC / Migration、创建账号、发送邀请码、修改角色、执行 break-glass、运行 Production Smoke 或创建 tag。

## 2. Production Preparation 与 PRC 状态

| PRC    | 当前状态               | Review 结论                                                         |
| ------ | ---------------------- | ------------------------------------------------------------------- |
| PRC-01 | CLOSED                 | RC baseline 已建立；部署只能引用明确 SHA 的干净 checkout            |
| PRC-02 | CLOSED FOR PREPARATION | Vercel Project、三个 Production 变量名、默认域名 / HTTPS 策略已确认 |
| PRC-03 | CLOSED FOR PREPARATION | 运维方案已批准；套餐 / 备份执行证据仍是 Deployment Review blocker   |
| PRC-04 | CLOSED FOR PREPARATION | 最低政策已批准；最终公开文案 / 页面仍是 Deployment Review blocker   |
| PRC-05 | CLOSED FOR PREPARATION | 21 项 Production Smoke 与 10 项 Rollback Smoke 完整，均尚未执行     |
| PRC-06 | CLOSED FOR PREPARATION | 治理责任和应急路径已批准；本 Review 未执行 break-glass 或权限操作   |

PRC 状态不因本 Review 重新打开。`BLOCKED` 是 Production Deployment Review 结论，不是新的产品 P0 / P1。

## 3. RC baseline 与工作区

- 历史稳定 baseline：`903bf70a6dc370090362098d26bedd6bf68af529`。
- `main == origin/main == 903bf70a6dc370090362098d26bedd6bf68af529`。
- RC branch：`codex/v1-production-rc`。
- RC commit SHA：`67f30c13452680738e1626eb33dbdfb4eead1e62`。
- RC commit message：`chore(release): prepare V1 production candidate`。
- RC branch 当前没有 remote branch，没有 tag。
- 当前主工作区不干净：包含后续 Production Preparation / Review 文档改动，以及冻结的 `/access` Admin 改动。
- 当前 RC SHA 不包含之后完成的最终政策、Web `/legal`、注册页入口或 PDR-02 备份证据。

结论：历史 RC SHA 可追踪，但已不再覆盖当前完整候选内容，当前工作区也不能作为部署源。必须通过独立 RC Baseline Refresh Mission 安全拆分最终 Web / Release 改动、排除冻结 Admin，生成新的获批不可变 SHA；在此之前 Deployment Review 保持 `BLOCKED`。

## 4. PRC-04 最终公开文案

Product Owner 已完成最终全文审阅并批准 Finalization。2026-07-16 完成：

- 创建版本化最终政策文档 [`V1-PUBLIC-POLICY.md`](./V1-PUBLIC-POLICY.md)，版本 V1，批准 / 更新日期为 2026-07-16，生效日为 V1 Production 正式上线之日。
- 创建 Web App Router 页面 `/legal`，覆盖隐私、使用、内容、数据请求、责任边界、适用法律和政策更新全部章节。
- 在注册页增加“隐私与使用政策”最小入口，不增加强制复选框、不改变 Auth 或注册校验。
- 最终公开文案使用运营主体刘祯莹、中华人民共和国、`fandomharbor@163.com`、18+、仅限邀请、仅文本和访客登录门禁等已批准事实。
- Supabase 当前 Project Region 只读确认并以用户可理解方式披露为新加坡区域；Vercel 未可靠确认精确运行地区，因此保留概括表述。
- 最终文档和页面不含 Draft 状态、内部 Draft Review Notes、PDR / Production readiness 状态或不合理全面免责。
- `/legal` 已在本地 1280px / 390px、Light / Dark 下验证，无横向溢出；页面 title、description、mailto、语义章节均通过。

状态：`CLOSED FOR DEPLOYMENT`。实际 Production URL 可访问性仍须在获批部署后的 Production Smoke 中验证；这不重新打开 PDR-01。

## 5. PRC-03 Supabase 套餐与备份

2026-07-16 Product Owner Dashboard 证据与受控逻辑导出：

- Plan：Free。
- linked Project：`fandom-harbor` / masked ref `szfh…ekti`。
- 状态：Healthy / `ACTIVE_HEALTHY`。
- Region：`ap-southeast-1` / Singapore。
- Dashboard Automatic Backup：`No backups`。
- Schema 导出：成功，`public,private`，退出码 `0`。
- Data 导出：成功，Data-only + COPY，退出码 `0`。
- Custom Role Backup：`NOT REQUIRED`；Migration 没有项目自建角色。
- 两个 SQL 文件均非空、权限 `0600`，私有目录权限 `0700`，大小与 SHA-256 已记录。
- 存储位置：Product Owner controlled private directory outside repository。
- Remote Database Mutation：`NO`；Restore：`NOT RUN`；Production Deployment：`NOT RUN`。

非敏感证据见 [`V1-SUPABASE-BACKUP-EVIDENCE.md`](./V1-SUPABASE-BACKUP-EVIDENCE.md)。本次应用逻辑导出不包含 Supabase 管理的 Auth 数据、Storage 管理数据或实际 Storage 文件，也不是完整 Supabase 平台镜像；未执行恢复测试。

状态：`PDR-02 = CLOSED FOR DEPLOYMENT`。本次只执行远程只读逻辑导出；未修改数据库、执行恢复、升级套餐、启用 PITR 或运行 Production Deployment。

## 6. 上一稳定 Production Deployment ID

Vercel Production deployment 只读列表当前为空。

状态：`FIRST_PRODUCTION_DEPLOYMENT_PENDING`。

当前没有上一稳定 Production Deployment ID，符合“尚未执行首次 Production Deployment”的事实。首次 Deployment Mission 必须在 rollout 前记录该状态，并明确首次部署失败时的受控停止 / 回退处置；不得虚构上一稳定 Deployment ID。

## 7. Production 环境、域名与 HTTPS

2026-07-16 只读 Vercel CLI 核对：

| 检查项              | 结果                                                          |
| ------------------- | ------------------------------------------------------------- |
| Project             | `fandom-harbor-web`                                           |
| Root Directory      | `apps/web`                                                    |
| Framework           | Next.js                                                       |
| Node.js             | 24.x                                                          |
| Production Branch   | `main`，沿用 Product Owner 确认；本 Review 未修改             |
| Production env      | 三个变量名均存在于 Production scope，值为 Encrypted           |
| Production target   | `https://fandom-harbor-web.vercel.app`                        |
| Custom Domain       | 0                                                             |
| HTTPS strategy      | Vercel 默认 HTTPS                                             |
| Live response / TLS | 尚无 Production deployment；留待获批部署后的 Production Smoke |

已确认的 Production 变量名：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

本 Review 只核对名称和 scope，没有读取、输出或修改任何值。

## 8. Production Smoke 计划

- Production Smoke：21 项，完整。
- Rollback Smoke：10 项，完整。
- P0 回滚评估条件：12 项，完整。
- 状态：`NOT RUN`，因为 Production 尚未部署。

Production Smoke 只能在 Product Owner 单独授权 Deployment、且部署实际完成后执行。未运行 Smoke 不违反本 Review 的 Out of Scope，但 Production Smoke PASS 是正式发布收口条件。

## 9. Review blockers

| ID     | 状态                  | Blocker                                                                 | 关闭证据                                                  |
| ------ | --------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------- |
| PDR-01 | CLOSED FOR DEPLOYMENT | 最终版本化政策文档、`/legal`、注册入口与本地验证已完成                  | 部署后在 Production Smoke 核对实际 URL；不重新打开 PDR-01 |
| PDR-02 | CLOSED FOR DEPLOYMENT | Free / No backups 已确认；仓库外 Schema/Data 逻辑导出和完整性证据已完成 | 7 天观察期每天执行；恢复须独立授权                        |

以下为 Deployment Mission 前必须记录、但不是额外 PRC：

- `FIRST_PRODUCTION_DEPLOYMENT_PENDING`。
- 只能从干净 checkout 引用最终批准的 RC SHA。
- Production Smoke 保持 `NOT RUN`，部署后执行。

## 10. Go / No-Go

当前结论：

- `Production Deployment Review = BLOCKED`。
- `Production Ready = READY WITH CONDITIONS`。
- `Production Deployment Authorized = NO`。
- `PDR-01 = CLOSED FOR DEPLOYMENT`。
- `PDR-02 = CLOSED FOR DEPLOYMENT`。
- `Can authorize Production Deployment Mission = NO`。

唯一剩余条件：建立包含 PDR-01 / PDR-02 最终 Web 与 Release 改动、排除冻结 `/access` Admin 的干净获批 RC SHA，并再次执行只读 Deployment Review。完成前停止；不要部署 Production、点击 Deploy / Redeploy / Promote、绑定域名、运行 Production Smoke 或执行恢复、权限 / 数据写操作。
