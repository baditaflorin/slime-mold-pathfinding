# 0001 - Deployment Mode

## Status

Accepted

## Context

The project should default to GitHub Pages. The simulator needs interactive compute, map data, GraphViz rendering, and an offline path from OpenStreetMap/libosmscout-style exports to small browser artifacts.

## Decision

Use Mode B: GitHub Pages plus pre-built data.

The public app is fully static. City graph artifacts are generated offline into `docs/data/v1/`, committed when small, and versioned by schema path. The browser runs the Physarum simulation with WebGPU compute when available and a CPU fallback when not available. GraphViz rendering runs in the browser through a lazy-loaded WASM package.

## Consequences

No runtime API, auth, server database, Docker deployment, nginx, or backend secrets are required for v1. The data pipeline is a local Go command rather than a deployed service. GitHub Pages stays the only public runtime surface.

## Alternatives Considered

Mode A was rejected because city extraction and graph normalization are better handled offline than inside a browser tab. Mode C was rejected because v1 has no cross-user state, private secrets, or live mutations that justify a runtime server.
