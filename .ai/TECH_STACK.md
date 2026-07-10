# Approved Technology Stack

Status: Approved by product owner on 2026-06-28. Replacements require explicit approval and a recorded decision.

| Area                          | Technology         | Architectural role                                                             |
| ----------------------------- | ------------------ | ------------------------------------------------------------------------------ |
| Web framework                 | Next.js App Router | Web/Admin product applications and future Docs viewer, Server Components first |
| Language                      | TypeScript         | Strictly typed application and shared packages                                 |
| Backend platform (current)    | Supabase           | Auth, PostgreSQL, Storage and platform services                                |
| Database                      | PostgreSQL         | Relational source of truth, constraints, search foundation and RLS             |
| Styling                       | Tailwind CSS       | Token-driven utility styling; no arbitrary visual values in product code       |
| Component foundation          | shadcn/ui          | Source-owned accessible component primitives customized through `packages/ui`  |
| Rich-text editor              | TipTap             | Structured work/chapter editing; canonical content stored as validated JSON    |
| Runtime validation            | Zod                | Validation at server, form, environment and API boundaries                     |
| Forms                         | React Hook Form    | Client form state integrated with Zod schemas                                  |
| Client server-state           | TanStack Query     | Interactive/optimistic or frequently refreshed client data only                |
| Icons                         | Lucide Icons       | Single icon language; decorative icons hidden from assistive technology        |
| Application hosting (current) | Vercel             | Preview, staging and production deployment for Next.js applications            |

## Architecture constraints

- Prefer React Server Components for read-heavy archive pages. Add Client Components only for genuine interaction.
- Do not wrap every server read in TanStack Query. Use it where client caching, invalidation, polling, or optimistic updates provide clear value.
- Use separate Supabase browser and server clients. Server authorization must validate trusted claims and database RLS remains authoritative.
- Never expose Supabase secret/service credentials to browser code.
- All exposed tables use RLS. Privileged operations are narrow server-only paths with audit logs.
- TipTap JSON is the editable source. Rendering must sanitize output; plain text/search documents may be derived.
- shadcn/ui components are owned source, not a reason to fork inconsistent copies across apps.

## Deployment and portability policy

- 当前批准的部署组合是 Vercel + Supabase：Vercel 运行 `apps/web`、`apps/admin` 和未来的 `apps/docs`，Supabase 提供 Auth、PostgreSQL 和 Storage。
- “可迁移”不代表现在并行建设自托管基础设施。在成本、合规、容量、可用性或平台限制形成可验证证据前，只实现当前适配器。
- Next.js 核心服务端功能必须保持标准 Node.js 24.x 可运行，不依赖 Edge-only API、Vercel 专属持久状态或本地持久磁盘。
- 平台类型与 SDK 必须停留在适配器内：身份归 `packages/auth`，数据库与 transaction 归 `packages/database`，Storage、job/scheduler 和可观测性归 `packages/services`，环境解析归 `packages/config`。
- PostgreSQL 是可迁移的数据事实源。SQL migration、RLS、grant、extension 与 policy 必须可从仓库重建，并记录任何 Supabase 专属依赖。
- 传统云服务器目标形态是 TLS 反向代理/负载均衡器后的无状态 Node.js 应用进程，外置 PostgreSQL、对象存储、任务执行器/调度器、密钥管理与可观测性。本决策不预先指定云厂商或容器编排产品。
- 迁移顺序默认为先计算层（Vercel → 传统服务器，Supabase 保持不变），再独立评审 Storage、PostgreSQL 和 Auth；任一阶段都要能独立回滚。

## Version policy

- Exact versions will be pinned only when package installation is authorized.
- Use mutually compatible stable releases available at scaffold time.
- Major upgrades require official migration-guide research, an impact note, tests, and approval through `DECISIONS.md`.
- Lockfiles are committed once the workspace exists. Automated upgrades must never merge without tests.

## Official references checked during foundation design

- Next.js App Router: https://nextjs.org/docs/app
- Supabase SSR with Next.js: https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- TanStack Query advanced SSR: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
- TipTap with Next.js: https://tiptap.dev/docs/editor/getting-started/install/nextjs
- shadcn/ui: https://ui.shadcn.com/docs
