# 0016 - Local Git Hooks

## Status

Accepted

## Context

The project must avoid GitHub Actions and run checks locally.

## Decision

Use plain `.githooks/` scripts wired by `make install-hooks`.

Hooks:

- `pre-commit` runs formatting, lint/type checks, and gitleaks when available.
- `commit-msg` validates Conventional Commits.
- `pre-push` runs `make test`, `make build`, and `make smoke`.
- `post-merge` and `post-checkout` regenerate data.

## Consequences

Checks are local and idempotent. Contributors must install hooks once after cloning.

## Alternatives Considered

Lefthook was considered but rejected to avoid adding another dependency for v1.
