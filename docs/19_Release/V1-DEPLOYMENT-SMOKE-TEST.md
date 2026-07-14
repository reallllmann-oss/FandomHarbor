# Fandom Harbor V1 Deployment Smoke Test

状态：LOCAL PASS / ONLINE NOT RUN
日期：2026-07-14

## 测试环境

- Web：`http://127.0.0.1:3000`
- Admin 临时入口核对：`http://127.0.0.1:3001/auth/sign-in`
- 数据：Supabase Local + localhost-only QA Fixture
- Desktop：1280 × 800
- Mobile：390 × 844

## Local Smoke Test

| 检查项                           | 结果 | 说明                                                          |
| -------------------------------- | ---- | ------------------------------------------------------------- |
| Homepage                         | PASS | 主结构、公开作品入口与零横向溢出                              |
| Archive                          | PASS | Published Works、排序区与公开作者入口                         |
| Search                           | PASS | 查询入口与状态结构正常                                        |
| Work Detail                      | PASS | Published Work 路径可用                                       |
| Published Chapter Reading        | PASS | 已发布章节路径与阅读布局可用                                  |
| Author Profile                   | PASS | 公开 Author Profile 可用                                      |
| Sign-in / Sign-up                | PASS | 表单与账号路径可用                                            |
| Guest                            | PASS | 无 Studio 入口                                                |
| Reader                           | PASS | 无 Studio 入口；直访 `/studio` 最终到 `/archive`              |
| Author                           | PASS | 可进入 `/studio`，Studio 导航存在                             |
| Published-only / Draft isolation | PASS | Draft Work / Draft Chapter 不出现在公开结果；公开内容路径正常 |
| Desktop 1280                     | PASS | 主路径 overflow = 0                                           |
| Mobile 390 × 844                 | PASS | Homepage overflow = 0，移动导航保持最小实现                   |
| Light / Dark                     | PASS | 本轮浏览会话覆盖 Light 与 Dark 状态                           |
| Console                          | PASS | Web 主路径页面错误 0                                          |
| UX-06H                           | PASS | Homepage 无回退                                               |
| UX-06I                           | PASS | Global Shell、Reader denial、Author Studio 无回退             |
| UX-06J                           | PASS | Release UI Sweep 主路径无回退                                 |

## Admin 核对

- Admin App production build 与 2 / 2 tests 通过。
- 独立 Admin Shell、`/auth/sign-in` 与 `/access` 路由存在。
- Reader / Author 不具备 `admin:operate`；Admin / Super Admin 由服务端 Access Context 与数据库函数再次校验。
- Local QA Fixture 只提供 Reader / Author，不提供 Admin / Super Admin。
- Admin App 使用独立环境配置，本轮没有安全提供的 Admin 凭据，因此真实 Admin 登录、`/access` 实际授权与撤销未执行，不能标记为在线或账号级 PASS。

## Online Smoke Test

状态：`NOT RUN`

原因：Preview Deployment 未创建，线上 URL 未生成。以下项目待部署门禁解除后执行：

- Homepage、Archive、Search、Work Detail、Reading、Author Profile。
- Sign-in / Sign-up。
- Guest / Reader / Author。
- Reader `/studio` → `/archive`。
- Author Studio。
- Admin 独立域名登录与 `/access`。
- Light / Dark、390 × 844、Console / Network。
- Published-only 与 Draft isolation。

## 安全记录

- 本轮只使用 localhost-only QA Fixture。
- Release Baseline 审计发现一份未跟踪 UX 验收文档曾记录两条本地 QA 密码；已脱敏并完成凭据轮换。
- 实际密码模式未进入 HEAD 或 Git 历史；处置后工作区复扫为无匹配。
- QA 凭据只允许通过安全命令读取；当前 Release 文档未记录任何凭据值。
- 未修改远程 Supabase、Vercel、DNS、Production Environment Variables 或生产数据。
