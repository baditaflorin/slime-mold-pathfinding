# 0003 - Frontend Framework and Build Tooling

## Status

Accepted

## Context

The app needs a rich interactive UI, TypeScript strictness, WebGPU access, data fetching, and a GitHub Pages build.

## Decision

Use React, TypeScript, Vite, Tailwind CSS, zod, TanStack Query, lucide-react, Vitest, and Playwright.

Vite builds directly into `docs/` with base path `/slime-mold-pathfinding/`. Strict TypeScript is required. Heavy modules such as GraphViz WASM are lazy-loaded.

## Consequences

The app remains ergonomic to develop while still producing static assets for Pages. React adds some payload, so route export and WASM code must stay behind user actions to protect initial load size.

## Alternatives Considered

Svelte would produce a smaller bundle, but React has broader ecosystem support for the chosen testing and UI libraries. Vanilla TypeScript was rejected because the interaction surface benefits from component state and predictable rendering.
