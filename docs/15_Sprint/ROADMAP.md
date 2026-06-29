# Fandom Harbor Product Phase Roadmap

Status: Proposed for Phase 0.6 final approval  
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

## Phase 3 — Reading

文档包：[`Phase_3_Reading`](Phases/Phase_3_Reading/README.md)

目标：阅读页、移动端阅读体验、阅读历史、收藏、Kudos、推荐。

建议 Sprint 切片：阅读壳层与排版；章节导航/阅读偏好；移动端；历史/进度；收藏；Kudos；非信息流式推荐。

退出结果：Reader 能在移动端和桌面端舒适阅读、恢复进度并使用归档型互动。

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

退出结果：所有发布门禁通过，备份可恢复、权限无泄漏、核心阅读体验达到验收标准。

## Cross-phase rules

- Research → Requirement → Architecture → Database → API → UI → Review → Development → Testing → Documentation Update 始终适用。
- 跨 Phase 能力只能在前置契约稳定后开始；不得以“以后补文档”为理由跳过。
- Feature Flag 不改变 Phase 所有权，也不替代安全边界。
- 未完成 Phase 的剩余工作进入明确 Backlog/Known Issue，不通过悄悄扩大下一个 Phase 来掩盖。
