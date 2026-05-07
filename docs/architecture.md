# Architecture

## Context

```mermaid
C4Context
  title Slime Mold Pathfinding Context
  Person(user, "User", "Drops food sources and explores route candidates")
  System(pages, "GitHub Pages App", "Static React/WebGPU app")
  System_Ext(github, "GitHub Repository", "Source, published docs folder, release tags")
  System_Ext(paypal, "PayPal", "Optional support link")
  Rel(user, pages, "Uses")
  Rel(pages, github, "Links to source and commit")
  Rel(pages, paypal, "Links to support page")
```

## Container

```mermaid
flowchart TB
  subgraph local["Local/offline workspace"]
    source["data/source/cities/*.json"]
    go["Go cmd/build-index"]
    checks["make test / make lint / make smoke"]
  end

  subgraph repo["GitHub repository"]
    docs["main:/docs"]
    adr["docs/adr"]
  end

  subgraph browser["User browser"]
    ui["React UI"]
    sim["Physarum engine"]
    gpu["WebGPU WGSL compute"]
    fallback["CPU fallback"]
    graphviz["GraphViz WASM"]
    storage["localStorage"]
  end

  source --> go --> docs
  checks --> docs
  docs --> ui
  ui --> sim
  sim --> gpu
  sim --> fallback
  ui --> graphviz
  ui --> storage
  adr --> docs
```

## Boundaries

- Public runtime boundary: GitHub Pages only.
- Static data boundary: `docs/data/v1/cities/`.
- Offline generation boundary: `cmd/build-index` and `internal/citydata`.
- Simulation boundary: `src/features/physarum`.
- Route extraction boundary: `src/features/routes`.
- GraphViz boundary: lazy `@hpcc-js/wasm` import.

## Pages Boundary

GitHub Pages serves only committed files in `docs/`. There is no runtime server, no API, no auth, no Docker image, and no nginx config in v1.
