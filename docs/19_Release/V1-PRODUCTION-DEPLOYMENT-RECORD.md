# Fandom Harbor V1 Production Deployment Record

状态：`PRODUCTION DEPLOYMENT COMPLETED / PRODUCTION SMOKE PASS / LIVE — 7-DAY OBSERVATION WINDOW`
日期：2026-07-17

## 1. Release 状态

- `Production Readiness Review = PASS`。
- `Production Deployment Review = PASS`。
- `Production Deployment = COMPLETED`。
- `Production Smoke = PASS`。
- `Production Status = LIVE / 7-DAY OBSERVATION WINDOW`。
- `Production Ready = DEPLOYED`。
- `Production Deployment Authorized = CONSUMED / CLOSED`。
- `PDR-01 = CLOSED FOR DEPLOYMENT`。
- `PDR-02 = CLOSED FOR DEPLOYMENT`。
- Product P0 / P1 = `0 / 0`。

## 2. 部署来源与可追踪性

| 项目                         | 记录                                                       |
| ---------------------------- | ---------------------------------------------------------- |
| Final RC Branch              | `codex/v1-production-rc-final`                             |
| Final RC SHA                 | `ab04de63ed0ced4eadfaa4a64babfa6370c67058`                 |
| Final RC Tree SHA            | `17c21ed12bfd4069dde20257045a65fe576821c4`                 |
| Git Author                   | `reallllmann <reallllmann@gmail.com>`                      |
| Git Committer                | `reallllmann <reallllmann@gmail.com>`                      |
| Vercel Team / Project        | `fandom-harbor/fandom-harbor-web`                          |
| Project Root                 | `apps/web`                                                 |
| Deployment ID                | `dpl_9FSPEFRzazWwd31wrajY3yVw3wPs`                         |
| Deployment URL               | `https://fandom-harbor-r0ywp5b1l-fandom-harbor.vercel.app` |
| Production Domain            | `https://fandom-harbor-web.vercel.app`                     |
| Deployment Created           | `2026-07-17 00:16:24 +08:00`                               |
| READY Confirmed              | `2026-07-17 00:17 +08:00`（Vercel CLI：`Ready in 55s`）    |
| Manual Production Smoke PASS | `2026-07-17 00:30:30 +08:00`                               |

Vercel Inspect 未显示 Git SHA。部署来源通过部署前精确 HEAD、干净 Final RC Worktree、精确 Remote RC、Git Author / Committer、Tree SHA 与部署创建时间形成审计关联；不得把该关联误写为 Vercel 自身展示了 Git SHA。

## 3. Production Smoke 结果

Product Owner 完成人工 Production Smoke 并确认以下项目全部通过：

- 公开页面：PASS。
- Guest 权限：PASS。
- Reader 路径：PASS。
- Author 路径：PASS。
- `/legal` 与注册政策入口：PASS。
- SEO、robots、sitemap：PASS。
- 1280 × 800：PASS。
- 390 × 844：PASS。
- Light / Dark：PASS。
- Console 产品级错误：`0`。
- 关键请求 5xx：`0`。

Smoke 未创建、编辑、保存、发布或删除业务内容；未修改数据库；未向技术执行者提供密码、Cookie、Token 或 Session。

## 4. 历史失败部署

以下记录仅作为历史失败证据保留，不是当前 Production 来源，且未执行 Redeploy、Promote、Rollback 或复用：

- `dpl_DmFzH9v1bmJPzQdmLhFqGpyPuYKq`：历史阻断 / 未形成可接受 READY 证据。
- `dpl_HrwjQFcpBwP4dGfkoqv5Br3rdpzR`：构建因当时无效的站点 URL 配置失败；后续由 Product Owner 修正 Production 配置后创建了全新部署。

## 5. 7 天观察窗口

- Start：`2026-07-17 00:30:30 +08:00`。
- End：`2026-07-24 00:30:30 +08:00`。
- Release Commander / Emergency Contact：Product Owner。
- Technical Operator：Codex / 技术执行者，但每次生产操作仍须 Product Owner 明确授权。
- 监控：Vercel Dashboard、Supabase Dashboard 与 Product Owner 人工反馈。
- 严重事故：目标 30 分钟内确认。
- 暂停或回滚决定：目标 60 分钟内完成。

Supabase 当前为 Free / No backups。观察期内至少每天执行一次仓库外受控 Schema 与 Data 逻辑导出，并记录日期、退出状态、文件大小、权限和 SHA-256；不得把 SQL、Manifest、Secret、业务数据或完整私有备份路径提交到 Git。恢复、数据库写入、权限变更或 Vercel 回滚仍须 Product Owner 单独授权。

## 6. 完整性与禁止操作

- Final RC Commit 未修改，部署后 Worktree 保持干净。
- 原始主工作区及冻结 `/access` Admin 改动未被修改。
- 未修改数据库、Auth、RLS、RPC 或 Migration。
- 未创建账号、发送邀请码或修改角色。
- 未创建 Tag，未合并或修改 `main`。
- 本发布记录 Commit 仅记录部署事实，不是 Production 部署源。
