# Development Memo

- intent_id: intent-001
- title: Runtime Asset Boundary
- owner: shared
- status: active
- created_at: 2026-03-20
- updated_at: 2026-03-20
- related_enablers:
  - intent-000
  - intent-007
- related_feature_proposal: docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_implementation_specs:
  - docs/intent-development/implementation-specs/is-intent-001-mvp-multi-agent-runtime-design.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-observability-and-validation.md

## Purpose
Define a high-level boundary between:
- assets the runtime may read directly at execution time
- assets that should remain requirement, contract, or design references

This memo exists so future product-asset restructuring can happen without letting the runtime depend on every document under `docs/product/`.

## Why This Matters
If runtime code reads broad product documentation directly, several risks grow quickly:
- execution becomes tightly coupled to documentation layout
- small editorial changes can break runtime behavior
- the runtime starts depending on rich narrative docs rather than thin execution assets
- future folder restructuring becomes expensive and risky

This is structurally similar to poor normalization in application development:
- too many consumers depend on too many overlapping representations
- unclear source-of-truth boundaries create drift and accidental coupling

## Boundary Rule
The runtime should not treat all `docs/product/*` files as equally executable.

Instead, split product assets into two classes:

### 1. Runtime-readable assets
Thin, execution-facing assets that the runtime may load directly.

Desired properties:
- stable field shape
- low narrative surplus
- low ambiguity
- explicitly intended for runtime use

### 2. Contract-only assets
Assets that define behavior, product rules, or design intent, but are not the file shape the runtime should parse directly during execution.

Desired role:
- govern implementation
- justify runtime behavior
- remain readable and evolvable without acting as fragile runtime inputs

## Current Runtime-readable Assets
At the moment, the runtime directly reads only:
- `docs/product/personas/runtime/*.md`
- `docs/product/concepts/runtime/mvp-scene-setup.md`
- `docs/product/concepts/runtime/mvp-player-initialization.md`

Current examples:
- `docs/product/personas/runtime/executive-stakeholder-runtime.md`
- `docs/product/personas/runtime/platform-side-stakeholder-runtime.md`
- `docs/product/personas/runtime/new-product-tech-lead-runtime.md`
- `docs/product/personas/runtime/legacy-app-side-stakeholder-runtime.md`
- `docs/product/concepts/runtime/mvp-scene-setup.md`
- `docs/product/concepts/runtime/mvp-player-initialization.md`

Why these are acceptable:
- they are already thin runtime slices
- they are explicitly marked for runtime use
- they compress fuller persona cards into execution-appropriate fields

## Current Contract-only Assets
These should currently be treated as contract or design references, not direct runtime inputs:
- `docs/product/contracts/mvp-simulation-contract.md`
- `docs/product/contracts/facilitator-role-contract.md`
- `docs/product/expected-outputs/game-end-output.md`
- `docs/product/concepts/*.md`
- full persona cards under `docs/product/personas/*.md` excluding `docs/product/personas/runtime/*`
- `docs/product/vision.md`

Why:
- they are richer than the runtime needs
- they define policy, not only execution data
- they should be free to evolve without becoming fragile parser targets

## Current Reality in Code
Current direct runtime reads:
- `runtime/personas/runtime-slice-loader.ts` -> `docs/product/personas/runtime/*.md`
- `runtime/scene/setup-loader.ts` -> `docs/product/concepts/runtime/mvp-scene-setup.md`
- `runtime/scene/player-initialization-loader.ts` -> `docs/product/concepts/runtime/mvp-player-initialization.md`

Current indirect references:
- evaluator and runtime behavior are implemented from product contracts and expected-output docs
- but those docs are not loaded directly by execution code

This is the right direction.

## Recommended Structure Direction
The repository does not need an immediate large move.

Recommended near-term direction:
- keep `docs/product/contracts/` as contract-only
- keep `docs/product/concepts/` as concept-only
- treat `docs/product/concepts/runtime/` as execution-facing scene setup assets when needed
- keep full persona cards as authoring and validation assets
- treat `docs/product/personas/runtime/` as the current execution-facing asset zone

Recommended later option if runtime-facing assets grow:
- introduce a clearer execution-facing zone such as:
  - `docs/product/runtime-assets/`
  - or `docs/product/execution/`

Possible future contents there:
- runtime persona slices
- scene setup cards
- lightweight evaluation config
- minimal facilitator runtime slice

## Practical Rule For New Assets
Before adding a new runtime-consumed product asset, ask:

1. Is this file meant to be read by code during execution?
2. Is its shape thin and stable enough for runtime parsing?
3. Could editorial wording changes break it accidentally?
4. Should this instead remain a contract and be transformed into a thinner runtime asset?

If the answer to `4` is yes, prefer creating a thin runtime-facing asset rather than reading the richer product doc directly.

## Asset Conversion Pattern
Preferred pattern:

1. rich contract or persona asset defines intent
2. thin runtime asset compresses it
3. runtime reads the thin asset

Current example:
- full persona card -> runtime persona slice -> runtime loader

This pattern keeps:
- traceability
- runtime safety
- future folder mobility

## What This Means For Future Refactoring
If `docs/product/` is later reorganized, the safest path is:

1. identify current runtime-readable assets
2. preserve or migrate only that thin execution-facing layer first
3. update loaders and tests
4. reorganize contract and concept docs separately

This avoids turning a documentation reorganization into a runtime breakage cascade.

## Current Recommendation
Do not broadly split `docs/product/` yet.

Do this instead:
- preserve the runtime-readable boundary
- keep direct runtime reads narrow
- add tests for any execution-facing asset loader
- only introduce a new execution-facing folder when there are at least 2-3 asset families using the same pattern

That keeps the system normalized enough for now without premature document churn.
