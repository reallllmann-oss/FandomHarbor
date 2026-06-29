# Project Memory

项目名称：
Fandom Harbor

项目目录名：
FandomHarbor

项目类型：
升级版 AO3 私域作品归档站

核心角色：

1. Super Admin 超级管理员
2. Admin 管理员
3. Author 作者
4. Reader 读者

访问规则：
半公开。
未认证用户可以看到介绍页，但不能查看正文。
通过邀请码后可以进入站内。
第一版统一为：通过门禁后可看站内内容。
作者权限只能由管理员手动开通。

内容类型：

- 长篇小说
- 短篇小说
- 随笔
- 图片
- 外部链接
- PDF
- EPUB

以上是产品规划能力，不代表全部进入 MVP。首发格式范围由 KI-003 确认；建议先完成安全、可靠的文本作品闭环。

作者系统：
作者可以有多个笔名 / 马甲。
真实账号在后台可见。
读者只看到作者选择展示的笔名。

AO3 核心功能：

- 自由标签 + 管理员规范化
- CP / 关系标签
- 作品分级
- 可选预警
- 搜索筛选
- 评论
- 回复评论
- 匿名评论
- Kudos
- 收藏
- 推荐

不做：

- 私信
- 关注作者
- 粉丝系统
- 社交动态
- 转发
- 公开社交排行榜

邀请码：
作者可以生成邀请码。
邀请码可以限制有效期和可用次数；当前 Phase 1C 不允许邀请码携带或授予角色权限。
管理员可以撤销邀请码。
邀请码必须形成邀请链。
邀请码只能控制进入门禁的范围，不能自动授予 Author、Admin 或 Super Admin。

举报系统：
超级管理员和管理员收到举报。
作者也知道有人举报。
举报必须填写理由。
举报可以上传截图。
后台需要有处理流程：
待处理 / 处理中 / 已驳回 / 已处理。

版本管理：
作品修改保留历史版本。
可以查看 Diff。
管理员可以恢复旧版本。

数据面板：
管理员后台需要展示：

- 阅读人数
- 阅读次数
- 收藏数
- Kudos
- 评论数
- 推荐数
- 阅读来源
- 热门标签
- 热门 CP
- 活跃作者
- 新增作品

最重要的产品优化目标：

1. UI 比 AO3 更现代
2. 移动端体验比 AO3 更好
3. 阅读体验比 AO3 更好

固定技术栈：

- Next.js App Router + TypeScript
- Supabase + PostgreSQL
- Tailwind CSS + shadcn/ui
- TipTap
- Zod + React Hook Form
- TanStack Query
- Lucide Icons
- Vercel

应用边界：

- apps/web：访客、读者、作者
- apps/admin：管理员、超级管理员
- apps/docs：未来只读项目文档在线浏览入口；根目录 docs 与 .ai 仍是唯一事实源
- 共享实现进入职责明确的 packages，不使用 apps/shared

共享包边界：

- ui、editor、auth、database、services、types、constants、config、utils

文档结构：

- 与产品负责人的沟通默认使用简体中文；正式产品文档使用中文内容，文件名保持英文
- 数据库、代码、API、变量和目录命名使用英文；不为统一语言而翻译已有文档
- `.ai/LANGUAGE_POLICY.md` 是每次新会话的强制启动上下文
- `.ai/ENVIRONMENT_POLICY.md` 是每次新会话的强制启动上下文；环境问题不等于产品、架构或 Sprint 失败
- 环境问题发生后停止操作、记录并汇报；同一根因仅允许一次经 Product Owner 批准的受控重试，重试失败后必须停止
- `.ai/WORKFLOW.md` 是每次新会话的强制启动上下文，定义 Tech Lead 自主决策与必须升级审批的边界
- 每个 Sprint 必须先完成 Environment Check → Toolchain Check → Version Check → Dependency Check，全部通过后才能开发
- 环境问题必须优先查明根因，不得把重试当作第一处理动作
- Runtime Contract：Node.js 24.x LTS、当前批准版本 24.18.0、NVM、pnpm 11.7.0、官方 npm registry
- 本地、Codex、CI、Git Hooks、Playwright、Vercel 必须从环境层遵守同一运行时；工具只能检查，不能切换 Node
- docs 使用 00_Project 到 18_Research 的冻结数字分类
- 05_UI 描述体验，06_Design_System 定义复用规则，07_Component 定义实现契约
- 03_Database 使用 ERD/Migration/Policies/RLS/Seed/Indexes/Lifecycle 注册
- 04_API 使用 REST/ServerActions/Realtime/Webhooks/Events/Errors/Contracts 分类
- 17_Architecture_Decisions 保存永久 ADR，.ai/DECISIONS 保存精简记忆
- Phase 是产品阶段，Sprint 是 Phase 内工程执行单位
- 当前 Product Phase Roadmap 为 Phase 0、0.5、0.6、1–8

架构方向：

- 模块化单体，不提前拆微服务
- React Server Components 优先
- 服务端权限校验 + PostgreSQL RLS 双层强制
- TipTap JSON 为文本内容源，版本不可变，HTML/纯文本为派生数据
- RuntimeConfig、Auth provider、Database/Repository 与 ObjectStorage 是平台隔离边界；页面不得直接读取 `process.env` 或调用 Supabase client
- 当前身份方案为 Supabase email/password + 必须验证邮箱；active Membership 派生 Reader capability
- Author/Admin/Super Admin 只允许手工授权与撤销；邀请兑换不得提权，所有安全关键变更必须审计

开发状态：

- Phase 0 Project OS 已完成
- Phase 0.5 Freeze Product Blueprint 已完成
- Phase 0.6 Product Freeze Review 已批准并冻结
- Phase 1 Sprint 1 Project Foundation 已完成
- Phase 1C Identity Access Core 工程实现完成：平台边界、Auth、Invitation、Membership、Role Grant、Audit、RLS、Web/Admin 壳层与测试已写入
- Frozen install、Type、Lint、Test、Build 已通过；当前环境没有 Supabase CLI/psql/Docker，migration rebuild 与 SQL allow/deny 脚本仍待在一次性数据库执行
- 未创建 Supabase/Resend/Vercel 云资源，未配置生产 SMTP，未建立生产 Super Admin
- SQL 验证与 Product Owner Phase 1 验收完成前禁止进入 Phase 2

## Last updated

- 2026-06-29: Completed Phase 1C engineering implementation and all locally available gates; database rebuild/SQL role-matrix execution and Product Owner phase acceptance remain.
- 2026-06-29: Established verified email/password identity, invitation-only membership admission, derived Reader capability, manual elevated role grants and audited RLS workflows under D-033/ADR-018.
- 2026-06-29: Added RuntimeConfig, Trusted Identity/Session, repository/provider isolation and the provider-neutral ObjectStorage contract; pages do not consume raw environment or Supabase clients.
- 2026-06-29: Replaced the one-operation-only rule with a root-cause retry limit: one Product Owner-approved controlled retry per root cause, then mandatory stop on repeated failure.
- 2026-06-29: Established the permanent Runtime Contract: NVM-provided Node.js 24.x, current approved Node.js 24.18.0, pnpm 11.7.0 and the official npm registry across every project entry point.
- 2026-06-29: Added the mandatory Sprint startup gate and root-cause-first environment rule; development begins only after environment, toolchain, version and dependency checks pass.
- 2026-06-28: Added the permanent escalation workflow and made it mandatory startup context; product, UX, schema, auth, permission, dependency, technology, module-removal, roadmap and architecture changes require Product Owner approval.
- 2026-06-28: Added the permanent environment-issue policy and made it mandatory startup context; environment failures block operations without changing product status or architecture.
- 2026-06-28: Revised the permanent language policy: Product Owner communication and formal product-document content use Simplified Chinese; technical and filesystem naming remain in English; no translation-only migration is required.
- 2026-06-28: Added the initial language policy and made it mandatory startup context.
- 2026-06-28: Phase 0.6 completed final documentation architecture, registries, ADRs, Phase packages and AI behavior contract. No application code or packages introduced.
