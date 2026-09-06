# Fandom Harbor Admin P0 Release Closure

> 本文是 2026-08-15 Release Closure 的时间点证据，不是持续更新的当前 Production Deployment registry。后续 Deployment 或 Roadmap 状态以更新日期更晚的 Release 记录与 `.ai/PROJECT_STATUS.md` 顶部当前状态为准；不得改写本文中的历史 ID。

| 项目                             | 结果                     |
| -------------------------------- | ------------------------ |
| Mission                          | ADMIN P0 RELEASE CLOSURE |
| Closure date                     | 2026-08-15               |
| Web Production                   | PASS                     |
| Admin Production                 | PASS                     |
| Site Copy                        | Version 7 原始八字段     |
| Admin Project final state        | `paused=true`            |
| Release operations after closure | NONE                     |

## 1. Closure Summary

Admin P0 的 Web 与 Admin Production 发布均已完成验收。Web Production 保持正常服务；Admin Production 已通过已验收 Preview 的官方 Promotion 发布并完成不保存数据的人工 Smoke，随后重新 Pause。Release Closure 阶段仅归档证据并同步项目状态，没有执行部署、Promotion、Rollback、数据写入或配置变更。

## 2. Web Production Final State

| 项目                 | 最终状态                                   |
| -------------------- | ------------------------------------------ |
| Deployment           | `dpl_AQ2cmyYP54rXjpLDn9oi2xvBZ5mM`         |
| Source Commit        | `d2c31d231abe971a7266094adfc0966d6de49fa9` |
| Environment / Status | Production / READY                         |
| Production Smoke     | PASS                                       |
| Production Alias     | 保持不变                                   |

Web Production Smoke 覆盖 Homepage、八字段公开映射、CTA 固定路径、导航合同、Footer 与法务链接、Archive、Search、Guest/Reader/Author 权限边界、Reader `/studio` → `/archive` 跳转，以及内部 Revision、Audit、request ID 与数据库 metadata 不向客户端公开。

## 3. Admin Production Final State

| 项目                    | 最终状态                                   |
| ----------------------- | ------------------------------------------ |
| Accepted source Preview | `dpl_3ayj6Rg8Y9qTk3xJ9Ef8ezn7XNHC`         |
| Production Deployment   | `dpl_FfoexkkfWCk1wb8ZkJcDsbQdF5z7`         |
| Source Commit           | `5463032a2aa5d98c8299c8d6e3dfeaae60818042` |
| Environment / Status    | Production / READY                         |
| Primary Alias           | `fandom-harbor-admin.vercel.app`           |
| Production Branch       | `admin-production-disabled`                |
| Production Smoke        | PASS                                       |
| Final Project state     | `paused=true`                              |

官方 Preview Promotion 只创建一个新的 Admin Production Deployment。没有 Retry、Redeploy、第二个 Production Deployment 或 Rollback；Primary Alias 自动切换至该 READY Deployment，Production Branch 未修改。

## 4. Controlled Release Window

| 事件                    | UTC 时间               |
| ----------------------- | ---------------------- |
| Unpause confirmed       | `2026-08-15T07:24:17Z` |
| `paused=true` confirmed | `2026-08-15T07:52:22Z` |
| Total unpaused duration | 约 28 分 04 秒         |

45 分钟一次性自动 Pause Guard 在发布前建立。Smoke 完成并确认 Admin Project 已重新 Pause 后，Guard、保护脚本与临时保护目录均已卸载和清理，无残留任务。

## 5. Data Invariants

| 不变量                      | 最终结果                      |
| --------------------------- | ----------------------------- |
| Current Site Copy           | Version 7，原始八字段逐字一致 |
| Revision count              | 7                             |
| Site Copy Audit count       | 7                             |
| Current Audit ID            | 81                            |
| Current Pointer             | 指向原 Version 7 Revision     |
| Version 8                   | 不存在                        |
| Release-window save request | 未发现 `save_site_copy` 请求  |

最终原始八字段为：

1. Homepage 标题：`Fandom Harbor`
2. Homepage 介绍：`一座为公开故事发现与长久阅读保留安静位置的文学港湾。作品在这里以清楚的作者身份被认真归档，读者可以从一部故事开始，按自己的节奏停留，再回来。`
3. 主 CTA：`浏览公开作品`
4. 次 CTA：`查找作品与作者`
5. Archive 显示名称：`Archive`
6. Search 显示名称：`Search`
7. Studio 显示名称：`Studio`
8. Footer 品牌说明：`Fandom Harbor · 私域作品归档`

## 6. Admin Production Access Acceptance

- 正常 Admin 登录通过，管理页读取 Version 7 与原始八字段通过。
- 单字段合法草稿的 Review Changes 只显示一项预期差异；随后取消 Review、恢复本地输入并刷新，未点击 Save。
- `/access` 既有行为保持不变，验收期间未执行身份或权限操作。
- Admin 本地会话已正常退出；匿名用户不能进入管理页面。
- Reader 无法进入 Admin Production；既有 Admin 权限边界保持不变。
- 发布窗口内 Revision、Audit、Pointer、身份、权限及业务数据均未出现非预期变化。

## 7. Non-State-Changing Interface Corrections

发布过程中有两次被平台安全拒绝的接口尝试，均未改变任何外部状态：

1. 旧式 Unpause 请求被 Vercel 以 HTTP 400 拒绝；没有改变 Project Pause 状态。随后使用官方 Project Unpause 接口完成受控 Unpause。
2. 针对 Preview 误用直接切流端点被 Vercel 以 HTTP 422 拒绝；没有创建 Deployment、切换 Alias 或改变 Project 状态。随后仅使用官方 Preview Promotion 创建一个 Production Deployment。

两次拒绝均发生在实际状态变更之前，且已通过只读检查确认零 Deployment、零 Alias、零 Project 状态变化。

## 8. Isolation, Rollback and Final Safety State

- Web 与 Admin 属于独立 Vercel Project；Admin Promotion 未改变 Web Production Deployment、Commit 或 Alias。
- 上一稳定 Admin Production `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` 保留为已验证的直接回滚基线；本次无 P0/P1 问题，因此未执行 Rollback。
- Supabase Migration、RPC、RLS、Grant、Auth、Role、Membership、Site Copy 与业务数据均未在发布或 Closure 阶段修改。
- Admin Project 最终确认 `paused=true`；Production Branch 仍为 `admin-production-disabled`。
- Closure 阶段没有 Push、Merge、PR、Deployment、Retry、Redeploy、Promotion 或 Production 配置操作。

## 9. Evidence Chain

- Preview 与跨应用验收证据：[`ADMIN_P0_DEPLOY_01_PREVIEW_ACCEPTANCE.md`](../13_Test/ADMIN_P0_DEPLOY_01_PREVIEW_ACCEPTANCE.md)
- Web Production Release：Merge Commit `d2c31d231abe971a7266094adfc0966d6de49fa9` 与 Deployment `dpl_AQ2cmyYP54rXjpLDn9oi2xvBZ5mM`
- Admin Production Release：accepted Preview `dpl_3ayj6Rg8Y9qTk3xJ9Ef8ezn7XNHC` → Production `dpl_FfoexkkfWCk1wb8ZkJcDsbQdF5z7`

## 10. Final Decision

**ADMIN P0 RELEASE CLOSURE — PASS**

Web Production 已发布并通过 Smoke；Admin Production 已发布并通过不保存数据的 Smoke，随后安全重新 Pause。Version 7 原始八字段、Revision/Audit/Pointer 与访问边界保持一致，Version 8 不存在。
