# Fandom Harbor V1 Public Policy Web Acceptance

状态：`OWNER DECISION COMPLETE / IMPLEMENTATION COMPLETE / LEGAL REVIEW NOT COMPLETED / PRODUCTION DEPLOYMENT NOT RUN`

日期：2026-07-25

Mission：V1 Public Policy Web Pages Implementation

## 0. Owner Decision Application 更新 — 2026-07-25

- Product Owner 已完成 DECISION-01–27。
- 当前唯一正式政策规范来源为 [`V1-PUBLIC-POLICY-V1.0.md`](./V1-PUBLIC-POLICY-V1.0.md)。
- 原 Draft 保留为历史输入；原 `V1-PUBLIC-POLICY.md` 保留为 LEGACY / SUPERSEDED。
- 三个政策页面已同步 V1.0、运营主体、批准日期、生效方式、访问、数据、内容治理及法律状态决定。
- 独立法律审阅仍为 `NOT COMPLETED`。
- Production Deployment 为 `NOT RUN`，Production Policy Smoke Test 为 `NOT RUN`，Final Acceptance 为 `PENDING`。
- 本节为当前状态；下方原 Web Implementation Mission 结论作为历史工程验收记录保留。

### Owner Decision Application 验证

- `pnpm validate`：PASS，包括全仓 Prettier、Lint、TypeScript、自动化测试和 Production Build。
- Web 自动化测试：17 files / 81 tests PASS；SEO 测试包含三个政策 sitemap 路由。
- Production Build：PASS；`/privacy`、`/terms`、`/content-policy`、`/legal`、`/sitemap.xml` 均出现在构建路由中。
- 本地 Production build 匿名 HTTP：三个政策路由和注册页均为 200；`/legal` 为 308 并重定向到 `/terms`。
- 1280 × 800 Light：Privacy、Terms、Content Policy 的标题、V1.0、批准日期、运营主体、生效方式和 `NOT COMPLETED` 状态可读；`scrollWidth === clientWidth === 1280`；页面 Console Error=0。
- 390 × 844 Dark：政策正文、状态卡片、导航和 Footer 可读；`scrollWidth === clientWidth === 390`；Footer 三个政策链接高度均为 44px；页面 Console Error=0。
- 注册页：18+ / 邀请制提示存在，Terms / Privacy / Content Policy 链接正确，邀请码仍 required，强制复选框数量为 0。
- Sitemap：Browser 对 XML 直开被客户端拦截；自动化 SEO 测试和本地 HTTP 内容检查均确认三个政策 URL，XML 视觉项标记 `MANUAL VERIFICATION REQUIRED`，不伪报浏览器直开 PASS。
- 本地浏览器残留的无效 chunked cookie 被 `@supabase/ssr` 按无 Session 处理并产生服务端 warning；页面保持 Guest 状态，HTTP、DOM 和 Console 验证均通过，未读取、修改或输出 cookie 内容。
- Product P0 / P1：0 / 0。

## 1. Mission 状态

三个公开政策页面、Web Footer 入口、注册页政策提示、metadata、sitemap 和兼容路由均已实现。Lint、TypeScript、自动化测试、Production Build、桌面与移动端浏览器检查、匿名直达与刷新、链接、主题、横向溢出、diff check 和 Secret 特征扫描均已执行。

政策主要来源仍明确标记为 `Draft / Pending Product Owner Approval`，生效状态仍为 `Pending Production launch`，法律审阅未完成，并包含待确认的备份保留期限等内容。因此本 Mission 不能报告完全 Release Approved，最终工程结论为：

`PASS WITH OWNER REVIEW`

## 2. 修改文件

本 Mission 新增或修改：

- `apps/web/src/app/_components/public-policy.tsx`
- `apps/web/src/app/privacy/page.tsx`
- `apps/web/src/app/terms/page.tsx`
- `apps/web/src/app/content-policy/page.tsx`
- `apps/web/src/app/legal/page.tsx`
- `apps/web/next.config.ts`
- `apps/web/src/app/auth/sign-up/page.tsx`
- `apps/web/src/lib/seo.ts`
- `apps/web/src/lib/seo.test.ts`
- `packages/ui/src/components/layouts.tsx`
- `packages/ui/src/styles.css`
- `docs/19_Release/V1-PUBLIC-POLICY-DRAFT.md`
- `docs/19_Release/V1-PUBLIC-POLICY-WEB-ACCEPTANCE.md`
- `.ai/PROJECT_STATUS.md`
- `.ai/MEMORY.md`
- `.ai/CHANGELOG.md`
- 与 PDR-01 直接相关的 Release / Production 状态文档。

工作区在本 Mission 开始前已有未提交的 Admin、Release、政策与备份证据改动；这些既有改动未被本 Mission 当作新实现，也未被删除、提交、推送或部署。

## 3. 公开路由

| 路由              | 内容           | Guest 直达 / 刷新 | Session 依赖 |
| ----------------- | -------------- | ----------------- | ------------ |
| `/privacy`        | Privacy Policy | PASS              | 无页面级依赖 |
| `/terms`          | Terms of Use   | PASS              | 无页面级依赖 |
| `/content-policy` | Content Policy | PASS              | 无页面级依赖 |

旧 `/legal` 路由保留为到 `/terms` 的永久兼容重定向，避免旧入口直接失效；sitemap 只列出三个新的规范政策路由。

三个页面均使用现有 Web Root Layout、ReaderLayout、Header、主题、颜色、字体、间距与 focus token。正文容器限制为 `max-w-3xl`，长文本和链接启用安全换行，不使用客户端状态或外部动态政策内容。

## 4. 内容来源

原 Web Implementation Mission 当时的主要来源（现为历史输入）：

`docs/19_Release/V1-PUBLIC-POLICY-DRAFT.md`

当前唯一正式政策规范来源：

`docs/19_Release/V1-PUBLIC-POLICY-V1.0.md`

映射：

- `/privacy`：草稿第 2 节及第 5.1–5.3 节。
- `/terms`：草稿第 1、3、6、7、8 节。
- `/content-policy`：草稿第 4、5.1、5.4 节。

页面按信息架构重新编号，不改变来源条款的实质含义。代码内保留对应来源节号注释，便于审计。

## 5. Footer 修改结果

- Desktop：Privacy、Terms、Content Policy 三个入口可见，PASS。
- Mobile 390px：三个入口可见并自动换行，PASS。
- 路径：分别指向 `/privacy`、`/terms`、`/content-policy`，PASS。
- 打开方式：未设置 `target`，不强制新窗口，PASS。
- 点击检查：Footer 的 Content Policy 入口成功进入 `/content-policy`，PASS。
- AdminLayout 与 DocsLayout 未注入 Web Reader 政策链接，避免在独立 App 中生成无效相对路由。

## 6. 注册页政策提示

提示文本：

“完成注册即表示你同意 Terms，并已阅读 Privacy 与 Content Policy。”

- Terms：`/terms`，可点击，PASS。
- Privacy：`/privacy`，可点击，PASS。
- Content Policy：`/content-policy`，可点击，PASS。
- 未新增强制复选框。
- 未修改邀请码字段、注册名字段、密码字段、Server Action、注册 RPC、角色或 Membership 创建逻辑。
- 浏览器从注册页点击 Terms 成功进入 `/terms`，PASS。

## 7. Metadata

三个页面均通过现有 `pageMetadata` helper 提供独立：

- `title`
- `description`
- canonical
- Open Graph title / description / URL
- index / follow

metadata 不包含营销承诺、内部文件路径、测试账号、Supabase Key、环境变量值或管理信息。

## 8. 桌面端验证

环境：本地 Next.js，1280 × 800，Guest。

| 检查项                                 | 结果 |
| -------------------------------------- | ---- |
| 三个路由直达与刷新                     | PASS |
| H1、H2、H3 与列表语义                  | PASS |
| Title 与 description                   | PASS |
| Footer 三链接                          | PASS |
| 不发生登录重定向                       | PASS |
| `scrollWidth === clientWidth === 1280` | PASS |
| Light 主题可读性                       | PASS |
| 页面级 Console Error                   | 0    |

## 9. 移动端验证

环境：本地 Next.js，390 × 844，Guest。

| 检查项                                | 结果 |
| ------------------------------------- | ---- |
| 三个政策页面                          | PASS |
| 注册页政策提示                        | PASS |
| Footer 三链接                         | PASS |
| Footer 链接最小高度 44px              | PASS |
| `scrollWidth === clientWidth === 390` | PASS |
| Dark 主题可读性                       | PASS |
| 页面级 Console Error                  | 0    |

## 10. Guest 与登录状态访问

- Guest 未登录：三个路由直达、刷新与页面内容均 PASS；URL 未跳转到登录页。
- Reader、Author、Admin、Super Admin：代码审计 PASS。三个页面本身没有 Session、角色、capability 或 redirect 守卫；所有身份共享同一 Root Layout，页面输出不随角色改变。
- 本 Mission 未使用、读取或输出任何现有 Reader、Author、Admin 或 Super Admin 凭据。登录态浏览器抽查标记为 `MANUAL VERIFICATION REQUIRED`，但不存在页面级权限依赖。

## 11. Regression

| 范围                                   | 结果                                             |
| -------------------------------------- | ------------------------------------------------ |
| Homepage / Archive / 登录页            | Build 与既有自动化测试 PASS；浏览器基础访问 PASS |
| 注册主流程                             | 表单与 action 未改变；既有 Auth tests PASS       |
| 邀请码 / 密码 / Reader 创建逻辑        | 未修改；既有 Auth tests PASS                     |
| Reader Reading                         | 未修改；既有相关自动化测试 PASS                  |
| Author Studio                          | 未修改；既有相关自动化测试 PASS                  |
| Admin / Super Admin 权限               | 本 Mission 未修改                                |
| Database / Migration / RLS / Auth 配置 | 本 Mission 未修改                                |
| Product P0 / P1                        | 未发现新增 P0 / P1                               |

## 12. OWNER REVIEW REQUIRED

以下项目不得由工程实现自行批准或猜测：

1. 整份来源文档仍标记为 `Draft / Pending Product Owner Approval`。
2. 版本仍为 `V1 Draft`。
3. 生效状态仍为 `Pending Production launch`；已知 Production Web 已运行，因此必须由 Product Owner 确认正式批准日期、最后更新日期和实际生效日期。
4. 法律审阅明确为 `Not completed`；需要 Product Owner 决定是否以及何时进行独立法律审阅。
5. 草稿中的运营者写法 `【刘祯莹】` 带有占位符样式；需确认最终公开运营主体展示方式。
6. 联系邮箱 `fandomharbor@163.com` 已有具体值，但仍需 Product Owner 确认它是正式、持续受理隐私、举报、侵权和争议请求的联系渠道。
7. Guest 规则写为可发现已发布作品、详情与章节需要登录及有效权限；需确认它与当前 Production 行为及最终政策一致。
8. 数据保留规则需最终批准：账号 / Profile / 作品 / 章节、365 天审计、90 天邀请码、180 天支持 / 举报 / 侵权 / 数据请求邮件，以及批准删除后 30 天目标。
9. 备份副本期限仍写为“按照最终确认的 Supabase 备份与轮换期限自然过期”，属于未决保留期限。
10. Supabase 与 Vercel 的实际数据处理地区尚未完全核对；不得在确认前补充具体地区承诺。
11. 数据导出与删除 30 天目标、身份核验、受控删除顺序及可能延长保留的边界需要 Product Owner / 法律审阅。
12. 用户内容许可、账号暂停 / 终止、服务可用性和责任边界需要 Product Owner / 法律审阅。
13. 成人与敏感题材、淫秽色情边界、未成年人、真实人物私密内容、侵权、举报、先下架后调查和删除规则需要 Product Owner / 法律审阅。
14. 普通侵权投诉流程以及“不声称采用或符合美国 DMCA 通知与反通知流程”的表述需要 Product Owner / 法律审阅。
15. 适用中华人民共和国法律、先友好协商、再向有管辖权人民法院寻求解决的争议处理条款需要 Product Owner / 法律审阅。
16. 草稿列出的“其他必要法律文本细节”“最终公开页面位置”与“是否需要独立法律审阅”仍待最终决定。
17. 工作区既有 `V1-PUBLIC-POLICY.md` 与 2026-07-16 历史状态记录声称政策已 final / approved，而本次授权明确指定 `V1-PUBLIC-POLICY-DRAFT.md` 为唯一主要来源，且该来源仍为 Draft；Product Owner 必须确认哪份文档是当前规范来源，并解决批准 / 生效日期冲突。本 Mission 未删除或擅自改写既有最终文档。

## 13. Validation

最终验证结果在本 Mission 完成时写入：

- 安装状态：`node_modules` 与 pnpm lock/workspace 已存在，未安装新依赖。
- Lint：PASS。
- TypeScript：PASS。
- Production Build：PASS。
- 自动化测试：PASS。
- Guest route / refresh：PASS。
- Desktop 1280：PASS。
- Mobile 390：PASS。
- Light / Dark：PASS。
- Footer / registration links：PASS。
- `git diff --check`：PASS。
- Secret 特征扫描：PASS；未发现新增 Secret。

## 14. PDR 状态与下一步

- `PDR-01 = WEB IMPLEMENTATION PASS WITH OWNER REVIEW / OWNER REVIEW REQUIRED`。
- PDR-01 不得标记为完全 Release Approved，直到 Product Owner 关闭本文件第 12 节。
- `PDR-02`：本 Mission 未修改，保持进入本 Mission 前的项目记录状态；本 Mission 不声称完成或重新完成数据库备份。
- 是否允许进入下一项 Supabase 数据库备份工作：**允许按既有授权流程进入，但本 Mission 不执行、验证或改变该工作的状态。**
- Production Deployment：**NOT RUN**。
