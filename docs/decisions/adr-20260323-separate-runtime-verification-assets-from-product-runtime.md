# ADR

- id: adr-20260323-separate-runtime-verification-assets-from-product-runtime
- title: Separate runtime verification assets from product runtime modules
- status: accepted
- date: 2026-03-23
- related_features:
  - docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
  - docs/intent-development/feature-proposals/fp-intent-008-local-whisper-runtime-variation.md
- related_specs:
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-observability-and-validation.md
  - docs/intent-development/implementation-specs/is-intent-008-local-whisper-runtime-design.md
- related_decisions:
  - docs/decisions/adr-20260321-local-first-runtime-and-multi-agent-scope.md

## Context
The repository accumulated two different classes of runtime asset inside the same code paths:
- product-facing runtime modules that were intended to support the long-term live simulation architecture
- verification-oriented assets such as deterministic local renderers, mock adapters, and fixture-friendly responders

This boundary became unclear during repeated attempts to stabilize local-first simulation behavior after remote and multi-session actor strategies were abandoned for the live loop.

The result was a recurring failure pattern:
1. a verification-only asset was introduced to make local runtime inspection easier
2. the asset stayed under product runtime folders such as `runtime/execution/`
3. live local scripts started importing that asset because it was nearby and already worked
4. product-quality discussion about natural conversation quality became entangled with fixture-oriented deterministic text generation

The concrete symptom was that deterministic local actor text generation assets such as `local-actor-rendering` and related responders could be mistaken for legitimate live actor-generation infrastructure rather than verification scaffolding.

## Trigger
The repository repeatedly observed the same maintenance accident:
- mock or deterministic renderer assets were reintroduced into the default local play path
- operators interpreted local verification harnesses as product-quality runtime behavior
- debugging and product-quality tuning were slowed because verification scaffolding and product runtime were no longer cleanly separable

This created avoidable confusion and rework.

## Decision
Separate verification-only runtime assets from product runtime modules by introducing `runtime/verification/` as an explicit boundary.

This means:
- deterministic local actor rendering used for fixtures or local verification belongs under `runtime/verification/`
- mock adapters belong under `runtime/verification/`
- verification-only responders belong under `runtime/verification/`
- product runtime modules under `runtime/execution/`, `runtime/orchestration/`, `runtime/state/`, and `runtime/agents/` must not depend on `runtime/verification/`
- runnable local scripts such as `simulate:local` and `simulate:local:interactive` are explicitly treated as verification harnesses unless and until a separate product-quality actor generation path is implemented

This decision does not claim that current local scripts are product-quality actor runtime.
It explicitly records that they are verification-oriented until a different production-grade actor generation path exists.

## Consequences
- Positive:
  - the repository can distinguish verification scaffolding from product runtime architecture
  - future regressions where mock-like assets leak into live paths become easier to detect
  - local scripts can still exist for runtime observability without pretending to be product-quality dialogue generation
  - product-quality work can be planned separately from deterministic verification behavior
- Negative:
  - the repository becomes more explicit that currently runnable local dialogue remains verification-oriented
  - some existing operator-facing commands may sound more production-like than they actually are and need documentation clarification
  - a future product-quality actor generation path still needs to be designed

## Follow-up Work
- update runtime module structure spec to include `runtime/verification/`
- add regression tests that ensure product runtime modules do not re-export or directly depend on verification-only adapters
- relabel local simulation commands in docs so they are not mistaken for product-quality actor behavior
- define a separate product-quality live actor generation path when the repository is ready to do so

## Notes
This ADR records a recurring repository accident, not only a directory rename.

The key point is architectural intent:
- verification assets may be useful and should remain easy to run
- verification assets must not quietly become the product runtime by proximity
