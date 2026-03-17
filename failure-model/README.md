# Failure Model

This directory stores the graph-shaped knowledge assets that define how `pe-failure-lab` models organizational failure in Platform Engineering.

## Structure
- `success-criteria/`: success conditions, currently aligned with Kotter 8 Steps
- `symptoms/`: observable risk states that threaten success criteria
- `failure-modes/`: decision patterns that contribute to symptoms

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
