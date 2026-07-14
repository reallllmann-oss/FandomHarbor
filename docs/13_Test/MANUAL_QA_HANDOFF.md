# Manual QA Handoff

Status: Mandatory
Authorized by: Product Owner
Effective date: 2026-07-11

## Purpose

本规则适用于所有需要 Product Owner 人工验收的 Mission。工程检查通过并不等于可交付；只有 QA Environment、Fixture 和适用身份链路全部 Ready，Mission 才能标记 `Completed` 或 `Awaiting Product Owner Acceptance`。

## Required pre-handoff sequence

1. 确认实际应用 URL、运行环境及当前进程是否包含最新代码。
2. 如果项目使用 Local QA Fixture，执行 `pnpm qa:credentials`。
3. 如果凭据缺失或失效，先执行 `pnpm qa:fixture`；需要干净重建时执行 `pnpm qa:reset`。
4. 使用与 Fixture 相同的 Supabase 环境启动 Web；本地 Fixture 使用 `pnpm qa:web`。
5. 自动验证 Guest Homepage、Reader 登录、Author 登录及角色边界。
6. Mission 涉及注册时，使用有效 Invitation Code 验证一次完整注册。
7. 验证 Desktop、Mobile 及本 Mission 的 Regression 路径。
8. 所有验证通过后，才能生成 Final Output 并进入人工验收。

## Final Output contract

### QA Environment

- Local URL。
- Login URL。
- 当前运行环境，例如 Local Supabase QA Fixture、Preview 或 Production。
- 当前服务器是否已经运行最新实现。
- Product Owner 是否需要重启服务器；如需要，提供准确命令。

### QA Credentials

按适用范围主动提供：

- Guest：是否无需登录。
- Reader registration name 与 password。
- Author registration name 与 password。
- Invitation Code。
- Login URL。
- Author Profile URL。

凭据必须通过 `pnpm qa:credentials` 在交付当次动态读取。禁止把密码、邀请码或真实用户凭据写入 tracked 文档、Commit、Issue 或截图。

### QA Validation

必须记录实际结果，而不是待验收说明：

- Guest Homepage access。
- Reader password login。
- Author password login。
- Author Profile 与 Studio access（适用时）。
- Reader Studio denial（适用时）。
- Invitation registration（Mission 涉及注册时）。
- Browser console / blocking runtime errors。

### Manual QA Checklist

```text
Manual QA

□ Homepage
□ Register（如适用）
□ Login
□ Archive
□ Reading
□ Author
□ Studio（Author）
□ Mobile
□ Desktop
□ Regression
```

Final Output 可根据 Mission 标注 N/A 或补充细项，但不得删除上述基础项目。

## P0 failure policy

以下任一情况均为 P0 handoff blocker：

- 应用 URL 无法访问或运行的不是最新实现。
- `pnpm qa:credentials` 失败。
- QA Fixture 不存在或与当前环境不匹配。
- Reader / Author 账号不存在、密码错误或无法登录。
- Author 无法进入应有的 Studio / Profile，或 Reader 获得错误权限。
- Mission 涉及注册但 Invitation Code 无效。
- Product Owner 无法开始人工验收。

发生 P0 时不得结束 Mission，不得标记 `Completed` 或 `Awaiting Product Owner Acceptance`。必须诊断根因、修复或重建 Fixture、重新启动正确 QA 环境并完成复验。只有 QA Environment Ready 后才允许交付。

## Scope rule

注册流程仅在当前 Mission 涉及 Register / Invitation / Auth 时要求执行新账号注册；其他 Mission 必须提供有效 Invitation Code，但可将注册验证标为 N/A，并说明已沿用最近通过的 Auth 回归基线。Guest、Reader 与 Author 登录验证对所有使用这些角色的 Manual QA Mission 都是强制项。
