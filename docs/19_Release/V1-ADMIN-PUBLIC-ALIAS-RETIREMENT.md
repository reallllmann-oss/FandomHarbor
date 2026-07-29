# Fandom Harbor Admin Public Alias Protection / Retirement

状态：Step01 `AUDIT PASS WITH MANUAL CHECKS`；Step02 `PASS WITH OWNER MANUAL VERIFICATION`；Step03 `AUDIT PASS WITH RESIDUAL DEPLOYMENT COUPLING`；Step06 `CLOSED — PAUSED ADMIN RETAINED WITH ACCEPTED RESIDUAL DEPLOYMENT COUPLING`

Audit Date：2026-07-29（Asia/Shanghai）

Mission：Step01 Current State Audit；Step02 Reversible Project Pause；Step03 Web / Admin Complete Decoupling Verification；Step06 Final Closure（Paused Project Retention）

## Audit Scope

本 Step 只读核对 Admin Vercel Project、公开入口、Deployment、匿名访问、登录与 Admin 权限边界、敏感凭据迹象，以及与 Web Production 的依赖关系。

本 Step 没有：

- 删除、修改或新增 Alias / Domain。
- 删除、取消、暂停、恢复或新建 Deployment。
- 删除、暂停、恢复或修改 Vercel Project。
- 修改 Deployment Protection、Production Branch、Git Integration、环境变量或 Build 设置。
- 触发 Deploy、Redeploy、Promote、Rollback 或 Git push。
- 修改产品代码、Supabase、数据库、Auth、RLS、RPC、用户、角色或邀请码。
- 读取、输出或记录 Secret、Token、Cookie、密码或环境变量值。

## Git Baseline

审计开始时：

| 项目 | 结果 |
| --- | --- |
| Current branch | `release/v1-public-policy-v1.0` |
| Current HEAD | `eec3403c716ed27ddb59601146f640cf6ad6e5e1` |
| Branch upstream | `origin/release/v1-public-policy-v1.0` |
| Upstream ahead / behind | `0 / 0`；当前分支没有未推送 commit |
| `origin/main` | `ab031bc944335548e4c486534c96aa757d6b94b7` |
| HEAD vs `origin/main` | 双方已分叉：HEAD 独有 4 个 commit，`origin/main` 独有 13 个 commit |
| Working tree | Dirty |
| Existing modified | `apps/admin/src/app/access/actions.ts`、`apps/admin/src/app/access/page.tsx` |
| Existing untracked | `apps/admin/src/app/access/actions.test.ts` |
| Initial `git diff --check` | PASS |

以上三个 Admin 文件是审计开始前已存在的 Product Owner 工作区内容。本 Step 未修改、暂存、提交、移动、stash、restore、checkout、reset 或删除它们。

本审计将 `origin/main` 的 V1.0.2 Release Closure 视为正式发布权威基线，同时保留当前工作区基线，不把当前旧 Release branch 冒充为 `main`。

## Vercel Project Baseline

| 项目 | 当前证据 |
| --- | --- |
| Team | `fandom-harbor` |
| Team plan | `Hobby`（Dashboard 显示） |
| Admin Project | `fandom-harbor-admin` |
| Admin Project ID | 当前本地关联不可得；`.vercel/project.json` 指向 Web Project，不得冒充 Admin ID |
| Git Repository | `reallllmann-oss/FandomHarbor` |
| Framework | Next.js |
| Root Directory | `apps/admin` |
| Current Production Branch | `admin-production-disabled`；V1.0.2 Closure 权威记录，且当前 `main` push 被列为 Preview，与此一致 |
| Frozen Production Commit | `e137c31f260d761fc2fdd6ebd9f7f0e30cf5630a` |
| Current Production Deployment | `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` |
| Current Preview Deployment | `dpl_7BvuyTBkvqp8JMNVy8D7pCGSuNkJ` |
| Custom Domain | 未发现 |
| Retention | Dashboard 显示 Deployment Retention 已启用，部分 Deployment 将按保留策略自动删除 |
| Active list | 9 个 `READY`：3 Production、6 Preview |
| Deleted / Cancelled history | 存在；2026-07-15 证据包记录 4 次 `CANCELLED / DELETED` 尝试，Dashboard 当前也提供 `View Recently Deleted` |

当前本地 `.vercel/project.json` 安全确认的是：

- Project=`fandom-harbor-web`
- 它不是 Admin Project，不能用于 Admin API 或变更。
- 本 Step 未重新 Link，也未尝试借 Web Project ID 操作 Admin。

### Current Production

| 项目 | 值 |
| --- | --- |
| Deployment | `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` |
| Environment | Production / Current / Ready / Stale |
| Branch | `main`（该 Deployment 当时的 source branch） |
| Commit | `e137c31f260d761fc2fdd6ebd9f7f0e30cf5630a` |
| Commit subject | `docs(release): record v1.0.1 password visibility readiness` |
| Created | `2026-07-26 15:33:54 UTC` / `2026-07-26 23:33:54 +08:00` |
| Duration | 34s |

“Source branch=`main`”是该历史 Deployment 的来源；不表示当前 Production Branch 仍为 `main`。当前 Production Branch 已由 V1.0.2 Closure 记录为 `admin-production-disabled`。

### Current Preview

| 项目 | 值 |
| --- | --- |
| Deployment | `dpl_7BvuyTBkvqp8JMNVy8D7pCGSuNkJ` |
| Environment | Preview / Ready |
| Branch | `main` |
| Commit | `ab031bc944335548e4c486534c96aa757d6b94b7` |
| Commit subject | `docs(release): close v1.0.2 production release` |
| Dashboard created label | 审计时 `18m ago` |
| Duration | 11s |

该记录说明：冻结 Admin Production Branch 阻止了 `main` 更新 Admin Production，但没有阻止 `main` 继续生成 Admin Preview。

## Public Admin URL Inventory

### Confirmed Project / Branch Aliases

| URL | URL type | Project | Deployment | Branch | Commit | State |
| --- | --- | --- | --- | --- | --- | --- |
| `https://fandom-harbor-admin.vercel.app` | Project Domain / Production Alias | `fandom-harbor-admin` | `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` | `main` at deployment time | `e137c31f...` | Public; Fandom Harbor login required |
| `https://fandom-harbor-admin-git-main-fandom-harbor.vercel.app` | Generated Branch Alias | `fandom-harbor-admin` | `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` | `main` | `e137c31f...` | Vercel Authentication required |

Current Production Deployment detail explicitly maps both aliases above to `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs`.

### Confirmed Generated Deployment URLs

| Deployment URL | Deployment | Environment | Branch | Commit | Dashboard created label | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `https://fandom-harbor-admin-lz3a2ewfz-fandom-harbor.vercel.app` | `dpl_7BvuyTBkvqp8JMNVy8D7pCGSuNkJ` | Preview | `main` | `ab031bc944335548e4c486534c96aa757d6b94b7` | `18m ago` | Ready |
| `https://fandom-harbor-admin-7oq7gravc-fandom-harbor.vercel.app` | `dpl_GRPc5MKHTBBF8u26t6hSy4oPFsFe` | Preview | `main` | `9ede1c6813e658ea8d7197c74a6ab2703cd0b528` | `22h ago` | Ready |
| `https://fandom-harbor-admin-pnx6kzqjh-fandom-harbor.vercel.app` | `dpl_AbV24vDLzDYjX2seLRWyxXiVeqUj` | Preview | `release/v1.0.2-invitation-code-visibility-20260727-223728` | `9ede1c6813e658ea8d7197c74a6ab2703cd0b528` | `1d ago` | Ready |
| `https://fandom-harbor-admin-50s7y1vaa-fandom-harbor.vercel.app` | `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` | Production | `main` | `e137c31f260d761fc2fdd6ebd9f7f0e30cf5630a` | exact time above | Ready |
| `https://fandom-harbor-admin-7vmfxjk2c-fandom-harbor.vercel.app` | `dpl_7NdRN2XpYxMqWExbzxZ8wNhgyzyG` | Preview | `release/v1.0.1-password-visibility-20260726-223941` | `e137c31f260d761fc2fdd6ebd9f7f0e30cf5630a` | `3d ago` | Ready |
| `https://fandom-harbor-admin-q13o6zj1g-fandom-harbor.vercel.app` | `dpl_HNvDpcgkm5TSSaKcVN16jFK3mAUK` | Production | `main` | `14f9af1c0b4fc440daab26fba9f2eb513f56142f` | `Jul 26` | Ready |
| `https://fandom-harbor-admin-jm0xc24eo-fandom-harbor.vercel.app` | `dpl_65zByCRinrC5pUg4JmFSoCJubvkz` | Preview | `release/v1-public-policy-v1.0` | `eec3403c716ed27ddb59601146f640cf6ad6e5e1` | `Jul 26` | Ready |
| `https://fandom-harbor-admin-h0oyf1okm-fandom-harbor.vercel.app` | `dpl_ASKqwi85crviseAGFxTQ5EDui2hR` | Preview | `codex/v1-production-release-record` | `47c32766e76d5b2ffeee6312e2632b616e633811` | `Jul 17` | Ready |
| `https://fandom-harbor-admin-p9n1d5s27-fandom-harbor.vercel.app` | `dpl_CEb8pBpSMTEd9QVD8Am19kt21yct` | Production | `codex/v1-production-rc-final` | `0ea87709e7e63c6d1a378a5d798fb05f6c2a749f` | `Jul 16` | Ready |

以上是 Dashboard 当前列表明确暴露的全部 9 个 Ready Deployment URL。

### Possible Additional Generated Branch Aliases

Vercel 会为 Git branch 生成 `VERCEL_BRANCH_URL`。Dashboard 当前 Production detail 明确显示 `git-main` Alias，但本环境无法从其他 Deployment detail 稳定提取所有长 branch alias 的精确 hostname。

不得猜测或拼接这些 hostname。必须在变更前执行：

`OWNER MANUAL CHECK REQUIRED`

- Project → Deployments → 逐个打开当前每个 branch 的最新 Deployment → Domains。
- 或在已登录 CLI / API 中只读执行 Alias list，完整导出 hostname → Deployment 映射。
- 特别核对：
  - `release/v1.0.2-invitation-code-visibility-20260727-223728`
  - `release/v1.0.1-password-visibility-20260726-223941`
  - `release/v1-public-policy-v1.0`
  - `codex/v1-production-release-record`
  - `codex/v1-production-rc-final`

## Alias-to-Deployment Mapping

当前明确的活动生产映射：

```text
fandom-harbor-admin.vercel.app
  └─ dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs
     ├─ Production / Current / Ready
     ├─ source branch: main
     └─ commit: e137c31f260d761fc2fdd6ebd9f7f0e30cf5630a

fandom-harbor-admin-git-main-fandom-harbor.vercel.app
  └─ dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs
```

没有发现 Admin Custom Domain。`www.fandomharbor.com` 不在该 Project 的当前 Deployment domain list 中。

## Anonymous Access Result

匿名检查使用隔离浏览器，不携带现有 Vercel Dashboard 登录状态，也没有 Fandom Harbor Session。

| URL / category | 结果 | 分类 |
| --- | --- | --- |
| `fandom-harbor-admin.vercel.app` | 进入 `https://fandom-harbor-admin.vercel.app/auth/sign-in`，title=`Fandom Harbor Admin` | 无需 Vercel 登录；需要 Fandom Harbor 登录 |
| `fandom-harbor-admin-git-main-fandom-harbor.vercel.app` | 跳转 `vercel.com/login?...`，title=`Login – Vercel` | 需要 Vercel Authentication |
| current Production Deployment URL `...50s7y1vaa...` | 跳转 Vercel Login | 需要 Vercel Authentication |
| current Preview Deployment URL `...lz3a2ewfz...` | 跳转 Vercel Login | 需要 Vercel Authentication |
| V1.0.2 release Preview URL `...pnx6kzqjh...` | 跳转 Vercel Login | 需要 Vercel Authentication |
| older Production Deployment URL `...q13o6zj1g...` | 跳转 Vercel Login | 需要 Vercel Authentication |
| 其余生成的 Deployment URL | 当前 Standard Protection 应统一保护；未逐个重复请求 | `OWNER MANUAL CHECK REQUIRED` for individual spot-check |

本地匿名 HTTP 客户端无法连接 `*.vercel.app:443`；这只记录为本地网络限制，未被误写为 URL 不可访问。

### What an Anonymous User Can See

在公开 Project Domain 上，匿名用户可以看到：

- Fandom Harbor Admin 品牌与页面 title。
- “Admin access / 管理员登录”。
- 仅 active Admin / Super Admin 可进入的说明。
- 注册名输入框、密码输入框和登录按钮。
- 登录失败或 forbidden 的通用错误信息。

匿名用户不能从该页面直接看到：

- 用户、Membership、Role Grant、邀请码或 Audit Log 数据。
- Admin dashboard 数据。
- Supabase Secret、Service Role Key、数据库凭据或环境变量值。

风险仍然存在：

- Admin 入口、品牌、登录字段和权限模型对公众可发现。
- 公开登录端点扩大凭据猜测、撞库、流量消耗和钓鱼仿冒面。
- “出现登录页”不等于 Admin 已受 Vercel Production Protection。

## Authenticated Access Boundary

部署 Commit `e137c31f...` 的代码边界：

1. `/` 和 `/access` 首先要求 Supabase Session。
2. Session 存在后读取服务端 Access Context。
3. 必须具有 `admin:operate` capability。
4. 普通 Reader / Author 登录会被立即 sign out，并返回 `/auth/sign-in?error=forbidden`。
5. `/access` Server Actions 再次执行 Session 与 `admin:operate` 检查。
6. 数据库 Membership / Role RPC 再次验证当前 actor 权限并写 Audit Log。
7. Admin 不能授予或撤销 `admin` / `super_admin`；该能力需要 `super_admin`。
8. 数据库保留 final active Super Admin 防护。

当前没有可安全复用的 Admin Session 或专用只读测试账号；本 Step 也禁止通过修改用户、角色或真实数据来验证。因此：

`OWNER MANUAL CHECK REQUIRED`

- Product Owner 使用现有已批准 Admin 账号访问公开 Project Domain。
- 确认成功进入 `/`。
- 确认 `/access` 可访问。
- 只查看页面，不提交 Grant / Revoke / Membership 表单。
- 另用 Reader 或 Author 账号确认被返回 forbidden；不得改角色。
- 记录 URL、结果与时间，不记录账号、密码、Session、Cookie 或用户身份信息。

## Sensitive Exposure Review

### Runtime Credential Model

Admin runtime 只读取：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- 可选 `NEXT_PUBLIC_SITE_URL`

代码使用 Supabase SSR public client、用户 Session/JWT、RLS 与受控 RPC。没有 Admin runtime Service Role client，也没有 Service Role 环境变量合同。

### Secret Pattern Review

- 对 `origin/main` 与 deployed Admin Commit `e137c31f...` 执行高风险模式扫描。
- 匹配只落在配置测试与本地 QA 脚本中的变量名 / 测试合同；没有发现真实 Secret 值进入 tracked source 的迹象。
- `.env.local` 与 `.vercel/` 均被 Git 忽略。
- 根目录与 Web local env 权限为 `0600`。
- `apps/admin/.env.local` 只列两个设计为浏览器可用的 public Supabase 变量；本 Step 只读变量名，未读取值。
- 未发现公开页面把环境变量值、Session、Cookie、Token 或数据库连接串渲染到 HTML。

结论：

`NO SENSITIVE DATA OR HIGH-PRIVILEGE CREDENTIAL EXPOSURE EVIDENCE FOUND`

该结论不等于对 Vercel Dashboard 环境变量值完成证明。变更前仍需 Owner 在 Project → Settings → Environment Variables 只核对变量名称、类型与 scope，禁止点开或复制值，并确认不存在 Service Role / database password / bypass secret。

## Web Production Dependency Review

| Dependency | Admin / Web relationship | Retirement impact |
| --- | --- | --- |
| Vercel Project | 独立 Project：`fandom-harbor-admin` vs `fandom-harbor-web` | Admin-only Project mutation不应改变 Web Project |
| Production domain | Admin=`fandom-harbor-admin.vercel.app`；Web=`www.fandomharbor.com` | 无直接 routing / domain 依赖 |
| Git repository | 共用 monorepo | Git push 可能同时触发两个 Project；本 Step 不 push |
| Source packages | 共用 `packages/*` | 删除 Alias / pause Project 不修改 source |
| Supabase | 共用 Production Supabase / Auth / Database | Admin 停止访问不会修改数据库；Admin 登录恢复后仍使用同一身份与 RLS |
| Environment names | 两端使用相同 public Supabase变量合同 | Admin Project 环境变量属于独立 Vercel Project |
| Reader-only Beta | 只依赖 Web Project 与 Web domain | Admin pause / protection / alias retirement 不应影响 Reader Beta |

本 Step 的只读 Web 回归结果：

- `https://www.fandomharbor.com/` → HTTP 200。
- `https://fandomharbor.com/` → HTTP 308，目标为 `https://www.fandomharbor.com/`。

### Operation Boundaries

只影响 Admin Vercel Project、且不应触发 Deployment：

- 改变 Admin Deployment Protection。
- Pause / Resume Admin Project。
- 移除 Admin-only Alias / Domain。
- 删除 Admin-only historical Deployment。

可能触发新的 Admin 或 Web Deployment：

- Push / merge / force-push 任一被 Git Integration 跟踪的 branch。
- 修改 Production Branch 后再 push 对应 branch。
- Redeploy / Promote / Rollback。
- 更改会触发重新部署的 Vercel Build / Git 配置。

本审计未发现 Web 页面、产品代码或运行时配置引用 Admin URL。仓库中的 Admin URL 引用只出现在 Release / 运维文档。

## Protection Options

### A. Vercel Deployment Protection

当前匿名结果与 Vercel Authentication + Standard Protection 的官方行为一致：

- 观察到 Preview、generated Deployment URL 与 Branch URL 受保护。
- Hobby plan 的 Production Project Domain 保持公开。
- 该配置值是基于当前访问行为的强推断；Dashboard 控件值仍需 Owner 手工确认。

Vercel 官方说明：

- Standard Protection 不保护 Production Domain。
- All Deployments 会保护 Production Domain，但需要 Pro / Enterprise；Pro 可能还需要 Advanced Deployment Protection add-on。
- Protection 对现有 Deployment 按请求即时生效，不需要 Redeploy。

评估：

| 维度 | 结论 |
| --- | --- |
| 可行性 | Standard 已存在；All Deployments 取决于升级 / add-on |
| 是否阻止当前公开 Project Domain | Standard=NO；All Deployments=YES |
| 是否影响 Web | NO，若仅改 Admin Project |
| 是否触发 Deployment | NO |
| 可逆性 | 高 |
| 成本 | 可能需要付费计划 / add-on |
| 适用 | 需要继续由 Vercel Team 成员远程使用 Admin |

参考：

- <https://vercel.com/docs/deployment-protection>
- <https://vercel.com/docs/deployment-protection/methods-to-protect-deployments>

不得重新生成 Protection Bypass for Automation secret，不得新增 Shareable Link 或 Protection Exception。

## Retirement Options

### B. Remove Public Alias, Keep Deployment

- 目标是只移除 `fandom-harbor-admin.vercel.app`，保留 `dpl_AVT...`。
- 不触发 Deployment，不影响 Web。
- 但该 hostname 是 Vercel 自动 Production Project Domain，不是普通自定义域名。
- Vercel `.vercel.app` hostname 按先到先得分配，移除后不保证能原样恢复；Project 也可能需要另一个 Production Domain。
- 因此必须先在 Domains 页面确认该默认 domain 是否提供安全 Remove / Delete，以及移除后的平台行为。

评估：`CONDITIONALLY FEASIBLE / REVERSIBILITY NOT GUARANTEED`

### C. Pause Admin Project

Vercel 官方 Pause Project 行为：

- Production Deployment 对访问者返回 `503 DEPLOYMENT_PAUSED`。
- Project、Deployment、Domains、环境变量与设置保留。
- Resume 后几分钟内恢复，不需要 Redeploy。

当前生成 Deployment URL 已受 Standard Protection，因此 Pause Production 后可同时关闭唯一确认公开的 Production Project Domain。

评估：

| 维度 | 结论 |
| --- | --- |
| 阻止公开 Admin | YES；Production 返回 503 |
| 保留恢复路径 | YES |
| 是否影响 Web | NO，若精确选择 Admin Project |
| 是否触发 Deployment | NO |
| 可逆性 | 高；Resume 不需要 Redeploy |
| 是否删除数据 | NO |

参考：<https://vercel.com/docs/projects/managing-projects>

### D. Delete Historical Admin Deployments

以下 8 个非当前 Production Deployment 可在单独授权下退役，不会影响 Web：

- `dpl_7BvuyTBkvqp8JMNVy8D7pCGSuNkJ`
- `dpl_GRPc5MKHTBBF8u26t6hSy4oPFsFe`
- `dpl_AbV24vDLzDYjX2seLRWyxXiVeqUj`
- `dpl_7NdRN2XpYxMqWExbzxZ8wNhgyzyG`
- `dpl_HNvDpcgkm5TSSaKcVN16jFK3mAUK`
- `dpl_65zByCRinrC5pUg4JmFSoCJubvkz`
- `dpl_ASKqwi85crviseAGFxTQ5EDui2hR`
- `dpl_CEb8pBpSMTEd9QVD8Am19kt21yct`

删除这些 Deployment：

- 不应触发新 Deployment。
- 不影响 `www.fandomharbor.com`。
- 会失去对应 Admin build artifact 与 direct URL。
- 不解决当前公开 Project Domain，因为它仍指向 `dpl_AVT...`。

当前 `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` 应保留为 Resume recovery artifact。只有在 Alias 已安全移除或 Project 已明确永久退休，且 Owner 接受失去无部署恢复路径后，才考虑删除。

### E. Delete Entire Admin Project

- 会删除 Project 的 Deployments、Domains、环境变量和设置。
- 不触发 Web Deployment，但恢复成本最高。
- 当前不满足“可逆”和“保留未来重新启用路径”。

评估：`NOT RECOMMENDED`

### F. Keep Project, Fully Isolate Future Deployments

当前 `admin-production-disabled` 已隔离 Production，但没有阻止 `main` 产生 Preview。

完整隔离需要单独设计并授权：

- 独立 Admin deployment branch。
- 禁止 `main` 为 Admin Project 自动生成 Preview。
- 核对 Preview Branch Tracking / Ignore Build Step / Git Integration。
- 不 push 冻结分支，不改指 frozen commit。

设置变更本身通常不需要 Deployment；但任何后续 branch push 可能创建 Deployment。不得在本 Step 实施。

### G. Accept Current Risk

当前没有发现匿名管理数据或高权限凭据泄露，登录与 RLS 边界存在；但 Admin 登录端点、品牌与权限说明仍公开。

评估：可继续运行 Reader Beta，但不满足“尽可能阻止公众访问 Admin”的目标。

## Recommended Path

### Primary Recommendation — Reversible Retirement

推荐先执行：

`Pause only the Vercel Project fandom-harbor-admin`

原因：

- 精确阻止唯一确认公开的 Production Project Domain。
- 已有 Standard Protection 继续保护 generated Deployment / Branch URLs。
- 不删除 Alias、Deployment、Project、环境变量或设置。
- 不修改 Supabase、Auth、RLS 或产品代码。
- 不影响 `www.fandomharbor.com` 或 Reader-only Beta。
- 不触发新 Deployment。
- Resume 不需要 Redeploy，恢复路径最清晰。

### Alternative — Protected Continued Use

如果 Product Owner 仍需远程使用 Admin：

1. 保持 Project active。
2. 升级到支持 All Deployments 的方案。
3. 对 Admin Project 启用 Vercel Authentication + All Deployments。
4. 不创建 bypass secret、exception 或 shareable link。
5. 以隔离浏览器确认 Production Project Domain 转到 Vercel Login。

该路径不需要 Redeploy，但可能产生计划 / add-on 成本。

### Not Recommended as First Move

- 不先删 `dpl_AVT...`。
- 不先删整个 Project。
- 不把删除历史 Deployment 当成 Production Alias 保护。
- 不仅依赖隐藏 / 重命名 URL。
- 不继续把“出现 Fandom 登录页”当成充分保护。

## Reversibility / Recovery Plan

Pause 路径：

1. 记录 Pause 前的 Project、Production Deployment、Domain、Production Branch。
2. Pause `fandom-harbor-admin`。
3. 匿名确认 `fandom-harbor-admin.vercel.app` 返回 503。
4. 保留 `dpl_AVT...`、Alias、Project settings 和环境变量。
5. 恢复时在同一 Admin Project 执行 Resume Service。
6. 等待几分钟并重新验证。
7. 不需要 Redeploy，不需要修改 Supabase。

All Deployments Protection 路径：

1. 记录当前 Standard Protection。
2. 切换 Admin Project 到 Vercel Authentication + All Deployments。
3. 匿名确认 Project Domain 和 generated URL 都要求 Vercel Login。
4. 回退时恢复 Standard Protection；不需要 Redeploy。

Alias Removal 路径：

- 只有在 Owner 确认 default `.vercel.app` domain 可重新分配、且接受 hostname 可能无法原样恢复后才能执行。
- 恢复可能需要重新添加 / 分配 domain；不能承诺保留原 hostname。

## Required Owner Authorization

### Before Any Change — Manual Checks

以下为 `OWNER MANUAL CHECK REQUIRED`：

1. Vercel → `fandom-harbor` → `fandom-harbor-admin` → Settings → General：
   - 记录 Project ID。
   - 只读确认 Framework=`Next.js`、Root Directory=`apps/admin`。
2. Settings → Git：
   - 确认 Production Branch=`admin-production-disabled`。
   - 确认 Preview Branch Tracking 与 `main` 自动 Preview 行为。
3. Settings → Deployment Protection：
   - 确认 Method=`Vercel Authentication`。
   - 确认 Scope=`Standard Protection`。
   - 确认没有 Protection Exception、Shareable Link 或 Automation Bypass。
4. Settings → Domains：
   - 导出全部 Project Domain / Branch Alias / Custom Domain。
   - 确认 `fandom-harbor-admin.vercel.app` 的 type 与 Remove 能力。
5. Deployments：
   - 对 9 个 Ready Deployment 记录精确 created timestamp。
   - 逐个核对所有 generated branch aliases。
   - 打开 `View Recently Deleted`，记录当前 Deleted / Cancelled IDs 与 retention deadline。
6. Settings → Environment Variables：
   - 只核对名称、type、scope；不展开或复制值。
   - 确认不存在 Service Role Key、database password 或 bypass secret。
7. Product Owner Admin read-only smoke：
   - Admin 登录后可进入 `/` 与 `/access`。
   - 不提交任何管理表单。
   - Reader / Author 被 forbidden。

### Separate Change Authorization — Recommended

Product Owner 若采纳主推荐，下一 Step 的准确授权应为：

1. 只对 `fandom-harbor-admin` 执行 Pause Project。
2. 不 Pause `fandom-harbor-web`。
3. 不删除或修改任何 Alias / Domain。
4. 不删除任何 Deployment。
5. 不删除 Project。
6. 不修改 Production Branch、Git Integration、Build、环境变量或 Supabase。
7. 不 Deploy / Redeploy / Promote / Rollback。
8. Pause 后只执行匿名 503 验证与 Web Production 回归。

若 Product Owner 要继续远程使用 Admin，则必须另行明确授权：

1. 计划 / add-on 成本。
2. Admin Project 的 All Deployments Protection。
3. Vercel Authentication method。
4. 禁止 bypass / exception / shareable link。

历史 Deployment 删除应作为再下一项独立授权，按 Deployment ID 逐个列明，不得泛化为“清理全部”。

## Evidence Gaps

| Gap | 原因 | 处理 |
| --- | --- | --- |
| Admin Project ID | 本地 `.vercel` 只关联 Web；无已登录 CLI token | Owner Settings → General |
| Protection 设置精确选项 | Dashboard 页面可访问但自动化无法稳定提取控件值 | Owner Settings → Deployment Protection |
| 全部 generated branch aliases | Dashboard list 不显示所有长 hostname；不得猜测 | Owner Deployment detail / Alias list |
| 8 个 Deployment 精确 created timestamp | 当前 list 只显示相对时间 / 日期 | Owner Deployment detail |
| Recently Deleted 精确 IDs | 当前只能确认历史存在与 Dashboard入口 | Owner `View Recently Deleted` |
| Vercel env current names / scopes | 未读取 Dashboard值，避免 Secret暴露 | Owner name/scope-only check |
| Authenticated Admin runtime smoke | 无可安全复用 Admin session / QA account | Owner read-only smoke |
| 每个 generated URL 的单独匿名请求 | 已按 URL category 抽查；未重复访问全部 | Owner spot-check |

## Final Audit Status

`AUDIT PASS WITH MANUAL CHECKS`

已完成：

- 已列出 Dashboard 当前全部 9 个 Ready Admin Deployment URL。
- 已确认 Production Project Domain、`git-main` Branch Alias 与 current Production Deployment 映射。
- 已确认唯一明确公开入口是 `fandom-harbor-admin.vercel.app`。
- 已确认匿名用户看到 Fandom Harbor Admin 登录页，不是 Vercel Login。
- 已确认抽查的 generated Deployment / Branch URLs 要求 Vercel Authentication。
- 已完成代码、RLS / RPC 与敏感凭据迹象审查。
- 已确认 Admin Vercel Project 与 Web Production 没有 Domain / Deployment 直接依赖。
- 已评估 Protection / Alias Removal / Pause / Deployment Retirement / Project Deletion / Branch Isolation / Accept Risk。
- 已给出不触发 Deployment、可逆、保留恢复路径的推荐。

仍需 Owner 手工补齐：

- 精确 Admin Project ID。
- Dashboard 当前 Protection 控件值。
- 全部 branch alias hostname。
- 非 current Deployment 的精确 created timestamp。
- Recently Deleted 精确 ID。
- Admin 登录后的 read-only runtime smoke。

本 Step 到此停止。没有执行 Protection、Pause、Alias Removal、Deployment Retirement 或 Project Deletion。

---

## Step02 Reversible Project Pause

初次安全停止时间：2026-07-29 23:00:45 +0800（Asia/Shanghai）

Owner 完成 Pause：2026-07-29；精确 API 请求时间未提供，见 Evidence Gaps。

暂停后收口验证时间：2026-07-29 23:27:28 +0800（Asia/Shanghai）

最终状态：`PASS WITH OWNER MANUAL VERIFICATION`

### Authorized Target

| 项目 | 已核对值 |
| --- | --- |
| Team | `fandom-harbor`（Dashboard 显示名称 `Fandom Harbor`） |
| Team plan | `Hobby` |
| Admin Project | `fandom-harbor-admin` |
| Admin Project ID | `prj_XceBjIPkuK3vomhnWBA03DGaY8zx` |
| Project Settings URL | `https://vercel.com/fandom-harbor/fandom-harbor-admin/settings` |
| Public Project Domain | `https://fandom-harbor-admin.vercel.app` |
| Current Production Deployment | `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` |
| Current Preview Deployment | `dpl_7BvuyTBkvqp8JMNVy8D7pCGSuNkJ` |
| Web control | `https://www.fandomharbor.com/` |

Dashboard 的 Team、Project breadcrumb、Project Name 与 Project ID 一致，未误入 `fandom-harbor-web`。

### Pause Execution Record

初次执行时，只读检查 Project Settings → General 与 Project Settings → Advanced，未发现 Dashboard `Pause Project` / `Pause Service` 控件，因此按 Mission 安全门停止，没有用 Delete、Spend Management 或未授权 API 方式替代。

随后 Product Owner 确认已在自己的安全环境中通过 Vercel 官方 Project Pause 路径完成：

- Team=`fandom-harbor`。
- Project=`fandom-harbor-admin`。
- 未暂停 `fandom-harbor-web`。
- 未删除 Project、Deployment、Alias 或 Domain。
- 未修改环境变量或 Production Branch。
- 未触发 Redeploy 或新 Deployment。
- 临时 Vercel Access Token 已从终端变量清除，并已在 Vercel 中撤销。

Token 值未提供给本审计、未写入文档、未读取或输出。

### Post-Pause Dashboard Evidence

Vercel Project Overview 的只读证据：

- Team 显示 `Fandom Harbor` / `Hobby`。
- Project breadcrumb 显示 `fandom-harbor-admin`。
- 顶部提示：`The project is paused and your Production Deployment is currently unavailable.`
- `Resume Service` 控件存在；本 Step 未点击。
- Production Project Domain `fandom-harbor-admin.vercel.app` 仍存在。
- Current Production Deployment 仍链接到 `AVTGLwSF48DoEeLSqyadUQjoMFhs`，状态 `Ready`。
- Production source commit 仍为 `e137c31f260d761fc2fdd6ebd9f7f0e30cf5630a`。
- Dashboard 明确显示 Production Branch 为 `admin-production-disabled`。
- Active Branches 中 current Preview 仍链接到 `7BvuyTBkvqp8JMNVy8D7pCGSuNkJ`，状态 `Ready`。

这些证据确认 Project 是“已暂停但保留”，不是已删除，也没有通过删除 Deployment、Domain 或 Alias 达成停服。

### Runtime and Retention Validation

| 检查项 | 结果 |
| --- | --- |
| Admin Project paused | PASS — Dashboard paused banner |
| Dashboard recovery control | PASS — `Resume Service` 存在，未点击 |
| Admin public domain no longer shows login | PASS — Owner manual verification |
| Admin public domain paused response | PASS — Owner 确认 `503`、`DEPLOYMENT_PAUSED` 或等效暂停提示 |
| Independent local Admin HTTP request | EVIDENCE GAP — 当前执行环境到 `vercel.app` 直连超时，未伪报 HTTP code |
| Vercel documented pause behavior | `503 DEPLOYMENT_PAUSED`；`https://vercel.com/docs/projects/managing-projects` |
| Web Production | PASS — `www` HTTP 200 |
| Apex redirect | PASS — HTTP 308 → `https://www.fandomharbor.com/` |
| Admin Project exists | PASS — Dashboard Project Overview 可访问 |
| Production Deployment retained | PASS — `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` / `Ready` |
| Preview Deployment retained | PASS — `dpl_7BvuyTBkvqp8JMNVy8D7pCGSuNkJ` / `Ready` |
| Project Domain retained | PASS — `fandom-harbor-admin.vercel.app` 仍列于 Overview |
| Alias / Domain removed | NO |
| Environment Variables changed | NO — Owner confirmation；未展开或读取值 |
| Production Branch changed | NO — `admin-production-disabled` |
| New Deployment triggered | NO — current Production / Preview IDs 与操作前一致 |
| Product code / Supabase changed | NO |
| Git commit / push triggered | NO |

### Git and Workspace Validation

| 项目 | 收口结果 |
| --- | --- |
| Current branch | `release/v1-public-policy-v1.0` |
| Current HEAD | `eec3403c716ed27ddb59601146f640cf6ad6e5e1` |
| `origin/main` | `ab031bc944335548e4c486534c96aa757d6b94b7` |
| `git diff --check` | PASS |
| Existing modified | `apps/admin/src/app/access/actions.ts`、`apps/admin/src/app/access/page.tsx` |
| Existing untracked | `apps/admin/src/app/access/actions.test.ts` |
| Allowed audit document | `docs/19_Release/V1-ADMIN-PUBLIC-ALIAS-RETIREMENT.md` |

三个既有 Admin 文件的 SHA-256 与 Step02 操作前完全一致：

- `actions.ts`：`75c1174e74d35424768bbdf9f64b7d4b1209c7aab9c8fa97943d8d2a645e1fc1`
- `page.tsx`：`e6937663234d9cf74f5f007e36a267a4976e1008a014c925b40a36012aa11002`
- `actions.test.ts`：`938cad3e1786f981a89da6d5c4bf89105663767ed4a57a00511ccfe755d8c57d`

本 Step 未切换分支、Rebase、Merge、Reset、Stash、Commit、Push 或创建 PR。

### Recovery Path

如未来获得单独恢复授权：

1. 进入 Vercel Team `fandom-harbor`。
2. 打开 Project `fandom-harbor-admin`。
3. 在 Project Overview 使用当前可见的 `Resume Service`。
4. 不执行 Redeploy。
5. 等待服务恢复后验证 Admin 登录页和真实 Admin 权限。
6. 回归验证 `https://www.fandomharbor.com/`。

本 Step 不授权且没有执行 Resume。

### Evidence Gaps / Owner Manual Checks

- Product Owner 未提供 Pause API 的精确请求时间；本记录保留 Owner 完成日期和收口验证时间，不猜测时间戳。
- 当前执行环境到 `fandom-harbor-admin.vercel.app` 的 HTTPS 连接超时，无法独立记录响应头；Admin URL 的 `503 / DEPLOYMENT_PAUSED` 由 Product Owner 手工验证。
- 未读取、输出或保存临时 Access Token；Token 清除与撤销由 Product Owner 确认。
- 未展开 Environment Variable 值，也未逐项重新导出所有历史 Alias；无变更结论来自 Owner 确认及 Dashboard 中 current Domain / Deployment / Branch 保留证据。

### Not Executed

- Alias Removal。
- Deployment Retirement / Deletion。
- Project Deletion。
- Resume。
- Redeploy / Promote / Rollback。
- Git Push / Commit / PR。
- Step04、Step05 或 Step06。

### Step02 Conclusion

`PASS WITH OWNER MANUAL VERIFICATION`

`fandom-harbor-admin` 已暂停；Dashboard 显示 paused 状态与 `Resume Service`，原 Production / Preview Deployment、Project Domain 与 Production Branch 均保留。Product Owner 已手工确认公开 Admin 登录页停止服务并返回 `503 / DEPLOYMENT_PAUSED` 或等效暂停提示。Web Production 保持 HTTP 200，apex 继续以 HTTP 308 跳转到 `www`。

Step02 到此停止，等待 Product Owner 对后续 Alias Removal、Deployment Retirement 或最终 Closure 进行单独授权。

---

## Step03 Web / Admin Complete Decoupling Verification

审计时间：2026-07-29 23:46:51 +0800（Asia/Shanghai）

最终状态：`AUDIT PASS WITH RESIDUAL DEPLOYMENT COUPLING`

### Audit Boundary and Sources

本 Step 只读使用：

- 当前工作区 Git 状态与文件指纹。
- `origin/main=ab031bc944335548e4c486534c96aa757d6b94b7` 的 V1.0.2 Release Closure。
- Step01 完整 Admin Domain / Alias / Deployment 映射。
- Step02 paused banner、`Resume Service`、Production / Preview Deployment 与 Branch 保留证据。
- 当前 Production HTTP GET。
- 当前分支与 `origin/main` 的代码、package graph、Next.js 配置、Supabase client、RLS / RPC 与权限边界。
- Vercel 当前官方 Project Pause、Git 和 Monorepo 文档。

没有读取环境变量值、Token、Cookie、Session、密码或 Secret。

### Git Baseline and Safety

| 项目 | 结果 |
| --- | --- |
| Current branch | `release/v1-public-policy-v1.0` |
| Current HEAD | `eec3403c716ed27ddb59601146f640cf6ad6e5e1` |
| `origin/main` | `ab031bc944335548e4c486534c96aa757d6b94b7` |
| Working tree | 既有 2 modified Admin 文件、1 untracked Admin test、1 允许更新的审计文档 |
| `git diff --check` | PASS |
| Branch / history mutation | NONE |
| Commit / push / PR | NONE |

三个既有 Admin 文件的 SHA-256：

- `apps/admin/src/app/access/actions.ts`：`75c1174e74d35424768bbdf9f64b7d4b1209c7aab9c8fa97943d8d2a645e1fc1`
- `apps/admin/src/app/access/page.tsx`：`e6937663234d9cf74f5f007e36a267a4976e1008a014c925b40a36012aa11002`
- `apps/admin/src/app/access/actions.test.ts`：`938cad3e1786f981a89da6d5c4bf89105663767ed4a57a00511ccfe755d8c57d`

### Vercel Project Separation

| 项目 | Web | Admin | 结论 |
| --- | --- | --- | --- |
| Team | `fandom-harbor` | `fandom-harbor` | 同 Team，不等于同 Project |
| Project | `fandom-harbor-web` | `fandom-harbor-admin` | 独立 |
| Project ID | `prj_jrErEvWbxc1Eq0jGn4vpCewfM8kp` | `prj_XceBjIPkuK3vomhnWBA03DGaY8zx` | 不同 |
| Root Directory | `apps/web` | `apps/admin` | 不同 |
| Production Branch | `main` | `admin-production-disabled` | 不同 |
| Production Deployment | `dpl_GxM3T6HKB7dyyU9fYmXdpmqWpi74` | `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` | 不同 |
| Current known Preview | Web current generated URL 未导出 | `dpl_7BvuyTBkvqp8JMNVy8D7pCGSuNkJ` | 不共享 Deployment |
| Runtime state | Active / HTTP 200 | Paused / Production unavailable | Pause 未传播 |
| Recovery | 当前正常服务 | `Resume Service` | 独立 |

Web Project ID 来自当前本地 `.vercel/project.json`，该文件明确标识 `projectName=fandom-harbor-web`；Admin Project ID 来自 Step02 Dashboard。两者不是同一 Project，也没有共享 Project ID 或 Deployment ID。

### Domain and Alias Map

| URL / Alias | 类型 | Project | Deployment / Routing | 当前状态 |
| --- | --- | --- | --- | --- |
| `https://www.fandomharbor.com/` | Web formal custom domain / Production alias | `fandom-harbor-web` | `dpl_GxM3T6HKB7dyyU9fYmXdpmqWpi74` | HTTP 200 |
| `https://fandomharbor.com/` | Apex redirect | Web domain boundary | HTTP 308 → `https://www.fandomharbor.com/` | 正常 |
| `https://fandom-harbor-web.vercel.app` | Web default Project Domain | `fandom-harbor-web` | Web Project | 历史已确认；当前 generated mapping 未重新导出 |
| `https://fandom-harbor-ilvpjubrm-fandom-harbor.vercel.app` | 历史 Web Preview generated URL | `fandom-harbor-web` | `dpl_2H2tUqGo7UXWrfhSC5FsmoeHGpX8` | 历史证据，不冒充当前 Production |
| `https://fandom-harbor-admin.vercel.app` | Admin default Project Domain / Production alias | `fandom-harbor-admin` | `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` | Paused；Owner 验证 503 |
| `https://fandom-harbor-admin-git-main-fandom-harbor.vercel.app` | Admin `main` Branch Alias | `fandom-harbor-admin` | `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` | Step01 映射；受 Vercel Authentication |
| `https://fandom-harbor-admin-50s7y1vaa-fandom-harbor.vercel.app` | Admin Production generated URL | `fandom-harbor-admin` | `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` | 保留 |
| `https://fandom-harbor-admin-lz3a2ewfz-fandom-harbor.vercel.app` | Admin current Preview generated URL | `fandom-harbor-admin` | `dpl_7BvuyTBkvqp8JMNVy8D7pCGSuNkJ` | 保留 / Ready |

Step01 的 9 个 Ready Admin generated URL 清单仍是完整 Admin URL 基线，本 Step 未删除或重新映射它们。

确认结果：

- `www` 与 apex 只属于 Web 正式域名链路，没有指向 Admin Deployment。
- Admin Project Domain、Branch Alias 和 generated URLs 没有被 Web Domain 使用。
- `origin/main` 与当前工作区的 `apps/web` / `packages/*` 运行时代码均未引用 `fandom-harbor-admin`。
- Web `next.config.ts` 只有 `/legal` → `/terms` redirect，没有 Admin rewrite、redirect 或 proxy。
- 保留 Paused Admin Domain 的新增公开风险主要是 hostname 可发现与 503 指纹；正常 Admin 登录页和应用流量已经停止。
- 删除默认 `.vercel.app` Project Domain 可能失去原 hostname；Vercel 文档说明 `.vercel.app` 名称按先到先得分配，当前无必要承担此不可逆风险。

### Deployment Isolation and Git Fan-Out

两个 Project 连接同一 GitHub Repository：`reallllmann-oss/FandomHarbor`。

V1.0.2 权威实证：

- `main` push 为 Web 创建 Production Deployment `dpl_GxM3T6HKB7dyyU9fYmXdpmqWpi74`。
- 同一次 `main` push 没有更新 Admin Production。
- Admin Production Branch=`admin-production-disabled`，因此 `main` 被 Admin 作为 Preview 处理。
- Admin current Preview=`dpl_7BvuyTBkvqp8JMNVy8D7pCGSuNkJ`，source=`main@ab031bc...`。

因此：

- `admin-production-disabled` 已证明能隔离 Admin Production 更新。
- 它没有阻止 Admin Preview 自动部署。
- Root Directory 不同也没有完全消除 fan-out；V1.0.2 修改了 Web 与 Admin 都声明依赖的 shared packages，Admin Preview 被实际触发。
- Vercel 官方 Monorepo 规则会在 app source、internal dependency 或相关 lockfile 变化时把 Project 判定为 affected。
- `apps/web`-only 或 `apps/admin`-only 变化是否自动 skip 另一 Project，取决于当前 Skip Unaffected / Ignore Build Step 设置；本 Step 无稳定 Dashboard 证据，不猜测。
- Vercel Pause 文档只明确 Production 流量返回 503、Resume 无需 Redeploy，没有明确说明 Pause 会断开 Git integration 或禁止新 Build。因此不能把 Pause 当作部署 fan-out 开关。

结论：运行时、Production 与 Domain 已解耦；Git Repository / shared dependency / Preview build 仍存在残余部署耦合。

### Shared Code Dependency Graph

| Consumer | Direct workspace dependencies |
| --- | --- |
| `apps/web` | `auth`、`config`、`database`、`services`、`ui` |
| `apps/admin` | `auth`、`config`、`database`、`services`、`ui` |
| `packages/database` | `auth`、`config`、`services` |
| `packages/services` | `auth` |
| `packages/auth` | `config` |
| `packages/ui` | React / UI libraries；不依赖 app |

代码检查：

- 未发现 `apps/web` import `apps/admin` 或 `@fandom-harbor/admin`。
- 未发现 `apps/admin` import `apps/web` 或 `@fandom-harbor/web`。
- 未发现 `packages/*` 反向依赖任一 app。
- Web runtime 不需要 Admin route、Admin server action 或 Admin deployment。
- Admin runtime 也不调用 Web runtime；它只与共享 package 和 Supabase 通信。
- Shared package 变化可同时影响两个 build，这是 build-time coupling，不是在线 runtime coupling。
- 保留 `apps/admin` 但暂停 Admin Project，对 Web runtime 没有影响。
- 删除 `apps/admin` 不会删除 Supabase 或 Web Project，但会改变 workspace、lock/build/lint/typecheck 范围及运维文档，必须作为独立代码变更审查；本 Step 未执行。

### Supabase Dependency Audit

| 检查项 | 结果 |
| --- | --- |
| Architecture | Web / Admin 使用一个 Supabase/PostgreSQL domain model |
| Linked Production project | `fandom-harbor`；project ref=`szfhngifsipsrxcpekti`（既有权威记录） |
| Runtime env contract | `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`；Web 另使用可选 `NEXT_PUBLIC_SITE_URL` |
| Service Role runtime usage | NONE |
| Auth model | Supabase Session / validated identity |
| Authorization | server capability checks + PostgreSQL RLS / grants |
| Admin mutations | authenticated client → controlled RPC → audit |
| Reader / Author operations | Web → Supabase directly；不经过 Admin App |
| Invitation registration / redemption | Web Auth action + Supabase RPC；不依赖 Admin Vercel online |
| Published browse / reading | Web repository / Supabase RPC；不依赖 Admin Vercel online |
| Admin Pause impact on Supabase | NONE；不修改或暂停 Supabase |
| Admin Project deletion impact on Supabase data | NONE；Vercel Project 不是数据库所有者 |

`origin/main` Production source 的 env contract 只包含上述 public Supabase变量和 `NODE_ENV`；Production source 中 Service Role pattern file count=`0`。

Vercel 环境变量属于各自 Project 的设置边界。删除 Admin Project 的环境变量不会删除 Web Project 环境变量；但本 Step 未展开值，也无法证明 Dashboard 当前没有使用 Vercel Shared Environment Variable 链接，因此值级相等性与 shared-link 状态保留为 Owner Manual Check。

### Web Production Read-Only Regression

| 路径 | HTTP / 只读结果 |
| --- | --- |
| `/` | 200；title=`Fandom Harbor` |
| `/archive` | 200；title=`Archive \| Fandom Harbor` |
| `/privacy` | 200；title=`Privacy Policy \| Fandom Harbor` |
| `/terms` | 200；title=`Terms of Use \| Fandom Harbor` |
| `/content-policy` | 200；title=`Content Policy \| Fandom Harbor` |
| Homepage Footer | 存在 `/privacy`、`/terms`、`/content-policy` |
| Homepage access navigation | 存在 `/archive`、`/auth/sign-in`、`/auth/sign-up` |
| Apex | 308 → `https://www.fandomharbor.com/` |

Guest 权限边界：

- Homepage、Archive discovery 与政策页公开。
- `/access`、`/works` 与 `/studio` 的无 Session HTML 包含到 `/auth/sign-in` 的 server redirect 指令。
- 源码继续要求 Work detail / Chapter / Article 的有效 Session 与 `archive:read`。
- Reader `/studio` 无 `work:author` 时返回 `/archive`；V1.0.2 Production Functional Smoke 已通过该项。
- 本 Step 未登录账号、未注册、未创建邀请码、未发布、未读取私有正文或写入数据。

### Admin Paused-State Preservation

| 检查项 | 结果 |
| --- | --- |
| Project | 存在 |
| State | Paused |
| Production unavailable banner | 已确认 |
| `Resume Service` | 存在，未点击 |
| Production Deployment | `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` / retained |
| Preview Deployment | `dpl_7BvuyTBkvqp8JMNVy8D7pCGSuNkJ` / retained |
| Default Domain / aliases | retained |
| Environment Variables | Owner 确认未修改；值未展开 |
| Production Branch | `admin-production-disabled` |
| New Deployment after Pause | 未由本 Step 触发；已知 current IDs 未变化 |
| Resume recovery | Project、Deployment、Domain、env 与 settings 均保留；原则上无需 Redeploy |

### Future Action Decision Matrix

| 方案 | 安全收益 | Web / Supabase 影响 | 可逆性 / 恢复 | 误操作与 Redeploy 风险 | 当前 Reader-only Beta 判断 | 单独授权 |
| --- | --- | --- | --- | --- | --- | --- |
| A — 保持 Paused，保留全部 Alias / Deployment | 已停止 Production 应用流量；保留 503 | 无 | 最高；`Resume Service`，无需 Redeploy | 最低 | **最适合 / 值得执行** | 当前状态已成立；进入 Closure 仍需授权 |
| B — Paused + 移除部分旧 Branch Alias | 仅小幅降低可发现性 | 正确限定 Admin-only 时无；映射错误有 Web 风险 | 中；需重新建立 alias | 中；需完整 alias export | 当前收益不足 | YES |
| C — Paused + 退役非当前历史 Deployment | 小幅减少历史 artifact / URL 面 | Web / Supabase 预期无 | 低至中；失去 rollback / evidence | 中高；删除不可恢复，可能误删 current | 当前不值得 | YES |
| D — 删除 Admin 默认 Production Alias / Project Domain | 503 hostname 也消失 | Web 预期无；Supabase 无 | 低；原 `.vercel.app` 名称可能无法取回 | 高；恢复域名与 smoke，可能需要新部署 | 不适合 | YES |
| E — 删除整个 Admin Project | 最大化移除 Vercel Admin surface | Web / Supabase 数据预期不删除，但运维恢复能力丢失 | 最低；需重建 Project、Git link、env、domain、deployment | 最高；恢复必然需要部署 | 不适合 | YES |

### Decision

- **Alias Removal 是否仍有实际必要：NO。** Project 已 Paused，正常登录页不再服务；删除 Alias 只增加少量 discoverability 收益，却降低可逆性。
- **历史 Deployment Retirement 是否仍有实际必要：NO。** 当前 artifact 没有继续服务 Production 登录页；删除会损失恢复、回滚和审计证据。
- **Project Deletion 是否有足够收益：NO。** 它不会增强 Web / Supabase 隔离，却会永久删除 Admin 的 Deployment、Domain、env 与设置。
- **是否建议跳过 Step04 / Step05：YES。**
- **推荐方案：A — 保持 Admin Project Paused，不删除 Alias、Deployment 或 Project。**
- **推荐下一步：由 Product Owner 单独授权“保留 Paused Project”的最终 Closure；本 Step 不自动进入 Closure。**

### Evidence Gaps / Owner Manual Checks

1. 当前浏览器自动读取 Web Project Dashboard 和多页面视觉 DOM 超时；Web Active 由正式域名 HTTP 200、V1.0.2 READY Deployment Closure 和未暂停 Web 的 Owner 事实共同确认。
2. 未重新导出 Web current generated Deployment URL 与全部 Web Branch Alias；当前 Web Production ID 和正式域名映射来自 `origin/main` 权威 Release Closure。
3. 未稳定读取两个 Project 当前 Ignore Build Step / Skip Unaffected 设置；app-only push 的精确 skip 行为不得猜测。
4. Vercel 官方 Pause 文档没有明确回答 Paused Project 是否继续响应 Git builds；只确认 Production traffic 503 与 Resume 无需 Redeploy。
5. 未展开或比较 Vercel Environment Variable 值；Owner 如需值级证明，只能在两个 Project 分别核对 variable name、environment scope 与是否 linked shared variable，禁止查看或复制 Secret。
6. 当前环境无法直连 `*.vercel.app`，Admin 503 继续使用 Step02 Owner Manual Verification。
7. 未使用真实 Reader / Author / Admin 账号；当前权限边界使用 Production Functional Smoke 与代码 / RLS / RPC 证据。

### Not Authorized or Executed

- Resume Admin。
- Pause Web。
- Alias / Domain removal。
- Deployment retirement / deletion。
- Project deletion。
- Vercel setting / Git integration / environment variable change。
- Deploy / Redeploy / Promote / Rollback。
- Supabase / Auth / RLS / RPC / Database / user / invitation mutation。
- Product code、package、lockfile 或 monorepo config change。
- Git branch switch、Rebase、Merge、Reset、Stash、Commit、Push 或 PR。
- Step04、Step05、Step06 或 Final Closure。

### Step03 Conclusion

`AUDIT PASS WITH RESIDUAL DEPLOYMENT COUPLING`

Web 与 Admin 的 Vercel Project、Project ID、Root Directory、Production Branch、Domain、Production Deployment 和在线状态均已分离。Admin Pause 没有影响 Web Production，Reader-only invitation Beta 的 Web / Supabase 核心读取与权限流程不依赖 Admin Vercel App 在线。

唯一明确残余是 Git/build-time coupling：两个 Project 连接同一 monorepo 并共享 packages，V1.0.2 `main` push 已实际产生 Admin Preview。该残余不会把 Admin 更新为 Production，也不要求删除 Alias、Deployment 或 Project。

建议跳过 Step04 / Step05，保持方案 A，并等待 Product Owner 单独授权“保留 Paused Project”的最终 Closure。

---

## Step06 Final Closure — Paused Project Retention

Closure 时间：2026-07-29 23:56:02 +0800（Asia/Shanghai）

最终 Closure 状态：

`CLOSED — PAUSED ADMIN RETAINED WITH ACCEPTED RESIDUAL DEPLOYMENT COUPLING`

### Product Owner Final Decision

| Decision field | Final value |
| --- | --- |
| Decision | `RETAIN PAUSED ADMIN PROJECT` |
| Step04 Alias Removal | `SKIPPED BY PRODUCT OWNER DECISION — NOT REQUIRED` |
| Step05 Deployment Retirement | `SKIPPED BY PRODUCT OWNER DECISION — NOT REQUIRED` |
| Project Deletion | `REJECTED — RECOVERY COST AND DESTRUCTIVE RISK EXCEED CURRENT BENEFIT` |
| Resume | `NOT AUTHORIZED` |
| Residual Deployment Coupling | `ACCEPTED FOR CURRENT READER-ONLY BETA` |
| Web/Admin Runtime Decoupling | `VERIFIED` |
| Admin Public Service | `PAUSED` |
| Recovery Capability | `PRESERVED` |

Product Owner 正式采用方案 A：长期保持 `fandom-harbor-admin` Paused，并有意保留 Project、Domain、Alias、Deployment、环境变量、Production Branch 与 `Resume Service` 恢复路径。

### Step01–Step03 Closure Summary

| Step | 状态 | Closure 引用结论 |
| --- | --- | --- |
| Step01 Current State Audit | `AUDIT PASS WITH MANUAL CHECKS` | 完成 Admin Project、公开入口、Deployment、Alias、权限、Secret 与 Web 依赖基线审计 |
| Step02 Reversible Project Pause | `PASS WITH OWNER MANUAL VERIFICATION` | Admin 已 Paused；公开登录页停止正常服务；Project、Deployment、Domain、Alias、env 与恢复路径保留 |
| Step03 Complete Decoupling Verification | `AUDIT PASS WITH RESIDUAL DEPLOYMENT COUPLING` | Web/Admin runtime、Project、Domain 与 Production 已分离；共享 monorepo / packages 仍可产生 Admin Preview build fan-out |

Step04 与 Step05 不是失败、遗漏或 Pending。它们已由 Product Owner 主动决定跳过，不应继续作为 Closure blocker。

### Closure Preflight

| 检查项 | 结果 |
| --- | --- |
| Current branch | `release/v1-public-policy-v1.0` |
| Current HEAD | `eec3403c716ed27ddb59601146f640cf6ad6e5e1` |
| `origin/main` | `ab031bc944335548e4c486534c96aa757d6b94b7` |
| Current branch upstream | `origin/release/v1-public-policy-v1.0` |
| Ahead / behind upstream | `0 / 0` |
| `git diff --check` | PASS |
| Web Production | `https://www.fandomharbor.com/` HTTP 200 |
| Apex | HTTP 308 → `https://www.fandomharbor.com/` |
| Known Web regression | NONE |
| Admin state | Paused；引用 Step02 / Step03 证据 |
| Admin Production Deployment | `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs`；保留 |
| Admin Preview Deployment | `dpl_7BvuyTBkvqp8JMNVy8D7pCGSuNkJ`；保留 |
| `Resume Service` | 保留；未点击 |
| Deployment triggered by Step06 | NONE |
| Secret output | NONE |

### Final Retained Topology

| Boundary | Web | Admin |
| --- | --- | --- |
| Project | `fandom-harbor-web` | `fandom-harbor-admin` |
| Project ID | `prj_jrErEvWbxc1Eq0jGn4vpCewfM8kp` | `prj_XceBjIPkuK3vomhnWBA03DGaY8zx` |
| Root Directory | `apps/web` | `apps/admin` |
| Production Branch | `main` | `admin-production-disabled` |
| Production URL | `https://www.fandomharbor.com/` | `https://fandom-harbor-admin.vercel.app` |
| Runtime state | Active | Paused |
| Production behavior | 正常 Reader-only Beta | 503 / `DEPLOYMENT_PAUSED` 或等效暂停提示 |

Admin Project 没有被删除。Admin Domain、Alias 和 Deployment 的保留是 Product Owner 的有意决策，不是未完成事项。

### Runtime Decoupling and Accepted Deployment Coupling

`Web/Admin Runtime Decoupling = VERIFIED`

- Web 不 import 或调用 Admin runtime。
- Web 正式域名不指向 Admin Deployment。
- Reader 注册、登录、Archive、Published reading 与权限检查直接由 Web + Supabase 完成。
- Admin Pause 不修改 Web Project、Web Domain 或 Supabase。
- 同一 Git Repository 不等于同一运行时。

`Residual Deployment Coupling = ACCEPTED FOR CURRENT READER-ONLY BETA`

- Web 与 Admin 连接同一个 Git Repository。
- 两端共同依赖 `auth`、`config`、`database`、`services`、`ui`。
- `main` 或 shared-package 变化仍可能被 Vercel 判断为影响 Admin。
- `admin-production-disabled` 阻止 Admin Production 更新，但不保证阻止 Admin Preview Build。
- Pause 已停止 Admin Production 正常公开服务，但现有证据不能证明 Pause 关闭所有 Git build hooks。
- Admin Preview Build 的出现不等于 Admin Production 被 Resume 或 Promote。

该残余属于 deployment build fan-out，不属于 Web/Admin runtime coupling；Product Owner 已接受它用于当前 Reader-only Beta。

### Final Security and Product Impact

- Admin 登录页不再正常公开服务。
- Web 正式站保持 HTTP 200，apex redirect 正常。
- Supabase 未暂停、未删除、未修改。
- Reader-only invitation Beta 未受影响。
- Project、Domain、Alias、Deployment、环境变量和 Production Branch 均保留。
- 保留 Paused Domain 的残余仅包括 hostname / 503 可发现性与未来 build fan-out；当前不值得以破坏恢复能力换取进一步收紧。
- 如果未来 Preview build 导致费用、额度、Secret scope 或误 Promote 风险，应建立新 Mission 重新审计。

### Recovery Path

Recovery capability 已保留：

1. 进入 Team `fandom-harbor`。
2. 打开 Project `fandom-harbor-admin`。
3. 核对 Project ID=`prj_XceBjIPkuK3vomhnWBA03DGaY8zx`。
4. 使用 `Resume Service`。
5. 等待现有 Production Deployment 恢复，不执行 Redeploy。
6. 验证 Admin 登录页、真实 Admin 权限与 Web Production。

Resume 当前未授权；未来恢复必须建立 Product Owner 独立 Mission。

### Future Reopening Conditions

只有出现以下任一条件，才重新开启本工作流：

1. Product Owner 决定重新启用 Admin。
2. Admin Project 意外恢复为 Active。
3. Admin URL 再次显示正常登录页。
4. Admin Preview Build 造成实际费用或额度压力。
5. Admin Preview 被 Promote 为 Production。
6. Admin Production Branch 或 Git integration 被修改。
7. Admin Domain、Alias 或 Project 所有权发生变化。
8. Web 开始增加对 Admin URL 的运行时依赖。
9. Shared Environment Variable 或 Secret Scope 出现新的耦合风险。
10. Product Owner 决定永久删除 Admin Project。
11. Product Owner 决定重新执行 Alias Removal 或 Deployment Retirement。

### Evidence Gaps / Owner Manual Checks

- Step06 未重新连接 Vercel Dashboard；Admin Paused、Deployment / Alias / Domain 保留与 `Resume Service` 引用 Step02 / Step03 的已验收证据。
- 当前执行网络无法可靠直连 `*.vercel.app`；Admin 503 继续引用 Step02 Owner Manual Verification。
- Step06 没有新建 Token、恢复 Admin 或触发 Deployment 来补充证据。
- “无新 Deployment”准确含义是本 Step 没有 Git push、Deploy、Redeploy、Promote、Rollback 或其他触发动作；已知 Admin Production / Preview ID 继续引用 Step03 基线。
- 未展开或比较 Environment Variable 值，也未读取 Secret。

### Git and Documentation State

本 Closure 文档当前位于旧分支工作区：

- Branch=`release/v1-public-policy-v1.0`。
- HEAD=`eec3403c716ed27ddb59601146f640cf6ad6e5e1`。
- `origin/main=ab031bc944335548e4c486534c96aa757d6b94b7`。
- 当前分支与 `origin/main` 已分叉。
- `origin/main` 当前不包含 `docs/19_Release/V1-ADMIN-PUBLIC-ALIAS-RETIREMENT.md`。
- 本 Mission 未 Commit、未 Push、未同步 main。
- Closure 文档尚未同步至 `origin/main`；这不是本 Closure 的线上 blocker，而是明确保留的 Git/documentation state。

三个既有 Admin 文件的 SHA-256 仍为：

- `actions.ts`：`75c1174e74d35424768bbdf9f64b7d4b1209c7aab9c8fa97943d8d2a645e1fc1`
- `page.tsx`：`e6937663234d9cf74f5f007e36a267a4976e1008a014c925b40a36012aa11002`
- `actions.test.ts`：`938cad3e1786f981a89da6d5c4bf89105663767ed4a57a00511ccfe755d8c57d`

### Not Authorized or Executed

- Step04 Alias Removal。
- Step05 Deployment Retirement。
- Resume Admin / Pause Web。
- Project、Deployment、Alias 或 Domain deletion / mutation。
- Production Branch、Root Directory、Build、Ignore Build Step、Git integration 或 env change。
- Deploy、Preview、Production、Promote、Rollback 或 Redeploy。
- Web、Admin、shared package、monorepo config 或产品代码修改。
- Supabase、Auth、RLS、RPC、Database、Storage、用户或邀请码修改。
- Branch switch、Merge、Rebase、Reset、Stash、Commit、Push、PR 或 main sync。
- 后续功能开发。

### Final Closure

`CLOSED — PAUSED ADMIN RETAINED WITH ACCEPTED RESIDUAL DEPLOYMENT COUPLING`

方案 A 已正式采用。Admin 保持 Paused；Web、Supabase 与 Reader-only invitation Beta 未受影响；Alias、Domain 与 Deployment 的保留是最终治理决定；Step04 / Step05 已正式跳过。

本工作流到此关闭。未来恢复、删除、Alias Removal、Deployment Retirement 或进一步收紧必须建立新的独立 Mission。
