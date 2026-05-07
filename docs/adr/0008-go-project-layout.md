# 0008 - Go Project Layout

## Status

Accepted

## Context

Mode B has no runtime server, but it does need Go data-generation commands.

## Decision

Use the standard Go project layout:

- `cmd/build-index` for the data generator binary.
- `internal/citydata` for artifact logic.
- `internal/utils` for shared utility conventions.
- `api`, `configs`, `pkg`, `scripts`, and `test` kept as project slots for future expansion.

## Consequences

The layout stays compatible with a future Mode C backend without adding server code now.

## Alternatives Considered

A flat Go script was rejected because data generation deserves tests and package boundaries.
