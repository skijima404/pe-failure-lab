# Runtime

Initial modular-monolith runtime skeleton for the MVP local-first simulation runtime.

Important terminology:
- `operator layer`: Codex work sessions used for development
- `orchestration layer`: the local room-state controller and turn selector
- `simulation actor layer`: facilitator and stakeholder runtime actors
- `response chain`: the per-speaker remote continuation path used by remote actor generation
- `evaluator layer`: local-first post-game reflection

Default runtime stance:
- live simulation is `local-first`
- actor separation is primarily a responsibility and context boundary
- remote response chains are optional transport behavior, not the architectural center of the runtime
- evaluator remains local-first and post-game
- product-facing local scripts use a local live actor generation path

## Purpose
This directory holds the first code-level runtime substrate for:
- canonical `room_state`
- turn orchestration
- runtime-actor prompt adapters
- execution loop scaffolding
- observability
- validation

## Module Map
- `state/`: canonical runtime types, schema helpers, and fixtures
- `orchestration/`: next-turn decision logic and topic management
- `agents/`: prompt-input builders for actor, facilitator, and evaluator runtime actors
- `execution/`: turn preparation and runtime loop scaffolding
- `transcripts/`: bounded context extraction from recent transcript
- `presentation/`: visible transcript rendering and boundary hygiene
- `observability/`: structured turn logs and debug dumps
- `validation/`: deterministic checks and fixtures
- `verification/`: fixture-only adapters and other non-live verification assets

Repository-level execution split:
- `scripts/production/`: product-facing entrypoints for playable runtime flows
- `scripts/verification/`: verification-only harnesses, fixtures, and mock runners
- `scripts/shared/`: shared script utilities such as environment loading
- `tests/runtime/`: runtime contract tests that must stay outside production code paths

## Current Status
This is a foundation layer, not a full runnable simulation yet.

Architectural note:
- the runtime foundation still supports multi-agent concepts
- the live loop should be understood as one local orchestrator coordinating bounded role behavior
- remote generation may be used, but it is not the primary definition of actor separation

What exists now:
- shared types and initial room-state helper
- a first `selectNextTurn` decision function
- state reducers and turn outcome application
- prompt-input builders
- runtime-readable scene and player-initialization asset loaders
- a player-facing initialization brief and start-signal helper
- a small session driver from initialization to live turns
- interactive session primitives for initialize -> start -> player input -> next agent turn
- session-step and session-loop scaffolding
- explicit execution-layer split between:
  - turn preparation for runtime actors
  - responder transport for scripted/mock/remote generation
- structured logging helpers
- transcript and validation helpers
- visible transcript boundary rendering
- evaluator evidence packet extraction and local-first evaluation
- scripted fixture runner for traceable turn progression
- a runnable scripted fixture harness via `npm run fixture:scripted`
- a runnable initialization harness via `npm run fixture:initialization`
- a runnable session driver harness via `npm run fixture:session-driver`
- a runnable local live actor harness via `npm run simulate:local`
- a runnable mock adapter harness via `npm run fixture:mock-adapter`
- a runnable OpenAI adapter harness via `npm run fixture:openai-adapter`
- a runnable evaluator harness via `npm run fixture:evaluator`
- explicit folder separation between product entrypoints, verification entrypoints, and runtime tests

What does not exist yet:
- richer scene asset families beyond the MVP thin runtime slices
- production-grade evaluator scoring implementation

## Environment Notes
`npm run fixture:openai-adapter` reads:
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional)
- `OPENAI_REASONING_EFFORT` (optional)
- `OPENAI_REMOTE_MULTI_AGENT` (optional)
  - `true`: keep a separate OpenAI response chain per runtime speaker
  - `false`: use stateless one-shot calls

The script first checks the current environment, then falls back to a repository-root `.env` file if present.

Current development preference:
- use local-first production entrypoints first
- evaluate local child-session separation before promoting OpenAI-backed paths as the main actor-generation direction
- keep mock and deterministic assets as verification support, not as the end-state product center

## E2E Notes
- Default operator guidance:
  - use `npm run simulate:local` when checking the product-facing local live path
  - use `npm run fixture:session-driver` or `npm run simulate:local:mock` when checking verification-oriented deterministic behavior
  - use `npm run fixture:mock-adapter` only for fixture-style mock verification
  - use `npm run simulate:openai` only when you intentionally want the optional remote validation harness
- Boundary reminder:
  - assets under `runtime/verification/` are not product-quality live runtime assets
  - verification scripts may import from `runtime/verification/`
  - product-facing local scripts must not import from `runtime/verification/`
- Runtime mode roles:
- `simulate:openai`
    - thin remote smoke test
    - runs initialization -> opening -> one player turn -> one agent response
    - use when checking early-turn boundary, OpenAI wiring, or visible transcript hygiene
    - not intended as a full meeting playtest
- Local-first interpretation:
  - orchestration remains local in all supported modes
  - player input remains local in interactive human-play modes
  - remote response chains, when enabled, only affect how actor text is generated
  - visible child sessions are operator tooling, not runtime actors
- `npm run fixture:session-driver` runs initialization -> start signal -> local opening -> live turns
- `npm run fixture:session-driver` now prints a clean simulation-facing transcript by default
- `npm run fixture:session-driver -- --adapter=openai` uses the same flow with the OpenAI adapter
- `npm run fixture:openai-adapter` is the dedicated OpenAI E2E harness for the same entry flow
- closing and evaluator are now separated:
  - facilitator owns the close turn
  - local evaluator starts only after `scene_phase === post-game`
- `runtime/execution/session-driver.ts` now also exposes split interactive helpers:
  - `initializeSession()`
  - `startSession()`
  - `acceptPlayerMessage()`
  - `acceptPlayerMessageWithJudger()`
  - `runNextRuntimeActorTurnFromState()`
  - `evaluateIfSessionClosed()`
- player-turn judgment remains main-session-owned:
  - the default path uses a local judgment boundary
  - `multi_perspective_needed` is kept as a conservative intervention signal; it can justify bounded sidecar/context preparation without forcing an immediate visible speaker switch
- `runtime/execution/prepare-runtime-turn.ts` is the canonical turn-preparation entry point
- `runtime/execution/runtime-responder.ts` is the canonical runtime response transport boundary
- observability now records layer-specific traces so operators can distinguish:
  - local operator activity
  - local orchestration
  - runtime actor speech
  - remote response-chain continuity
 - architecture decision record:
   - `docs/decisions/adr-20260321-local-first-runtime-and-multi-agent-scope.md`
