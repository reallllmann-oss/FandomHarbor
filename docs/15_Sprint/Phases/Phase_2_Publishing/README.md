# Phase 2 — Publishing

Status: Phase 2 Pass — Auth P0 resolved; Phase 3 implementation requires separate authorization

实现笔名、作品、章节、系列、编辑器、版本、Diff 和恢复。

## Required phase documents

- [Goals](Goals.md)
- [Scope](Scope.md)
- [Acceptance](Acceptance.md)
- [Product Handoff](Product_Handoff.md)
- [Risks](Risks.md)
- [Sprint Template](Sprint_Template.md)
- [Retrospective](Retrospective.md)

A Phase describes product evolution. Sprints are bounded engineering execution units inside this Phase. No Phase document authorizes code without an approved Sprint brief.

## Active Sprint

- [Sprint 002A — Content Domain Foundation](Sprint_002A_Content_Domain_Foundation.md)
- [Sprint 002B — Reading Experience Foundation](Sprint_002B_Reading_Experience_Foundation.md)
- [Sprint 002B-Step02 — Reader Preferences + Navigation Persistence](Sprint_002B_Reader_Preferences_Navigation_Persistence.md)
- [Sprint 002C-Step01 — Author Studio Foundation](Sprint_002C_Author_Studio_Foundation.md)
- [Sprint 002D — Author Creation Experience UI Shell](Sprint_002D_Author_Creation_Experience_UI_Shell.md)
- [Sprint 002E — Minimal Draft Editor](Sprint_002E_Minimal_Draft_Editor.md)
- [Sprint 002F — Minimal Publish Workflow](Sprint_002F_Minimal_Publish_Workflow.md)
- [Sprint 002G — Public Reading](Sprint_002G_Public_Reading.md)
- [Sprint 002H — Bookshelf / Library](Sprint_002H_Bookshelf_Library.md)
- [Phase 2 Auth P0 — Registration Model](Phase_2_Auth_P0_Registration_Model.md)

Sprint 002C 已冻结并可正式关闭。Sprint 002D-Step01 已完成 Create Work UI Shell；经 Product Owner 调整优先级，Step02 已替代原 Create Article UI Shell并完成 Work Draft Persistence。Migration、种子、RPC、权限与原子回滚已在本地 PostgreSQL 实测通过，Step02 正式 Accepted。发布及其他写入仍未开放。

Sprint 002E-Step02 已在 `/studio/works/[workId]/edit` 打通最小 Draft Body Save：owner Author 可把 plain-text 正文保存到当前 draft Work 的首个 Chapter；没有 Chapter 时首次保存创建默认首章。Publish 继续 disabled，Reader published-only 合同保持不变。

Sprint 002F 已完成最小 Publish Workflow：同一编辑表单现在支持发布，owner Author 可将自己的 draft Work 与首章发布为 published，并立即进入 Reader 已发布章节页。Reader Library、Work detail 与 Chapter reading route 已能读取数据库中的新发布作品，同时保留 fixture published 内容回退。

Sprint 002G 已完成 Public Reading：`/articles/[slug]` 已加入与 Work/Chapter 相同的 hybrid published gateway，Reader 公共读取统一优先读取数据库中的 published 内容并在未命中时回退到 fixture published 内容，draft Work/Chapter/Article 继续完全隔离。

Sprint 002H 已完成 Bookshelf / Library：`/works` 现在既是 published Reader Library，也承担本地书架回访入口；用户可直接继续上次阅读、打开最近书签，并在 published Work / Article 间做最小客户端筛选。

Phase 2 Auth P0 本地代码与 Runtime 已于 2026-07-02 修复并重新验证。随后人工回归曾发现远程 Supabase 未部署注册 Migration；该远程部署缺口现已修复。Product Owner 已在远程支持的 Web 环境完成真实注册、登录和 Studio 进入验收。

Product Owner 人工验收结论更新为 **Phase 2 Pass**：作者后台与读者后台已手动检查，远程注册 P0 验收链路已通过，Phase 2 Auth P0 已解除。

远程验收环境已完成九条 Migration、注册 RPC、Email Confirm 关闭、QA 邀请码和前端连接检查。`Auther001` 已完成注册名 + 密码登录，并在按产品规则手工授予 Author 后成功进入 Studio。Phase 3 尚未启动，仍需独立规划与明确授权。
