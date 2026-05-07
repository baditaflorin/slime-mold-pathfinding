# 0012 - Metrics and Observability

## Status

Accepted

## Context

Mode B has no server-side metrics surface.

## Decision

Do not include analytics in v1. Show local app observability in the UI: engine type, frame rate estimate, active agents, selected city, data version, and generation age.

## Consequences

The app is privacy-preserving by default. Operational visibility is limited to user-facing status and local testing.

## Alternatives Considered

Plausible and custom beacons were considered but rejected because usage insight is not necessary for v1.
