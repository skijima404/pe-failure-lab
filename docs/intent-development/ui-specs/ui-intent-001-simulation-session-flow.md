# User Interaction Spec

- intent_id: intent-001
- title: Simulation Session Flow
- owner: shared
- status: draft
- created_at: 2026-03-17
- updated_at: 2026-03-21
- related_value_streams:
  - docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md
- related_intent: docs/intent-development/intents/in-intent-001-simulation-core-loop.md
- related_feature_proposal: docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_enablers:
  - intent-000

## UX Intent
Enable a learner to feel escalating Platform Engineering pressure through interaction while making structural drift visible early enough for reflection and judgment.

The interaction should remain viable when the scene is run as a brainstorming workshop rather than as a purely verbal approval meeting.

## User Flows
1. Session start -> learner selects scenario and role -> receives context, starting constraints, and optionally a short brief or visible card -> begins stakeholder interaction
2. Stakeholder brainstorming develops -> learner clarifies, reframes, bounds commitments, or redirects rough ideas under pressure -> system updates visible structural signals -> learner adjusts strategy
3. Session end -> learner reviews replay and assessment summary -> identifies where boundaries held or failed

## Screen / Component Scope
- Screens:
  - scenario entry
  - live simulation session
  - reflection and replay summary
- Components:
  - role and scenario brief
  - optional one-page brief or scope / ownership card
  - stakeholder conversation panel
  - structural state indicator panel
  - reflection summary
- States:
  - ready
  - in session
  - escalated risk
  - session complete

## Interaction Rules
- Primary actions:
  - choose a role and scenario
  - respond to stakeholders
  - refer back to brief or visible scope information when present
  - inspect structural state changes
  - review replay and assessment
- Validation and error behavior:
  - prevent starting without an explicit role and scenario
  - preserve conversation state if a model call or state update fails
- Empty, loading, and failure states:
  - scenario entry shows available simulations and intended learning focus
  - in-session loading should preserve conversational continuity
  - failure states should distinguish system failure from simulation collapse
  - when a scenario depends on visible framing, the session should show that framing before live dialogue starts

## Content / Copy Notes
- Labels:
  - emphasize role, pressure, structural risk, and boundary choices
- Helper text:
  - explain that decisions are evaluated for sustainability, not only speed or helpfulness
  - explain that the goal is a believable workshop, not perfect turn-by-turn efficiency
  - explain when the current scene is a brainstorming workshop rather than a final approval meeting
- Reflection prompts:
  - where did scope expand?
  - which stakeholder pressure changed your operating model?
  - which boundary should have been clarified or defended earlier?
  - which unresolved items were valid follow-up work, and which ones hid structural drift?
  - which participant ideas were useful, and which ones sounded plausible but pulled the draft in the wrong direction?

## Accessibility and Quality Notes
- Keyboard and focus:
  - all primary session actions must be keyboard accessible
- Contrast and readability:
  - structural risk indicators should remain legible under pressure and on projected demo screens
- Responsive behavior:
  - session flow must remain usable on laptop-sized booth setups and standard desktop screens

## Acceptance Checks
1. A learner can complete a full simulation session from scenario entry to reflection without losing context.
2. Structural state changes are visible during the interaction, not only after the session ends.
3. The end-of-session view links observable outcomes back to concrete learner decisions and stakeholder exchanges.
4. A scenario that depends on visible framing can supply a short brief or scope card without breaking the session flow.
