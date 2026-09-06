# ADMIN P1-00 — Scope and Security Contract

状态：`COMPLETE — SCOPE FROZEN`
日期：2026-08-16
基线：`origin/main @ f970271edf6f489444605f62aba596b5cba9b1db`

## 1. 授权结果

Product Owner 已批准：

- P1 方向为 `Identity & Access Governance Console`。
- Membership 与 Role Governance 一并纳入。
- 高风险操作采用当前操作者重新认证、原因填写和二次确认。
- 暂不采用双人审批，并接受相应残余风险。
- 邀请管理延期。
- Web 后台入口暂不启用。
- 远程写入测试不得使用 Production。
- 允许修正文档漂移。

## 2. 启动门禁

| Gate        | 证据                                                                                | 结果 |
| ----------- | ----------------------------------------------------------------------------------- | ---- |
| Environment | Darwin arm64；GitHub 与官方 npm registry 可达                                       | PASS |
| Toolchain   | Git 2.39.5、Node 24.18.0、pnpm 11.7.0                                               | PASS |
| Version     | `.nvmrc=24`；`engines.node >=24 <25`；`packageManager=pnpm@11.7.0`                  | PASS |
| Dependency  | `pnpm install --offline --frozen-lockfile`；687 packages reused，lockfile unchanged | PASS |

Supabase 2026-08-16 文档复核确认：Data API 访问同时依赖显式 grants 与 RLS；新表自动暴露默认值正在变化，不能依赖平台默认；`security definer` 必须固定 `search_path` 且 function 默认 execute 权限必须显式撤销。

## 3. P0 基线与问题定义

P0 已提供：

- 独立 Admin 登录与服务端 `admin:operate` 门禁。
- Site Copy 严格八字段 Read / Review / Save / Conflict / requestId 幂等与 Audit。
- `/access` 对 Role Grant、Role Revoke、Membership State 的现有数据库操作。
- Admin / Super Admin 权限矩阵与最后一个有效 Super Admin 防护。

P0 `/access` 仍是直接写入 UI：只有 User ID、目标 role/state 与原因；无成员搜索、详情、当前状态预览、历史、Review、requestId、expected-state 或 stale Conflict。P1 的任务是治理这条既有写链路，不是扩大权限。

## 4. 威胁模型

| 威胁                                 | P1 控制                                                |
| ------------------------------------ | ------------------------------------------------------ |
| 错选 User ID 或同名对象              | 规范化注册名搜索、显示 User ID、详情页当前状态、Review |
| Session 被借用后提权                 | 高风险操作绑定当前 actor 的单次 password reauth        |
| 客户端伪造 role/capability           | Server Action、Service、DB 三层重新授权                |
| 双击、网络重试或超时造成重复写       | requestId 幂等与同 payload replay                      |
| Review 后状态变化被覆盖              | expected-state 与 `Conflict`，禁止 Last Write Wins     |
| 普通 Admin 越权管理 elevated account | 保持既有角色矩阵，数据库重新检查                       |
| 移除最后一个 Super Admin             | 保持并回归 final active Super Admin guard              |
| 旧 RPC 绕过新 UI 合同                | cutover 后撤销旧 execute 或使旧入口进入同一 v2 合同    |
| 目录查询泄漏私密身份                 | 字段最小化投影、RLS、无内部 email/password/token       |
| 新表/RPC 意外暴露                    | 显式 RLS/grants、撤销 PUBLIC、catalog 与 Data API 验证 |
| 用 Production 做写入 QA              | 专用非 Production Supabase QA，Production 禁写         |

## 5. 冻结范围

### In scope

- 成员目录、注册名/User ID 搜索、有界分页与成员详情。
- Membership 当前状态与历史上下文。
- active Role 与 grant/revoke 历史。
- 与目标相关的身份访问 Audit 只读时间线。
- Grant/Revoke Author、Admin、Super Admin。
- active/suspended/revoked Membership 治理。
- 所有写操作的原因、Review、二次确认、requestId、expected-state、Unchanged/Conflict 与 Audit。
- elevated role/elevated account Membership 的单次 password reauth。
- Admin/Super Admin 界面分区与权限拒绝状态。
- 专用非 Production 远程 QA 与受保护 Preview 验收计划。

### Out of scope

- Invitation management。
- Content、tag、report、moderation 或 analytics。
- 新 role、新 capability 或 Permission Model。
- OAuth、Magic Link、email/phone OTP、MFA 或 Auth 架构变化。
- Web Admin 入口启用。
- Site Copy 第九字段或 P0 合同变化。
- Production Supabase 写入测试。
- Admin Production Unpause、Deployment、Promotion 或 Release。

## 6. 高风险定义与确认合同

高风险操作为：Admin/Super Admin grant/revoke，以及 active elevated account 的任意 Membership 状态变化。它们必须同时满足：

1. 原因规范化后 4–200 code points。
2. 独立 Review 阶段展示 actor、target、before、after、reason 与风险。
3. 最终确认前验证当前 actor 的 registration-name/password。
4. reauth 证明与单次 Review payload 绑定，不能信任客户端 boolean。
5. 数据库再次执行 live actor/target/final-Super-Admin 检查。
6. 失败、Conflict 或重复点击均不得产生部分状态或重复 Audit。

低风险 Author 与普通成员 Membership 操作仍必须原因和二次确认，但不强制 password reauth。

P1 暂不采用双人审批。该决定只接受当前最小运营规模下的残余风险，不得解释为永久取消复审。

## 7. 技术方向冻结

- 继续使用 `profiles`、`memberships`、`role_grants`、`audit_logs` 与现有 capability 派生。
- 页面不得直接调用 Supabase；保持 App → Service/Domain → Repository → Database 边界。
- 读投影优先 `security invoker` + RLS。
- 原子写入可使用必要的 `security definer`，但必须空 `search_path`、全限定名、撤销 PUBLIC、最小 execute grant、函数内 `auth.uid()` 与 live role 检查。
- Mutation 结果统一为 `Saved | Unchanged | Conflict`；内部错误不越过边界。
- 建议采用 private request ledger 实现 requestId replay，但其表结构、索引、保留与清理在 P1-01 设计评审冻结，P1-00 不创建 Migration。
- 旧 `grant_role`、`revoke_role`、`set_membership_state` authenticated execute 在 cutover 后必须关闭绕过路径；具体兼容迁移由 P1-01 提案。

## 8. Reauth 实施门槛

当前注册模型没有可投递用户 email。Supabase 官方 `reauthenticate()` 向已确认 email/phone 发送 nonce，不能直接满足本项目 Admin step-up。

P1-01 只能先评审“复用现有 registration-name/password provider adapter 验证当前 actor”的最小方案。若无法在不改变 Auth 架构/远程 Auth 配置的前提下提供 server-verifiable、单次绑定、无密码持久化的证明，必须停止并向 Product Owner 提交新 Auth 决策。

## 9. Web 入口冻结

Web 当前没有 Admin URL 或 `admin:operate` 入口条件。P1 保持该结果：所有角色在 Web 均不看到后台入口。Admin paused 时不得通过文案、死链或客户端条件暗示入口可用。

未来入口属于独立产品/发布授权，只允许账号区域、服务端 `admin:operate` + 运营开关、绝对 Admin URL 与 fail-closed paused 行为。

## 10. 实施顺序与停止点

| Step  | 内容                                                                        | 独立授权要求                            |
| ----- | --------------------------------------------------------------------------- | --------------------------------------- |
| P1-01 | DB/permission/API contract、Migration/rollback、reauth spike、SQL test plan | Required                                |
| P1-02 | Domain/Repository/Service 与封闭错误模型                                    | Required                                |
| P1-03 | Read-only directory/search/detail/audit UI                                  | Required                                |
| P1-04 | Review/confirm/reauth controlled writes                                     | Required                                |
| P1-05 | Local + dedicated non-Production remote QA                                  | Required；Production prohibited         |
| P1-06 | Protected Admin Preview acceptance                                          | Required；Admin Production stays paused |
| P1-07 | Production release review                                                   | Required；不等于 Unpause/Deploy 授权    |

P1-00 到此停止。不得自动开始 P1-01。

## 11. 文档漂移处置

- `V1-ADMIN-GUIDE.md` 已从“线上域名未确认 / Dashboard 占位”修正为已验收的 Admin P0 独立域名、Site Copy 工作台与当前 paused 状态。
- `docs/11_Admin` 与 `docs/12_SuperAdmin` 已从 Phase 0.6“尚无实现”修正为 P0 已实现能力及 P1-00 未实施合同。
- `PROJECT_STATUS.md` 新增最上方 P1-00 当前状态；后续旧“下一步”段落继续作为历史记录，不再冒充最新 Roadmap。
- `ADMIN-P0-RELEASE-CLOSURE.md` 的 Deployment ID 保留为 2026-08-15 Closure 时间点证据，不改写成持续更新的 Production registry；文档已增加 point-in-time 提示。
- P1 合同明确邀请管理延期，避免把现有 `/access` 误述为邀请管理 UI。

## 12. P1-00 验收

- [x] Membership 与 Role Governance 同时纳入。
- [x] 高风险操作、reauth、原因与二次确认已定义。
- [x] 不采用双人审批的残余风险已记录。
- [x] 邀请延期、Web 入口关闭、Production 远程写入禁用已冻结。
- [x] 权限矩阵、final Super Admin、server + database enforcement 保持不变。
- [x] requestId、expected-state、Unchanged/Conflict/Audit 目标合同已冻结。
- [x] Supabase Data API、RLS、grant 与 privileged function 安全要求已复核。
- [x] P1-01 至 P1-07 的授权边界已明确。
- [x] P0 文档漂移已修正，不改写历史证据。
- [x] 未修改产品代码、Migration、RLS、RPC、Auth、依赖、Production 或 Admin paused 状态。
