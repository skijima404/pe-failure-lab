# Intent

- intent_id: intent-003
- title: End-of-Game Assessment and Discussion
- owner: shared
- status: draft
- created_at: 2026-03-21
- updated_at: 2026-03-21
- related_value_streams:
  - docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md
- related_enablers:
  - intent-000

## Desired Change
Make completed simulation sessions end with a structured assessment and discussion artifact that turns live interaction into durable learning value.

## Problem
The session value stream is not complete if it ends as raw conversation. Without a dedicated Intent asset, the repository lacks a concise statement of the change required between session closure and useful reflection.

## Outcome Boundary
- In scope:
  - structured game-end assessment output
  - explainable post-session discussion support
  - traceability anchor for assessment and reflection delivery work
- Out of scope:
  - long-term learner analytics
  - replay-specific feature design beyond what is needed for post-game reflection
  - unrelated live-surface concerns

## Success Signals
1. The repository can point to a durable asset that states the desired change in the end-of-session learning flow.
2. Post-game output is treated as a first-class learning artifact rather than optional commentary.
3. Downstream feature or future spec work can link to this Intent directly.

## Downstream Delivery
- Expected feature proposals:
  - `docs/intent-development/feature-proposals/fp-intent-003-end-of-game-assessment-feedback-and-discussion.md`
- Expected user interaction specs:
  - none required at current scope
- Expected implementation specs:
  - none required at current scope

## Evidence / References
- `docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md`
- `docs/intent-development/feature-proposals/fp-intent-003-end-of-game-assessment-feedback-and-discussion.md`
- `docs/product/expected-outputs/game-end-output.md`
