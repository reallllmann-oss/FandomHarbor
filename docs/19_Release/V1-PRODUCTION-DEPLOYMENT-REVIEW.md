# Fandom Harbor V1 Production Deployment Review

状态：`PASS / PDR-01–PDR-02 CLOSED FOR DEPLOYMENT / PRODUCTION DEPLOYMENT COMPLETED / PRODUCTION SMOKE PASS / LIVE — 7-DAY OBSERVATION WINDOW`
日期：2026-07-17（部署状态更新；Review 证据日期为 2026-07-16）
Mission：V1 Production Deployment Review

## 1. 评审结论

- `Production Preparation = PREPARATION COMPLETE`。
- `Production Deployment Review = PASS`。
- `Production Ready = DEPLOYED`。
- `Production Deployment Authorized = CONSUMED / CLOSED`。
- Product P0 / P1 = `0 / 0`。
- `PDR-01 = CLOSED FOR DEPLOYMENT`。
- `PDR-02 = CLOSED FOR DEPLOYMENT`。

## 1A. Deployment Review 执行结果（2026-07-17）

Review 后续独立授权已完成：Final RC=`ab04de63ed0ced4eadfaa4a64babfa6370c67058`，Production Deployment=`dpl_9FSPEFRzazWwd31wrajY3yVw3wPs`，默认域名=`https://fandom-harbor-web.vercel.app`，状态 READY。Product Owner Manual Production Smoke=`PASS`；Product P0 / P1=`0 / 0`。`Production Deployment=COMPLETED`、`Production Status=LIVE / 7-DAY OBSERVATION WINDOW`。完整证据见 [`V1-PRODUCTION-DEPLOYMENT-RECORD.md`](./V1-PRODUCTION-DEPLOYMENT-RECORD.md)。本节是 Review 后的执行记录，不改写 2026-07-16 Review 当时“尚未授权”的历史事实。

PRC-01 至 PRC-06 状态一致，Production 环境变量名称、Vercel Project、默认域名策略和 Smoke 计划均已准备。PDR-01 已通过最终版本化政策文档、Web `/legal` 页面、注册页入口和本地页面验证关闭。Product Owner 已确认 Supabase Free / Healthy / Singapore / `No backups`，受控 Schema 与 Data 逻辑导出已成功保存在仓库外并完成权限、大小和 SHA-256 验证，因此 PDR-02 已关闭。

Final RC 已在仓库外独立干净 Worktree 中从历史 SHA `67f30c13452680738e1626eb33dbdfb4eead1e62` 建立。候选只包含 15 个获批 Web、Policy、Release 和 PDR 文件；冻结 `/access` Admin、备份 SQL、Manifest、Secret、环境文件与构建产物均未进入候选。完整 `pnpm validate`、Web 81 / 81 tests、显式 Web production build、格式、差异和候选敏感信息检查均通过，因此 Deployment Review 更新为 `PASS`。

Final RC Commit 的完整 SHA 不能在同一 Commit 内自我记录，必须以本 Mission Final Output / Product Owner Handoff 为准。`Production Ready = YES / AWAITING PRODUCT OWNER AUTHORIZATION` 仅表示可以进入单独的部署授权决定；`Production Deployment Authorized = NO`，不得自动部署。

本 Review 只执行只读核对和文档同步。没有点击 Deploy / Redeploy / Promote，没有部署、绑定 Custom Domain、修改 Vercel / 数据库 / Auth / RLS / RPC / Migration、创建账号、发送邀请码、修改角色、执行 break-glass、运行 Production Smoke 或创建 tag。

## 2. Production Preparation 与 PRC 状态

| PRC    | 当前状态               | Review 结论                                                          |
| ------ | ---------------------- | -------------------------------------------------------------------- |
| PRC-01 | CLOSED                 | Final RC baseline 已建立并验证；部署只能引用 Final Output 的明确 SHA |
| PRC-02 | CLOSED FOR PREPARATION | Vercel Project、三个 Production 变量名、默认域名 / HTTPS 策略已确认  |
| PRC-03 | CLOSED FOR PREPARATION | 运维方案、Free / No backups 与手动备份证据均已完成                   |
| PRC-04 | CLOSED FOR PREPARATION | 最低政策、最终公开文案和 `/legal` 均已完成                           |
| PRC-05 | CLOSED FOR PREPARATION | 21 项 Production Smoke 与 10 项 Rollback Smoke 完整，均尚未执行      |
| PRC-06 | CLOSED FOR PREPARATION | 治理责任和应急路径已批准；本 Review 未执行 break-glass 或权限操作    |

PRC 状态不因本 Review 重新打开。当前 Production Deployment Review 结论为 `PASS`；这不改变 Product P0 / P1=`0 / 0`，也不构成部署授权。

## 3. RC baseline 与工作区

- 历史稳定 baseline：`903bf70a6dc370090362098d26bedd6bf68af529`。
- `main == origin/main == 903bf70a6dc370090362098d26bedd6bf68af529`。
- Historical RC branch：`codex/v1-production-rc`。
- Historical RC SHA / Final RC Parent：`67f30c13452680738e1626eb33dbdfb4eead1e62`。
- Final RC branch：`codex/v1-production-rc-final`。
- Final RC commit message：`release: prepare final Fandom Harbor V1 production RC`。
- Final RC 完整 SHA：见本 Mission Final Output；不在 Commit 内自我记录。
- Final RC branch 仅存在于本地，没有 remote branch，没有 tag。
- 原始主工作区仍保留冻结 `/access` Admin 改动；未修改、暂存、提交、清理或转移。
- Final RC Worktree 在提交后必须保持干净，并作为后续授权评审引用的唯一候选来源。

结论：最终候选基线已经完成拆分和验证。创建本地不可变 Commit 后，后续 Production Deployment Authorization Mission 必须明确引用 Final Output 中的完整 Final RC SHA；不得引用原始脏工作区或历史 RC SHA。

## 4. PRC-04 最终公开文案

Product Owner 已完成最终全文审阅并批准 Finalization。2026-07-16 完成：

- 创建版本化最终政策文档 [`V1-PUBLIC-POLICY.md`](./V1-PUBLIC-POLICY.md)，版本 V1，批准 / 更新日期为 2026-07-16，生效日为 V1 Production 正式上线之日。
- 创建 Web App Router 页面 `/legal`，覆盖隐私、使用、内容、数据请求、责任边界、适用法律和政策更新全部章节。
- 在注册页增加“隐私与使用政策”最小入口，不增加强制复选框、不改变 Auth 或注册校验。
- 最终公开文案使用运营主体刘祯莹、中华人民共和国、`fandomharbor@163.com`、18+、仅限邀请、仅文本和访客登录门禁等已批准事实。
- Supabase 当前 Project Region 只读确认并以用户可理解方式披露为新加坡区域；Vercel 未可靠确认精确运行地区，因此保留概括表述。
- 最终文档和页面不含 Draft 状态、内部 Draft Review Notes、PDR / Production readiness 状态或不合理全面免责。
- `/legal` 已在本地 1280px / 390px、Light / Dark 下验证，无横向溢出；页面 title、description、mailto、语义章节均通过。
- Final RC 中四个 Web 改动文件与上述已通过 PDR-01 UI 验证的源文件逐字节一致；本轮 build 和 HTTP 检查再次确认 `/legal`、注册入口、title、description、canonical、mailto、无新增复选框及 SEO 测试。
- 本轮唯一一次浏览器尝试被客户端在打开本地 URL 前阻止，已按规则停止重试并记录 Product Owner Manual Verification Handoff；该工具阻断不构成产品 P0 / P1，也未触发代码修改。

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

## 9. Review gates

| ID     | 状态                  | Blocker                                                                 | 关闭证据                                                  |
| ------ | --------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------- |
| PDR-01 | CLOSED FOR DEPLOYMENT | 最终版本化政策文档、`/legal`、注册入口与本地验证已完成                  | 部署后在 Production Smoke 核对实际 URL；不重新打开 PDR-01 |
| PDR-02 | CLOSED FOR DEPLOYMENT | Free / No backups 已确认；仓库外 Schema/Data 逻辑导出和完整性证据已完成 | 7 天观察期每天执行；恢复须独立授权                        |

以下为 Deployment Mission 前必须记录、但不是额外 PRC：

- `FIRST_PRODUCTION_DEPLOYMENT_PENDING`。
- 只能从干净 checkout 引用最终批准的 RC SHA。
- Production Smoke 保持 `NOT RUN`，部署后执行。
- Product Owner 必须在独立 Mission 中明确授权，并引用本 Mission Final Output 的完整 Final RC SHA。

## 10. Go / No-Go

当前结论：

- `Production Deployment Review = PASS`。
- `Production Ready = YES / AWAITING PRODUCT OWNER AUTHORIZATION`。
- `Production Deployment Authorized = NO`。
- `PDR-01 = CLOSED FOR DEPLOYMENT`。
- `PDR-02 = CLOSED FOR DEPLOYMENT`。
- `Eligible for Product Owner Production Deployment authorization decision = YES`。

Deployment Gate 已全部通过，但这不是 Deployment 授权。下一步只允许 Product Owner 审阅 Final Output 中的完整 Final RC SHA，并通过独立 Mission 决定是否授权 Production Deployment。当前停止；不要部署 Production、点击 Deploy / Redeploy / Promote、绑定域名、运行 Production Smoke 或执行恢复、权限 / 数据写操作。
