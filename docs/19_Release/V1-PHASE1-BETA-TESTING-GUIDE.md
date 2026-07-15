# Fandom Harbor V1 第一阶段 Reader-only 测试引导

状态：`BETA PHASES COMPLETED / PRODUCTION READINESS REVIEW PASS WITH CONDITIONS`
适用阶段：V1 Phase 1 Reader-only Controlled Beta
Phase 1 建议规模：3 名 Reader、0 名外部 Author

## 0D. Production Readiness Review 引用（2026-07-15）

Reader-only、Author001 Publish E2E、3 Reader 外部测试与外部 Author 测试均 PASS。当前：

- `Production Readiness Review = PASS`。
- `Production Ready = READY WITH CONDITIONS`。
- `Production Deployment Authorized = NO`。

Production 条件与风险见 [`V1-PRODUCTION-READINESS-REVIEW.md`](./V1-PRODUCTION-READINESS-REVIEW.md)。本指南不授权新的 Beta、Production、账号、邀请码、角色或 Admin 操作。

## 0C. V1 External Beta Closeout（2026-07-15）

本节记录 Product Owner 确认的实际完成结果：

- 3 名外部 Reader 小范围测试：`PASS`。
- 外部 Author 测试：`PASS`。
- Product P0 / P1：`0 / 0`。
- Guest 点击作品详情或章节进入登录页，属于当前 active Membership 规则，不作为缺陷。
- `/access` Admin 既有改动冻结到 Admin 阶段，不作为 External Beta Closeout 阻断项。

`V1 External Beta Closeout = PASS`。后续 Production Readiness Review 已完成并记录为 `PASS / READY WITH CONDITIONS`；本文不授权 Production、账号创建、邀请码发送、角色操作或 Admin 开发。

## 0B. External Beta Go / No-Go Review（历史，2026-07-15）

历史评审结论为 `GO — NOT OPENED`。外部 Beta 随后已经实际完成，当前状态以上方 Closeout 为准。当时推荐范围为：

- 1 名外部 Author。
- 5 名 Reader。
- 7 天。
- 仅使用 Web Preview；不进入 Admin、完整 Beta 或 Production。

测试内容限于邀请注册、登录 / 退出 / 重登、Homepage / Archive / Search、Work Detail / Reading、Author 最小创建 / 草稿 / 发布、Reader 回读、Draft isolation、Reader / Guest Studio denial、390px、Light / Dark 与反馈收集。

Guest 可在搜索中发现作品，但点击作品详情或章节后进入登录页，这是当前 active Membership 产品规则。发现 P0 或未获接受的 P1 时立即停止新邀请和新发布，保存截图、步骤和时间；不要删除数据或直接操作数据库。Product Owner 可暂停发放并撤销未使用邀请码；任何角色撤销、Membership 处置或新的 Author 授权都需要独立授权并通过受控 `/access` 与 audit 执行。

`/access` Admin 既有代码改动冻结到 Admin 阶段，本指南不授权继续开发、部署或进行 Admin 测试。

## 0. 第一阶段测试收口（2026-07-15）

Product Owner 已完成 V1 第一阶段 Reader-only 受控测试，本阶段记录为 `PASS / COMPLETED`。

- Reader-only Controlled Test Closeout：`PASS`。
- Product P0 / P1：`0 / 0`。
- 收到 1 项 Reading Page UI / Typography / Content Layout 反馈：正文阅读区域需要视觉居中，正文段落需要两端对齐。
- 该反馈定级为 P2；已通过最小 Reading CSS 调整关闭，不涉及正文数据、权限、发布逻辑或阅读偏好。
- 390px 移动端继续使用 `min-width: 0`、`width: 100%` 与受限正文宽度，未引入横向溢出。
- 本阶段完成不等于 Author Publish E2E、完整 Beta Ready 或 Production Ready；进入 Author-controlled 测试仍须 Product Owner 单独授权。

## 0A. Phase 2 Author-controlled 后续结果（2026-07-15）

Product Owner 随后单独授权并完成 Author001 Publish E2E。本节不改变 Phase 1 的 Reader-only 范围，只记录后续 Release evidence：

- Author001 创建作品、保存章节草稿、发布所选章节：`PASS`。
- Guest / Reader 未发布草稿隔离：`PASS`。
- Work Detail、Published Reading、Reader 回读：`PASS`。
- Reader 三条 Studio 路由返回 Archive；Guest `/studio` 进入登录页：`PASS`。
- Guest 搜索可见已发布作品，但作品详情与章节要求登录，符合当前产品规则。
- 390px、Light / Dark、Console：`PASS`；Product P0 / P1 = `0 / 0`。
- `Author-controlled Test = PASS`；外部 Beta 仍须 Product Owner 另行 Go / No-Go，不在本文自动开放。

## 1. 测试阶段说明

本阶段是 Fandom Harbor V1 第一阶段 Reader-only 受控测试，不是正式公开上线，也不代表完整 Beta Ready。

- 第一批建议邀请 3 名 Reader。
- 暂不邀请外部 Author。
- Author001 继续作为内部 Author，另行完成创建、保存、Draft isolation、发布与 Reader 回读 E2E。
- Admin / Super Admin 只由 Product Owner 或获批管理人员使用。
- 本阶段只收集 Reader 注册、登录、公开发现、已发布阅读、移动端体验和权限边界反馈。

当前 Web Preview：`https://fandom-harbor-ilvpjubrm-fandom-harbor.vercel.app`

## 2. 测试账号说明

| 身份                | 获得方式                                      | 本阶段范围                                |
| ------------------- | --------------------------------------------- | ----------------------------------------- |
| Guest               | 不登录直接访问                                | 检查公开页面、公开阅读、登录与注册入口    |
| Reader              | 使用 Product Owner 单独提供的邀请码注册       | 第一阶段主要测试身份                      |
| Author              | active Reader 经 Admin / Super Admin 单独授权 | 不向外部测试者开放；由 Author001 内部测试 |
| Admin / Super Admin | 受控既有管理账号                              | 仅 Product Owner 或获批管理人员使用       |

重要边界：

- 邀请码注册只创建 Reader，不会自动成为 Author。
- Reader 不需要申请或操作 Author 授权。
- Author 授权由 Admin / Super Admin 通过受控、可审计的流程另行处理。
- 测试者不得尝试进入 Admin、修改角色、直接操作数据库或分享账号。

## 3. 注册指引

1. 打开 Preview 的 `/auth/sign-up`。
2. 输入 Product Owner 预先分配的注册名。
3. 输入测试专用密码。
4. 输入 Product Owner 单独发送的邀请码。
5. 点击「创建账号」。
6. 注册成功后，使用同一注册名和密码登录。

当前注册页只包含：

- 注册名
- 密码
- 邀请码

当前页面没有邮箱字段，不要编造或填写邮箱流程。当前注册实现要求环境关闭邮箱确认，成功后直接回到登录页；Email Confirm 不是本阶段测试重点。

建议注册名：

- `reader-test-01`
- `reader-test-02`
- `reader-test-03`

由 Product Owner 为每名测试者预先分配一个注册名，避免重复。注册名已被占用时，不要连续尝试多个名字，先反馈 Product Owner。

密码要求与建议：

- 当前页面要求至少 8 位字符。
- 不要使用真实常用密码、邮箱密码、工作密码或其他网站正在使用的密码。
- 每名测试者自行保存测试密码，不要通过反馈表、截图或群聊发送密码。
- Product Owner 不需要收集测试者密码。

## 4. 邀请码指引

- 邀请码由 Product Owner 单独发放，每名测试者只使用分配给自己的邀请码。
- 邀请码仅用于注册 Reader，不会授予 Author、Admin 或 Super Admin。
- 不要在群聊、公开文档、截图、Issue 或社交平台传播邀请码。
- 如果邀请码失败，请保留页面错误提示并截图反馈，但截图前确认邀请码输入框内容已隐藏，不要在说明文字或文件名中写出邀请码。
- 常见失败原因包括邀请码无效、过期、被撤销、使用次数耗尽或注册请求过于频繁。
- 当前邀请码可能仍使用旧格式；后续计划优化为顺序、人工可读的短码。
- 邀请码格式优化是 V1 后续事项，本阶段不测试格式规则，也不因格式观感提交产品缺陷。

## 5. Reader 测试清单

每名 Reader 请逐项检查并记录 PASS、FAIL 或无法测试的原因。

### 注册与会话

- [ ] 使用 Product Owner 提供的邀请码完成注册。
- [ ] 确认注册后没有出现 Author 或 Admin 权限。
- [ ] 使用注册名和密码登录。
- [ ] 退出登录。
- [ ] 使用相同注册名和密码重新登录。

### 公开发现与阅读

- [ ] 打开 Homepage `/`。
- [ ] 打开 Archive `/archive`。
- [ ] 使用 Search `/search` 查询作品或作者。
- [ ] 从列表打开一篇 Work Detail。
- [ ] 打开作品对应的 Author Profile。
- [ ] 打开 Published Reading 页面。
- [ ] 阅读至少一个已发布章节。
- [ ] 如果阅读页提供主题、字号、行高或宽度设置，至少切换一项并确认页面仍可阅读。
- [ ] 使用手机完成一次主要页面检查，确认没有严重横向溢出。

### 反馈重点

- 页面入口是否容易理解。
- Search 结果是否清楚。
- Work Detail 是否能帮助决定是否阅读。
- Author Profile 是否能看懂作者及公开作品信息。
- 章节阅读是否顺畅，返回作品或继续阅读是否清楚。
- 文案、按钮和错误提示是否容易理解。

## 6. Reader 权限边界

Reader 登录后必须检查：

- [ ] 不能进入 `/studio`。
- [ ] 不能进入 `/studio/works`。
- [ ] 不能进入 `/studio/works/new`。
- [ ] 不能看到未发布草稿或 Draft Chapter。
- [ ] 不能创建作品。
- [ ] 不能保存、编辑或发布作品。
- [ ] 不显示 Admin / Super Admin 权限入口。

预期结果：直访三条 Studio 路由应被拒绝并回到 `/archive`，且页面不显示创建或发布能力。

如果 Reader 可以进入 Studio、看到其他人的草稿、创建作品或发布内容，立即停止相关操作并按 **P0** 反馈。不要继续保存、发布或修改任何内容。

## 7. Guest 测试清单

请先退出登录，或使用新的隐私窗口完成 Guest 检查。

- [ ] 未登录打开 Homepage。
- [ ] 未登录打开 Archive。
- [ ] 未登录使用 Search。
- [ ] 未登录打开 Work Detail。
- [ ] 未登录打开 Author Profile。
- [ ] 未登录打开 Published Reading 页面并阅读已发布章节。
- [ ] 未登录不能进入 Studio。
- [ ] 登录与注册入口容易找到，且能理解两者区别。
- [ ] Guest 页面没有显示 Reader、Author 或 Admin 私有信息。

## 8. 移动端检查

每名测试者至少使用一台手机检查一次。建议记录手机型号、系统和浏览器。

- [ ] Homepage 页面可正常滚动。
- [ ] Archive 列表和排序区可用。
- [ ] Search 输入、提交和结果可用。
- [ ] Work Detail 内容没有被裁切。
- [ ] Reading 正文、章节导航与阅读设置可用。
- [ ] 登录与注册表单可输入和提交。
- [ ] 页面没有明显横向溢出或必须左右拖动才能阅读。
- [ ] 主要按钮不难点击，没有按钮互相覆盖。
- [ ] 标题、正文、标签和错误提示没有严重截断。
- [ ] Light / Dark 切换后没有明显破版、看不清或颜色异常。

移动端轻微间距或视觉偏好问题通常记为 P2；无法登录、无法阅读或严重布局遮挡核心操作应按 P1 反馈。

## 9. 问题反馈模板

请复制以下模板，每个问题单独填写一份。不要在反馈中填写密码、邀请码、完整内部 User ID、Token 或其他敏感值。

```text
问题页面：
测试身份：Guest / Reader
设备：电脑 / 手机，型号或浏览器：
登录状态：未登录 / 已登录
操作步骤：
实际结果：
期望结果：
截图：
是否可复现：
严重程度：P0 / P1 / P2 / P3
```

截图建议：

- 截取发生问题的页面、错误提示和地址栏路径。
- 截图前隐藏密码、邀请码、浏览器自动填充内容和其他个人信息。
- 若问题可以重复出现，注明复现次数，例如“3 次中出现 3 次”。

## 10. 严重程度定义

| 等级 | 定义                                       | 示例                                                                                    |
| ---- | ------------------------------------------ | --------------------------------------------------------------------------------------- |
| P0   | 权限错误、安全边界失效或完全无法继续测试   | Reader 能进入 Studio、看到草稿、创建或发布；3 名测试者均无法注册                        |
| P1   | 核心流程失败                               | 单个测试者持续无法登录、Published Reading 打不开、Search 不可用、核心操作被移动布局遮挡 |
| P2   | 视觉、文案、按钮、间距或一般移动端体验问题 | 文案难懂、按钮偏小、局部文本截断、间距不协调                                            |
| P3   | 建议类优化                                 | 希望增加筛选、排序提示、个性化或其他非当前核心体验                                      |

不确定等级时先按实际影响描述，由 Product Owner 最终定级。发现 P0 时立即停止相关测试并通知 Product Owner。

## 11. 第一阶段通过标准

只有同时满足以下条件，Phase 1 Reader-only 测试才能记录为 PASS：

- 3 名 Reader 均可使用各自邀请码注册。
- 3 名 Reader 均可使用注册名和密码登录、退出并重新登录。
- Reader 权限边界正常，没有 Reader 进入 Studio、看到草稿、创建或发布作品。
- Homepage、Archive、Search、Work Detail 与 Author Profile 可访问。
- Published Work / Chapter 可阅读。
- Guest 公开访问边界正常。
- 每名测试者至少完成一次手机检查，且没有严重横向溢出。
- Product P0 = 0。
- Product P1 = 0，或每项 P1 已由 Product Owner 明确记录并接受风险。

本阶段 PASS 不等于 Author Publish E2E PASS、完整 Beta Ready 或 Production Ready。

## 12. Product Owner 邀请前清单

- [ ] 准备 3 个有效邀请码。
- [ ] 为每个邀请码记录非敏感用途、对应测试者、有效期与次数上限；不要把原始邀请码写入共享记录。
- [ ] 为 3 名测试者预分配 `reader-test-01`、`reader-test-02`、`reader-test-03`。
- [ ] 通过一对一受控渠道单独发送邀请码和 Preview 地址。
- [ ] 提醒测试者不要公开邀请码、不要使用真实常用密码、不要把密码发给 Product Owner。
- [ ] 准备本指南与问题反馈模板。
- [ ] 指定反馈收集位置、负责人和测试截止时间。
- [ ] 收集必要截图，并检查截图没有密码或邀请码。
- [ ] 不邀请外部 Author，不向 Reader 授权 Author。
- [ ] Author001 另行完成创建、保存、Draft isolation、发布与 Reader 回读 E2E。
- [ ] 不把 Reader-only 测试称为正式上线或完整 Beta Ready。

## 13. 可直接发给 Reader 测试用户的中文说明

```text
你好，感谢参加 Fandom Harbor V1 第一阶段 Reader-only 受控测试。

这次测试不是正式公开上线，主要希望确认 Reader 的注册、登录、作品发现、已发布章节阅读和手机端体验。当前不会向外部测试者开放 Author 或 Admin 权限。

请使用我单独发送给你的 Preview 地址、注册名建议和邀请码打开注册页。注册时只需要填写注册名、测试专用密码和邀请码，不需要填写邮箱。请不要使用你在其他网站或工作账号中使用的真实常用密码，也不要把密码发给我。

邀请码只用于创建 Reader 账号，请不要转发、公开或截图传播。注册后请尝试登录、退出、重新登录，并检查首页、Archive、Search、作品详情、作者主页和已发布章节阅读。也请至少使用手机检查一次，特别留意横向溢出、按钮难点、文本截断和 Light / Dark 显示问题。

Reader 正常情况下不能进入 /studio、/studio/works 或 /studio/works/new，也不能看到草稿、创建或发布作品。如果你能进入这些页面，请停止操作并立即反馈，这是最高优先级问题。

遇到问题时，请提供问题页面、Guest 或 Reader 身份、设备和浏览器、操作步骤、实际结果、期望结果、是否可复现以及截图。截图前请隐藏密码、邀请码和个人信息。

再次提醒：请勿传播邀请码，也不要在反馈中发送密码。谢谢你的帮助。
```

## 14. 本阶段安全边界

- 不收集或记录测试者密码。
- 不在共享文档保存原始邀请码。
- 不自动创建账号、发送邀请码或授予 Author。
- 不执行数据库、Auth、RLS、Migration、Vercel 或 Deployment 变更。
- Reader 权限异常按 P0 处理；发现后停止相关操作并由 Product Owner 决定下一步。
- Phase 1 结束后由 Product Owner 单独发起反馈整理 Mission，不自动进入下一阶段。
