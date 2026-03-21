# ADR

- id: adr-20260321-local-first-runtime-and-multi-agent-scope
- title: Adopt a local-first simulation runtime and narrow the scope of multi-agent usage
- status: accepted
- date: 2026-03-21
- related_enablers:
  - docs/intent-development/enabler-proposals/ep-intent-007-multi-agent-simulation-runtime-foundation.md
  - docs/intent-development/enabler-proposals/ep-intent-008-runtime-regression-validation-workflow.md
- related_features:
  - docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
  - docs/intent-development/feature-proposals/fp-intent-002-precise-failure-pattern-scenario-design.md
- related_specs:
  - docs/intent-development/implementation-specs/is-intent-001-mvp-multi-agent-runtime-design.md
  - docs/intent-development/implementation-specs/is-intent-001-remote-multi-agent-session-boundaries.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-observability-and-validation.md
- related_contracts:
  - docs/product/contracts/mvp-simulation-contract.md
  - docs/product/contracts/facilitator-role-contract.md

## Context
The repository explored remote multi-agent runtime behavior for the live simulation loop under `intent-001`.

During implementation and playtest troubleshooting, the term `agent` became overloaded across multiple layers:
- Codex operator sessions and child work sessions
- local room orchestration logic
- live simulation actors such as facilitator and stakeholders
- post-game evaluator behavior
- remote response continuation chains

This made it difficult to answer:
- what was local versus remote
- which unit actually owned turn selection
- whether visible or implied child-session behavior mattered to simulation quality
- whether remote actor separation was improving the product or only increasing complexity

The current product is fundamentally a communication simulation.
Its main value depends on:
- coherent meeting flow
- bounded role behavior
- clear phase separation between live meeting and evaluation
- replayable and debuggable runtime behavior

Those goals depend more on responsibility boundaries and context discipline than on high physical execution separation between live actors.

## Trigger
The previous direction was challenged by combined implementation and product evidence:
- remote multi-agent terminology repeatedly caused operator confusion
- the runtime became harder to reason about because execution location and conceptual role were mixed
- remote role separation added observability and debugging burden
- the live simulation loop did not show enough product benefit from remote actor separation to justify the added complexity
- the product need for replayability and variation appears to be constrained more by scenario supply than by live actor independence

This created a maintainability problem and a contradiction between intended and observed value.

## Decision
Adopt a local-first runtime for the live simulation loop and narrow the scope of multi-agent usage.

This means:
- `Operator Layer` remains local and separate from simulation-facing runtime behavior
- `Runtime Orchestration Layer` remains local and is the canonical owner of turn selection and lifecycle control
- `Simulation Actor Layer` is treated primarily as a responsibility and context boundary, not as a requirement for remote execution
- remote response chains are optional implementation details, not the default architectural center of the live runtime
- `Evaluator Layer` remains local-first and clearly post-game

For live simulation:
- prefer local execution and local child-session style decomposition where it helps operator workflow
- do not treat stronger remote actor separation as the default solution for natural conversation quality
- optimize first for clear boundaries, observability, testability, and replayability

For future multi-agent investment:
- prefer targets that behave more like `Complicated Subsystem` work than tightly coupled live conversation control
- likely candidates include scenario generation, failure pattern matching, evidence extraction, and related analysis workflows

The repository should therefore treat:
- live communication runtime as a local-first orchestrated system
- multi-agent experimentation as better suited to adjacent authoring, analysis, and scenario-supply subsystems

## Consequences
- Positive:
  - the live runtime architecture becomes easier to explain and debug
  - operator, orchestration, actor, response-chain, and evaluator boundaries can remain explicit without requiring remote execution
  - local child sessions can be used pragmatically for development workflow without being confused with runtime actors
  - the team can invest multi-agent effort where independence is structurally stronger and value is easier to justify
  - replayability work can shift toward scenario variation and failure-pattern coverage
- Negative:
  - the repository steps back from treating remote live actor separation as a primary differentiator
  - some earlier multi-agent framing in docs and code may now read stronger than the adopted direction
  - future truly independent actor-runtime experiments will need explicit justification rather than being implied by current terminology
- Follow-up work:
  - update intent-001 runtime docs so local-first live runtime becomes the primary description
  - reduce ambiguous use of `agent` in operator-facing and runtime-facing documents
  - identify one or more adjacent subsystems where multi-agent usage is actually advantageous
  - evaluate `failure pattern matching` and `scenario generation` as candidate next areas for multi-agent design

## Notes
Rejected as the primary default direction:
- treating remote live actor separation as the main architecture strategy for conversation quality
- using visible or implied child sessions as evidence of simulation-facing multi-agent correctness
- equating per-role remote response chains with truly independent actor runtimes

Clarification:
- this decision does not ban remote model usage
- it changes the architectural center of gravity
- remote execution may still be used when it provides clear value, but it is no longer the assumed answer for live simulation structure
