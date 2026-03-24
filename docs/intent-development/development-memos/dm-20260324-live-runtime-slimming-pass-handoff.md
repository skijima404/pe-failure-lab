# Implementation Session Handoff

- handoff_type: implementation-session
- owner: shared
- status: draft
- created_at: 2026-03-24
- updated_at: 2026-03-24
- related_intent:
  - docs/intent-development/intents/in-intent-001-simulation-core-loop.md
- related_feature_proposal:
  - docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_runtime_spec:
  - docs/intent-development/implementation-specs/is-intent-001-local-first-live-actor-generation.md
- related_memo:
  - docs/intent-development/development-memos/dm-20260324-production-runtime-reset-direction.md

## Change Summary
- goal:
  - slim the local-first runtime toward a thinner kernel and more generative stakeholder turns
- scope:
  - live actor rendering
  - whisper sidecar payload shape
  - facilitator intervention pressure
  - unresolved stop conditions
  - runtime contract coverage
- user-visible impact:
  - stakeholder turns vary by runtime slice, stance hint, and session tension instead of a fixed `lead -> concern -> question` pattern
  - the room can remain unresolved and still end cleanly on loop or hard-stop conditions

## Files Changed
- path: `runtime/execution/local-live-actor-rendering.ts`
- path: `runtime/agents/actor/prompt.ts`
- path: `runtime/sidecars/types.ts`
- path: `runtime/sidecars/local-whisper-sidecar.ts`
- path: `runtime/orchestration/turn-selection-helpers.ts`
- path: `runtime/state/structural-state.ts`
- path: `runtime/execution/local-facilitator.ts`
- path: `runtime/verification/local-actor-rendering.ts`
- path: `tests/runtime/runtime-contracts.test.ts`
- path: `docs/intent-development/implementation-specs/is-intent-001-local-first-live-actor-generation.md`

## Design Decisions
- decision:
  - keep whispers as secondary runtime hints, but reduce them to stance bias, move bias, and focus cue instead of sentence seeds
- decision:
  - derive visible actor speech from runtime slice plus temporary stance and session tension, with deterministic variant selection only for lightweight replay variation
- decision:
  - stop routing settled exchanges through mandatory facilitator settlement and let the player retake control when no repair is needed
- decision:
  - add loop-threshold and hard-turn-limit close reasons so unresolved endings remain first-class evaluator inputs

## Boundary Notes
- production modules touched:
  - `runtime/execution/`
  - `runtime/agents/`
  - `runtime/sidecars/`
  - `runtime/orchestration/`
  - `runtime/state/`
- verification or test modules touched:
  - `runtime/verification/local-actor-rendering.ts`
  - `tests/runtime/runtime-contracts.test.ts`
- new coupling risk, if any:
  - local live rendering now depends more directly on the whisper stance contract, so future sidecar changes should preserve `stance_bias`, `move_bias`, and `focus_cue` or update the renderer together

## Validation Run
- command:
  - `node --experimental-strip-types --test tests/runtime/*.test.ts`
- result:
  - pass (`73` tests)

## Open Risks
- risk:
  - the new local actor surface is thinner and more varied, but still rule-based rather than model-native generative; further naturalness gains may require a child-session planner or richer stance evolution
- risk:
  - loop detection currently relies on lightweight transcript heuristics and may need refinement once longer interactive sessions are playtested

## Questions For Architecture Review
- question:
  - should session tension remain an inferred rendering input, or be promoted into canonical state for observability and evaluator-side correlation
- question:
  - should unresolved stop reasons be separated into `looping`, `timebox`, and `hard-stop` artifacts in evaluator evidence rather than reusing `close_readiness.reason`
