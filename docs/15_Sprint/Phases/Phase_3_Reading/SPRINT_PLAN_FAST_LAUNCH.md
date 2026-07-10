# Phase 3 Sprint Plan（Fast Launch Edition）

Status: Mission 3A PASS; Mission 3B PASS; Mission 3C-1 Search MVP PASS / Product
Owner Accepted; Mission 3C-2 Browse Experience PASS / Product Owner Accepted;
Mission 3C-3 SEO Foundation PASS / Product Owner Accepted; Phase 3 Completed /
Product Owner Accepted; RR-1 Unauthorized

## Product objective

Phase 3 只有一个目标：以最快速度使 Fandom Harbor 达到稳定 Beta 上线状态。

执行原则：

1. Beta 能上线优先于功能丰富。
2. 使用小 Sprint，不提前优化，不顺手重构。
3. 自 Phase 3 起按 Mission 一次授权。
4. Mission 内所有 Sprint 连续执行，不按内部 Step 停批。
5. Mission 完成后统一等待 Product Owner 一次人工验收。

本计划只定义产品结果、范围与验收，不预先指定工程实现。

## Numbering migration

为避免新增 Sprint 与原编号冲突，后续统一使用阶段内编号：

| New reference | Previous reference | Stage                                |
| ------------- | ------------------ | ------------------------------------ |
| 3A-0          | 3.0                | Phase 3A — Beta Blocking             |
| 3A-1          | 3.1                | Phase 3A — Beta Blocking             |
| 3A-2          | 3.2                | Phase 3A — Beta Blocking             |
| 3A-3          | 3.3                | Phase 3A — Beta Blocking（条件执行） |
| 3B-1          | 3.4                | Phase 3B — Author Public Profile     |
| 3B-2          | 3.5                | Phase 3B — Follow System             |
| 3B-3          | New                | Phase 3B — Invitation Relationship   |
| 3C-1          | 3.6                | Phase 3C — Beta Polish               |
| 3C-2          | 3.7                | Phase 3C — Beta Polish               |
| 3C-3          | 3.8                | Phase 3C — Beta Polish               |
| 3C-4          | 3.9                | Phase 3C — Beta Polish               |
| RR-1          | 3.10               | Release Readiness（独立于 Phase 3）  |

旧编号仅用于历史追踪，所有新文档、授权、验收与状态记录使用新编号。

## Phase 3A — Beta Blocking

目标：解除全部 Beta 上线阻塞。只有 Phase 3A 阻塞 Beta 上线。

### Sprint 3A-0 — Beta Baseline & Blocking Gate

1. **Sprint 名称**：Beta 基线与阻塞门禁
2. **目标**：确认存在唯一、可复现的 Beta 基线，并明确全部上线阻塞。
3. **Scope**：
   - 固定已通过人工验收的 Phase 2 基线。
   - 核对现有质量检查、数据库变更与远程环境的一致性。
   - 建立 Beta 阻塞清单、负责人、处理结论和已接受风险。
   - 明确 Beta 的最低运行、备份、内容规则和故障责任边界。
4. **Out of Scope**：
   - 新产品功能。
   - UI 优化。
   - 新基础设施。
   - 正式开放 Beta 流量。
5. **Acceptance**：
   - Beta 基线可复现并通过现有质量门禁。
   - 无敏感信息进入版本记录。
   - 每个潜在阻塞都有明确结论。
   - Product Owner 确认可以进入远程环境验真。
6. **授权等级**：Level 3。
7. **是否阻塞上线**：是。
8. **推荐执行顺序**：第 1 个。

### Sprint 3A-1 — Production / Supabase / Auth / Env Verification

1. **Sprint 名称**：Production、Supabase、Auth 与环境验真
2. **目标**：确认 Beta 实际运行环境配置正确且彼此隔离。
3. **Scope**：
   - 核对 Web、Admin、域名和 Supabase 环境对应关系。
   - 核对 Beta 所需环境变量、认证设置、会话与跳转路径。
   - 核对远程数据库变更、权限和注册所需能力。
   - 确认最小备份、故障处理和回退路径。
4. **Out of Scope**：
   - 更换技术栈或平台。
   - 建设第二套生产基础设施。
   - 新监控平台。
   - 认证模型重做。
5. **Acceptance**：
   - 环境检查表逐项通过。
   - Web 与 Admin 使用正确的 Beta 环境。
   - 注册、登录和权限配置符合已批准产品规则。
   - Beta 凭据没有被错误暴露或跨环境混用。
   - 回退路径可执行并已记录。
6. **授权等级**：Level 3。
7. **是否阻塞上线**：是。
8. **推荐执行顺序**：第 2 个。

### Sprint 3A-2 — Remote Core Journey Stability

1. **Sprint 名称**：远程核心全链路稳定性
2. **目标**：在真实 Beta 环境证明注册、登录、Reader 与 Studio 主流程稳定。
3. **Scope**：
   - 邀请码注册、注册名登录、退出和重新登录。
   - Reader 阅读、返回和基础个人阅读能力。
   - Author 进入 Studio、创建作品、保存、发布和公开阅读。
   - Admin 登录及关键拒绝路径。
   - 桌面与窄屏核心路径检查。
   - 阻断性错误、异常跳转与权限泄漏检查。
4. **Out of Scope**：
   - 新功能。
   - 完整自动化测试平台。
   - 压力测试。
   - 非阻断体验优化。
5. **Acceptance**：
   - 核心正向链路连续通过至少两轮。
   - 未登录用户和错误角色无法进入受限区域。
   - 未发布内容不会向 Reader 暴露。
   - 发布内容可以正常被 Reader 找到并阅读。
   - 没有阻断性错误或无法恢复的跳转循环。
   - Product Owner 完成一次人工全链路验收。
6. **授权等级**：Level 2；发现 Level 3 问题时转入 3A-3。
7. **是否阻塞上线**：是。
8. **推荐执行顺序**：第 3 个。

### Sprint 3A-3 — P0 Blocker Resolution

1. **Sprint 名称**：P0 上线阻塞修复
2. **目标**：消除 3A-1 或 3A-2 发现的真实 P0。
3. **Scope**：
   - 每次只处理一个 P0，或具有同一根因的一组问题。
   - 修复后复验原问题、核心链路和权限拒绝路径。
   - 记录根因、影响范围、验证结果和回退方式。
4. **Out of Scope**：
   - P1/P2 问题。
   - 顺手重构。
   - 未能稳定复现的问题。
   - 多个无关缺陷的批量处理。
5. **Acceptance**：
   - 原阻塞问题有明确复现证据并被消除。
   - 核心正向与拒绝路径均通过。
   - 没有引入新的 P0 或权限退化。
   - Product Owner 对该 P0 单独验收通过。
6. **授权等级**：按问题单独判定；最高为 Level 3。
7. **是否阻塞上线**：是；不存在 P0 时不执行。
8. **推荐执行顺序**：紧跟 3A-2；多个 P0 使用 3A-3A、3A-3B 分开验收。

### Phase 3A completion

完成条件：

- 3A-0、3A-1、3A-2 全部人工验收通过。
- 所有实际产生的 3A-3 均人工验收通过。
- P0 数量为零。
- Product Owner 确认 Beta 可以稳定上线。

## Phase 3B — Social Relationship Foundation

目标：建立作者公开身份、Reader 关注与邀请关系基础。Phase 3B 不阻塞 Beta 上线。

### Sprint 3B-1 — Author Public Profile

1. **Sprint 名称**：作者公开主页
2. **目标**：访客和 Reader 可以查看作者公开身份与已发布作品。
3. **Scope**：
   - Author Public Profile 与 Author Slug 路由。
   - 作者头像、名称、Bio、基础统计和已发布作品列表。
   - Empty、Loading、Error、权限与响应式状态。
4. **Out of Scope**：
   - 作者资料编辑、Cover、认证标识、社交链接。
   - 收藏夹、喜欢列表、数据分析、推荐作者。
5. **Acceptance**：
   - 作者主页可访问，未登录用户可浏览。
   - 仅展示已发布作品。
   - 空、加载、错误、响应式和 Accessibility 状态正常。
6. **授权等级**：Level 3。
7. **是否阻塞上线**：否。
8. **推荐执行顺序**：Phase 3B 第 1 个。

### Sprint 3B-2 — Follow System

1. **Sprint 名称**：Follow 关注系统
2. **目标**：建立 Reader 与 Author 的单向关注关系。
3. **Scope**：
   - Follow、Unfollow、当前状态、Followers 与 Following 数量。
   - 登录权限判断、Loading、Error 和适合时的即时反馈。
4. **Out of Scope**：
   - 通知、动态流、推荐、双向好友、Block、邮件或 Push。
5. **Acceptance**：
   - Follow / Unfollow 与数量正确。
   - 未登录点击 Follow 进入登录页并可返回作者页。
   - 重复操作不产生重复关系，权限与测试通过。
6. **授权等级**：Level 3。
7. **是否阻塞上线**：否。
8. **推荐执行顺序**：Phase 3B 第 2 个。

### Sprint 3B-3 — Invitation Relationship

1. **Sprint 名称**：Invitation Relationship
2. **目标**：建立可安全读取、数据一致的邀请人和被邀请人关系基础。
3. **Scope**：
   - Inviter、Invitee、邀请关系记录与基础统计。
   - 数据一致性校验与错误处理。
   - 重复操作不产生错误关系。
4. **Out of Scope**：
   - 邀请奖励、积分、Coin、Leaderboard、Referral Program 与 Marketing。
5. **Acceptance**：
   - 邀请关系正确，不允许重复建立关系。
   - 数据一致，错误状态可恢复，测试与文档同步通过。
6. **授权等级**：Level 3。
7. **是否阻塞上线**：否。
8. **推荐执行顺序**：Phase 3B 第 3 个。

## Phase 3C — Beta Polish

目标：优化 Beta 上线后的体验。Phase 3C 全部为非阻塞项，可延期。

### Sprint 3C-1 — Search MVP

1. **Sprint 名称**：Search MVP
2. **目标**：Reader 可以通过公开搜索入口发现已发布作品和公开作者。
3. **Scope**：
   - Search 页面、输入框与 URL Search Params 同步。
   - Published Work 标题与 Slug 搜索。
   - 公开 Author 名称与 Slug 搜索。
   - Results、Empty、Loading、Error、响应式与 Accessibility 状态。
4. **Out of Scope**：
   - 全文、AI、模糊、热门、推荐与历史搜索。
   - Elasticsearch、Algolia、Ranking、Search Analytics。
   - Browse Experience 与 SEO Foundation。
5. **Acceptance**：
   - Published Works、Work Slug 与公开 Author 搜索正常。
   - Draft 与未发布作品不进入结果。
   - URL、状态、响应式与 Accessibility 通过。
6. **授权等级**：Level 2；已批准的窄只读查询 Migration 不改变权限模型。
7. **是否阻塞上线**：否。
8. **推荐执行顺序**：Phase 3C 第 1 个。

### Sprint 3C-2 — Browse Experience

1. **Sprint 名称**：Browse Experience
2. **目标**：建立 Reader 浏览 Published Works 的标准 Archive 入口。
3. **Scope**：
   - Archive 浏览页面与 Published Works 列表。
   - 分页、排序及 URL Search Params 同步。
   - Empty、Loading、Error、响应式与 Accessibility。
   - Draft 与未发布作品隔离；URL 可分享并恢复当前浏览状态。
4. **Out of Scope**：
   - Infinite Scroll、个性化推荐、Trending、热门榜单。
   - 分类/标签推荐、AI Recommendation、Analytics。
   - SEO Foundation 与 Search 功能扩展。
5. **Acceptance**：
   - Archive 与 Published Works 浏览正常，Draft 不进入 Archive。
   - Pagination、Sorting 与 URL 参数正常且顺序稳定。
   - Empty、Loading、Error、Responsive 与 Accessibility 通过。
6. **授权等级**：Level 2；已批准窄只读查询 Migration，不改变权限模型。
7. **是否阻塞上线**：否。
8. **推荐执行顺序**：Phase 3C 第 2 个。

### Sprint 3C-3 — SEO Foundation

1. **Sprint 名称**：SEO Foundation
2. **目标**：建立 Public Beta 所需的公开页面基础索引与社交分享能力。
3. **Scope**：
   - `sitemap.xml` 与 `robots.txt`。
   - 站点、Archive、Search、Published Work 与公开 Author Metadata。
   - 页面 Title、Description、Canonical 与 Open Graph Metadata。
   - Sitemap 只包含 Published 内容；Draft 与未发布内容不可索引。
4. **Out of Scope**：
   - Schema.org、JSON-LD、RSS Feed、Sitemap Index。
   - 多语言 SEO、AI SEO、SEO Analytics 与 Search Console 集成。
   - Permission Model、Auth 架构或公开阅读规则变更。
5. **Acceptance**：
   - Sitemap、robots、Metadata、Canonical 与 Open Graph 正常输出。
   - Published 页面 Metadata 完整，Draft 不进入 Sitemap 且不可索引。
   - Responsive 不受影响，完整 Validation 与 Browser QA 通过。
6. **授权等级**：Level 2；复用现有 Published-only 读取边界，不改变权限模型。
7. **是否阻塞上线**：否。
8. **推荐执行顺序**：Phase 3C 第 3 个。

### Sprint 3C-4 — Mobile, UI & Copy Polish

1. **Sprint 名称**：移动端、UI 与文案最小统一
2. **目标**：消除影响 Beta 使用的窄屏、交互和表达问题。
3. **Scope**：
   - 登录、注册、Reader、Studio 和 Admin 的基础窄屏适配。
   - 按钮、表单、间距和状态表达的最小统一。
   - 清理过时、混乱或面向开发阶段的文案。
   - 触控尺寸、键盘操作和横向溢出检查。
4. **Out of Scope**：
   - 新 Design System。
   - 品牌重塑。
   - 动画系统。
   - 多语言。
   - 像素级全站精修。
5. **Acceptance**：
   - 常见手机宽度下核心页面可正常使用。
   - 没有阻断性横向滚动。
   - 核心按钮和表单可触控、可键盘操作。
   - 不再显示明显过时的开发阶段文案。
   - 桌面核心流程没有回归。
6. **授权等级**：Level 2。
7. **是否阻塞上线**：否。
8. **推荐执行顺序**：Phase 3C 第 4 个。

## Release Readiness

Release Readiness 独立于 Phase 3，不是 Beta 功能 Sprint，也不改变“只有 Phase 3A 阻塞 Beta 上线”的治理规则。

### Sprint RR-1 — Release Candidate & Go / No-Go

1. **Sprint 名称**：Release Candidate 与 Go / No-Go
2. **目标**：形成可审核、可回退、可交接的正式发布候选版本。
3. **Scope**：
   - 确认 Release Candidate。
   - 完成上线检查、回退文档和上线 Checklist。
   - 汇总质量检查、人工 Smoke Test 与已接受风险。
   - 记录 Beta 限制、测试数据准备和故障处理说明。
   - 组织最终 Go / No-Go 决策。
4. **Out of Scope**：
   - 新产品功能。
   - 大规模性能工程。
   - 新运营后台。
   - 未获独立授权的正式流量切换。
5. **Acceptance**：
   - Release Candidate 可复现并通过批准的质量检查。
   - P0 为零。
   - 上线与回退步骤可由交接人员执行。
   - 所有剩余问题均有明确接受或延期结论。
   - Product Owner 完成 Go / No-Go 签署。
6. **授权等级**：Level 3。
7. **是否阻塞上线**：不属于 Beta Blocking；它是正式发布准备与决策门禁。
8. **推荐执行顺序**：Phase 3A 完成且准备正式发布时独立授权。

## Execution order

推荐顺序：

1. `3A-0 → 3A-1 → 3A-2`
2. 如存在 P0：逐个执行 `3A-3A / 3A-3B / ...`
3. Phase 3A 人工验收完成后，Beta 可上线。
4. `3B-1 → 3B-2 → 3B-3` 可按运营需要在 Beta 后执行。
5. `3C-1 → 3C-2 → 3C-3 → 3C-4` 可按体验反馈延期或调整顺序。
6. `RR-1` 在准备正式发布时独立授权。

Mission 3A 已于 2026-07-02 获得一次性执行授权，覆盖 3A-0、3A-1、3A-2
以及存在真实 P0 时的 3A-3。工程证据见
[`MISSION_3A_REPORT.md`](MISSION_3A_REPORT.md)。Product Owner 已于
2026-07-02 确认 `Mission 3A. PASS`。Product Owner 已于 2026-07-03 确认
`Mission 3B. PASS`。Product Owner 已于 2026-07-03 确认 `Mission 3C-1. PASS`。
Mission 3C-2 Browse Experience 已由 Product Owner 确认 PASS 并正式关闭；Mission
3C-3 SEO Foundation 已于 2026-07-04 由 Product Owner 确认 PASS。Mission 3C 与
Phase 3 已正式完成并关闭；RR-1 仍为 Planned / Unauthorized，未开始。
