# Project Status

## Admin P0 ADMIN-02 Review, Save and Conflict（2026-07-31）

| 项目                         | 状态              |
| ---------------------------- | ----------------- |
| Mission                      | Admin P0 ADMIN-02 |
| Admin Site Copy Read         | LOCAL CONNECTED   |
| Admin Review / Save          | LOCAL IMPLEMENTED |
| Atomic Revision / Audit      | VERIFIED          |
| Same-base Conflict           | VERIFIED          |
| Exact Eight Fields           | EDITABLE          |
| Locked Product Boundaries    | PRESERVED         |
| Existing `/access`           | PRESERVED         |
| Web Site Copy Consumer       | NOT CONNECTED     |
| Migration / RPC / Auth       | UNCHANGED         |
| Remote Supabase / Deployment | NOT RUN           |
| Push / PR                    | NOT RUN           |
| Admin Production             | PAUSED            |

- Admin 根页面继续使用严格 Admin Read，并新增 Exact Eight Fields 的编辑、规范化变更复核、reason、Saving、Saved、Unchanged、Conflict 与安全 Error 状态。
- Server Action 重新取得可信 Access Context，并复用共享 `requireSiteCopyAdmin` 后调用已验收 Domain Save Service/Repository；不信任客户端 Role、Membership 或 capability。
- 每次新 Review 生成非 nil request UUID；同一 reviewed payload 的安全重试复用该 ID，返回编辑后重新 Review 生成新 ID。连点由同步 submission lock 与 pending disabled 双重阻止。
- Saved 使用数据库真实 Version、Revision、Audit、changed fields 与 time，并在继续编辑时更新本地基线；Unchanged 不显示或伪造 Audit。
- Conflict 保留八字段和 reason，不自动覆盖或重试；旧 base 被阻止再次提交，重新读取会丢弃输入时必须经过明确确认。
- DB-01、DATA-01、双连接并发及 Identity/Access SQL 回归通过；结束后本地数据库恢复唯一 Version 1 基线，无测试 Profile、Role 或额外 Site Copy Audit。
- apps/web、Migration、RPC、RLS、Grant、Auth、Role、Membership、capability、packages/ui/config 均未修改。

## Admin P0 ADMIN-01 Read-only Admin Surface（2026-07-30）

| 项目                         | 状态                |
| ---------------------------- | ------------------- |
| Mission                      | Admin P0 ADMIN-01   |
| Admin Site Copy Read         | LOCAL IMPLEMENTED   |
| Exact Eight Fields / Version | READ-ONLY CONNECTED |
| Edit / Save / Publish        | NOT IMPLEMENTED     |
| Existing `/access`           | PRESERVED           |
| Web Site Copy Consumer       | NOT CONNECTED       |
| Migration / RPC / Auth       | UNCHANGED           |
| Remote Supabase / Deployment | NOT RUN             |
| Push / PR                    | NOT RUN             |
| Admin Production             | PAUSED              |

- Admin 根页面通过已验收的 `createAdminSiteCopyService` 与 `createSupabaseAdminSiteCopyRepository` 读取当前严格 Snapshot，展示数据库 Version 和恰好八项 Site Copy。
- anon、Reader、Author、suspended/revoked 身份在 Repository 调用前拒绝；仅 active Admin / Super Admin 可读取，Domain 与数据库仍执行既有双层检查。
- 页面明确标记只读与锁定边界，不包含 Site Copy 输入框、编辑、保存或发布操作；CTA 目标、导航合同、Studio capability 和 Footer 法务链接均未进入存储或 UI 控件。
- `/access`、最后一个 Super Admin 保护、Web、Migration、RPC、Auth、Role、Membership、capability 与共享 UI 均未修改。

## Admin P0 DOMAIN-01 Service and Repository Contracts（2026-07-30）

| 项目                         | 状态               |
| ---------------------------- | ------------------ |
| Mission                      | Admin P0 DOMAIN-01 |
| Domain / Service Contract    | LOCAL IMPLEMENTED  |
| Public / Admin Repository    | LOCAL IMPLEMENTED  |
| Admin UI                     | NOT CONNECTED      |
| Web Site Copy Consumer       | NOT CONNECTED      |
| DB-01 / DB-01A / DATA-01     | PRESERVED          |
| Remote Supabase / Deployment | NOT RUN            |
| Push / PR                    | NOT RUN            |
| Admin Production             | PAUSED             |

- `packages/services` 提供严格八字段、Version 1 Baseline、NFC/trim/code-point 验证、4–200 reason、Diff、Public Fallback、Admin capability 与 Saved/Unchanged/Conflict 合同。
- `packages/database` 提供三个既有 RPC 的窄 Zod Schema、Public/Admin Repository、UUID/时间严格解析、安全 number/规范十进制 string 到 bigint 的无损边界，以及稳定错误映射。
- Public 单字段损坏仅回退该字段；无记录、RPC 整体失败或 bigint transport 数据损坏时全量回退且 `version=null`。Admin 数据损坏严格失败，不使用 Baseline 掩盖。
- 当前合同已可由后续 App 调用，但本 Mission 未修改或接入 Admin/Web，也未修改 Migration、RPC、Auth、capability 或部署状态。

## Admin P0 DATA-01 Site Copy Baseline Initialization（2026-07-30）

| 项目                         | 状态                                                 |
| ---------------------------- | ---------------------------------------------------- |
| Mission                      | Admin P0 DATA-01 — Site Copy Baseline Initialization |
| Version 1 / Current Pointer  | LOCAL IMPLEMENTED                                    |
| Initialization Audit         | `site_copy.initialized` / actor `null`               |
| 基线字段                     | 当前 Web 实际渲染的严格八字段                        |
| DB-01 / DB-01A Commits       | PRESERVED                                            |
| Admin / Web 产品代码         | UNCHANGED                                            |
| Remote Supabase / Deployment | NOT RUN                                              |
| Push / PR                    | NOT RUN                                              |

- 独立 DATA Migration 在单一事务中创建一条 actor-null 初始化 Audit、一条完整不可变 Version 1 Revision 和一个 global Current Pointer；不调用普通 Admin `save_site_copy`。
- 初始化前取得与保存流程相同的 global advisory transaction lock；发现任意 site-copy State、Revision 或初始化/更新 Audit 时稳定拒绝，不覆盖、不补齐、不产生部分写入。
- Version 1 使用保留的 nil UUID 系统 request marker，不占用普通 Admin v4 request ID 命名空间。
- Public Projection 只返回八字段与非敏感 version；既有 active Admin/Super Admin allow 及 Reader、Author、suspended/revoked deny 权限合同保持不变。

## Admin P0 DB-01A Change Reason Contract Alignment（2026-07-30）

| 项目               | 状态                                                   |
| ------------------ | ------------------------------------------------------ |
| Mission            | DB-01A — Change Reason Contract Alignment              |
| 修正               | `1–500` → `4–200` Unicode code points                  |
| 数据库强制校验     | COMPLETE                                               |
| 边界与原子性测试   | COMPLETE                                               |
| DB-01 Commit       | PRESERVED — `651228c0d6c76bbba92339103bafdf9090f331b9` |
| Baseline / DATA-01 | NOT RUN                                                |
| Push / Deployment  | NOT RUN                                                |

- `save_site_copy` 直接执行 NFC、trim、Unicode code point 4–200 和控制字符拒绝；不依赖未来 Admin、Service 或 Server Action。
- 3、trim 后 3、201、控制字符及换行均稳定返回 `INVALID_INPUT` 且 Revision/Audit/Pointer 零写入；NFC + trim 后 4 与 trim 后 200 均允许。
- Audit 保存规范化 reason；相同 request ID 的规范化等价 reason 返回原结果，不同规范化 reason 返回 `INVALID_INPUT`。
- DB-01 数据模型、八字段、权限、Version、Conflict、锁顺序、并发和 Initialization boundary 均未改变。

## Admin P0 DB-01 本地实施状态（2026-07-30）

| 项目                         | 状态                                            |
| ---------------------------- | ----------------------------------------------- |
| Mission                      | Admin P0 DB-01 — Schema and Security Foundation |
| 实施                         | LOCAL COMPLETE                                  |
| Schema / RLS / RPC           | COMPLETE                                        |
| 正式 Baseline / Version 1    | NOT CREATED — DATA-01 boundary                  |
| Admin / Web 产品代码         | UNCHANGED                                       |
| Remote Supabase / Deployment | NOT RUN                                         |
| Push / PR                    | NOT RUN                                         |

- 新增不可变八字段 `site_copy_revisions`、单一 `site_copy_state` Current Pointer，以及 Public Read、Admin Read、Admin Save 三个 RPC。
- 保存采用 global advisory transaction lock → Current Pointer row lock → 锁内 request ID 复核；禁止 Last Write Wins，冲突不产生 Revision、Audit 或 Pointer 更新。
- 字段和 reason 均按 NFC → 首尾空白移除 → Unicode code point 长度校验，并拒绝控制字符；Revision 保存完整快照，Audit metadata 只保存变化字段。
- `anon` / `authenticated` 无内部表直读写权限；Public RPC 只暴露八字段与非敏感版本；Admin RPC 复用既有 active Admin / Super Admin 权限事实。
- 本地 clean rebuild、upgrade path、事务权限/原子性测试和双连接同 Base 并发测试通过。未创建正式 Baseline，未修改 Auth、capability、`/access`、Admin/Web、依赖或部署状态。

## V1.0.2 当前权威状态（2026-07-29 Final Release Closure）

本文后续保留的 V1.0.2 Local Only、Preview、Pending、Not Run 或 Owner Smoke Required 均为带日期的历史记录，已被本节取代。

| 项目                           | 当前状态                                   |
| ------------------------------ | ------------------------------------------ |
| Release Version                | V1.0.2                                     |
| Release Commit                 | `9ede1c6813e658ea8d7197c74a6ab2703cd0b528` |
| Web Production Deployment      | `dpl_GxM3T6HKB7dyyU9fYmXdpmqWpi74`         |
| Web Production Status          | READY                                      |
| Formal Domain                  | `https://www.fandomharbor.com/`            |
| Product Owner Final Acceptance | PASS                                       |
| Production Functional Smoke    | PASS                                       |
| Release Status                 | RELEASED                                   |
| Final Release Closure          | CLOSED                                     |
| Admin Production Branch        | `admin-production-disabled`                |
| Admin Frozen Commit            | `e137c31f260d761fc2fdd6ebd9f7f0e30cf5630a` |
| Supabase Migration             | NONE                                       |
| Database / Schema Change       | NONE                                       |
| Unresolved V1.0.2 Blocker      | NONE                                       |

- Web Production 为 GitHub `main` 的 `9ede1c6813e658ea8d7197c74a6ab2703cd0b528`，状态 READY，正式域名已更新。
- Lint、TypeScript、193 / 193 tests、Web / Admin / Docs builds 及 Matrix A / B / C / D 全部 PASS。
- Product Owner Local / Online Preview 与最终 Production Functional Smoke 全部 PASS；未发现问题。
- V1.0.2 `main` Push 只产生 Admin Preview；Admin Production 保持 `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` 和冻结 Commit `e137c31f...`。
- Admin 公开 Alias 暂时仍公开；Product Owner 已接受该残余风险。不得写成 Admin 已私有化、关闭、退休或发布 V1.0.2。
- 最终无 Supabase Migration，无远程 Schema、Auth、RLS、RPC 或环境配置变化，无未解决 V1.0.2 blocker。
- 唯一 V1.0.2 Closure 权威记录为 `docs/19_Release/V1.0.2-RELEASE-CLOSURE.md`。

## V1.0.2 历史本地状态（2026-07-28，Superseded）

| 项目                                      | 当前状态                                   |
| ----------------------------------------- | ------------------------------------------ |
| Visibility Development                    | COMPLETE                                   |
| 11-Character Standardization              | COMPLETE                                   |
| Bidirectional Collision Patch             | COMPLETE                                   |
| Matrix A / B / C / D                      | PASS / PASS / PASS / PASS                  |
| Final Database Contract                   | NON-NULL UUID / COLLISION 23505            |
| Final Migration Strategy                  | NULL-COLLISION MIGRATION REMOVED           |
| Local Database / SQL / Fixture / Advisors | PASS                                       |
| Engineering Validation                    | PASS — 193 / 193 TESTS                     |
| Push                                      | NOT RUN                                    |
| Preview / Production Deployment           | NOT RUN                                    |
| Remote Supabase / Database                | UNCHANGED                                  |
| Remote Topology / Migration Audit         | PENDING OWNER READ-ONLY ACCESS RESTORATION |

- Matrix A（V1.0.1 Code + V1.0.1 Schema）、B（V1.0.1 Code + V1.0.2 Final Schema）、C（V1.0.2 Code + V1.0.1 Schema）和 D（V1.0.2 Code + V1.0.2 Final Schema）均已用本地数据库与精确应用版本验证 PASS。
- 最终 V1.0.2 Schema 与 V1.0.1 Schema 相同：未部署的 NULL-collision Migration 已删除，所以 Matrix B 与 A、Matrix D 与 C 的 Schema 相同；不是通过人工推断跳过测试。
- `create_invitation` 保持签名与返回类型；成功返回非空 UUID，冲突继续抛出 `23505`，旧 V1.0.1 不会接收 NULL 成功或显示幽灵邀请码。
- V1.0.2 Adapter 识别结构化 `23505`、防御性 `data=null` 与 `data={id:null}`，统一映射为类型化冲突；Service 最多重试 5 次，非冲突数据库错误只调用一次且不泄露内部详情。
- 首次冲突后成功、两次冲突后成功、连续 5 次受控失败、第 6 次不调用、每次 Secret / Hash 不同、成功审计唯一、无孤立记录、use_count 不变均 PASS。
- 新邀请码继续为 11 位 Base62；100 组格式、Reader 新邀请码注册、旧长格式注册、多人消费、耗尽、撤销、过期与大小写区分全部 PASS。
- UI 回归保持邀请码默认隐藏、显示 / 恢复隐藏、密码与邀请码独立、键盘、`type="button"`、`aria-label`、`aria-pressed`、required、`autocomplete="off"`、18+、Invitation-only、政策链接、390px 与 Light / Dark。
- 本地 14 / 14 Migrations、6 套 SQL、Fixture reset、QA credentials contract、Database lint 0 errors、frozen install、format、lint、typecheck、193 / 193 tests 和 Web / Admin / Docs builds 全部 PASS。
- 无 dependency、package、lockfile、`next-env.d.ts` 或 Admin 文件漂移；Secret Audit PASS。
- 当前只能报告 `LOCAL COMPLETE`，不得写成 Production Ready、Released 或已部署。
- 未 Push、Deploy、Redeploy、Promote、修改环境变量或执行远程 Supabase / 数据库写入。
- Vercel Preview / Production Supabase 拓扑和远程 Migration 历史仍等待 Product Owner 恢复只读审计能力；在该独立审计完成前，不进入 Remote Migration、Preview 或 Production。

## V1.0.1 Password Visibility 当前状态（2026-07-26，Local Only）

| 项目                                   | 当前状态 |
| -------------------------------------- | -------- |
| Development                            | COMPLETE |
| Local Validation                       | PASS     |
| Product Owner Local Preview Acceptance | PENDING  |
| Push                                   | NOT RUN  |
| Preview / Production Deployment        | NOT RUN  |
| External / Backend Change              | NONE     |

- `/auth/sign-in` 与 `/auth/sign-up` 已新增默认隐藏、可显示/隐藏的独立密码控件；当前注册页没有确认密码字段，未创建新字段。
- 控件复用现有 Lucide 图标，使用 `button type="button"`、动态中文 `aria-label`、`aria-pressed`、44×44 目标、Light / Dark 与 `focus-visible` 样式；切换保持输入值且不提交表单。
- `current-password` / `new-password`、required / minLength、登录/注册 Server Action、邀请码必填、18+ 与 Terms / Privacy / Content Policy 合同保持不变。
- frozen install、lint、typecheck、174 / 174 tests、targeted tests、Web / Admin / Docs production builds 全部 PASS。
- 本地浏览器 1280 / 390、Light / Dark、登录错误状态、默认隐藏、显示/隐藏、值保持、44px、零横向溢出、自动填充属性/布局与 console errors = 0 全部 PASS；键盘可达性由原生按钮语义、焦点顺序合同与组件测试覆盖。
- `Ready for Product Owner Local Preview = YES`；不得将此解释为 Product Owner 已验收、V1.0.1 已发布或已部署。
- 未 Push、Deploy、Redeploy、Promote；未修改 Vercel、Supabase、数据库、Auth、RLS、RPC、DNS、环境变量、dependency 或 lockfile。

## 当前权威状态（2026-07-26 Final Release Closure）

以下是当前 Release 权威状态；本文后续较早的“当前阶段 / 当前状态”及 Pending、Blocked、Not Run、Authorized=NO 表述均按原日期保留为历史记录，并已被本节取代。

| 项目                           | 当前状态                                         |
| ------------------------------ | ------------------------------------------------ |
| Release                        | Fandom Harbor V1 Reader-only Invitation Beta     |
| Release Status                 | RELEASED                                         |
| Production Ready               | YES FOR READER-ONLY INVITATION BETA              |
| Production Deployment          | COMPLETE                                         |
| Production Smoke               | PASS                                             |
| Product Owner Final Acceptance | PASS                                             |
| Final Release Closure          | CLOSED                                           |
| PDR-01                         | CLOSED                                           |
| PDR-02                         | CLOSED FOR CURRENT RELEASE                       |
| Release Date                   | 2026-07-26                                       |
| Legal Review                   | NOT COMPLETED                                    |
| Owner Risk Acceptance          | ACCEPTED FOR LIMITED INVITATION-ONLY READER BETA |

- Public Policy V1.0 的唯一规范来源为 `docs/19_Release/V1-PUBLIC-POLICY-V1.0.md`；批准日期 2026-07-25，正式发布生效日期 2026-07-26。
- Production Deployment `dpl_3dj8UwrQER7WukZYAk4rYmsbhwib` 为 `fandom-harbor-web` 的 GitHub `main` Production READY 部署，Commit=`14f9af1c0b4fc440daab26fba9f2eb513f56142f`。
- 正式域名 `https://www.fandomharbor.com/` 正常，apex 308 跳转到 www；公开政策、注册提示、Footer、Sitemap、Guest 权限与 Product Owner Reader 链路 Smoke 全部 PASS。
- `PDR-01 = CLOSED`。`PDR-02 = CLOSED FOR CURRENT RELEASE`，但不是永久关闭；PITR 未启用，不声称平台物理备份存在。
- Legal Review 仍为 `NOT COMPLETED`；风险接受仅限有限、邀请制 Reader-only Beta。
- Admin Preview 独立跟踪，不阻挡当前 Release；Author Production Beta 尚未完成独立正式验收。
- 当前 Release 不含开放注册、公众大规模发布、Author Beta、Admin Production、社交/评论/推荐/排名、图片正文、PITR 或无限规模容量承诺。
- 下一阶段为 V1.0.1 Password Visibility 与最小回归；其后才执行首批 3–5 名受控 Reader Beta 和后续体验/Author/Admin 工作，这些均不是当前 V1 Release blocker。

## 历史阶段（2026-07-14，Superseded）

V1 Release Deployment — BLOCKED（Local gates PASS / Preview 未执行）

## 历史状态（2026-07-14，Superseded）

`部署前本地门禁通过；等待 Git baseline 与 Vercel 项目关联后继续 Preview`

## 历史 Release Mission（2026-07-14，Superseded）

- V1 Deployment Ready for Product Owner Review = NO；部署类型为 Local only。
- Supabase linked remote Migration 14 / 14 一致；未执行任何远程写入。
- `pnpm validate`、169 / 169 Workspace tests、Web 81 / 81、Admin 2 / 2、Web / Admin / Docs production builds 与 `git diff --check` 全部通过。
- Local QA Fixture、Guest / Reader / Author、Reader `/studio` → `/archive`、Author Studio、Published-only / Draft isolation、1280 / 390 与 Light / Dark 通过。
- 当前 `main` 比 `origin/main` 超前 4 commits，且已验收 UX-06 改动仍未提交，尚无本轮可追溯 Release baseline。
- 仓库无 Vercel Project 关联，CLI / Dashboard 无法完成核对，Preview / Production Environment Variables 与线上 URL 未确认。
- Product P0 = 0、Product P1 = 0；Release Gate P1 = 2。
- 已新增 V1 Release Deployment、Deployment Smoke Test、User Guide 与 Admin Guide。
- GitHub Baseline secret audit 发现未跟踪 UX 验收文档第 86–87 行曾包含两条 localhost-only QA 密码；已脱敏、轮换并确认未进入 HEAD / Git 历史，当前复扫无匹配。
- 依据 Mission 强制暂停条款，尚未 commit、push、检查 Vercel 关联或部署 Preview；等待 Product Owner 确认后恢复。
- 不执行 Preview、Production、DNS、secret 写入、数据库、Auth、RLS、RPC 或 Role 变更；等待 Product Owner 明确处理发布门禁。

## 当前 UX Mission

- UX-06J = PASS；Release UI Sweep / V1 UI Consistency = Accepted；Product Owner Acceptance = PASS。
- P0 = 0，P1 = 0；任务已正式关闭。
- Homepage、Archive、Search、Work Detail、Published Reading、Author Profile、Studio Entry / Overview 与 Auth 审计完成。
- 关闭 UIJ-AUDIT-001–003：Studio Mobile 导航高度、Studio 入口 44px、Auth 工程标签与互链 44px。
- 1280 / 390、Light / Dark、horizontal overflow = 0 与 browser console errors = 0 通过。
- Guest、Reader、Author、Reader Studio denial 与 Author Studio access 通过。
- UX-06H Homepage 与 UX-06I Global Shell 均无回退。
- Web 81 / 81 tests 与完整 `pnpm validate`、169 / 169 workspace tests、全部 production builds 通过。
- 未修改 Database、Supabase、Migration、RLS、RPC、Auth logic、Role、Published-only 或业务逻辑。
- 非阻塞后续项：移动端当前路由高亮、Root Loading / Error 共享架构边界、极端长连续文本 Fixture coverage。
- 停止在当前状态；不得进入部署、新功能或下一项 UX 任务，等待 Product Owner 下一条明确指令。

- UX-06I Global Shell / Navigation 已通过 Product Owner 验收；UX-06I = PASS，Global Shell / Navigation = Accepted。
- 桌面三分区结构保持稳定，移动端默认收起的原生 `details` 主要导航已获接受。
- Archive、Search 与 Studio 使用统一导航数据源；Studio 继续只对 `work:author` capability 显示。
- Guest / Reader 无 Studio 入口；Reader 直访 `/studio` 重定向 `/archive`；Author 可见并可进入 Studio。
- Homepage、Archive、Search、Work Detail、Reading、Author Profile、Studio、390 Mobile 与 1280 Desktop 回归通过，browser console errors = 0。
- Web 81 / 81 tests、Web / UI typecheck、UI lint 与完整 `pnpm validate` 通过；Workspace 169 / 169 tests 和全部 production builds 通过。
- 未修改 Auth、Permission、Role、Published-only、Draft isolation、Database、Supabase、Migration、RLS、RPC 或页面产品逻辑。
- P0 = 0，P1 = 0；Product Owner Acceptance = PASS。
- 移动端当前路由高亮记录为非阻塞后续优化项。
- UX-06I 已关闭；不得进入下一项 UX 任务，等待 Product Owner 下一条明确指令。

- UX-06H Step04 Homepage Release Acceptance Slim 已完成；Step01 / Step02 / Step03 均为 PASS。
- Homepage 的 Quiet Editorial Harbor Entrance 五段结构保持稳定。
- 现有 Public Browse Gateway、`newest`、最多三项与 `BrowseWork` contract 保持不变。
- Homepage → Archive / Search / Work Detail / Auth、Guest / Reader / Author、Published-only 与 Draft Work / Chapter isolation 全部 PASS。
- 1440 / 1280 / 768 / 390、Light / Dark、keyboard focus、44px、single H1、five labelled regions、zero overflow 与 browser console errors = 0。
- Web lint / typecheck / 79 tests / build、完整 `pnpm validate`、167 / 167 workspace tests、全部 production builds 与 diff check 通过。
- HP-AUDIT-007 Frozen；HP-QA-001 为 non-blocking Fixture enhancement；stale chunked-cookie warning 无功能影响。
- P0 = 0，P1 = 0；Homepage Ready for Release = YES。
- Step04 未修改产品实现或数据层；未修改 Auth、Permission、Published-only、Gateway、Service、Repository、query、Database、Supabase、RLS、RPC 或 Migration。
- UX-06G Step01–Step04 已通过 Product Owner 最终验收；Work Detail Ready for Release = YES，Track 已完成并关闭。

- Product Owner 已确认 UX-06F Step01–Step04 全部 PASS；Author Profile Ready for Release = YES，Track 已完成并关闭。

- UX-06E Step01–Step03 已验收并成为 Step04 冻结 Release QA 基线；UX-06E Step04 Search Release Acceptance 已完成最终浏览器复验。
- Initial、Query、Empty、Invalid、80 / 81-character、Loading、Error、Work / Author Results、Light / Dark 与四档响应式均通过。
- Guest / Reader / Author、Published-only、Draft Work / Chapter isolation、Work / Author entries 与 browser console 0 通过。
- Step03 发现 Error clear 同 route navigation 不会重置 segment error boundary；仅在 `search/error.tsx` 改为原生完整导航并复验通过。
- `/search` 已建立 Orientation、visible-labeled Query、Query Context / State、Work Results 与 Author Results 的 route-local 页面节奏。
- Initial / Empty recovery、Search-shaped Loading、single-owner Error、44px entries 与 Light / Dark responsive presentation 已完成。
- `/search` 已完成 route、GET query、Work / Author results、Initial / Invalid / Empty / Loading / Error、1280 / 390 responsive、semantics 与 boundary 的只读审计。
- Search 定位冻结为 Published Work / Public Author 的主动查询入口；Archive 继续承担 Published Work 浏览、排序与分页。
- Search 不承担 recommendation、ranking、Feed、Marketplace、advanced filters、Studio management 或 immersive Reading。
- Published-only、Draft isolation、Search Gateway / Service / Repository / RPC、query fields、matching、ordering 与 result cap 均未改变。
- 记录 8 个 P2 design / accessibility findings；P0 = 0，P1 = 0，Search Ready for Step02 = YES。
- `pnpm validate`、167 tests、Web 79 / 79 与 Web / Admin / Docs production builds 全部通过。
- Step01 未修改产品实现、Database、Supabase、RLS、RPC、Migration、Auth、Permission、dependency 或 deployment configuration。
- Guest / Reader / Author、Published-only、Draft isolation、Work / Author entries 与 browser console 0 已通过。
- `pnpm validate`、167 / 167 workspace tests、Web 79 / 79 与 Web / Admin / Docs production builds 通过；Search Layout Ready for Step03 = YES。
- Step02 修改产品实现但仅限 Search route-local UI；Search data / permission / query contracts 未改变。
- Web lint / typecheck / 79 tests / build 与 `pnpm validate`、167 / 167 workspace tests、全部 production builds 通过。
- Step04 复核所有 states、query contract、四档视口、Light / Dark、accessibility、Guest / Reader / Author、Published-only 与 Draft isolation，全部 PASS。
- SE-AUDIT-001 至 SE-AUDIT-008 与 Step03 Error clear finding 均保持 Closed；P0 = 0，P1 = 0。
- Step04 未修改产品实现；Web checks、`pnpm validate`、167 / 167 tests、全部 production builds 与 diff check 通过。
- P0 = 0，P1 = 0；Search Ready for Release = YES，Product Owner Final Decision：PASS。
- UX-06E Step01–Step04 全部 Accepted；Search Track 已完成并关闭。

- UX-01 至 UX-05E 已全部通过 Product Owner 验收，UX-05 Visual Intelligence Phase 已关闭。
- UX-06A Design System Implementation Foundation 已完成工程样式审查、Token Strategy、Component Strategy 与 UX Implementation Guidelines，并通过 Product Owner 验收。
- UX-06B Homepage Implementation Step 01 已建立 route-local Homepage Shell、四个 semantic content regions 与 Desktop / Mobile responsive foundation，并通过 Product Owner 验收。
- Step 01 保留 Root Layout、SEO、Session、`landingSignals`、`mockWorks` 和全部既有入口；未修改 Auth、Permission、Database、Supabase 或业务逻辑。
- UX-06B Step 02 已完成品牌入口、Story Discovery、真实 Published Work、Reading Entry 与 Closing 内容结构，并通过 Product Owner 验收。
- Homepage 复用现有 Published-only browse gateway 并展示 newest three；无推荐算法、数据库、Supabase、Auth、Permission 或业务逻辑变化。
- UX-06B Step 03 已完成 Homepage Typography、Spacing、semantic color usage、轻量反馈与 Desktop / Tablet / Mobile visual refinement，并通过 Product Owner 验收。
- Step 03 未改变 React 结构、Component、数据、Auth、Permission 或业务逻辑，并已作为 Step 04 Release Audit 的冻结实现基线。
- Product Owner 已授权永久 Manual QA Handoff Gate：所有人工验收 Mission 必须主动提供环境、动态 Fixture 凭据、身份验证结果和统一 Checklist；任何 QA 环境或凭据失败均为 P0，修复前不得交付。
- 当前 Step 03 QA Environment 已复验 Ready：Guest、Reader、Author、Reader Studio denial、Author Studio/Profile、Desktop/Mobile 与零错误控制台均通过。
- UX-06B Step 04 已完成 Homepage Responsive、Accessibility、Interaction、Performance、Visual Consistency 与完整 V1 Regression Audit；未发现需要修改 Homepage 代码的问题。
- Homepage 当前为 Release Ready：四档视口、WCAG 对比度、全仓 `pnpm validate`、Guest/Register/Login/Archive/Reading/Author/Studio 与角色边界全部通过。
- Product Owner 已确认 UX-06B Step 04 PASS，Homepage Track Completed。
- UX-06C Reading Track Step01–Step05 已全部完成并通过 Product Owner 验收。
- UX-06D Step02 已在 Step01 Design Contract 边界内完成 Archive route-local Layout Upgrade；Orientation、Browse Controls、编辑式 Results、Pagination 与 Private Return 层级已建立。
- Step02 保留四种排序、URL state、分页、Published-only、Reader Permission、Draft Isolation、Work / Author links 与 ReaderShelf 本地行为；未改变数据、权限或业务逻辑。
- 1440 / 1280 / 768 / 390、Guest / Reader / Author、Published Work / Draft isolation 与 console error 0 回归通过；P0 / P1 为 0。
- AR-AUDIT-003、AR-AUDIT-007 与 KI-024 按 Mission 边界保持为后续范围；未新增 QA 数据或伪造多页 PASS。
- UX-06D Step03 已完成 Archive Empty / Loading / Error / Pagination / Sort / URL、1440 / 1280 / 768 / 390、accessibility 与 Guest / Reader / Author 边界集中复验。
- Step03 仅在 Archive route-local CSS 中将作品标题、作者与作品入口补足为 44px minimum tap target；未修改页面结构、数据、Gateway、Repository、Permission 或其他 route。
- Published-only、Draft Work / Chapter 404、Work Detail、Author Profile、ReaderShelf 与 browser console error 0 回归通过；P0 = 0，P1 = 0。
- Archive Ready for Step04 = YES；Step04 subsequently authorized and completed below.
- UX-06D Step04 已完成 Archive 最终 Release Acceptance；Step01 / Step02 / Step03 均纳入最终基线并通过复核。
- Archive 最终定位为 Curated Story Discovery Space；四种正式排序、states、1440 / 1280 / 768 / 390、accessibility、Guest / Reader / Author、Published-only、Draft isolation、Work / Author links 与 ReaderShelf 全部 PASS。
- `pnpm validate`、Web 79 / 79 tests、production builds 与 browser console error 0 通过；P0 = 0，P1 = 0。
- Step04 未修改产品实现；AR-AUDIT-003、AR-AUDIT-007 与 KI-024 继续作为 P2 / post-Beta 风险保留。
- Product Owner Final Decision：PASS；UX-06D Step01–Step04 全部 Accepted，Archive Track 已完成并关闭。
- Archive Ready for Release = YES；不得继续优化 Archive，不自动开启新的 UX Track。
- UX-06C Step 01 已建立 Reading Context、Story Content 与 Continuation 三层 Layout Foundation，并提取 route-local Chapter Header / layout primitives。
- UX-06C Step 01 补充冻结全站 Header 三段式结构：Brand、Primary Navigation、Utility / Account 各自独立；Studio 继续由既有 `work:author` capability 控制。
- Reading grid 已增加移动端 intrinsic-width containment 与连续文本换行保护，不改变阅读偏好合同。
- UX-06C Step 01 Additional 已建立 page-local Mobile Reading Navigation：返回作品常驻，Homepage / Archive / Shelf / Search、上一 / 下一章与章节目录按需展开；Desktop 目录默认关闭。
- Product Owner 已确认 UX-06C Step 01 PASS，Reading Track 基础阶段完成。
- UX-06C Step 02 已完成并通过 Product Owner 验收：保留 Reader preference contract，建立 system-serif fallback、离散章节标题 scale、结构化正文节奏与 Progressive Disclosure 阅读控制。
- Author Studio / Work Editor 多章节管理与发布选择 UX 规则已记录并冻结；当前仅文档化，后续实现必须由独立 Author Studio / Chapter Management Mission 授权。
- UX-06C Step 03 已完成 Reading Interaction：Chapter Directory、Mobile Navigation 与 Reading Settings 一次仅展开一个，目录关闭后焦点返回触发按钮，章节末尾保持安静的 Previous / Next 延续语义。
- 1440 Desktop、390 Mobile、44px touch targets、zero overflow、Guest / Reader / Author QA 与零新页面运行错误通过。
- Product Owner 已确认 UX-06C Step 03 PASS；Reading Interaction 基础已冻结。
- UX-06C Step 04 已完成 1440、768、390 的真实短章节、设置、目录、切章、错误边界与全站角色回归，全部可执行项通过且 browser errors 为 0。
- UX-06C Step04A 已扩展现有 `qa:fixture`：4 个 fixed-ID QA Works、6 个 QA Chapters，覆盖 Short、Long-form、Multi Chapter、Empty 与 Draft isolation。
- Long-form Chapter 包含 150 个合成段落、约 14,242 rendered characters；1440 Desktop 与 390 Mobile 长滚动 geometry、zero overflow 和章节连续性验证通过。
- `qa:fixture` 重复创建、`qa:fixture:clean` 内容清理、重新创建与 `qa:credentials` 均通过；清理保留 QA identities 和 permissions。
- Reader 只见 3 个 Published Chapters；Author Studio 可见全部自有 QA Works；Draft Work / Chapter 不进入 Archive、Reader 或公开 Author Profile。
- Step04 原 Long-form 数据缺口已由 Step04A 解决，Step04 重跑与 Product Owner 验收均已完成。
- Product Owner 已确认 UX-06C Step04A PASS；Reading QA Infrastructure 已冻结并由 Step04 / Step05 成功复用。
- UX-06C Step04 已获授权并真实重跑：Long Watch 150 段在 1440 / 768 / 390 的连续阅读、长滚动、Typography、Settings、Navigation 与三章 Transition 全部 PASS。
- Homepage、Archive、Reading、Author 与 Studio 回归通过；Reader denial、Author Studio、Draft isolation 与 browser errors 0 通过。
- Step04 未发现需修复问题，未修改 UI、Fixture、Schema、Migration、RLS、Permission 或业务逻辑；Product Owner 已确认 PASS。
- UX-06C Step04 已正式关闭；UX-06C Step05 已获独立授权并完成。
- UX-06C Step05 已获授权并完成最终 Release Audit：1440 / 1280 / 768 / 390、Accessibility、Performance、Long-form 与完整 Regression 全部 PASS。
- `pnpm validate` 全绿，Web 79 / 79 tests 与三套 production builds 通过；browser errors 0，P0 = 0，P1 = 0。
- Reading Release Decision：Ready for Release = YES；未修改产品代码、Fixture、Database、Supabase、Permission 或业务逻辑。
- Product Owner 已确认 UX-06C Step05 PASS；Reading Track 正式 Completed / Release Ready。
- Homepage Track 与 Reading Track 当前均为 Release Ready；等待下一条 UX Track 独立授权。
- UX-06D Archive Track Step01 已获授权并完成：当前 `/archive` route、Published-only browse、sort、pagination、cards、states、responsive 与 semantic structure 已完成只读审计。
- Archive Design Contract 已冻结页面目标、信息优先级、页面分区、Work card、sort、pagination、empty/loading/error、mobile 与跨页面边界。
- 记录 7 个 P2 design / QA findings；P0 = 0，P1 = 0，没有必须先修改代码才能继续的阻塞。
- Archive Ready for Step02 = YES；Step02 未获授权且未开始。
- Step01 未修改产品代码、Database、Supabase、RLS、RPC、Migration、Auth、Permission、Published-only、data gateway 或 dependency。
- Schema、Migration、RLS、Permission、Reader logic、UI、Typography 与 Production data 均未改变。

## 已完成

- Milestone v0.1 已发布到 GitHub。
- Phase 1 Foundation 与 Sprint 002A Website Shell 已完成并归档。
- Auth Boundary、Identity Model、Invitation System、Membership、Role Model、Audit 与 Supabase Boundary 已固化。
- Landing、Reader List、Reader Detail、Reader Shell、Author Empty State、Admin Dashboard、Mock Data 与 Shared Layout 已交付。
- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build` 已通过。
- Phase 2 / Sprint 002A brief 已由 Product Owner 批准，四项启动门禁已通过。
- 七张内容表、Migration/RLS/约束/索引、TypeScript Service/Repository 边界、Vitest/SQL 测试和 ADR-019 已完成。
- 全仓 lint、typecheck、Vitest 与三套 Next.js production build 已通过。
- 作品详情、章节阅读与独立文章阅读路由已接入可替换的 `ReaderContentGateway → Content Service → ContentStore` 数据流。
- 结构化正文安全渲染、上一章/下一章、章节目录、Light/Dark、字号、行高与阅读宽度控制已完成。
- Sprint 002B-Step01 单元测试与浏览器公共壳/主题/登录守卫检查已通过。
- Sprint 002B-Step02 已实现版本化 localStorage 阅读偏好、Storage 安全回退和更清晰的章节进度/边界/当前章节状态；全仓门禁与浏览器回归通过。
- Sprint 002B-Step03 已实现本地 work/chapter/article 阅读历史、时间/章节位置记录与作品详情页 Continue Reading；不依赖登录且不写数据库。
- Sprint 002B-Step03 全仓 lint、typecheck、38 个 Vitest、三套 production build 与浏览器公共壳/登录守卫回归通过。
- Sprint 002B-Step04 已实现本地章节/文章书签、当前书签状态和 `/archive` 本地书架；书架聚合书签与最近阅读且不写数据库。
- Sprint 002B-Step04 全仓 lint、typecheck、43 个 Vitest、三套 production build 与浏览器公共壳/书架登录守卫回归通过。
- Sprint 002B-Step05 已完成作品/章节/文章/本地书架空状态与失效链接审计、全局 404/error 恢复路径、阅读控件与书签/书架无障碍打磨。
- Sprint 002B-Step05 全仓 lint、typecheck、43 个 Vitest、三套 production build 与浏览器 404/主题刷新/书架登录守卫回归通过。
- Sprint 002C-Step01 已建立 Studio Service/Store 注入边界、Author fixture 与 `/studio` route tree；全仓门禁和未登录浏览器守卫回归通过。
- Sprint 002C-Step01 草稿章节隔离缺口已修复，Reader published-only 合同覆盖 Work、Article 与 Chapter。
- Sprint 002C-Step01 全仓 lint、typecheck、48 个 Vitest、三套 production build 通过；最小修复后的 Web production build 再次通过。
- Product Owner 于 2026-06-30 确认 Sprint 002C-Step01 工程验收通过。
- Sprint 002C-Step02 已新增 owner-scoped `/studio/works/[workId]` 只读详情、作品元信息、章节摘要、Not Found 边界与 disabled 操作占位。
- Step02 的 owner ID 继续由 TrustedAccessContext 注入；其他作者详情返回 null，Reader published-only 合同保持通过。
- Step02 全仓 lint、typecheck、52 个 Vitest 与 Web production build 通过。
- Product Owner 于 2026-06-30 确认 Sprint 002C-Step02 工程验收通过。
- Sprint 002C-Step03 已新增 owner-scoped `/studio/articles/[articleId]` 只读详情、文章元信息、关联信息、Not Found 边界与 disabled 操作占位。
- Step03 的 owner ID 继续由 TrustedAccessContext 注入；其他作者文章详情返回 null，Reader article published-only 合同保持通过。
- Step03 全仓 lint、typecheck、55 个 Vitest 与 Web production build 通过。
- Product Owner 于 2026-07-01 确认 Sprint 002C-Step03 工程验收通过。
- Sprint 002C-Step04 已补齐 Studio 空列表、详情级 Not Found、无章节/全草稿章节状态与返回 Studio/列表的恢复路径。
- Step04 继续以 trusted owner、Reader published-only 和 disabled action contract 保持只读边界。
- Step04 全仓 lint、typecheck、58 个 Vitest 与 Web production build 通过。
- Product Owner 于 2026-07-01 确认 Sprint 002C-Step04 工程验收通过。
- Sprint 002C-Step05 已完成 Freeze & Handoff；Step01-Step04 全部 Accepted，Sprint 002C 可正式关闭。
- Studio 当前冻结能力包括首页、Works/Articles 列表、Work/Article 只读详情、空/错误/边界状态、恢复导航、Reader published-only 与 Trusted Identity Contract。
- Phase 2 Architecture Review 已完成：只读架构可维护，但真实写入仍受 owner-only Repository、DB Runtime、正文校验、Revision 与状态机阻塞。
- Product Owner 于 2026-07-01 批准 Sprint 002D Author Creation Experience UI Shell 开发手册；Step01 随后获得独立授权。
- Sprint 002D-Step01 已新增 `/studio/works/new`、客户端表单状态/校验、Category/Tag fixture、封面/loading 占位和 disabled 保存/发布 Action Bar。
- Step01 不包含 Service 写入、Repository、Supabase、Mutation、POST、RPC、SQL 或虚假保存成功状态。
- Step01 全仓 lint、typecheck、64/64 Vitest 与 Web production build 通过；`/studio/works/new` 已进入 production 路由表。
- Product Owner 将 Sprint 002D-Step02 调整为 Create Work Draft Persistence，替代原 Create Article UI Shell，并批准最小词表与原子 RPC 的 Level 3 变更。
- Step02 已新增 5 个 V1 Category、10 个 `additional/canonical` Tag、`create_author_work_draft` RPC，以及 Server Action → Gateway → Service → Repository 写入链路。
- RPC 只允许 active Author，owner 固定为 `auth.uid()`，status 固定为 `draft`，`published_at` 固定为 null；Work 与 `work_tags` 在单一事务内写入。
- `/studio/works/new` 已改为读取数据库 Category/Tag UUID，保存草稿可用并提供 pending/错误/成功状态；Publish 继续 disabled。
- Step02 全仓 lint、typecheck、74/74 Vitest 与 Web production build 通过；生产路由表包含 `/studio/works/new`。
- Local Supabase Runtime Validation 已完成：六条 Migration 从零重建通过，V1 词表重复执行为 0 新增行，Category/Tag 数量为 5/10。
- `phase_2_content_domain.sql` 在真实本地 PostgreSQL 通过，覆盖 Author 创建、anon/Reader 拒绝、非法 Category、deprecated Tag、无部分 Work 与 `works`/`work_tags` 原子性。
- Runtime Validation 发现并修复 RPC 对受限 `id`/`owner_user_id` 列的越权 `INSERT ... RETURNING *`；修复未放宽 grant 或 RLS。
- Sprint 002D-Step02 正式 Accepted；Sprint 002A 数据库实测也已完成。
- Product Owner 将快速上线 V1 下一阶段调整为 Sprint 002E Minimal Draft Editor，优先完成 Write → Save → Publish → Read 闭环。
- Sprint 002E-Step01 已复用 `chapters.content` 建立 owner-only Draft Editor 读取合同和 `/studio/works/[workId]/edit`。
- 编辑页展示真实 draft Work 的 title、summary、category、tags、status 与首个 Chapter 正文；无 Chapter 时提供空 textarea。
- textarea 只在浏览器页面内编辑，保存与发布均 disabled；没有新增 Mutation、RPC、Migration、RLS 或 Schema。
- Create Work Draft 成功后直接跳转新 Work 的编辑路由。
- Sprint 002E-Step01 全仓 lint、typecheck、81/81 Vitest 与 Web production build 通过；production route table 包含 `/studio/works/[workId]/edit`。
- Sprint 002E-Step02 已新增最小 `chapters` 正文更新 grant、owner-only Draft Body Save Server Action、首章创建/同章更新 Repository 路径与成功/失败反馈。
- Step02 不新增 RPC、不修改表结构、不修改 RLS，也不会改变 `work.status`、设置 `published_at` 或触发 Publish。
- Local Supabase `db reset --local --no-seed` 与 `phase_2_content_domain.sql` 真实通过，覆盖 anon/Reader/非 owner 拒绝、owner 更新、首存创建首章、同章更新与 published-only 合同。
- Sprint 002E-Step02 全仓 lint、typecheck、86/86 Vitest 与 Web production build 通过；`/studio/works/[workId]/edit` 保持在 production route table。
- Sprint 002F 已完成最小 Publish Workflow：`/studio/works/[workId]/edit` 现在支持 `save | publish` 双意图提交，发布前会保存当前正文。
- Publish 通过现有 Service/Repository 边界直接更新 `works` 与首章 `chapters` 的 `status/published_at`，不新增 RPC、Migration、Schema 或 RLS。
- Reader 已接入 hybrid published gateway；数据库中的新发布 Work 可立即出现在 `/works`、`/works/[slug]` 与 `/works/[slug]/chapters/[chapterSlug]`，fixture published 内容继续可读。
- Local Supabase reset 与扩展后的 Phase 2 SQL suite 再次真实通过，覆盖 Reader 拒绝发布、owner 发布 draft、空作品首章创建后发布以及 Reader published-only 计数变化。
- Sprint 002F 全仓 lint、typecheck、测试与 Web production build 通过。
- Sprint 002G 已完成 Public Reading 收口：`/articles/[slug]` 现已切换到与 Work/Chapter 一致的 hybrid published gateway。
- Reader 公共读取统一遵循“数据库 published 优先、fixture published 回退”，draft Work、Chapter、Article 均不会泄漏到公开页面。
- Sprint 002G 全仓 lint、typecheck、测试与 Web production build 通过；本 Sprint 无数据库侧变更，因此沿用 Sprint 002F 最近一次真实 Runtime Validation。
- Sprint 002H 已完成 Bookshelf / Library：`/works` 现在作为 Reader Library Hub，整合了继续阅读、最近书签、本地书架摘要与 published 内容浏览。
- `/archive` 继续保持本地书签与最近阅读详情页；`/works` 与 `/archive` 形成“浏览入口 + 回访详情”双入口结构。
- Sprint 002H 新增客户端筛选与 Library 纯逻辑测试；全仓 lint、typecheck、测试与 Web production build 通过。
- Phase 2 人工验收发现的注册 P0 已修复：注册改为注册名、至少 8 位密码和邀请码，登录改为注册名与密码，不再要求或发送邮箱验证。
- `profiles.registration_name` 作为大小写不敏感唯一的站内身份标识；Auth metadata 只承载注册事务输入，不作为会话权限或角色事实源。
- Auth 用户创建 Trigger 在同一事务校验并锁定邀请码，创建 Profile、active Membership、Redemption 与审计记录；失败会回滚 Auth 用户。
- 2026-07-02 本地 Supabase 从零重建、三套 SQL 脚本、真实 Auth 注册/登录、lint、typecheck、完整 Vitest 与 Web/Admin/Docs production build 全部通过。
- Phase 2 Product Handoff 已生成，包含启动方式、入口、QA 账号、路由、建议验收流程、已知限制与人工验收记录。
- 当前本地 Supabase 已准备 `Phase2Reader`、`Phase2Author` 与 QA 邀请码；两组账号通过 Auth API 登录验证，数据库重置后失效。
- Product Owner 已使用远程注册账号 `Auther001` 完成注册名 + 密码登录，并在手工 Author grant 后成功进入 Studio。
- Phase 2 Auth P0 已解除，Phase 2 人工验收状态为 Pass。
- Product Owner 于 2026-07-02 将 Phase 3 调整为 V1 Fast Launch Strategy。
- Phase 3 已重组为 Phase 3A Beta Blocking、Phase 3B Beta Operations 与 Phase 3C
  Beta Polish；原 Sprint 3.10 已迁为独立 Release Readiness `RR-1`。
- 新增 `3B-3 Invitation Relationship`，仅提供 Table、Tree Table 或简单
  Parent / Child 邀请关系，不包含复杂可视化或统计平台。
- Phase 3 Sprint Plan、Phase 文档和 Roadmap 已完成规划同步；未修改业务代码，
  未开始任何 Sprint。
- Product Owner 于 2026-07-02 批准 Mission Authorization v1，并一次性授权
  Mission 3A 的 3A-0、3A-1、3A-2 与必要时的 3A-3。
- Mission 3A 已完成环境与质量门禁、9/9 远程 Migration 对齐、Auth 配置验真、
  远程注册/登录/Studio/Create/Save/Publish/Read、未登录与 Reader 权限拒绝、
  390×844 移动端 QA。
- 全仓格式 P0 已修复；`pnpm validate`、本地 Supabase reset、三套 SQL suite、
  Web/Admin/Docs build 与浏览器回归通过。
- Mission 3A 工程范围内当前 P0 为零。
- Product Owner 于 2026-07-02 确认：`Mission 3A. PASS`。
- Product Owner 已授权并完成 Mission 3B：公开作者主页、Follow / Unfollow 与
  Invitation Relationship Foundation。
- 新增公开作者身份隔离、幂等关注关系、own-only 邀请关系摘要与 published-only
  作者作品读取；未引入通知、推荐、动态流或新的权限模型。
- 本地 10 条 Migration 从零重建、Mission 3B SQL、全仓 Validation 与 Browser QA
  通过；远程第 10 条 Migration 已应用并与本地 10/10 对齐。
- Phase 3 验收修复已补齐公开作者入口、作者作品、全站登录状态、作者信息、TXT 下载及真实 Studio Draft / Published 列表。
- Studio 已开放授权范围内的 Chapter 列表、新建、标题/正文编辑、保存、发布选择和标签关联编辑。
- 新增最小只读 `get_published_work_authors` RPC；仅返回 Published Work 的 `work_slug`、有效 Author `author_slug` 与 `display_name`。
- 第 11 条 Migration 已部署远程，本地/远程 11/11 对齐；远程 RPC HTTP 200。
- `/studio/works` 验收阻塞根因为 Repository 过滤不可读的 `owner_user_id`，导致 PostgreSQL column privilege 错误。
- 新增 authenticated-only `list_my_studio_works` 与 `get_my_studio_work`，只返回 active Author 自有 Draft / Published Work，不暴露 `owner_user_id`。
- 第 12 条 Migration 已部署远程，本地/远程 12/12 对齐；匿名远程调用被 HTTP 401 拒绝。
- Product Owner 于 2026-07-03 完成最终浏览器验收并确认 `Mission 3B. PASS`。
- Create Work、Save Draft、Publish、Reader 回读、Author Public Profile、Published
  Only、Draft 隔离、Follow / Unfollow、登录回跳、Invitation Relationship 与移动端
  基础布局全部通过。
- 验收期间发现的发布链路与 Studio owner-read 问题已修复并复验，不再构成阻塞。
- 2026-07-03 再次执行 `pnpm validate` 通过；本地数据库与远程数据库均为 12/12
  Migration，当前已知 P0 为零。
- Mission 3C-1 新增公开 `/search`、GET URL 参数同步、Published Work 标题/Slug
  与公开 Author 名称/Slug 搜索，以及初始、Empty、Loading、Error 状态。
- Search RPC 只返回 Published Work 与既有公开 Author 字段；Draft、私有 owner、
  注册身份和正文不进入结果，未修改 RLS、Permission Model 或 Auth。
- 本地第 13 条 Migration 从零应用和 Search SQL 通过；远程部署后本地/远程
  13/13 对齐，匿名 RPC HTTP 200。
- `pnpm validate`、桌面与 390px Browser QA 通过；浏览器 Error 为 0。
- Product Owner 于 2026-07-03 完成 Search、Published Work / Slug、Author /
  Author Slug、Draft 隔离、URL、状态、响应式、Accessibility 与 Console 人工验收，
  确认 `Mission 3C-1. PASS`。
- Mission 3C-2 已完成公开 `/archive`、Published Works 分页、最新/最早/标题排序、
  `page` / `sort` URL 恢复、越界页纠正及 Empty / Loading / Error 状态。
- Browse RPC 仅返回 Published Work 与既有公开 Author 字段，Draft、owner 与注册身份
  不进入结果；未修改表结构、RLS、Permission Model 或 Auth。
- 本地从零重建与 Browse SQL 通过；第 14 条 Migration 已部署远程，本地/远程
  14/14 对齐，匿名 RPC HTTP 200。
- `pnpm validate`、桌面与 390px Browser QA 通过；162 项测试通过，Console Error
  为 0，P0 为 0。
- Mission 3C-3 已完成 `sitemap.xml`、`robots.txt`、站点级 Metadata、Canonical、
  Open Graph，以及 Archive、Search、Author 与 Published Work 页面 Metadata。
- Sitemap 只包含 Published Works 与其公开 Author；Draft 直接访问输出
  `noindex, nofollow`，Studio 私有路由同样保持不可索引。
- 未新增 Migration、RLS、权限模型、第三方依赖或架构；本地/远程 Migration
  继续为 14/14 对齐。
- `pnpm validate`、桌面与 390px Browser QA 通过；167 项测试通过，Console Error
  为 0，P0 为 0。
- Product Owner 于 2026-07-04 完成 Mission 3C-3 最终人工验收并确认 PASS；
  Sitemap、Robots、Published-only、Author / Work 收录、Metadata、Canonical、
  Open Graph、Draft noindex、Browser QA、Console 与 Responsive 全部通过。
- Mission 3C-3 正式关闭；Mission 3A、Mission 3B 与 Mission 3C 均已完成验收，
  Phase 3 状态为 Completed（Product Owner Accepted）。
- Mission RR-1A 已完成 Runtime、Migration、Validation、Build、Documentation 与
  Project Structure Audit，并建立 Release Checklist 与 Browser QA Checklist。
- 本地 Supabase 已从零应用 14 条 Migration；六套 SQL、local schema lint 与
  Local / Remote 14/14 parity 通过。
- `pnpm validate` 全绿，167 项测试及 Web / Admin / Docs build 通过；P0 为零。
- Known Issues 已按 RR-1B、RR-1C、Go / No-Go 产品决策、Beta 限制与未来功能分类。
- Mission RR-1B 已完成 Production Deployment 并通过 Product Owner 最终人工验收。
- Production URL、HTTPS、Environment Variables、Production Build、首页、Archive、
  Search、Author、Published Work、`/sitemap.xml`、`/robots.txt`、Metadata、
  Canonical、Open Graph、Browser Smoke、Console、Network 与 Responsive Layout
  均通过验收。
- Mission RR-1B 正式关闭；随后 RR-1C Release Candidate 已获授权并完成工程收口。
- Mission RR-1C 已完成 Final Runtime Audit、Final Validation Audit、Final Browser
  QA、Final Mobile QA、Final Documentation Audit、Final Known Issues Review、Final
  Release Checklist 与 Beta Ready Checklist。
- 本地 Supabase clean rebuild 从零应用 14 条 Migration；本地/远程 Migration
  history 14/14 对齐；六套 SQL suites 与 local schema lint 通过。
- `pnpm validate` 全绿，167 项测试及 Web / Admin / Docs build 通过；P0 为零。
- 桌面与 390×844 移动端 QA 均通过；未登录正文与 Studio 守卫符合当前权限模型。
- Product Owner accepted Release Candidate baseline 为
  `8495bded5e0c78985be7410cceb902cd2c090421`。
- RR-1C 最终验收发现 local clean rebuild 后 Auth Users 为空；localhost-only
  QA Fixture 已完成工程修复，能够幂等恢复 Reader、Author、active Membership、
  Author grant/profile 与 Invitation Redemption。
- Fixture clean rebuild recovery、Reader/Author 登录、Reader Access、Author Public
  Profile、Author Studio 与 Reader Studio 拒绝路径已通过浏览器验证，Console Error 为 0。
- Product Owner 于 2026-07-11 完成最终人工验收并确认 Mission RR-1C PASS。
- QA Fixture 验收完成；Author / Reader 权限链路人工验证通过。
- Reader 访问 `/studio` 自动重定向 `/archive`；Release Candidate 达到 Beta Ready。
- Product Owner accepted Release Candidate baseline:
  `8495bded5e0c78985be7410cceb902cd2c090421`。

## 当前阻塞

- Phase 2 当前无 P0 阻塞。
- Mission 3A 无剩余工程 P0，Beta Blocking 已解除。
- Mission 3B 已正式关闭，无已知工程 P0。
- Mission 3C-1 已正式关闭，无已知工程 P0。
- Mission 3C-2 已正式关闭，无已知工程 P0。
- Mission 3C-3 已正式关闭，无已知工程 P0。
- Phase 3 已完成 Product Owner 验收，无剩余 Phase 3 阻塞。
- Mission RR-1A 发布准备基线已完成。
- Mission RR-1B 已正式关闭，无已知工程 P0。
- Mission RR-1C 已正式关闭，无已知 P0；Release Candidate 为 Beta Ready。
- KI-018 Release Candidate Git 基线已由 RR-1C 处理。
- KI-027 Moderate PostCSS advisory、KI-029 CI 缺口与 KI-030 Supabase dry-run
  临时角色认证已作为 Beta accepted risks 分类，需在后续 Go / No-Go 或未来数据库部署前复核。

## Product Owner 人工验收结论

- Phase 2：Pass。
- 作者后台与读者后台已手动检查，暂未发现其他明显问题。
- 同一远程验收环境已完成：九条 Migration → Email Confirm 关闭 → 真实注册 → 注册名/密码登录 → 手工 Author grant → 成功进入 Studio。
- Phase 2 Auth P0 已解除。
- Product Owner 已批准 Phase 3 Fast Launch 治理方向和文档更新。
- Mission 3C-1、3C-2、3C-3 均已完成 Product Owner 验收，Mission 3C 正式关闭。
- Mission 3A：PASS。
- Mission 3B：PASS — Product Owner Accepted（2026-07-03）。
- Mission 3C-1：PASS — Product Owner Accepted（2026-07-03）。
- Mission 3C-2：PASS — Product Owner Accepted（2026-07-03）。
- Mission 3C-3：PASS — Product Owner Accepted（2026-07-04）。
- Phase 3：Completed — Product Owner Accepted（2026-07-04）。
- Mission RR-1A：Release Preparation Baseline Complete。
- Mission RR-1B：PASS — Product Owner Accepted（2026-07-07）。
- Mission RR-1C：PASS — Product Owner Accepted / Beta Ready（2026-07-11）。
- Mission RR-1C QA Fixture：PASS — Product Owner Accepted（2026-07-11）。
- UX-06F Author Profile Track：PASS — Product Owner Final Accepted（2026-07-14）。
- Phase 1 的数据库实测与产品验收记录仍需在独立流程中补齐，但不阻塞 v0.1 文档归档。
- 已登录 Author / Reader 的远程浏览器主链路已由 Product Owner 完整复验通过。

## 未完成

- Create/Edit Article、Work/Chapter Delete 与 Rich Text Editor。
- Revision 与状态机。
- 将 Reader fixture `ContentStore` 替换为真实 Supabase Repository（待 Sprint 002A 数据库实测恢复后另行批准）。
- 章节发布选择与标签替换的原子 RPC（本 Mission 未获授权）。
- 实现 Reader 登录流与 Dashboard 实时数据。

## 下一步

- Product Owner 最终验收 UX-06H Step04 Homepage Release Acceptance Slim。
- Homepage Ready for Release = YES；不得继续优化 Homepage 或启动 UX-06I / 新 UX Track。
- UX-06G Work Detail Track 已通过 Product Owner 最终验收并关闭，不继续优化 Work Detail。
- UX-06F Author Profile Track 已通过 Product Owner 最终验收并关闭，不继续优化 Author Profile。
- 不继续优化 Search；不得自动开启新的 UX Track、发布动作或额外 Search 工作。
- UX-06D Archive Track Step01–Step04 已全部通过 Product Owner 验收并关闭，不继续优化 Archive。
- 未获明确授权前不执行 Go / No-Go、不创建 Git tag、不进行发布动作、不进入
  UI Polish、Design Intelligence 或新 Mission。

## 最后更新

2026-07-14

- UX-06H Step04 Homepage Release Acceptance Slim completed against the frozen Step01–Step03 baseline.
- Step01 Audit Contract、Step02 Layout Upgrade and Step03 Slim QA are PASS.
- Quiet Editorial Harbor Entrance、five-region structure、entry / role / isolation、responsive / theme / accessibility evidence are frozen as the final Release baseline.
- Shared Header / Footer、Root Loading / Error Frozen boundary、Auth / Permission / Invitation / login return and data contracts remain unchanged.
- HP-AUDIT-007 remains Frozen；HP-QA-001 remains non-blocking；the stale chunked-cookie warning has no actual functional impact.
- P0 = 0、P1 = 0；Step04 product implementation and data layer changes = NONE.
- Web checks、full `pnpm validate`、167 / 167 tests、all production builds and diff checks pass.
- Homepage Ready for Release = YES；awaiting Product Owner Final Review，and no new UX Track is authorized.

- UX-06H Step03 Homepage States & Responsive QA Slim completed under the UX closure slim mode.
- Five-region rhythm、entry smoke、Guest / Reader / Author、Author Header Studio capability、Published-only and Draft isolation pass.
- 1440 / 1280 / 768 / 390、Light / Dark、44px targets、focus、semantics、zero overflow and browser console 0 pass.
- HP-AUDIT-007 remains Frozen；HP-QA-001 remains non-blocking；the stale chunked-cookie warning was not reproduced and did not affect actual behavior.
- P0 = 0、P1 = 0、Step02 regression = 0；no Allowed Fix was needed，product implementation and data layer changes = NONE.
- Web checks、full `pnpm validate`、167 / 167 tests、all production builds and diff checks pass.
- Homepage Ready for Step04 = YES；awaiting Product Owner review，and UX-06H Step04 is not authorized.

- UX-06H Step02 Homepage Layout Upgrade completed within the frozen Step01 contract.
- Homepage now follows Brand Orientation → Discovery Paths → Latest Published Works → Reader Return / Access → Quiet Recovery.
- Static Reader Login and misleading `/author` entry were removed；Archive / Search hierarchy、neutral Auth paths、single Work Detail entry、Empty recovery、44px targets and long-content protection are complete.
- Existing Public Browse Gateway、newest / three-item limit、BrowseWork、Auth / Permission、Published-only and Draft isolation remain unchanged.
- Guest / Reader / Author、routes、Draft Work / Chapter isolation、1440 / 1280 / 768 / 390、Light / Dark、focus、semantics、zero overflow and console 0 pass.
- HP-AUDIT-001–006 / 008–009 are Closed；007 remains a frozen shared-state boundary；010 protection passes；HP-QA-001 is non-blocking.
- Web checks、full `pnpm validate`、167 / 167 tests、all production builds and diff checks pass.
- Homepage Layout Ready for Step03 = YES；awaiting Product Owner review，and UX-06H Step03 is not authorized.

- UX-06H Step01 Homepage UI Audit & Design Contract completed as a documentation-only Mission.
- Homepage is frozen as the Quiet Editorial Harbor Entrance with Brand Orientation → Discovery Paths → Latest Published Works → Reader Return / Access → Quiet Recovery.
- Default、Archive / Search / Work / Auth、Guest / Reader / Author、Published-only、Draft isolation、1280 / 390、Light / Dark and console 0 pass.
- Web checks、full `pnpm validate`、167 / 167 tests、all production builds and diff checks pass.
- HP-AUDIT-001–010 record P2 presentation / shared-state boundaries；P0 = 0，P1 = 0.
- Product implementation、data fetch、Auth、Permission、Gateway、Service、Repository、query and database contracts remain unchanged.
- Homepage Ready for Step02 = YES；awaiting Product Owner review，and UX-06H Step02 is not authorized.

- Product Owner accepted UX-06G Step01–Step04 and closed the Work Detail Track with Work Detail Ready for Release = YES.

- UX-06G Step04 Work Detail Release Acceptance completed against the frozen Step01–Step03 baseline.
- Step01 / Step02 / Step03 are PASS and frozen as the final Work Detail Release baseline.
- Literary Work Decision Space、six-region structure、states、roles、reading entries、routes、Published-only、Draft isolation、viewports、themes and accessibility pass.
- `reading-history-client.tsx` remains presentation-only for Work Continue Reading；history data logic and Reading are unchanged.
- WD-AUDIT-001 / 009 remain accepted frozen boundaries；WD-AUDIT-010 passes；WD-QA-001 remains non-blocking；P0 / P1 and remaining product issues are zero.
- Step04 changed documentation only；Web checks、full validation、167 / 167 tests、all builds and diff checks pass.
- Work Detail Ready for Release = YES；awaiting Product Owner final review，and no new UX Track is authorized.

- UX-06G Step03 Work Detail States & Responsive QA completed against the frozen Step02 baseline.
- Six-region structure、default / no-chapter / Loading / Error contract / Not Found、Start / Continue / Download and recovery paths pass.
- Guest / Reader / Author、Auth / Permission frozen boundary、Published-only and Draft Work / Chapter isolation pass.
- 1440 / 1280 / 768 / 390、Light / Dark、44px targets、semantics、focus-visible、zero overflow and browser console 0 pass.
- `reading-history-client.tsx` remains presentation-only for Work Continue Reading；history data logic、selection and Reading are unchanged.
- WD-AUDIT-001 / 009 remain accepted boundaries；WD-AUDIT-010 passes；WD-QA-001 remains non-blocking；P0 / P1 and Step02 remaining product issues are zero.
- Step03 changed documentation only；Web checks、full validation、167 / 167 tests、all builds and diff checks pass.
- Work Detail Ready for Step04 = YES；awaiting Product Owner review，and UX-06G Step04 is not authorized.

- UX-06G Step02 Work Detail Layout Upgrade completed within the frozen Step01 contract.
- Work Detail now follows Work Orientation → Story Premise → Author / Published Context → Reading Decision → Chapter Overview → Recovery.
- Guest / Reader / Author、cross-route entries、Start / Continue / Download、Published-only and Draft isolation pass.
- Default、No Chapters、Loading、Not Found、1440 / 1280 / 768 / 390、Light / Dark、44px targets、zero overflow and browser console 0 pass.
- WD-AUDIT-002–008 are closed for presentation；WD-AUDIT-001 / 009 remain accepted boundaries；WD-QA-001 is a non-blocking Fixture enhancement.
- Step02 changed Work Detail route-local UI only；data、Auth、Permission、Gateway、Service、Repository、query and Reading behavior are unchanged.
- Web checks、`pnpm validate`、167 / 167 tests、all production builds and diff checks pass；Work Detail Layout Ready for Step03 = YES.
- Awaiting Product Owner review；UX-06G Step03 is not authorized.

- UX-06G Step01 Work Detail UI Audit & Design Contract completed as a documentation-only Mission.
- Work Detail is frozen as a Literary Work Decision Space between discovery and Reading.
- Archive / Search / Author Profile entries、Author / Reading exits、Guest / Reader / Author、Published-only and Draft isolation pass.
- 1280 / 390 zero overflow、semantic structure and browser console 0 pass；P0 = 0，P1 = 0，WD-AUDIT-001–010 are P2 findings.
- Step01 changed no product implementation、data、Auth、Permission、Gateway、Service、Repository or query contract.
- Web checks、`pnpm validate`、167 / 167 tests、all production builds and diff checks pass；Work Detail Ready for Step02 = YES.
- Awaiting Product Owner review；UX-06G Step02 is not authorized.

- Product Owner accepted UX-06F Step01–Step04 and closed the Author Profile Track with Ready for Release = YES.

- UX-06F Step04 Author Profile Release Acceptance completed against the frozen Step01–Step03 baseline.
- Final positioning、structure、states、roles、Follow restoration、routes、Published-only、Draft isolation、viewports、themes and accessibility pass.
- Browser console errors are zero；P0 / P1 and Author Profile product P2 / post-Beta findings are zero.
- AP-QA-001 remains only a non-blocking extreme-content QA Fixture enhancement.
- Step04 changed no product implementation、Follow business、data contract、permission or data layer.
- Web checks、`pnpm validate`、167 / 167 tests、all production builds and diff checks pass；Author Profile Ready for Release = YES.
- Awaiting Product Owner final review；no next UX Track is authorized.

- UX-06F Step03 Author Profile States & Responsive QA completed against the frozen Step02 baseline.
- Guest、Reader followed / unfollowed / pending、Author self、cross-page routes、Published-only and Draft isolation pass.
- Real Profile-shaped Loading、Empty / Error contracts、four viewports、themes、focus、44px targets and console 0 pass.
- AP-QA-001 remains a non-blocking extreme-content Fixture enhancement；no product P2 / post-Beta finding remains.
- Step03 changed no product implementation、Follow business、data contract、permission or data layer.
- Web checks、`pnpm validate`、167 / 167 tests、all production builds and diff checks pass；Author Profile Ready for Step04 = YES.
- Awaiting Product Owner review；UX-06F Step04 is not authorized.

- UX-06F Step02 Author Profile Layout Upgrade completed within the frozen Step01 contract.
- Public identity、bio and Published Works now lead；relationship and counts remain supporting.
- 44px Work entries、publishedAt、recovery、Profile-shaped Loading and single-owner Error are implemented route-locally.
- Roles、cross-page routes、Published-only、Draft isolation、four viewports、themes、focus and console 0 pass.
- Product changes are limited to Author Profile UI；data、permission、Follow business and contracts remain unchanged.
- Web checks、`pnpm validate`、167 / 167 tests、all production builds and diff checks pass；Author Profile Layout Ready for Step03 = YES.
- Awaiting Product Owner review；UX-06F Step03 is not authorized.

- UX-06F Step01 Author Profile UI Audit & Design Contract browser audit completed.
- Public identity、bio、Follow / self states、Published Works、cross-page routes、roles and Draft isolation pass.
- 1280 / 390 are zero overflow and browser console errors are zero；10 P2 findings recorded，P0 / P1 are zero.
- Product implementation and all data / permission / Follow contracts remain unchanged.
- Web checks、`pnpm validate`、167 / 167 tests、all production builds and diff checks pass；Author Profile Ready for Step02 = YES.
- Awaiting Product Owner review；UX-06F Step02 is not authorized.

- Product Owner completed final acceptance of UX-06E Search Track with PASS.
- Step01 / Step02 / Step03 / Step04 are all Accepted；Search Ready for Release = YES.
- P0 / P1 are zero，all findings are closed，and Search P2 / post-Beta risk is zero.
- UX-06E is Completed / Closed；no Search optimization or next UX Track is authorized.

- UX-06E Step04 Search Release Acceptance final browser QA completed.
- Step01 / Step02 / Step03 are PASS and frozen as the Release baseline.
- All states、GET q contract、four viewports、themes、accessibility、roles、Published-only、Draft isolation and routes pass with zero clean-session console errors.
- All Search findings remain closed；P0 / P1 are zero，and Step04 changed no product implementation.
- Web checks、`pnpm validate`、167 / 167 tests、all production builds and diff checks pass；Search Ready for Release = YES.
- This pending decision was subsequently resolved by Product Owner Final Acceptance：PASS.

- UX-06E Step03 Search States & Responsive QA browser verification completed.
- Initial / Query / Empty / Invalid / Loading / Error / Results、four viewports、themes、roles、Published-only and Draft isolation pass.
- Fixed one route-local Error clear recovery issue in `search/error.tsx`；data、permission and query contracts remain unchanged.
- Web checks、`pnpm validate`、167 / 167 tests and all production builds pass；P0 / P1 are zero and Search Ready for Step04 = YES.
- UX-06E Step04 is not authorized.

- UX-06E Step02 Search Layout Upgrade completed within the frozen Step01 contract.
- Route-local Search hierarchy、Work / Author presentation、states、44px targets and responsive behavior are upgraded.
- Guest / Reader / Author、Published-only and Draft isolation browser QA pass with zero console errors.
- `pnpm validate`、167 / 167 tests and all production builds pass；Search Layout Ready for Step03 = YES.
- Product implementation changed only in Search presentation；data、permission and query contracts remain unchanged.
- Awaiting Product Owner review；UX-06E Step03 is not authorized.

- UX-06E Step01 Search UI Audit & Design Contract completed as documentation-only work.
- Search / Archive boundary, input, Work / Author results, states, responsive and accessibility contracts are recorded.
- Product implementation and Search data / permission contracts remain unchanged.
- Search Ready for Step02 = YES；awaiting Product Owner review，Step02 is not authorized.

- Product Owner confirmed Mission RR-1C PASS.
- QA Fixture and Author / Reader permission chains are accepted.
- Reader `/studio` redirects to `/archive`; Release Candidate is Beta Ready.
- Mission RR-1C is formally closed; no next Mission or release action is authorized.

- RR-1C local QA Fixture repair engineering complete.
- Local clean rebuild recovery, Reader/Author login and permission Browser QA pass.
- Credentials remain in a Git-ignored mode-0600 local file; no production change.

- Mission RR-1C Release Candidate engineering complete.
- Final Runtime, Migration, SQL, Validation, Browser QA, Mobile QA and
  Documentation audits pass with P0 at zero.
- Product Owner accepted Release Candidate baseline:
  `8495bded5e0c78985be7410cceb902cd2c090421`.
- Beta Ready Checklist and Release Candidate Report are created.
- Mission RR-1C is Product Owner Accepted and closed.

2026-07-07

- Product Owner confirmed `Mission RR-1B. PASS` after final Production
  Deployment acceptance.
- Accepted Production URL, HTTPS, Environment Variables, Production Build, Home,
  Archive, Search, Author, Published Work, Sitemap, Robots, Metadata, Canonical,
  Open Graph, Browser Smoke, Console, Network and Responsive Layout.
- Mission RR-1B is formally closed. RR-1C Release Candidate remains unauthorized
  and unstarted.

2026-07-04

- Mission RR-1A Release Preparation engineering completed with Runtime,
  Migration, Validation, Build, Documentation and Project Structure audits.
- Clean local rebuild, six SQL suites, local schema lint, local/remote 14/14
  migration parity and `pnpm validate` pass with P0 at zero.
- Release and Browser QA checklists are established; Known Issues are classified.
- RR-1A established the preparation baseline; RR-1B was later accepted and RR-1C
  remains unstarted.

- Product Owner confirmed `Mission 3C-3. PASS` after final Sitemap, Robots,
  Published-only, Author/Work inclusion, metadata, canonical, Open Graph,
  Draft-noindex, responsive, browser and clean-console acceptance.
- Mission 3C-3 and Mission 3C are formally closed. Phase 3 is Completed —
  Product Owner Accepted.
- RR-1 remains unauthorized and unstarted.

- Mission 3C-3 SEO Foundation engineering completed with sitemap, robots,
  canonical URLs, Open Graph and route-specific public metadata.
- Sitemap and metadata reuse existing Published-only read boundaries; Draft and
  Studio routes are noindex. No migration or permission change was introduced.
- Local/remote Migration histories remain 14/14 aligned; full validation and
  desktop/390px Browser QA pass with 167 tests, zero console errors and P0 at zero.
- Mission 3C-3 now awaits Product Owner acceptance; RR-1 was not started.

- Product Owner confirmed `Mission 3C-2. PASS`; Browse Experience is accepted
  and formally closed.
- Archive, Published-only isolation, pagination, four sorts, URL restoration,
  boundary correction, all page states, responsive layout, accessibility,
  Browser QA and clean console were accepted.
- Mission 3C-3 is named SEO Foundation and remains unauthorized and unstarted.

- Mission 3C-2 Browse Experience engineering completed with public
  published-only Archive pagination, deterministic sorting and shareable URL
  state.
- Local/remote Migration histories are 14/14 aligned; full validation and
  desktop/390px Browser QA pass with P0 at zero.
- Mission 3C-2 was subsequently accepted; Mission 3C-3 was not started.

- Product Owner confirmed `Mission 3C-1. PASS`; Search MVP is accepted and closed.
- Mission 3C-2 was subsequently authorized under its approved Browse Experience brief.

- Mission 3C-1 Search MVP engineering completed with public Published Work and
  Author title/name/slug matching, URL synchronization and complete page states.
- Local/remote Migration histories are 13/13 aligned; full validation and
  desktop/390px Browser QA pass with P0 at zero.
- Mission 3C-2 is Product Owner accepted and closed.

- Product Owner confirmed `Mission 3B. PASS`; Mission 3B is accepted and closed.
- Final validation passes, P0 is zero, and local/remote Migration histories are
  12/12 aligned.
- `main` and `origin/main` point to the same commit, while the accepted Phase 2
  through Mission 3B implementation remains uncommitted under KI-018.
- Mission 3C startup check is complete. Its existing Roadmap scope is Level 2;
  development remains prohibited until formal authorization.

- Phase 3 Reader / Author Studio acceptance fixes engineering complete.
- Remote and local migration histories are 12/12 aligned; the public Author and
  owner-scoped Studio read RPCs are deployed.
- Product Owner browser acceptance completed and passed on 2026-07-03.

- Mission 3B Social Relationship Foundation engineering completed.
- Added public Author Profile, idempotent Follow / Unfollow and own-only
  Invitation Relationship summary contracts.
- Local rebuild, SQL Runtime, full `pnpm validate`, Browser QA and remote 10/10
  Migration parity passed.
- Mission 3B now waits for one Product Owner acceptance; Mission 3C and RR-1 were
  not started.

- Product Owner updated Phase 3 governance to the V1 Fast Launch Strategy.
- Reorganized the roadmap into Phase 3A Beta Blocking, Phase 3B Beta Operations,
  Phase 3C Beta Polish and independent Release Readiness.
- Renumbered current references to `3A-*`, `3B-*`, `3C-*` and `RR-1`, with legacy
  number mapping preserved in the Fast Launch plan.
- Added planned `3B-3 Invitation Relationship`.
- No Sprint was started and no business code was changed.

- Product Owner accepted Sprint 002C-Step03 on 2026-07-01.
- `/studio/articles/[articleId]` read-only Article Detail passed engineering acceptance; owner ID comes only from `TrustedAccessContext.identity.id`, while other-author and unknown article IDs return Not Found.
- Reader remains published-only and every article write entrypoint remains disabled.
- Full workspace lint/typecheck, 55/55 Vitest tests and Web production build pass.
- package.json, pnpm-lock.yaml and Supabase configuration remain unchanged; Supabase was not executed and DB Runtime remains pending.
- Sprint 002C-Step04 engineering implementation completed with explicit Studio empty, Not Found, no-chapter and draft-only chapter states plus safe recovery navigation.
- Full workspace lint/typecheck, 58/58 Vitest tests and Web production build pass; Reader remains published-only and all write entrypoints remain disabled.
- Product Owner accepted Sprint 002C-Step04 on 2026-07-01 after the empty/error/boundary-state review and forced verification passed.
- Sprint 002C-Step05 Freeze & Handoff is complete; Sprint 002C is frozen and can be formally closed.
- Sprint 002D-Step01 Create Work UI Shell engineering implementation is complete with client-only validation, fixture metadata and disabled save/publish actions.
- Product Owner authorized Sprint 002D-Step02 Create Work Draft Persistence and the minimal V1 taxonomy/RPC Level 3 changes.
- Step02 engineering now includes database-backed metadata reads and atomic draft persistence; Publish remains disabled.
- Full workspace lint/typecheck, 74/74 Vitest tests and Web production build pass.
- Local Supabase rebuild, all six Migrations, V1 taxonomy idempotence and the full Phase 2 transactional SQL suite pass.
- Sprint 002D-Step02 and Sprint 002A database validation are Accepted; Runtime Pending is removed.
- Sprint 002E-Step01 Minimal Draft Editor read contract and UI shell are engineering complete; full verification is recorded in the Sprint document.
- Sprint 002E-Step02 Draft Body Save is complete: owner Authors can save draft body content into the first Chapter, first save creates a default Chapter, Publish remains disabled, and no new RPC/schema/RLS change beyond the minimal Chapter body grant was introduced.
- Full workspace lint/typecheck, 86/86 Vitest tests, Web production build, local Supabase migration reset and the Phase 2 SQL suite pass on the current files.
- Sprint 002F Minimal Publish Workflow is complete: owner Authors can publish their own draft Work from the draft editor, Reader can immediately read the published chapter page, and the existing published-only contract remains intact.
- Full workspace lint/typecheck, full Vitest, Web production build, local Supabase reset and the extended Phase 2 SQL suite pass on the current files.
- Sprint 002G Public Reading is complete: `/articles/[slug]` now uses the same hybrid published gateway as the Work routes, Reader public reads consistently prefer database-backed published content, and draft content remains isolated.
- Full workspace lint/typecheck, full Vitest and Web production build pass on the current files; no new database-side validation was required because 002G introduced no Migration, RPC, RLS or schema change.
- Sprint 002H Bookshelf / Library is complete: `/works` now acts as the Reader Library Hub with local shelf summaries, continue-reading, latest-bookmark shortcuts and minimal client-side filtering over published content.
- Full workspace lint/typecheck, full Vitest and Web production build pass on the current files; no new database-side validation was required because 002H introduced no Migration, RPC, RLS or schema change.
- UX-06C Step 02 is Product Owner accepted and formally closed. Step 03 remains unauthorized.
- Chapter Reading now combines the accepted responsive typography rhythm with progressive disclosure: the complete existing settings controls are hidden by default behind one accessible `Aa / 阅读设置` entry.
- Reader preference values、local storage、theme behavior、published-only access、navigation、history and bookmark contracts remain unchanged.
