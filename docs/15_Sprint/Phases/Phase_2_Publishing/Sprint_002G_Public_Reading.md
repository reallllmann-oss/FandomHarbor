# Sprint 002G — Public Reading

Status: **Completed**

## Identity

- Product Phase: Phase 2 — Publishing
- Priority: publish 后的公开读取闭环
- Product Owner execution mode: Continuous Sprint Mode
- Dependency: Sprint 002F Minimal Publish Workflow completed

## Mission

确保已发布内容在 Reader 公共读取层可稳定读取，并保持 published-only 边界。

## Planned scope

- Reader 公开页面继续只暴露 `published` 内容。
- 所有已发布 Reader 路由统一走数据库优先、fixture 回退的 published gateway。
- 已发布 Work、Chapter、Article 的读取与空状态路径保持一致。
- 不实现收藏、推荐、评论、搜索、SEO 或高级阅读能力。

## Step01 — Hybrid Public Reader Completion

已完成：

- `/articles/[slug]` 已切换到数据库优先、fixture 回退的 published gateway。
- `/works`、`/works/[slug]`、`/works/[slug]/chapters/[chapterSlug]` 继续保持 published-only 读取。
- 已补充 Article hybrid 读取测试，验证运行时 published Article 优先于 fixture，draft Article 仍不会泄漏到 Reader。

## Step02 — Public Reading QA & Freeze

已完成：

- 已复核公开读取空状态、Not Found 与 published-only 合同。
- 已运行 lint / typecheck / test / web build。
- 已更新 README、Sprint、Reader / Web 与 `.ai` 记录。

## Deliverables

- Reader 所有公开页面现在统一使用 hybrid published gateway：
  - `/works`
  - `/works/[slug]`
  - `/works/[slug]/chapters/[chapterSlug]`
  - `/articles/[slug]`
- 数据库中新的 published Work / Chapter / Article 可优先读取；fixture 继续只作为 published fallback。
- Reader contract 继续保持：draft Work、draft Chapter、draft Article 均不会暴露到公开读取层。

## Verification

- `pnpm lint` 通过。
- `pnpm typecheck` 通过。
- `pnpm test` 通过：
  - `packages/services`: 18 tests passed
  - `packages/database`: 24 tests passed
  - `apps/web`: 52 tests passed
- `pnpm --filter web build` 通过。

## Runtime status

- 本 Sprint 未新增 Migration、RPC、RLS、Schema、依赖或 package 变更。
- 因无数据库侧变更，本 Sprint 未重复执行 Supabase runtime reset 或 SQL suite；沿用 Sprint 002F 最近一次真实通过的 Runtime Validation 结论。

## Outcome

Sprint 002G 完成后，Phase 2 的最小 V1 闭环已具备：

Create → Edit → Save → Publish → Read

下一推荐 Sprint 为 `Sprint 002H — Bookshelf / Library`，用于继续收口 Reader 侧入口与已发布内容的回访体验，但仍需保持 published-only 与非写入优先原则。
