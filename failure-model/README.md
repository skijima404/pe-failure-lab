# Failure Model

This directory stores the graph-shaped knowledge assets that define how `pe-failure-lab` models organizational failure in Platform Engineering.

## Structure
- `success-criteria/`: success conditions, currently aligned with Kotter 8 Steps
- `symptoms/`: observable risk states that threaten success criteria
- `failure-modes/`: decision patterns that contribute to symptoms
- `cross-cutting-principles/`: reusable principles that explain recurring concerns across multiple steps

## Relationship Model
- Success Criteria use `threatened_by` for backward links to Symptoms
- Symptoms use `threatens` for forward links to Success Criteria
- Symptoms use `triggered_by` for backward links to Symptoms or Failure Modes
- Symptoms use `triggers` for forward links to Symptoms
- Failure Modes use `triggers` for forward links to Symptoms
- Failure Modes use `leads_to` and `leads_from` for Failure Mode chains
- Symptoms should include their likely Consequences

## Frontmatter Link Rules

### Node Types
- `success_criteria`
- `symptom`
- `failure_mode`
- `cross_cutting_principle`

### Forward Causality
- `failure_mode -> symptom`: `triggers`
- `symptom -> symptom`: `triggers`
- `symptom -> success_criteria`: `threatens`
- `failure_mode -> failure_mode`: `leads_to`

### Backward Explanation
- `success_criteria -> symptom`: `threatened_by`
- `symptom -> symptom`: `triggered_by`
- `symptom -> failure_mode`: `triggered_by`
- `failure_mode -> failure_mode`: `leads_from`

## Notes
- These files are intended to function as durable product assets, not temporary notes
- Stable ids should be used so the set can later be projected into a graph
- Templates live in `docs/templates/failure-model/`
- Recommended authoring order is `Success Criteria -> Symptom -> Consequence -> Failure Mode`
- `Failure Mode` is the repository term corresponding to the causal role often called `Root Cause` in other graph models
- Because Platform Engineering change is assumed to require long-term compounding, the model should pay particular attention to failures that break continuity, reinforcement, sponsorship memory, adoption durability, or the ability to keep going over time
- Cross-cutting principles should be used when the same concern recurs across multiple steps and repeating the full rationale inside each step-local node would create unnecessary duplication
- Kotter-aligned steps should not be interpreted as a strict one-pass sequence; later outcomes such as short-term wins may be used deliberately to reinforce earlier success criteria such as urgency, legitimacy, sponsorship, or investment confidence
- Scoring or simulation logic should therefore allow evidence from later stages to strengthen the judged condition of earlier stages when that reinforcement is explicitly part of the strategy

## Current Product Positioning
- This failure model should currently be interpreted primarily as a `Level 1 escape game` against the CNCF Platform Engineering Maturity Model, especially the `Provisional` stage
- In this repository, `failure` most often means remaining trapped in Level 1 patterns such as voluntary or temporary effort, reactive support behavior, weak product thinking, weak adoption structure, weak measurement, and weak continuity
- Correspondingly, the model should prioritize failures that prevent an organization from establishing the minimum foundations needed to escape Level 1 and move toward Level 2 `Operationalized`
- Higher-maturity concerns may still appear, but they are secondary unless they materially affect the ability to build the Level 2 foundation
