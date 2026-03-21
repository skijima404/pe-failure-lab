# Skills Index

- updated_at: 2026-03-20
- purpose: repository-local skill index grouped by intent for durable discovery and reuse

## How To Use This Index
Use this file when deciding:
- which repository-local skill applies to the current task
- which validation or review workflow should run after a change
- which skills are linked to which Intent assets

This is an index only.
The source of truth for each skill remains its own `SKILL.md`.

## Intent-Linked Skill Map

### intent-000
- intent_title: Platform Engineering Failure Model
- skill: `failure-model-authoring`
  - path: `skills/failure-model-authoring/SKILL.md`
  - role: author or revise durable failure-model assets
  - use_when:
    - creating `success_criteria`, `symptom`, or `failure_mode` assets
    - converting rough notes into linked durable assets
- skill: `failure-model-review`
  - path: `skills/failure-model-review/SKILL.md`
  - role: review existing failure-model assets for abstraction drift and link integrity
  - use_when:
    - checking node quality
    - reviewing observable signals
    - validating frontmatter relation consistency

### intent-005
- intent_title: Failure Model Authoring Guidance
- skill: `failure-model-authoring`
  - path: `skills/failure-model-authoring/SKILL.md`
  - role: operational authoring workflow for failure-model assets
  - use_when:
    - applying the repository's failure-model authoring guidance
- skill: `failure-model-review`
  - path: `skills/failure-model-review/SKILL.md`
  - role: operational review workflow for failure-model assets
  - use_when:
    - validating authored nodes against repository guidance

### intent-006
- intent_title: GenAI-Assisted Failure Model Authoring Workflow
- skill: `failure-model-authoring`
  - path: `skills/failure-model-authoring/SKILL.md`
  - role: main execution skill for rough-note to linked-asset workflow
  - use_when:
    - running the assisted authoring flow
- skill: `failure-model-review`
  - path: `skills/failure-model-review/SKILL.md`
  - role: review pass after assisted authoring
  - use_when:
    - checking generated or revised failure-model assets

### intent-008
- intent_title: Runtime Regression Validation Workflow
- skill: `runtime-regression-checks`
  - path: `skills/runtime-regression-checks/SKILL.md`
  - role: standard regression workflow for runtime-affecting changes
  - use_when:
    - changing prompts
    - changing runtime-readable assets
    - changing reducers, orchestration, or facilitator behavior
- skill: `session-entry-checks`
  - path: `skills/session-entry-checks/SKILL.md`
  - role: focused regression workflow for initialization, start handling, and local opening flow
  - use_when:
    - changing player initialization
    - changing scene setup
    - changing session entry behavior
- skill: `playtest-initialize`
  - path: `skills/playtest-initialize/SKILL.md`
  - role: operational startup workflow before a live runtime playtest
  - use_when:
    - preparing to run a real-model playtest
    - checking `.env` and command readiness
    - needing to show the user the exact command they must run
- skill: `persona-tuning-checklist`
  - path: `skills/persona-tuning-checklist/SKILL.md`
  - role: qualitative checklist for persona and prompt tuning
  - use_when:
    - checking information leakage
    - checking voice separation
    - checking facilitator restraint

## Suggested Usage Order

### Runtime Work
1. `runtime-regression-checks`
2. `session-entry-checks` when entry flow changed
3. `persona-tuning-checklist` when persona or prompt quality changed

### Failure-Model Work
1. `failure-model-authoring`
2. `failure-model-review`

## Current Coverage Notes
- No repository-local skill is currently indexed specifically to `intent-001` because the active runtime implementation skills are presently anchored to the reusable validation enabler `intent-008`.
- `intent-007` currently contributes implementation foundation, but not a separate repository-local skill yet.

## Maintenance Rule
When adding a new repository-local skill:
1. link it to at least one Intent or Enabler
2. add it to this index
3. keep the mapping aligned with `docs/intent-development/intent-registry.md`
