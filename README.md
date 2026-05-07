# slime-mold-pathfinding

![Mode B static Pages app](https://img.shields.io/badge/deployment-GitHub%20Pages%20%2B%20static%20data-14b8a6)
![Version 0.1.0](https://img.shields.io/badge/version-0.1.0-f8d24a)
![License MIT](https://img.shields.io/badge/license-MIT-blue)

Live app: https://baditaflorin.github.io/slime-mold-pathfinding/

Repository: https://github.com/baditaflorin/slime-mold-pathfinding

Support: https://www.paypal.com/paypalme/florinbadita

WebGPU Physarum simulator that turns city food sources into emergent transit-route candidates on a map.

The public page shows the repository link, PayPal link, app version, and the exact git commit used for the build.

![Slime Mold Pathfinding preview](docs/preview.png)

## Quickstart

```sh
npm install
make data
make build
make pages-preview
```

## What It Does

Drop food sources on a city graph, watch a Physarum-style agent field reinforce candidate corridors, and export the resulting route network through browser-side GraphViz.

V1 ships with Tokyo and Bucharest static fixtures. The data pipeline accepts a normalized libosmscout-compatible city export shape and writes browser artifacts into `docs/data/v1/cities/`.

## Architecture

```mermaid
flowchart LR
  source["data/source/cities/*.json"] --> generator["Go cmd/build-index"]
  generator --> artifacts["docs/data/v1/cities/*.json"]
  artifacts --> pages["GitHub Pages static site"]
  pages --> browser["Browser app"]
  browser --> webgpu["WebGPU WGSL diffuser"]
  browser --> cpu["CPU fallback engine"]
  browser --> graphviz["GraphViz WASM route render"]
```

Architecture docs: docs/architecture.md

ADRs: docs/adr/

Data contract: docs/data.md

Deploy guide: docs/deploy.md

## Local Checks

```sh
make test
make lint
make build
make smoke
```

Install hooks once:

```sh
make install-hooks
```

No GitHub Actions are used. Local hooks run formatting, linting, type checks, tests, build verification, smoke tests, and staged secret scanning with gitleaks when available.

## Deployment

GitHub Pages serves the `main` branch `/docs` folder:

https://baditaflorin.github.io/slime-mold-pathfinding/

Rollback is a git revert of the publishing commit.
