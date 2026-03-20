# Feature Proposal

- intent_id: intent-003
- title: End-of-Game Assessment, Feedback, and Discussion
- owner: shared
- status: draft
- created_at: 2026-03-17
- updated_at: 2026-03-21
- related_value_streams:
  - docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md
- related_intent: docs/intent-development/intents/in-intent-003-end-of-game-assessment-and-discussion.md
- related_enablers:
  - intent-000
- related_ui_spec: TBD

## Intent
Deliver a structured end-of-game output that turns a completed simulation into a scored, explainable, and discussable learning artifact.

## Problem
Without a strong game-end output, the session risks ending as "just a conversation." The product needs a reliable post-simulation package that shows what happened, why it mattered, and how the learner's choices affected structural risk.

## Success Criteria
1. Every completed simulation produces a consistent assessment package aligned with the expected game-end output.
2. Learners can understand both their judgment quality and the structural consequences of their decisions.
3. Facilitators or observers can use the output as the basis for feedback and follow-up discussion.

## Scope
- In scope:
  - end-of-game scoring or assessment structure
  - structural state summary
  - key decision and consequence mapping
  - post-game discussion prompts
- Out of scope:
  - finalizing the full scoring rubric in this proposal
  - building long-term learner history or analytics dashboards
  - replacing replay-specific feature work

## Constraints
- Technical:
  - the output must be generated from session evidence, not generic advice text
- Operational:
  - the first screen should work in both booth-demo and facilitator-led training contexts
- Learning design:
  - the output must explain systemic consequences, not only individual strengths and weaknesses

## Change Contract
- Allowed Changes:
  - define the structure and content of assessment output
  - define the flow from scoring to feedback to discussion
  - align output shape with future rubric and replay work
- Forbidden Changes:
  - generic performance feedback that ignores structural failure
  - assessment outputs that require hidden facilitator knowledge to understand
- Approval Required:
  - changing the game-end deliverable away from a structured learning artifact
- Validation:
  - output shape matches `docs/product/expected-outputs/game-end-output.md`
  - observers can explain the session outcome from the generated output alone
- Rollback:
  - revert assessment output specifications together with dependent UI or implementation docs

## Open Questions
- [ ] Which sections must always appear in the first booth-ready version?
- [ ] Should scoring be numeric, banded, or narrative in the earliest iteration?

## Evidence / References
- `docs/intent-development/intents/in-intent-003-end-of-game-assessment-and-discussion.md`
- `docs/product/vision.md`
- `docs/product/expected-outputs/game-end-output.md`
- `docs/intent-development/enabler-proposals/ep-intent-000-platform-engineering-failure-model.md`
- `docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md`
