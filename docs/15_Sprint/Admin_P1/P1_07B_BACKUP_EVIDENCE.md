# Admin P1-07B — Production Backup Evidence

状态：`PASS / BACKUP RELEASE GATE SATISFIED / R2 DOCUMENTATION CLOSURE`
证据整理日期：2026-09-16（Asia/Shanghai）

## 1. 基线与证据时点

- Frozen Release SHA：`b494b5e954ce0d43e28df088bd3f2c0c7a19b31f`。
- Production Project：`szfhngifsipsrxcpekti`。
- 已正式接受的 R1：`ADMIN P1-07B-R1 FRESH PRODUCTION BACKUP — PASS`。
- Backup timestamp：`2026-09-10T14:00:52Z`；北京时间 `2026-09-10T22:00:52+08:00`。
- 仓库外目录：`/Users/liuzyzy/Documents/FandomHarbor-Private-Backups/20260910-140052_P1-07B_PRODUCTION_PRE_RELEASE`。
- R1 前后 Production 均为 `ACTIVE_HEALTHY`、Migration `16/20`、P1 Migration `0/4`；Production write `NONE`，Restore `NOT EXECUTED`。
- R1 使用 PostgreSQL server `17.6` / `pg_dump 18.6`；FileVault `ENABLED`。
- R2 只读检查现有文件、权限、Manifest metadata、checksum 和 archive object list。未重新导出、连接 Production、访问凭据或执行 Restore。

本页记录的是已接受的 R1 快照及 R2 本地完整性复核，不将 2026-09-10 的数据库状态冒充为 2026-09-16 的实时状态。后续 P1-07C 必须由 Product Owner 单独授权，并重新判断基线与备份新鲜度；本页不授权 Migration、Deployment 或 Admin Resume。

## 2. Artifact 清单与完整性

| Artifact                          | 字节数 | 权限  |
| --------------------------------- | -----: | ----- |
| `00_baseline_inventory.tsv`       |   4419 | `600` |
| `01_business_public_private.dump` | 272399 | `600` |
| `01_business_public_private.list` |  25406 | `600` |
| `02_migration_history.dump`       |  18772 | `600` |
| `02_migration_history.list`       |    610 | `600` |
| `03_auth_recovery.dump`           |  19180 | `600` |
| `03_auth_recovery.list`           |   1021 | `600` |
| `04_auth_schema_reference.dump`   |  88270 | `600` |
| `04_auth_schema_reference.list`   |  17188 | `600` |
| `05_roles_inventory.txt`          |    911 | `600` |
| `06_integrity_verification.txt`   |    679 | `600` |
| `07_post_backup_inventory.tsv`    |    273 | `600` |
| `inventory.json`                  |   3458 | `600` |
| `MANIFEST.json`                   |   5217 | `600` |
| `SHA256SUMS.txt`                  |   1309 | `600` |

目录权限 `700`；15/15 required artifacts 存在。R2 使用现有 `SHA256SUMS.txt` 核对其引用的 14/14 文件，全部 `OK`，包括 Manifest；checksum 文件本身不自校验。备份文件未进入 Git。

| Dump                  | SHA256                                                             |
| --------------------- | ------------------------------------------------------------------ |
| Business              | `58df5ddbd29513642aac9747f103e4b8613425e056dbf2c659ac281604b4c71e` |
| Migration history     | `b64ceac8d78eabeee849484427a5bb973d38bc6b15d97c01746b553fb61ac994` |
| Auth recovery         | `403c064e9972087e6cf1c57cffc98289407e8a6a4f929b115e4c76ccb6766b63` |
| Auth schema reference | `d7d6ce1ec77b79e254dcac99e346afbe9250bc3d043bfe4f9260fbb0ca8bbca0` |

R1 `pg_restore` archive list 与结构解析验证为 `PASS`，但不是 Restore Drill。R2 未重新执行导出或恢复；Auth 只核对对象清单与汇总 metadata，未读取或输出 Auth 行数据。

## 3. Business 与 Migration recovery coverage

- Business dump 覆盖应用 `public,private` schema、业务数据、Function/RPC、Trigger、RLS/Policy 和 Grant/ACL：全部 `PASS`。
- R1 对象清单：public table/data `17/17`、public functions `21`、private tables `0`、private functions `19`、triggers `9`、policies `31`、ACL entries `105`、sequence / sequence-set 各 `1`。private 无表是备份时 P1 尚未 apply 的基线，不是漏备 Ledger。
- Migration history 使用独立 `02_migration_history.dump`，schema/table/data 清单及 integrity `PASS`；保留 Production `16/20`、P1 `0/4` 的恢复点。
- Dump 是数据库快照，不等于整个 Supabase 平台配置、Edge Functions、SMTP、外部 provider secrets 或 Vercel 配置的完整备份。

## 4. Auth recovery 与明确排除项

- R1 inventory：`auth.users=37`、`auth.identities=37`；账号、identity 关系与 password hash recovery coverage `PASS`。只记录覆盖结论，不记录哈希值或用户内容。
- `03_auth_recovery.dump` 对象清单包含 11 个 durable table-data：`auth.users`、`auth.identities`、`auth.instances`、`auth.mfa_factors`、`auth.custom_oauth_providers`、`auth.oauth_clients`、`auth.oauth_consents`、`auth.sso_providers`、`auth.sso_domains`、`auth.saml_providers`、`auth.webauthn_credentials`。
- durable MFA/provider recovery boundary `PASS`；R1 durable MFA/SSO/OAuth/WebAuthn 表计数均为 `0`，不声称已实测非空 provider/MFA 的恢复登录旅程。
- R1 sessions `6`、refresh tokens `9` 仅为 inventory counts；两者均 `EXCLUDED`，不属于 Release Gate 必须恢复的数据。
- 排除：sessions、refresh tokens、one-time tokens、flow state、transient challenges、session-bound AMR claims；具体排除对象还包括 `auth.oauth_authorizations`、`auth.oauth_client_states`、`auth.saml_relay_states`、`auth.audit_log_entries` 与 managed `auth.schema_migrations`。
- 灾难恢复后：`ALL USERS MUST RE-AUTHENTICATE`；不承诺恢复当前登录状态。
- `04_auth_schema_reference.dump` 是 schema-only reference，结构验证 `PASS`；不能盲目覆盖 Supabase managed Auth schema。恢复前必须审查目标 managed schema 版本兼容性、依赖及独立 Auth 恢复顺序。

## 5. Storage、Roles 与恢复限制

- Storage buckets `0`、objects `0`：`NO STORAGE PAYLOAD BACKUP REQUIRED`。未来产生对象后需独立备份对象本体、metadata 与校验清单。
- Custom login roles `NONE`；`05_roles_inventory.txt` 是 inventory，不是 roles restore script；managed role passwords `NOT EXPORTED`，不得臆造可恢复密码的 role artifact。
- Restore Drill `NOT RUN`；Production Restore `NOT EXECUTED`；实际 Auth recovery/login validation `NOT RUN`。
- 上述是已接受的 Recovery Boundary，不是 Backup Failure；Backup Gate PASS 不等于已实测 Recovery Readiness，也不取代部署计划中的隔离恢复演练要求。

## 6. Gate 与安全冻结

`P1-07B BACKUP RELEASE GATE SATISFIED`。P1-07C 为 `WAITING FOR PRODUCT OWNER AUTHORIZATION / NOT EXECUTED`；P1 整体仍不自动 Closure。

R2 为 docs-only local closure：无重新 Backup、无 Production connection、无 Restore、无 SQL/DB/Auth/Storage/ACL/Migration 写入、无部署、无 Push/PR/Merge。Formal Admin Production 依照已接受冻结状态保持 `paused=true`；Web Admin Entry `CLOSED`；P1.1 `DEFERRED / NOT AUTHORIZED`。本任务不重新访问 Production 平台来验证历史状态。

权威关联：[Production backup evidence](../../19_Release/V1-SUPABASE-BACKUP-EVIDENCE.md)、[Recovery runbook](../../19_Release/V1-SUPABASE-RECOVERY-RUNBOOK.md)、[Deployment plan](../../14_Deploy/DEPLOYMENT_PLAN.md)、[Admin P1](README.md)。
