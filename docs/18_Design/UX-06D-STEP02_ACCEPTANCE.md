# UX-06D Step02 Archive Layout Upgrade Acceptance

Status: **PASS — Product Owner Accepted**
Date: 2026-07-13
Phase: Implementation Polish

## 1. Mission

在 UX-06D Step01 Design Contract 冻结的边界内升级 `/archive` 的视觉层级、页面节奏、作品呈现与响应式质量，使 Archive 更接近 `Curated Story Discovery Space`，同时保持现有功能、数据、权限与 Published-only 合同不变。

## 2. Completed

- Orientation、Browse Controls、Results、Pagination、Private Return 五段结构已建立。
- 作品展示由 generic stat-card 调整为编辑式作品列表；标题、简介、作者、发布日期与阅读入口层级明确。
- Public discovery 与浏览器本地 Reader Shelf 已通过语义、文案、留白与背景层级分离。
- Archive 页面级标签统一为中文；既有共享 ReaderShelf 内部文案与功能未改动。
- Empty 提供 Homepage / Search 恢复动作。
- Loading 使用 route-local 静态骨架保持页面形态连续；Error 文案与返回动作保持清晰。
- 1440、1280、768、390 responsive 均无横向溢出，排序与分页保持安全。

## 3. Changed Files

- `apps/web/src/app/archive/page.tsx`
- `apps/web/src/app/archive/loading.tsx`
- `apps/web/src/app/archive/error.tsx`
- `apps/web/src/app/globals.css`（仅新增 / 调整 `.archive-*` route-local 样式）
- `docs/18_Design/UX-06D-ARCHIVE-DESIGN-CONTRACT.md`
- `docs/18_Design/UX-06D-STEP02_ACCEPTANCE.md`
- `docs/18_Design/DESIGN_STATUS.md`
- `docs/18_Design/UX_PHASE_ROADMAP.md`
- `.ai/PROJECT_STATUS.md`
- `.ai/MEMORY.md`
- `.ai/CHANGELOG.md`

## 4. Resolved Step01 Issues

- AR-AUDIT-001：公共发现与私人回访边界已明确。
- AR-AUDIT-002：作品从 generic inventory tiles 调整为内容优先的编辑式列表。
- AR-AUDIT-004：Archive 页面级中英文混用已收敛。
- AR-AUDIT-005：Empty 已提供 Homepage / Search 恢复入口。
- AR-AUDIT-006：Loading 已保持 Archive 页面结构连续性。

## 5. Functional Contract Preserved

- 四种排序：newest、oldest、title A–Z、title Z–A。
- GET query 与 page / sort URL restoration。
- 既有分页、第一页 / 最后一页与越界恢复逻辑。
- Published-only gateway、Reader Permission 与 Draft Isolation。
- Work Detail 与 Author Profile 既有链接目的地。
- ReaderShelf 的浏览器本地保存行为。

未修改 Database、Supabase、RLS、RPC、Migration、Auth、Permission、Repository、`BrowseWork`、Search logic、业务逻辑或生产部署配置；未增加依赖或 QA 数据。

## 6. Responsive & Browser QA

| Viewport           | Result | Evidence                                 |
| ------------------ | ------ | ---------------------------------------- |
| Desktop 1440 × 900 | PASS   | 无横向溢出；双栏作品节奏、排序与分页稳定 |
| Laptop 1280 × 800  | PASS   | 无横向溢出；内容宽度与层级稳定           |
| Tablet 768 × 1024  | PASS   | 单栏作品节奏、控件与分页稳定             |
| Mobile 390 × 844   | PASS   | 无横向溢出；排序与恢复动作全宽；分页安全 |

四种排序均真实执行并返回预期顺序。`page=999` 恢复为有效第一页；无效 page 不破坏渲染。匿名、Reader、Author 均可进入 Archive，身份边界不变。Reader 可进入 Published Work，两个 Draft Fixture 均返回 404；Archive 不展示 Draft。Browser console error：0。

## 7. Validation

- QA Fixture Library：复用现有 `pnpm qa:fixture`；PASS。
- QA Credentials：复用现有 `pnpm qa:credentials`；PASS。
- Web typecheck：PASS。
- Web lint：PASS。
- Web tests：79 / 79 PASS。
- `pnpm validate`：PASS。

## 8. Remaining Issues

- AR-AUDIT-003（P2）：现有 `BrowseWork` metadata-light；本 Mission 按授权不扩张数据合同。
- AR-AUDIT-007（P2 / QA coverage）：Fixture 只有 4 个 Published Works，无法真实验证 Previous 与 Next 同时可用的多页 390px 状态；未创建新数据、未伪造 PASS。现有单页、disabled state 与越界恢复已通过。
- KI-024：明确排除在 Step02 外，保持原状态。

P0：0。
P1：0。

## 9. Manual QA Handoff

QA Environment：`http://localhost:3000/archive`；本地 QA Fixture 已建立。
Reader：`Harbor QA Reader` / `[已移除：使用安全凭据命令查看]`。
Author：`Harbor QA Author` / `[已移除：使用安全凭据命令查看]`。
Credentials 仅用于 localhost QA，不得用于生产环境。

Manual QA Checklist：

- [ ] 以 Guest 检查 Archive 结构、四种排序、作品与作者链接。
- [ ] 在 1440、1280、768、390 检查无水平溢出与阅读层级。
- [ ] 以 Reader 打开 Published Work，并确认 Draft Work / Draft Chapter 返回 404。
- [ ] 以 Author 打开 Archive，确认公开浏览结果与 Reader 一致且不出现管理动作。
- [ ] 检查 Private Return 区域不被误解为公共结果。
- [ ] 检查 Light / Dark、键盘焦点、44px 控件、Loading / Error / Empty 恢复。
- [ ] 检查浏览器控制台 error 为 0。

## 10. Decision

UX-06D Step02 Archive Layout Upgrade 已完成工程交付，满足当前授权范围。

Archive Layout Ready for Step03: **YES**。

Step03 未授权、未开始；等待 Product Owner 验收。
