# Sprint 002H — Bookshelf / Library

Status: **Completed**

## Identity

- Product Phase: Phase 2 — Publishing
- Priority: 已发布内容的回访入口与本地书架聚合
- Product Owner execution mode: Continuous Sprint Mode
- Dependency: Sprint 002G Public Reading completed

## Mission

把 Reader Library 与本地 Reader Shelf 收口成一个更清晰的 V1 浏览入口，帮助用户：

- 回到上次阅读位置
- 打开最近书签
- 在已发布作品与文章之间快速浏览
- 保持 published-only 与非写入边界

## Step01 — Library Hub

已完成：

- `/works` 现在不仅是公开阅读目录，也作为 Reader Library Hub。
- 页面新增本地书架摘要：
  - 继续阅读
  - 最近书签
  - 本地书架统计与 `/archive` 快捷入口
- Local Storage 不可用时安全回退，不阻塞公开阅读目录。

## Step02 — Browse Experience

已完成：

- `/works` 新增本地浏览层：
  - 全部内容 / 仅作品 / 仅文章
  - 按标题或摘要进行客户端筛选
- 结果继续只来自 published 内容集合。
- 无匹配结果时显示明确空状态。

## Step03 — QA & Freeze

已完成：

- 补充 Reader Library 纯逻辑测试。
- 重新执行 lint / typecheck / test / web build。
- 更新 README、Reader 文档、Sprint 文档与 `.ai` 记录。

## Deliverables

- `ReaderLibraryClient` 将 `/works` 与 `/archive` 形成清晰的双入口关系：
  - `/works`：公开阅读目录 + Library Hub
  - `/archive`：本地书签与最近阅读的详细书架
- 本地数据继续只保存在浏览器：
  - `fandom-harbor.reader-bookmarks.v1`
  - `fandom-harbor.reading-history.v1`
- 数据库 published 内容继续通过 hybrid reader gateway 读取；本 Sprint 未引入任何写入能力。

## Verification

- `pnpm lint` 通过。
- `pnpm typecheck` 通过。
- `pnpm test` 通过：
  - `packages/services`: 18 tests passed
  - `packages/database`: 24 tests passed
  - `apps/web`: 57 tests passed
- `pnpm --filter web build` 通过。

## Runtime status

- 本 Sprint 未新增 Migration、RPC、RLS、Schema、依赖、package 或 lockfile 变更。
- 因无数据库侧变更，本 Sprint 未重复执行 Supabase Runtime Validation 或 SQL suite；沿用 Sprint 002F 最近一次真实通过的 Runtime 结论。

## Outcome

Sprint 002H 完成后，Fandom Harbor V1 的最小发布闭环与 Reader 入口已具备：

Create → Edit → Save → Publish → Read → Return

其中 “Return” 由 Reader Library + Local Shelf 提供。

下一阶段如继续推进，应由 Product Owner 明确给出新的 Phase / Beta 目标，而不是默认扩展当前 Sprint 范围。
