# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

Users need lightweight persistence for UI preferences and recent food-source layouts, without accounts or cross-device sync.

## Decision

Use `localStorage` for small preference state and last selected city. Do not store large simulation grids or graph artifacts in v1.

## Consequences

State is private to the browser and works offline. There is no migration burden beyond namespaced keys.

## Alternatives Considered

IndexedDB and OPFS were rejected for v1 because no large user-owned assets are stored. Server persistence was rejected by ADR 0001.
