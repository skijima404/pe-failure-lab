# Intent

- intent_id: intent-001
- title: Simulation Core Loop
- owner: shared
- status: draft
- created_at: 2026-03-21
- updated_at: 2026-03-24
- related_value_streams:
  - docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md
- related_enablers:
  - intent-000
  - intent-007

## Desired Change
Make the simulation session into a coherent learning loop in which a learner can enter a scenario, experience pressure through interaction, and leave with usable reflection rather than only raw conversation.

The learning loop does not require the live meeting to converge cleanly. A session may end because:
- the room reached a bounded conclusion
- the room remained unresolved
- the room became repetitive or time-boxed

Reflection value should come from what the learner surfaced, missed, or failed to align under pressure, not only from whether the meeting "succeeded."

## Problem
The repository already defines product assets and implementation direction for simulation, but the intended change is currently expressed only through the feature proposal layer. Without a dedicated Intent asset, it is harder to state plainly what should change within the end-to-end session value flow and to keep downstream feature, interaction, and implementation work anchored to that change.

## Outcome Boundary
- In scope:
  - the desired end-to-end learner change across scenario entry, live interaction, session closure, and reflection
  - the connection between simulation pressure and reflection value
  - the traceability anchor for feature, UI, and implementation assets under `intent-001`
- Out of scope:
  - detailed runtime design
  - scenario authoring specifics for individual failure patterns
  - booth-surface design beyond what the core loop requires

## Success Signals
1. The repository can point to one durable asset that states what should change in the simulation session value flow.
2. Downstream feature, UI, and implementation documents can link to this Intent without relying on chat context.
3. The simulation is consistently framed as a learning loop from scenario entry to reflection, not only as a live conversation engine.
4. The simulation remains useful even when the live conversation ends unresolved or time-boxed.

## Downstream Delivery
- Expected feature proposals:
  - `docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md`
- Expected user interaction specs:
  - `docs/intent-development/ui-specs/ui-intent-001-simulation-session-flow.md`
- Expected implementation specs:
  - `docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md`
  - `docs/intent-development/implementation-specs/is-intent-001-local-first-live-actor-generation.md`
  - `docs/intent-development/implementation-specs/is-intent-001-thin-runtime-persona-contract.md`
  - `docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md`
  - `docs/intent-development/implementation-specs/is-intent-001-runtime-observability-and-validation.md`

## Evidence / References
- `docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md`
- `docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md`
- `docs/product/vision.md`
