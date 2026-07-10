# Autonomous Engineering Policy / Codex 自治工程权限

状态：由 Product Owner 于 2026-06-29 批准；自 Phase 3 起由 Mission Authorization
v1 / D-038 补充并在冲突处替代。

本规则仅在 Product Owner 已批准的 Product Phase、Sprint brief、任务范围与验收标准内生效。它不是自动进入下一 Sprint/Phase 的授权，也不扩大已批准产品范围。

## Mission Authorization v1（Phase 3 起）

自 Phase 3 起，工程执行的授权单位从 Sprint 内 Step 调整为 Mission。Mission
一旦获得 Product Owner 授权，Codex 必须连续完成 Mission 范围内全部 Sprint、
工程拆分、Runtime、测试、SQL、Migration、Bug 修复、文档同步和回归验证，不得
因内部 Step 或普通工程实现选择中途暂停。

Mission 内允许自主处理：

- 工程拆分、范围内 Refactor 与 Bug Fix。
- Test、Runtime、SQL、Migration 和回归验证。
- Documentation、Project Status、Roadmap、Changelog、Memory、Known Issues
  与 Feature Flag 同步。
- Mission 已批准产品结果所必需的最小实现。

Mission 内禁止：

- 新增产品功能或扩大 Mission Scope。
- 修改产品定位、Roadmap 战略、商业规则或 Governance。
- 新增权限模型、第三方服务或基础设施。
- 修改技术栈，或执行任何与 Mission 无关的开发。

只有出现以下情况才暂停并请求新授权：

1. Mission Scope 不足。
2. 需要新的产品决策。
3. 需要修改数据库方向。
4. 需要修改权限模型。
5. 需要新增第三方依赖。
6. 需要修改 Deployment 架构。
7. 需要修改 Auth 架构。
8. 发现会影响后续 Roadmap 的重大风险。

Mission 已明确包含的 SQL、Migration、Runtime、测试、修复与文档工作，不因旧
Level 3 文件类型规则单独停批；但上述八类边界仍优先。工程方案默认选择风险最低、
改动最小、向后兼容最好、最符合 Fast Launch 且最便于后续迭代的方案。

Mission 完成后统一提交一次工程报告与 Product Handoff，等待一次人工验收。未经
新 Mission 授权不得进入下一 Mission。

## 风险分级方法

- 执行前必须将整个预计修改按 Level 1、Level 2 或 Level 3 分类。
- 一个修改同时命中多个级别时，以最高风险级别为准。
- 文件数统计所有有意修改的源码、测试、配置和文档；构建 cache、`.next`、`.turbo` 和 `*.tsbuildinfo` 等可再生产物不计入。
- 不确定风险级别时按 Level 3 处理；不得为避免审批拆分同一逻辑变更。

## Level 1 — 自动允许

以下修复在已批准 Sprint/Phase 范围内可直接执行，无需中途请求 Product Owner 审批：

- ESLint 修复。
- TypeScript 类型修复。
- React Hooks 官方推荐修复，包括 `useEffect` mounted state 等 lint 合规修复。
- Prettier 格式化、import 排序与未使用变量清理。
- 小型组件内部重构和 UI 行为不变的实现调整。
- Build、Test、Storybook 报错修复与 Playwright 基础修复。

Level 1 同时必须满足：

- 单次预计修改不超过 5 个文件。
- 不改变 API Contract、Runtime Contract、数据库结构、认证/权限模型或已确认产品行为。
- 不新增、删除或变更依赖，不修改 `package.json` 或 `pnpm-lock.yaml`。

Level 1 执行要求：

- 可以直接修改，不得为常规 lint/type/build/test 修复暂停等待批准。
- 修改后必须重新执行失败检查及合理的相关回归检查。
- 最终报告修改文件、原因、命令与验证结果。

## Level 2 — 自主执行、重点报告

以下修改可在已批准 Sprint 目标内自主判断并执行，无需中途审批：

- 修改 6–10 个文件。
- 新增非核心 UI 组件。
- 新增或调整测试文件、Storybook 示例。
- 调整局部 UI 结构但不改变产品需求。
- 重构重复代码。
- 修改文案、空状态与错误状态。
- 增强可访问性或响应式布局。

Level 2 执行要求：

- 不得突破已批准 Sprint 目标、产品需求或验收标准。
- 不得修改 Level 3 高风险文件或逻辑。
- 必须执行相关回归检查，并在最终报告中单独列出“Level 2 自主执行项”。

## Level 3 — 必须暂停审批

以下任一情况必须在修改前停止并请求 Product Owner 审批：

- 修改 `package.json`、`pnpm-lock.yaml`、依赖版本，新增/删除依赖。
- 切换 registry、Package Manager 或修改 Runtime Contract。
- 修改 API Contract、数据库 Schema、认证或权限模型。
- 修改环境变量定义或部署配置。
- 修改 CI/CD、Docker、Vercel、Cloudflare 或其他部署相关配置。
- 大规模目录结构调整、删除已有功能或改变已确认产品决策。
- 涉及安全、隐私、付费、权限或数据删除的逻辑。
- 单次预计修改超过 10 个文件。
- 无法可靠判断风险级别。

Level 3 报告必须说明触发规则、当前证据、建议变更、影响文件和待批准事项。未获批前不得写入部分实现。

## Sprint 门禁自治执行

在 Product Phase 与 Sprint brief 已获 Product Owner 批准后，Codex 可自动执行并记录：

- Environment Check
- Toolchain Check
- Version Check
- Dependency Check（必须使用锁文件不变模式，不得改依赖或 lockfile）
- Type Check
- Lint Check
- Build Check
- Test Check

Type/Lint/Build/Test 失败后，Level 1 或 Level 2 修复可直接实施并重跑检查；一旦触发 Level 3，必须暂停。Dependency Check 如要求更新 manifest/lockfile 则属于 Level 3。网络、DNS、Sandbox、Registry 服务或运行时等 Environment Issue 仍按 `ENVIRONMENT_POLICY.md` 诊断和限制重试，不得伪装成 Level 1/2 代码修复。

## Sprint/Step 事实记录自治权限

从 Sprint 002E 开始，Product Owner 长期授权 Codex 在完成 Sprint 或 Step 后自动同步事实型项目记录，无需逐次申请文档修改权限。

自动允许修改的路径：

- `README.md`
- `docs/15_Sprint/**`
- `docs/13_API/**`
- `docs/12_Database/**`
- `docs/02_Architecture/**`
- `.ai/**`
- 已存在的根目录 `CHANGELOG.md`

自动允许记录：

- Sprint/Step 状态与 Acceptance 结果。
- 已真实执行的验证命令及结果。
- Runtime Pending、Runtime Validated 或 Accepted 状态。
- 修改文件列表、当前边界、Out of Scope 和下一步建议。
- 已知风险和 Level 3 阻塞说明。

约束：

- 只能记录真实发生且有证据支持的事实，不得虚构测试、Build、Runtime 或验收结果。
- 不得覆盖历史决策；历史记录只追加，当前状态只在明确状态区域更新。
- 不得删除重要项目规则、修改技术栈决策或借文档权限改变产品/业务行为。
- 本权限不授权修改业务逻辑、`package.json`、`pnpm-lock.yaml`、依赖、Migration、RLS、SQL、RPC 或生产配置。
- 数据库、认证/权限、发布、支付、上传/存储、数据删除、生产部署、大范围重构和技术栈变更仍必须单独获得 Level 3 授权。
- 最终报告必须列出自动更新的文件、记录内容、是否涉及 Level 3，以及下一步是否需要授权。

当前仓库规范路径为 `docs/03_Database/**` 与 `docs/04_API/**`；本长期授权按 Product Owner 明确列出的路径生效，不自动创建 `docs/12_Database` 或 `docs/13_API`，也不据此重排冻结 taxonomy。

## Continuous Sprint Mode

Product Owner 于 2026-07-01 启用 Continuous Sprint Mode，长期覆盖整个 Fandom Harbor 项目，直到明确撤销。

执行原则：

- 目标是持续推进整个已批准 Sprint，而不是完成一个 Step 后默认停下。
- 每完成一个 Step，先更新 README、Sprint、docs、`.ai`、CHANGELOG、MEMORY、WORKFLOW、DECISIONS 的事实记录。
- 然后判断下一 Step 是否仍在已批准的 Level 1 / Level 2 范围内：
  - 是：直接继续开发，不等待新的普通工程确认。
  - 否：命中 Level 3 边界时立即停止并申请授权。

连续模式不扩大 Level 3 权限。以下仍必须暂停审批：

- Migration、Schema、Constraint、Trigger、Function、RPC、Index、Extension、RLS
- Auth、Permission Model、Capability
- package.json、pnpm-lock.yaml、依赖增删改
- Docker、CI/CD、Deployment、Infra、Storage、Email、Payment、Search、Queue、Cache、Third-party Service
- Breaking Change 或技术栈调整

自 Phase 3 起，本节被 Mission Authorization v1 替代。上述对象如果是已授权
Mission 内实现既定产品结果所需的最小工程工作，可连续执行；如果它们构成数据库
方向、权限模型、Auth 架构、Deployment 架构、依赖、基础设施或产品范围变化，则
仍必须暂停。

## Git execution boundary

- 当 Product Owner 明确要求执行版本归档时，`git add`、`git commit`、`git push` 属于允许的交付动作，但前提是本轮任务范围已完成、敏感信息检查通过且 Product Owner 已明确确认执行提交。
- 未经明确确认，不得把普通开发完成自动升级为 Git 提交或远端推送。
- 执行 Git 写入前，应优先确认：
  - `.env.local` 与应用级 `.env.local` 未被 track
  - 敏感信息扫描未发现真实密钥
  - `git status` 正常
  - `.git` 可写
  - `git ls-remote origin` 可用
- 当前项目已验证 Codex 具备基于 SSH remote 的 Git 写入与 push 通路；如未来再次失败，按 `.ai/TROUBLESHOOTING.md` 的 Git 能力条目先做环境诊断。

## 最终报告格式

每次 Sprint 执行报告必须包含：

- 执行阶段
- 已通过门禁
- 修改文件列表
- Level 1 自动修复项
- Level 2 自主执行项（如有）
- 是否触发 Level 3 审批（如有）
- 验证命令与结果
- 未完成事项
- 下一步建议

Phase 3 起 Mission 完成报告改为统一包含：

1. 修改文件列表
2. 完成内容
3. 测试结果
4. Runtime 结果
5. Migration 结果（如有）
6. 文档同步情况
7. Known Issues
8. Remaining Risks
9. Product Handoff
10. 人工验收清单
