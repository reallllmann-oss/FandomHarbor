# Fandom Harbor Product Phase Roadmap

Status: Active — Admin P1-05B-3 blocked at fail-closed composition boundary
Roadmap type: Product Phase Roadmap

## Phase and Sprint model

- **Phase is a product stage.** It defines a coherent product capability and its approval gate.
- **Sprint is an engineering execution unit inside a Phase.** A Phase may contain multiple Sprints.
- A Phase does not authorize all its code at once. Each Sprint still requires an approved brief, scope, dependencies and acceptance criteria.
- Phase numbering is product history; Sprint numbering may restart inside each Phase, for example `Phase 2 / Sprint 1`.
- Each Phase has its own README, Goals, Scope, Acceptance, Risks, Sprint Template and Retrospective under `docs/15_Sprint/Phases/`.

## Phase 0 — Project OS

目标：项目目录、AI 记忆体、基础文档、开发规则。

主要产出：项目记忆中心、产品愿景、固定技术栈、初版 PRD、架构/数据库/API/UI/安全规则、验收门禁。

状态：Completed。

文档包：[`Phase_0_Project_OS`](Phases/Phase_0_Project_OS/README.md)

## Phase 0.5 — Freeze Product Blueprint

目标：冻结目录、技术栈、文档结构、命名规范、产品原则和 Phase 路线图。

主要产出：数字化文档目录、apps/packages 边界、13 份强制启动文档、设计决策、功能开关、样式规则、产品原则、未决问题与 Product Phase Roadmap。

退出条件：产品负责人批准蓝图；目录和命名无未记录冲突；Phase 1 阻塞问题有明确决定或归属；仍无业务代码。

状态：Completed; superseded by Phase 0.6 final freeze review.

文档包：[`Phase_0_5_Freeze_Product_Blueprint`](Phases/Phase_0_5_Freeze_Product_Blueprint/README.md)

## Phase 0.6 — Product Freeze Review

目标：冻结目录结构、命名规范、架构、产品原则、文档标准、开发工作流和 AI 行为。

主要产出：UI/Design System/Component 三层；Database/API 分类注册；Vision、Non-Goals、Glossary；永久 ADR；Phase 七件套；AI Behavior Contract。

退出条件：全部引用和分类一致；无应用代码；产品负责人批准；Phase 1 身份/邀请阻塞项有明确决定；此后禁止无 ADR 的大规模目录重构。

状态：In Progress — documentation complete, awaiting product-owner approval.

文档包：[`Phase_0_6_Product_Freeze_Review`](Phases/Phase_0_6_Product_Freeze_Review/README.md)

## Phase 1 — Identity

文档包：[`Phase_1_Identity`](Phases/Phase_1_Identity/README.md)

目标：登录、邀请码门禁、角色权限、RLS、审计日志。

建议 Sprint 切片：工程/环境基线；Supabase Auth；邀请码兑换与信任链；Membership/Role Grants；RLS 测试矩阵；审计事件；Web/Admin 访问壳层。

退出结果：访客、Reader、Author、Admin、Super Admin 的允许与拒绝路径可验证，撤销/暂停能立即生效。

## Phase 2 — Publishing

文档包：[`Phase_2_Publishing`](Phases/Phase_2_Publishing/README.md)

目标：笔名、作品、章节、系列、编辑器、版本历史、Diff、恢复。

建议 Sprint 切片：笔名与作者归属；作品/章节；TipTap Schema 与编辑器；发布/预览；不可变版本；Diff/Restore；系列。

退出结果：Author 能以笔名发布、修订和恢复一部文本作品，且不能修改他人作品。

## Phase 3 — Fast Launch

文档包：[`Phase_3_Reading`](Phases/Phase_3_Reading/README.md)

> `Phase_3_Reading` 目录名仅为历史路径兼容；当前产品范围以 Fast Launch
> Edition 为准。

目标：以最快速度完成稳定 Beta 上线。Phase 3 不追求完整功能，只处理 Beta
阻塞、最小运营能力和可延期体验优化。

详细计划：[`Phase 3 Sprint Plan（Fast Launch Edition）`](Phases/Phase_3_Reading/SPRINT_PLAN_FAST_LAUNCH.md)

阶段与 Sprint：

- **Phase 3A — Beta Blocking**：`3A-0` Beta 基线、`3A-1`
  Production/Supabase/Auth/Env 验真、`3A-2` 远程核心链路、`3A-3` 条件性 P0
  修复。工程执行已完成，P0 为零，Product Owner 已确认 Mission 3A PASS。Phase
  3A Beta Blocking 已解除。
- **Phase 3B — Social Relationship Foundation**：`3B-1` Author Public
  Profile、`3B-2` Follow System、`3B-3` Invitation Relationship Foundation。
  Product Owner 于 2026-07-03 确认 PASS；Mission 正式关闭。
- **Phase 3C — Platform Experience Foundation**：`3C-1` Search MVP 已由
  Product Owner 确认 PASS；`3C-2` Browse Experience 已由 Product Owner
  确认 PASS；`3C-3` SEO Foundation 已由 Product Owner 确认 PASS。
  Mission 3C 与 Phase 3 已正式关闭并标记 Completed。`RR-1A`、`RR-1B`
  与 `RR-1C` 已进入 Release Readiness 记录；`RR-1C` 已通过 Product Owner
  最终验收。

退出结果：Phase 3 P0 为零，全部批准范围通过 Product Owner 人工验收，Phase 3
Completed，Beta 可以稳定上线。

## Release Readiness — Independent

`RR-1`（原 Sprint 3.10）独立于 Phase 3，负责 Release Candidate、Go / No-Go、
上线检查、回退文档和上线 Checklist。它不是 Beta 功能 Sprint，也不授权正式发布。

- `RR-1A` Release Preparation：Completed baseline。
- `RR-1B` Deployment：PASS — Product Owner Accepted（2026-07-07）。
- `RR-1C` Release Candidate：PASS — Product Owner Accepted / Beta Ready
  （2026-07-11）。

RR-1A 已建立 Runtime / Migration / Validation Baseline、Release Checklist 与 Browser
QA Checklist。RR-1B 已完成生产部署与 Product Owner 人工验收。RR-1C Release
Candidate 已完成最终审计、验证、Browser/Mobile QA、Beta Ready Checklist 与 Git
baseline。Git Tag 与 Go / No-Go 尚未授权、未开始。
RR-1C 验收发现的本地 Auth 空状态已通过 localhost-only QA Fixture 恢复；
Reader/Author 登录、Author Profile、Studio 权限与 Reader 拒绝路径已验证。Reader
访问 Studio 自动重定向 Archive；Mission 已正式关闭。

证据见 [`Release_Readiness`](Release_Readiness/README.md)。

## Admin P1 — Identity & Access Governance（Independent）

文档包：[`Admin_P1`](Admin_P1/README.md)

目标：将现有 `/access` 直接写入表单升级为成员目录、搜索、详情、审计上下文和受控 Membership / Role Governance，同时保持 Phase 1C 权限模型不变。

P1-00 已由 Product Owner 于 2026-08-16 批准并完成范围冻结：Membership 与 Role 同时纳入；所有写操作要求原因和二次确认；elevated role / elevated Membership 操作要求当前操作者 registration-name/password 重新认证；暂不采用双人审批；邀请延期；Web 后台入口关闭；远程写入 QA 禁止使用 Production。

状态：`ORDINARY GOVERNANCE LOCAL COMPLETE / P1 NOT READY FOR CLOSURE / OPTION 3 / ELEVATED MUTATIONS DEFERRED`。P1-03 已形成 Commit `9caac4a9affbd3ea9d13cbae266696f9c853490e`。P1-04A 已形成 Commit `2750205f2b9a3cce2c09d2e3f5e43ba1b7d421cd`，完成本地原子 ACL cutover：旧 RPC `0/12`、v2 RPC authenticated-only `3/12`、private helper/executor `0/36`，read RPC 仍为 authenticated-only `3/12`。两次 clean 20-Migration rebuild、14 个 SQL suite 与 rollback rehearsal 通过；未远程 apply。

P1-03 的历史 handoff 仅允许 `/access` 读取 UI、三个读取 Service 用例和逐读取 live-access check。随后独立授权的 P1-04 只覆盖 ordinary Membership 与 Author Role 的 Edit/Review/reason/confirm、Server Action、`Saved | Unchanged | Conflict` 展示和先撤旧、证明 deny、再开三个 v2 的单一原子 cutover；回滚不得重开旧 RPC。Web Admin 入口继续关闭。

现有 registration-name/password adapter 仍不能提供数据库可验证、绑定原 Session/单次操作的 proof；ADR-022 Option 3 与 KI-033 `ACCEPTED DEFERRED BOUNDARY` 不变。Admin/Super Admin Role 与 elevated-account Membership 写入继续延期。P1.1 Elevated Access Governance 为 `DEFERRED / NOT AUTHORIZED`，只能在 P1 Closure 后经 Product Owner 独立授权与新的 Auth/Access ADR 重新评估，并优先考虑 MFA/AAL2。邀请管理继续独立延期且不归入 P1.1。权威计划见 [`P1_02_IMPLEMENTATION_PLAN.md`](Admin_P1/P1_02_IMPLEMENTATION_PLAN.md)，闭环与交接见 [`P1_02G_BACKEND_CLOSURE_AND_UI_HANDOFF.md`](Admin_P1/P1_02G_BACKEND_CLOSURE_AND_UI_HANDOFF.md)。

P1-02A–G 已 Commit。P1-03 只读 `/access` 已形成 Commit `9caac4a9affbd3ea9d13cbae266696f9c853490e`：通过 P1-02F Service 的 Search/Detail/Audit 三个 read 和逐调用 live-access check 展示最小治理信息，覆盖稳定分页、loading、empty、unauthorized、safe read error 与延期提示。页面仍无写表单、mutation Action 绑定或 direct database/RPC，Web Admin 入口继续关闭。P1-03 Closure 当时的 write-closed/legacy-open ACL 已由随后单独授权的 P1-04A 本地 cutover 取代。证据见 [`P1_03_ACCEPTANCE_EVIDENCE.md`](Admin_P1/P1_03_ACCEPTANCE_EVIDENCE.md)。

P1-04A 仅完成本地数据库权限切换，不修改 `/access`、Action、Service、Repository、Auth 或业务 schema。原子顺序为 exact preconditions → revoke old → prove deny → grant three v2 → final/private assertions；本地失败回滚演练证明不会留下半切换 ACL。该阶段的独立 Commit 为 `2750205f2b9a3cce2c09d2e3f5e43ba1b7d421cd`。证据见 [`P1_04A_ACCEPTANCE_EVIDENCE.md`](Admin_P1/P1_04A_ACCEPTANCE_EVIDENCE.md)。

P1-04B 已形成 Commit `bf35f5a1e4b005e04bb4b9d054cf6310ffb0c74c`。`/access` 本地实现 ordinary Membership 与 Author Role 的规范化 reason、Review、独立确认、稳定 requestId、expected-state 与 `Saved | Unchanged | Conflict`；调用链保持 Action → P1-02F Service → strict Repository → v2 RPC，elevated 账户无可执行控件。至此 ordinary governance 本地实现完成。证据见 [`P1_04B_ACCEPTANCE_EVIDENCE.md`](Admin_P1/P1_04B_ACCEPTANCE_EVIDENCE.md)。

P1 尚不具备 Closure 条件。P1-05 `Local + Dedicated Non-Production Remote QA` 仍是 P1 Closure blocker：Attempt 1 的 bootstrap 在 D 失败并完成 emergency fail-closed；R1 修正已 Commit；R2 已在全新 Hosted QA 从空状态完成 20/20 Migration、精确 catalog/ACL、安全模式与不可变保护检查。P1-05B-2 已在 Attempt 2 完成读取与拒绝 QA。P1-05B-3 的首个正式 ordinary Membership Confirm 在 write Port 前返回 `INVALID_INPUT`；零业务、Audit 或 Ledger 写入。Action-to-Service branded command 二次解析是当前实现 blocker。Stop Gate 后 QA2 已清空 synthetic Auth/业务/审计/凭据，并将 v2 write 关闭到 `0/12`；20/20 Migration、read `3/12`、old `0/12`、private `0/36` 与非 fixture 基线保持。P1-05B-3 为 `BLOCKED / WAITING FOR PRODUCT OWNER DECISION`，证据见 [`P1_05B3_MUTATION_AND_CLEANUP_QA_EVIDENCE.md`](Admin_P1/P1_05B3_MUTATION_AND_CLEANUP_QA_EVIDENCE.md)。Production 禁止作为测试环境。P1-06 Protected Admin Preview Acceptance 与 P1-07 Production Release Review 均未授权。Admin Production 保持 paused，Web Admin 入口保持关闭，P0 Production Site Copy 保持 Version 7。

P1-05A preparation 已形成 Commit `4990440cb0a6e341ce242380480a06fe0c62ea14`。P1-05B Attempt 1 的 fresh QA bootstrap 在 Migration D 因 Hosted legacy direct `anon` execute 与本地前置假设不一致而失败；1–19 已应用、D 未应用，未创建 fixture 或执行业务 QA。授权的 emergency fail-closed 已关闭全部六个 write RPC 的四角色 execute；该部分 QA 环境不得继续使用。

P1-05B-1R1 本地修正保持 20-Migration 顺序和最终 ACL 不变，并形成 Commit `4f93db9a834843da7640bdf52a31817f2ff528e1`。R2 将 Attempt 1 暂停为 `INACTIVE` 但未删除，随后创建独立 Free/Nano Attempt 2 `hicfnlwzmnbxhimyeviy`。全新 Project 的 Hosted 默认函数 grants 差异再次被观察，修正后的 D 正常原子收敛；远程 catalog 20/20，old `0/12`、v2 `3/12`、read `3/12`、private `0/36`。Attempt 2-only 数据库密码旋转已记录并获 Product Owner 接受；R2 Closure Commit 已授权。该 R2 时点尚无 fixture 或业务 QA；后续 P1-05B-2 结果由上一段与 [`P1_05B2_READ_DENIAL_QA_EVIDENCE.md`](Admin_P1/P1_05B2_READ_DENIAL_QA_EVIDENCE.md) 取代。P1-06、P1-07 和 P1.1 均需 Product Owner 另行授权。R2 bootstrap 证据见 [`P1_05B1_ATTEMPT2_BOOTSTRAP_EVIDENCE.md`](Admin_P1/P1_05B1_ATTEMPT2_BOOTSTRAP_EVIDENCE.md)。

Admin P1 不属于 Phase 7 Admin Intelligence。Phase 7 的 analytics、metric、retention/export 与 audit explorer 仍保持 Planned，不能借 P1 扩大。

## Phase 4 — Archive

文档包：[`Phase_4_Archive`](Phases/Phase_4_Archive/README.md)

目标：标签、规范化标签、CP 关系、分级、预警、搜索、筛选。

建议 Sprint 切片：受控元数据；自由标签；Canonical/Alias/Merge；关系/CP；PostgreSQL 搜索；组合筛选；标签治理后台。

退出结果：Reader 可准确发现作品，Admin 可治理标签而不破坏作者原始表达和历史链接。

## Phase 5 — Interaction

文档包：[`Phase_5_Interaction`](Phases/Phase_5_Interaction/README.md)

目标：评论、回复、匿名评论、评论审核、反滥用。

建议 Sprint 切片：评论/回复模型；匿名展示策略；编辑/删除；作者侧管理；Admin 审核；频率限制与滥用信号。

退出结果：评论支持安全对话，不泄露隐藏身份，也不演化为社交信息流。

## Phase 6 — Moderation

文档包：[`Phase_6_Moderation`](Phases/Phase_6_Moderation/README.md)

目标：举报、举报证据、处理流程、作者通知、管理员审核、异常行为监控。

建议 Sprint 切片：举报提交；私密证据；状态机/分派；作者通知；申诉/复核；恶意举报防护；异常行为监控。

退出结果：举报全流程可追踪、可复核、保护举报人和作者，不以举报数量自动定罪。

## Phase 7 — Admin Intelligence

文档包：[`Phase_7_Admin_Intelligence`](Phases/Phase_7_Admin_Intelligence/README.md)

目标：数据面板、热门标签、热门 CP、活跃作者、阅读来源、审计日志。

建议 Sprint 切片：指标定义/隐私；聚合模型；作者数据；Admin Dashboard；审计检索；数据保留与导出。

退出结果：管理员获得可解释、隐私合规的运营信息，指标不制造公开竞争排名。

## Phase 8 — Release

文档包：[`Phase_8_Release`](Phases/Phase_8_Release/README.md)

目标：UI 精修、性能优化、安全检查、备份恢复、部署上线。

建议 Sprint 切片：跨端 UI QA；无障碍；性能预算；安全测试；备份/恢复演练；监控/告警；部署/回滚；上线审核。

Phase 8 保留为长期完整 Release 能力。V1 Fast Launch 的最小 Release Readiness
由独立 `RR-1` 承担，不表示 Phase 8 已启动或被完成。

退出结果：所有发布门禁通过，备份可恢复、权限无泄漏、核心阅读体验达到验收标准。

## Cross-phase rules

- Research → Requirement → Architecture → Database → API → UI → Review → Development → Testing → Documentation Update 始终适用。
- 跨 Phase 能力只能在前置契约稳定后开始；不得以“以后补文档”为理由跳过。
- Feature Flag 不改变 Phase 所有权，也不替代安全边界。
- 未完成 Phase 的剩余工作进入明确 Backlog/Known Issue，不通过悄悄扩大下一个 Phase 来掩盖。
