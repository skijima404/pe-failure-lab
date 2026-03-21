# Runtime

Initial modular-monolith runtime skeleton for the MVP multi-agent simulation.

## Purpose
This directory holds the first code-level runtime substrate for:
- canonical `room_state`
- turn orchestration
- agent prompt adapters
- execution loop scaffolding
- observability
- validation

## Module Map
- `state/`: canonical runtime types, schema helpers, and fixtures
- `orchestration/`: next-turn decision logic and topic management
- `agents/`: prompt-input builders for actor, facilitator, and evaluator agents
- `execution/`: turn preparation and runtime loop scaffolding
- `transcripts/`: bounded context extraction from recent transcript
- `observability/`: structured turn logs and debug dumps
- `validation/`: deterministic checks and fixtures

## Current Status
This is a foundation layer, not a full runnable simulation yet.

What exists now:
- shared types and initial room-state helper
- a first `selectNextTurn` decision function
- state reducers and turn outcome application
- prompt-input builders
- runtime-readable scene and player-initialization asset loaders
- a player-facing initialization brief and start-signal helper
- a small session driver from initialization to live turns
- session-step and session-loop scaffolding
- structured logging helpers
- transcript and validation helpers
- scripted fixture runner for traceable turn progression
- a runnable scripted fixture harness via `npm run fixture:scripted`
- a runnable initialization harness via `npm run fixture:initialization`
- a runnable session driver harness via `npm run fixture:session-driver`
- a runnable mock adapter harness via `npm run fixture:mock-adapter`
- a runnable OpenAI adapter harness via `npm run fixture:openai-adapter`
- a runnable evaluator harness via `npm run fixture:evaluator`

What does not exist yet:
- richer scene asset families beyond the MVP thin runtime slices
- production-grade evaluator scoring implementation

## Environment Notes
`npm run fixture:openai-adapter` reads:
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional)
- `OPENAI_REASONING_EFFORT` (optional)

The script first checks the current environment, then falls back to a repository-root `.env` file if present.

## E2E Notes
- `npm run fixture:session-driver` runs initialization -> start signal -> local opening -> live turns
- `npm run fixture:session-driver -- --adapter=openai` uses the same flow with the OpenAI adapter
- `npm run fixture:openai-adapter` is the dedicated OpenAI E2E harness for the same entry flow
