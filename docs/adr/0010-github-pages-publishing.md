# 0010 - GitHub Pages Publishing Strategy

## Status

Accepted

## Context

GitHub Pages must work from the first commit and the built frontend must be committed.

## Decision

Publish from the `main` branch `/docs` folder. Vite builds into `docs/` with `emptyOutDir` disabled so ADRs and data artifacts remain intact. The base path is `/slime-mold-pathfinding/`.

The app includes a generated `404.html` copy for SPA fallback. Hashed assets live under `docs/assets/`. No custom domain is in scope for v1, so there is no `CNAME`.

## Consequences

The public URL is:

https://baditaflorin.github.io/slime-mold-pathfinding/

The repo can serve docs and the app from the same tree. The `.gitignore` keeps `dist/` ignored but does not ignore `docs/`.

## Alternatives Considered

A `gh-pages` branch was rejected because it adds publishing ceremony. Publishing from repository root was rejected because it would expose development files as the site root.
