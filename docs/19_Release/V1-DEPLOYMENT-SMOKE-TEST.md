# Fandom Harbor V1 Deployment Smoke Test

状态：PRODUCTION READINESS REVIEW PASS / READY WITH CONDITIONS / DEPLOYMENT NOT AUTHORIZED
日期：2026-07-15

Phase 1 执行清单、反馈模板与测试者说明见 [`V1-PHASE1-BETA-TESTING-GUIDE.md`](./V1-PHASE1-BETA-TESTING-GUIDE.md)。Product Owner 已完成第一阶段 Reader-only 受控测试并提交收口结果。

## V1 Production Readiness Review（2026-07-15）

- `Production Readiness Review = PASS`。
- `Production Ready = READY WITH CONDITIONS`。
- `Production Deployment Authorized = NO`。
- Product P0 / P1 = `0 / 0`。

邀请注册、Reader 登录 / Published 阅读、Author 登录 / Studio、创建、草稿保存、发布、Reader 回读、Draft isolation、Studio denial 与 Guest 登录门禁均 PASS。完整条件与风险见 [`V1-PRODUCTION-READINESS-REVIEW.md`](./V1-PRODUCTION-READINESS-REVIEW.md)。

Production 前必须关闭：干净且获批的候选基线、Production 项目 / 环境 / 域名核对、RPO / RTO 与备份恢复、监控值班、法律 / 数据政策、回滚 runbook、最低治理连续性和部署后 Smoke。它们是 Release / Operational Gate，不计入当前 Product P0 / P1。

## Production Preparation 与 Production Smoke（2026-07-15）

Production Preparation 结论仍为 `INCOMPLETE`；PRC-01 已通过干净 RC baseline 关闭，PRC-02 至 PRC-06 仍为 `BLOCKED`。详细状态、RC 策略、回滚负责人字段和完整 Smoke runbook 见 [`V1-PRODUCTION-PREPARATION.md`](./V1-PRODUCTION-PREPARATION.md)。

Production 尚未部署，因此本 Mission 不执行浏览器 Production Smoke。后续独立 Deployment Mission 必须记录 Production URL、Deployment ID、RC SHA、执行时间与身份，并完成以下最小检查：

- Guest：Homepage、Archive、Search、Auth 与 Studio 登录边界。
- Reader：登录 / 重登、Published Work / Chapter、Studio denial、Draft isolation。
- Author：Studio、创建、保存、Draft isolation、发布和 Reader 回读。
- 通用：Desktop、390 × 844、Light / Dark、HTTPS、canonical、Sitemap、Robots 与 Console 产品级错误 0。
- 治理：active Super Admin 登录能力与应急联系人可用；Smoke 不执行真实角色变更。

任一权限泄漏、Auth 主链路失败、Published Reading 失败、安全事件或未接受 P0 / P1 都必须停止 rollout，并按 Preparation runbook 回滚到已确认的上一稳定 Deployment。禁止伴随数据库回滚、直接 SQL、角色绕过或用户数据删除。

## V1 External Beta Closeout（2026-07-15）

本节为当前权威状态。Product Owner 已确认实际外部 Beta 执行结果：

| 阶段 / 检查项                    | 结果  | 结论                                                             |
| -------------------------------- | ----- | ---------------------------------------------------------------- |
| Reader-only Controlled Test      | PASS  | 第一阶段受控 Reader 测试已完成                                   |
| Reading Typography Alignment Fix | PASS  | Reader 收口 P2 已关闭                                            |
| Author001 Publish E2E            | PASS  | 创建、草稿、发布、Reader 回读与 Draft isolation 已通过           |
| 3 Reader 小范围外部测试          | PASS  | Product Owner 已确认三名外部 Reader 测试完成并通过               |
| 外部 Author 测试                 | PASS  | Product Owner 已确认外部 Author 测试完成并通过                   |
| Guest active Membership 规则     | PASS  | Guest 点击作品详情或章节进入登录页，属于当前产品规则，不作为缺陷 |
| `/access` Admin 冻结策略         | PASS  | 既有改动继续冻结到 Admin 阶段，不作为本次 Beta Closeout 阻断项   |
| Product P0 / P1                  | 0 / 0 | 外部测试未报告新的产品级 P0 / P1                                 |

结论：`V1 External Beta Closeout = PASS`。该阶段随后已进入并完成 Production Readiness Review；当前结论以上方 Review 为准。

## External Beta Go / No-Go Review（历史评审，2026-07-15）

历史结论：`External Beta Go / No-Go = GO — NOT OPENED`。该状态随后已由上方实际 External Beta PASS 证据取代。

| 最小条件        | 结果 | 评审结论                                                                               |
| --------------- | ---- | -------------------------------------------------------------------------------------- |
| Reader 访问规则 | PASS | 邀请注册默认获得 active Membership / Reader；Reader 不能进入 Studio                    |
| Guest 访问规则  | PASS | 可发现作品；点击 Work Detail 或 Chapter 后进入登录页，这是当前 active Membership 规则  |
| Author 发布流程 | PASS | Author001 创建、保存草稿、发布章节、Work Detail 与 Reading 全链路通过                  |
| Draft isolation | PASS | Reader / Guest 均看不到未发布草稿                                                      |
| Studio 权限边界 | PASS | Reader 三条 Studio 路由返回 Archive；Guest `/studio` 进入登录页                        |
| 邀请码流程      | PASS | 邀请码只创建 Reader；有效期、次数、撤销、责任人与受控分发规则已有记录                  |
| 已知限制        | PASS | Guest 登录门禁、Admin Preview 独立阻塞、完整 Admin UI 后置、邀请码短码优化后置均已记录 |
| 停止 / 回退方式 | PASS | 停发邀请码、撤销未使用邀请码；必要时另行批准通过 `/access` 撤销 Author，并保留 audit   |
| 测试反馈收集    | PASS | Phase 1 指南已有设备、身份、步骤、结果、截图、复现性和 P0–P3 模板                      |
| Product P0 / P1 | PASS | 当前为 `0 / 0`                                                                         |

推荐范围：**1 名外部 Author、5 名 Reader、7 天**。仅测试邀请注册、Reader 阅读、Author 最小创建 / 草稿 / 发布、Reader 回读、Draft isolation、Studio denial、390px、Light / Dark 与反馈收集。禁止 Admin、Production、公开邀请码传播、批量内容、真实敏感内容和范围外功能测试。

停止规则：发现 P0 或未获 Product Owner 接受的 P1 时，立即暂停新邀请码和新发布；保留现场与 audit，不直接 SQL、不删除账号或内容。邀请码撤销、Author role 撤销或 Membership 状态变更都必须由 Product Owner 另行授权并走现有受控路径。

`/access` Admin 既有代码改动冻结到 Admin 阶段：本评审不继续修改、部署或扩展 Admin UI。外部 Beta 唯一 Author 如获单独授权，可复用已经验证的 `/access`、服务端校验与 audit 路径；Admin Preview 外部阻塞继续独立跟踪，不阻塞本次 GO 评审。

## Phase 2 Author-controlled / Author001 Publish E2E（2026-07-15）

| 检查项                              | 结果 | 证据与结论                                                                                  |
| ----------------------------------- | ---- | ------------------------------------------------------------------------------------------- |
| Author001 登录与 Studio 三路访问    | PASS | 使用注册名登录；`/studio`、`/studio/works`、`/studio/works/new` 均可进入                    |
| 创建作品与保存章节草稿              | PASS | 创建最小 Smoke 作品并保存章节草稿；保存结果由 Product Owner 人工确认                        |
| Draft isolation                     | PASS | Guest 与 Reader 均看不到未发布草稿                                                          |
| Reader / Guest Studio 边界          | PASS | Reader 三条 Studio 路由均返回 Archive；Guest `/studio` 进入登录页                           |
| 发布所选章节                        | PASS | Author001 成功发布测试章节                                                                  |
| Published Work Detail / Reading     | PASS | 已发布作品详情和章节阅读页均正常                                                            |
| Reader 回读                         | PASS | Reader 可读取已发布作品与章节，且发布后仍不能进入 Studio                                    |
| Guest 公开访问边界                  | PASS | Guest 可在搜索结果看到作品；点击作品或章节后进入登录页，符合当前 active Membership 产品规则 |
| Desktop / Mobile 390 / Light / Dark | PASS | 主链路无明显横向溢出或破版                                                                  |
| Console / Product P0 / P1           | PASS | 控制台无产品级错误；Product P0 / P1 = `0 / 0`                                               |

结论：`Author-controlled Test = PASS`；`Author001 Publish E2E = PASS`；`Author Release evidence gate = CLOSED`。

该结论允许进入下一阶段外部 Beta 的 Product Owner Go / No-Go 评审，但不自动邀请外部 Author、不宣布完整 Beta Ready，也不授权 Production、Deployment、Admin 或其他功能任务。

## Reader-only Controlled Test Closeout（2026-07-15）

| 检查项                                     | 结果  | 证据与结论                                                                          |
| ------------------------------------------ | ----- | ----------------------------------------------------------------------------------- |
| 第一阶段 Reader-only 受控测试              | PASS  | Product Owner 已完成测试并授权记录为 completed                                      |
| Homepage → Archive → Work Detail → Reading | PASS  | 沿用第一阶段 Reader 实测与当前 Web 回归；Published-only 门禁保持不变                |
| Reader 权限边界                            | PASS  | 未报告 Reader 进入 Studio、看到 Draft、创建或发布作品                               |
| Reading 正文视觉居中                       | PASS  | `reader-canvas`、`reader-document` 与 `reader-prose` 使用自动水平边距和受限宽度     |
| Reading 正文两端对齐                       | PASS  | 正文段落使用 `text-align: justify`；不改变标题、列表或其他正文结构                  |
| Desktop 1280                               | PASS  | 正文容器保持页面视觉中轴，既有字号、行距与阅读宽度变量不变                          |
| Mobile 390                                 | PASS  | 容器使用 `min-width: 0`、`width: 100%`、`max-width: min(100%, ...)`，无新增横向溢出 |
| Light / Dark                               | PASS  | 调整不使用主题专属颜色，现有主题变量与阅读偏好不变                                  |
| Product P0 / P1                            | 0 / 0 | 唯一收口反馈为 Reading Typography P2，已在本 Mission 关闭                           |

结论：`Reader-only Controlled Test Closeout = PASS`；`Reading Typography Alignment Fix = PASS`。

浏览器未登录检查可进入 Homepage 与 Archive；直达受 Membership 保护的作品路径会进入登录页，未绕过现有 Published-only / active Membership 边界。Reader 登录后的完整主链路结果以 Product Owner 已完成的第一阶段记录与 Web 自动化回归为准。

## V1 Controlled Beta Invite Readiness Gate（2026-07-15）

本节保留为邀请前 Gate 历史记录；若与上方 Closeout 状态冲突，以上方 Closeout 为准。

| Gate                               | 结果    | 当前证据                                                                                                                           |
| ---------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Reader 邀请注册                    | PASS    | 邀请注册可用，新用户获得 active Membership / Reader，不自动获得 Author                                                             |
| Reader 权限边界                    | PASS    | 授权前无 Studio UI；`/studio`、`/studio/works`、`/studio/works/new` 均返回 `/archive`                                              |
| Author001 Membership               | PASS    | 脱敏账号 `2cbd52b1…351d` 存在 active Membership，Membership user_id 与 Auth user_id 对齐                                           |
| Author001 Author grant             | PASS    | Product Owner 通过 `/access` 手工提交并得到 `status=role-granted`；只读复核存在唯一 active `author` grant                          |
| Author001 audit                    | PASS    | 存在对应 `role.granted`；target 与 Author001 对齐，operator 具有 active Super Admin 与 `admin:operate`                             |
| Author001 Studio                   | PASS    | 退出并重新登录后，`/studio`、`/studio/works`、`/studio/works/new` 均可打开                                                         |
| Author 创建入口                    | PASS    | `/studio/works/new` 创建表单可打开                                                                                                 |
| Author 保存 / 发布 / 回读          | NOT RUN | Author001 本轮未创建或提交作品；保存、Draft isolation、发布与 Reader 回读没有新证据                                                |
| Web Preview 基础页                 | PASS    | Homepage、Archive、Search、Work Detail、Author Profile 当前可打开；Published Reading 与 Auth 继续沿用同一 Preview 的既有 PASS 证据 |
| 390 × 844 / Light / Dark / Console | PASS    | 沿用同一 Preview 已记录的人工证据：无明显横向溢出、无明显破版、Product P0 / P1 = `0 / 0`                                           |
| Admin 最小治理                     | PASS    | active Super Admin 可登录；`/access` 页面与 Server Action 均有登录 / `admin:operate` 守卫；授权经服务端、数据库复核并写 audit      |

Readiness 结论：`CONDITIONAL GO — READER-ONLY CONTROLLED COHORT`。

- 允许先邀请 **3 名 Reader、0 名外部 Author**，只验证注册、登录、公开浏览、Published Reading、权限拒绝和反馈收集。
- Reader → Author Provisioning Block 已解除；`/access` 不再是当前 Author 开通阻塞项。
- 在邀请外部 Author 或宣布完整 Beta Ready 前，Product Owner 必须先用现有 Author001 完成创建、保存、Draft isolation、发布和 Reader 回读。
- 上述未运行项属于 Release evidence gate，不是已确认产品缺陷；当前 Product P0 / P1 为 `0 / 0`。
- 本 Gate 不授权发送邀请码、创建用户、授权角色、部署或进入 Beta 发布。
- Phase 1 通过标准已固定为：3 名 Reader 均可注册和重新登录、Reader 权限边界正常、公开页面与 Published Reading 可用、每人至少一次手机检查、Product P0 = 0、Product P1 = 0 或由 Product Owner 明确接受风险。

## 测试环境

- Web：`http://127.0.0.1:3000`
- Admin 临时入口核对：`http://127.0.0.1:3001/auth/sign-in`
- 数据：Supabase Local + localhost-only QA Fixture
- Desktop：1280 × 800
- Mobile：390 × 844

## Local Smoke Test

| 检查项                           | 结果 | 说明                                                          |
| -------------------------------- | ---- | ------------------------------------------------------------- |
| Homepage                         | PASS | 主结构、公开作品入口与零横向溢出                              |
| Archive                          | PASS | Published Works、排序区与公开作者入口                         |
| Search                           | PASS | 查询入口与状态结构正常                                        |
| Work Detail                      | PASS | Published Work 路径可用                                       |
| Published Chapter Reading        | PASS | 已发布章节路径与阅读布局可用                                  |
| Author Profile                   | PASS | 公开 Author Profile 可用                                      |
| Sign-in / Sign-up                | PASS | 表单与账号路径可用                                            |
| Guest                            | PASS | 无 Studio 入口                                                |
| Reader                           | PASS | 无 Studio 入口；直访 `/studio` 最终到 `/archive`              |
| Author                           | PASS | 可进入 `/studio`，Studio 导航存在                             |
| Published-only / Draft isolation | PASS | Draft Work / Draft Chapter 不出现在公开结果；公开内容路径正常 |
| Desktop 1280                     | PASS | 主路径 overflow = 0                                           |
| Mobile 390 × 844                 | PASS | Homepage overflow = 0，移动导航保持最小实现                   |
| Light / Dark                     | PASS | 本轮浏览会话覆盖 Light 与 Dark 状态                           |
| Console                          | PASS | Web 主路径页面错误 0                                          |
| UX-06H                           | PASS | Homepage 无回退                                               |
| UX-06I                           | PASS | Global Shell、Reader denial、Author Studio 无回退             |
| UX-06J                           | PASS | Release UI Sweep 主路径无回退                                 |

## Admin 核对

- Admin App production build 与 2 / 2 tests 通过。
- 独立 Admin Shell、`/auth/sign-in` 与 `/access` 路由存在。
- Reader / Author 不具备 `admin:operate`；Admin / Super Admin 由服务端 Access Context 与数据库函数再次校验。
- Local QA Fixture 只提供 Reader / Author，不提供 Admin / Super Admin。
- Admin Project `fandom-harbor-admin` 已创建并关联 GitHub，两个必需 Preview 变量存在；但 Preview Deployment 因 Vercel 环境判定异常而 BLOCKED，因此真实 Admin 登录、`/access` 实际授权与撤销未执行。

## Online Smoke Test

状态：`PARTIAL / BLOCKED`

本节只属于 Web V1 主站 Release 主线。Admin Preview Deployment 是独立解阻线，不阻止继续补齐下列 Web Smoke，也不计入 Web Gate 数量。完整拆分见 [`V1-RELEASE-FLOW-OPTIMIZATION.md`](./V1-RELEASE-FLOW-OPTIMIZATION.md)。

Vercel Web Project `fandom-harbor-web` 已创建并关联，Root Directory 为 `apps/web`。两个必需 Preview 变量均存在，Preview deployment 已构建成功并核验为 `Preview / Ready`。

- Preview URL：`https://fandom-harbor-ilvpjubrm-fandom-harbor.vercel.app`
- Deployment ID：`dpl_2H2tUqGo7UXWrfhSC5FsmoeHGpX8`
- Baseline：`903bf70a6dc370090362098d26bedd6bf68af529`

Codex 执行网络仍无法访问 Preview，Product Owner 已从本机浏览器提供人工 Smoke 结果。本节只记录 Product Owner 明确给出的结论；空白项和 `PASS / FAIL` 占位不得推断为 PASS。

### Guest

| 检查项                        | 结果    | 说明                     |
| ----------------------------- | ------- | ------------------------ |
| Homepage                      | PASS    | Product Owner 人工确认   |
| Archive                       | PASS    | Product Owner 人工确认   |
| Search                        | PASS    | Product Owner 人工确认   |
| Work Detail                   | BLOCKED | 尚未提供具体阻塞原因     |
| Published Chapter Reading     | PASS    | Product Owner 人工确认   |
| Author Profile                | BLOCKED | 尚未提供具体阻塞原因     |
| Sign-in                       | PASS    | Product Owner 人工确认   |
| Sign-up                       | PASS    | Product Owner 人工确认   |
| Guest 无 Studio 入口          | PASS    | Product Owner 人工确认   |
| Guest 直访 `/studio` 权限保护 | PASS    | 实际最终地址尚未单独记录 |

### Reader

| 检查项                             | 结果    | 说明                             |
| ---------------------------------- | ------- | -------------------------------- |
| Reader 登录                        | PASS    | Preview 专用 Reader 已注册并登录 |
| Archive / Search                   | PASS    | Product Owner 人工确认           |
| Published Work / Chapter           | BLOCKED | 尚未提供具体阻塞原因             |
| Reader 无 Studio 入口              | PASS    | Product Owner 人工确认           |
| Reader 直访 `/studio` → `/archive` | PASS    | 实际完整跳转地址尚未单独记录     |
| Published-only                     | PASS    | Product Owner 人工确认           |
| Draft isolation                    | PASS    | Product Owner 人工确认           |
| Reader 退出登录                    | PASS    | Product Owner 人工确认           |

### Author / Super Admin

| 检查项                         | 结果    | 说明                                                                        |
| ------------------------------ | ------- | --------------------------------------------------------------------------- |
| Preview Author 登录            | PASS    | Product Owner 人工确认；受控浏览器会话也显示已登录 Author Shell             |
| 当前账号具有 Author capability | PASS    | Header 显示 Studio；Studio Shell、作品管理、文章管理与邀请码入口可见        |
| Studio 入口显示                | PASS    | 当前 Web Shell 显示 `/studio` 入口                                          |
| `/studio` 可进入               | PASS    | Product Owner 人工确认；浏览器在 `/studio/articles` 读取到完整 Studio Shell |
| Author 无 Admin 入口           | PASS    | Web Shell 未显示 Admin 入口；未测试独立 Admin Preview                       |
| 进入作品管理                   | BLOCKED | 导航到 `/studio/works` 后最终回到 `/archive`；浏览器控制随后持续超时        |
| 创建作品草稿                   | NOT RUN | Author 会话无法继续，未提交创建表单                                         |
| 保存草稿                       | NOT RUN | 未创建草稿                                                                  |
| 发布作品                       | NOT RUN | 未创建或发布作品                                                            |
| 已发布内容 Reader / Guest 回读 | NOT RUN | 没有本轮新发布内容                                                          |
| Draft 不向 Reader 暴露         | NOT RUN | 没有本轮新草稿                                                              |

### 通用显示与控制台

Light、Dark、390 × 844 横向溢出、Desktop 1280 与 Global Shell 均为 `PASS`。浏览器控制台 P0 错误为 `0`，P1 错误为 `0`；Product Owner 未附加错误说明。

Admin App 为 `BLOCKED`：远程 branch `codex/admin-preview-baseline` 已固定到 baseline `903bf70a6dc370090362098d26bedd6bf68af529`，但 Vercel 将该非 Production branch 的首次 deployment 判定为 Production。该 deployment 已删除；当前 Admin Preview / Production deployments 均为 0，没有 Admin Preview URL，不能开始 `/auth/sign-in` 验收。

Product Owner 已完成 Dashboard 人工复核，确认 Production Branch=`main`、Preview Branch Tracking=`All unassigned git branches`、Root Directory=`apps/admin`，且 Deploy Hooks、Custom Environments、Preview deployments、Production deployments 均为 0。未发现 Project / Git / Environment / Domain / Build 设置错配。Admin `/auth/sign-in` 与 `/access` 的线上 Smoke 继续暂停；支持证据见 [`V1-ADMIN-VERCEL-SUPPORT-EVIDENCE.md`](./V1-ADMIN-VERCEL-SUPPORT-EVIDENCE.md)。

在 Vercel Support 给出解释，或 Product Owner 明确授权新的受控方案前，不再次触发 Admin Deployment，不进入 Production，不修改 Vercel 配置。

### 当前结论

- 当前没有 Product Owner 报告的 `FAIL`，观察到的 Product P0 / P1 为 `0 / 0`。
- Online Smoke 不能标记为 PASS：Guest Work Detail、Guest Author Profile 与 Reader Published Work / Chapter 为 `BLOCKED`，且未提供原因。
- Preview Author 的登录、Author capability、Studio 入口与 `/studio` 已确认为 `PASS`，因此“没有当前可用 Preview Author”的 Provisioning Block 可以关闭。
- Author 创建 / 保存 / 发布链仍为 `BLOCKED / NOT RUN`：进入 `/studio/works` 后页面最终回到 `/archive`，随后浏览器控制持续超时，无法区分会话失效、网络 / 浏览器问题或产品行为。
- 本轮没有创建草稿、发布作品或修改账号权限；Reader / Guest 回读、Draft isolation、Author 专项 390 × 844、Light / Dark 与控制台检查均未运行。
- Web Release Gate 当前为 2 组：公开内容路径证据不完整；Author / Super Admin 的 Web 结果未完成。当前 Web Gate P0 为 0。

## Beta 测试账号矩阵

| 类型        | 最低获得方式                                                                      | 当前证据                                                                 | 当前状态                         |
| ----------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------- |
| Guest       | 无需账号，使用未登录浏览器会话                                                    | Homepage、Archive、Search、Reading 与权限拒绝已有人工结果                | 可用                             |
| Reader      | 使用有效邀请码注册；只获得 active Membership / Reader                             | 当前 Preview Reader 已注册、登录并完成主要 Reader Smoke                  | 可用                             |
| Author      | active Reader 由 Admin / Super Admin 在 `/access` 手工授予 `author`，随后重新登录 | Product Owner 与浏览器均确认既有 Author 登录、Studio 入口和 Studio Shell | 既有账号可用；新 Reader E2E 失败 |
| Super Admin | 受控既有账号；不是邀请码注册自动产生                                              | 当前 Preview 登录 PASS，历史 Account Repair 已记录                       | 登录可用；治理操作未远程 Smoke   |

### Beta Author Provisioning 结论

- Reader 注册链正常，但邀请码只授予 Reader；Reader 不显示 Studio，直访 `/studio` 返回 `/archive`。
- Reader → Author 路径存在：Admin App `/access` 选择 `author`，服务端要求 `admin:operate`，数据库要求目标 active Membership 和操作者 Admin / Super Admin，并写入 `role.granted` audit。
- Product Owner 已确认历史远程 Author 可在当前 Preview 登录并进入 `/studio`；受控浏览器也确认 Author Shell 与 Studio 入口，因此“既有 Preview Author 账号可用性”Block 已解除。
- Guest / Reader Smoke 允许继续。Author 创建、保存、发布、Reader / Guest 回读与 Draft isolation 仍为 `BLOCKED / NOT RUN`，不能据此关闭 Author Web Smoke。
- Product Owner 需要在现有浏览器标签重新建立 Author 会话，并从 `/studio/works` 人工完成剩余步骤；不得向 Codex 提供密码。

### Reader → Author Provisioning E2E Smoke

状态：`PASS — GRANT / AUDIT / STUDIO VERIFIED`

最新结果：Product Owner 已使用修复后的本地 `/access` 手工完成 Author001 授权并看到 `status=role-granted`。只读复核确认脱敏用户 `2cbd52b1…351d` 的 active Membership、唯一 active `author` grant 与对应 `role.granted` audit 均对齐；operator 具有 Super Admin 与 `admin:operate`。Author001 退出并重新登录后，`/studio`、`/studio/works`、`/studio/works/new` 均可打开。以下 `error=invalid` 内容保留为修复前历史记录，不再代表当前 Gate。

2026-07-15 本轮按既定安全边界检查端到端前置条件：

| 步骤                            | 结果        | 证据 / 原因                                                                                                    |
| ------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| 新 Reader 注册                  | PASS        | Product Owner 在 Web Preview 自行完成注册与登录；未向 Codex 提供邀请码或密码                                   |
| 注册后默认 Reader               | PASS        | 已登录、页首无 Studio；没有 Author capability                                                                  |
| Reader 公开页面                 | PASS        | 登录后位于 Archive，可读取公开列表                                                                             |
| Reader 拒绝 `/studio`           | PASS        | 最终返回 `/archive`                                                                                            |
| Reader 拒绝 `/studio/works`     | PASS        | 最终返回 `/archive`                                                                                            |
| Reader 拒绝 `/studio/works/new` | PASS        | 最终返回 `/archive`                                                                                            |
| 可信 User ID                    | CONDITIONAL | Product Owner 已在 `/access` 表单准备非空 User ID；Codex 未读取或输出其值，提交结果无法证明格式 / 目标有效     |
| Admin / Super Admin `/access`   | PASS        | `http://localhost:3000/access` 已登录；完整 Role Grant 表单可见，角色选项包含 `author`、`admin`、`super_admin` |
| 授予 `author`                   | FAIL        | Product Owner 手动提交后页面为 `/access?error=invalid`；表单输入校验拒绝，未自动重试                           |
| `role.granted` audit            | NOT CREATED | `error=invalid` 发生在输入校验阶段，没有成功 Author grant，不能确认新的 audit                                  |
| 授权后重新登录                  | NOT RUN     | Author grant 失败                                                                                              |
| Author 创建 / 保存 / 发布       | NOT RUN     | 前置授权失败                                                                                                   |
| Draft isolation / Reader 回读   | NOT RUN     | 没有测试作品                                                                                                   |

依据 Mission 强制规则，授权失败时必须停止。因此没有重试、修改 User ID、直接 SQL、Supabase 控制台、Auth、Migration 或 RLS 绕过。新 Reader 保持 Reader，未创建 Author grant 或 audit。

2026-07-15 `/access` blocker 修复审计：

| 检查项                    | 结果          | 证据                                                                                    |
| ------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| `error=invalid` 来源      | CONFIRMED     | `roleMutationSchema.safeParse` 在 RPC 前拒绝输入                                        |
| 表单字段                  | ALIGNED       | `userId`、`role`、`reason` 与 Server Action 完全一致                                    |
| grant / revoke action     | ALIGNED       | 两个独立 form 分别绑定正确 action                                                       |
| role / capability         | ALIGNED       | `author` → active role grant → `work:author`                                            |
| RPC                       | ALIGNED       | `grant_role(p_user_id, p_role, p_reason)`                                               |
| UUID 输入规范化           | FIXED LOCALLY | 校验前 trim；增加字段级安全错误                                                         |
| targeted tests            | PASS          | Admin 2 个测试文件、6 个测试通过；包含 UUID trim、invalid UUID、空 reason、错误 role    |
| 真实 Author grant / audit | PENDING       | 按安全规则不由 Codex 提交；等待 Product Owner 使用更新后的 `/access` 手工执行并只读复核 |

本地修复不等于 E2E PASS。只有页面返回 `/access?status=role-granted`，且只读确认目标 active Author grant、`role.granted` audit 和授权后能力，才能关闭该 Gate。

历史阶段判断（已由本节顶部最新 PASS 取代）：

- “已有 Preview Author 可登录”的账号可用性结论不回退。
- 新 Reader 注册与授权前 Reader denial 已通过；真实 grant、audit 与授权后 Studio 能力现已完成只读复核，Reader → Author E2E Governance Gate 已 `CLOSED`。
- Product P0 / P1 仍为 `0 / 0`；当前是 Release / Governance Gate，不是已确认的产品代码 FAIL。
- 后续不需要再次授权 Author001；任何新用户的角色授权仍需独立审批并继续通过 `/access` 执行。

## V1 Beta Smoke 硬门槛

- Guest Work Detail、Guest Author Profile、Reader Published Work / Chapter 必须得到明确的 PASS、FAIL 或带原因的 BLOCKED 处置结论。
- Author / Super Admin 的 7 个 Web 项必须得到明确结果。
- Preview Author 登录与 Studio capability 已确认；仍须完成创建、保存、发布、Reader / Guest 回读和 Draft isolation。
- 所有产品级 P0 / P1 必须关闭或由 Product Owner 明确接受；不得以 Admin Preview 外部阻塞替代 Web 结果。
- Admin 最小治理由独立 Mission 验证，不在本 Web Smoke 中执行；Admin Preview `/auth/sign-in` 与 `/access` 仍暂停。

## 安全记录

- Local Smoke 使用 localhost-only QA Fixture；Preview Smoke 使用 Product Owner 在远程环境受控准备的 Reader 与现有 Super Admin 会话，两类账号没有混用。
- Release Baseline 审计发现一份未跟踪 UX 验收文档曾记录两条本地 QA 密码；已脱敏并完成凭据轮换。
- 实际密码模式未进入 HEAD 或 Git 历史；处置后工作区复扫为无匹配。
- QA 凭据只允许通过安全命令读取；当前 Release 文档未记录任何凭据值。
- Vercel link 自动生成的本地会话变量仅保存在被忽略且权限为 `0600` 的 `.env.local`；未读取或输出变量值。
- 必需 Preview Environment Variables 由 Product Owner 在 Dashboard 手动配置；本轮只核对变量名存在，不读取或输出值。
- `vercel curl` 曾自动生成项目级 Protection Bypass for Automation secret；Product Owner 已在 Dashboard 删除或轮换，且未读取、复制、记录或分享其值。安全处置完成，后续 Online Smoke 不得重新生成 bypass secret。
- Super Admin Account Repair 已完成，原因是历史 Bootstrap Auth email 与当前 Registration Name 派生规则不一致；修复范围仅为目标 Auth email 对齐，未修改密码、Profile、Membership 或 role grants，未创建新用户。
- Preview Reader 已由 Product Owner 使用受控邀请码流程在本机浏览器注册并登录；密码与邀请码未提供给 Codex，也未写入本文。
- 未修改远程 Supabase、DNS、Production Environment Variables 或生产数据，未执行 Production Deployment。
- Web Project 的临时 Production deployments 均已删除，Web 最终仅保留当前 Preview。Admin Project 的误判 Production deployment 也已删除，Admin 最终没有任何 deployment。
