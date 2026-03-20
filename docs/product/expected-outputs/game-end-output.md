# Expected Output - Game End

- Product: pe-failure-lab
- Phase: game end
- Updated: 2026-03-19
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
- evaluate whether meaningful failure signals became visible
- evaluate whether the session advanced the right strategic discussion for the current phase
- avoid judging early-stage coalition and vision work as though operating contracts should already be fully fixed

## Fixed Output Format
The game-end output should follow a stable format across runs.
Do not vary the section structure from session to session unless the product contract changes.

The preferred format is:

```md
# Simulation Reflection Report: [Scenario] - [Role]

## 1. Overview
- Scenario:
- Role:
- Date:
- Session mode:
- Turn count:

## 2. Evaluation Summary
- Structural Progress: `x/5`
- Structural Result: `Stable | Strained | Drifting | Failed`

Summary:
- 2-4 sentences describing what moved forward, what stayed fragile, and what that score means.

## 3. Draft Progress
- `Fragmented | Advancing | Coalescing`
- Short explanation of how the draft changed during the session.

## 4. Key Decisions Made
- Major learner decisions, reframes, or boundary-setting moves.

## 5. Strengths Observed
- Concrete moments where the learner improved clarity, bounded support, or reduced drift.

## 6. Areas to Improve
- Concrete moments where ambiguity, support inflation, or structural fragility remained.

## 7. Suggested Next Steps
- The most useful next shaping moves or follow-up questions.

## 8. Optional Log Highlights
- Short excerpts or paraphrases only when they materially help reflection.
```

## Section Guidance
### 1. Overview
- scenario name
- learner role
- date
- session mode such as `brainstorming workshop`
- turn count or equivalent lightweight runtime count

### 2. Evaluation Summary
- use the CNCF Platform Engineering Maturity Model based structural progress as the primary score
- keep this to one score only: `Structural Progress: x/5`
- optionally add the qualitative structural result: `Stable`, `Strained`, `Drifting`, or `Failed`
- include only a short summary paragraph, not a second full evaluation layer
- score the session relative to its current phase: `Coalition -> Strategic Vision drafting`
- reward the learner for surfacing important failure signals and advancing strategic-level decisions on the day's active topic
- do not punish the learner merely because later-phase details such as named owners, full operating contracts, or incident paths are not yet fixed
- treat `3/5` as a credible, healthy result when the session made the right strategic issues visible and moved the draft forward at an early stage

Suggested score reading:
- `1/5`: the workshop did not surface the right structural signals and did not move the strategic draft meaningfully
- `2/5`: some relevant signals appeared, but the discussion stayed scattered, reactive, or strategically thin
- `3/5`: the workshop surfaced meaningful failure signals and achieved usable strategic movement for this phase
- `4/5`: the workshop produced strong strategic convergence while keeping boundaries and risks legible
- `5/5`: the workshop achieved unusually strong early-stage clarity, strategic alignment, and signal handling without pretending later-stage certainty

### 3. Draft Progress
- describe whether the workshop remained fragmented, advanced, or coalesced
- explain briefly how the draft changed through the session

### 4. Key Decisions Made
- important learner decisions
- important reframes
- important scope or ownership moves

### 5. Strengths Observed
- sound boundary moves
- useful stakeholder handling
- moments where collapse risk was reduced

### 6. Areas to Improve
- missed failure signals that should have been recognized in this phase
- ambiguity that blocked strategic movement on the active topic
- choices that increased structural fragility beyond what is acceptable for this phase

### 7. Suggested Next Steps
- the next 2-4 shaping moves that would improve structural soundness
- keep these practical and discussion-friendly

### 8. Optional Log Highlights
- timestamp or turn reference
- short excerpt or event summary
- why the moment mattered

## UX Requirements
- the first screen after game end must be legible in under 30 seconds for booth observers
- the output must support both quick skim and deeper facilitator-led discussion
- structural drift must be visible before detailed prose is read
- assessment language should remain analytical, not moralizing
- the evaluator tone should be encouraging but not coaching-heavy
- the close should not sound like a consultant upsell or a test proctor

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
