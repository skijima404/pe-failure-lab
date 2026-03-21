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
- a runnable mock adapter harness via `npm run fixture:mock-adapter`
- a runnable OpenAI adapter harness via `npm run fixture:openai-adapter`
- a runnable full-session OpenAI playtest harness via `npm run fixture:openai-full-session`
- a runnable evaluator harness via `npm run fixture:evaluator`

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

## E2E Notes
- Default operator guidance:
  - use `npm run simulate:mock` or `npm run fixture:session-driver` when checking the local-first runtime shape
  - use `npm run simulate:openai:interactive` only when you intentionally want remote-backed human play
  - use `npm run simulate:openai:full` when you intentionally want remote-backed end-to-end validation
  - use `npm run simulate:openai` only when you intentionally want the thin early-turn harness
- Runtime mode roles:
  - `simulate:openai`
    - thin remote smoke test
    - runs initialization -> opening -> one player turn -> one agent response
    - use when checking early-turn boundary, OpenAI wiring, or visible transcript hygiene
    - not intended as a full meeting playtest
- `simulate:openai:interactive`
    - human-in-the-loop remote-backed playtest mode
    - runs initialization, then waits for the human player to enter each player turn while remote-backed actors respond one turn at a time
    - defaults to per-speaker remote response chains when `OPENAI_REMOTE_MULTI_AGENT` is not set
    - use when explicitly comparing local-first orchestration with remote-backed actor generation
  - `simulate:openai:full`
    - scripted-player remote-backed end-to-end runtime validation
    - runs initialization -> live session autoplay -> close -> local evaluator
    - defaults to per-speaker remote response chains when `OPENAI_REMOTE_MULTI_AGENT` is not set
    - use when checking lifecycle integrity, close/evaluator separation, and end-to-end remote runtime stability
    - not intended as a human-in-the-loop player experience
- Local-first interpretation:
  - orchestration remains local in all supported modes
  - player input remains local in interactive human-play modes
  - remote response chains, when enabled, only affect how actor text is generated
  - visible child sessions are operator tooling, not runtime actors
- `npm run fixture:session-driver` runs initialization -> start signal -> local opening -> live turns
- `npm run fixture:session-driver` now prints a clean simulation-facing transcript by default
- `npm run fixture:session-driver -- --adapter=openai` uses the same flow with the OpenAI adapter
- `npm run fixture:openai-adapter` is the dedicated OpenAI E2E harness for the same entry flow
- `npm run fixture:openai-full-session` runs a durable scripted-player full session from initialization through close and local evaluation
- closing and evaluator are now separated:
  - facilitator owns the close turn
  - local evaluator starts only after `scene_phase === post-game`
- `runtime/execution/session-driver.ts` now also exposes split interactive helpers:
  - `initializeSession()`
  - `startSession()`
  - `acceptPlayerMessage()`
  - `runNextRuntimeActorTurnFromState()`
  - `evaluateIfSessionClosed()`
- `runtime/execution/prepare-runtime-turn.ts` is the canonical turn-preparation entry point
- `runtime/execution/runtime-responder.ts` is the canonical runtime response transport boundary
- observability now records layer-specific traces so operators can distinguish:
  - local operator activity
  - local orchestration
  - runtime actor speech
  - remote response-chain continuity
 - architecture decision record:
   - `docs/decisions/adr-20260321-local-first-runtime-and-multi-agent-scope.md`
