# Deployment Plan

Status: Architecture baseline accepted by D-031 / ADR-017; external deployment execution still requires an approved Sprint and Product Owner authorization.

## 部署原则

- 当前优先使用 Vercel + Supabase，不在没有证据时建设第二套生产基础设施。
- 数据与权限可迁移性优先于平台便利；手工 Dashboard 配置不得是唯一事实源。
- 应用计算无状态，关键逻辑可在标准 Node.js 24.x 服务器运行。
- 迁移是分阶段发布，不是 Vercel、Database、Storage 和 Auth 的一次性替换。

## Environments

| Environment | Purpose                           | Data                                                                                                    |
| ----------- | --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Local       | Development and migration rebuild | Synthetic seed data only                                                                                |
| Test/CI     | Automated checks                  | Ephemeral synthetic data                                                                                |
| Preview     | Per-change Vercel review          | Dedicated non-production Supabase boundary or safe mocked/synthetic data; never production private data |
| Staging     | Release rehearsal                 | Production-like configuration, no copied private production data                                        |
| Production  | Live archive                      | Protected user data                                                                                     |

`apps/web`、`apps/admin` 和启用后的 `apps/docs` 必须作为可独立发布单元配置。默认每个应用使用独立 Vercel Project；即使后续决定共享某些部署资源，Web 与 Admin 也必须保持独立域名、环境变量、部署权限和缓存边界。

Production 使用独占的 Supabase 项目与凭据。Staging 必须与 Production 隔离。Preview 可使用隔离的非生产项目、branch 或 mock，但只能包含合成数据，且必须明确阻断生产凭据。

## Admin Git 部署治理

- 正式 Admin Vercel Project `fandom-harbor-admin` 保持 `paused=true`，并设置
  `previewDeploymentsDisabled=true`；它不承担 GitHub PR 或 feature branch 的自动
  Preview deployment。现有 Git link、`apps/admin` Root Directory、Production
  环境和既有 Production deployment/alias 不因此改变。
- 专用 Project `fandom-harbor-admin-p1-preview` 连接
  `reallllmann-oss/FandomHarbor`，Root Directory 为 `apps/admin`，只承载 Admin
  PR / QA Preview。它只使用 Preview target 的 QA2 环境变量，连接
  `hicfnlwzmnbxhimyeviy`，启用 Vercel Authentication 且 automation bypass 为
  `0`。
- 两个 Admin Project 的 Production Branch 均为现有哨兵分支
  `admin-production-disabled`。专用 Preview Project 不把 `main` 视为 Production
  branch，并保持零 Production deployment，防止 merge 后意外产生正式用户入口。
- Admin Production release 必须在 Product Owner 单独授权后，从冻结且不可变的
  release SHA 显式执行。PR check、Preview READY 或 merge 本身均不授权 Production
  deployment、正式 Admin resume、Web Admin 入口开放或任何数据库操作。

## 当前 Vercel + Supabase 责任分配

| 能力            | 当前实现                                      | 不可越过的边界                                                             |
| --------------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| Next.js compute | Vercel Node.js runtime                        | 业务正确性不依赖 Edge-only API、单实例或进程存活                           |
| Auth            | Supabase Auth                                 | 只通过 `packages/auth` 产生受信内部身份；不把 provider claims 当作业务角色 |
| Relational data | Supabase PostgreSQL                           | migration、RLS、grant、function 与 extension 依赖可审查、可重建            |
| Files           | Supabase private Storage                      | 通过 file ID 和 `packages/services` 边界访问；授权读取不依赖永久公开 URL   |
| Jobs/schedules  | 待需求批准后选定 adapter                      | job 必须幂等、可重试、可观测；不在请求中隐式运行长任务                     |
| Secrets         | Vercel/Supabase environment secret management | 通过 `packages/config` 验证；不进入日志、客户端或仓库                      |
| Observability   | 部署阶段批准的 provider                       | 保留结构化日志、metric、trace 和 correlation 语义                          |

## Pipeline

1. Validate formatting, lint, strict types and builds.
2. Run unit/integration tests and a clean migration rebuild.
3. Run RLS permission matrix tests and critical end-to-end journeys.
4. Run dependency, secret and generated-artifact checks.
5. Create Preview deployment for review.
6. Apply backward-compatible migrations to staging, deploy applications and run smoke tests.
7. Approve production release; migrate before/with compatible app version.
8. Verify health, auth, gated access, reading and Admin audit events.

CI 与部署必须在任何项目命令前验证 Node.js 24.x 和 pnpm 11.7.0。数据库变更只能由仓库 migration 执行；生产 Dashboard 中的紧急手工操作必须立即记录，并回补为可重放的仓库变更。

## Migration strategy

- Prefer expand → backfill → switch reads/writes → contract.
- Application versions remain compatible during rollout.
- Destructive changes require backup verification and a written recovery path.
- Rollback may mean forward-fixing schema while rolling back application code; the release plan must state which.

## Secrets

- Store environment secrets in platform secret management.
- Browser receives only explicitly public/publishable values.
- Rotate leaked credentials immediately and audit access.
- Maintain an `.env.example` only after configuration is known; it contains names, never values.

## 迁移触发条件与准入门禁

仅当至少一项触发条件有可验证证据时，才启动传统云服务器迁移评审：

- Vercel/Supabase 成本在已审核流量与容量下持续高于备选方案的总拥有成本。
- 数据驻留、隐私、合规、审计或合同要求不能在当前平台满足。
- 已测量的容量、延迟、运行时、区域、备份或恢复能力达到平台限制。
- 可用性目标、RPO/RTO 或事故复盘要求更强的运行控制权。

执行前门禁：

- KI-009 中的规模、预算、SLO、RPO 和 RTO 已批准。
- 建立新的迁移执行 ADR，而不是仅引用 ADR-017 的原则性退出路径。
- 完成平台依赖清单、容量/成本模型、威胁模型和数据分类复核。
- 完成数据导出/恢复演练、RLS/grant 等价性测试、性能压测、流量切换与回滚演练。

## 分阶段传统云服务器迁移

### Stage 1 — 计算层

- 在 TLS 反向代理/负载均衡器后运行无状态 Node.js 24.x 应用进程。
- 保持 Supabase Auth、PostgreSQL 和 Storage 不变，先验证计算层可迁移性。
- 增加 health/readiness、优雅停机、无状态水平扩容、日志/metric/trace 与密钥注入。
- 通过加权 canary 或受控流量验证，再执行 DNS/入口切换；Vercel 保留为回滚点至观察窗口结束。

### Stage 2 — Storage（仅按需）

- 选定具有私有 bucket、短时授权读取、checksum、metadata、lifecycle 和备份能力的对象存储。
- 使用稳定 file ID，不将 provider URL 作为业务主键。
- 通过双写/校验或离线复制完成迁移；切换前校验数量、checksum、授权和删除/lifecycle 策略。

### Stage 3 — PostgreSQL（仅按需）

- 目标必须是受支持的 PostgreSQL，并通过 extension、function、trigger、RLS、grant、index 与排序规则兼容清单。
- Supabase-managed `auth`/`storage` schema 与业务 schema 分开审计；不把数据库迁移自动等同于 Auth/Storage 迁移。
- 先完成全量恢复与权限测试，再设计增量同步、短暂写入冻结或其他一致性方案。
- 切换必须校验 row count、checksum/业务不变式、RLS 允许与拒绝矩阵、审计日志及关键用户旅程。

### Stage 4 — Auth 与其他平台能力（独立决策）

Auth 迁移不是必然终点。只有在独立产品、安全、合规和用户恢复计划获批后，才能迁移 provider identity、credential、session、MFA、email flow 与 revoke semantics。禁止为配合数据库切换而附带替换 Auth。

## Backups and recovery

- Supabase/PostgreSQL backup capability, point-in-time recovery tier and Storage recovery must match approved RPO/RTO (KI-009).
- Restore drills must prove data and authorization integrity, not merely backup existence.
- Export critical metadata separately where platform recovery does not cover it.
- 每次重大平台变更前都要使用实际导出物在隔离环境完成恢复演练，并记录时间、完整性、权限与失败处理。

## Rollback and incident gates

- Each release identifies owner, change window, health signals and rollback command/process.
- Stop rollout on auth failure, permission leakage, migration error, elevated error rate or reading regression.
- Security incidents prioritize access containment and credential rotation before feature availability.
- 迁移期间禁止未定义的双写。如必须双写，必须定义权威端、幂等键、顺序、失败补偿、对账和退出条件。
- 迁移回滚不得回滚已确认的用户写入；每个阶段必须在发布前明确前向修复与流量回切边界。

## Launch checklist dependency

No production launch before domain/legal policies, content rules, email delivery, retention, monitoring, backups, RPO/RTO and on-call ownership are approved.
