# 0004 - Static Data Contract

## Status

Accepted

## Context

Mode B requires static artifacts with stable browser-facing schema and metadata.

## Decision

Publish city data under `docs/data/v1/cities/`.

Files:

- `index.json` lists available city datasets.
- `<slug>.json` contains city metadata, normalized nodes, edges, map layers, and presets.
- `<slug>.meta.json` contains generation metadata.

All coordinates are normalized to `[0, 1]` screen space. Breaking changes move to `docs/data/v2/`. Each meta file includes `generatedAt`, `sourceCommit`, `inputChecksum`, and `schemaVersion`.

## Consequences

The frontend can cache data by schema version and city slug. Deterministic artifact ordering keeps git diffs readable.

## Alternatives Considered

Parquet and SQLite were considered but rejected for v1 because the initial artifacts are small enough for JSON and easier to inspect.
