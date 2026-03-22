# Enabler Proposal

- intent_id: intent-007
- title: Multi-Agent Simulation Runtime Foundation
- owner: shared
- status: draft
- created_at: 2026-03-20
- updated_at: 2026-03-21
- related_decisions:
  - docs/decisions/adr-20260321-local-first-runtime-and-multi-agent-scope.md
- enables:
  - intent-001

## Purpose
Define the durable runtime foundation needed so that simulation features can use multiple agents when appropriate without collapsing into prompt sprawl, duplicated memory, or evaluator-like live dialogue.

## Problem
Without a shared multi-agent runtime foundation, each simulation feature is likely to reinvent:
- agent boundaries
- turn ownership rules
- room-state shape
- context-sharing conventions

That drift would make the repository harder to reason about and would increase the risk of:
- actors sounding the same despite separate prompts
- facilitator over-control because routing is not modeled cleanly
- repeated or contradictory stakeholder reactions because memory is fragmented
- structural scoring logic leaking into live actor behavior

## Asset Definition
This enabler defines the reusable runtime substrate for multi-agent simulation.

It does not require remote execution as the default live-runtime posture.

It should become the durable reference for:
- canonical agent roles in a simulation runtime
- shared `room_state` structure
- knowledge partition between orchestrator, facilitator, actors, and evaluator
- turn ownership and intervention rules
- minimum validation checks for multi-agent conversation quality

The initial asset boundary is:
- one hidden orchestrator may coordinate multiple speaking agents
- speaking agents should not own canonical room memory
- shared state should be explicit, bounded, and machine-readable
- evaluation should remain separate from live turn generation
- routing is allowed, but visible traffic-control behavior should be minimized
- local-first execution remains valid as long as responsibility and context boundaries hold
- local child-session sidecars are allowed only as bounded helpers and should not become canonical room-state owners

Current working storage for these assets:
- `docs/intent-development/enabler-proposals/ep-intent-007-multi-agent-simulation-runtime-foundation.md`
- `docs/intent-development/implementation-specs/is-intent-001-mvp-multi-agent-runtime-design.md`

## Success Criteria
1. Multiple feature or implementation specs can reference one runtime foundation instead of redefining multi-agent control from scratch.
2. Runtime code can share one canonical room-state schema and one knowledge-partition model across scenarios.
3. Downstream simulation work can improve naturalness without reintroducing evaluator behavior into live actor turns.

## Scope
- In scope:
  - reusable multi-agent runtime roles
  - shared room-state conventions
  - knowledge partition rules
  - turn ownership and routing principles
  - risks and tradeoffs of adopting multi-agent runtime
- Out of scope:
  - scene-specific facilitator wording
  - persona-specific voice tuning
  - scenario-specific topic flow
  - final code architecture decisions for any one runtime stack

## Operational Use
- How feature proposals should reference this asset:
  - state whether the feature depends on shared multi-agent orchestration, room-state, or knowledge-partition rules
- How UI specs should reference this asset:
  - state which parts of live conversation flow assume orchestrated turn ownership or visible topic parking
- How implementation specs should reference this asset:
  - state how the runtime applies or narrows the shared agent boundary and room-state rules for a specific scene or feature

## Foundation Contract
### Canonical runtime roles
Required role types:
- `room-orchestrator`
- `facilitator-agent` when the scene has an in-world facilitator
- `actor-agent`
- `evaluator-agent`

### Canonical room-state areas
The shared runtime state should define at least:
- session identity and phase
- active topic
- exchange state
- participant states
- bounded recent transcript
- structural state used for downstream evaluation
- close readiness

### Knowledge partition rule
- the orchestrator may know the full canonical room state
- speaking agents should receive only the slices required for their next turn
- evaluator logic must not be a standard part of actor prompts
- sidecar workers should receive bounded task packets and return candidate reasoning rather than final transcript authority

### Turn ownership rule
Before a speaking turn is generated, the runtime should make explicit:
- who owns the next move
- why that actor or facilitator is speaking now
- whether the current topic is continuing, being parked, or being switched

### Sidecar worker rule
If the runtime uses sidecar workers for proposal evaluation or similar high-coupling moments:
- the main session remains the canonical owner of room state and visible transcript
- the sidecar input should be a bounded packet, not the full simulation state by default
- the sidecar output should be candidate reasoning or reaction structure, not final visible wording
- sidecar use should be selective and justified by task type, not treated as the default for all turns

## Negative Effects and Costs
Using multiple agents has real downside.

### Complexity cost
- more prompts, more state transforms, and more failure points
- harder debugging because errors may emerge from interaction between components rather than one bad prompt
- more implementation overhead before the first playable version feels stable
- remote execution can add cost and confusion without delivering proportional product value
- sidecar usage can still create hidden packet-design complexity if the main session delegates too much meaning-making

### Consistency risk
- actor voices may still converge if persona slices are weak
- agents may contradict each other if shared state updates are lossy or late
- facilitator behavior can become unnaturally frequent if turn ownership is not explicit in code

### Product risk
- multi-agent structure can create the illusion of realism without actually improving conversation quality
- a hidden orchestrator can become a script engine if rules are too rigid
- developers may overfit prompts to one happy-path transcript instead of building a robust runtime contract

### Cost and operability risk
- more model calls increase cost and latency
- testing becomes more scenario-heavy because naturalness regressions are often interaction-level, not unit-level
- replayability and determinism become harder unless runtime state transitions are logged carefully

### Organizational risk
- the repository can become harder to maintain if multi-agent runtime rules are buried inside one feature spec
- future contributors may misuse multiple agents as a default answer even when a simpler runtime would do

## Change Contract
- Allowed Changes:
- refine reusable multi-agent role definitions, room-state conventions, and validation guidance
- sharpen tradeoff language so downstream teams understand when multi-agent is worth the cost
- refine rules for selective sidecar use when a task is too rich for one-pass local rendering but too coupled for full actor independence
- Forbidden Changes:
  - turning this enabler into a scene-specific runtime script
  - treating multi-agent as mandatory for every simulation feature
  - moving evaluator logic into the default live actor contract
- Approval Required:
  - changing the canonical runtime role set
  - changing the rule that speaking agents do not own canonical room memory
  - making live evaluator intervention part of the foundation
- Validation:
  - downstream specs can reference this enabler for multi-agent runtime rules
  - room-state and knowledge-partition rules remain reusable across more than one scene or feature
  - downside and operational cost remain explicit rather than implicit
- Rollback:
  - revert this enabler together with downstream references that assume it

## Open Questions
- [ ] Which parts of `room_state` should be formalized as schema files before runtime code starts?
- [ ] When should a simulation prefer single-agent runtime even if naturalness is a concern?
- [ ] Which adjacent subsystems, such as scenario generation or failure pattern matching, benefit more from stronger multi-agent separation than the live simulation loop does?
- [ ] What is the minimum bounded packet shape for proposal-turn sidecar workers so they can add perspective without becoming transcript owners?

## Evidence / References
- `docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md`
- `docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md`
- `docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-multi-agent-handoff.md`
- `docs/intent-development/implementation-specs/is-intent-001-mvp-multi-agent-runtime-design.md`
