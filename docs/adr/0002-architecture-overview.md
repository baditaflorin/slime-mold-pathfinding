# 0002 - Architecture Overview and Module Boundaries

## Status

Accepted

## Context

The application combines static city data, an interactive map, a Physarum-style simulation, and route export.

## Decision

Use these module boundaries:

- `cmd/build-index` generates static city artifacts.
- `internal/citydata` validates, normalizes, and writes artifact JSON.
- `docs/data/v1` stores published artifacts and metadata.
- `src/features/city-data` loads and validates static artifacts.
- `src/features/physarum` owns simulation engines and WebGPU capability detection.
- `src/features/routes` extracts route graphs from selected food sources and trails.
- `src/features/graphviz` creates DOT and lazy-renders SVG.
- `src/components` contains UI surfaces.

## Consequences

The static pipeline can evolve independently from the browser simulator. The frontend does not need to know where libosmscout data came from after it has been normalized.

## Alternatives Considered

A single all-in-one frontend module was rejected because simulation, rendering, and graph extraction need separate tests. A runtime backend boundary was rejected by ADR 0001.
