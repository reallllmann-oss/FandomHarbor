# Project Rules

1. 每次开发前必须阅读 .ai/START_HERE.md。
2. 禁止跳过项目记忆文档。
3. 禁止擅自改变产品定位。
4. 禁止添加社交平台功能，除非用户明确要求。
5. 所有新功能必须服务于作品归档、阅读体验、后台管理或权限安全。
6. 所有页面必须考虑移动端。
7. 前台和后台要同步规划，但可以分 Sprint 开发。
8. 普通读者不能访问后台。
9. 作者只能管理自己的作品。
10. 管理员可以管理内容、用户、邀请码、举报。
11. 超级管理员拥有最高权限。
12. 数据库修改必须通过 migration。
13. 权限控制必须由服务端与数据库 RLS 双层强制；前端权限展示只属于用户体验，不是安全边界。
14. 所有重要工程决策必须写入 .ai/DECISIONS.md；永久背景和取舍必须同步建立或更新 ADR。
15. 每次完成任务后必须更新 .ai/PROJECT_STATUS.md 和 .ai/CHANGELOG.md。

## Execution rules

16. 开发前必须明确当前 Product Phase、Phase 内 Sprint、任务范围和验收标准。
17. 未记录的技术栈、依赖、架构和数据模型不得被当作既定事实。
18. 新模块创建前必须检查是否已有可复用模块。
19. 不得在同一提交中夹带与当前任务无关的重构或业务功能。
20. 涉及安全、权限、隐私、审核或数据删除的功能必须先完成威胁与权限分析。
21. 任务完成后还必须更新 .ai/MEMORY.md；产生架构决策时必须更新 .ai/DECISIONS.md。
22. 所有功能必须按 Research → Requirement → Architecture → Database → API → UI → Review → Development → Testing → Documentation Update 顺序推进。
23. 未完成文档和验收标准的功能禁止进入开发。
24. 固定技术栈以 .ai/TECH_STACK.md 为准，未经用户批准不得替换。
25. `apps/web` 承载访客、读者和作者体验；`apps/admin` 承载 Admin 与 Super Admin；`apps/docs` 预留为只读文档浏览入口。
26. 可复用代码只能进入职责明确的 `packages/*`；`apps/` 下不建立含糊的 shared 应用。
27. 所有 Supabase 暴露表必须启用 RLS，并同时测试允许与拒绝路径。
28. 生产密钥、Service Role 密钥和用户私密身份不得进入浏览器、日志或仓库。
29. 数据删除、恢复、举报处理、角色变更和邀请码撤销必须可审计。
30. 不确定项必须记录到 .ai/KNOWN_ISSUES.md，禁止用假设悄悄补齐。
31. Phase 是产品阶段，Sprint 是 Phase 内工程执行单位；二者都不是自动开发授权，开始开发必须有已审批的 Sprint brief 与验收条件。
32. 完成标准以 .ai/ACCEPTANCE_CHECKLIST.md 为准；未通过的任务不得标记 Completed。
33. UI、交互和阅读体验决策记录在 .ai/DESIGN_DECISIONS.md；不得与工程架构决策混写。
34. 功能默认状态以 .ai/FEATURE_FLAGS.md 为准；功能开关不得替代权限校验。
35. 具体尺寸和视觉行为以 .ai/STYLE_GUIDE.md 为准，并与 docs/05_UI、docs/06_Design_System、docs/07_Component 保持一致。
36. docs 使用 00–18 冻结分类；新增文档必须进入职责对应目录并同步更新 docs/README.md。
37. AI 必须遵守 .ai/AI_BEHAVIOR.md，以 Tech Lead 方式保护长期质量，不得只追求生成速度。
38. 每个数据库对象必须归属 ERD、Migration、Policy/RLS、Index、Seed 和 Lifecycle 文档中的适用项；无文档不得实现。
39. 每个接口必须唯一归属 REST、ServerActions、Realtime、Webhooks 或 Events，并引用 Errors/Contracts；禁止混放。
40. Phase 0.6 批准后，禁止无产品负责人批准和 Superseding ADR 的大规模目录/命名重构。
41. 每次新会话必须阅读 `.ai/LANGUAGE_POLICY.md`；与 Product Owner 的沟通及正式产品文档内容使用简体中文，文件名及数据库、代码、API、变量和目录命名使用英文；不得仅为统一语言而翻译已有文档。
42. 每次新会话必须阅读 `.ai/ENVIRONMENT_POLICY.md`；环境问题发生后必须停止当前操作、诊断根因、记录并汇报。同一根因只允许一次经 Product Owner 批准的受控重试，重试再次失败后必须停止；不得替换工具、切换 Package Manager/registry、降级依赖或修改架构。
43. 每次新会话必须阅读 `.ai/WORKFLOW.md`。已批准 Sprint/Phase 范围内的工程变更按 Level 1–3 分级：Level 1/2 直接执行并验证，不得反复暂停审批；Level 3 必须写入前暂停。不确定风险等级时归入 Level 3，但已明确属于 Level 1/2 时不得以“不确定”为由上升审批。
44. 任何 Sprint 的第一个任务必须依次完成 Environment Check → Toolchain Check → Version Check → Dependency Check；全部通过并留下证据后才能开始开发。Sprint 已批准后，以上检查以及 Type/Lint/Build/Test 可自动执行；Dependency Check 不得更改 manifest、lockfile 或依赖版本。任何 Environment Issue 仍必须优先诊断根因，不得优先重试。
45. Runtime Contract 固定为 NVM 提供 Node.js 24.x（当前批准 24.18.0）、pnpm 11.7.0 与官方 npm registry；本地、Codex、CI、Git Hooks、Playwright、Vercel 必须从环境层统一运行时，Husky/Git Hook 只能检查并失败，不能切换 Node。
46. 当前生产部署基线为 Vercel 承载 Next.js 应用，Supabase 承载 Auth、PostgreSQL 和 Storage；在新的迁移 ADR 获批前，不得擅自替换任一生产平台。
47. 业务与领域逻辑不得直接依赖 Vercel 或 Supabase 专属 SDK 类型；平台调用必须收口到 `packages/auth`、`packages/database`、`packages/services` 或 `packages/config` 的明确边界。
48. 核心请求路径必须可在标准 Node.js 服务器运行；不得将 Edge-only API、Vercel 专属生命周期、本地可写文件系统、进程内持久状态或单实例假设作为业务正确性前提。
49. PostgreSQL migration、RLS、grant、Storage policy 与必要的平台配置必须在仓库中可审查、可重建；不得把 Supabase Dashboard 手工状态作为唯一事实源。
50. 文件存储、后台任务/调度、身份映射、数据访问与可观测性必须使用最小接口边界；未达到迁移触发条件时，禁止为未来平台建设第二套生产实现。
51. 传统云服务器迁移必须先保持 Supabase 不变、独立迁移 Next.js 计算层，再按 Storage、PostgreSQL、Auth/其他能力分阶段决策；禁止未验证的一次性整体切换。
52. 部署平台迁移必须具备已批准 ADR、容量与成本证据、数据导出/恢复演练、安全与 RLS 等价性验证、可观测性、DNS/流量切换方案和可执行回滚路径。
53. Monorepo 本地开发包含 `apps/web`、`apps/admin`、`apps/docs` 三个 Next.js App；Turbo `dev` 不保证固定端口分配，任何文档、脚本说明或操作指引都不得假设 `3000/3001/3002` 与应用一一固定绑定。
54. 本地访问地址必须以终端输出的 `Local:` 为准；排查页面打不开、访问错应用或浏览器打开错误地址时，先核对终端实际端口，而不是按历史端口习惯操作。
55. 开发环境变量采用 Root `.env.local`，并同步到 `apps/web/.env.local` 与 `apps/admin/.env.local`；未确认三处加载状态前，不得把 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 之类的 `undefined` 直接归因为 Supabase 服务端配置错误。
56. 出现 Runtime Zod env 校验失败时，优先检查 `.env.local` 文件是否存在、应用级 `.env.local` 是否同步、Next Dev Server 是否已重启、相关 `.next` 缓存是否清理；常见环境与工具链问题必须记录和查阅 `.ai/TROUBLESHOOTING.md`。
57. 自 Phase 3 起采用 Mission Authorization。Mission 获批后连续完成范围内全部
    Sprint、工程拆分、Runtime、测试、SQL、Migration、Bug Fix、文档与回归，
    不再按内部 Step 逐次授权。
58. Mission 内只有 Scope 不足、新产品决策、数据库方向、权限模型、第三方依赖、
    Deployment 架构、Auth 架构或重大 Roadmap 风险必须暂停。
59. Mission 完成后统一提交工程报告、Product Handoff 与人工验收清单；未经人工
    验收和下一 Mission 授权，不得进入下一 Mission。
60. 任何需要 Product Owner 人工验收的 Mission，Final Output 必须主动提供 QA Environment、QA Credentials、自动 QA Validation 与 Manual QA Checklist；不得等待 Product Owner 追问。
61. 项目存在 QA Fixture 时，交付前必须执行 `pnpm qa:credentials`，并验证 Guest 首页、Reader 登录、Author 登录及当前 Mission 适用的注册邀请码；凭据只可来自本地 Git-ignored Fixture，不得写入仓库文档。
62. QA Fixture 不存在、失效、账号或密码错误、邀请码失效、应用无法启动或无法开始人工验收，统一视为 P0 阻塞。必须先诊断并修复 Fixture、按需执行 `pnpm qa:fixture` 或 `pnpm qa:reset`，重新验证成功后才能交付。
63. QA Environment Ready 前，Mission 不得标记 `Completed` 或 `Awaiting Product Owner Acceptance`。完整交付规则以 `docs/13_Test/MANUAL_QA_HANDOFF.md` 为准。

## Autonomous Engineering Policy / Codex 自治工程权限

### Level 1 — 自动允许

- 包括 ESLint、TypeScript、React Hooks 官方推荐修复、mounted state lint 修复、Prettier、import 排序、未使用变量清理、小型组件内部重构、UI 行为不变的调整，以及 Build/Test/Storybook/Playwright 基础修复。
- 单次不超过 5 个文件，且不改 API Contract、Runtime Contract、Schema、认证/权限、依赖或产品行为。
- 可直接修改，修改后重跑对应检查，最终报告文件、原因与验证结果。

### Level 2 — 自主执行、重点报告

- 包括 6–10 个文件、非核心 UI 组件、测试/Storybook 示例、不改产品需求的局部 UI 结构、重复代码重构、文案/空状态/错误状态、可访问性与响应式增强。
- 不需要中途审批，但不得突破 Sprint 目标、修改 Level 3 高风险文件或逻辑，并必须在最终报告单独列出。

### Level 3 — 必须暂停审批

- 包括 `package.json`、`pnpm-lock.yaml`、依赖增删/版本、registry、Runtime Contract、API Contract、Schema、认证/权限、部署配置、CI/CD、环境变量、Docker/Vercel/Cloudflare、大规模目录调整、删除功能、产品决策变更、安全/隐私/付费/权限/数据删除逻辑，以及预计超过 10 个文件或无法分级的变更。
- 必须先报告触发原因、建议变更和影响范围，批准前不得写入。

Type/Lint/Build/Test 失败且修复属于 Level 1/2 时，Codex 必须直接修复、重跑检查并在最终报告中说明；不得为此暂停请求 Product Owner 批准。完整执行细则与报告格式以 `.ai/WORKFLOW.md` 为准。

自 Phase 3 起，Level 1–3 用于风险记录，不再把已授权 Mission 内的 SQL、
Migration、Runtime 或范围内工程实现拆成逐次授权。是否暂停以规则 58 的 Mission
边界为准。

## Documentation maintenance

- `MEMORY.md` 只保留长期有效事实和最近一次里程碑摘要，不复制完整日志。
- `PROJECT_STATUS.md` 只记录当前状态、阻塞与下一步。
- `CHANGELOG.md` 按日期追加已经发生的变更。
- `DECISIONS.md` 保存已接受、已废弃或被替代的决策，不记录未决猜测。
- `KNOWN_ISSUES.md` 保存未决问题、风险和阻塞项；解决后链接到对应 Decision 或文档。
- `TROUBLESHOOTING.md` 保存已确认的环境、工具链、端口分配和常见开发排障方案，避免重复调查同一问题。
