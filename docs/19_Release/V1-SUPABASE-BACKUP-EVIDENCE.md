# Fandom Harbor V1 Supabase Manual Backup Evidence

状态：`PDR-02 CLOSED FOR DEPLOYMENT / RESTORE NOT RUN / PRODUCTION DEPLOYMENT NOT RUN`
日期：2026-07-16
Backup ID：`fandom-harbor_2026-07-16_220753`

## 1. 平台与项目证据

| 检查项         | 结果                           |
| -------------- | ------------------------------ |
| Supabase Plan  | Free                           |
| Project        | `fandom-harbor`                |
| Project Status | Healthy                        |
| Region         | `ap-southeast-1` / Singapore   |
| Dashboard      | Automatic Backup：`No backups` |
| CLI            | Supabase CLI `2.108.0`         |

Free 套餐和 Dashboard 截图证据由 Product Owner 保留。本次使用已链接项目执行只读逻辑导出，没有在命令中写入数据库连接字符串、密码、Access Token、API Key 或其他 Secret。

## 2. 手动逻辑导出证据

- 执行时间：2026-07-16 22:07:53–22:09:15（Asia/Shanghai）。
- 存储位置类别：Product Owner controlled private directory outside repository。
- 私有目录权限：`0700`。
- SQL 文件权限：`0600`。
- Schema 导出：成功，退出码 `0`。
- Data 导出：成功，退出码 `0`；使用 Data-only 与 COPY 结构。
- Custom Role Backup：`NOT REQUIRED`；CLI `--role-only` 临时检查为 0 个角色声明、0 个密码字段，项目 Migration 也没有自建数据库角色声明。临时检查文件已删除。
- Remote Database Mutation：`NO`。
- Restore Test：`NOT RUN`。
- Production Deployment：`NO / NOT RUN`。

| 文件                                         | 字节数 | SHA-256                                                            |
| -------------------------------------------- | -----: | ------------------------------------------------------------------ |
| `fandom-harbor-schema-2026-07-16_220753.sql` |  93346 | `252e605784de4d75f72c7f8afbe4cf2b9d5128ba1319856591a2999e727ac3e5` |
| `fandom-harbor-data-2026-07-16_220753.sql`   | 204387 | `4317c21e8e63aedcc1f824d3b5da6df777026850873549d685474ce47593bbc3` |

私有目录另有 `backup-manifest.txt`，记录相同的非敏感文件元数据、导出范围和限制。SQL、Manifest 和完整本地路径均未进入 Git 仓库。

## 3. 导出范围与验证

- 应用自有 Schema：`public`、`private`。
- Schema 文件包含预期的 15 个应用表定义。
- Data 文件包含预期的 15 个应用表 COPY 段。
- `private` 仅包含项目内部数据库函数，没有应用数据表。
- Supabase CLI 默认排除部分 Supabase 管理的 Schema。
- Supabase 管理的 Auth 数据未包含在本次导出中。
- Supabase 管理的 Storage 数据库元数据未包含在本次导出中。
- Storage 数据库元数据不等于实际 Storage 对象；实际 Storage 文件不属于本次备份范围。
- 本次导出不是完整 Supabase 平台镜像，也不包含第三方平台配置。
- 未执行恢复验证，因此不能把本证据解释为恢复演练 PASS。

验证只检查文件存在、非空、权限、预期定义/COPY 结构、大小和 SHA-256；没有输出或复制用户注册名、用户标识、邮箱、邀请码、作品正文、阅读记录或 Auth 数据。

## 4. Free 套餐备份运行要求

1. Production Deployment 授权前必须存在一份最新且已验证的手动逻辑备份。
2. 7 天 Production Observation Window 期间，至少每天生成一次受控逻辑导出。
3. 所有 SQL、Manifest 和导出日志继续保存在 Product Owner 控制、Git 仓库之外的私有目录。
4. 每次记录 Backup ID、执行时间、文件名、字节大小、SHA-256、退出码、范围和限制。
5. 新备份成功完成结构、权限、大小和 SHA-256 验证后，旧备份才可按 Product Owner 批准的受控轮换规则处理。
6. 数据库恢复必须使用独立 Mission 并由 Product Owner 明确授权；不得直接在 Production 数据库上试恢复。
7. 不创建保存明文密码的脚本或定时任务；任何后续自动化必须单独设计和授权。

## 5. 公开政策审核

最终 `V1-PUBLIC-POLICY.md` 与 Web `/legal` 页面没有声称 Free 套餐存在自动备份、PITR 已启用、所有备份由 Supabase 自动轮换，或所有数据会在 30 天内从全部备份永久消失。现有“备份副本按照最终确认的 Supabase 备份与轮换期限自然过期”表述与本次 Free 套餐事实不存在实质冲突。

## 6. PDR-02 结论

PDR-02 的关闭条件已满足：Free 套餐与 `No backups` 已确认；Schema/Data 导出成功且非空；文件权限、大小和 SHA-256 已验证；备份位于仓库外；角色状态和范围限制已记录；仓库未包含备份数据；未修改远程数据库、执行恢复或部署 Production。

`PDR-02 = CLOSED FOR DEPLOYMENT`。

PDR-01 同样保持 `CLOSED FOR DEPLOYMENT`。最终政策、`/legal` 和本备份证据已纳入排除冻结 `/access` Admin 改动的干净 RC 并通过验证；最终 commit SHA 由本次 RC Mission 生成并交由 Product Owner 审阅。`Production Ready = YES / AWAITING PRODUCT OWNER AUTHORIZATION`，`Production Deployment Authorized = NO`。
