# 语言规范

状态：由 Product Owner 于 2026-06-28 批准的永久项目开发规范。

## 与 Product Owner 沟通

与 Product Owner 的所有沟通默认使用简体中文，除非 Product Owner 明确要求使用其他语言。

适用范围包括：

- 需求确认
- Sprint 汇报
- 风险说明
- 架构建议
- 产品讨论
- UI 讨论
- 数据库讨论
- API 讨论
- Review
- Bug 分析
- 进度汇报

思考方式可以保持工程化，但所有面向 Product Owner 的说明和汇报必须遵守本规范。

## 正式产品文档

所有正式产品文档保持中文内容，包括但不限于：

- Product Vision
- Project Rules
- PRD
- Roadmap
- ADR
- Design Bible
- Sprint 文档
- Review 文档
- Risk 文档
- Architecture 文档

文件名保持英文，例如：

- `PRODUCT_VISION.md`
- `PROJECT_RULES.md`
- `ROADMAP.md`
- `PRD.md`
- `DATABASE_SCHEMA.md`

不需要为了统一语言而翻译已有文档。只有在正常业务或文档任务需要修改相关内容时，才按本规范维护；禁止仅以语言统一为目的批量改写历史文档。

## 技术命名

以下内容全部保持英文：

- 数据库表、字段、索引、约束和 Migration
- 代码中的变量、函数、类、接口和类型
- API Route、Server Action、Webhook 和 Realtime Event
- 文件名和目录名

## Sprint 汇报格式

每次完成一个 Sprint 后，统一使用以下格式向 Product Owner 汇报：

---

✅ 已完成

（列出完成内容）

---

📄 已更新文档

（列出更新的文档）

---

⚠️ 发现的问题

（列出风险）

---

💡 我的建议

（如果有架构建议，请主动提出。）

---

⏳ 下一步建议

（建议进入哪个 Sprint。）

---

每次 Sprint 汇报结束后必须等待 Product Owner 批准。不得自动开始下一个 Sprint、Phase 或开发阶段。

## 执行要求

- 每次新会话开始工作前必须阅读本文件。
- 与 Product Owner 的沟通保持简体中文，除非 Product Owner 明确要求其他语言。
- 正式产品文档使用中文内容，文件名保持英文。
- 数据库、代码、API、变量、文件和目录命名保持英文。
- 不得为了语言统一而翻译已有文档。
- 本规范是永久项目规范，只有 Product Owner 的明确指令可以修改。
