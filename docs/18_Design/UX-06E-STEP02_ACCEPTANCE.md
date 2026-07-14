# UX-06E Step02 Search Layout Upgrade Acceptance

Status: **Completed / Awaiting Product Owner Review**
Date: 2026-07-13
Phase: Implementation Polish

## 1. Mission

在 UX-06E Step01 Design Contract 冻结的边界内升级 `/search` 的页面结构、视觉层级、结果呈现、状态连续性与响应式质量，使 Search 成为 Published Work 与公开 Author 的主动查询入口，同时保持既有数据、权限、Published-only 与查询合同不变。

## 2. Completed

- 建立 Orientation → Query → Query Context / State → Work Results → Author Results 的稳定页面节奏。
- 将 `Search MVP`、`Published Works` 与 raw Slug 等工程语言收敛为 Reader-facing 中文查询语气。
- 为 Search input 增加持续可见 label，保留 GET、`q`、80-character boundary、query retention 与既有 validation。
- Work Result 使用现有 title、summary、public author 与 `publishedAt` 建立内容优先层级。
- Author Result 使用现有 public display name、bio 与 Published Work count 建立独立结果层级。
- Work title、Work author、Work entry、Author title 与 Author entry 均具备至少 44px 可操作高度。
- Initial / Empty 增加 Archive 与 Homepage 恢复路径；Loading 保留 Search 页面形态；Error 使用单一 `role="alert"` announcement owner。
- 1440、1280、768、390 responsive、Light / Dark、键盘焦点、长 query 与移动端换行均通过。

## 3. Changed Files

- `apps/web/src/app/search/page.tsx`
- `apps/web/src/app/search/loading.tsx`
- `apps/web/src/app/search/error.tsx`
- `apps/web/src/app/globals.css`（仅新增 / 调整 `.search-*` route-local 样式）
- `docs/18_Design/UX-06E-SEARCH-DESIGN-CONTRACT.md`
- `docs/18_Design/UX-06E-STEP02_ACCEPTANCE.md`
- `docs/18_Design/DESIGN_STATUS.md`
- `docs/18_Design/UX_PHASE_ROADMAP.md`
- `.ai/PROJECT_STATUS.md`
- `.ai/MEMORY.md`
- `.ai/CHANGELOG.md`

## 4. Resolved Step01 Findings

- SE-AUDIT-001：内部 MVP / Slug 语言已移除或降级为查询能力说明。
- SE-AUDIT-002：generic stacked cards 已替换为 route-local 编辑式 Search 分区。
- SE-AUDIT-003：Work / Author 信息层级已转为内容与身份优先，并使用既有 `publishedAt`。
- SE-AUDIT-004：主要 Work / Author entries 已补足至少 44px。
- SE-AUDIT-005：Search input 已增加可见 label。
- SE-AUDIT-006：Empty 已增加 Archive / Homepage 恢复入口。
- SE-AUDIT-007：Loading 已保持 Search orientation、query 与结果区形态。
- SE-AUDIT-008：Error 已收敛为单一 assertive announcement owner。

P0：0。
P1：0。

## 5. Functional Contract Preserved

- Search 仍使用 GET `q` URL、既有 normalization、80-character validation 与 query retention。
- Work / Author matching、ordering、result cap 与 Published-only 规则未改变。
- Draft Work 不进入 Guest、Reader 或 Author 的公共 Search 结果。
- Work Result 仍前往既有 Work Detail；Author Result 仍前往既有 Author Profile。
- Search 不承担 Archive pagination、推荐、排名、Feed、Marketplace、filters、history、Studio management 或 Reading immersion。

未修改 Database schema、Migration、RLS、RPC、Auth、Permission、Search Gateway、Service、Repository、查询合同、依赖或生产部署配置。

## 6. Responsive & Browser QA

| Viewport           | Result | Evidence                                            |
| ------------------ | ------ | --------------------------------------------------- |
| Desktop 1440 × 900 | PASS   | 页面层级、结果分区与控件高度稳定；无横向溢出        |
| Laptop 1280 × 800  | PASS   | 内容宽度与 Work / Author 结果节奏稳定               |
| Tablet 768 × 1024  | PASS   | main client / scroll width 均为 720px；无溢出元素   |
| Mobile 390 × 844   | PASS   | main client / scroll width 均为 358px；控件自然堆叠 |

- Guest：默认、有效 query、无结果、长 query、Work / Author entry 与 Draft isolation 通过。
- Reader：登录、3 个 Published QA Works、Work Detail entry 与 Draft-only query 0 结果通过。
- Author：登录、公开 Author result、Author Profile entry 与 Draft-only query 0 结果通过。
- Published-only：Reader 只看到 3 个 Published QA Works；`Hidden Draft Work` 未出现。
- Light / Dark：均通过，页面在主题切换后保持零横向溢出。
- Browser console errors：0。

Loading 与 Error 通过 route component、语义、恢复动作与 live-region ownership 审查；没有制造 RPC 故障或改变数据源来强制触发 Error。

## 7. Local QA Fixture Authorization

Product Owner 已授权为本 Mission 执行 `pnpm qa:fixture` 与 `pnpm qa:credentials`。

- Fixture 仅写入本地 Supabase，并通过 localhost guard。
- Reader / Author 本地登录与角色边界验证通过。
- 未连接或修改远程 Supabase。
- 未新增 Migration、Schema、RLS、RPC 或 Permission change。
- 具体 QA 密码不写入验收文档；本地凭据继续由 Git-ignored `.local/qa-fixture.json` 管理。

## 8. Validation

- `pnpm qa:fixture`：PASS。
- `pnpm qa:credentials`：PASS。
- Web lint：PASS。
- Web typecheck：PASS。
- Web tests：79 / 79 PASS。
- `pnpm validate`：PASS。
- Format check：PASS。
- Workspace lint：PASS。
- Workspace typecheck：PASS。
- Workspace tests：167 / 167 PASS；Web 79 / 79 PASS。
- Web / Admin / Docs production builds：PASS。

## 9. Product Implementation

本 Mission 修改了产品实现，但仅限 `/search` route-local React、Loading / Error composition 与 `.search-*` presentation CSS。

Search 数据获取、权限、Published-only、Gateway、Service、Repository、RPC、query fields、matching、ordering、result cap 与 URL contract 均未改变。

## 10. Decision

UX-06E Step02 Search Layout Upgrade 已完成工程交付，并通过完整 validation 与浏览器 QA。

Search Layout Ready for Step03: **YES**。

UX-06E Step03 未授权、未开始；等待 Product Owner 验收。
