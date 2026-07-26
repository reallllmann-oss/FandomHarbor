# Fandom Harbor V1 Production Release Closure

状态：`PASS WITH LEGAL REVIEW PENDING AND DEPLOYMENT REQUIRED / PDR-01 OWNER DECISION COMPLETE — DEPLOYMENT AND SMOKE PENDING / PDR-02 CLOSED FOR CURRENT RELEASE / DEPLOYMENT NOT AUTHORIZED`
日期：2026-07-25
Release：V1 Invitation-only Reader Beta Policy Release

## 1. 当前权威状态

本文件是 2026-07-25 当前 Release 状态的统一索引。旧文档中保留的历史阶段结论不删除，但如与本节冲突，以本文件、`.ai/PROJECT_STATUS.md` 顶部当前状态、`V1-PUBLIC-POLICY-WEB-ACCEPTANCE.md` 和 `V1-SUPABASE-BACKUP-EVIDENCE.md` 的最新结论为准。

| 项目                                | 当前状态                                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| 当前阶段                            | Production 已运行；准备发布新的 Public Policy Web 改动并收口 Invitation-only Reader Beta |
| Production URL                      | 正式自定义域名可访问；精确 hostname 尚未写入当前 Release 证据                            |
| Vercel Production Web               | 正常                                                                                     |
| Supabase Production                 | 基础连接正常，Free                                                                       |
| Reader cohort                       | 25 个 Reader 账号                                                                        |
| Reader Production Smoke             | PASS — 正式域名登录与 Published Chapter 阅读通过                                         |
| Author publishing loop              | PASS — 创建、保存、Draft isolation、发布与 Reader 回读已有证据                           |
| Public Policy engineering           | IMPLEMENTATION COMPLETE — V1.0 Owner decisions applied                                   |
| Public Policy approval              | OWNER DECISION COMPLETE                                                                  |
| Public Policy Production deployment | NOT RUN                                                                                  |
| Public Policy Production smoke      | NOT RUN                                                                                  |
| PDR-01                              | OWNER DECISION COMPLETE / DEPLOYMENT AND SMOKE PENDING                                   |
| PDR-02                              | CLOSED FOR CURRENT RELEASE                                                               |
| Platform backups / PITR             | 0 / false                                                                                |
| Current fresh backup                | PASS — 2026-07-25 22:38:50 +08:00，仓库外                                                |
| Storage                             | 0 buckets / 0 actual objects                                                             |
| Admin Preview                       | BLOCKED — independent external Vercel line                                               |
| Secret Audit                        | Owner Decision Application PASS；精确 RC 提交前须重跑                                    |
| Production Deployment Authorized    | NO                                                                                       |
| Release Approved                    | NO                                                                                       |

## 2. 工作区初始状态

Owner Decision Application Mission 开始时：

- Modified：15 个。
- Untracked：14 个。
- `git diff --check`：PASS。
- 工作区混有 Public Policy、Release / Backup、Admin Preview 和历史政策文件，不能直接作为 Deployment source。
- 本 Mission 未 reset、checkout、restore、clean、stash、移动、删除、暂存、提交或推送任何既有文件。

## 3. modified / untracked 文件分类

分类：

- **A — Public Policy Web Implementation**
- **B — Backup and Release Documentation**
- **C — Admin Preview / Admin App**
- **D — Existing Product Changes**
- **E — Unknown or Needs Review**

“RC”列中的 `APP` 表示候选应用运行时文件，`SUPPORT` 表示 Release 证据 / 治理文件，`NO` 表示不得纳入本次 RC。所有 APP 文件仍以 Owner 决策应用后的最终 diff 为准。

| 文件                                                      | 状态      | 类别 | RC      | 发布前提交 | 与当前 Production 无关 | 部署风险                       | 单独 Mission              |
| --------------------------------------------------------- | --------- | ---- | ------- | ---------- | ---------------------- | ------------------------------ | ------------------------- |
| `.ai/CHANGELOG.md`                                        | modified  | B    | SUPPORT | 是         | 否                     | 低；状态准确性                 | 否                        |
| `.ai/MEMORY.md`                                           | modified  | B    | SUPPORT | 是         | 否                     | 低；状态准确性                 | 否                        |
| `.ai/PROJECT_STATUS.md`                                   | modified  | B    | SUPPORT | 是         | 否                     | 中；错误 Gate 会导致误部署     | 否                        |
| `apps/admin/src/app/access/actions.ts`                    | modified  | C    | NO      | 否         | 是                     | 高；混入 Admin 行为变更        | 是 — Admin                |
| `apps/admin/src/app/access/page.tsx`                      | modified  | C    | NO      | 否         | 是                     | 高；混入 Admin UI              | 是 — Admin                |
| `apps/web/next.config.ts`                                 | modified  | A    | APP     | 条件是     | 否                     | 中；`/legal` redirect 改变路由 | 是 — Decision Application |
| `apps/web/src/app/auth/sign-up/page.tsx`                  | modified  | A    | APP     | 条件是     | 否                     | 高；注册页声明同意政策         | 是 — Decision Application |
| `apps/web/src/lib/seo.test.ts`                            | modified  | A    | APP     | 条件是     | 否                     | 低；政策 sitemap test          | 是 — Decision Application |
| `apps/web/src/lib/seo.ts`                                 | modified  | A    | APP     | 条件是     | 否                     | 中；公开 sitemap               | 是 — Decision Application |
| `docs/19_Release/V1-DEPLOYMENT-SMOKE-TEST.md`             | modified  | B    | SUPPORT | 是         | 否                     | 低；Smoke 口径                 | 否                        |
| `docs/19_Release/V1-PRODUCTION-PREPARATION.md`            | modified  | B    | SUPPORT | 是         | 否                     | 中；含历史冲突                 | 否                        |
| `docs/19_Release/V1-PRODUCTION-READINESS-REVIEW.md`       | modified  | B    | SUPPORT | 是         | 否                     | 中；含历史冲突                 | 否                        |
| `docs/19_Release/V1-RELEASE-DEPLOYMENT.md`                | modified  | B    | SUPPORT | 是         | 否                     | 中；Deployment 入口文档        | 否                        |
| `packages/ui/src/components/layouts.tsx`                  | modified  | A    | APP     | 条件是     | 否                     | 中；共享 Layout / Footer       | 是 — Decision Application |
| `packages/ui/src/styles.css`                              | modified  | A    | APP     | 条件是     | 否                     | 中；共享 Footer 响应式样式     | 是 — Decision Application |
| `apps/admin/src/app/access/actions.test.ts`               | untracked | C    | NO      | 否         | 是                     | 中；Admin test 与代码成组      | 是 — Admin                |
| `apps/web/src/app/_components/public-policy.tsx`          | untracked | A    | APP     | 条件是     | 否                     | 高；页面状态、版本与联系信息   | 是 — Decision Application |
| `apps/web/src/app/content-policy/page.tsx`                | untracked | A    | APP     | 条件是     | 否                     | 高；政策实质内容               | 是 — Decision Application |
| `apps/web/src/app/legal/page.tsx`                         | untracked | A    | APP     | 条件是     | 否                     | 中；兼容 redirect              | 是 — Decision Application |
| `apps/web/src/app/privacy/page.tsx`                       | untracked | A    | APP     | 条件是     | 否                     | 高；隐私与保留承诺             | 是 — Decision Application |
| `apps/web/src/app/terms/page.tsx`                         | untracked | A    | APP     | 条件是     | 否                     | 高；主体、责任与争议条款       | 是 — Decision Application |
| `docs/19_Release/V1-PRODUCTION-DEPLOYMENT-REVIEW.md`      | untracked | B    | SUPPORT | 是         | 否                     | 中；含历史状态                 | 否                        |
| `docs/19_Release/V1-PUBLIC-POLICY-DRAFT.md`               | untracked | E    | NO      | 否         | 是                     | 高；历史 Draft / Superseded    | 否；保留历史              |
| `docs/19_Release/V1-PUBLIC-POLICY-V1.0.md`                | new       | A    | SUPPORT | 是         | 否                     | 中；当前唯一正式规范源         | 否                        |
| `docs/19_Release/V1-PUBLIC-POLICY-WEB-ACCEPTANCE.md`      | untracked | A    | SUPPORT | 是         | 否                     | 低；Owner Review 证据          | 否                        |
| `docs/19_Release/V1-PUBLIC-POLICY.md`                     | untracked | E    | NO      | 否         | 是                     | 高；Legacy / Superseded        | 否；保留历史              |
| `docs/19_Release/V1-SUPABASE-BACKUP-EVIDENCE.md`          | untracked | B    | SUPPORT | 是         | 否                     | 低；PDR-02 证据                | 否                        |
| `docs/19_Release/V1-SUPABASE-RECOVERY-RUNBOOK.md`         | untracked | B    | SUPPORT | 是         | 否                     | 低；Recovery 文档              | 否                        |
| `docs/19_Release/V1-PUBLIC-POLICY-OWNER-DECISION-PACK.md` | new       | B    | SUPPORT | 是         | 否                     | 低；27 项 Owner 决策记录       | 否                        |
| `docs/19_Release/V1-PRODUCTION-RELEASE-CLOSURE.md`        | new       | B    | SUPPORT | 是         | 否                     | 低；当前状态权威索引           | 否                        |

Category D 结论：没有发现独立于 Public Policy 与 Admin 的新产品代码改动。共享 UI 的 Footer 改动已归入 A；不得把它误记为无关样式变化。

## 4. 当前 Release Candidate 边界

### 4.1 条件性 APP 候选

以下 11 个运行时文件构成 Public Policy Web 的精确应用候选；Owner Decision Application 已完成，仍须在独立 RC Mission 中隔离 Admin 改动并固定 SHA：

1. `apps/web/next.config.ts`
2. `apps/web/src/app/auth/sign-up/page.tsx`
3. `apps/web/src/lib/seo.ts`
4. `apps/web/src/lib/seo.test.ts`
5. `apps/web/src/app/_components/public-policy.tsx`
6. `apps/web/src/app/privacy/page.tsx`
7. `apps/web/src/app/terms/page.tsx`
8. `apps/web/src/app/content-policy/page.tsx`
9. `apps/web/src/app/legal/page.tsx`
10. `packages/ui/src/components/layouts.tsx`
11. `packages/ui/src/styles.css`

### 4.2 SUPPORT 候选

- 当前唯一正式政策源 `V1-PUBLIC-POLICY-V1.0.md`。
- `V1-PUBLIC-POLICY-WEB-ACCEPTANCE.md`
- `V1-PUBLIC-POLICY-OWNER-DECISION-PACK.md`
- `V1-PRODUCTION-RELEASE-CLOSURE.md`
- PDR-02 Backup Evidence 与 Recovery Runbook。
- 当前 Release / Smoke 文档及 `.ai` 状态文件。

### 4.3 不应纳入本次 Release

- `apps/admin/src/app/access/actions.ts`
- `apps/admin/src/app/access/page.tsx`
- `apps/admin/src/app/access/actions.test.ts`
- 已标记 LEGACY / SUPERSEDED 的 `V1-PUBLIC-POLICY.md`
- 已标记 Historical Input / Superseded 的 `V1-PUBLIC-POLICY-DRAFT.md`
- 任何数据库 dump、Manifest、一次性备份脚本或仓库外备份目录
- 任何本 Mission 未审计的新文件

## 5. Release Gate Matrix

| Gate                                        | 当前状态                        | 证据来源                                                       | 阻挡 Reader Beta               | 阻挡未来 Author Beta           | Owner 操作 | 下一动作                                         |
| ------------------------------------------- | ------------------------------- | -------------------------------------------------------------- | ------------------------------ | ------------------------------ | ---------- | ------------------------------------------------ |
| GATE-01 Production 自定义域名               | PASS                            | Current Confirmed Facts；Reader formal-domain Smoke            | 否                             | 否                             | 是         | 将精确 hostname 写入获批 Deployment / Smoke 记录 |
| GATE-02 Vercel Production Web               | PASS；Policy update 未部署      | Current Confirmed Facts；现有 Production 可访问                | 否；GATE-10 单独阻挡新 Release | 否                             | 否         | 保持配置不变，等待精确 RC                        |
| GATE-03 Supabase Production 连接            | PASS                            | Current Confirmed Facts；linked project / Reader Smoke         | 否                             | 否                             | 否         | 不变更                                           |
| GATE-04 Reader 注册和登录                   | PASS                            | 25 Reader；Production Reader Smoke                             | 否                             | 否                             | 否         | Policy deploy 后回归                             |
| GATE-05 Reader 已发布章节读取               | PASS                            | 正式域名 Published Chapter Smoke                               | 否                             | 否                             | 否         | Policy deploy 后回归                             |
| GATE-06 Reader 权限隔离                     | PASS                            | `studio/layout.tsx`、身份 capability tests、历史 Reader denial | 否                             | 否                             | 否         | 保持 Reader 无 `work:author`                     |
| GATE-07 Author 发布闭环                     | PASS                            | `V1-RELEASE-FLOW-OPTIMIZATION.md`；Studio actions / tests      | 否                             | 否                             | 否         | Author Beta 前再做目标环境 Smoke                 |
| GATE-08 Public Policy Web 工程实现          | IMPLEMENTATION COMPLETE         | `V1-PUBLIC-POLICY-WEB-ACCEPTANCE.md`；11 个 APP 文件           | 否                             | 否                             | 否         | 在独立 RC Mission 固定 SHA                       |
| GATE-09 Public Policy Owner Approval        | OWNER DECISION COMPLETE         | Decision Pack；`V1-PUBLIC-POLICY-V1.0.md`                      | 否                             | 否                             | 否         | 保持法律审阅状态准确                             |
| GATE-10 Public Policy Production Deployment | NOT RUN                         | 本地文件存在；Production 未包含新路由                          | 是                             | 是                             | 是         | 精确 RC 后单独授权 deploy                        |
| GATE-11 Public Policy Production Smoke      | NOT RUN                         | Smoke checklist                                                | 是                             | 是                             | 是         | 正式域名验证 3 页、Footer、注册入口与 redirect   |
| GATE-12 Current Production Database Backup  | PASS / CLOSED                   | `V1-SUPABASE-BACKUP-EVIDENCE.md`                               | 否                             | 否                             | 否         | 部署窗口过期或数据变化较大时重评新鲜度           |
| GATE-13 Recovery Runbook                    | DOCUMENTED / DRY RUN NOT RUN    | `V1-SUPABASE-RECOVERY-RUNBOOK.md`                              | 否                             | 条件否                         | 否         | 后续独立恢复演练 Mission                         |
| GATE-14 Storage 状态                        | PASS — EMPTY                    | Owner 确认 0 buckets / 0 objects                               | 否                             | 否                             | 否         | 启用上传前增加对象备份                           |
| GATE-15 Secret Audit                        | PASS；pre-commit rerun required | Owner Decision Application final scan                          | 否                             | 否                             | 否         | 精确 RC 上重跑                                   |
| GATE-16 Admin Preview                       | BLOCKED — independent           | `V1-ADMIN-VERCEL-SUPPORT-EVIDENCE.md`                          | 否                             | 条件是；仅当 Author 治理依赖它 | 是         | 独立 Support / Admin Mission                     |
| GATE-17 Product Owner Final Acceptance      | PENDING                         | 本 Closure 与 Decision Pack                                    | 是                             | 是                             | 是         | Policy deploy + Smoke 后最终签字                 |

## 6. PDR 状态

### PDR-01

`OWNER DECISION COMPLETE / DEPLOYMENT AND SMOKE PENDING`

必须分开记录：

- 页面工程实现：IMPLEMENTATION COMPLETE。
- 政策 Owner 决策：COMPLETE，DECISION-01–27 已应用。
- 独立法律审阅：NOT COMPLETED；Owner 已接受有限 Reader-only Beta 风险。
- Production Deployment：NOT RUN。
- 正式域名访问 / 链接 Smoke：NOT RUN。

PDR-01 的 Owner Decision Gate 已关闭，但部署和 Production Smoke Gate 仍未关闭；不得将其写为 Release Approved。

### PDR-02

`CLOSED FOR CURRENT RELEASE`

- 新鲜备份时间：2026-07-25 22:38:50 +08:00。
- 位置：Git repository 外。
- Schema / Data exit：0 / 0。
- 文件、SHA-256、15 / 15 表、COPY、权限、Manifest 与 Git 边界：PASS。
- 本 Mission 未重复执行备份，不降级 PDR-02。

## 7. 政策来源冲突

### 当前唯一正式政策规范来源

`docs/19_Release/V1-PUBLIC-POLICY-V1.0.md`

它应用 Product Owner 2026-07-25 的 DECISION-01–27，版本为 V1.0，批准日期为 2026-07-25，生效方式为正式网站发布之日起生效，并准确记录独立法律审阅 `NOT COMPLETED`。

### 历史冲突文件

| 文件 / 记录                                 | 冲突摘要                                                                                              | 建议                                                        |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `V1-PUBLIC-POLICY.md`                       | 声称版本 V1、批准日期 2026-07-16、生效于 Production launch，并披露 Supabase Singapore；与当前决定冲突 | 已保留并标记 LEGACY / SUPERSEDED，不再作为规范源            |
| `V1-PUBLIC-POLICY-DRAFT.md`                 | 包含 Draft / Pending、占位主体、90/180/365 天及旧内容边界                                             | 已保留并标记 Historical Input / Superseded，不再作为规范源  |
| Release 文档 2026-07-16 段落                | 多处写 PDR-01 CLOSED、政策已 final、Production / Smoke 未运行                                         | 保留为历史；当前状态只引用本 Closure 顶部与最新日期段       |
| Production 文档旧域名记录                   | 写“无 Custom Domain”、默认 `vercel.app`，与当前正式自定义域名可访问冲突                               | 标记历史配置；下一 Deployment Mission 记录精确当前 hostname |
| Policy Web Acceptance 的 PDR-02 “unchanged” | 只描述当时 Policy Mission，不是当前 PDR-02                                                            | 保留历史；当前 PDR-02 以 Backup Evidence 为准               |
| `.ai` 较早阶段条目                          | 包含 PDR-01 / PDR-02、Smoke、Deployment 的历史 BLOCKED / CLOSED 状态                                  | 保留时间线；只以顶部当前状态为当前事实                      |

来源冲突已关闭：只有 `V1-PUBLIC-POLICY-V1.0.md` 被标记为当前规范源；两个历史文件均保留且具有清晰 superseded 关系。

## 8. 政策与实际产品行为对照

| 行为                              | 当前产品证据                                                    | 当前政策                                           | 结论                   |
| --------------------------------- | --------------------------------------------------------------- | -------------------------------------------------- | ---------------------- |
| Guest Homepage / Archive / Search | 无 Session guard；仅 Published browse / search                  | Guest 可发现 Published 作品                        | 一致                   |
| Guest 公开作者信息                | Search / Author public gateway 仅映射 Published 作者字段        | 明确仅限当前产品允许匿名查看的公开作者信息         | 一致                   |
| Guest Work Detail                 | 无 Session 重定向 `/auth/sign-in`                               | 登录 + 有效权限                                    | 一致                   |
| Guest Chapter / Article           | 无 Session 重定向 `/auth/sign-in`                               | 登录 + 有效权限                                    | 一致                   |
| Reader 内容访问                   | active Membership 获得 `archive:read`                           | 有效账号及访问权限                                 | 一致                   |
| Reader `/studio`                  | 无 `work:author` 时重定向 `/archive`；导航不显示 Studio         | Reader 不自动成为 Author                           | 一致，建议最终文案明确 |
| Author 创建 / 保存 / 发布         | Studio capability guard、actions、tests 与历史 E2E PASS         | 允许获准用户创作、发布                             | 一致                   |
| 邀请码注册                        | `registrationSchema` 强制 32–256 字符邀请码；注册页必填         | invite-only                                        | 一致                   |
| 注册页政策提示                    | 本地写“完成注册即同意 Terms，并已阅读 Privacy / Content Policy” | V1.0 Owner-approved candidate，与 18+ / 邀请制一致 | 一致；部署仍需单独授权 |
| 阅读偏好 / 书签 / 历史            | 当前主要在浏览器 `localStorage`                                 | 已区分浏览器本地数据与服务器数据                   | 一致                   |
| 独立 Articles                     | Schema / Studio / Reader 路由存在                               | 已纳入访问、处理和保留说明                         | 一致                   |
| 数据处理地区                      | Supabase region 已核对；Vercel 精确处理地区未统一               | 不对未统一核实的完整处理地区作额外承诺             | 一致                   |
| Storage                           | 当前 0 bucket / 0 object                                        | 已记录当前空状态及逻辑备份不含对象                 | 一致；未来启用时更新   |

## 9. 当前 Release Blocker

1. 精确 Release Candidate 尚未在独立工作区隔离；Admin 文件仍与 Policy / Release 文件混在当前工作区。
2. 尚未获得 commit 和 push 授权。
3. 尚未在精确 RC SHA 上获得 Production Deployment 授权。
4. Public Policy Production Deployment 未执行。
5. 正式自定义域名上的三个政策页面、Footer、注册入口与 `/legal` redirect Smoke 未执行。
6. Product Owner Final Acceptance 未签署。

独立法律审阅仍为 `NOT COMPLETED`；Owner 已接受有限 Reader-only Beta 风险，因此它不单独阻挡当前有限 Beta，但在外部 Author、公开注册或扩大运营前必须重新评估。PDR-02、现有 Reader Smoke、Author publishing loop、Storage 空状态和 Admin Preview 也不是当前 Reader Policy Release 的新增硬 Blocker。

## 10. Product Owner Action

1. 审阅 Owner Decision Application 的最终 diff、验证结果和精确 RC 文件清单。
2. 通过独立 Mission 明确是否授权隔离 RC、commit 和 push。
3. 在固定的精确 RC SHA 上明确是否授权 Production Policy Deployment。
4. 部署后审阅正式域名 Policy Smoke 证据。
5. 在 Smoke 通过后签署 Reader Beta Final Acceptance 或明确拒绝。

## 11. 部署前最小动作

- [x] Product Owner 完成全部必须政策决策。
- [x] 确认唯一政策来源。
- [x] 更新正式政策版本与批准状态。
- [x] 更新批准日期与明确生效方式。
- [x] 从当前页面移除 Draft / Pending 标识。
- [x] 确认运营主体和正式联系邮箱。
- [x] 修正政策与实际 Guest / Reader / localStorage / Articles 的不一致或歧义。
- [x] 确认 11 个 Policy APP 文件的最终范围。
- [ ] 隔离 3 个 Admin 文件。
- [ ] 固定 Release Candidate 文件清单与干净 RC SHA。
- [x] 执行 format、lint、typecheck、tests、Production build、`git diff --check` 和 Secret Audit。
- [ ] 获得明确 commit / push / deploy 授权。
- [ ] 部署 Policy 页面。
- [ ] 通过正式自定义域名验证 `/privacy`、`/terms`、`/content-policy`。
- [ ] 验证 Footer、注册页链接、`/legal` redirect、metadata、sitemap、Light / Dark、desktop / mobile 和 Console。
- [ ] Product Owner 完成最终验收并明确 Release Approved / Not Approved。

## 12. Admin Preview

Admin Preview 继续 `BLOCKED — EXTERNAL PLATFORM / SUPPORT`，但它不是 Reader-only Beta 的直接 Release Blocker：

- 现有正式文档明确将 Admin Preview 与 Web 主线分开。
- Reader 注册、登录、Published 阅读与 Studio denial 不依赖 Admin Preview。
- Author001 的受控授权与 Author publishing loop 已有 PASS 证据。
- 若未来 Author Beta 的日常治理必须依赖远程 Admin UI，Admin Preview 可成为该阶段的条件 Gate；当前 Reader Policy Release 不因此阻塞。

Admin 三个工作区文件必须从本次 RC 排除，并由独立 Admin Mission 处理。

## 13. 下一项 Mission

推荐：

`Production Policy Release Candidate Commit and Deployment Preparation`

原因：DECISION-01–27 已应用，下一步需要隔离 11 个 Policy APP 文件和获批 SUPPORT 文件，排除 Admin / Legacy / Backup 实物，固定干净 RC SHA，并分别取得 commit、push 与 deployment 授权。本 Mission 本身不执行这些操作。

## 14. 最终结论

- Mission：`PASS WITH LEGAL REVIEW PENDING AND DEPLOYMENT REQUIRED`
- 可以进入 Policy Release Candidate 提交与部署准备：`YES`
- 可以进入 Product Owner Final Acceptance：`NO`
- 可以执行 Production Deployment：`NO`
- PDR-01：`OWNER DECISION COMPLETE / DEPLOYMENT AND SMOKE PENDING`
- PDR-02：`CLOSED FOR CURRENT RELEASE`
- Production Deployment Authorized：`NO`
- Release Approved：`NO`

本 Closure 不批准政策、不批准 Release、不授权 commit / push / deploy，也不改变 Production。
