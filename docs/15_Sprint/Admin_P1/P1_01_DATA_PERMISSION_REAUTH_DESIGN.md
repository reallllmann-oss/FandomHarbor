# ADMIN P1-01 — Data, Permission and Reauth Feasibility Design

状态：`DESIGN CLOSED — OPTION 3 / ELEVATED MUTATIONS DEFERRED`
日期：2026-08-17
唯一基线：`b634da010755e7768043eea41c426ad499a269fb`
实施状态：仅设计；没有产品代码、Migration、SQL 或远程状态变更

## 1. 结论

P1-01 已依据 P1-00 合同、当前代码、16 份有序 Migration、现有 SQL/TypeScript 测试及 2026-08-17 Supabase 官方合同完成设计。

- Membership 与 Role Governance 共用现有 `profiles`、`memberships`、`role_grants`、`audit_logs`，不新增 role、capability 或授权事实源。
- 读模型使用字段最小化、稳定游标和数据库生成的 expected-state；不读取或返回内部 Auth email-shaped identifier。
- 写模型需要新增 `private.identity_access_request_ledger`，以覆盖 Saved、Unchanged、Conflict 的完整幂等重放。
- 所有治理写入使用一个固定顺序的全局事务锁，数据库在锁内重算 expected-state、实时权限和最后一名 active Super Admin。
- 现有三个旧 RPC 缺少 requestId、expected-state、Unchanged/Conflict 和 Reauth，cutover 时必须原子撤销 `authenticated` execute；不得保留可绕过的新旧双写兼容期。
- KI-033 的技术阻断没有消失：现有 registration-name/password adapter 能验证密码，但不能向数据库提供与当前 Session 和单次 Review payload 绑定的不可伪造证明。Product Owner 已选择 ADR-022 Option 3，将当前 P1 状态记为 `ACCEPTED DEFERRED BOUNDARY`，全部 elevated mutations 为 `DEFERRED`。
- 普通治理可进入未来 P1-02 规划：用户搜索/分页、脱敏读取、普通账户 Membership 状态治理和 Author Role Grant/Revoke。elevated 账户可读但不可写。

本结论只授权 P1-01 docs-only closure commit；普通治理为 `AUTHORIZED FOR FUTURE P1-02 PLANNING`，但尚未授权开始 P1-02、Migration、远程 QA、Admin Unpause、Push、PR 或 Deployment。

## 2. 已审计基线

| 对象              | 当前证据                                                                                                  | P1-01 结论                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `profiles`        | `20260629210000_identity_access_foundation.sql`、`20260702090000_registration_name_invitation_signup.sql` | `user_id` 为 Auth FK；`registration_name` 使用大小写不敏感唯一索引；没有可投递 email/phone 字段                         |
| `memberships`     | Phase 1C foundation/workflow Migration                                                                    | 单行当前状态，含 `updated_at` 及 admitted/suspended/revoked 时间；active 是所有 capability 前提                         |
| `role_grants`     | Phase 1C foundation/workflow Migration                                                                    | append-oriented grant/revoke 历史；partial unique index 保证每个 user/role 最多一个 active grant                        |
| `audit_logs`      | Phase 1C foundation、Admin P0 Site Copy foundation                                                        | 应用角色只读；写入经 private helper；Site Copy 审计已有专项不可变 Trigger，Identity Access 事件尚无专项不可变 Trigger   |
| 当前 `/access`    | `apps/admin/src/app/access/page.tsx`、`actions.ts`                                                        | 仅 User ID、role/state、1–1000 reason；直接提交；无查询、Review、requestId、expected-state、Reauth                      |
| App 权限          | `packages/auth/src/identity.ts`、Admin actions/page                                                       | active Membership + live role 派生 `admin:operate` / `super_admin:operate`；页面与 Server Action 均检查 `admin:operate` |
| Database 权限     | `private.has_role` 与三个 public workflow RPC                                                             | DB 使用 `auth.uid()` 和实时 Membership/Role；不依赖 JWT role claim 或 `user_metadata`                                   |
| 旧 Role RPC       | `grant_role` / `revoke_role`                                                                              | Admin 仅 Author；Super Admin 管理 Admin/Super Admin；grant 要求 active target；revoke 有最后 Super Admin 保护           |
| 旧 Membership RPC | `set_membership_state`                                                                                    | Admin 管理普通成员；Super Admin 管理 elevated account；禁止自停用；最后 active Super Admin 受保护                       |
| Auth adapter      | `packages/auth/src/provider.ts`、`registration-policy.ts`                                                 | registration name 经 NFKC/trim/lower/SHA-256 映射内部 email-shaped identifier，再调用 `signInWithPassword()`            |
| Session adapter   | `createServerAuthProvider()`                                                                              | SSR cookie client；`getUser()` 验证身份后读取 Session；当前接口不暴露 session ID、AAL 或 step-up proof                  |
| 现有测试          | `phase_1c_identity_access.sql`、migration contract、identity/access unit tests                            | 已覆盖基本 RLS、权限矩阵、Audit 和最后 Super Admin；未覆盖 P1 幂等、expected-state 或 Reauth                            |

### 2.1 当前实现与冻结合同的兼容项

- `private.has_role()` 同时要求 active Membership 与未撤销 Role Grant，满足实时授权要求。
- 私有 helper 和 privileged workflow 均使用空 `search_path`，且从 `PUBLIC` 撤销 execute。
- `anon` 无四张身份治理表的直接权限；`authenticated` 的行读取由 RLS 限制。
- 三个旧 workflow 在单次数据库事务内完成业务变化与一条 Audit。
- Super Admin role 变化与 elevated Membership 停用使用同一 advisory lock，已有数据库侧最后一名 active Super Admin 保护。

### 2.2 当前实现的阻断差距

- 旧 RPC 对相同状态仍执行 UPDATE 并写 Audit；不存在 `Unchanged`。
- 旧 RPC 没有 expected-state，Review 后变化会 Last Write Wins 或以约束异常结束。
- 旧 RPC 没有 requestId；网络重试可能重复失败或产生非统一结果。
- Role grant/revoke 以异常表示“已存在/不存在”，没有封闭结果合同。
- reason 接受 1–1000 字符，未执行 P1 冻结的 NFC、4–200 code points、控制字符/换行拒绝。
- `audit_logs` 的 Identity Access 事件缺少数据库侧专项不可变 Trigger。
- `signInWithPassword()` 的成功结果不是数据库可验证、操作绑定、一次性 proof。

仓库现状没有与 P1-00 冲突；它是明确的 P0 基线，不能被解释为已满足 P1。

## 3. 权威数据模型

### 3.1 继续复用的事实

| 事实                | 唯一来源                               | 规则                                                                            |
| ------------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| 私有账号标识        | `profiles.user_id`                     | 与 `auth.users.id` 一致；客户端不能提交 actor ID                                |
| 注册名              | `profiles.registration_name`           | 仅用于受控查询和显示；不用于数据库授权                                          |
| Reader/账号可用状态 | `memberships.state`                    | 只有 `active` 产生 capability                                                   |
| Elevated Role 历史  | `role_grants`                          | `revoked_at is null` 表示 active grant；effective role 还要求 active Membership |
| Capability          | `packages/auth` + database live checks | 派生事实，不持久化新 capability                                                 |
| 安全审计            | `audit_logs`                           | Saved 精确一条；Unchanged/Conflict 不制造业务 Audit                             |

### 3.2 新增 private request ledger：需要

建议未来 Migration 新增 `private.identity_access_request_ledger`。它只保存幂等合同，不成为 Membership、Role 或 capability 的事实源。

| 字段                  | 建议类型/约束                                                                                | 目的                                                    |
| --------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `request_id`          | `uuid primary key`，拒绝 nil UUID                                                            | 全局唯一幂等键                                          |
| `actor_user_id`       | `uuid not null`，FK `profiles(user_id)` / restrict                                           | 防止跨 actor 重放                                       |
| `operation`           | constrained text：`grant_author_role`、`revoke_author_role`、`set_ordinary_membership_state` | 当前 P1 仅允许的三种低风险 payload                      |
| `target_user_id`      | `uuid not null`，FK `profiles(user_id)` / restrict                                           | 审计与检索                                              |
| `payload_fingerprint` | `bytea not null`，固定 32 bytes                                                              | 规范 payload 的 SHA-256；不保存 password 或完整 payload |
| `result_status`       | constrained text：`saved/unchanged/conflict`                                                 | 原结果类别                                              |
| `result_snapshot`     | `jsonb not null`，object check                                                               | 完整、安全、可重放的原结果                              |
| `audit_log_id`        | nullable bigint unique，FK `audit_logs(id)` / restrict                                       | 仅 Saved 非空；一条 Saved 对一条 Audit                  |
| `created_at`          | `timestamptz not null default statement_timestamp()`                                         | 取证与稳定查询                                          |

索引：主键；`(actor_user_id, created_at desc)`；`(target_user_id, created_at desc)`。`audit_log_id` 唯一约束同时保证一次 Saved 不复用另一条 Audit。

安全边界：

- schema 为未暴露的 `private`；不得加入 Data API exposed schemas。
- 表启用 RLS 作为纵深防御，但不创建应用角色 policy。
- 显式 `REVOKE ALL` from `PUBLIC`, `anon`, `authenticated`, `service_role`；应用角色无 schema/table/sequence 直达权限。
- 仅 owner-owned、受控 `SECURITY DEFINER` Mutation 可插入和读取；空 `search_path`、全限定对象名、`REVOKE EXECUTE FROM PUBLIC`。
- ledger append-only；正常路径只 INSERT，禁止 UPDATE/DELETE。未来清理不得直接绕过幂等合同。
- 保留期为 indefinite：P1 管理写入量低，且冻结合同要求同 requestId 永远返回原结果。任何 TTL/删除必须由后续 Retention ADR 先定义能保留 requestId、fingerprint 与结果语义的 archive/tombstone，P1 不自动清理。

`result_snapshot` 只包含安全 Domain 结果，不包含 password、Reauth 凭据、Token、Cookie、Session JWT、内部 email-shaped identifier、原始 SQL 错误或完整 Audit metadata。

## 4. 读取模型

### 4.1 调用者

三个读 RPC 均仅授予 `authenticated` execute。Product Owner 通过 [ADR-023](../../17_Architecture_Decisions/ADR-023.md) 冻结最小混合权限模型：搜索与 Audit 使用 `SECURITY INVOKER`；详情因必须调用不向应用角色开放的 P1-02A expected-state helper，允许使用一个严格只读的 `SECURITY DEFINER` boundary。三者都必须通过数据库实时要求 active Admin/Super Admin；应用 Service 仍在调用前要求 `admin:operate`。Guest、Reader、Author、suspended/revoked Admin 均为 deny。

搜索与 Audit 不需要访问 private helper 或 ledger，因此没有使用 `SECURITY DEFINER` 的理由。详情 definer 仅可调用 P1-02A snapshot/token helper，必须在读取 target 前用 `auth.uid()`、live active Membership 和未撤销 Admin/Super Admin grant 完成授权；空 `search_path`、全限定对象、禁止 dynamic SQL、字段最小化且零写入。private helper execute deny 和底层表 Grant 均不得扩大，expected-state 算法不得复制。

### 4.2 RPC 清单

#### `search_identity_access_subjects_v1`

- 输入：`query?: text`、`cursor?: { missingRegistrationName, normalizedRegistrationName, userId }`、`limit: integer`。
- Security mode：`SECURITY INVOKER`，复用现有 SELECT/RLS。
- query 为空时浏览目录；非空只接受规范化注册名精确匹配或完整 UUID，不提供 contains/prefix 枚举。
- limit 默认 25、最小 1、最大 50；拒绝 offset。
- 排序：`registration_name is null asc, lower(registration_name) asc, user_id asc`；cursor 使用同一 tuple，结果在未变化数据集内稳定。
- 返回：`userId`、`registrationName | null`、Membership state、effective roles、关键更新时间、`nextCursor | null`、`hasMore`。不返回总库精确计数，避免不必要的大表 count。

#### `get_identity_access_subject_v1`

- 输入：完整 `userId`。
- Security mode：严格只读 `SECURITY DEFINER`；完整安全合同见 ADR-023。未认证/无权限错误必须先于 target lookup，不能泄露目标是否存在；只有已授权 caller 可获得 NotFound。
- 返回字段：Profile created/updated；Membership state 与 admitted/suspended/revoked/updated；全部 active Role Grant 的 `grantId/role/grantedAt/grantedBy`；effective roles；是否 elevated account；是否当前唯一 active Super Admin；数据库生成的 `expectedState`。
- `activeRoleGrants` 与 `effectiveRoles` 分开：suspended/revoked target 可保留未撤销 grant，但 effective roles 必须为空。
- 不返回 Auth email/phone、password hash、Auth metadata、Session、Token、Cookie、邀请 secret 或无关业务资料。

#### `list_identity_access_audit_v1`

- 输入：完整 `userId`、`before?: { createdAt, auditId }`、`limit` 1–50。
- Security mode：`SECURITY INVOKER`，复用现有 SELECT/RLS。
- 排序：`created_at desc, id desc`；keyset cursor，不使用 offset。
- 只投影与 target Membership、该用户 Role Grant 有关的治理事件；Role 事件通过 `role_grants.id = audit_logs.target_id` 关联，不向客户端暴露任意 metadata。
- 返回：`auditId`、action、actor 的注册名/User ID、目标 role/state、规范化 reason、允许的 before/after 摘要、createdAt。

### 4.3 脱敏与错误

- 注册名是当前产品使用的私有凭据标识，只向 active Admin/Super Admin 显示；日志和错误不得回显查询输入。
- 查无结果返回 `NotFound`，无权返回 `Forbidden`，数据形状损坏返回安全 `Unavailable`；不得用空列表掩盖权限或损坏。
- Repository 严格解析 RPC JSON；PostgREST/SQL 详情只保留在受控 cause，不进入页面、日志正文或测试快照。

## 5. Expected-state

### 5.1 规范快照

数据库读取详情时生成：

```text
{
  targetUserId,
  membership: { state, updatedAt },
  activeRoleGrants: [
    { grantId, role, grantedAt }
  ] // 按 role, grantId 排序
}
```

`stateToken` 是上述规范 JSON UTF-8 的 SHA-256 hex。客户端保存可见快照和 opaque token，但不得自行计算或声明当前状态。

可靠性理由：

- 任意 Membership write 都改变 `updated_at`，即使状态往返后恢复也能检测。
- Role revoke 会移除 active grant；regrant 会生成新的 grant UUID/时间，能检测 revoke/regrant ABA。
- token 覆盖目标全部 active roles，可检测 Review 后新增或撤销另一个 elevated role。
- v2 Mutation 在数据库锁内从事实表重新生成 token；不信任页面、JWT role claim 或客户端 before 值。

### 5.2 检查顺序

1. 验证当前 `auth.uid()`、active Membership 和 live actor role。
2. 规范化输入并计算 payload fingerprint。
3. 取得 requestId advisory transaction lock；已有 ledger 时执行 replay/mismatch 规则。
4. 取得全局 `fandom-harbor:identity-access-governance` advisory transaction lock。
5. `FOR UPDATE` 锁定目标 Membership 和相关 active Role Grant 行。
6. 实时分类 target；`set_ordinary_membership_state_v2` 发现任一未撤销 Admin/Super Admin grant 时立即 `Forbidden`，零业务变化、零 ledger、零业务 Audit。
7. 重算 current state token。
8. token 不同：写一条 Conflict ledger，零业务变化、零业务 Audit。
9. token 相同：判断 Unchanged，再检查当前低风险操作的其余目标条件，最后执行 Saved。

所有 v2 写入共享全局锁。Identity governance 写入量低，优先选择简单、可证明的锁顺序，避免 Membership 与不同 Role 操作之间的死锁及 final-Super-Admin 竞态。

## 6. requestId、幂等与原子语义

### 6.1 Payload fingerprint

fingerprint 的规范 payload 包含：

- actor user ID（取自 `auth.uid()`，不取客户端）；
- operation；target user ID；目标 role 或 membership state；
- expected state token；
- NFC + trim 后的 4–200 Unicode code-point reason。

当前 P1 不接受或预留 proof 参数；未来 elevated mutation 必须由新的 Auth ADR 重新定义独立 payload 和 proof binding。

password、Session token、Cookie、Reauth secret 和数据库错误永不进入 fingerprint 原文、ledger、Audit 或日志。

### 6.2 Replay

- 同 requestId + 同 actor + 同 fingerprint：直接返回 ledger 中完全相同的 `result_snapshot`，不重复业务写入、不新增 Audit。
- 同 requestId + 不同 actor 或 fingerprint：稳定拒绝 `RequestIdMismatch`，不泄漏原 payload，不写 Audit。
- 并发相同 requestId：request lock 使一个事务先完成；后一个等待后读取原结果。
- 首事务失败：业务变化、Audit 和 ledger 同事务回滚；没有可被误认为成功的 pending row。

### 6.3 三种结果

数据库 wire 使用小写，Repository 映射到 Domain `Saved | Unchanged | Conflict`：

| 结果      | 条件                                                                      | 业务变化 | Audit    | ledger                          |
| --------- | ------------------------------------------------------------------------- | -------- | -------- | ------------------------------- |
| Saved     | expected token 相同、状态确需改变、实时权限与普通目标边界均通过           | 精确一次 | 精确一条 | 原子插入，引用 Audit            |
| Unchanged | expected token 相同且目标已经是请求状态                                   | 无       | 无       | 插入结果，支持原样 replay       |
| Conflict  | expected token 不同，或 Author target-active 等当前普通治理事实不允许请求 | 无       | 无       | 插入当前安全摘要，要求新 Review |

输入无效、无身份、无权限、requestId mismatch、数据损坏，以及任何 elevated mutation 尝试都是安全错误，不伪装成以上三种结果。

## 7. 写 RPC 合同

当前 P1 只设计三个按 capability 收窄的 RPC；接口形状本身不得表达 elevated 操作：

- `grant_author_role_v2(requestId, targetUserId, expectedStateToken, reason)`
- `revoke_author_role_v2(requestId, targetUserId, expectedStateToken, reason)`
- `set_ordinary_membership_state_v2(requestId, targetUserId, state, expectedStateToken, reason)`

Role RPC 没有 `role` 参数，因此不能请求 Admin/Super Admin。Membership 目标仅 `active/suspended/revoked`，不得写回 `pending`；数据库必须拒绝任何存在未撤销 `admin` 或 `super_admin` grant 的 target，不因其 Membership 当前是否 active 而放行。当前接口没有 `reauthProofId` 或其他 dormant elevated 参数。reason 在数据库再次 NFC/trim、拒绝控制字符和换行，并按 4–200 code points 校验。

### 7.1 输出

所有成功 transport 返回统一 object：

- `status`；`requestId`；`targetUserId`；新/当前 `stateToken`；安全 current summary。
- Saved 额外返回 `auditLogId`、`changedAt`、Role Saved 时的 `roleGrantId`。
- Unchanged 不含 `auditLogId`。
- Conflict 返回 `conflictReason` 与最新安全摘要，页面必须重新 Review，不能自动提交。

### 7.2 稳定错误

| Domain error             | 数据库类别                 | 语义                                                   |
| ------------------------ | -------------------------- | ------------------------------------------------------ |
| `AuthenticationRequired` | `28000`                    | 无可信 actor                                           |
| `Forbidden`              | `42501`                    | actor/target 边界拒绝；包括所有 elevated mutation 尝试 |
| `InvalidInput`           | `22023`                    | 字段、reason、UUID/token 非法                          |
| `RequestIdMismatch`      | `22023` + safe detail code | 同 requestId 不同 payload/actor                        |
| `TargetNotFound`         | controlled no-data code    | Profile/Membership 不完整                              |
| `Unavailable`            | safe mapped failure        | 未知内部错误；不暴露 SQL/PostgREST                     |

当前 P1 不设计 Reauth proof consumer，因此不暴露 `ReauthRequired/Invalid/Expired/Consumed` 作为可调用写接口合同。UI 对 elevated 账户显示 read-only 与未来 Reauth/MFA 提示；数据库对任何绕过尝试统一 fail closed。

### 7.3 SECURITY DEFINER 限制

写 RPC 需要跨越已撤销的 direct table mutation grant，并原子写 Membership/Role、Audit 和 private ledger，因此允许 `SECURITY DEFINER`；不存在用 invoker 完成这些写入的等价最小权限路径。

每个函数必须：空 `search_path`；全限定 `pg_catalog/public/private/extensions/auth` 对象；`REVOKE EXECUTE FROM PUBLIC, anon`；只向 `authenticated` 精确 grant；函数首部读取 `auth.uid()` 并实时检查 actor；不接受 actor/capability 参数；不得通过 `user_metadata` 授权。

## 8. 权限矩阵

| 操作                                         | active Admin | active Super Admin | target 条件                                                                   | 当前 P1 状态 |
| -------------------------------------------- | ------------ | ------------------ | ----------------------------------------------------------------------------- | ------------ |
| 普通账户目录/详情/Audit 读取                 | Allow        | Allow              | 字段最小化                                                                    | Allowed      |
| elevated 账户目录/详情/Audit 读取            | Allow        | Allow              | 字段最小化；写控件不可执行并显示未来 Reauth/MFA 提示                          | Read-only    |
| Grant/Revoke Author                          | Allow        | Allow              | Grant 要求 active Membership                                                  | Allowed      |
| Grant/Revoke Admin                           | Deny         | Deny               | 无当前 P1 RPC 或 execute grant                                                | Deferred     |
| Grant/Revoke Super Admin                     | Deny         | Deny               | 无当前 P1 RPC 或 execute grant；最后一名 active Super Admin 保护保留          | Deferred     |
| 普通账户 Membership active/suspended/revoked | Allow        | Allow              | target 不存在未撤销 Admin/Super Admin grant；禁止 actor 自停用                | Allowed      |
| elevated-account Membership                  | Deny         | Deny               | target 存在任一未撤销 Admin/Super Admin grant，数据库无条件拒绝；保护逻辑保留 | Deferred     |

Guest、Reader、Author、pending/suspended/revoked Admin、被撤销 Admin/Super Admin 对全部治理读写均 Deny。客户端可见控件只改善体验，Server Action、Service 和数据库必须分别执行同一矩阵。

## 9. 最后一名 active Super Admin

数据库在全局治理锁内计算 effective Super Admin：`memberships.state = active` 且存在未撤销 `super_admin` grant。

- 当前 P1 没有可执行的 Super Admin revoke 或 elevated Membership RPC。数据库保护函数与旧 workflow guard 必须保留且不得弱化；未来重新开放前，仍须在锁内模拟 after state，若 active Super Admin 数量将低于 1 则返回 Conflict `final_active_super_admin`。
- 任何数据异常已使数量为 0 时，当前 P1 普通治理写入全部 fail closed；恢复治理能力必须走独立授权流程，不得借当前低风险 RPC 操作 elevated 状态。
- UI、Service 预判不能替代数据库计数。
- 当前 P1 QA 对保护执行 catalog/static 与拒绝回归验证，不执行 elevated Saved。未来获得独立授权后，才追加两个 Super Admin 并发互相撤销/停用的成功/冲突测试。

## 10. Audit

Saved 继续写 `audit_logs`，action 保持 `role.granted`、`role.revoked`、`membership.state_changed`，避免创建第二套事件词汇。

metadata 只保存：requestId、operation、target user ID、role/state、before/after 安全摘要、expected state token；不保存 password、proof secret、Session、Token、Cookie 或内部 Auth identifier。reason 使用规范化最终值。

未来 Migration 应扩展不可变 Trigger，拒绝这些 Identity Access action 的 UPDATE/DELETE。当前 P0 Trigger 只保护 Site Copy action，不能被误报为所有 Audit 已数据库不可变。

## 11. 旧 RPC cutover 与回滚

### 11.1 无绕过兼容期

旧 `grant_role`、`revoke_role`、`set_membership_state` 不能接收新合同所需参数，不能作为兼容 wrapper。只要它们仍向 `authenticated` 开放，客户端就能绕过 Review、requestId、expected-state 和当前 elevated 延期边界。

### 11.2 未来执行顺序

1. 在专用 non-Production 环境创建 private ledger、read RPC、v2 write RPC、Audit immutability 和测试；write execute 保持 revoked。
2. 验证 App/Service/Repository 对新 read/result/error 合同的兼容性。
3. 不创建任何 elevated v2 RPC 或 proof consumer；elevated 账户 UI 仅展示只读数据和未来 Reauth/MFA 提示。
4. 在一个 cutover Migration 事务与同一全局治理锁内：先撤销三个旧 RPC 的 `authenticated` execute，再只向 `authenticated` grant `grant_author_role_v2`、`revoke_author_role_v2`、`set_ordinary_membership_state_v2`。
5. 旧函数定义仅为避免破坏性 down migration 而保留 owner-only；不得作为运营、回滚或应用入口执行，不得保留 authenticated 双入口。
6. catalog 测试证明 `PUBLIC/anon` 无 execute、旧 RPC authenticated 无 execute、v2 只有精确 grant。

### 11.3 回滚

1. 先关闭/暂停 Admin mutation surface。
2. 撤销 v2 execute；保留 ledger 和 Audit，不删除、不改写。
3. 回滚 App 到不发起 v2 的版本。
4. 当前 P1 回滚不得恢复旧 RPC 的 `authenticated` execute；如果 v2 必须关闭，治理写入保持关闭。任何恢复旧入口的提案都超出当前 P1，必须重新进行独立安全授权，且不得形成 elevated 绕过。
5. Schema 回滚不得删除已保存 ledger/Audit；修复使用 forward Migration。

## 12. KI-033 Reauth feasibility

最终结论：当前 P1 为 `ACCEPTED DEFERRED BOUNDARY`；技术 feasibility 仍未证明，elevated mutations 为 `DEFERRED`。Product Owner 已选择 ADR-022 Option 3。完整证据与威胁分析见 [ADR-022](../../17_Architecture_Decisions/ADR-022.md)。

阻断时的实施边界：

- 不实现、grant 或暴露 Admin/Super Admin role mutation。
- 不实现、grant 或暴露 elevated-account Membership mutation。
- 不把 `reauthenticate()` nonce、普通 Session 年龄、客户端 boolean、明文 password replay 或新建 `aal1` Session 当作 proof。
- 旧 RPC、隐藏路由和 direct table write 不得成为 bypass。
- read model、ledger 与普通治理合同状态为 `AUTHORIZED FOR FUTURE P1-02 PLANNING`，但任何实现仍需单独 P1-02 授权。
- 未来重新启用 elevated mutations 必须取得独立 Product Owner 授权并建立新的 Auth ADR，优先评估 Supabase MFA/AAL2。

## 13. Supabase 当前合同复核

复核日期：2026-08-17。

- [Supabase Changelog](https://supabase.com/changelog.md)：2026-04-28 起新表 Data API 自动暴露默认值正在改为 opt-in；设计因此显式管理 exposed schema、RLS 与 grants，不依赖平台默认。
- [Securing your API](https://supabase.com/docs/guides/api/securing-your-api)：Data API 同时受对象 grants 与 RLS 控制；函数 execute 必须单独最小授权。
- [Database Functions](https://supabase.com/docs/guides/database/functions)：优先 invoker；definer 必须固定 search path，并撤销默认 PUBLIC execute。
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)：`user_metadata` 可由用户修改且 JWT 可能陈旧；授权继续使用数据库实时 Membership/Role。
- [User Sessions](https://supabase.com/docs/guides/auth/sessions)：JWT 的 `session_id` 对应 `auth.sessions`；普通登录创建 Session，Session 年龄本身不是 password step-up attestation。
- [Password security](https://supabase.com/docs/guides/auth/password-security)：`reauthenticate()` 是安全密码变更的 nonce 流程，发送到 confirmed email/phone。
- [signInWithPassword](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)：成功登录创建普通 Session；没有操作绑定 proof 输出。
- [JavaScript Auth server client](https://supabase.com/docs/reference/javascript/auth)：可用 `persistSession:false` 创建隔离 server client，但它只避免持久化，不替代可信 proof issuer。
- [MFA](https://supabase.com/docs/guides/auth/auth-mfa)：password login 是 `aal1`，附加 factor 才产生 `aal2`；采用 MFA 属 Auth 架构决定，不在 P1-00 自动授权内。

Changelog 中 2026-07-23 Management API logs endpoint、2026-07-22 extension version pinning、2026-07-17 self-hosted gateway、2026-07-14 Realtime schema 等 breaking changes与本设计无直接合同冲突；不得据此省略未来专用 QA catalog 验证。

## 14. QA 与完成门禁

完整矩阵见 [P1-01 Non-Production QA Matrix](P1_01_NON_PRODUCTION_QA_MATRIX.md)。专用 QA 必须与 Production 项目、数据、Auth 用户和密钥完全隔离；本阶段不创建或写入任何远程项目。

P1-01 设计收口只表示：数据、权限、幂等、并发、cutover 与 Option 3 边界已冻结。KI-033 技术问题未关闭，不能进入 elevated mutation 实现；普通治理仅可等待 Product Owner 单独授权 P1-02。
