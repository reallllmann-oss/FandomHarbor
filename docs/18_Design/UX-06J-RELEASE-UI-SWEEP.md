# UX-06J Release UI Sweep / V1 UI Consistency

任务：UX-06J Release UI Sweep / V1 UI Consistency
状态：PASS / Product Owner Accepted / Closed
日期：2026-07-14

## 1. 任务目标

在 UX-06H Homepage 与 UX-06I Global Shell 已通过验收的基础上，对 Fandom Harbor V1 主路径执行上线前 UI 一致性审计，并只处理收益明确、风险较低、容易回滚的视觉与交互问题。

本任务不是页面重设计，不新增功能，不改变数据、权限或业务逻辑。

## 2. 冻结基线

- Homepage 继续保持 `Brand Orientation → Discovery Paths → Latest Published Works → Reader Return / Access → Quiet Recovery` 五段结构。
- Global Shell 继续保持左侧品牌、中间主要导航、右侧主题与账号的三分区结构。
- Reader 不显示 Studio；直访 `/studio` 继续重定向 `/archive`。
- Author 继续通过既有 `work:author` capability 进入 Studio。
- Published-only、Draft Work / Draft Chapter isolation、Auth、Role、RLS、RPC 与 Migration 均不可改变。

## 3. UI 审计范围

逐页检查：

- Homepage `/`。
- Archive `/archive`。
- Search `/search`。
- Work Detail `/works/qa-reading-short`。
- Published Chapter Reading `/works/qa-reading-short/chapters/quick-check`。
- Author Profile `/author/harbor-qa-author`。
- Author Studio Entry / Overview `/studio`。
- Auth `/auth/sign-in`、`/auth/sign-up` 与现有 Access 边界。

检查维度：

- 页面背景、主容器宽度、标题层级、段落节奏与卡片语言。
- Global Shell 接入与页面顶部衔接。
- Empty、Loading、Error、Not Found 与恢复入口。
- 1280 Desktop、390 × 844 Mobile、Light、Dark 与横向溢出。
- 主要链接、按钮、输入和选择控件的 44px 目标。
- Guest、Reader、Author 导航与 Studio 权限边界。

## 4. 审计结果

### Homepage

- UX-06H 五段结构、编辑式字阶、内容宽度与 Homepage page-local Studio = 0 保持稳定。
- 1280 / 390、Light / Dark、主要交互目标与零溢出通过。
- 未修改 Homepage。

### Archive

- Orientation、Browse Controls、Results 与 Private Return 节奏稳定。
- 1280 / 390、Light / Dark、44px 与零溢出通过。
- Loading 使用 Archive-shaped skeleton；Empty 与 Error 均有真实恢复路径。
- 未修改 Archive。

### Search

- Orientation、Query、Results / Recovery 与 Archive 的视觉语言一致。
- 1280 / 390、Light / Dark、44px 与零溢出通过。
- Initial、Empty、Loading 与 Error 均保持已接受合同。
- 未修改 Search。

### Work Detail

- Orientation、Premise、Context、Reading Decision、Chapter Overview 与 Recovery 节奏稳定。
- 1280 / 390、Light / Dark、44px 与零溢出通过。
- Loading、Not Found 与无公开章节状态保持 Work-shaped presentation。
- 未修改 Work Detail。

### Published Chapter Reading

- Global Shell、Reading Context、Story Content、Settings 与 Continuation 仍以正文为主。
- 1280 / 390、Light / Dark、44px 与零溢出通过。
- 未修改 Reading preference、bookmark、history、directory 或 chapter navigation。

### Author Profile

- Public Identity、Bio、Metrics 与 Published Works 保持文学创作者身份空间。
- 1280 / 390、Light / Dark、44px 与零溢出通过。
- Profile-shaped Loading、Error 与 Empty contract 保持稳定。
- 未修改 Follow、公开字段或数据查询。

### Author Studio Entry / Overview

- Desktop 侧栏、局部 Header、Overview 与管理入口功能正常。
- 发现 Mobile 首屏纵向侧栏过高，以及顶部恢复入口与 Overview 卡入口不足 44px。
- 已执行低风险布局与点击目标修复；未改变 Studio 路由、工作流或 capability 守卫。

### Auth

- Sign-in / Sign-up 表单、错误消息、输入与主要按钮功能正常。
- 发现仍显示工程阶段标签 `Phase 1 · Identity`，且登录 / 注册互链只有 17px 高。
- 已替换为 Reader-facing 中文标签，并将互链提升到 44px。
- 未修改 Auth action、validation、Invitation 或 login return。

## 5. Finding 与处理

### UIJ-AUDIT-001 — Studio Mobile 首屏内部导航过高

严重度：P2 视觉节奏 / 内容可达性。

原 Mobile Studio 侧栏纵向排列三项导航，高约 262px，导致 Overview 内容在首屏进一步下移。

处理：Closed。767px 以下使用三列导航，`lg` 以上恢复纵向侧栏；390px 侧栏高度降至约 166px，仍保留 44px 目标与完整标签。

### UIJ-AUDIT-002 — Studio 恢复入口与管理卡入口目标过小

严重度：P2 移动交互。

顶部“邀请码管理”“返回 Reader”约 20px，Overview 两个管理入口约 24px。

处理：Closed。四个入口均提升到至少 44px，并保持现有 href 与视觉优先级。

### UIJ-AUDIT-003 — Auth 工程标签与辅助链接不符合 Release 语境

严重度：P2 内容一致性 / 移动交互。

Sign-in / Sign-up 仍显示 `Phase 1 · Identity`，并且互链约 17px 高。

处理：Closed。标签改为“账号入口”“门禁注册”，互链提升到至少 44px；表单和 Auth 行为不变。

## 6. 状态一致性

- Archive、Search、Work Detail 与 Author Profile 已有 route-shaped Loading / Error / Empty presentation，达到当前 V1 可接受质量。
- Studio Empty / Not Found 继续使用既有共享状态组件，恢复入口清楚。
- Auth validation / error presentation 保持可读。
- Root Loading / Error 继续属于 UX-06H 已冻结的共享架构边界，不在本任务中改为某一页面专属状态。

## 7. 用户状态与权限

| 状态   | Global Shell                                                                | Studio 入口 | `/studio` 直访    | 结果 |
| ------ | --------------------------------------------------------------------------- | ----------- | ----------------- | ---- |
| Guest  | 品牌、Archive、Search、主题、登录                                           | 不显示      | 登录边界          | PASS |
| Reader | 品牌、Archive、Search、主题、注册名、退出                                   | 不显示      | 重定向 `/archive` | PASS |
| Author | 品牌、Archive、Search、Studio、主题、注册名、退出                           | 显示        | 允许进入          | PASS |
| Admin  | 继续沿用既有独立 Admin 壳层；Web Studio 只依赖现有 `work:author` capability | 未新增规则  | 未修改            | PASS |

## 8. 响应式与主题

- 1280 × 800：全部主路径 zero horizontal overflow。
- 390 × 844：全部主路径 zero horizontal overflow。
- Homepage、Archive、Search、Work、Reading、Author、Studio、Auth：主要交互目标至少 44px。
- Studio Mobile 导航保持正常文档流，不遮挡 Global Shell 或内容。
- Light / Dark 的背景、文字、边框、Primary action 与 muted content 均可读，无明显背景断层。

## 9. 明确未修改

- Homepage 与 Global Shell 结构。
- Archive、Search、Work、Reading、Author Profile 产品逻辑。
- Studio capability、owner scope、创建、编辑或发布工作流。
- Auth actions、validation、Invitation、Role、Cookie、Session 或 login return。
- Database、Supabase、Migration、RLS、RPC、Gateway、Service、Repository。
- Published-only、Draft isolation、Reader preference、theme persistence。
- dependency 与部署配置。

## 10. 保留项

- UX-06I 的移动端当前路由高亮继续作为非阻塞后续优化项，本任务未强行实现。
- HP-AUDIT-007 Root Loading / Error shared architecture 继续 Frozen。
- 极端长连续文本 Fixture coverage 继续作为非阻塞 QA infrastructure enhancement。
- Next.js workspace-root inference 提示继续作为既有非阻塞工程项。

## 11. 结论

- 主路径 UI 审计：完成。
- UIJ-AUDIT-001–003：Closed。
- P0：0。
- P1：0。
- 大型 redesign：无。
- 数据、权限与业务逻辑变更：无。
- UX-06J：PASS。
- Release UI Sweep / V1 UI Consistency：Accepted。
- Product Owner Acceptance：PASS。
- Release UI Sweep Ready for Product Owner Review：YES。
- UX-06J 已正式关闭；停止在当前状态，等待 Product Owner 下一条明确指令。
