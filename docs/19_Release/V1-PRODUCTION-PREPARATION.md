# Fandom Harbor V1 Production Preparation

状态：`INCOMPLETE / PRC-01 CLOSED / PRC-02–PRC-06 BLOCKED / DEPLOYMENT NOT AUTHORIZED`
日期：2026-07-15
Mission：V1 Production Preparation

## 1. 结论

- `Production Readiness Review = PASS`。
- `Production Ready = READY WITH CONDITIONS`。
- `Production Deployment Authorized = NO`。
- Product P0 / P1 = `0 / 0`。
- Production Preparation 当前未完成；PRC-01 已通过独立 RC Baseline Closeout Mission 关闭，PRC-02 至 PRC-06 仍为 `BLOCKED`，且未得到 Product Owner 的逐项 `ACCEPTED RISK`。
- 当前不能进入 Production Deployment Mission 授权评审，也不能从当前未提交工作区部署。

本 Mission 只执行只读核对、方案整理和文档同步。没有部署 Production、绑定域名、修改 Vercel、修改数据库 / Auth / RLS / RPC / Migration、创建账号、发送邀请码、授权 / 撤销角色或继续实现 `/access` Admin。

## 2. PRC 状态表

| PRC    | 状态    | 当前证据                                                                                                   | 关闭条件                                                                                 |
| ------ | ------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| PRC-01 | CLOSED  | 从 `903bf70` 创建 `codex/v1-production-rc`；RC commit 只包含 Reading 与 Release 文档，排除 `/access` Admin | 部署只能引用该 RC commit / SHA；冻结 Admin 改动继续留在未提交工作区，不属于 Web RC       |
| PRC-02 | BLOCKED | Web Project 存在；Production 作用域变量为 0；团队域名为 0；正式目标 URL / HTTPS 尚未建立                   | 确认 Production Branch；配置三个 Production 变量名；绑定获批域名并验证 HTTPS / canonical |
| PRC-03 | BLOCKED | Supabase active healthy、Migration 14 / 14；预算、平台套餐、备份能力、恢复演练、监控和值班责任未批准       | 批准规模 / 预算 / SLO / RPO / RTO；验证备份并完成隔离恢复演练；实名指定责任人            |
| PRC-04 | BLOCKED | KI-004、KI-005、KI-012 仍 Open；没有已发布的 V1 隐私、条款、年龄、数据请求或下架政策                       | 批准最低政策、法律主体、联系渠道和执行时限，并在 Production 可访问                       |
| PRC-05 | BLOCKED | 上一稳定 commit 可固定为 `903bf70`；当前 RC SHA、Production Deployment ID 与实名回滚负责人尚不存在         | 固定 RC SHA / 上一稳定 Deployment；批准负责人和触发条件；部署后执行完整 Production Smoke |
| PRC-06 | BLOCKED | 至少一个 active Super Admin 有既有登录 / grant 证据；Admin Preview 仍不可用；应急路径未批准 / 演练         | 实名指定治理责任人 / 紧急联系人；批准无 Admin Preview 时的可审计路径并完成桌面走查       |

除非 Product Owner 对剩余 PRC 明确记录 `ACCEPTED RISK`、接受范围、到期日、责任人和补救条件，否则不得把 `BLOCKED` 自动改为 `ACCEPTED RISK`。

## 3. PRC-01：Release Candidate 基线

### 3.1 当前 Git 事实

- 基础 commit：`903bf70a6dc370090362098d26bedd6bf68af529`。
- RC 分支：`codex/v1-production-rc`。
- RC commit：本 Mission 创建，message 为 `chore(release): prepare V1 production candidate`；不可变 SHA 记录在 Mission Final Output。
- 主工作区仍保留排除的冻结 `/access` Admin 改动，因此主工作区本身不作为部署源；RC commit / SHA 是干净、可追踪、可回滚的部署候选。

### 3.2 改动归属

已验收 Reading 改动：

- `apps/web/src/app/globals.css`
- `docs/18_Design/UX-06C-STEP05_ACCEPTANCE.md`

冻结至 Admin 阶段的 `/access` 改动：

- `apps/admin/src/app/access/actions.ts`
- `apps/admin/src/app/access/page.tsx`
- `apps/admin/src/app/access/actions.test.ts`

Release / 状态 / 使用文档改动：

- `.ai/PROJECT_STATUS.md`
- `.ai/MEMORY.md`
- `.ai/CHANGELOG.md`
- `docs/15_Sprint/Release_Readiness/README.md`
- `docs/15_Sprint/Release_Readiness/RR_1C_BETA_READY_CHECKLIST.md`
- `docs/19_Release/V1-ADMIN-GUIDE.md`
- `docs/19_Release/V1-ADMIN-VERCEL-SUPPORT-EVIDENCE.md`
- `docs/19_Release/V1-DEPLOYMENT-SMOKE-TEST.md`
- `docs/19_Release/V1-PHASE1-BETA-TESTING-GUIDE.md`
- `docs/19_Release/V1-PRODUCTION-READINESS-REVIEW.md`
- `docs/19_Release/V1-RELEASE-DEPLOYMENT.md`
- `docs/19_Release/V1-RELEASE-FLOW-OPTIMIZATION.md`
- `docs/19_Release/V1-USER-GUIDE.md`
- 本文档

### 3.3 建议的 RC 策略

1. 已从 `903bf70a6dc370090362098d26bedd6bf68af529` 创建 `codex/v1-production-rc`。
2. RC commit 只纳入已验收 Reading 改动和获批 Release / 状态文档。
3. 冻结 `/access` Admin 改动没有进入 RC commit，继续作为未提交工作区改动保留；后续如需归档，必须由独立 Admin Mission 处理。
4. RC commit message 固定为 `chore(release): prepare V1 production candidate`。
5. 在独立干净 detached worktree 对候选 commit 运行完整验证并记录不可变 SHA；部署必须引用该 SHA，禁止引用当前混合工作区。
6. 在 Production Deployment Mission 获单独授权前不创建 tag。授权后可评审 annotated tag `v1.0.0-rc.1`；正式发布 tag 只能在 Production Smoke PASS 后创建。

本 Mission 创建了 RC 分支和 commit，但没有 push、创建 tag 或执行 Deployment。

## 4. PRC-02：Production 配置准备状态

### 4.1 Vercel Web Project

| 检查项                | 结果                        |
| --------------------- | --------------------------- |
| Team                  | `fandom-harbor`             |
| Project               | `fandom-harbor-web`         |
| Root Directory        | `apps/web`                  |
| Framework             | Next.js                     |
| Node.js               | 24.x                        |
| 本地 Project Link     | 存在，且被 Git ignore       |
| Production Branch     | 本轮 CLI 输出未提供，待确认 |
| Production Deployment | 未执行                      |
| 正式域名              | 0                           |
| 正式目标 URL / HTTPS  | 未建立 / 未验证             |

### 4.2 Production 环境变量

代码使用的变量名：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

实时只读核对结果：`fandom-harbor-web` 的 **Production** 作用域当前没有任何 Environment Variable。

`NEXT_PUBLIC_SITE_URL` 在 RuntimeConfig 中技术上可选，但正式 Production 必须配置为获批 HTTPS origin，以固定 canonical、Open Graph 和 Sitemap origin。`NEXT_PUBLIC_SUPABASE_ANON_KEY` 不是当前代码读取的变量名，不应作为替代。

本 Mission 只核对名称与作用域，没有读取、输出或写入任何值。

### 4.3 Supabase

- linked Project：`fandom-harbor`。
- Project ref：`szfhngifsipsrxcpekti`。
- Region：`ap-southeast-1`。
- 状态：`ACTIVE_HEALTHY`。
- PostgreSQL：17。
- Local / Remote Migration：`14 / 14`。
- 本 Mission 未执行 `db push`、远程 SQL、数据写入或配置变更。

### 4.4 PRC-02 关闭清单

- [ ] Product Owner 确认 Web Production Project 和 Production Branch。
- [ ] 在 Production 作用域配置三个获批变量名；只在 Vercel Dashboard / Secret Management 中保存值。
- [ ] 验证变量指向获批 Production Supabase Project，禁止把 Preview / Local 值带入 Production。
- [ ] 绑定正式域名并验证 DNS、TLS、HTTPS redirect 和证书状态。
- [ ] 验证 `NEXT_PUBLIC_SITE_URL`、canonical、Open Graph、Sitemap 与正式 HTTPS origin 完全一致。
- [ ] 记录正式 Production URL；在单独 Deployment Mission 中执行 Smoke。

## 5. PRC-03：运维、备份、监控和值班最低方案

以下为建议的保守 V1 运行包，尚待 Product Owner 批准；批准前不构成承诺或 `CLOSED`。

### 5.1 上线规模和预算

- Launch 模式：invite-only、非公开传播邀请码。
- 初始 7 天观察窗口：最多 25 个 active Reader、最多 5 个 active Author、仅文本作品主链路。
- 扩容触发：账号 / Author 数量、错误率、延迟或平台配额接近获批阈值时暂停新邀请，由 Product Owner 复核。
- 预算：仅使用 Product Owner 已批准的 Vercel / Supabase 套餐；任何付费升级、附加监控或存储扩容均需单独批准。
- 关闭前必须记录实际套餐、月度预算上限、账单联系人和超限处理人；本文不猜测套餐或金额。

### 5.2 可用性、RPO 与 RTO 建议

| 指标           | V1 建议值                                   |
| -------------- | ------------------------------------------- |
| 月度可用性目标 | 99.0%，invite-only best-effort              |
| RPO            | 24 小时                                     |
| RTO            | 8 小时                                      |
| 严重事故响应   | 30 分钟内确认，60 分钟内给出暂停 / 回滚决定 |

如果当前平台套餐不能满足以上值，Product Owner 必须降低并明确接受风险，或批准套餐升级；不得默认平台具备未验证能力。

### 5.3 备份与恢复

- 关闭前只读确认 Supabase 当前套餐的数据库备份频率、保留期、PITR 可用性和 Storage 覆盖范围。
- 至少保证与 RPO 24 小时一致的数据库备份；关键配置和 Migration 继续由 Git 保存。
- Production 前在隔离环境完成一次恢复演练：恢复备份 / 导出物，核对 Migration、核心表数量、active Membership、Role Grant、RLS 拒绝矩阵和 Published Reading。
- 恢复演练不得覆盖 Production，不得复制不必要的真实私有数据到 Preview。
- 记录恢复开始 / 完成时间、完整性、权限验证、失败处理和批准人。

当前没有已验证的备份能力清单或恢复演练证据，因此 PRC-03 保持 `BLOCKED`。

### 5.4 监控、值班与事故升级

- 最低信号：Vercel Deployment / Runtime errors、HTTP 5xx、Auth 登录失败、Supabase health、核心页面 Smoke、权限泄漏报告。
- Launch 窗口由一个 Release Commander 和一个 Technical Operator 覆盖；两者不得只写角色名，关闭前需记录可联系的实名责任人和替补。
- P0、安全边界失效或数据完整性风险：立即停发邀请码、暂停新发布、保存证据并升级 Product Owner。
- 不得为恢复服务绕过 RLS、直接 SQL 改角色、删除账号 / 内容或回滚已确认的用户写入。
- 每次事故记录开始时间、影响、决定、操作人、恢复证据和后续事项。

## 6. PRC-04：法律、隐私、内容与数据最低方案

以下为 V1 最低建议，仍需 Product Owner / 法律责任人批准和发布；在批准前 KI-004、KI-005、KI-012 保持 Open。

### 6.1 年龄与内容

- V1 Production 仅面向 18 岁及以上受邀用户。
- 首发只允许文本作品；图片、外链文件上传、PDF / EPUB 上传不在 V1 Production 范围。
- 禁止违法内容、涉及未成年人的性内容、真实个人隐私泄露、骚扰 / 威胁、恶意软件和侵权内容。
- 在成熟的分级 / 预警与审核流程获批前，不接受需要额外成人内容合规处理的公开扩张。

### 6.2 隐私与条款

Production 前必须发布可访问的版本化页面，至少说明：

- 运营法律主体、适用地区和联系渠道。
- 收集的注册名、Auth 身份、Membership、Role Grant、邀请关系、内容和 audit 数据。
- 使用目的、访问边界、平台处理方（Vercel / Supabase）和安全限制。
- active Membership 规则：Guest 可发现作品，但详情和章节要求登录。
- 用户行为规则、内容许可、作者责任、禁止内容、账号暂停和下架流程。
- 政策版本、生效日期和重大变更通知方式。

当前仓库没有可作为 Production 公布面的完整 Privacy / Terms / Content Policy，因此不能关闭 PRC-04。

### 6.3 删除、导出与保留建议

- V1 请求入口由 Product Owner 指定的私密联系渠道受理；不得要求用户在公开 Issue 提供私密数据。
- 身份核验后，导出请求目标在 30 天内完成；导出文件必须私密、限时且不进入搜索 / 分析。
- 账号 / 内容删除请求先暂停访问并 unpublish / archive，避免继续公开；当前应用角色无直接 DELETE，禁止用直接 SQL 临时删除。
- 最终 purge、tombstone 和备份老化只有在获批流程与工具存在后执行；恢复备份时不得把已删除数据重新投入 active service。
- 建议 audit 安全记录保留 365 天、邀请最小审计链接保留 90 天、备份最长 30 天后老化；具体时长必须由 Product Owner / 法律责任人批准。

### 6.4 下架路径

1. 通过指定私密渠道接收理由、目标 URL 和必要证据。
2. Governance Owner 在 1 个工作日内确认，紧急安全 / 明显违法内容立即限制访问。
3. 使用现有 archive / visibility 边界处理内容；没有获批工具时停止并升级，不直接 SQL 删除。
4. 记录决定、操作者、时间、依据和恢复条件；需要时通知作者并保留申诉入口。
5. 涉及法律要求时由法律责任人决定保留、披露或彻底删除范围。

## 7. PRC-05：回滚与 Production Smoke Runbook

### 7.1 版本与责任

- 当前上一稳定 Git baseline：`903bf70a6dc370090362098d26bedd6bf68af529`。
- 当前 Production RC：已在 `codex/v1-production-rc` 建立；部署只能引用本 Mission Final Output 记录的最终不可变 SHA。
- 当前上一稳定 Production Deployment ID：`PENDING`，在 Deployment Mission 前只读确认。
- Rollback Approver：Product Owner（实名待记录）。
- Rollback Operator：Technical Operator（实名待记录）。
- 本次候选不包含数据库变更，因此应用回滚不得伴随数据库回滚或数据删除。

### 7.2 立即停止 / 回滚触发条件

- Auth 注册 / 登录主链路持续失败。
- Reader 能进入 Studio、看到 Draft，或任何角色 / RLS 权限泄漏。
- Published Work / Chapter 无法读取或 Author 新发布内容不可回读。
- Production 5xx 或客户端产品级错误持续影响核心路径。
- canonical / HTTPS / 域名错误把用户导向错误环境。
- 数据完整性、secret 泄漏或安全事件。
- Product Owner 判定的其他未接受 P0 / P1。

### 7.3 回滚步骤

1. 停止继续 rollout；停发邀请码并暂停新发布。
2. 保存 Deployment ID、时间、错误、请求路径和必要截图，不记录 secret。
3. Product Owner 作出回滚决定；Technical Operator 在 Vercel 将 Web 恢复到已确认的上一稳定 Deployment / commit。
4. 不回滚数据库 Migration，不删除用户写入，不修改 Auth / RLS / Role。
5. 对回滚版本执行下方最小 Smoke；失败则保持服务暂停并升级事故处理。
6. 记录操作人、目标版本、开始 / 完成时间、Smoke 结果和后续修复 Mission。

### 7.4 Production Smoke 清单

部署或回滚后必须在 Desktop 与 390 × 844 各执行一次，记录 URL、Deployment ID、RC SHA、身份、时间和结果。

- Guest：Homepage、Archive、Search、Sign-in、Sign-up、无 Studio 入口、直访 Studio 进入登录边界。
- Reader：注册名登录、Archive / Search、Published Work Detail、Published Chapter Reading、退出 / 重登、Studio denial、Draft isolation。
- Author：登录、Studio、Works、Create Draft、Save、Draft isolation、Publish selected Chapter、Work Detail、Reader 回读。
- 通用：Light / Dark、390px 无严重横向溢出、HTTPS、canonical、Sitemap、Robots、Console 产品级错误 0。
- 治理：active Super Admin 登录能力与应急联系人可用；不在 Smoke 中执行真实角色变更。

Production 尚未部署，因此本 Mission 不执行浏览器 Production Smoke。

## 8. PRC-06：Super Admin 与治理应急路径

### 8.1 当前证据

- 至少一个 active Super Admin 存在并有既有登录证据。
- 现有 Role Grant、`admin:operate`、`/access`、数据库二次校验、最后一个 Super Admin 保护和 audit 路径均已有证据。
- `/access` 既有改动冻结至 Admin 阶段，本 Mission 不继续实现。
- Admin Preview 没有可用 URL，不能把它视为已准备的 Production 治理入口。

### 8.2 最低治理责任

关闭前必须实名记录：

- Governance Owner：负责内容 / 账号 / 邀请治理决定。
- Active Super Admin Owner：负责安全保管账号并参与应急登录验证。
- Emergency Contact：Launch 窗口可联系的第一响应人。
- Audit Reviewer：复核 `role.granted`、`role.revoked` 和 Membership 变更。
- Technical Operator：仅执行获批的部署 / 回滚和受控身份修复。

同一人可以在小团队中兼任，但必须明确记录职责与替补，不得把密码、User ID 或 secret 写入本文。

### 8.3 最低应急路径建议

1. Admin UI 可用时：active Super Admin 登录独立 Admin App，通过 `/access` 操作并复核 audit。
2. Admin Preview / Production UI 不可用时：候选 break-glass 方案是在受控工作站运行与 Production RC 同 SHA 的干净 Admin build，使用 Production public config 登录并走同一 `/access` / RPC / audit 路径。该方案必须先由 Product Owner 批准并完成不执行真实变更的桌面走查；本 Mission 未执行。
3. 另一个 active Super Admin 可用时，由其按受控路径处理。
4. 数据库不存在任何未撤销 Super Admin grant 时，owner-only bootstrap 只能在独立高风险 Mission 中由 Product Owner 授权。
5. grant 仍存在但身份无法登录时，bootstrap 会拒绝；必须执行受控身份修复或由另一名 Super Admin 处理。

任何路径都禁止直接 SQL、Supabase Dashboard 改角色、绕过 audit、共享密码或创建未授权账号。

## 9. Product Owner 关闭记录

以下字段必须在 Production Deployment 授权评审前完成；可以引用受控内部记录，不得填入 secret。

| 决策项                           | 当前值                         |
| -------------------------------- | ------------------------------ |
| RC commit SHA                    | 见 PRC-01 Mission Final Output |
| RC branch                        | `codex/v1-production-rc`       |
| Production Branch                | PENDING                        |
| Production URL / domain          | PENDING                        |
| Production env names / scopes    | PENDING                        |
| 实际平台套餐 / 月预算上限        | PENDING                        |
| 可用性 / RPO / RTO               | PENDING                        |
| 备份能力 / 恢复演练证据          | PENDING                        |
| Release Commander                | PENDING                        |
| Technical Operator               | PENDING                        |
| Rollback Approver / Operator     | PENDING                        |
| 法律主体 / 政策负责人 / 联系渠道 | PENDING                        |
| Governance Owner / Emergency     | PENDING                        |
| Active Super Admin Owner         | PENDING                        |
| PRC-01 最终状态                  | CLOSED                         |
| PRC-02 至 PRC-06 最终状态        | BLOCKED                        |

## 10. 是否可以进入 Production Deployment 授权评审

当前结论：`NO`。

原因：PRC-01 已关闭，但 PRC-02 至 PRC-06 仍为 `BLOCKED`，且没有 Product Owner 逐项 `ACCEPTED RISK` 记录。准备 Production 配置、批准运营 / 法律 / 回滚 / 治理方案并验证备份恢复后，才可以另行进入 Production Deployment Mission 授权评审。

Production Deployment Authorized 必须继续保持 `NO`。
