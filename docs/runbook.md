# Runbook

## Local Preview

```sh
npm install
make data
make build
make pages-preview
```

Open:

http://127.0.0.1:4174/slime-mold-pathfinding/

## Smoke Test

```sh
make smoke
```

The smoke test builds `docs/`, serves it under the Pages base path, opens Chromium with Playwright, verifies the repository and PayPal links, selects Tokyo, and renders GraphViz SVG.

## Data Problems

Run:

```sh
make data
make test
```

Check `docs/data/v1/cities/*.meta.json` for source commit and input checksum.

## Browser Problems

If WebGPU is unavailable, the app falls back to the CPU engine. The status strip shows the active engine.

If GraphViz render fails, the DOT text remains exportable from the route panel.

## Resource Sizing

Runtime server resources: none.

Browser target: a modern desktop browser is recommended for WebGPU. CPU fallback is intended for compatibility and tests.
