# 0009 - Configuration and Secrets Management

## Status

Accepted

## Context

The frontend is public static code and cannot contain secrets.

## Decision

No runtime secrets are required. Local configuration lives in environment variables and `.env.example` documents placeholders only. `.env*`, keys, and certificates are ignored by git. Hooks include gitleaks scanning.

Build metadata is read from git and package metadata, with optional local overrides for development.

## Consequences

The Pages app can be inspected safely. Any future authenticated data-generation step must run offline and publish only non-sensitive artifacts.

## Alternatives Considered

Embedding obfuscated frontend secrets was rejected because it is not secure. Runtime secret proxying was rejected by ADR 0001.
