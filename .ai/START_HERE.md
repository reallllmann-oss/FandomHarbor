Every new conversation MUST begin with a synchronization step.

Every new conversation must read LANGUAGE_POLICY.md before beginning work.

Every new conversation must read ENVIRONMENT_POLICY.md before beginning work.

Every new conversation must read WORKFLOW.md before beginning work.

The AI must:

1. Read all required AI memory documents.
2. Summarize the current project status.
3. Check for documentation conflicts.
4. Confirm the current roadmap position.
5. Wait for the Product Owner's Sprint Brief.

Never begin development automatically.

Never assume the current task.

Never continue unfinished work without re-synchronizing first.

========================

IMPORTANT

Before writing ANY code, you MUST:

1. Read .ai/START_HERE.md
2. Read .ai/LANGUAGE_POLICY.md
3. Read .ai/ENVIRONMENT_POLICY.md
4. Read .ai/WORKFLOW.md
5. Read .ai/MEMORY.md
6. Read .ai/PROJECT_STATUS.md
7. Read .ai/PROJECT_RULES.md
8. Read .ai/PRODUCT_VISION.md
9. Read .ai/DECISIONS.md
10. Read .ai/CHANGELOG.md
11. Read .ai/KNOWN_ISSUES.md
12. Read .ai/TECH_STACK.md
13. Read .ai/ACCEPTANCE_CHECKLIST.md
14. Read .ai/DESIGN_DECISIONS.md
15. Read .ai/FEATURE_FLAGS.md
16. Read .ai/STYLE_GUIDE.md
17. Read .ai/AI_BEHAVIOR.md

Only after reading these documents, you may begin development.

Never assume.
Never overwrite architecture.
Never ignore previous decisions.
Never duplicate existing modules.
Never start coding before confirming the current Product Phase, Sprint and current task.

After completing any task, you MUST update:

- .ai/PROJECT_STATUS.md
- .ai/CHANGELOG.md
- .ai/MEMORY.md

If a new architectural decision is made, update:

- .ai/DECISIONS.md

If a new product experience or UI decision is made, update:

- .ai/DESIGN_DECISIONS.md

If feature availability or concrete style rules change, update:

- .ai/FEATURE_FLAGS.md
- .ai/STYLE_GUIDE.md

========================

# Fandom Harbor — AI Start Here

This file is the mandatory entry point for every new conversation and every development task. The seventeen files above are the project's minimum context window and must be read in order.

## Required workflow

1. Read all seventeen required memory documents in the order above.
2. Confirm the current Product Phase, Sprint and exact task from `PROJECT_STATUS.md`.
3. Check `DECISIONS.md` before proposing architecture or changing established behavior.
4. Read the task-specific standards before editing related areas:
   - Application code: `CODING_STANDARD.md`
   - UI: `UI_DESIGN_SYSTEM.md`
   - Product/UI/reading experience decisions: `DESIGN_DECISIONS.md`
   - Concrete dimensions and visual behavior: `STYLE_GUIDE.md`
   - Feature availability: `FEATURE_FLAGS.md`
   - Database: `DATABASE_RULES.md`
   - API: `API_RULES.md`
   - Authentication, authorization, privacy, or moderation: `SECURITY_RULES.md`
   - Git operations: `GIT_WORKFLOW.md`
   - Tech Lead reasoning and stewardship: `AI_BEHAVIOR.md`
   - Product Owner communication and project artifact language: `LANGUAGE_POLICY.md`
   - Environment failures, blocked status and retry governance: `ENVIRONMENT_POLICY.md`
   - Autonomous decisions and mandatory escalation boundaries: `WORKFLOW.md`
   - When the task involves dev startup, env loading, local ports, Supabase CLI or workspace tooling issues: `TROUBLESHOOTING.md`
5. Read the relevant detailed document in `docs/` and verify that research, requirements, architecture, database, API, UI, review, and acceptance criteria are complete for the feature.
6. Inspect the existing repository and reuse established modules.
7. If product, security, permission, schema, dependency, deployment or other Level 3 information is missing, record it in `KNOWN_ISSUES.md` and stop before the affected decision. Level 1/2 implementation details follow `WORKFLOW.md` and must not be escalated merely because a routine engineering repair is required.
8. Implement only the confirmed task, verify the result, then update project memory.

## Development environment reminder

- This monorepo contains three Next.js apps: `apps/web`, `apps/admin`, `apps/docs`.
- Turborepo does not guarantee a fixed port-to-app mapping during `dev`.
- Never assume `3000 == docs`, `3001 == admin` or `3002 == web`.
- During development, the terminal `Local:` address printed by each app is the only authoritative local URL.
- If runtime env validation fails, check `.env.local`, `apps/web/.env.local`, `apps/admin/.env.local`, restart the dev server and clear `.next` before suspecting Supabase configuration.

## Mandatory feature workflow

Research → Requirement Analysis → Architecture Design → Database Design → API Design → UI Design → Review → Development → Testing → Documentation Update

No stage may be skipped. A stage may be marked “Not Applicable” only with a written reason in the feature or Sprint document.

## Mandatory Sprint startup gate

Every Sprint begins with Environment Check → Toolchain Check → Version Check → Dependency Check. Development may begin only after all four checks pass with recorded evidence.

After the Product Phase and Sprint brief are approved, Codex may run Environment, Toolchain, Version, Dependency, Type, Lint, Build and Test checks without per-command Product Owner approval. Dependency checks must preserve manifests, dependency versions and the lockfile. Type/Lint/Build/Test failures classified as Level 1 or Level 2 are fixed and rechecked autonomously; Level 3 changes stop before writing.

When an environment issue occurs, diagnose the cause before considering a retry. Never use retry as the first diagnostic action. Environment-issue retries still follow `ENVIRONMENT_POLICY.md`; the Level 1/2 repair authority does not authorize registry, runtime, network or dependency workarounds.

## Autonomous Engineering Policy / Codex 自治工程权限

`WORKFLOW.md` is the authoritative execution policy:

- Level 1: routine lint/type/hooks/format/build/test fixes affecting at most five files and no high-risk contract may be implemented and verified directly.
- Level 2: six-to-ten-file, local UI/test/refactor/accessibility/responsive changes inside the approved Sprint may be implemented directly and highlighted in the final report.
- Level 3: manifests/lockfiles/dependencies, runtime, registry, API/schema/auth/permission, environment/deployment/CI, security/privacy/payment/deletion, product decisions, over-ten-file or unclassifiable changes require approval before writing.

Risk classification uses the highest applicable level. “When in doubt, ask” applies only when classification genuinely remains Level 3 after inspecting the task and repository; it must not be used to interrupt clearly authorized Level 1/2 work.

## Source-of-truth order

1. The user's latest explicit instruction
2. Accepted entries in `DECISIONS.md` and `DESIGN_DECISIONS.md` within their respective ownership
3. `PRODUCT_VISION.md` and `PROJECT_RULES.md`
4. `TECH_STACK.md`, `FEATURE_FLAGS.md`, `STYLE_GUIDE.md` and domain rule documents
5. Approved detailed documents under `docs/`
6. Current execution state in `PROJECT_STATUS.md`

When documents conflict, do not silently choose one. Stop, record the conflict, and request a decision.

## Current initialization boundary

Phase 1C engineering implementation is complete. New conversations must resume from `PROJECT_STATUS.md`: first execute the existing migrations and SQL allow/deny script in an approved disposable database, then obtain Product Owner Phase 1 acceptance. Do not enter Phase 2, create cloud resources, configure production Auth/SMTP or establish the production Super Admin without a new approved scope.
