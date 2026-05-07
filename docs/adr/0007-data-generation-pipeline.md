# 0007 - Data Generation Pipeline

## Status

Accepted

## Context

Mode B needs reproducible static artifacts and a clear path from source map exports to frontend data.

## Decision

Implement `cmd/build-index` as a Go data generator. It reads source city JSON from `data/source/cities/`, validates and sorts it deterministically, writes browser artifacts to `docs/data/v1/cities/`, and emits sibling metadata files.

The cadence is manual for v1 through `make data`. Outputs are idempotent and safe to regenerate.

## Consequences

The data pipeline is easy to run locally and can later be scheduled without changing the frontend contract.

## Alternatives Considered

Running libosmscout in the browser was rejected because OSM extraction and indexing are too heavy for v1. A Python generator was rejected to keep the backend/tooling side in Go.
