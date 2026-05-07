# Deploy

Live app:

https://baditaflorin.github.io/slime-mold-pathfinding/

Repository:

https://github.com/baditaflorin/slime-mold-pathfinding

## Topology

Mode B: GitHub Pages plus pre-built data.

Pages source:

- Branch: `main`
- Folder: `/docs`
- Base path: `/slime-mold-pathfinding/`

There is no Docker image, nginx config, runtime API, server database, or secret-bearing deployment.

## Publish

```sh
make data
make test
make build
make smoke
git add docs data
git commit -m "data: refresh published artifacts"
git push
```

GitHub Pages publishes the pushed `/docs` contents.

## Rollback

Revert the publishing commit and push:

```sh
git revert <commit>
git push
```

## Custom Domain

No custom domain is configured in v1. If one is added later, create `docs/CNAME` and configure DNS with the provider. GitHub's Pages docs are at:

https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site

## Pages Gotchas

- GitHub Pages does not honor `_headers` or `_redirects`.
- The app uses `docs/404.html` as an SPA fallback.
- The service worker scope is `/slime-mold-pathfinding/`.
- Vite must keep `base` set to `/slime-mold-pathfinding/`.
