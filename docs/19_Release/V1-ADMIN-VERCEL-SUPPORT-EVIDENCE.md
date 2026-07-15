# Fandom Harbor Admin Vercel Support Evidence Pack

状态：READY FOR PRODUCT OWNER SUBMISSION / DEPLOYMENT PAUSED
日期：2026-07-15
用途：Product Owner 提交给 Vercel Support 的最终证据包

## 1. 中文问题摘要

`fandom-harbor-admin` 的 Production Branch 明确为 `main`，Preview Branch Tracking 为 `All unassigned git branches`。用于 Admin Preview 验收的非 Production branch `codex/admin-preview-baseline` 固定指向 Release Baseline `903bf70a6dc370090362098d26bedd6bf68af529`，按 Vercel 的标准 Git 环境规则应生成 Preview Deployment。

实际触发时，Vercel 将该分支判定为 `production / Production`。任务安全边界禁止创建或保留 Production Deployment，因此该 Deployment 已立即取消并删除，没有生成 Admin Preview URL。当前 Admin Project 的 Preview deployments 与 Production deployments 均为 0，`/auth/sign-in` 验收无法开始。

Vercel API 只读审计与 Product Owner Dashboard 人工复核均未发现 Project、Git、Environment、Domain 或 Build 设置错配。当前判断为 Vercel 平台环境判定异常，或存在公开配置与 API 未暴露的隐藏规则。支持请求需要 Vercel 解释该判定，并提供在项目尚无任何 Production Deployment 时安全创建首次 Preview Deployment 的官方方法。

### 关键标识

| 项目                           | 值                                         |
| ------------------------------ | ------------------------------------------ |
| Team                           | `fandom-harbor`                            |
| Project                        | `fandom-harbor-admin`                      |
| Repository                     | `reallllmann-oss/FandomHarbor`             |
| Root Directory                 | `apps/admin`                               |
| Production Branch              | `main`                                     |
| Preview Branch                 | `codex/admin-preview-baseline`             |
| Commit SHA                     | `903bf70a6dc370090362098d26bedd6bf68af529` |
| Expected                       | Preview Deployment                         |
| Actual                         | `production / Production`                  |
| Current Preview deployments    | 0                                          |
| Current Production deployments | 0                                          |
| Admin Preview URL              | 未生成                                     |

### 已删除或取消的 Deployment 摘要

以下信息只包含环境判定元数据，不包含环境变量值、账号凭据或其他敏感内容。

| Branch                                   | Commit                                     | Target / Environment      | State                                |
| ---------------------------------------- | ------------------------------------------ | ------------------------- | ------------------------------------ |
| `codex/admin-preview-baseline`           | `903bf70a6dc370090362098d26bedd6bf68af529` | `production / Production` | `INITIALIZING → CANCELLED / DELETED` |
| `main`                                   | `903bf70a6dc370090362098d26bedd6bf68af529` | `production / Production` | `BUILDING → CANCELLED / DELETED`     |
| `main`                                   | `903bf70a6dc370090362098d26bedd6bf68af529` | `production / Production` | `BUILDING → CANCELLED / DELETED`     |
| CLI 本地隔离分支；事件未保留 branch 名称 | `903bf70a6dc370090362098d26bedd6bf68af529` | `production / Production` | `READY → DELETED`                    |

其中 `main` 两行仅作为新项目部署尝试的上下文记录；按 branch 规则，真正异常的是 `codex/admin-preview-baseline` 与未保留 branch 名称的本地 Preview 尝试。

## 2. English Support Message

**Subject: Non-production Git branch is incorrectly classified as a Production Deployment**

Hello Vercel Support,

We are blocked while trying to create the first Preview Deployment for an Admin application. A Git branch that is not our Production Branch is consistently being classified as a Production Deployment.

Project details:

- Team: `fandom-harbor`
- Project: `fandom-harbor-admin`
- Repository: `reallllmann-oss/FandomHarbor`
- Root Directory: `apps/admin`
- Framework: Next.js
- Production Branch: `main`
- Preview Branch Tracking: `All unassigned git branches`
- Branch used for the Preview attempt: `codex/admin-preview-baseline`
- Commit SHA: `903bf70a6dc370090362098d26bedd6bf68af529`

Expected behavior:

Because `codex/admin-preview-baseline` is not the configured Production Branch, we expected Vercel to create a Preview Deployment.

Actual behavior:

Vercel classified the deployment as `production / Production`. We immediately cancelled and deleted it because this operation was explicitly authorized for Preview only. No Admin Preview URL was generated. The project currently has zero Preview Deployments and zero Production Deployments.

We verified the following in the Vercel Dashboard:

- Project Name: `fandom-harbor-admin`
- Domain: `fandom-harbor-admin.vercel.app`
- Domain Status: `No Deployment`
- Git Repository: `reallllmann-oss/FandomHarbor`
- Production Branch: `main`
- Preview Branch Tracking: `All unassigned git branches`
- Framework Preset: `Next.js`
- Root Directory: `apps/admin`
- Build Command: `turbo run build` (automatically detected; Override disabled)
- Install Command: `pnpm install`
- Output Directory: Next.js default
- Deploy Hooks: 0
- Custom Environments: 0
- Ignored Build Step: Automatic
- Preview Deployments: 0
- Production Deployments: 0

We also checked the repository and project metadata. We found no `vercel.json`, no `vercel.ts`, no GitHub Actions deployment workflow, no Deploy Hook, no Custom Environment, no forced Ignore Build Step rule, and no branch pattern that would classify this branch as Production. The Git integration is connected and automatic deployments are enabled.

Relevant deleted or cancelled deployment metadata:

| Branch                                                                        | Commit                                     | Target / Environment      | State                                |
| ----------------------------------------------------------------------------- | ------------------------------------------ | ------------------------- | ------------------------------------ |
| `codex/admin-preview-baseline`                                                | `903bf70a6dc370090362098d26bedd6bf68af529` | `production / Production` | `INITIALIZING → CANCELLED / DELETED` |
| `main`                                                                        | `903bf70a6dc370090362098d26bedd6bf68af529` | `production / Production` | `BUILDING → CANCELLED / DELETED`     |
| `main`                                                                        | `903bf70a6dc370090362098d26bedd6bf68af529` | `production / Production` | `BUILDING → CANCELLED / DELETED`     |
| Isolated local CLI branch; branch name was not retained in the event metadata | `903bf70a6dc370090362098d26bedd6bf68af529` | `production / Production` | `READY → DELETED`                    |

The two `main` rows are included only as context for the new-project deployment attempts. The unexpected classifications are the `codex/admin-preview-baseline` row and the isolated local Preview attempt whose branch name was not retained in the event metadata.

Could you please clarify:

1. Why is a non-production Git branch being classified as a Production Deployment?
2. Is there a hidden project-level rule or first-deployment initialization behavior that can cause this?
3. How can we safely generate a Preview Deployment for this project before any Production Deployment exists?
4. Is there any additional project metadata or Dashboard setting we should inspect without triggering another deployment?

We have paused all further deployment attempts. We will not trigger another deployment or modify the project configuration until we receive your guidance.

Thank you.

## 3. Dashboard 人工复核结论

Product Owner 已在 Vercel Dashboard 完成人工复核：

| 配置项                  | 已确认值                                             |
| ----------------------- | ---------------------------------------------------- |
| Project Name            | `fandom-harbor-admin`                                |
| Domain                  | `fandom-harbor-admin.vercel.app`                     |
| Domain Status           | `No Deployment`                                      |
| Git Repository          | `reallllmann-oss/FandomHarbor`                       |
| Production Branch       | `main`                                               |
| Preview Branch Tracking | `All unassigned git branches`                        |
| Framework Preset        | `Next.js`                                            |
| Root Directory          | `apps/admin`                                         |
| Build Command           | `turbo run build`，Dashboard 自动识别，Override 关闭 |
| Install Command         | `pnpm install`                                       |
| Output Directory        | Next.js default                                      |
| Deploy Hooks            | 0                                                    |
| Custom Environments     | 0                                                    |
| Ignored Build Step      | Automatic                                            |
| Preview Deployments     | 0                                                    |
| Production Deployments  | 0                                                    |

配置排查结果：

- 未发现 Project / Git / Environment / Domain / Build 设置错配。
- 未发现 `vercel.json` 或 `vercel.ts`。
- 未发现 GitHub Actions deployment workflow。
- 未发现 Deploy Hook 或 Custom Environment。
- 未发现 Ignore Build Step 强制规则。
- 未发现 Branch Pattern 强制 Production 规则。
- Vercel Git Integration 已连接，Auto Deployment 为 enabled。

## 4. 暂停声明

在 Vercel Support 给出解释，或 Product Owner 明确授权新的受控方案前：

- 不再次触发任何 Admin Deployment。
- 不进入 Production。
- 不修改 Vercel Project、Git、Environment、Domain、Build 或 Production Branch 配置。
- 不修改 `main`、`origin/main` 或 `codex/admin-preview-baseline`。
- 不修改数据库、Supabase、Auth、Role、RLS、RPC、DNS 或 Docs Project。
- 不创建新的 bypass secret，不输出任何环境变量值、密码、Token 或 Secret。

Admin Preview Deployment 继续保持 `BLOCKED`，等待 Product Owner 手动提交本证据包给 Vercel Support 或作出下一步决策。
