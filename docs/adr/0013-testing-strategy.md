# 0013 - Testing Strategy

## Status

Accepted

## Context

The project needs confidence in static data, route extraction, rendering startup, and Pages builds.

## Decision

Use:

- Go unit tests for the data generator.
- Vitest for frontend logic modules.
- Playwright smoke tests against a local Pages-style server.
- `make test`, `make build`, and `make smoke` as hook-friendly entry points.

## Consequences

The highest-risk logic gets fast tests. Smoke tests cover the user happy path without needing WebGPU availability.

## Alternatives Considered

Browser-only manual testing was rejected. Full visual regression testing was deferred because v1 can be covered by a happy-path smoke test.
