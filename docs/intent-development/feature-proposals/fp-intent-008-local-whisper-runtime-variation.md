# Feature Proposal

- intent_id: intent-008
- title: Local Whisper Runtime Variation
- owner: shared
- status: draft
- created_at: 2026-03-22
- updated_at: 2026-03-22
- related_enablers:
  - intent-000
  - intent-007
- related_ui_spec: TBD

## Intent
Create a replayable live runtime where repeated plays can surface different stakeholder angles, concern ordering, and meeting texture without turning the main session into a full multi-actor orchestration problem.

## Problem
If replay variation depends only on scenario replacement, repeated play will still feel structurally repetitive inside one scenario. If variation is implemented by stronger actor independence, the runtime can lose control, increase orchestration overhead, and thin out persona density.

The missing product behavior is a local-first mechanism that can sometimes inject a temporary stakeholder angle into the main conversation without giving sidecars transcript ownership.

## Success Criteria
1. The runtime can produce different plausible stakeholder reactions across repeated plays of the same scenario.
2. Variation changes angle, concern priority, or reaction temperature without erasing the stable persona core of each stakeholder.
3. The main session remains the canonical owner of room state, visible transcript, and turn selection even when hidden variation helpers run.
4. Hidden variation helpers can expire quickly and do not permanently fork stakeholder identity.

## Scope
- In scope:
  - local whisper injection or similar bounded hidden runtime hinting
  - temporary stakeholder angle shifts tied to current topic, player move, or meeting state
  - replay variation rules that are machine-readable and testable
  - validation expectations for avoiding evaluator-like leakage from hidden helpers
- Out of scope:
  - default live remote multi-agent actor separation
  - scenario marketplace or large-scale scenario generation
  - variation that overrides canonical facilitator or orchestrator ownership

## Constraints
- Technical:
  - the main session must remain the canonical owner of room state and visible wording
  - hidden helpers must return bounded bias or angle signals rather than final transcript text
- Operational:
  - the approach must stay understandable enough for local-first debugging and replay validation
  - the repository should avoid reintroducing heavy orchestration cost as the default runtime posture
- Learning design:
  - variation should make meetings feel less repetitive, not less legible
  - stakeholders should remain people with stable roles, not random question generators

## Change Contract
- Allowed Changes:
  - define bounded hidden injection packets, lifetimes, and trigger rules
  - refine runtime contracts so sidecars shape actor attention without owning visible dialogue
  - add validation guidance for replay variation, persona preservation, and evaluator-boundary protection
- Forbidden Changes:
  - using hidden helpers as default next-speaker authorities
  - letting sidecars write final in-world dialogue directly
  - introducing randomness with no relation to current topic, role, or room state
- Approval Required:
  - replacing canonical local room-state ownership with distributed actor memory
  - turning live variation into full actor-runtime independence by default
- Validation:
  - repeated runs of the same scenario can differ in plausible ways
  - injected variation stays bounded and expires predictably
  - persona core remains recognizable across different runs
- Rollback:
  - revert the proposal together with linked runtime-spec updates that depend on whisper-style variation

## Open Questions
- [ ] What is the minimum whisper packet shape that changes a turn meaningfully without becoming a script?
- [ ] Which triggers should be deterministic, seeded, or state-derived rather than purely random?
- [ ] Should whisper injection be allowed to influence only the selected speaker, or also facilitator intervention choice in narrow cases?

## Evidence / References
- `docs/decisions/adr-20260321-local-first-runtime-and-multi-agent-scope.md`
- `docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md`
- `docs/intent-development/enabler-proposals/ep-intent-007-multi-agent-simulation-runtime-foundation.md`
- `docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md`
