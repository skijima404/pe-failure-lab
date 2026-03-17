# Feature Proposal

- intent_id: intent-004
- title: Demo-Grade Live Simulation Surface
- owner: shared
- status: draft
- created_at: 2026-03-17
- updated_at: 2026-03-17
- related_enablers:
  - intent-000
- related_ui_spec: TBD

## Intent
Design a live simulation surface that makes pressure, state change, and failure emergence immediately legible and compelling in demos, booths, and presentations.

## Problem
Even if the simulation logic is strong, the product will underperform in demos if observers only see a plain chat log. This product needs a screen that makes structural drift and stakeholder pressure visible at a glance.

## Success Criteria
1. An observer can understand the scenario, active pressures, and current risk state within a few seconds.
2. The screen makes the simulation feel like a deliberate system, not a generic chatbot.
3. The live surface supports both user immersion and audience comprehension during a short demo.

## Scope
- In scope:
  - live simulation presentation model
  - structural state visibility during roleplay
  - demo-oriented layout and information hierarchy
  - transitions from live session to game-end output
- Out of scope:
  - final visual design system for every future screen
  - replacing scenario quality or assessment quality with visual polish alone
  - full marketing site or unrelated brand work

## Constraints
- Technical:
  - the surface must work with real-time or turn-based state updates
- Operational:
  - the screen should remain understandable on projected displays and standard laptop screens
- Learning design:
  - visual emphasis must support the failure thesis, not distract from it

## Change Contract
- Allowed Changes:
  - define screen goals, panels, and visual emphasis for live play
  - define how structural signals appear during the session
  - optimize for observer comprehension and demo energy
- Forbidden Changes:
  - plain-chat-only presentation for the primary demo surface
  - visual spectacle that obscures the meaning of state change
- Approval Required:
  - major changes to the primary presentation mode of the product
- Validation:
  - an observer can explain the current state of the session without reading the full transcript
  - the screen clearly distinguishes stakeholder interaction from structural state
- Rollback:
  - revert live-surface specs together with linked UI docs if the presentation model changes

## Open Questions
- [ ] Which live metrics or signals are essential enough to stay visible at all times?
- [ ] How much motion or animation is useful before it starts reducing clarity?

## Evidence / References
- `docs/product/vision.md`
- `docs/product/expected-outputs/game-end-output.md`
- `docs/intent-development/enabler-proposals/ep-intent-000-platform-engineering-failure-model.md`
- `docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md`
