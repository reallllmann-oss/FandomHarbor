# Fandom Harbor V1 Supabase Production Backup Evidence

状态：`PASS / CURRENT PRODUCTION FRESH BACKUP VERIFIED / PDR-02 CLOSED FOR CURRENT RELEASE`
审计日期：2026-07-25（Asia/Shanghai）
Mission：V1 Current Production Fresh Backup and PDR-02 Closure

## 1. 当前结论

- 2026-07-25 22:38:50（Asia/Shanghai）为已链接的 `fandom-harbor` Production 项目创建了全新的仓库外逻辑备份。
- Schema 和 Data 导出命令退出码均为 `0`；文件非空、格式可识别，15 / 15 应用表集合一致，15 个 COPY 段均有结束标记。
- 新备份晚于本 Mission 开始时间 2026-07-25 22:30:11（Asia/Shanghai），并覆盖执行时的当前 Production `public,private` 应用 Schema 与数据。
- Schema、Data、命令状态和 Manifest 均保存在仓库外，目录权限 `0700`、文件权限 `0600`；未进入 Git 跟踪、Git 历史或 `git status`。
- 2026-07-16 历史备份继续保留，完整性为 `VALID`，但对当前 Release 的新鲜度为 `STALE`；它不再是当前 Release 的唯一备份证据。
- 当前 `PDR-02 = CLOSED FOR CURRENT RELEASE`。PDR-01 仍为 `OWNER REVIEW REQUIRED`，因此 PDR-02 关闭本身不授权 Production Deployment 或整体 Release 收口。
- 未执行恢复、恢复演练、Migration、Reset、Seed、远程 SQL、Production 数据修改、Auth / RLS / RPC / Storage / 权限变更或 Production Deployment。

## 2. Production 项目与平台状态

| 检查项                   | 2026-07-25 结果              | 证据                                                                    |
| ------------------------ | ---------------------------- | ----------------------------------------------------------------------- |
| Project                  | `fandom-harbor`              | Supabase CLI linked project                                             |
| Project Status           | `ACTIVE_HEALTHY`             | Supabase CLI 只读 API                                                   |
| Region                   | `ap-southeast-1` / Singapore | Supabase CLI 只读 API                                                   |
| Plan                     | Free                         | Product Owner 人工确认                                                  |
| Production database size | 约 28 MB                     | Product Owner 人工确认                                                  |
| Monthly Active Users     | 25                           | Product Owner 人工确认；不等同于备份中的 Profile 行数或完整 Auth 身份数 |
| 平台备份记录             | 0                            | CLI 只读 API 与 Product Owner 人工确认                                  |
| PITR                     | `false / NOT ENABLED`        | CLI 只读 API 与 Product Owner 人工确认                                  |
| Storage buckets          | 0                            | Product Owner 人工确认                                                  |
| Storage actual objects   | 0                            | Product Owner 人工确认                                                  |

Free 项目的当前恢复保障依赖受控手工逻辑导出；不同套餐的自动备份与 PITR 能力参见：

- [Database Backups](https://supabase.com/docs/guides/platform/backups)
- [Supabase Pricing](https://supabase.com/pricing)

## 3. 工作区与凭据安全

Mission 开始前已执行 `git status --short` 和 `git diff --check`。工作区包含既有 Admin、Web、UI、Public Policy 与 Release 修改 / 未跟踪文件；全部保留，没有 reset、checkout、restore、clean、stash、暂存、提交或推送。

Codex 没有接收数据库密码。Product Owner 在本机终端运行仓库外一次性脚本，以隐藏输入方式仅在当前进程临时设置 `SUPABASE_DB_PASSWORD`，脚本结束时自动 `unset`。密码未写入脚本、文件、Markdown、Git 或终端命令文本，也未在输出中回显。

## 4. Current Production Fresh Backup

Backup ID：`fandom-harbor-production-2026-07-25_223850`

绝对目录：

`/Users/liuzyzy/Documents/FandomHarbor-Private-Backups/fandom-harbor-production-2026-07-25_223850`

创建时间：

- Local：2026-07-25 22:38:50（Asia/Shanghai，UTC+08:00）
- UTC：2026-07-25 14:38:50Z
- 导出文件完成时间：2026-07-25 22:39:15（Asia/Shanghai）

工具与方法：

- Supabase CLI `2.108.0`
- linked Production project
- Schema：`public,private`
- Data：`public,private`、data-only + COPY
- Schema exit：`0`
- Data exit：`0`

| 文件           | 绝对路径                                                                                                                                                 |  字节数 | SHA-256                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------: | ------------------------------------------------------------------ |
| Schema SQL     | `/Users/liuzyzy/Documents/FandomHarbor-Private-Backups/fandom-harbor-production-2026-07-25_223850/fandom-harbor-production-schema-2026-07-25_223850.sql` |  93,346 | `252e605784de4d75f72c7f8afbe4cf2b9d5128ba1319856591a2999e727ac3e5` |
| Data SQL       | `/Users/liuzyzy/Documents/FandomHarbor-Private-Backups/fandom-harbor-production-2026-07-25_223850/fandom-harbor-production-data-2026-07-25_223850.sql`   | 232,260 | `f08bd95ba0ecfae5d7147e85fab5b70be320415b2860a1b0efc51755b468d534` |
| Manifest       | `/Users/liuzyzy/Documents/FandomHarbor-Private-Backups/fandom-harbor-production-2026-07-25_223850/backup-manifest.txt`                                   |   1,949 | `42f2f0800ef9d701c3be2b69f59c492571783e787c127365a787f6f2f05dd861` |
| Command status | `/Users/liuzyzy/Documents/FandomHarbor-Private-Backups/fandom-harbor-production-2026-07-25_223850/backup-command-status.txt`                             |      59 | 非恢复载荷；记录 UTC 时间与两个非敏感退出码                        |

权限：备份目录 `0700`；Schema、Data、Manifest、Command status 均为 `0600`。

## 5. 当前应用数据覆盖

新备份包含 15 个应用自有表的 Schema 与 Data COPY 段：

| 表                       | 汇总行数 |
| ------------------------ | -------: |
| `content_categories`     |        5 |
| `profiles`               |       35 |
| `articles`               |        0 |
| `content_tags`           |       10 |
| `article_tags`           |        0 |
| `audit_logs`             |       71 |
| `author_profiles`        |        4 |
| `author_follows`         |        0 |
| `works`                  |       10 |
| `chapters`               |       32 |
| `invitations`            |       33 |
| `invitation_redemptions` |       34 |
| `memberships`            |       35 |
| `role_grants`            |        5 |
| `work_tags`              |       18 |
| 合计                     |      292 |

必须覆盖的 `profiles`、`memberships`、`invitations`、`works`、`chapters`、`articles` 均存在。当前 Schema 没有名称匹配 bookmark、reading、progress 或 history 的独立应用表，因此没有缺失一个当前存在的同类表。

上述仅为结构级汇总计数，不输出真实注册名、用户标识、邀请码值、作品正文或其他个人数据。35 行 Profile / Membership 数据是应用表快照，不应与 Dashboard MAU=25 或 Supabase Auth 登录身份混为一谈。

## 6. Auth 与 Storage 边界

### Auth

本次 `public,private` 逻辑备份不包含 Supabase 管理的 `auth` Schema，因此不包含：

- Auth 登录身份；
- 用户密码散列；
- Session；
- MFA；
- OAuth identity；
- 邮箱确认与 provider 状态。

应用 `profiles`、`memberships` 或 `role_grants` 数据存在，不代表对应 Auth 身份已完成备份。

### Storage

Product Owner 已确认当前 Production Storage Bucket 数量为 0，实际文件对象数量为 0；当前没有头像、封面或附件需要单独导出。

本次数据库备份仍不描述为包含 Storage 元数据或实际 Storage 对象。未来一旦启用任何文件上传，必须增加独立 Storage 对象备份、清单和校验和流程。

## 7. 非破坏性验证

| 验证                                | 结果                                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| Schema / Data / Manifest 存在且非空 | PASS                                                                                               |
| 创建时间晚于 Mission 开始时间       | PASS                                                                                               |
| 文件类型                            | PASS — Schema 为 ASCII SQL，Data 为 UTF-8 SQL                                                      |
| Schema 表定义                       | PASS — 15 个                                                                                       |
| Data COPY 段                        | PASS — 15 个                                                                                       |
| COPY 结束标记                       | PASS — 15 个                                                                                       |
| Schema / Data 表集合                | PASS — 完全一致                                                                                    |
| 必要应用表                          | PASS — Profiles、Memberships、Invitations、Works、Chapters、Articles 均存在                        |
| 明显错误文本                        | PASS — 未发现连接、`pg_dump` 或临时角色错误标记                                                    |
| NUL                                 | PASS — 未发现                                                                                      |
| 截断检查                            | PASS — 两文件均以换行结束；Data 有 dump complete 标记；Schema 与已验证历史 Schema SHA-256 完全一致 |
| 导出退出码                          | PASS — Schema=0，Data=0                                                                            |
| SHA-256                             | PASS — 已生成并写入 Manifest / 本文                                                                |
| 权限                                | PASS — `0700` / `0600`                                                                             |
| 仓库边界                            | PASS — 备份目录位于 repository 之外                                                                |
| Git 跟踪 / 历史 / status            | PASS — 匹配数均为 0                                                                                |
| 历史备份覆盖                        | PASS — 未覆盖，历史 SHA-256 保持不变                                                               |
| 恢复 / 恢复演练                     | `NOT RUN`                                                                                          |

## 8. 2026-07-16 历史备份

Backup ID：`fandom-harbor_2026-07-16_220753`

状态：`VALID BUT STALE`

目录：

`/Users/liuzyzy/Documents/FandomHarbor-Private-Backups/fandom-harbor_2026-07-16_220753`

| 文件       |  字节数 | SHA-256                                                            |
| ---------- | ------: | ------------------------------------------------------------------ |
| Schema SQL |  93,346 | `252e605784de4d75f72c7f8afbe4cf2b9d5128ba1319856591a2999e727ac3e5` |
| Data SQL   | 204,387 | `4317c21e8e63aedcc1f824d3b5da6df777026850873549d685474ce47593bbc3` |
| Manifest   |   1,483 | `0c3cfae7ab2c0e574f108ff57d0c77578c621ce2beaa0d5aa28095de59e42f3f` |

历史备份未被删除、修改或覆盖。它保留为历史恢复点，但不再作为当前 Release 的唯一证据。

## 9. V1 备份策略

1. 每次 Migration 前和正式部署前创建一份新的仓库外逻辑备份，验证通过后才进入变更窗口。
2. 7 天 Production observation window 内每日一次；稳定期每周一次，并在重要内容导入或权限变更前额外备份。
3. 建议保留最近 7 份日备份与 4 份周备份；约 30 天仅为运维建议，最终轮换与删除规则必须由 Product Owner 批准，不代表公开政策期限已批准。
4. 目录使用 `0700`，文件使用 `0600`；Manifest 记录工具版本、范围、退出码、大小、SHA-256、限制与验证结果。
5. 新备份验证成功前不删除旧备份。任何备份删除都需要独立批准。
6. 当 RPO 24h 无法由人工流程稳定满足、写入量或用户规模增长、需要更短恢复点或进入更广泛运营时，评估付费套餐与 PITR。
7. 启用头像、封面、附件或其他 Storage 上传时，立即增加独立 Storage 对象备份。

## 10. PDR-02 最终评审

当前 Release 的 PDR-02 条件已由以下真实证据满足：

1. 新鲜 Production Schema 与 Data 文件晚于 Mission 开始时间。
2. 两个导出退出码均为 `0`。
3. 文件非空、结构与应用表覆盖验证通过。
4. SHA-256、权限、范围、Auth / Storage 限制和 Git 边界已记录。
5. Manifest 已创建并验证。
6. 未执行恢复、生产写入或 Deployment。

最终状态：

- `Mission = PASS`
- `PDR-01 = OWNER REVIEW REQUIRED`
- `PDR-02 = CLOSED FOR CURRENT RELEASE`
- `Production Deployment Authorized = NO`
- `Overall Production Release Closeout = NO`（仍受 PDR-01 与其他独立 Release Gate 约束）

恢复准备见 [`V1-SUPABASE-RECOVERY-RUNBOOK.md`](./V1-SUPABASE-RECOVERY-RUNBOOK.md)。恢复演练仍为 `NOT RUN`，PDR-02 关闭不能解释为恢复演练已通过。
