# Value Stream

- intent_id: intent-001
- title: Simulation Session to Reflection
- owner: shared
- status: draft
- created_at: 2026-03-17
- updated_at: 2026-03-21
- related_intents:
  - docs/intent-development/intents/in-intent-001-simulation-core-loop.md
- related_enablers:
  - intent-000
- related_feature_proposals:
  - intent-001
  - intent-002
  - intent-003
  - intent-004

## Objective
Describe the end-to-end value flow from scenario entry through roleplay, scoring, feedback, and discussion so feature work can be traced against a coherent user journey.

## Entry Condition
- learner or demo facilitator starts a Platform Engineering scenario
- a scenario contains stakeholder pressures and possible failure trajectories
- the system is ready to track structural state changes during interaction

## Value Flow
1. Scenario framing:
   learner chooses or is assigned a role, scenario, and starting context.
2. Live simulation:
   stakeholder interaction begins and pressure emerges through conversation.
3. Structural drift observation:
   the system tracks scope, tension, role ambiguity, and related signals as the learner responds.
4. Session closure:
   the simulation reaches a stopping point through time limit, turn limit, explicit collapse, or managed exit.
5. Assessment output:
   the system generates a game-end package with structural summary, judgment assessment, and failure pattern matches.
6. Feedback and discussion:
   learner and facilitator inspect why the situation evolved as it did and discuss alternatives.
7. Replay and learning carryover:
   important turns and state shifts can be revisited for reflection, coaching, or demonstration.

## User Value by Stage
- Scenario framing:
  - the learner understands the stakes quickly
  - a booth observer can infer what is being simulated
- Live simulation:
  - the learner experiences pressure, ambiguity, and trade-offs rather than abstract theory
- Structural drift observation:
  - failure becomes visible before explicit collapse
- Assessment output:
  - the learner can see both local decisions and systemic consequences
- Feedback and discussion:
  - the session becomes a learning instrument rather than a one-off performance
- Replay and learning carryover:
  - the scenario becomes reusable for training, analysis, and demo storytelling

## Critical Product Bets
- precise failure patterns make the simulation feel real rather than generic
- strong visual surfaces make structural change legible to observers in real time
- game-end output converts conversation into durable learning value

## Failure Modes in the Value Stream
- the scenario is too generic, so stakeholders feel like arbitrary chat turns
- structural drift is hidden, so observers only see conversation
- end-of-game output is vague, so the session feels like subjective commentary
- the visual surface is flat, so the booth or demo experience lacks clarity and energy

## Required Supporting Assets
- `docs/intent-development/intents/in-intent-001-simulation-core-loop.md`
- `docs/product/vision.md`
- `docs/product/expected-outputs/game-end-output.md`
- `docs/intent-development/enabler-proposals/ep-intent-000-platform-engineering-failure-model.md`
