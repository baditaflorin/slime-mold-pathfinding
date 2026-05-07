# 0011 - Logging Strategy

## Status

Accepted

## Context

Mode B has no server logs. Browser logs should help development without cluttering production.

## Decision

Use minimal browser console output. Production code should not emit routine logs. Recoverable UI errors are shown in-page through accessible messages.

The Go generator writes stable JSON or concise status text to stdout and errors to stderr.

## Consequences

Users are not exposed to noisy console messages, and local automation can parse generator output.

## Alternatives Considered

Client-side log collection was rejected because v1 has no analytics or server endpoint.
