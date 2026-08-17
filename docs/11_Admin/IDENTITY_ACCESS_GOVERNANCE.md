# Admin Identity & Access Governance

状态：`ADMIN P1-00 SCOPE FROZEN`
批准日期：2026-08-16
实施状态：尚未开始；本文只冻结产品、安全与验收合同

## 1. 目标

Admin P1 将现有 `/access` 的三个直接写入表单升级为可审查、可追踪、可并发保护的身份与访问治理工作台，同时保持 Phase 1C 已建立的 Membership、Role Grant、capability 与数据库权限事实源。

本阶段解决的是“管理员如何安全地查明对象、理解当前状态并执行既有授权操作”，不是创建新的角色、能力或第二套权限系统。

## 2. 使用者与权限矩阵

运行期授权继续由 active Membership 与未撤销的 `role_grants` 派生，客户端显示不构成安全边界。

| 操作者                  | 可读范围                                                | 可写范围                                                                   |
| ----------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------- |
| Guest / Reader / Author | 无 Admin 身份治理访问                                   | 无                                                                         |
| active Admin            | 运营所需成员投影、普通成员状态、Author Grant 与相关审计 | 授予/撤销 Author；修改普通成员 Membership                                  |
| active Super Admin      | Admin 范围及 elevated account 所需投影                  | Admin 范围；授予/撤销 Admin、Super Admin；管理 elevated account Membership |

以下既有保护不得改变：

- 普通 Admin 不得授予或撤销 Admin / Super Admin。
- 普通 Admin 不得修改受保护 elevated account 的 Membership。
- 最后一个有效 Super Admin 不得被撤销或停用。
- suspended / revoked Membership 必须使旧 Session 与历史 Role Grant 立即失去管理能力。
- `user_metadata`、客户端提交的 role/capability 或界面显隐不得成为授权事实。

## 3. 目录、搜索与详情

P1 的读路径采用“目录 → 搜索/筛选 → 成员详情 → Review”的顺序。最低可用投影包括：

- 注册名与 Auth user ID。
- Membership 当前状态及必要时间。
- 当前 active roles。
- Role Grant / Revoke 历史。
- 与该成员相关且允许操作者查看的身份访问审计事件。
- 结果总量、分页游标或明确的有界分页状态。

搜索至少支持规范化注册名与精确 User ID。结果必须字段最小化，不得暴露内部不可投递 Auth email-shaped identifier、密码、password hash、Session、Token、Cookie、邀请码明文、Service Role key 或未批准的私密身份字段。

成员详情必须在任何写操作前展示目标的当前 Membership、当前 roles、关键保护状态和最近相关审计。读取失败、空结果、无权限、状态已变化与数据损坏必须是不同的安全状态。

## 4. Mutation 合同

P1 只治理现有操作族：

1. Grant Role：`author | admin | super_admin`。
2. Revoke Role：`author | admin | super_admin`。
3. Set Membership State：`active | suspended | revoked`。

每个 Mutation 必须满足：

- 通过 Admin Server Action 进入，不新增公开 REST 写接口。
- Server Action 重新取得可信 Session 与 Access Context。
- Domain / Service 再次执行角色与目标保护规则。
- 数据库在同一事务内复核 `auth.uid()`、active Membership、live Role Grant 与目标保护。
- 使用 UUID `requestId`，同一请求安全重试不得重复写入。
- 使用 expected state；目标状态在 Review 后变化时返回 `Conflict`，不得 Last Write Wins。
- 结果关闭为 `Saved | Unchanged | Conflict`；未知内部错误映射为安全错误。
- `Saved` 恰好写入一条对应 Audit；`Unchanged` 与 `Conflict` 不写业务变更 Audit。
- 旧写接口在 P1 cutover 后不得继续成为绕过 Review、幂等或 Conflict 合同的可执行后门。

P1-01 必须在实现前冻结 expected-state 的具体形态：Membership 至少包含当前 state 与 `updated_at`；Role Grant 至少区分“无 active grant”与目标 active grant ID。

## 5. 原因合同

所有 Membership 与 Role Mutation 均必须填写原因，包括低风险操作。

- NFC 规范化并移除首尾空白。
- 规范化后 4–200 Unicode code points。
- 拒绝控制字符与换行。
- Review 页面显示规范化后的最终原因。
- Audit 只保存规范化后的原因。
- 相同 `requestId` 仅在规范化后的完整 payload 一致时允许重放；同 ID 不同 payload 返回稳定输入错误。

## 6. 二次确认

所有写操作采用两阶段交互：

1. 编辑阶段只选择目标、操作与原因。
2. Review 阶段展示操作者、目标注册名/User ID、当前状态、预期变化、原因、风险级别与不可逆/访问影响，然后由独立确认动作提交。

修改目标、操作、原因或基线状态后，旧 Review 与旧 `requestId` 立即失效。提交 pending 时禁止重复确认。Conflict 必须保留 Review 输入并要求重新读取，不得自动覆盖或自动重试。

## 7. 高风险重新认证

以下操作定义为高风险：

- 授予或撤销 `admin`。
- 授予或撤销 `super_admin`。
- 修改当前拥有 active `admin` 或 `super_admin` 的目标账号 Membership，包括重新激活。

高风险操作除原因和二次确认外，还必须在最终提交前验证当前操作者的注册名/password 凭据：

- 复用现有 registration-name/password Auth provider adapter，不引入用户邮箱、OTP、Magic Link、MFA 或新身份源。
- 密码只用于当次 provider 验证，不写数据库、不进入日志、不进入 Audit、不进入 URL，也不持久化到客户端状态。
- reauth 证明必须绑定当前 actor、当前 Review payload 与单次提交；客户端布尔值、仅检查 Session 年龄或长期可复用标记均不合格。
- reauth 失败必须零状态变更，并返回不泄漏凭据细节的安全错误。
- 若实现需要修改 Auth provider 配置、Auth 架构或新增身份因子，P1-01 必须停止并升级 Product Owner，不得在本合同下自行扩展。

Supabase `auth.reauthenticate()` 当前是向已确认 email/phone 发送 nonce 的密码变更辅助能力，不适用于本项目不可投递内部标识；P1 不将其误当作已可用的 Admin step-up 认证。

## 8. 双人审批风险接受

P1 暂不采用双人审批。Product Owner 接受单个有效 Super Admin 在重新认证、原因填写、二次确认、数据库复核和完整审计后执行 elevated role 与 elevated Membership 操作的残余风险。

该风险接受不取消最后一个有效 Super Admin 防护，也不授权批量高风险操作。出现管理员数量扩大、运营分工、合规要求、账号共享风险或高风险误操作时，必须重新评审双人审批。

## 9. 数据库与 Supabase 安全基线

- 复用 `profiles`、`memberships`、`role_grants` 与 `audit_logs`；不得创建第二套身份或角色真相。
- 读模型优先使用字段最小化的 `security invoker` 投影与 RLS。
- 只有确需原子跨表写入和绕过 direct-write revoke 的 Mutation 才可使用 `security definer`。
- 每个 privileged function 必须固定空 `search_path`、使用全限定对象名、从 `PUBLIC` 撤销执行权、只向所需角色最小授权，并在函数体内重新验证 `auth.uid()` 与 live 权限。
- 暴露 schema 中的新表必须显式 RLS；private schema 也采用无直接应用角色权限的纵深防御。
- 新对象是否进入 Data API 必须通过 catalog/grant 验证，不依赖 Supabase 平台默认值。
- Migration 必须同时包含 grant/RLS/function/rollback-remediation，并通过 clean rebuild、upgrade、允许/拒绝和并发测试。

如 P1-01 采用 request ledger，它必须位于 private schema 或其他未暴露边界，默认无 `anon` / `authenticated` 直接权限，只能通过受控函数访问。

## 10. Web → Admin 入口

P1 不启用 Web 后台入口。Web 不新增 Admin URL、菜单、环境变量或可见链接；Guest、Reader、Author、Admin 与 Super Admin 在 Web 的显示结果均保持现状。

未来若单独授权入口：

- 只放在账号/身份区域，不进入 Reader 主导航。
- 服务端同时要求 `admin:operate` 与独立的运营可用开关。
- 使用独立 Admin 绝对 URL，并接受 Web 与 Admin 可能需要分别登录。
- Admin paused 时必须 fail closed，不显示可用入口。
- UI 隐藏永远不替代 Admin App 与数据库授权。

## 11. 邀请、内容与分析边界

以下不属于 Admin P1：

- 邀请创建、撤销、列表、谱系或运营 UI。
- 内容、标签、举报与审核治理。
- Admin Intelligence、运营指标、阅读来源、热门标签/CP 或活跃作者。
- Site Copy P0 八字段扩展。
- 新角色、新 capability、开放注册或 Auth 架构变化。
- Web 后台入口启用。
- Admin Production Unpause、Deployment、Promotion 或 Release。

邀请管理延期至独立 P1.1 或后续 Mission；Phase 7 Admin Intelligence 保持独立 Planned 范围。

## 12. 测试与发布边界

- 单元与集成测试覆盖 Guest、Reader、Author、Admin、Super Admin、suspended、revoked、stale state、重复 requestId 与并发。
- SQL 必须同时验证允许和拒绝路径、零部分写入、Audit 数量、最后一个 Super Admin 保护与旧接口不可绕过。
- 远程写入测试只能使用专用非 Production Supabase QA 环境；禁止使用 Production。
- Preview 验收只能使用受保护的 Admin Preview；不得把 Admin Production Resume 当作 P1 测试步骤。
- P1-00 不执行 SQL、Migration、远程写入、登录、Deployment、Unpause、Push 或 Merge。

## 13. 完成定义

P1 实施完成前必须证明：

- 目录、搜索、详情与审计读取字段最小化且权限正确。
- Membership 与 Role 治理均进入同一工作台并保持现有能力矩阵。
- 所有写操作具备原因、Review、requestId、expected-state、Unchanged/Conflict 与 Audit 合同。
- 高风险操作具备当前 actor 的单次 password reauth。
- 普通 Admin 不能越权，最后一个有效 Super Admin 不能被移除或停用。
- 旧写路径不能绕过新合同。
- Production 数据、Version 7、Web 入口与 paused Admin 状态未被测试或实施流程改变。
