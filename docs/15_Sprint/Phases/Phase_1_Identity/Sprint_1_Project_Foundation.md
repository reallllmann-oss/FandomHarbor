# Phase 1 · Sprint 1 — Project Foundation

状态：Product Owner 已批准  
批准日期：2026-06-28  
Product Phase：Phase 1 — Identity

## Sprint 结果

建立可安装、可运行、可测试、可构建的 Fandom Harbor 工程基础，使三个既定应用边界和共享包能够在不引入身份、权限、数据库 Schema 或业务功能的前提下持续开发。

## 范围内

- Node.js 24 LTS 与 pnpm Workspace
- Turborepo 任务编排
- Next.js App Router、TypeScript strict mode 与 Tailwind CSS
- shadcn/ui 共享组件基础与语义化设计 Token
- `apps/web` Reader Layout
- `apps/admin` Admin Layout
- `apps/docs` 只读文档应用边界
- Shared Layout、Theme Provider、浅色/深色/系统主题
- Next.js `proxy.ts` 请求框架，不包含权限判断
- Error Boundary、Loading 与 Not Found 状态
- Supabase JavaScript SDK 公共配置接入，不包含 Auth、Session 或数据访问
- TanStack Query Provider、React Hook Form、Zod 与 Lucide 基础依赖
- ESLint、Prettier、Husky、lint-staged、Vitest 与 Playwright
- 根级开发、检查、测试与构建 Scripts

## 范围外

- Auth、登录、Session、Role、Permission
- 数据库 Schema、Migration、RLS 与 Seed
- 邀请码、邮件与审计业务
- Works、Chapters、评论、举报、搜索与 Analytics
- 外部 CI、Vercel 项目或 Supabase 项目创建
- 任何真实密钥、生产配置或远程资源

## 已批准工具链

- Node.js 24 LTS，项目约束为 `>=24 <25`
- pnpm 11.7.0
- Next.js App Router、TypeScript、Tailwind CSS、shadcn/ui、Supabase、TanStack Query、React Hook Form、Zod、Lucide
- ESLint、Prettier、Husky、lint-staged、Vitest、Playwright、Vercel
- Turborepo：用于三个应用与九个共享包的任务编排和依赖顺序，不改变模块化单体架构

## 工作流证据

| 阶段                 | 证据                                                      | 状态                    |
| -------------------- | --------------------------------------------------------- | ----------------------- |
| Research             | `TECH_STACK_REFERENCES.md`、Node.js/Next.js 当前支持要求  | Completed               |
| Requirement Analysis | 本 Sprint Brief                                           | Approved                |
| Architecture Design  | `SYSTEM_ARCHITECTURE.md`、既定 apps/packages 边界         | Approved                |
| Database Design      | 不创建 Schema/Migration；仅公共 SDK 配置入口              | N/A — 范围明确排除      |
| API Design           | 不创建 Route/Server Action/Webhook/Event                  | N/A — 范围明确排除      |
| UI Design            | UI Design Bible、Design System、Reader/Admin Layout Rules | Approved for foundation |
| Review               | Sprint 完成前执行代码、范围与安全复核                     | Required                |
| Development          | 本 Sprint 实现                                            | In Progress             |
| Testing              | lint、format、typecheck、Vitest、Playwright、build        | Required                |
| Documentation Update | Status、Changelog、Memory、Sprint Review                  | Required                |

## 验收标准

- [ ] `pnpm install` 在 Node.js 24 环境成功并生成锁文件。
- [ ] 三个 Next.js App Router 应用可以构建并启动。
- [ ] Web、Admin、Docs 使用共享语义 Token、主题 Provider 和各自布局。
- [ ] 浅色、深色和系统主题可切换且无关键内容闪烁。
- [ ] Loading、Error Boundary、Not Found 与跳转主内容入口存在。
- [ ] Supabase SDK 只接受 URL 与 Publishable Key，不包含 Secret/Service Role、Auth 或 Session 实现。
- [ ] `proxy.ts` 只建立请求框架，不执行身份或权限判断。
- [ ] ESLint、Prettier、strict TypeScript、Vitest、Playwright 和全部构建通过。
- [ ] Husky 与 lint-staged 已配置，提交前只检查暂存文件。
- [ ] 未创建数据库 Schema、Migration、RLS、身份、邀请或业务功能。
- [ ] 项目记忆、Sprint 状态和 Review 已同步。

## 风险与处理

- 本机默认 Node.js 16 不兼容 Next.js 16：使用 Product Owner 批准的 Node.js 24 LTS，并通过 `.nvmrc` 与 `engines` 固定主版本。
- Theme Provider 需要 Client Component：仅 Provider 与切换控件进入客户端，其余布局保持 Server Component。
- Supabase SDK 内含 Auth API：本 Sprint 的公共客户端显式关闭 Session 持久化、刷新和 URL 检测，且不调用任何 Auth API。
- 外部 CI/部署平台尚未批准：本 Sprint 仅提供可供后续 CI 调用的本地统一命令。

## 完成边界

Sprint 完成后更新 `PROJECT_STATUS.md`、`CHANGELOG.md`、`MEMORY.md` 并提交中文 Sprint Review。未经 Product Owner 批准，不进入 Sprint 2。
