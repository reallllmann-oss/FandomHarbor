# Troubleshooting

本文件记录已经验证过的本地开发、Monorepo、环境变量、Supabase CLI 与工具链问题，目标是减少重复排查。

## 1. Turborepo 多应用端口是动态分配的

本项目包含三个 Next.js App：

- `apps/web`
- `apps/admin`
- `apps/docs`

Turbo 并不会固定它们的本地端口。哪个应用先启动，哪个应用就可能占用 `3000`。

可能出现：

- 第一次：`web -> 3000`，`admin -> 3001`，`docs -> 3002`
- 第二次：`docs -> 3000`，`web -> 3001`，`admin -> 3002`

禁止假设：

- `3000 == Docs`
- `3001 == Admin`
- `3002 == Web`

### 正确做法

开发时始终以终端输出为准，例如：

```text
@fandom-harbor/web:dev
Local: http://localhost:3000

@fandom-harbor/admin:dev
Local: http://localhost:3001

@fandom-harbor/docs:dev
Local: http://localhost:3002
```

`Local:` 地址是唯一权威事实源。

### 常见症状

- 浏览器打开了错误应用
- 以为某个应用没启动，其实只是端口变了
- 文档、后台、前台打开错入口

### 处理步骤

1. 回到终端确认每个应用实际打印的 `Local:` 地址。
2. 按终端地址重新打开浏览器，而不是按历史端口访问。
3. 如果页面仍异常，再检查该应用是否真正编译成功。

## 2. 环境变量未加载 / Runtime ZodError

典型报错：

```text
Runtime ZodError
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
received undefined
```

这类问题优先视为本地 env 加载问题，而不是先怀疑 Supabase 配置错误。

### 当前约定

开发环境使用：

- Root: `.env.local`
- 同步到：`apps/web/.env.local`
- 同步到：`apps/admin/.env.local`

说明：

- `apps/web` 和 `apps/admin` 都可能直接读取自己的应用级 env。
- 只更新 Root `.env.local` 但不同步到应用目录时，Next dev server 可能仍拿不到值。

### 优先检查顺序

1. Root `.env.local` 是否存在。
2. `apps/web/.env.local` 是否存在且内容同步。
3. `apps/admin/.env.local` 是否存在且内容同步。
4. 修改 env 后是否重启了 Next Dev Server。
5. 是否需要删除对应应用的 `.next` 后重新启动。

### 不要优先做的事

- 不要先认定 Supabase 项目配置有问题。
- 不要先改 Runtime Contract。
- 不要先改 Zod schema。
- 不要先切换依赖或工具链。

## 3. Next Dev Server 重启后仍读到旧 env

### 常见原因

- `.env.local` 已修改，但 dev server 没有重启
- `.next` 缓存保留了旧状态
- 实际启动的不是你以为的那个 app

### 处理步骤

1. 停止对应应用 dev server。
2. 删除该应用目录下的 `.next`。
3. 重新启动 dev server。
4. 再次确认终端中该应用的 `Local:` 地址。
5. 重新验证 env 是否生效。

## 4. pnpm Workspace 相关问题

本项目使用 pnpm workspace + Turborepo。

### 常见症状

- 在错误目录执行命令导致工作区解析异常
- 某个 app 或 package 无法正确解析 workspace 依赖
- Turbo 能看到应用，但本地单独执行时上下文不一致

### 建议

- 优先在仓库 Root 执行 workspace 级命令。
- 遇到依赖解析问题，先确认命令是否从仓库根目录启动。
- 如果是单 app 问题，仍要确认它依赖的 workspace package 已正确安装与构建。

## 5. Supabase CLI 相关问题

本项目数据库能力依赖 Supabase，但本地是否可直接执行 CLI 取决于当前机器环境。

### 常见症状

- `supabase` 命令不存在
- 本地数据库验证脚本无法运行
- 数据库迁移只能静态检查，不能实际执行

### 处理原则

- 先确认是否真的安装了 Supabase CLI。
- 未安装时，不要把 CLI 缺失误判为 SQL 本身错误。
- 若当前 Sprint 只要求代码或文档，不要擅自扩展到安装新工具。
- 需要真实数据库执行时，按当前审批边界确认是否允许使用本地 CLI、Docker 或批准的临时数据库。

## 6. Next 多 Lockfile Warning

在 Monorepo 中，Next 可能输出 workspace root 或多 lockfile 相关 warning。

### 说明

- 这类 warning 不一定表示构建失败。
- 它通常意味着 Next 在推断 workspace root 时看到了额外 lockfile 或上层结构。

### 处理方式

1. 先区分 warning 还是 error。
2. 若 `build` / `dev` 已正常通过，可先记录，不要把 warning 误判成阻塞。
3. 若 warning 实际影响模块解析或输出路径，再作为单独工程问题处理。

## 7. 排障优先级

遇到本地开发问题时，推荐按这个顺序排查：

1. 先看终端输出的 `Local:` 地址是否正确。
2. 再看 `.env.local` 是否存在且同步。
3. 再确认是否重启 dev server、是否清理 `.next`。
4. 再区分是 workspace / Turbo / CLI / warning 问题。
5. 最后才怀疑外部服务配置或更深层架构问题。

## 8. 与项目规范的关系

- 端口动态分配是本项目的开发事实，不是临时例外。
- 环境变量加载失败优先按本文件处理，不得直接升级为架构或供应商问题。
- 更大的环境异常仍受 `.ai/ENVIRONMENT_POLICY.md` 管控。
- 需要改依赖、Runtime Contract、环境变量策略或部署方式时，仍按 `.ai/WORKFLOW.md` 的 Level 3 执行。

## 9. Codex Git 自动提交能力

本项目已经完成一次完整的 Git 自动提交能力验收。当前结论是：

- Codex 可在真实工作目录中执行 Git 命令
- Codex 可写入 `.git`
- Codex 可访问 GitHub
- Codex 可通过 SSH remote 执行 `git push`

### 当前已验证状态

- 工作目录：`/Users/liuzyzy/Documents/FandomHarbor`
- 当前 `origin`：`git@github.com:reallllmann-oss/FandomHarbor.git`
- 分支：`main`

### 通过的验收链

```bash
git status
touch .git/codex-permission-test && rm .git/codex-permission-test
git ls-remote origin
git push origin main
```

### 说明

- `git status` 成功表示 Codex 能正常读取仓库状态。
- `.git` 权限测试成功表示后续 `git add` / `git commit` 所需的 lock 文件写入能力可用。
- `git ls-remote origin` 成功表示 GitHub DNS、网络与认证通路可用。
- `git push origin main` 返回 `Everything up-to-date` 或正常推送结果，都表示 push 通路已打通。

### 推荐约定

- 后续优先保持 SSH remote，不要切回 HTTPS，除非 Product Owner 明确要求。
- 后续 Sprint 完成后，只有在 Product Owner 明确确认的前提下，Codex 才执行：
  - `git add`
  - `git commit`
  - `git push`

### 如果未来再次失败，优先排查

1. `git remote get-url origin` 是否仍是 SSH 地址。
2. `git status` 是否正常。
3. `.git` 是否仍可创建 lock/测试文件。
4. `git ls-remote origin` 是否可访问。
5. 是否是系统权限、网络、DNS 或 SSH 凭证状态变化，而不是仓库本身问题。
