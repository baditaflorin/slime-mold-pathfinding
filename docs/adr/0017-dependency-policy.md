# 0017 - Dependency Policy

## Status

Accepted

## Context

The project touches GPU APIs, WASM, data validation, and testing. It should avoid custom implementations where mature libraries exist.

## Decision

Use production-ready dependencies only:

- React and Vite for UI/build.
- zod for data validation.
- TanStack Query for data fetching and cache state.
- @hpcc-js/wasm for GraphViz.
- Vitest and Playwright for tests.
- Go standard library for deterministic JSON generation.

Pin dependencies through `package-lock.json` and `go.sum` when external Go modules are added.

## Consequences

The codebase stays maintainable and auditable. Any new dependency needs an ADR when it changes architecture or security posture.

## Alternatives Considered

Hand-written GraphViz rendering was rejected because GraphViz already solves layout well. Custom data validation was rejected because zod gives clearer runtime errors.
