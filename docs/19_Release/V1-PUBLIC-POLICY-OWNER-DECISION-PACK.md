# Fandom Harbor V1 Public Policy Owner Decision Pack

状态：`OWNER DECIDED / IMPLEMENTATION COMPLETE / LEGAL REVIEW NOT COMPLETED / DEPLOYMENT PENDING / FINAL ACCEPTANCE PENDING`

决定日期：2026-07-25
适用范围：V1 小范围、邀请制、Reader-only Beta
当前唯一正式政策规范来源：[`V1-PUBLIC-POLICY-V1.0.md`](./V1-PUBLIC-POLICY-V1.0.md)

## 状态定义

- **Decision Complete：** Product Owner 已明确选择，不再是未决项。
- **Implementation Complete：** 决定已应用到唯一规范来源和对应页面代码。
- **Deployment Pending：** 本 Mission 不授权或执行 Production Deployment。
- **Smoke Test Pending：** 正式域名上的 Production Policy Smoke Test 尚未运行。
- **Final Acceptance Pending：** Product Owner 尚未在部署和 Smoke 后签署最终 Release Acceptance。

## DECISION-01–27 应用记录

| Decision | 决策状态      | Product Owner 最终选择                                                                                      | 实现状态                | 后续状态                   |
| -------- | ------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------- |
| 01       | OWNER DECIDED | 以 Draft 为主要输入，新建 `V1-PUBLIC-POLICY-V1.0.md` 为唯一当前规范源；历史文件保留并标记 superseded        | Implementation Complete | —                          |
| 02       | OWNER DECIDED | 运营主体统一为“Fandom Harbor，由刘祯莹个人运营”                                                             | Implementation Complete | —                          |
| 03       | OWNER DECIDED | 正式联系邮箱统一为 `fandomharbor@163.com`                                                                   | Implementation Complete | —                          |
| 04       | OWNER DECIDED | 政策版本为 V1.0                                                                                             | Implementation Complete | —                          |
| 05       | OWNER DECIDED | Product Owner 批准日期为 2026-07-25                                                                         | Implementation Complete | —                          |
| 06       | OWNER DECIDED | 自政策在 Fandom Harbor 正式网站发布之日起生效                                                               | Implementation Complete | Deployment / Smoke Pending |
| 07       | OWNER DECIDED | Guest 可访问 Homepage、Archive、Search、公开作品发现信息及产品当前允许的公开作者信息                        | Implementation Complete | —                          |
| 08       | OWNER DECIDED | Guest 不可访问受 Membership 保护的 Work Detail                                                              | Implementation Complete | —                          |
| 09       | OWNER DECIDED | Guest 不可阅读 Chapter 或 Article 正文                                                                      | Implementation Complete | —                          |
| 10       | OWNER DECIDED | 受保护内容要求登录及 active Reader Membership 或更高授权；Reader `/studio` 返回 `/archive`                  | Implementation Complete | —                          |
| 11       | OWNER DECIDED | 有效数据导出请求目标 30 天内处理，不作绝对保证                                                              | Implementation Complete | —                          |
| 12       | OWNER DECIDED | 有效删除请求完成身份核验后目标 30 天内处理；必要数据暂存，备份按轮换过期                                    | Implementation Complete | —                          |
| 13       | OWNER DECIDED | 以登录状态、注册名、渠道和最小必要账号信息合理核验；无法可靠确认时可暂停或拒绝                              | Implementation Complete | —                          |
| 14       | OWNER DECIDED | 应用数据随账号或内容存续；有效删除后删除适用活动数据；不固定承诺 90/180/365 天                              | Implementation Complete | —                          |
| 15       | OWNER DECIDED | 内部目标为最近 7 份日备份、4 份周备份、约 30 天；记录 Auth 与 Storage 排除项                                | Implementation Complete | 后续运维持续执行           |
| 16       | OWNER DECIDED | 仅限 18+；允许合法且符合 Content Policy 的成人题材，不允许违法、剥削、非自愿、侵私或未成年人内容            | Implementation Complete | —                          |
| 17       | OWNER DECIDED | 严禁未成年人性内容、剥削、诱导和性化场景，不得用虚构、同人或年龄模糊规避                                    | Implementation Complete | —                          |
| 18       | OWNER DECIDED | 禁止未经授权公开真实人物敏感信息，以及威胁、骚扰、恶意曝光隐私和欺骗冒充                                    | Implementation Complete | —                          |
| 19       | OWNER DECIDED | 采用已确认的具体禁止内容清单，不扩大为一般性思想审查                                                        | Implementation Complete | —                          |
| 20       | OWNER DECIDED | 正式邮箱接收治理请求；人工审核，可补充信息、临时限制、隐藏、下架、删除及限制账号，并保留合理解释或申诉机会  | Implementation Complete | —                          |
| 21       | OWNER DECIDED | 使用普通侵权和人工下架机制；不宣称 DMCA Agent 或完整美国 DMCA 流程，也不拒绝美国权利人的合法通知            | Implementation Complete | —                          |
| 22       | OWNER DECIDED | 适用中华人民共和国法律                                                                                      | Implementation Complete | —                          |
| 23       | OWNER DECIDED | 优先友好协商；无法解决时提交中国境内依法具有管辖权的人民法院，不指定具体城市、区县或法院                    | Implementation Complete | —                          |
| 24       | OWNER DECIDED | 独立法律审阅状态为 NOT COMPLETED                                                                            | Implementation Complete | Legal Review Pending       |
| 25       | OWNER DECIDED | 接受未完成法律审阅时进行有限、邀请制、Reader-only Beta 的风险；不扩展为公开注册、商业运营或外部 Author Beta | Implementation Complete | 扩大范围前重新评估法律审阅 |
| 26       | OWNER DECIDED | 本 Mission 不授权 Production Deployment；当前授权状态保持 NO                                                | Implementation Complete | Deployment / Smoke Pending |
| 27       | OWNER DECIDED | 当前不授予最终 Release Approval；等待 RC、授权、部署、Production Smoke 和最终签署                           | Implementation Complete | Final Acceptance Pending   |

## 完成与待办

### Decision Complete

- DECISION-01–27：27 / 27 `OWNER DECIDED`。
- 核心 Owner Decision 未留空。

### Implementation Complete

- 唯一规范来源已建立。
- 历史 Draft 与历史 `V1-PUBLIC-POLICY.md` 已保留并标记 superseded。
- `/privacy`、`/terms`、`/content-policy` 已同步。
- Footer、注册页、`/legal` redirect、SEO 与 sitemap 范围保持。

### Deployment Pending

- Production Deployment Authorized：`NO`。
- 未执行 Production Deployment。

### Smoke Test Pending

- Production Policy Smoke Test：`NOT RUN`。

### Final Acceptance Pending

- Product Owner Final Acceptance：`PENDING`。
- 当前不得报告 `Legal Approved`、`Production Deployed` 或 `Release Approved`。
