# 0014 - Error Handling Conventions

## Status

Accepted

## Context

The app needs clear user-facing failure states and no panics in Go tooling.

## Decision

Frontend data loading validates artifacts with zod and shows accessible error states. Simulation engines return capability and runtime errors through typed results.

Go uses `errors` and `fmt.Errorf` with `%w`. The `internal/utils` package exposes `HandleErrorOrLogWithMessages(err, errMsg, successMsg)` for command exit handling. Commands must not panic.

## Consequences

Failures are visible, testable, and easier to debug.

## Alternatives Considered

Silent fallback was rejected because broken data should be obvious. Panics in CLI code were rejected because batch tools need predictable exits.
