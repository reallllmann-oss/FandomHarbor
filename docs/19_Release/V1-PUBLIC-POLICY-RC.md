# V1 Public Policy Release Candidate

状态：`PASS WITH LOCAL RC COMMITS READY FOR OWNER REVIEW`

记录日期：2026-07-25

## 1. RC 标识

- 本地分支：`release/v1-public-policy-v1.0`
- 基线 SHA：`67f30c13452680738e1626eb33dbdfb4eead1e62`
- Push：`NOT RUN / NOT AUTHORIZED`
- Merge：`NOT RUN / NOT AUTHORIZED`
- Production Deployment：`NOT RUN / NOT AUTHORIZED`

## 2. Runtime Commit

- SHA：`a4c94a2298f354cbaf28455a7614eea4286776e5`
- Message：`feat(web): add v1.0 public policy pages`
- 文件数：11

文件清单：

1. `apps/web/next.config.ts`
2. `apps/web/src/app/_components/public-policy.tsx`
3. `apps/web/src/app/auth/sign-up/page.tsx`
4. `apps/web/src/app/content-policy/page.tsx`
5. `apps/web/src/app/legal/page.tsx`
6. `apps/web/src/app/privacy/page.tsx`
7. `apps/web/src/app/terms/page.tsx`
8. `apps/web/src/lib/seo.test.ts`
9. `apps/web/src/lib/seo.ts`
10. `packages/ui/src/components/layouts.tsx`
11. `packages/ui/src/styles.css`

## 3. Documentation Commit

- SHA：`8d2fac5fac49553e8bcdd7ce77eb9bed97692ed4`
- Message：`docs(release): approve v1.0 public policy candidate`
- 文件数：16

文件清单：

1. `.ai/CHANGELOG.md`
2. `.ai/MEMORY.md`
3. `.ai/PROJECT_STATUS.md`
4. `docs/19_Release/V1-DEPLOYMENT-SMOKE-TEST.md`
5. `docs/19_Release/V1-PRODUCTION-DEPLOYMENT-REVIEW.md`
6. `docs/19_Release/V1-PRODUCTION-PREPARATION.md`
7. `docs/19_Release/V1-PRODUCTION-READINESS-REVIEW.md`
8. `docs/19_Release/V1-PRODUCTION-RELEASE-CLOSURE.md`
9. `docs/19_Release/V1-PUBLIC-POLICY-DRAFT.md`
10. `docs/19_Release/V1-PUBLIC-POLICY-OWNER-DECISION-PACK.md`
11. `docs/19_Release/V1-PUBLIC-POLICY-V1.0.md`
12. `docs/19_Release/V1-PUBLIC-POLICY-WEB-ACCEPTANCE.md`
13. `docs/19_Release/V1-PUBLIC-POLICY.md`
14. `docs/19_Release/V1-RELEASE-DEPLOYMENT.md`
15. `docs/19_Release/V1-SUPABASE-BACKUP-EVIDENCE.md`
16. `docs/19_Release/V1-SUPABASE-RECOVERY-RUNBOOK.md`

## 4. 验证结果

| 检查项                        | 结果 |
| ----------------------------- | ---- |
| Runtime cached scope          | PASS |
| Runtime cached diff check     | PASS |
| Lint                          | PASS |
| TypeScript                    | PASS |
| Tests                         | PASS |
| Production Build              | PASS |
| Runtime high-risk Secret 扫描 | PASS |
| Documentation cached scope    | PASS |
| Documentation diff check      | PASS |
| Markdown 格式检查             | PASS |
| Documentation Secret 扫描     | PASS |

两批 Secret 扫描均未发现高风险凭据。报告不记录任何 Secret 值。

## 5. 明确排除

以下 Admin Preview 文件未进入任何 RC commit：

- `apps/admin/src/app/access/actions.ts`
- `apps/admin/src/app/access/page.tsx`
- `apps/admin/src/app/access/actions.test.ts`

未纳入任何仓库外 Schema、Data、Manifest、密码脚本或备份目录。备份绝对路径仅作为本地文字证据存在于获审计文档中；Git 中没有备份实物。

未发现其他未知或无关改动。

## 6. 前两笔提交后的剩余工作区

- Modified：`apps/admin/src/app/access/actions.ts`
- Modified：`apps/admin/src/app/access/page.tsx`
- Untracked：`apps/admin/src/app/access/actions.test.ts`

以上三项保持未暂存、未提交、未清理，需由后续独立 Admin Mission 处理。

## 7. Release Gate

- Legal Review：`NOT COMPLETED / PENDING`
- PDR-01：`OWNER DECISION COMPLETE / DEPLOYMENT AND SMOKE PENDING`
- PDR-02：`CLOSED FOR CURRENT RELEASE`
- Production Deployment Authorized：`NO`
- Owner RC Review：`ALLOWED`
- Push：`NOT AUTHORIZED`
- Production Deployment：`NOT AUTHORIZED`

## 8. 下一项 Owner 操作

Product Owner 审阅 Runtime Commit、Documentation Commit 与本 RC Summary。Push 和 Production Deployment 必须分别取得后续明确授权；本次 Mission 不提供上述授权。
