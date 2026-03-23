# Verification Assets

This directory holds runtime assets that exist for verification, fixtures, and deterministic inspection rather than live product-quality play.

Current contents:
- `mock-model-adapter.ts`: fixture-only adapter for adapter-boundary checks
- `local-actor-rendering.ts`: deterministic local text renderer for verification-only actor text
- `local-actor-responder.ts`: verification responder that uses the deterministic local renderer

Boundary rule:
- product-quality runtime modules under `runtime/execution/`, `runtime/orchestration/`, `runtime/state/`, and `runtime/agents/` must not import from `runtime/verification/`
- fixture, regression, and local verification scripts under `scripts/verification/` may import from `runtime/verification/`
