# ADMIN P1-05A — Dedicated Non-Production QA Preparation

状态：`PASS — DEDICATED QA PROJECT IDENTIFIED / P1-05B NOT AUTHORIZED`
日期：2026-08-20
基线：`10056a8101720e948b1de3cceef96112623c0fec`

## 1. 结论与授权边界

P1-05A 已冻结环境隔离、合成 fixture、凭据处理、write window、emergency
close-writes、清理/保留、Migration apply、QA matrix 与证据合同。P1-05A2 先通过 Supabase
Management metadata 证明账户中不存在可复用的 dedicated QA Project，再按 Product Owner 授权创建
一个 Free/Nano、与 Production 同区域、用途唯一的 non-Production Project。只读取 Project metadata，
未连接任何 database/API/Auth data plane。

因此：

- P1-05A：`PASS / WAITING FOR PRODUCT OWNER COMMIT AUTHORIZATION`；
- P1-05B readiness：`READY FOR PRODUCT OWNER EXECUTION AUTHORIZATION`；
- dedicated Project identity 与 Production inequality 已通过非敏感 metadata 证明；
- 本文不是 P1-05B 执行授权，不允许 remote Migration、SQL、fixture、Auth、RPC、ACL 或清理操作。

## 2. Dedicated QA Project 识别 Gate

已创建明确标记为 `fandom-harbor-admin-p1-qa` 的专用 Project。Project 创建前后的检查仅使用非敏感
Management metadata，没有通过连接数据库或登录应用辨认环境。

| 证明项                | 必需证据                                              | Gate                                   |
| --------------------- | ----------------------------------------------------- | -------------------------------------- |
| Project identity      | QA Project display name、project ref 与环境所有者确认 | ref 不等于 Production ref              |
| API isolation         | QA API origin 的 host/ref 摘要                        | 不等于 Production URL                  |
| Database isolation    | QA database host/project ref 的脱敏摘要               | 不等于 Production connection           |
| Secret isolation      | secrets inventory 名称、来源和独立轮换记录；不记录值  | 不复用 Production secret               |
| Auth isolation        | 仅本文定义的 synthetic Auth inventory                 | 无 Production Auth user                |
| Data isolation        | clean project/catalog/count evidence                  | 无 backup、PII 或 Production row       |
| Session isolation     | 独立 QA browser profile/cookie jar 或 server runner   | 不复用 Production Session/cookie/token |
| Application isolation | QA-only Admin build/runtime identity evidence         | Production Admin/Web 不连接 QA         |

### P1-05A2 provisioning evidence

| 字段                      | QA                                    | Production authority                  | 结果                         |
| ------------------------- | ------------------------------------- | ------------------------------------- | ---------------------------- |
| Display name              | `fandom-harbor-admin-p1-qa`           | `fandom-harbor`                       | PASS                         |
| Project ref / Auth tenant | `gqtchjrmpuxibxmurvfd`                | `szfhngifsipsrxcpekti`                | PASS                         |
| Region                    | `ap-southeast-1`                      | `ap-southeast-1`                      | MATCH AS PLANNED             |
| API host                  | `gqtchjrmpuxibxmurvfd.supabase.co`    | `szfhngifsipsrxcpekti.supabase.co`    | PASS                         |
| Database host             | `db.gqtchjrmpuxibxmurvfd.supabase.co` | `db.szfhngifsipsrxcpekti.supabase.co` | PASS                         |
| Organization              | `xvinmfkqosgvjdobeebf`                | `xvinmfkqosgvjdobeebf`                | expected same owner boundary |
| Status                    | `ACTIVE_HEALTHY`                      | `ACTIVE_HEALTHY`                      | metadata only                |
| Provisioning              | created 2026-08-20                    | existing                              | PASS                         |
| Purpose                   | dedicated Admin P1 non-Production QA  | Production                            | PASS                         |

Cost Gate：创建前 Management metadata 只列出一个 active Project；当前
[Supabase Free pricing](https://supabase.com/pricing) 与
[billing contract](https://supabase.com/docs/guides/platform/billing-on-supabase) 允许两个 active Free
Project。创建请求显式指定 Free-only `nano`、无 HA/add-on，并成功完成；没有 plan upgrade、payment
selection 或新增付费确认。

QA Project 是平台新建的独立 Project，因此 API/Auth/database/secrets inventory 均按新 ref 隔离。创建
过程中没有读取、复制或输入 Production key、database password、user、Session、Cookie、Token 或数据；
没有导入 backup。QA secrets 为 `CREATED / AVAILABLE / NOT EXPOSED`，未获取或记录完整值，CLI trace
也未记录 database-password 参数。Production 永远不是 fallback。

## 3. 环境隔离规则

1. QA Project ref、API URL、database host、Auth tenant、keys 与 Production 必须全部不同。
2. QA 不导入 Production backup、用户 ID、PII、Membership、Role、Audit、Ledger 或业务数据。
3. QA 使用独立运行时变量集合；Production Admin/Web 的变量不得复制到 QA runner。
4. QA 浏览器状态必须使用空白、专用 profile；不得导入 Production cookie、Session 或 token。
5. QA Admin 只能作为未来 P1-05B 的隔离测试构建运行，不修改 Production deployment 或域名。
6. evidence 只记录 project ref/URL 的脱敏比较、catalog、计数、hash 与测试结果，不记录 key、密码、
   cookie、Session、token 或连接串。
7. runner 启动前必须显示明确的 `NON_PRODUCTION / ADMIN P1 QA` banner，并对 QA ref 做 allowlist
   exact match；任何未配置或 Production ref match 均 fail closed。

## 4. Synthetic fixture inventory

所有 registration name 使用 `qa_p1_synthetic_` 前缀。UUID 由 future setup runner 在 QA 内生成，
不得复制或固定为 Production user ID。若 Auth provider 必须使用 email，则只使用 reserved invalid/test
domain 的合成地址并保存在受控 fixture inventory；文档、Git 与 evidence 不保存密码。

| Fixture key                         | Membership | active Role           | 用途                                     |
| ----------------------------------- | ---------- | --------------------- | ---------------------------------------- |
| `qa_p1_synthetic_reader_01`         | active     | Reader/no grant       | ordinary target；Reader operator deny    |
| `qa_p1_synthetic_author_01`         | active     | Author                | Author target；Author-only operator deny |
| `qa_p1_synthetic_suspended_01`      | suspended  | none                  | suspended ordinary target                |
| `qa_p1_synthetic_revoked_01`        | revoked    | none                  | revoked ordinary target                  |
| `qa_p1_synthetic_ordinary_02`       | active     | none                  | competing Membership/Role cases          |
| `qa_p1_synthetic_admin_operator_01` | active     | Admin                 | primary operator；`admin:operate`        |
| `qa_p1_synthetic_super_operator_01` | active     | Super Admin           | secondary operator；`admin:operate`      |
| `qa_p1_synthetic_admin_target_01`   | active     | Admin                 | elevated target deny                     |
| `qa_p1_synthetic_super_target_01`   | active     | Super Admin           | elevated target deny                     |
| `qa_p1_synthetic_super_last_01`     | active     | Super Admin           | last active Super Admin guard            |
| `qa_p1_synthetic_admin_inactive_01` | suspended  | Admin                 | inactive operator deny                   |
| `qa_p1_synthetic_revoked_admin_01`  | active     | revoked Admin history | revoked-role operator deny               |

Last-active-Super fixture 必须在隔离子场景中证明只有 `qa_p1_synthetic_super_last_01` 同时满足 active
Membership 和未撤销 Super Admin grant；测试只验证保护，不执行任何 elevated mutation success。

当前 capability 是由 active Membership 与实时 Role 映射得到，不能在不破坏冻结模型的情况下构造
“active Admin 但缺少 `admin:operate`”。该拒绝条件通过 active Reader/Author 的无 capability 路径、
inactive Admin 的 live-state 路径以及既有 Service unit contract 三重验证；不得修改 capability mapping
来伪造远程 fixture。

Fixture setup 必须可重复、以命名空间选择器定位、在创建前证明目标 namespace 为空，并记录每类预期
计数。Fixture teardown 只能删除该轮 inventory 中创建的 UUID，禁止按宽泛条件删除。

## 5. Credentials and service-role handling

- QA publishable/anon key 只进入 QA-only runtime；它不是授权依据，仍由 Session、Membership、Role、
  capability 和数据库实时状态授权。
- authenticated test credentials 由批准的本地 QA runner 从临时 secret store 注入；每个 operator
  使用独立合成凭据，不进入参数、URL、日志、截图、test snapshot 或 shell history。
- service-role 若 Auth fixture setup/cleanup 确有必要，只能由本地或受控 server-side runner 在对应
  子步骤短时读取；不得进入浏览器、Admin UI、Git、Markdown、CI log 或 evidence。
- database password/management token 同样只允许临时 secret injection。runner 只记录“defined / source
  approved / target ref matched”，不记录值或 hash。
- write window 结束后立即撤销 synthetic Sessions，删除或禁用 synthetic Auth users，并轮换/删除临时
  runner credentials。Production credential 使用始终为 `NO`。

## 6. QA database lifecycle

仓库现有 `scripts/local-qa-fixture.mjs` 已只读复核：它 exact-check loopback API 和本地 Docker
database container，并把凭据标记为 `local-only`。它属于既有 Release Readiness 本地阅读 fixture，
主体与清理范围都不满足本 P1 identity-governance inventory。P1-05B 不得删除其 loopback guard、不得将
它改造成 remote runner，也不得复用其固定 UUID/credential file。未来如需要专用 remote setup/cleanup
runner，必须由单独 Product Owner 授权创建并接受独立安全审阅；P1-05A 不创建执行脚本。

1. **Identity gate**：完成第 2 节全部隔离比较；未通过不得连接。
2. **Clean initial state**：确认专用 Project 没有未批准 Migration、Auth user 或业务数据；否则重建，
   不在未知状态上修补。
3. **Catalog before**：采集 Migration history、schema、function ACL、RLS、表计数与合成 namespace hash。
4. **Migration apply**：仅按第 7 节完整应用当前 20 个正式 Migration；不得跳过或手造最终 schema。
5. **Post-apply gate**：验证第 8 节 ACL、RLS、immutable trigger、private schema 与 Version 7 P0 基线。
6. **Fixture setup**：创建第 4 节 inventory，并核对 UUID/registration name/计数清单。
7. **Write window**：仅执行第 10 节矩阵，持续记录 requestId 与预期状态，不做 exploratory mutation。
8. **Evidence collection**：生成第 11 节脱敏证据。
9. **Close writes**：撤销三个 v2 RPC 的 authenticated execute，并证明全部 write channel closed。
10. **Cleanup**：删除本轮 synthetic Auth/业务/Audit/Ledger 数据和临时凭据。
11. **Post-cleanup verification**：计数、namespace hash、ACL、old/helper deny 与无 active Session 复核。
12. **Dispose or retain closed**：优先销毁 disposable QA Project；如经 Product Owner 批准保留，必须保持
    writes closed，下一轮从 clean rebuild 开始。

## 7. Migration apply plan

仓库当前有 20 个正式 Migration。未来 P1-05B 必须从第一个 Migration 开始按文件名时间戳 clean
apply；P1-05A 不创建或修改 Migration。

P1 ordinary governance 的 A–D 为最后四个 Migration，顺序固定：

1. A — `20260817104616_admin_p1_identity_access_ledger.sql`
2. B — `20260817121610_admin_p1_identity_access_reads.sql`
3. C — `20260817125140_admin_p1_identity_access_writes.sql`
4. D — `20260819225318_admin_p1_identity_access_cutover.sql`

A 依赖既有 identity/Membership/Role/Audit foundation；B 依赖 A 的 expected-state helper；C 依赖 A；
D 依赖旧 RPC、三个 v2 RPC 和 P1-04B 已就绪的应用链。P0 Site Copy 两个 Migration 位于 A 之前。
remote history 必须与仓库 20 项精确对应；出现额外、缺失、乱序或需要新 Migration 时立即停止。

## 8. Expected post-apply ACL and catalog

每个数字表示“三个准确签名 × 四个应用角色”的 catalog 检查；允许项只能是表中所列角色。

| Surface                       | `PUBLIC` | `anon` | `authenticated` | `service_role` | 合计 execute=true |
| ----------------------------- | -------: | -----: | --------------: | -------------: | ----------------: |
| old write RPC                 |        0 |      0 |               0 |              0 |            `0/12` |
| ordinary v2 write RPC         |        0 |      0 |               3 |              0 |            `3/12` |
| read RPC                      |        0 |      0 |               3 |              0 |            `3/12` |
| nine private helpers/executor |        0 |      0 |               0 |              0 |            `0/36` |

准确 write signatures：

- `grant_author_role_v2(uuid,uuid,text,text)`
- `revoke_author_role_v2(uuid,uuid,text,text)`
- `set_ordinary_membership_state_v2(uuid,uuid,membership_state,text,text)`

准确 legacy signatures：

- `grant_role(uuid,elevated_role,text)`
- `revoke_role(uuid,elevated_role,text)`
- `set_membership_state(uuid,membership_state,text)`

还必须证明无 schema-wide function grant、无 broad/default privilege 漂移、private ledger 未进入 exposed
schema、ledger RLS enabled、应用角色无 ledger table privilege、Ledger/Audit UPDATE/DELETE trigger 生效。

## 9. Write window and emergency close-writes

### Start conditions

只有 Product Owner 单独授权 P1-05B，且 environment identity、20-Migration apply、ACL、fixture inventory、
pre-test count/hash 和 runner credential checks 全部 PASS 后，write window 才能开始。执行者限获授权的
QA operator；窗口开始/截止时间和 QA ref 必须记录为脱敏 evidence。

### Allowed actions

只允许第 10 节列出的 read、ordinary Membership、Author Role、deny、idempotency、concurrency、rollback
与 P0 regression。禁止 exploratory SQL、任意 role mutation、elevated success、Production 连接和范围外
数据创建。

### Normal close and emergency close

发生 unexpected ACL/elevated write/Audit-Ledger anomaly/old RPC access/fixture escape/无法解释的重复
mutation/security mismatch 时立即停止请求，撤销 `authenticated` 对第 8 节三个准确 v2 signatures 的
execute。随后验证：

1. v2 write `0/12`；
2. legacy write 仍为 `0/12`；
3. private helper/executor 仍为 `0/36`；
4. PUBLIC/anon/service_role 没有 write execute；
5. 已签入合成 operator 的 write 调用得到 privilege deny；
6. 未发生 schema-wide/default privilege grant；
7. 异常后的业务/Audit/Ledger 计数和 hash 已冻结并保存脱敏证据。

正常结束也执行同一 close-writes。不得通过恢复旧 RPC 回滚。恢复到 QA pre-test state 的唯一方式是：
先清理或销毁当前 QA，再在新的 Product Owner write window 下从完整 20-Migration clean apply 重建；
不得手工重开旧 RPC，也不得在脏环境中临时补 grant。

防误操作 Production：所有 future ACL 命令前必须由 runner exact-match QA allowlist ref，并拒绝已知
Production ref；连接 target、Project banner 和 planned ref 任一不一致即退出。P1-05A 不执行这些命令。

## 10. P1-05B QA matrix

| Area                 | Cases                                                                               | Expected evidence                                    |
| -------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Read                 | Search、Detail、Audit；Admin/Super allow；Guest/Reader/Author/inactive deny         | 最小投影、稳定分页；deny 不泄漏 target               |
| Membership Saved     | active→suspended、suspended→active、active/suspended→revoked、revoked→active        | 一次业务变化、一次 Audit、一个 Saved Ledger          |
| Membership Unchanged | current state 等于 desired `active/suspended/revoked`                               | 零变化、零 Audit、一个 Unchanged Ledger              |
| Membership Conflict  | Review 后 state 或 `updated_at` 改变                                                | current snapshot/token；零变化、零 Audit             |
| Author Saved         | ordinary active target Grant Author；现有 Author Revoke Author                      | 一次 grant/revoke、一次 Audit、一个 Saved Ledger     |
| Author Unchanged     | existing Author 再 Grant；无 Author 再 Revoke                                       | 零变化、零 Audit、一个 Unchanged Ledger              |
| Author Conflict      | stale token；inactive target Grant                                                  | current snapshot/token；零业务 Audit                 |
| Idempotency          | same requestId + same payload 重放 Saved/Unchanged/Conflict                         | 逐字段同结果；无新增业务/Audit/Ledger                |
| Request mismatch     | 同 requestId 改 actor/target/operation/reason/expected-state                        | `REQUEST_ID_MISMATCH`；零新增写入                    |
| Concurrency          | 同 requestId；同 target 同 action 不同 request；竞争 state change                   | exactly-once 或 Saved+Conflict；无双 Audit           |
| Authorization        | invalid Session、Reader、Author、inactive Admin、revoked Admin、无 `admin:operate`  | 在 write Port/RPC 前 deny；零写入                    |
| Elevated denial      | Admin target、Super Admin target、suspended/revoked 但保留 elevated grant 的 target | `ELEVATED_MUTATION_DEFERRED`；业务/Ledger/Audit 均零 |
| Legacy denial        | authenticated 调三个 legacy signatures                                              | privilege denied；零写入                             |
| Atomic rollback      | 受控 Audit failure、Ledger failure                                                  | 业务、Audit、Ledger 全部回滚；无 orphan              |
| Last Super Admin     | isolated last-active fixture guard                                                  | guard 保持；不得执行 elevated success                |
| P0 regression        | Site Copy Version 7、八字段、read/write/immutability 必要 suite                     | Version 7 与数据不变量不变                           |

每次 mutation 必须使用预先记录的唯一 requestId 和数据库返回的 expected-state；Repository/Service 不自动
retry，不自动覆盖 Conflict。不得为了制造 failure 修改正式 Migration；failure harness 必须使用既有受控
测试合同并在隔离 transaction/fixture 范围内恢复。

## 11. Evidence collection

P1-05B evidence bundle 必须包含：

- QA display name/project ref/API/database 与 Production 的脱敏 inequality evidence；
- 20-Migration apply log 与 catalog snapshot；
- ACL before/post-apply/close-writes snapshots；
- synthetic fixture inventory，仅含 fixture key、QA UUID 和状态，不含 credential；
- pre-test/post-test/post-cleanup table counts 与 canonical fixture-state hash；
- 每个 matrix case 的 requestId、expected result、actual result 和 PASS/FAIL；
- concurrency timeline、same-request replay 与 mismatch 证据；
- Conflict current snapshot/token 的存在性证明，token 值须截断或 hash；
- elevated zero-business/zero-Ledger/zero-Audit 差分；
- Saved Audit/Ledger reference 对应和 failure rollback 差分；
- legacy denial、last Super Admin、P0 Version 7 证据；
- cleanup inventory、无 active synthetic Session、post-cleanup count/hash；
- emergency close-writes rehearsal/最终 close 状态；
- `Production credentials/data/access/side effects = NO` 的执行者声明。

Evidence 不得包含密码、key、connection string、cookie、Session、access/refresh token、完整 header、原始
provider error 或 Production PII。截图必须裁去浏览器 storage、地址参数和 secret-bearing 控制台内容。

## 12. Cleanup and retention

| Artifact                      | End-of-window action                                    | Retention                                    |
| ----------------------------- | ------------------------------------------------------- | -------------------------------------------- |
| synthetic Auth users/Sessions | revoke Sessions，删除用户                               | 窗口结束立即删除                             |
| Membership/Profile/Role rows  | 按本轮 UUID inventory 删除并核对                        | 不保留                                       |
| Audit/Ledger/requestId rows   | 先采集脱敏 evidence，再通过 approved cleanup/reset 移除 | 不保留于可继续写环境                         |
| test artifacts/raw logs       | 删除 secret-bearing/raw provider 内容                   | 最迟 7 天                                    |
| sanitized Acceptance Evidence | 纳入 P1-05B 文档审阅                                    | 保留到 P1 Closure 后 90 天或项目规则更长期限 |
| screenshots                   | 仅保留必要且已脱敏项                                    | 与 Acceptance Evidence 相同                  |
| temporary credentials         | revoke/delete/rotate                                    | 窗口结束立即处理                             |
| closed QA Project             | 优先销毁；保留需 Product Owner 批准                     | 保留期间 writes 必须 closed                  |

不得把 QA 数据、Auth user、Audit/Ledger 或 fixture 导入 Production。

## 13. Post-cleanup verification

完成 cleanup 后必须证明：fixture inventory 中所有 Auth UUID、Profile、Membership、Role、Audit、Ledger
与 requestId 均不存在；合成 namespace count 为零；非 fixture 基线 count/hash 未变化；三个 v2 write
RPC 已关闭；legacy/private deny 保持；不存在 active synthetic Session 或临时 credential；evidence bundle
通过 sensitive scan。任何残留都使 P1-05B FAIL，并保持 writes closed。

## 14. P1-05B entry gate

| Gate                                         | 当前状态          |
| -------------------------------------------- | ----------------- |
| Dedicated QA Project identified              | PASS              |
| Production isolation proven                  | PASS              |
| Synthetic fixture plan                       | READY             |
| Fixture cleanup/retention plan               | READY             |
| Write window                                 | READY             |
| Emergency close-writes                       | READY             |
| Migration apply plan                         | READY             |
| ACL verification matrix                      | READY             |
| QA matrix                                    | READY             |
| Evidence plan                                | READY             |
| Credential handling plan                     | READY             |
| No Production credential/data dependency     | READY by contract |
| No elevated success test                     | READY by contract |
| Product Owner P1-05B execution authorization | NOT AUTHORIZED    |

P1-05A entry requirements 全部满足。P1-05B 为 `READY FOR PRODUCT OWNER EXECUTION AUTHORIZATION`，但
仍是 `NOT AUTHORIZED / NOT STARTED`；只有 Product Owner 单独授权后才能开始。

## 15. Preparation validation

- Branch/HEAD：`codex/admin-p1-04-ordinary-mutations` / `10056a8101720e948b1de3cceef96112623c0fec`；开始前 clean、staged empty。
- Migration inventory：20 项；P0 两项后依次为 A、B、C、D；无新增或修改。
- Migration contract：22/22 PASS；strict Repository：24/24 PASS；live-access Service：57/57 PASS。
- 本地只读 catalog：legacy `0/12`、ordinary v2 `3/12`、read `3/12`、private helper/executor `0/36`。
- Remote metadata：QA Project `ACTIVE_HEALTHY`；QA/Production ref、API host、database host 与 Auth tenant inequality PASS；region 同为 `ap-southeast-1`。
- Cost：Free-only Nano provisioning succeeded；无 upgrade、payment selection、HA 或 add-on。
- 定向 Prettier、`git diff --check`、内部链接、敏感信息、provider/scope 与 Production reference audit：PASS。
- 变更范围：本准备文档、Admin P1 README/Roadmap 与 `.ai` Status/Memory/Changelog，共六份 docs-only 文件；staged=0。

## 16. 本轮无副作用声明

P1-05A2 的唯一远程 side effect 是创建一个 Free/Nano dedicated non-Production QA Project。未连接 QA
database/API/Auth data plane，未访问 Production，未执行 remote Migration/SQL/RPC/Auth/ACL/fixture/
cleanup，未修改代码、Migration、RLS、Grant、Auth、依赖或配置，未 stage/Commit/Push/PR/Merge，未开始
P1-05B、P1-06、P1-07 或 P1.1。Admin Production 仍为 `paused=true`，Web Admin entry 仍关闭，P0
Production Site Copy 仍为 Version 7。
