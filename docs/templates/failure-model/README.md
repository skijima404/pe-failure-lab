# Failure Model Templates

Purpose: define reusable markdown formats for the graph-shaped failure model assets used by `pe-failure-lab`.

These templates are intentionally stored outside the final domain location so the storage structure can be decided later without changing the schema first.

## Asset Types
- `success-criteria-template.md`: success states derived from Kotter 8 Steps
- `symptom-template.md`: observable risk states that threaten success criteria
- `failure-mode-template.md`: decision patterns that contribute to symptoms

## Intended Relationship Pattern
- Success Criteria use `threatened_by` for backward links to Symptoms
- Symptoms use `threatens` for forward links to Success Criteria
- Symptoms use `triggered_by` for backward links to Symptoms or Failure Modes
- Symptoms use `triggers` for forward links to Symptoms
- Failure Modes use `triggers` for forward links to Symptoms
- Failure Modes use `leads_to` and `leads_from` for Failure Mode to Failure Mode chains
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
- Use stable ids such as `sc-001`, `rf-001`, and `fm-001`
- Keep relation names consistent so the documents can later be projected into a graph or read bidirectionally by GenAI
- Prefer observable, state-based descriptions over abstract labels
- Keep the authoring flow explicit: `Success Criteria -> Symptom -> Consequence -> Failure Mode`
- Write `Failure Mode` entries as observable judgment patterns in conversation or decision-making, not just as abstract root-cause labels
