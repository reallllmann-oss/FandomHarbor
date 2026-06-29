# Autonomous Engineering Policy / Codex 自治工程权限

状态：由 Product Owner 于 2026-06-29 批准的永久执行规则。

本规则仅在 Product Owner 已批准的 Product Phase、Sprint brief、任务范围与验收标准内生效。它不是自动进入下一 Sprint/Phase 的授权，也不扩大已批准产品范围。

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
