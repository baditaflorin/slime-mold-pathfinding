# 0006 - WASM and WebGPU Modules

## Status

Accepted

## Context

The project needs high-performance simulation and browser-side GraphViz export.

## Decision

Use WebGPU WGSL compute shaders for trail-field diffusion/decay when `navigator.gpu` is available. Provide a CPU engine fallback for browsers without WebGPU.

Use `@hpcc-js/wasm` for GraphViz rendering, lazy-loaded only when the user opens the route export panel. The offline data pipeline accepts libosmscout-compatible normalized exports; the libosmscout extraction step is intentionally outside the public runtime.

GitHub Pages cannot set COOP/COEP headers. Therefore, v1 avoids WASM paths that require `SharedArrayBuffer` and keeps WebGPU optional.

## Consequences

The app runs on more browsers while still proving the WebGPU compute path on capable devices. GraphViz does not affect first load.

## Alternatives Considered

A pure WASM Physarum engine was rejected because WGSL compute is a better match for the browser GPU target. Server-side GraphViz was rejected because the public runtime must remain static.
