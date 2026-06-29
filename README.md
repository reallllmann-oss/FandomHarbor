# Fandom Harbor

Fandom Harbor is a modern, invitation-only archive for original and fan works, designed around durable publishing, governable metadata, private identity boundaries and an excellent mobile-first reading experience. It is not social media, a forum, blog or generic novel website.

## Current status

**Phase 1 · Sprint 2 / Phase 1C — Identity Access Core** is `Engineering Complete — Awaiting Database Execution and Product Acceptance`. Runtime/auth/repository/storage boundaries, invitation admission, membership/elevated roles, RLS/audit migrations and Web/Admin access shells are implemented. Type, lint, unit/contract tests and production build pass; the SQL migrations still require execution against an approved disposable database before Phase exit. No Supabase project or production deployment was created.

## Mandatory start

Before any code, read [`.ai/START_HERE.md`](.ai/START_HERE.md) and all seventeen mandatory memory documents in order, including [`.ai/LANGUAGE_POLICY.md`](.ai/LANGUAGE_POLICY.md), [`.ai/ENVIRONMENT_POLICY.md`](.ai/ENVIRONMENT_POLICY.md) and [`.ai/WORKFLOW.md`](.ai/WORKFLOW.md). Development may resume only from the task and approval boundary recorded in [`.ai/PROJECT_STATUS.md`](.ai/PROJECT_STATUS.md), after the mandatory startup checks and [`.ai/ACCEPTANCE_CHECKLIST.md`](.ai/ACCEPTANCE_CHECKLIST.md) gates pass.

## Project map

```text
FandomHarbor/
├── .ai/             permanent memory, rules, decisions and development gates
├── docs/            numbered permanent product/engineering documentation
├── apps/
│   ├── web/         Visitor + Reader + Author experience
│   ├── admin/       Admin + Super Admin experience
│   └── docs/        reserved read-only online documentation entry
├── packages/
│   ├── ui/          design system
│   ├── editor/      TipTap content model/rendering
│   ├── auth/        shared auth boundary
│   ├── database/    typed database boundary
│   ├── services/    approved service orchestration/adapters
│   ├── types/       stable cross-application types
│   ├── constants/   reviewed non-secret constants
│   ├── config/      shared tool configuration
│   └── utils/       framework-independent utilities
├── supabase/        migrations, policies, functions and database tests
└── scripts/         future project automation
```

## Approved stack

Next.js App Router, TypeScript, Supabase/PostgreSQL, Tailwind CSS, shadcn/ui, TipTap, Zod, React Hook Form, TanStack Query, Lucide Icons and Vercel. The repository Runtime Contract is Node.js 24.x and pnpm 11.7.0; package compatibility remains lockfile-controlled.

## Local development notes

This monorepo runs three Next.js apps: `apps/web`, `apps/admin` and `apps/docs`.

- Do not assume fixed dev ports such as `3000 == docs`, `3001 == admin`, `3002 == web`.
- Turborepo starts applications concurrently; whichever app boots first may take `3000`.
- Always use the `Local:` address printed in the terminal for each app as the source of truth.

Development env loading uses root `.env.local`, synchronized to:

- `apps/web/.env.local`
- `apps/admin/.env.local`

If a runtime Zod error reports `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or similar values as `undefined`, check these env files first, then restart the Next dev server and clear `.next` before suspecting Supabase configuration. Common local environment and workspace issues are documented in [`.ai/TROUBLESHOOTING.md`](.ai/TROUBLESHOOTING.md).

## Deployment baseline and migration boundary

当前批准方案是 Vercel + Supabase：Vercel 承载 Next.js 应用，Supabase 提供 Auth、PostgreSQL 和私有 Storage。仓库必须保持标准 Node.js 可运行、应用计算无状态、数据库策略可从 migration 重建，并将平台 SDK 隔离在 `packages/auth`、`packages/database`、`packages/services` 和 `packages/config` 内。

未来如因成本、合规、容量或可用性迁往传统云服务器，默认先迁移 Next.js 计算层并保持 Supabase 不变，再分阶段评审 Storage、PostgreSQL 与 Auth。现阶段不预建第二套生产基础设施。详见 [System Architecture](docs/02_Architecture/SYSTEM_ARCHITECTURE.md)、[Deployment Plan](docs/14_Deploy/DEPLOYMENT_PLAN.md) 和 [ADR-017](docs/17_Architecture_Decisions/ADR-017.md)。

## Documentation

Start with [`docs/README.md`](docs/README.md), then read [Vision](docs/00_Project/VISION.md), [Principles](docs/00_Project/PRINCIPLES.md), [Non-Goals](docs/00_Project/NON_GOALS.md), [Glossary](docs/00_Project/GLOSSARY.md) and the [Product Phase Roadmap](docs/15_Sprint/ROADMAP.md).
