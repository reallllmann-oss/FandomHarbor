# Git Workflow

## Branches and commits

- Create focused branches from an up-to-date protected default branch once Git hosting is configured.
- Keep commits small, coherent, reviewable, and free of unrelated changes.
- Use imperative commit messages with a clear scope, for example: `docs(ai): initialize project memory`.
- Never rewrite shared history or force-push without explicit approval.
- Never commit secrets, local environment files, build artifacts, or user data.

## Before review

- Read the required AI memory documents and confirm the Product Phase, Phase-internal Sprint and task.
- Review the diff for accidental changes and sensitive data.
- Run the applicable formatter, static checks, tests, build, migrations checks, and accessibility checks.
- Update documentation, `PROJECT_STATUS.md`, `CHANGELOG.md`, and `MEMORY.md`; update `DECISIONS.md` when needed.
- Explain scope, verification, risks, screenshots for UI work, and migration impact in the pull request.

## Repository state

Git repository initialization, hosting, branch protection, CI and release strategy are not yet configured. They require Phase 0.6 approval and an authorized Phase 1 Sprint.

## Required checks after repository initialization

- Type check, lint, formatting and build
- Unit and integration tests
- Database migration rebuild and RLS permission tests
- End-to-end smoke tests for gated access and critical role boundaries
- Dependency/secret scanning
- Documentation and acceptance-checklist review

The default branch must be protected. Production deploys originate only from reviewed, passing changes with an identified rollback path.
