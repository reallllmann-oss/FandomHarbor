# Fandom Harbor V1 Supabase Recovery Runbook

状态：`READY FOR AUTHORIZED ISOLATED DRY RUN / RESTORE NOT RUN`
日期：2026-09-29

## 最新恢复源（2026-09-29）

当前最新、已验证的 Production 逻辑备份：

- Backup ID：`20260929-113150_P1-07C-4A10A_PRE_D_SAFETY`
- 创建时间：2026-09-29 11:31:50（Asia/Shanghai，UTC+08:00）
- 目录：`/Users/liuzyzy/Documents/FandomHarbor-Private-Backups/20260929-113150_P1-07C-4A10A_PRE_D_SAFETY`
- Production baseline：`szfhngifsipsrxcpekti`、`ACTIVE_HEALTHY`、19/21 migrations、Pre-D/D absent
- Business：`01_business_public_private.dump`（custom-format `public,private` Schema/Data）
- Migration history：`02_migration_history.dump`（custom-format `supabase_migrations`）
- Auth data：`03_auth_recovery.dump`（durable recovery subset only）
- Auth reference：`04_auth_schema_reference.dump`（schema-only）
- Inventory/verification：`00_baseline_inventory.tsv`、`07_post_backup_inventory.tsv`、
  `inventory.json`、`MANIFEST.json`、`SHA256SUMS.txt`
- Auth：durable users/identities/MFA/provider/SSO data subset is included;
  Session、refresh token、challenge/flow state 与 managed Auth history 未包含，恢复后全部用户必须重新认证。
- Storage：备份时 Bucket=0、实际对象=0；当前无需对象恢复，但 archive 不包含 Storage payload。
- Restore drill：`NOT RUN`

未来启用头像、封面、附件或其他文件上传后，必须增加独立 Storage 对象备份与恢复步骤。未经 Product Owner 批准，禁止把本备份直接恢复到 Production。

## 1. 使用范围

本 Runbook 适用于 Production 数据误删、不可逆 Schema / Migration 事故、重大数据损坏或 Supabase 项目不可恢复时的受控恢复准备。它说明 `public,private`、Migration history 与 durable Auth recovery subset 的逻辑恢复路径，不代表已经完成恢复演练，也不覆盖 transient Auth Session/token、Storage 实际对象、managed role password 或第三方平台配置。

## 2. 风险警告

- 禁止在当前 Production 项目上盲目恢复、覆盖或试跑。
- 禁止在没有 Product Owner 明确授权、维护窗口、源备份确认和回退目标的情况下执行任何恢复命令。
- 优先恢复到新建、隔离、无用户流量的 Supabase 项目或恢复演练环境；验证完成后再由 Product Owner 决定切流或后续处置。
- 逻辑备份可能不含 Auth、Storage、平台角色、扩展配置和 Dashboard 设置。应用表恢复成功不等于完整平台恢复成功。
- 任何真实恢复均应使用单独 Mission 和变更单；本文件不构成执行授权。

## 3. 恢复授权要求与职责

恢复开始前必须由 Product Owner 明确批准：

1. 事故范围、恢复点、目标项目和允许的数据损失窗口。
2. 写入停止时间、维护窗口和用户沟通方式。
3. Database Operator、Validation Owner、Audit Reviewer 与最终切流批准人。
4. Auth 用户与 Storage 对象的单独恢复或重新配置方案。
5. 失败回退条件和最大允许操作时长。

只有具备目标 Supabase 项目数据库权限的授权操作人可以取得凭据并执行恢复。Codex 或技术执行者只有在该次 Mission 明确授权且安全凭据机制已经建立时才可操作。

## 4. 恢复前检查

1. 宣布维护窗口并停止应用写入：暂停新注册、邀请码兑换、登录身份变更、Profile 修改、Author 创建 / 保存 / 发布、角色 / Membership 操作及后台治理写入。
2. 如果源 Production 仍可读，为事故时点建立新的只读取证快照；不要覆盖已有备份。
3. 核对目标备份的 Backup ID、创建时间、项目、文件权限、字节数、SHA-256、Schema / Data 范围与排除项。
4. 将校验和与证据文档比对；任何不一致、0-byte、明显截断或错误标记都必须停止。
5. 确认目标为隔离项目，PostgreSQL / Supabase 版本兼容，且没有真实用户流量。
6. 记录源项目与目标项目的非敏感标识、region、数据库主版本、CLI / `psql` 版本和开始时间。
7. 盘点需要预先配置的 extensions、数据库设置、Edge Functions、Secrets、Auth providers、SMTP、RLS / RPC 依赖和 Storage buckets。

## 5. 凭据准备

- 由授权操作人在 Supabase Dashboard 或组织认可的 Secret Manager 中取得目标数据库凭据。
- 优先使用系统凭据存储、短期凭据或仅当前进程可见的交互式机制。
- 不得把密码、连接字符串、Access Token、Service Role Key 或 Session 发送到聊天、写入 Markdown、脚本、Git、命令历史或恢复日志。
- 不使用真实凭据替换本 Runbook 中的占位符。执行结束后立即清除当前进程中的临时变量并按组织流程轮换短期凭据。

## 6. 工具与恢复顺序

使用与目标 PostgreSQL 主版本兼容的官方 `pg_restore`/`psql`。2026-09-29 archive 由 `pg_dump 18.6` 从 PostgreSQL `17.6` 创建；任何目标版本兼容性都必须先在隔离环境确认。Supabase 官方逻辑迁移说明见 [Restore a platform backup locally](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)。

推荐顺序：

1. 创建隔离目标项目并确认连接只指向目标。
2. 按审计清单准备所需 extensions 与平台级设置。
3. `05_roles_inventory.txt` 只供审阅；它不含 managed role password，也不是可盲目执行的 role restore 脚本。由授权 DBA 在隔离目标预建兼容 roles/settings。
4. 先审阅 `pg_restore --list` 与目标差异，再恢复 `01_business_public_private.dump`。
5. 验证表、类型、函数、触发器、索引、约束、RLS policy、grants、序列、外键与数据计数。
6. 审阅并恢复 `02_migration_history.dump`；禁止同时运行会重复创建对象的 migrations。
7. 只有在独立 Auth 恢复方案、版本兼容性与停写/重新认证计划获批后，才处理 `04_auth_schema_reference.dump` 与 `03_auth_recovery.dump`。
8. 单独处理 Storage 与平台配置；完成全量验收后才考虑切流。

示例仅展示安全形态，不能直接复制到 Production：

```sh
# 由授权操作人在当前受控进程中安全注入；不要写入脚本或历史。
export RESTORE_DATABASE_URL='<isolated-target-database-url>'

pg_restore --list '<absolute-path-to-01_business_public_private.dump>'

pg_restore \
  --exit-on-error \
  --single-transaction \
  --dbname "$RESTORE_DATABASE_URL" \
  '<absolute-path-to-01_business_public_private.dump>'

unset RESTORE_DATABASE_URL
```

每个 archive 必须分别使用 `--exit-on-error` 与 transaction，在首个错误时中止。不要同时盲目运行会重复创建对象的 migrations 与 business archive；必须先决定目标 Schema 的唯一来源，并由 Database Operator 审阅差异。上例只展示隔离目标的 business archive 形态，不授权恢复 Migration/Auth archive，更不授权指向 Production。

## 7. Auth 注意事项

当前逻辑备份包含 Auth schema reference 与以下 durable data recovery subset：

- users、identities、instances 与 mfa_factors；
- custom OAuth providers/clients/consents；
- SSO/SAML/WebAuthn durable configuration/credential records；
- MFA recovery code sets/codes 与 SCIM users/tokens。

它明确不包含 transient 或 managed operational state：

- Session、refresh token、flow/challenge、one-time token 与 managed Auth audit/migration history。
- managed role password 与 Supabase Dashboard/provider Secret。
- 恢复后所有用户必须重新认证；archive 存在不等于 Auth end-to-end restore 已验证。
- 禁止直接手工编辑 Auth 表或伪造用户 ID。
- Auth 恢复必须先核对目标 managed schema/version，再由单独设计、审批和验证的流程执行；当前只完成 archive structural verification。
- 如果 Auth 无法恢复，Product Owner 必须批准受控用户重建、邀请重发或密码重置流程，并验证应用表外键与身份映射。

在 Auth 策略确定前，不得把恢复环境开放给真实用户。

## 8. RLS、RPC、Functions 与 Extensions

- 对每个应用表确认 RLS 是否启用、policy 名称与角色条件是否符合当前 migrations。
- 对 Security Definer 函数、RPC、trigger function、`search_path` 与 grants 进行逐项复核。
- Edge Functions 不属于数据库逻辑 dump；源代码、部署版本和 Secrets 需要独立恢复。
- Supabase 管理 extensions 与平台服务可能不能通过普通 dump 完整恢复。先在隔离目标按当前批准配置启用，再验证函数依赖。
- 不要为了让恢复“通过”而临时放宽 RLS、授予 service role、删除约束或绕过 audit。

## 9. Storage 元数据与实际对象

Storage 必须拆成两层处理：

1. PostgreSQL `storage.buckets` / `storage.objects` 是元数据。
2. bucket 中实际上传的头像、封面、附件或其他文件是对象本体。

当前 2026-09-29 backup 不包含这两层。只读 inventory 确认 Bucket=0、实际对象=0，因此当前没有对象需要恢复；这不改变逻辑备份的覆盖边界。即使未来数据库备份包含 Storage 元数据，也不代表实际对象已备份。启用头像、封面、附件或其他上传后，必须单独建立对象导出、对象清单、校验和、访问策略与恢复验证；参见 [Supabase Storage object download](https://supabase.com/docs/guides/storage/management/download-objects)。

## 10. 恢复后验证

在隔离目标按以下顺序验收并保存非敏感证据：

1. Schema 对象、migrations 基线、extensions、函数、RPC、trigger、index、constraint、RLS policy 与 grants。
2. 15 个应用表是否存在；使用汇总计数和校验值比对，不打印业务行或个人数据。
3. 序列 next value、外键完整性、孤儿记录和关键唯一约束。
4. Guest 登录边界；Reader 注册 / 登录身份映射、Published-only 阅读与 Studio denial。
5. Author Studio、草稿保存、Draft isolation、发布与 Reader 回读。
6. Super Admin / audit 路径；禁止使用直接 SQL 代替产品授权流程。
7. Auth provider、邮件、Session、密码重置与身份映射。
8. 若使用 Storage，验证 bucket policy、对象数量、对象校验和与抽样下载。
9. 1280px / 390px、Light / Dark、核心路由和产品级 Console Error。

所有检查通过后，由 Validation Owner 与 Product Owner 双方签字；这仍不自动授权切换 Production。

## 11. 失败处理与回退

- Schema 或 Data 恢复发生错误时，依赖 `--single-transaction` 回滚当前阶段并停止，不继续叠加修复。
- 将失败目标隔离并保留必要日志；不要清空、覆盖或删除源 Production 与原始备份。
- 记录错误阶段、退出码、目标项目、工具版本、开始 / 停止时间及已验证不含 Secret 的错误摘要。
- 优先新建另一个干净隔离目标重新开始；不要在半恢复目标上反复执行不幂等 SQL。
- 如果已经发生流量切换，按事先批准的切流回退方案返回上一稳定应用 / 数据目标，保持写入停止并启动事故响应。
- 数据库回退、用户重建、Auth 重置、Storage 覆盖或 Production 切流都需要新的 Product Owner 明确批准。

## 12. 审计记录

每次获批恢复或演练至少记录：

- 变更单 / Mission、批准人、操作人、验证人、目标环境。
- Backup ID、文件名、创建时间、字节数、SHA-256 与范围。
- 工具 / 数据库版本、开始 / 结束时间、命令退出码。
- 停写与恢复写入时间、验证清单结果、已知缺口。
- Auth、Storage、Edge Functions、Secrets 与平台配置的处理结论。
- 失败、回退、切流和最终批准记录。

日志必须脱敏，不得包含密码、连接字符串、Token、Service Role Key、个人数据或正文。

## 13. 当前状态

- Recovery Runbook：`DOCUMENTED`
- Latest verified backup：`20260929-113150_P1-07C-4A10A_PRE_D_SAFETY`
- Isolated restore dry run：`NOT RUN`
- Production restore：`NOT RUN`
- Auth recovery validation：`NOT RUN`
- Storage recovery validation：`NOT RUN`
- Production Deployment：`NOT RUN`

在隔离环境完成获批恢复演练之前，禁止声明 Recovery Readiness 已实测 PASS，禁止直接在 Production 上进行未经演练的恢复。
