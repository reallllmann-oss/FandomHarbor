# 环境问题处理规范

状态：由 Product Owner 批准的永久项目规范。

## 环境问题定义

以下情况统一归类为 Environment Issue：

- 网络超时
- Package 下载失败
- 由网络、Registry、运行时、权限或操作系统导致的 `pnpm install` 失败
- npm registry 服务中断
- Git 身份验证失败
- GitHub 服务中断
- Supabase 服务中断
- Vercel 服务中断
- Node.js 环境问题
- Playwright 浏览器安装失败
- Docker 问题
- CI 失败
- Sandbox 权限限制
- 本地操作系统问题

Environment Issue：

- 不是产品问题。
- 不是架构问题。
- 不等于 Sprint 失败。

## Toolchain Configuration 边界

依赖构建脚本的审核与授权属于 Toolchain Configuration，不属于 Environment Issue。

- `pnpm-workspace.yaml` 中的构建脚本允许列表必须使用当前 Canonical pnpm 版本的官方配置机制。
- pnpm 11 统一使用 `allowBuilds`；不得同时保留已由 pnpm 11 移除的 `onlyBuiltDependencies` 等旧机制。
- 每个需要执行构建脚本的依赖必须通过 `allowBuilds` 单独、明确地设置为 `true`。
- 未列入 `allowBuilds` 的依赖默认不得执行构建脚本；禁止使用 `dangerouslyAllowAllBuilds` 扩大授权范围。
- 因构建脚本未审核、授权配置无效或工具链配置冲突导致的安装停止，Sprint 状态应设置为 `Blocked — Toolchain Configuration`。
- Toolchain Configuration 的修正与重试仍需 Product Owner 批准，不得作为 Environment Issue 绕过审批。

## 强制 Sprint 启动门禁

任何 Sprint 的第一个任务都不是写代码。开始开发前必须严格依次完成：

Environment Check

↓

Toolchain Check

↓

Version Check

↓

Dependency Check

↓

开始开发

四项检查必须留下可验证结果。任何一项失败时，禁止进入开发，并按 Environment Issue 流程处理。

- Environment Check：确认操作系统、Sandbox、网络、DNS、SSL、Proxy、远程服务和必要权限。
- Toolchain Check：确认 Node.js、Package Manager、Git、构建、测试和浏览器工具可用且来源正确。
- Version Check：确认运行时、Package Manager、框架、工具和类型版本符合项目约束并相互兼容。
- Dependency Check：确认 manifest、lockfile、registry、已安装状态、依赖冲突和必要原生包无异常。

### 已批准 Sprint 的自动检查权限

- Product Phase 与 Sprint brief 已批准后，Codex 可无需逐命令审批地执行 Environment、Toolchain、Version、Dependency、Type、Lint、Build 和 Test Check。
- Dependency Check 必须使用 lockfile 不变模式；可验证或重建 `node_modules`，但不得修改 manifest、lockfile、依赖版本、Package Manager 或 registry。
- Type/Lint/Build/Test 失败如属于 `WORKFLOW.md` Level 1/2，应直接修复并重跑；这类代码问题不得误报为 Environment Issue。
- 检查如暴露网络、DNS、SSL、Proxy、Sandbox、Registry 服务、运行时或操作系统问题，仍必须执行本文档的 Environment Issue 停止、诊断、报告和重试限制。
- 检查如要求修改 Toolchain Configuration、manifest、lockfile、Runtime Contract、registry、CI/CD 或环境变量，则属于 Level 3，必须在写入前暂停审批。

未经四项检查通过，不得安装、构建、迁移、生成代码或编写业务代码。

## Runtime Contract

本章节定义 Fandom Harbor 的永久运行时契约。任何本地、自动化、测试或部署入口都必须遵守同一标准。

| Contract item                    | Canonical value                        |
| -------------------------------- | -------------------------------------- |
| Canonical Node.js Version        | Node.js 24.x LTS                       |
| Current approved Node.js version | Node.js 24.18.0（当前 NVM 已安装版本） |
| Canonical Package Manager        | pnpm 11.7.0                            |
| Package Registry                 | `https://registry.npmjs.org/`          |
| Runtime Source                   | NVM                                    |

### Project bindings

- `.nvmrc` 必须保持为 Node.js 24，并与 Canonical Node.js Version 一致。
- `package.json` 的 `packageManager` 必须保持为 `pnpm@11.7.0`。
- `package.json` 的 `engines.node` 必须限制为 `>=24 <25`。
- 项目级 npm/pnpm registry 必须保持为官方 `https://registry.npmjs.org/`。
- Node.js 24.x 内的安全与补丁版本变化必须在 Version Check 中记录；不得跨越 Node.js 24 主版本边界。

### Runtime consistency requirements

- 本项目不接受长期使用 Node.js 16。系统中即使保留旧二进制，也不得参与任何 Fandom Harbor 项目命令。
- 不接受为每条命令临时修改 PATH 作为长期运行方案。登录 shell 与自动化入口必须从环境层默认获得 Node.js 24。
- 不接受多个 pnpm 版本参与项目命令。所有项目入口必须解析为 pnpm 11.7.0。
- 本地开发、Codex、CI、Git Hooks、Playwright 和 Vercel 都必须使用 Node.js 24.x 与 pnpm 11.7.0。
- 运行时一致性必须在环境层解决，而不是在工具层解决。
- Husky 与 Git Hooks 只能检查 Node.js/pnpm 版本并在不符合契约时失败；不得安装、切换或替换运行时。
- Playwright 必须继承启动它的项目运行时，不得维护独立 Node.js 版本。
- CI 与 Vercel 必须显式选择 Node.js 24，并在执行任何项目命令前验证 pnpm 11.7.0。
- 任何入口无法满足契约时，必须停止并报告 Environment Issue，不得自动修复或绕过。

### Prohibited environment substitutions

- 不允许因为环境问题更换 Package Manager。
- 不允许因为环境问题降级依赖。
- 不允许切换 registry mirror。
- 不允许通过 Husky、Git Hook 或单条命令临时 PATH 修改绕过运行时契约。
- 不允许在未获得 Product Owner 批准时修改上述 Canonical values。

## 环境问题处理流程

发生 Environment Issue 时必须执行以下步骤：

### Step 1 — 停止当前技术操作

立即停止发生问题的技术操作，不得连续重试或扩大变更范围。

环境问题发生后，必须优先查明原因，而不是优先重试。诊断至少应区分环境、网络、权限、工具链、版本、依赖和项目代码问题。

### Step 2 — 记录问题

记录发生时间、当前操作、可验证原因、已完成状态以及未完成状态。不得把推测写成事实。

### Step 3 — 向 Product Owner 汇报

汇报必须包含：

- 原因
- 当前状态
- 建议解决方案

### Step 4 — 等待 Product Owner 批准

在 Product Owner 明确批准前，不得恢复相关技术操作。

## 同一根因重试规则

同一根因只允许一次受控重试。

1. 首次操作失败后，立即停止并完成根因诊断、记录和 Environment Report。
2. 只有 Product Owner 明确批准后，才允许针对同一根因执行一次重试。
3. 该受控重试再次因同一根因失败时，必须立即停止；不得执行第二次重试。
4. 如果后续证据表明根因已经实质变化，必须把它作为新的 Environment Issue 重新诊断和汇报，不能通过改名规避重试上限。
5. 一次重试按“重新启动一次顶层技术操作”计算。工具在同一进程内部执行的自动网络重连不算新的顶层重试，但必须在报告中记录。

重试不是诊断手段。是否重试只能在根因明确、风险可控、方案未改变 Package Manager、registry、依赖版本或架构后决定。

## 禁止行为

发生 Environment Issue 后：

- 同一根因不得超过一次经 Product Owner 批准的受控重试。
- 同一根因的受控重试失败后不得再次重试。
- 不得静默替换工具。
- 不得更换 Package Manager。
- 不得更换 registry mirror。
- 不得降级依赖。
- 不得修改项目架构。
- 不得采用高风险绕过方案。

## Sprint 状态

Environment Issue 不会自动导致 Sprint 失败。

受影响 Sprint 的状态应设置为：

`Blocked`

原因：

`Environment Issue`

问题解决并获得 Product Owner 批准后，开发可以从已验证的停止点恢复。

## 产品文档保护

Environment Issue 不得修改以下内容，除非 Product Owner 明确要求：

- `PROJECT_STATUS.md`
- Roadmap
- Product Vision
- Architecture
- Sprint Acceptance

环境问题记录不得被包装成产品范围、架构变化或验收失败。

## Tech Lead 责任

发生 Environment Issue 时，Tech Lead 必须：

- 保护项目和已有工作。
- 不尝试高风险绕过方案。
- 稳定性优先于进度。
- 清楚区分已完成、未验证和被阻塞的工作。
- 等待 Product Owner 批准后再恢复操作。

## 强制汇报格式

每次汇报 Environment Issue 时必须使用以下结构：

---

Environment Issue

当前操作（Current Operation）

原因（Reason）

当前状态（Current Status）

建议解决方案（Suggested Solution）

是否建议重试（Whether Retry Is Recommended）

等待 Product Owner 批准（Waiting For Product Owner Approval）

---

## 执行要求

- 每次新会话开始工作前必须阅读本文件。
- 本规范适用于本地开发、远程服务、CI、部署和 Sandbox 环境。
- 每个 Sprint 必须先完成 Environment → Toolchain → Version → Dependency 检查，之后才能开始开发。
- 任何环境问题必须先完成根因诊断，再讨论是否重试。
- 同一根因只允许一次经 Product Owner 批准的受控重试；该重试失败后必须停止。
- 本规范是永久项目规范，只有 Product Owner 的明确指令可以修改。
