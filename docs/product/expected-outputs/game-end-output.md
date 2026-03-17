# Expected Output - Game End

- Product: pe-failure-lab
- Phase: game end
- Updated: 2026-03-17
- Reference pattern: `skill-assessment` reflection and report flow

## Purpose
Define the standard end-of-game output so the product has a stable answer to:

- what the learner receives when the simulation ends
- what an observer can understand immediately
- what the system must score, explain, and support through discussion

## Design Direction
The reusable interaction backbone comes from `skill-assessment`:

- roleplay phase does not leak evaluation commentary
- game end triggers a structured assessment output
- structured assessment is followed by feedback and discussion

The part that must change for `pe-failure-lab` is the evaluation content:

- shift from generic skill scoring to Platform Engineering failure analysis
- evaluate structural drift, scope control, and boundary management
- make failure emergence visible, not only participant strengths and weaknesses

## Expected End-of-Game Package
The game-end output should contain all of the following.

### 1. Session Overview
- scenario name
- learner role
- time or turn count
- overall session result
- current structural risk level

### 2. Failure Trajectory Summary
- short explanation of how the session evolved
- whether failure was avoided, delayed, accelerated, or normalized
- major inflection points in the session

### 3. Structural State Summary
- scope expansion level
- backlog pressure level
- dependency concentration level
- stakeholder tension level
- role ambiguity level
- collapse risk level

This section should make state visible at the end and, when possible, indicate how it changed during the session.

### 4. Judgment Assessment
- scope control
- goal alignment
- stakeholder navigation
- sustainability of decisions

This is the area where a future `pe-failure-lab` rubric will plug in.

### 5. Key Decisions and Their Consequences
- important learner decisions
- immediate local benefit or rationale
- longer-term structural consequence

This section is critical because the product thesis depends on showing how reasonable local choices can create systemic failure.

### 6. Failure Pattern Matches
- which Platform Engineering failure patterns appeared
- evidence from the session
- severity or confidence of each match

This is where precise failure-pattern work will matter most.

### 7. Strengths Observed
- sound boundary moves
- useful stakeholder handling
- moments where collapse risk was reduced

### 8. Areas for Improvement
- missed boundary defenses
- ambiguity left unresolved
- choices that increased structural fragility

### 9. Suggested Discussion Prompts
- where should the learner have drawn the line earlier?
- which stakeholder expectation should have been reframed?
- what would a more sustainable next move look like?

### 10. Supporting Replay Highlights
- timestamp or turn reference
- short excerpt or event summary
- why the moment mattered

## UX Requirements
- the first screen after game end must be legible in under 30 seconds for booth observers
- the output must support both quick skim and deeper facilitator-led discussion
- structural drift must be visible before detailed prose is read
- assessment language should remain analytical, not moralizing

## Reuse Boundary from `skill-assessment`
- Reuse:
  - phase separation between roleplay and reflection
  - report-plus-discussion interaction model
  - structured markdown-style assessment package
- Do not reuse as-is:
  - existing rubric categories
  - generic skill-evaluation framing
  - role-specific language from the prior assessment product

## Downstream Impact
This document should shape:

- feature proposals for assessment, replay, and demo surfaces
- future enablers for judgment rubric and structural state model
- UI specs for game end, facilitator review, and observer mode
