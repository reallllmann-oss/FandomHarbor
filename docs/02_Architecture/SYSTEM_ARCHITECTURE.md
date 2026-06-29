# System Architecture

Status: Proposed

## 1. Shape

Fandom Harbor is a modular monolith: two product applications (`web`, `admin`) and one auxiliary documentation application boundary (`docs`) share purpose-specific packages. Web/Admin use one Supabase/PostgreSQL domain model; the Docs viewer treats repository Markdown as its source. This avoids premature services while preserving boundaries that can be extracted only when scale or isolation proves necessary.

```text
Browser
├── apps/web (Visitor + Reader + Author)
├── apps/admin (Admin + Super Admin)
└── apps/docs (future read-only approved documentation)
        │
        ├── Next.js Server Components / Server Actions / Route Handlers
        │       ├── Zod validation and authorization
        │       └── shared packages
        │
        └── Supabase
                ├── Auth
                ├── PostgreSQL + RLS
                ├── Storage (private by default)
                └── scheduled/background capabilities when approved
```

## 2. Application boundaries

- `apps/web`: public introduction, auth, invite redemption, archive discovery, reading, interactions and Author Dashboard.
- `apps/admin`: separate navigation and deployment surface for Admin/Super Admin operations.
- `apps/docs`: future read-only projection of approved repository documentation; no independent editable data model.
- No `apps/shared`: deployable apps remain deployable. Shared UI, validation, database and utilities belong in `packages/*`.
- Admin uses the same underlying authorization truth, never a separate user database.

## 3. Rendering and data access

- Server Components are default for archive and reading pages.
- Client Components are limited to editor, forms, filters requiring local interaction, optimistic actions and rich Admin tables.
- Server Actions serve app-owned typed mutations; Route Handlers serve explicit HTTP contracts, file flows, exports, webhooks and cross-app needs.
- TanStack Query supports client-managed server state only; server-rendered page reads should not be duplicated without a UX reason.
- User-specific and gated output is dynamic/private and must not be shared-cached.

## 4. Package direction

```text
apps/web ─┐
          ├── packages/ui
apps/admin┘   packages/database
             packages/utils
             packages/config

packages/database ─X→ packages/ui
packages/*       ─X→ apps/*
```

When implementation begins, a contracts/domain package may be proposed if schemas cannot live cleanly with their owning boundary. Do not create a generic dumping-ground package.

## 5. Rich content

- TipTap JSON is schema-versioned and validated on write.
- Each publication-changing edit creates an immutable revision snapshot.
- Sanitized rendered HTML and plain search text are derived from the JSON.
- Diff compares normalized structured revisions; restore creates a new revision referencing its source.
- Embedded assets use stable file records, private storage and authorization-aware delivery.

## 6. Authorization

- Membership state gates all archive access.
- Database roles/grants plus RLS enforce row access; server checks enforce workflow and field-level rules.
- Server-side auth uses a validated identity, not cookie presence alone.
- Public pen name IDs never reveal private account IDs.
- Elevated server operations use the narrowest credentials and write immutable audit events.

## 7. Search and analytics

- Begin with PostgreSQL full-text/trigram capabilities and indexed filters.
- Adopt external search only after measured needs exceed PostgreSQL and a data-leak review passes.
- Interaction counters are derived/transaction-safe; analytics aggregates are not sources of truth.
- Raw behavioral events are minimized and retained only under an approved privacy policy.

## 8. Background work

Candidates include search projection refresh, file processing, analytics aggregation, email and export. The exact mechanism is deferred until operational needs are known. Every job must be idempotent, observable, retry-safe and authorized.

## 9. 当前部署拓扑

当前批准的生产基线是“Vercel 计算层 + Supabase 平台层”。

```text
Browser
  │
  ├── Vercel: apps/web
  ├── Vercel: apps/admin
  └── Vercel: apps/docs (when enabled)
          │
          ├── Supabase Auth
          ├── Supabase PostgreSQL + RLS
          └── Supabase private Storage
```

- 每个应用保持独立的部署、域名、环境变量和访问边界；Web 与 Admin 不共享可导致越权的缓存或密钥。
- Production、Staging 和 Preview 使用隔离的配置与数据边界；Preview 不得读取生产私有数据。
- Supabase 的 PostgreSQL 是业务事实源；Vercel cache、Next.js cache、CDN 和进程内缓存都是可丢弃的投影。

## 10. 平台隔离与最小边界

迁移准备通过稳定边界完成，不通过现在实现第二套平台。不需要为每个边界创建新 package，但以下责任必须在现有 package 中可替换：

| 边界 | 归属 | 约束 |
|---|---|---|
| Runtime configuration | `packages/config` | 统一解析/验证 env；业务模块不直接读取平台环境变量 |
| Trusted identity/session | `packages/auth` | Supabase session/claims 转换为项目内部身份与 capability；provider 类型不进入领域合同 |
| Database/transaction | `packages/database` | 客户端构建、查询、transaction 和 RLS context 集中管理；上层不依赖 Supabase response 形状 |
| Object storage | `packages/services` | 只暴露上传、授权读取/签名、删除和 metadata；不持久化 provider URL 作为唯一文件身份 |
| Background jobs/schedule | `packages/services` | 业务提交幂等 job 意图；Vercel 调度、Supabase 能力或未来 worker 只是 adapter |
| Observability | `packages/services` | 结构化日志、metric、trace 和 correlation ID 不绑定 Vercel 仪表盘 |

以上边界必须保持窄、业务语义化且可测试；禁止创建包含全部平台 API 的“万能 provider 接口”。

## 11. 传统云服务器目标形态

```text
Internet
  │
TLS reverse proxy / load balancer
  │
  ├── stateless Node.js process: apps/web
  ├── stateless Node.js process: apps/admin
  └── stateless Node.js process: apps/docs
          │
          ├── external PostgreSQL
          ├── external object storage
          ├── worker / scheduler
          ├── secret management
          └── logs / metrics / traces
```

- 应用进程可重启、可水平扩展，不保存权威状态；本地磁盘只可用于有界且可丢弃的临时文件。
- 核心请求路径使用标准 Node.js 24.x 能力；Edge 优化可作为可选投影，不得成为唯一正确实现。
- 长任务、重试和定时任务不得依赖 HTTP 请求存活；必须幂等、可观测并可由 worker 重放。
- 目标形态只定义能力，不预先选定云厂商、Linux 发行版、容器、编排、队列或可观测产品。

## 12. 分阶段迁移规则

1. 建立当前基线：容量、延迟、错误率、成本、RPO/RTO、导出/恢复时间与平台依赖清单。
2. 先迁移计算层：将 Next.js 应用放到传统服务器，保持 Supabase Auth/PostgreSQL/Storage 不变，验证会话、RLS、签名文件和审计链路。
3. 按需迁移 Storage：使用稳定 file ID 和 adapter 进行双读/校验/切换，不改变业务引用。
4. 按需迁移 PostgreSQL：先审计 extension、RLS、grant、function 与 Supabase-managed schema 依赖，通过导出、校验、增量同步和回退演练后切换。
5. Auth 最后独立评审：身份映射、密码/会话、MFA、邮件、撤销与审计的安全风险高，未获批不与数据库切换绑定执行。

每一阶段必须有独立的 ADR/执行计划、等价性测试、可观测性、流量切换和回滚点；不得以“最终都要迁”为由合并为一次高风险切换。

## 13. Architecture fitness checks

- No gated body is available without valid membership.
- No Author can modify another Author's work.
- No invite can grant elevated role.
- No reader-facing query exposes private account identity.
- Fresh database rebuild and migrations produce identical policy behavior.
- Core reading remains useful without client JavaScript except explicitly interactive features.
- 核心服务端测试不需要 Vercel 运行时即可执行。
- 业务模块的公开类型不含 Vercel/Supabase SDK 类型。
- 临时节点丢失、进程重启或水平扩容不会丢失权威状态。
- 关键 PostgreSQL 数据、RLS/grant 与私有文件可以导出、恢复并通过权限校验。
