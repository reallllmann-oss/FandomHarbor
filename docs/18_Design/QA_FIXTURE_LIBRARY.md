# Fandom Harbor QA Fixture Library

Status: PASS — Product Owner Accepted
Mission: UX-06C Step04A QA Fixture Library Foundation
Environment: Local non-production QA only

## 1. Fixture Philosophy

QA Fixture Library 属于测试基础设施，不属于生产内容、产品功能或默认 Seed。

原则：

- 只连接 `localhost`、`127.0.0.1` 或 `::1` 的 Supabase Local Runtime。
- 使用固定 QA UUID、`qa-reading-*` slug 和 `[QA Fixture]` 标识。
- 内容全部为合成测试文本，不使用真实作者或用户作品。
- 重复执行先精准删除固定 QA 内容，再重建同一份 Library，不产生副本。
- Fixture 可以单独清理；账号、Membership、Role Grant 和本地凭据保持不变。
- 不创建 Migration，不修改 Schema、RLS、Permission Model 或 Reader business logic。

## 2. Fixture Types

| Type                 | Route                                 | Purpose                                        |
| -------------------- | ------------------------------------- | ---------------------------------------------- |
| Short Reading        | `/works/qa-reading-short`             | 快速页面、单章节和基本阅读验证                 |
| Long-form Reading    | `/works/qa-reading-longform`          | 20–30 分钟阅读量、长滚动与阅读舒适度验证       |
| Multi Chapter        | Long-form Work 的 3 个 Published 章节 | Previous / Next、目录、切章和情绪连续性验证    |
| Empty Published Work | `/works/qa-reading-empty`             | Published Work 无 Published Chapter 的空状态   |
| Draft Isolation      | QA Author Studio only                 | Reader、Archive 和公开 Author Profile 隔离验证 |

## 3. Reading QA Fixture

### Short Reading Fixture

- 1 个 Published Work。
- 1 个 Published Chapter。
- 4 个合成段落。

### Long-form Reading Fixture

- Work: `[QA Fixture] Long-form Reading Harbor`。
- Chapter 1: `[QA] Long Watch`，150 段，渲染文字约 14,242 字符。
- Chapter 2: `[QA] Tide Ledger`，60 段，用于中等篇幅和连续性验证。
- Chapter 3: `[QA] Return Log`，18 段，用于末章与 Chapter End 验证。
- Chapter 4: `[QA] Sealed Draft`，Draft，不进入 Reader 数据流。

Long-form Chapter 的序列化 `content` 长度必须大于 10,000；Fixture 创建脚本在事务内验证该门槛与 3 个 Published Chapters。

### Edge Case Fixtures

- Published Work with zero Published Chapters。
- Draft-only Work with one Draft Chapter。
- Long-form Work 内混合 Published / Draft Chapters。

## 4. Creation Method

从项目根目录执行：

```bash
pnpm qa:fixture
```

行为：

1. 验证 Supabase API 必须是本地地址。
2. 创建或修复现有 Reader / Author QA identities。
3. 只删除固定 Reading QA UUID 对应的 Work Tag、Chapter 和 Work。
4. 在事务中重建 4 个 Work、6 个 Chapter。
5. 验证 Long-form 长度、Published Chapter 数量和 Reader / Author 权限基线。

该命令可重复执行；相同环境中结果保持 4 Works / 6 Chapters。

## 5. Cleanup Method

仅清理 Reading QA 内容：

```bash
pnpm qa:fixture:clean
```

该命令删除固定 QA Work Tag links、Chapters 和 Works，保留：

- Reader / Author QA identities。
- `.local/qa-fixture.json` credentials。
- Membership、Author Role Grant、Invitation 与 Author Profile。

完整本地数据库重建并恢复全部 Fixture：

```bash
pnpm qa:reset
```

## 6. Usage Guide

1. 执行 `pnpm qa:fixture`。
2. 执行 `pnpm qa:credentials` 动态读取本地账号。
3. 启动或确认 `pnpm qa:web`。
4. Reader 从 `/archive` 进入 Long-form Work，再进入 `/chapters/long-watch`。
5. 在 1440、768 与 390 视口验证滚动、Settings、Directory、Previous / Next 与 Draft 隔离。
6. Author 通过 `/studio/works` 验证全部自有 QA Works；公开 Author Profile 只能显示 Published Works。
7. QA 完成后按需要执行 `pnpm qa:fixture:clean`。

## 7. Safety Boundary

- 禁止在 Production、Preview 或 linked remote Supabase 执行 Fixture。
- 禁止把本地密码和 Invitation Code 写入文档、Issue、Commit 或截图。
- Fixture 不改变任何产品能力；它只为既有 Published-only Reader 与 owner-scoped Author paths 提供可重复测试数据。
- 新增 Fixture 类型必须继续使用同一 Library，不创建第二套 QA 系统。
