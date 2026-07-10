# Sprint 002B — Reader Preferences + Navigation Persistence / Step 02

## Identity

- Product Phase: Phase 2 — Publishing
- Product outcome: 让阅读显示偏好在同一设备持续生效，并提高章节定位与方向感
- Approval status: Product Owner 于 2026-06-30 明确批准
- Dependency: Sprint 002B-Step01 Reader route、ReadingCanvas 与 fixture data flow
- Known blocker: Sprint 002A 数据库实测因 Public ECR 429/TLS timeout 暂挂；本 Step 不重试 Supabase

## Mandatory startup gate

- Environment Check: Passed — Workspace 与 Web 本地开发环境正常
- Toolchain Check: Passed — Node、pnpm、Git、Turbo、Vitest、TypeScript 可用
- Version Check: Passed — Node 24.18.0、pnpm 11.7.0 符合 Runtime Contract
- Dependency Check: Passed — frozen/offline install；manifest、lockfile与 workspace 配置未变化

## Scope

### In

- Light/Dark、字号、行高、阅读宽度偏好
- 不依赖登录的 localStorage 持久化与安全回退
- 上一章/下一章边界状态、章节进度、目录入口与当前章节标识
- Vitest、README、Reader 文档与浏览器回归

### Out

- 数据库写入、云端同步、跨设备同步
- 阅读历史、书签、收藏、评论、通知、推荐
- Author Dashboard、编辑器或发布工作流
- Supabase Runtime 重试、registry 变更或远程生产连接

## Storage contract

- Canonical key: `fandom-harbor.reader-preferences.v1`
- Value: versioned-key JSON，包含 `theme`、`fontSize`、`lineHeight` 与 `measure`
- Scope: 当前浏览器、当前 origin；不含账号 ID、作品 ID、章节 ID 或阅读行为
- Failure: 缺失、损坏、未知字段值或 Storage 拒绝访问时安全回退，不阻断正文阅读
- Theme integration: 通过 `@fandom-harbor/ui` 的主题适配器同步现有 Theme Provider；Theme Provider 保留自身兼容状态

## Acceptance

- [x] 四类阅读偏好可在阅读页调整。
- [x] 偏好写入 localStorage，不要求登录且不写数据库。
- [x] 刷新与章节切换可读取相同偏好。
- [x] 第一章/末章边界、章节进度与目录入口明确。
- [x] 当前章节具有可见标识和 `aria-current="page"`。
- [x] Storage 正常、损坏、未知值与不可用路径具有 Vitest 覆盖。
- [x] Workspace lint/type/test/build 与浏览器持久化回归记录完成。

## Verification

- Workspace lint、typecheck、Vitest 与三套 Next.js production build 通过。
- Web Vitest 共 3 个文件、7 个测试通过；全仓共 33 个测试通过。
- Reader preference 测试覆盖 localStorage round-trip、未知值回退、损坏 JSON 与 Storage 拒绝访问。
- 浏览器确认全站 Light/Dark 在刷新后保持、控制台无错误，未登录直达章节页继续跳转 `/auth/sign-in`。
- 受保护阅读页的已登录视觉检查继续等待批准的本地身份/数据库 Runtime；未绕过现有 Membership 门禁。
- Sprint 002A DB Runtime Pending 状态保持，本 Step 未调用 Supabase、未切换 registry、未连接生产库。

## Rollback

删除 Reader preference helper，恢复 ReadingCanvas 的会话内状态，并恢复 Step01 章节导航标记即可。无 Migration、远程资源或数据库数据需要回滚。
