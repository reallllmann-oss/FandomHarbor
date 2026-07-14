# Fandom Harbor V1 Release Deployment

状态：BLOCKED — 等待 Product Owner 处理发布门禁
日期：2026-07-14
部署类型：Local only

## 结论

`V1 Deployment Ready for Product Owner Review = NO`

本轮完成了部署前上下文、Git、运行时、Supabase Remote、环境变量名称、本地完整验证、QA Fixture 与本地 Smoke Test。未执行 Preview 或 Production Deployment，也未生成新的线上 URL。

## 已通过门禁

- Node.js `24.18.0`、pnpm `11.7.0` 符合 Runtime Contract。
- Offline frozen install 通过，Workspace 依赖完整。
- Supabase 本地与 linked remote Migration 为 14 / 14，一致。
- `pnpm validate` 通过：format、lint、typecheck、169 项 Workspace tests 与 Web / Admin / Docs production builds 全部通过。
- Web tests 81 / 81，Admin tests 2 / 2。
- `git diff --check` 通过。
- Local QA Fixture 重建与安全凭据命令通过；凭据文件权限为 `0600`。
- Guest、Reader、Author、本地主要页面、Reader Studio denial、Author Studio、Published-only / Draft isolation、1280、390 × 844、Light / Dark 均完成本地复核。

## Git 状态

- 当前分支：`main`。
- 当前 HEAD：`e2c479c`（RR-1C Beta Ready closure）。
- `main` 比 `origin/main` 超前 4 个 commit。
- 已存在 RC 历史 commit `9fb5830`，但 UX-06 系列已验收改动仍在未提交工作区中，当前工作区不能作为可追溯的正式 Release baseline。
- 未创建 tag 或 Git Release。
- 未执行 push、force push、commit、reset 或历史覆盖。

## Secret Audit 安全暂停

- 在 Release Baseline 审计中发现 `docs/18_Design/UX-06D-STEP02_ACCEPTANCE.md` 第 86–87 行曾包含两条 localhost-only QA 密码。
- 该文件当前未被 Git 跟踪；实际密码模式未进入 HEAD 或 Git 历史。
- 明文已经替换为安全凭据命令说明，本地 QA 凭据已重新生成并轮换。
- 轮换后重新扫描 OpenAI、GitHub、Vercel、Supabase、JWT、private key、database URL、service role、Auth secret 与 QA password 模式，当前结果为无匹配。
- `.env.local`、应用本地 env、`.local/qa-fixture.json`、`.vercel/`、logs、cache、build output 与 dependencies 均由 `.gitignore` 覆盖。
- 因 Mission 明确规定“测试账号密码被写入文档”必须暂停，本轮未继续 commit、push、Vercel link 或 Preview Deployment；等待 Product Owner 确认处置结果后再恢复。

## Supabase

- Linked remote 连接成功。
- Local / Remote Migration：14 / 14 一致。
- 未执行 `db push`、Migration 写入、远程 SQL、RLS / RPC / Auth / Role 变更或数据写入。
- CLI 提示存在可用更新；本轮未升级工具或依赖。

## Environment Variables

代码要求的变量名：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

本地 URL 与 publishable key 名称存在；本地 `NEXT_PUBLIC_SITE_URL` 未设置，当前由既有 localhost / Vercel URL fallback 处理。由于 Vercel 项目未关联且平台不可验证，Preview / Production 环境变量完整性为 `UNKNOWN`。

本文及本轮其他文档未记录任何变量值、密码、token、service role key 或其他 secret。

## Vercel 与部署阻塞

1. 仓库不存在 `.vercel/project.json`，无法确认 Web / Admin 独立 Vercel Project 关联。
2. 本机未预装 Vercel CLI；临时 CLI 与 Vercel Dashboard 检查均无法完成，无法确认登录、项目、部署目标或线上变量。
3. 已验收 UX 改动尚未形成新的可识别 Git baseline，直接从 dirty working tree 部署不满足安全与回滚优先原则。

因此未创建 Preview Deployment。历史 RR-1B 的 Production Deployment PASS 仍是历史验收事实，但仓库没有保存可用于本轮复核的实际线上 URL，不能把历史状态冒充为本轮部署结果。

## 回滚建议

- 先由 Product Owner 确认可部署的 Git diff，形成一个可识别 commit；不得强推。
- 推送该 baseline 后，将 Web 与 Admin 分别关联到正确的 Vercel Project。
- 仅核对并补齐变量名；如需要新增或覆盖真实 secret，必须再次明确授权。
- 首次只创建 Preview，保留当前 Production deployment 作为回滚点。
- Preview Smoke 不通过时直接停止并回退到前一 deployment，不执行数据库回滚。

## P0 / P1

- 产品 P0：0。
- 产品 P1：0。
- Release Gate P1：3。
  - P1-RD-001：当前 UX-06 已验收实现没有可追溯 Git baseline。
  - P1-RD-002：Vercel Project / Environment Variables / deployment target 无法验证。
  - P1-RD-003：未跟踪文档中的本地 QA 明文凭据已完成脱敏与轮换，等待 Product Owner 确认后恢复发布链。

## Product Owner 下一步授权

需要 Product Owner 明确确认：

1. 是否授权把当前已验收 UX-06 diff 整理为 Release commit 并正常 push。
2. Web 与 Admin 应关联到哪两个既有 Vercel Projects，或由 Product Owner 完成平台登录/关联后继续。
3. 如平台发现缺失变量，是否授权受控写入真实值。
4. 是否确认本次本地 QA 凭据脱敏与轮换处置已完成，并授权重新进入 Secret Audit → commit / push 门禁。

在上述门禁解除前，不执行 Preview、Production、DNS、远程数据或权限变更。
