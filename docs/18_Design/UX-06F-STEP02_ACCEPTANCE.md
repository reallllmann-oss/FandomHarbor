# UX-06F Step02 Author Profile Layout Upgrade Acceptance

Mission: UX-06F Step02 Author Profile Layout Upgrade
Status: Completed / Awaiting Product Owner Review
Phase: Implementation Polish
Date: 2026-07-13

## 1. Outcome

公开 `/author/[slug]` 已在 Step01 Design Contract 内完成 route-local Layout Upgrade，并建立以下稳定阅读顺序：

`Public Identity → Bio → Quiet Relationship → Published Works Context → Body of Work → Recovery`

页面现在以 public display name、bio 与 Published Works 作为主要表达，Follow / Unfollow 与公开计数保持 supporting 层级。Author Profile 的最终定位保持为 **Literary Creator Identity Space**，不是社交主页、粉丝页、作品商城或 Studio 管理页。

## 2. Modified Product Surface

- `apps/web/src/app/author/[slug]/page.tsx`
- `apps/web/src/app/author/[slug]/loading.tsx`
- `apps/web/src/app/author/[slug]/error.tsx`
- `apps/web/src/app/author/[slug]/follow-author-button.tsx`
- `apps/web/src/app/globals.css` 中仅新增 `author-*` route-local presentation classes。

未修改其他 route、shared component、Design System token 或 dependency。

## 3. Layout Upgrade

### Public Identity / Bio

- 使用「公开创作者」Reader-facing orientation，移除 `Author Profile` 混合展示语言。
- public display name 保持唯一 H1 与身份锚点。
- initials avatar 缩小并改为安静的 supporting identity cue。
- bio 提升至公开计数与关系动作之前，并保留换行与 long-token wrapping。
- public metrics 改为克制的 inline definition list，不表达排名、热度或增长。
- 不展示 registration identity、email、user ID、role、Membership、Draft 或 Studio owner context。

### Quiet Relationship

- Follow / Unfollow 移入独立 supporting region，使用安静的 outline presentation。
- Guest「登录后关注」、Reader current state、Author self hidden 与特殊 archive author hidden 行为保持不变。
- button、redirect、pending、error、authorization 与 revalidation 未改变。
- action 保持 native button / link、明确 accessible name 与至少 44px target。

### Published Works Context / Body of Work

- Published Works 使用明确 H2、公开集合数量与 Published-only 说明。
- 两列 nested inventory cards 改为单列 editorial body-of-work list。
- Work title 成为直接 Work Detail primary entry，并与「查看作品」共同满足至少 44px target。
- 使用当前真实 `publishedAt` 提供克制发布时间上下文。
- 移除每项重复链接回当前作者 Profile 的 self-attribution presentation。
- 不新增字段、排序、筛选、搜索、分页、推荐、排名或 metadata。

### Recovery

- 有作品时在页面末尾提供 Archive / Search 公共发现恢复区。
- Empty State 诚实说明当前没有 Published Works，并提供相同恢复入口。
- 不出现 Studio CTA、推荐作品、热门作者或新数据请求。

## 4. State Upgrade

### Empty

- 明确区分有效的零作品公开作者状态与 Not Found / Error。
- 提供 Archive / Search recovery，不展示 Draft 或作者管理动作。
- 当前 localhost Fixture 没有零 Published Work 的公开作者；按 Mission 的「如现有数据可覆盖」条件，本轮完成实现与合同审计，未伪造正式数据。

### Loading

- 用 route-local identity、bio geometry、relationship 与 work-list skeleton 替换 generic StatusPage。
- 使用一个 screen-reader status 与 `aria-busy`，不伪造作者名、bio、计数或作品内容。
- 未改变数据获取、Suspense、cache 或 route architecture。

### Error

- 使用单一 `role="alert"` owner，移除 nested assertive announcement 风险。
- 保留 Retry，并增加 Archive / Search recovery。
- 不暴露 Supabase、RPC、Repository、stack 或其他技术细节。
- Error 本轮按 Mission 要求完成合同审计；未通过改变环境或数据逻辑人为触发生产实现错误。

## 5. Step01 Finding Disposition

| Finding      | Step02 result                              | Evidence                                                                            |
| ------------ | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| AP-AUDIT-001 | Resolved                                   | identity / bio / body of work 提升；avatar、counts、Follow 降级                     |
| AP-AUDIT-002 | Resolved                                   | generic card stack 改为 route-local literary editorial layout                       |
| AP-AUDIT-003 | Resolved                                   | title 与「查看作品」均为 44px Work Detail entry                                     |
| AP-AUDIT-004 | Resolved                                   | work item 不再重复当前作者 self-link                                                |
| AP-AUDIT-005 | Resolved within contract                   | 展示既有 `publishedAt`；未扩张 metadata                                             |
| AP-AUDIT-006 | Resolved                                   | Empty 增加 Archive / Search recovery                                                |
| AP-AUDIT-007 | Resolved                                   | Profile-shaped Loading composition                                                  |
| AP-AUDIT-008 | Resolved                                   | single alert owner、Retry 与发现恢复路径                                            |
| AP-AUDIT-009 | Implementation resolved / QA note retained | name、bio、title、summary 均显式 `overflow-wrap: anywhere`；现有 Fixture 无极端数据 |
| AP-AUDIT-010 | Resolved                                   | arrival-neutral Archive / Search recovery                                           |

Step01 禁止处理项全部保留：没有新增 Author / Work field，没有扩大 Profile data contract，没有修改 Follow 业务、权限、Gateway、Service、Repository、RPC、RLS、Migration 或 Database。

### Step03 / post-Beta routing

- Step03 建议继续记录 `AP-QA-001`：在不写入正式产品数据的前提下补充极端长 display name / bio / Work title 的运行态证据；这不是当前产品阻塞或数据合同扩张授权。
- 没有需要转入 post-Beta 的 Author Profile product finding。
- P0 = 0，P1 = 0。

## 6. Role, Permission and Data Boundary

- Guest：公开 Profile 可进入；显示「登录后关注」。
- Reader：公开 Profile 可进入；当前「已关注 · 取消」状态正确。
- Author self：公开 Profile 可进入；不显示 Follow action。
- Profile 主体不显示 Studio 管理动作。
- Profile 只显示 4 部当前 Published Works；`Hidden Draft Work` 不出现。
- Draft Work direct route：Not Found presentation。
- Draft Chapter `sealed-draft` direct route：Not Found presentation。
- Follow / Unfollow action、permission、redirect、pending、error 与 revalidation：UNCHANGED。
- Author Profile data contract、Published-only 与 Draft isolation：UNCHANGED。
- Database / Supabase / RLS / RPC / Migration / Repository / Gateway / Service：NONE。

## 7. Navigation QA

- Direct public Author Profile：PASS。
- Archive → Author Profile：PASS。
- Search Author Result → Author Profile：PASS。
- Work Detail → Author Profile：Reader PASS。
- Author Profile title entry → Work Detail：Reader PASS。
- Recovery → Archive / Search href contract：PASS。

## 8. Responsive, Theme and Accessibility QA

| Width | Document / viewport | Main scroll / client | Result |
| ----- | ------------------- | -------------------- | ------ |
| 1440  | 1440 / 1440         | 1216 / 1216          | PASS   |
| 1280  | 1280 / 1280         | 1216 / 1216          | PASS   |
| 768   | 768 / 768           | 720 / 720            | PASS   |
| 390   | 390 / 390           | 358 / 358            | PASS   |

- Horizontal overflow：0。
- Light / Dark semantic surfaces、text 与 border：PASS。
- H1 / H2 / H3 hierarchy：1 / 1 / 4，PASS。
- Work title、Work entry、Follow 与 recovery target：44px minimum，PASS。
- focus-visible：2px semantic focus outline + 3px offset，PASS。
- long-content implementation safety：explicit wrapping PASS；现有 Fixture coverage limitation 记录为 `AP-QA-001`。
- Browser console errors：0。

## 9. Validation

- `pnpm qa:fixture`：PASS；localhost only。
- `pnpm qa:credentials`：PASS；具体密码未记录。
- Web lint：PASS。
- Web typecheck：PASS。
- Web tests：79 / 79 PASS。
- Web production build：PASS。
- `pnpm validate`：PASS；167 / 167 workspace tests，Web / Admin / Docs production builds PASS。
- `git diff --check`：PASS。

## 10. Decision

- Product implementation changed：YES，Author Profile route-local presentation only。
- Data layer changed：NO。
- Follow / Unfollow business changed：NO。
- Author Profile data contract changed：NO。
- Permission / Published-only changed：NO。
- Ready for Product Owner Review：YES。
- Author Profile Layout Ready for Step03：YES。

UX-06F Step03 未授权，不得自动开始。
