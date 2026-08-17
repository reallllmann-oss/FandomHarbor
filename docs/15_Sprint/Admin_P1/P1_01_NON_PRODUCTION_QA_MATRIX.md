# ADMIN P1-01 — Dedicated Non-Production QA Matrix

状态：`DESIGN CLOSED — OPTION 3 / NOT EXECUTED`
日期：2026-08-17
基线：`b634da010755e7768043eea41c426ad499a269fb`

## 1. 环境门禁

未来 P1 写入 QA 只能使用一个专用、可重建、非 Production Supabase Project。

- Project ref、数据库、Auth 用户、Storage、API keys、Redirect URLs 与 Production 完全不同。
- Admin/Web QA 使用 QA URL + publishable key；浏览器、日志、fixture 与仓库不得出现 secret/service-role key。
- QA 不复制 Production 数据、Auth 用户、Session、Cookie、Token 或密码；只使用合成身份和无敏感 fixture。
- Admin Production 保持 `paused=true`，不作为可用性探针、Migration 目标或浏览器测试环境。
- 每轮前记录 Migration catalog、grant/RLS/function、表计数与 fixture hash；每轮后证明只有预期 Audit/ledger/业务变化。
- 先执行 clean local rebuild、静态 contract tests 和 SQL transaction suites，再申请任何专用远程写入授权。

本 P1-01 Mission 没有创建、连接或写入该环境。

## 2. 合成身份

| Fixture         | Membership | Active grants               | 用途                         |
| --------------- | ---------- | --------------------------- | ---------------------------- |
| Guest           | None       | None                        | unauthenticated deny         |
| Reader          | active     | None                        | authenticated non-admin deny |
| Author          | active     | author                      | non-admin deny、普通 target  |
| Admin A         | active     | admin                       | Author/普通 Membership allow |
| Admin B         | suspended  | admin                       | stale Session/live DB deny   |
| Super A         | active     | super_admin                 | elevated read/写入拒绝       |
| Super B         | active     | super_admin                 | final-Super-Admin guard 回归 |
| Revoked Super   | active     | revoked super_admin history | live role deny               |
| Pending member  | pending    | None                        | grant target conflict        |
| Ordinary member | active     | None                        | Membership allow             |

当前 P1 不设计或执行 Reauth password flow。任何未来密码 fixture 只能由获准 QA runner 通过安全 secret injection 提供，不打印、不写 fixture、不写快照。Option 3 下不执行任何 elevated mutation success case，只执行 read-only、拒绝和 guard 回归测试。

## 3. 读取测试

| Case                                        | 预期                                                      |
| ------------------------------------------- | --------------------------------------------------------- |
| Guest/Reader/Author 调目录、详情、Audit RPC | Deny；无目标存在性泄漏                                    |
| active Admin/Super Admin 浏览目录           | Allow；默认 25、最大 50；稳定 tuple cursor                |
| 注册名大小写/NFKC 等价精确查询              | 命中同一 user；不做 substring/prefix 枚举                 |
| 完整 UUID 查询                              | 只返回目标；无 Auth email/phone/metadata                  |
| malformed UUID/注册名                       | 稳定 InvalidInput；不回显原输入                           |
| null registration name                      | 明确 masked label/nullable field；稳定排在有名账号后      |
| suspended/revoked Admin 使用未过期旧 JWT    | live Membership/Role 检查拒绝                             |
| target suspended 但保留 active grant        | activeRoleGrants 可见，effectiveRoles 为空                |
| elevated target 详情                        | 允许读取必要脱敏字段；写控件不可执行并提示未来 Reauth/MFA |
| Audit pagination 同 timestamp 多行          | 以 `(created_at,id)` 无重复、无遗漏                       |
| Audit 投影                                  | 仅治理 action 和允许 before/after；无任意 raw metadata    |

## 4. Mutation 基础矩阵

每个允许的低风险操作至少覆盖：

| Case                                                     | 业务行         | Audit                  | Ledger/结果                         |
| -------------------------------------------------------- | -------------- | ---------------------- | ----------------------------------- |
| Saved                                                    | 精确一次变化   | 精确一条               | 一条 saved，引用同一 Audit          |
| Unchanged                                                | 零变化         | 零                     | 一条 unchanged                      |
| stale expected-state                                     | 零变化         | 零                     | 一条 conflict + 最新安全摘要        |
| 同 requestId/同 payload 重放 Saved                       | 不增加         | 不增加                 | 返回逐字段相同原结果                |
| 同 requestId/同 payload 重放 Unchanged/Conflict          | 不增加         | 不增加                 | 返回逐字段相同原结果                |
| 同 requestId/不同 reason/target/operation/expected-state | 零变化         | 零                     | RequestIdMismatch；不泄漏原 payload |
| 并发同 requestId                                         | 最多一次       | 最多一条               | 两调用获得同结果                    |
| 强制 Audit insert 失败                                   | 全部回滚       | 零                     | 无 ledger ghost row                 |
| 强制 ledger insert 失败                                  | 全部回滚       | 零                     | 无业务部分变化                      |
| 非法 reason 3/201 code points、控制字符、换行            | 零变化         | 零                     | InvalidInput                        |
| reason NFC/trim 等价                                     | 使用同一规范值 | Saved Audit 保存规范值 | fingerprint 等价                    |

## 5. 权限矩阵

| Actor / operation                        | 预期                                                              |
| ---------------------------------------- | ----------------------------------------------------------------- |
| Admin → Grant/Revoke Author              | Allow（target grant 条件满足）                                    |
| Admin → ordinary Membership              | Allow；自停用 Deny                                                |
| Super Admin → Grant/Revoke Author        | Allow                                                             |
| Super Admin → ordinary Membership        | Allow                                                             |
| 任一 actor → Admin/Super Admin role      | Deny at DB；当前 RPC 无 role 参数；零业务变化、零 Audit           |
| 任一 actor → elevated-account Membership | Deny at DB；无论 target Membership 当前状态；零业务变化、零 Audit |
| suspended/revoked actor → 任意读写       | Deny based on live state                                          |
| JWT/user_metadata 伪造 role              | Deny；数据库 role_grants 才是事实                                 |
| target pending/suspended → Grant Author  | Conflict，零 Audit                                                |
| Membership target state `pending`        | InvalidInput；v2 不允许写入                                       |
| 旧 RPC 或 direct table write 尝试        | execute/privilege denied；不得形成 elevated 或低风险绕过          |

## 6. Expected-state 与并发

| Race                                         | 预期                                                       |
| -------------------------------------------- | ---------------------------------------------------------- |
| Review 后 Membership active→suspended        | 旧 token Conflict                                          |
| Review 后 Membership active→suspended→active | `updated_at` 变化，旧 token Conflict                       |
| Review 后 Author revoke→regrant              | active grant UUID 变化，旧 token Conflict                  |
| Review 后新增另一个 role                     | 完整 active-role snapshot 变化，旧 token Conflict          |
| 两个 requestId 对同 target 不同操作          | 全局锁串行；一个 Saved，另一个根据新 token Conflict        |
| 两 Super Admin 同时互相 revoke 尝试          | 两者均拒绝；零 Saved；既有 final-Super-Admin guard 仍存在  |
| revoke Super Admin / suspend elevated target | 所有当前入口拒绝；不执行 elevated success/concurrency case |
| old RPC direct call after cutover            | `authenticated` execute denied                             |

## 7. KI-033 延期边界与拒绝矩阵

Option 3 下不存在当前 P1 proof issuer、proof consumer 或 elevated success case。下列尝试必须 fail closed，且不得写 ledger business result、业务行或 Audit：

- 客户端 `reauthenticated=true`、自签 proof 或隐藏 feature flag。
- 普通 Session 年龄、JWT `iat`、再次普通登录或新建 `aal1` Session 代替 step-up。
- 向当前 Author RPC 注入 `admin`/`super_admin` role，或调用不存在的 elevated v2 名称。
- 以 suspended/revoked Membership 为由，把仍有未撤销 elevated grant 的 target 当作普通账户。
- 直接调用旧 RPC、PostgREST table mutation 或其他客户端直写。
- password/Token/Cookie/Session/secret 出现在浏览器状态、URL、日志、Audit、ledger、错误或测试快照。

未来只有在独立 Product Owner 授权及新 Auth ADR 完成后，才能新增 proof 失效与 elevated Saved 测试；届时优先评估 Supabase MFA/AAL2。延期不表示 KI-033 技术已解决。

## 8. Catalog 与安全断言

- private ledger 不在 exposed schema；RLS enabled；`PUBLIC/anon/authenticated/service_role` 无 table/sequence privilege。
- read RPC 为 `SECURITY INVOKER`，只授予 authenticated execute。
- 当前三个低风险 write RPC 设计为 `SECURITY DEFINER`：空 search path、全限定对象、PUBLIC/anon deny、authenticated 精确 grant；catalog 中不得存在 elevated v2 write RPC。
- parameterized private authorization/helper/ledger function 不向 authenticated 暴露。
- 三个旧 RPC cutover 后 authenticated execute 为 false，回滚也不得恢复为普通应用入口。
- direct table INSERT/UPDATE/DELETE 继续对应用角色撤销。
- Identity Access Audit action 的 UPDATE/DELETE 被数据库 Trigger 拒绝。
- `user_metadata`、JWT role claim 不参与任何允许路径。

## 9. Completion evidence

未来普通治理 QA 报告必须给出 SQL suite、TypeScript/Lint/Test、双连接并发、catalog snapshot、前后表计数和敏感扫描结果。当前矩阵不要求 elevated mutation 成功测试，但必须证明 elevated 读取允许、写控件不可执行、数据库写入拒绝、旧入口不可调用及最后一名 active Super Admin 保护未被删除或弱化。测试后只保留明确批准的合成 QA 数据；不得声称 P1-01 设计已执行这些测试。
