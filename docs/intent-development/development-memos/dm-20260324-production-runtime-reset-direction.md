# Development Memo

- memo_id: dm-20260324-production-runtime-reset-direction
- title: Production Runtime Reset Direction
- owner: shared
- status: draft
- created_at: 2026-03-24
- updated_at: 2026-03-24
- related_intent:
  - docs/intent-development/intents/in-intent-001-simulation-core-loop.md
- related_feature_proposal:
  - docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_runtime_specs:
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md
  - docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md
  - docs/intent-development/implementation-specs/is-intent-001-local-first-live-actor-generation.md

## Purpose
Record the recommended rollback baseline, keep/drop boundary, and production-first operating direction for the next runtime simplification pass.

## Working Baseline
If changes after `2026-03-22 23:00 JST` are discarded, the practical rollback baseline is:
- `b2a6152` (`2026-03-22 22:46:08 +0900`)

This baseline is preferred because:
- it keeps the local-first runtime substrate
- it avoids rolling all the way back to `main`, which is too early for current executable runtime work
- it predates the later tightening that increased conversation convergence pressure

## Keep
Retain and continue evolving these layers:
- canonical room state under `runtime/state/`
- turn selection and topic control under `runtime/orchestration/`
- transcript shaping, presentation, and evaluation under `runtime/transcripts/`, `runtime/presentation/`, and `runtime/evaluation/`
- session-driver and execution scaffolding that preserve local-first ownership
- verification-only assets under `runtime/verification/`
- contract tests and fixture harnesses as explicit non-production support assets

## Drop Or Rework
Treat these as reset candidates rather than foundations:
- deterministic full-sentence actor surface realization that makes live dialogue converge too quickly
- whisper logic that only changes concern labels without changing conversational stance
- over-detailed persona and scenario payloads that force runtime prompts to carry too much prescriptive detail
- any design that uses remote OpenAI-backed generation as the default center before local-first actor variation has been revalidated

## Repository Boundary Direction
The repository should treat code paths as three explicit classes:

1. Production entrypoints
- playable runtime flows intended to become demo-grade product behavior
- stored under `scripts/production/`

2. Verification entrypoints
- fixture runners, deterministic harnesses, mock-backed checks, and regression probes
- stored under `scripts/verification/`

3. Tests
- contract tests and boundary assertions
- stored under `tests/runtime/`

Shared helpers for scripts belong under:
- `scripts/shared/`

## Development Direction
- Production quality is the target. The runtime should be shaped toward a live demo for CloudNative Kaigi on 2026-05-14 to 2026-05-15.
- Mock and deterministic assets are acceptable only as support for validation, debugging, and regression control.
- OpenAI API usage should remain optional until local child-session separation has been tried as the next exploration path for actor variation.
- Conversation quality should become more generative, while evaluation quality should remain structural and local-first.
- CNCF Maturity Model and Failure Model assets should be treated primarily as evaluator- and planning-layer knowledge, not default actor-runtime knowledge.
- The runtime should not force conversational convergence; unresolved or time-boxed endings remain valid as long as evaluator output can interpret them.

## Operating Implication
The next runtime simplification pass should favor:
- thinner runtime persona slices
- thinner scenario payloads
- more actor-level generative freedom
- stronger production/verification/test folder boundaries
- evaluation coverage through transcript evidence extraction rather than forcing every perspective into every live turn

## Minimal Layer Direction
Target layer split for the next simplification pass:

1. Runtime kernel
- canonical state
- turn orchestration
- actor and facilitator input shaping
- turn execution
- transcript capture
- stop policy enforcement

2. External planning layer
- run-level tension selection
- actor stance initialization
- variation seed handling

3. Model asset layer
- CNCF Maturity Model source assets
- Failure Model source assets
- rich persona and scenario source assets

4. Evaluation layer
- transcript evidence extraction
- scoring and reflection
- source-model reference when needed

Kernel slimming rule:
- if a module mainly stores model knowledge or assessment semantics, prefer keeping it out of the runtime kernel
- if a module mainly coordinates turns, transcript state, and stop conditions, it can remain in the runtime kernel
