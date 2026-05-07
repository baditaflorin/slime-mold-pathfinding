# 0015 - Deployment Topology

## Status

Accepted

## Context

Mode B deploys only static files.

## Decision

GitHub Pages serves the complete public app from `main` `/docs`. There is no runtime backend, Docker image, nginx config, or server deploy directory in v1.

## Consequences

Deployment is a git push. Rollback is a git revert of the publishing commit.

## Alternatives Considered

Docker Compose and nginx were rejected because v1 has no runtime API.
