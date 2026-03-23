# Enabler Proposal

- intent_id: intent-008
- title: Runtime Regression Validation Workflow
- owner: shared
- status: archived
- created_at: 2026-03-20
- updated_at: 2026-03-22
- related_decisions:
  - docs/decisions/adr-20260321-local-first-runtime-and-multi-agent-scope.md
- enables:
  - intent-001

## Archive Note
This proposal is preserved as historical exploration material from the frozen runtime carry-forward phase.

It should not be treated as current intent truth because:
- its `intent_id` collides with the active `intent-008` feature line for local whisper runtime variation
- it was never promoted into the current intent registry as an active enabler
- the current branch is validating local-whisper runtime behavior first, not reintroducing the frozen exploration workflow as an active enabler

If this validation workflow is reintroduced later, it should return under a new non-conflicting intent id.

## Purpose
Define the durable validation workflow needed so that runtime, prompt, and persona changes can be checked consistently before they create silent regressions in the local-first runtime.

## Problem
Without an explicit regression-validation workflow, prompt and persona tuning can drift into:
- untracked facilitator overuse
- actor voice collapse
- evaluator-language leakage
- broken runtime-readable asset loading
- unreviewed changes in session behavior

This risk is especially high because many future edits will be soft-behavior edits rather than obvious logic changes.
Optional remote-backed modes can add another layer of failure surface, so they should be validated through the same workflow rather than treated as the default center of the asset.

## Asset Definition
This enabler defines the repository's standard workflow for runtime regression validation.

It should become the durable reference for:
- which runtime checks must be run after prompt or persona changes
- which fixture and harness outputs matter
- which failures are hard failures versus soft regressions
- how repository-local skills and scripts should support repeated validation work

The initial asset boundary is:
- automated runtime contract tests for the local-first runtime
- player initialization and session-entry checks
- scripted fixture harness checks
- facilitator intervention fixture checks
- mock-adapter prompt preview checks
- evaluator output shape checks
- optional remote-backed smoke and full-session checks when remote execution is in use

Current working storage for this asset:
- `docs/intent-development/enabler-proposals/ep-intent-008-runtime-regression-validation-workflow.md`
- `docs/templates/playtest/runtime-playtest-note-template.md`
- `skills/runtime-regression-checks/SKILL.md`
- `skills/session-entry-checks/SKILL.md`
- `skills/playtest-initialize/SKILL.md`
- `skills/persona-tuning-checklist/SKILL.md`
- runtime test and fixture commands in `package.json`

## Success Criteria
1. Prompt and persona tuning work can reuse one validation workflow instead of inventing ad hoc checks.
2. Runtime changes are checked for both hard failures and common soft regressions.
3. Repository-local skills can point to this enabler as the source of truth for repeated regression checking.
4. Optional remote-backed modes remain covered without becoming the product center.

## Scope
- In scope:
  - runtime regression check workflow
  - repeated validation commands and review order
  - hard-failure and soft-regression distinctions
  - repository-local skill guidance for runtime checks
  - optional remote-backed mode coverage where relevant
- Out of scope:
  - production monitoring
  - full analytics infrastructure
  - replacing runtime implementation specs

## Operational Use
- How feature proposals should reference this asset:
  - state when runtime quality depends on repeated validation of prompt, persona, orchestration, or optional remote-backed behavior
- How UI specs should reference this asset:
  - state which visible conversation or post-game outputs require regression protection
- How implementation specs should reference this asset:
  - state which tests, harnesses, and fixtures should be run after runtime changes

## Change Contract
- Allowed Changes:
  - refine validation workflow steps
  - add new fixture checks as runtime coverage grows
  - sharpen pass/fail guidance for soft regressions
- Forbidden Changes:
  - reducing validation to only ad hoc human judgment
  - removing fixture and contract checks while prompt complexity increases
  - treating runtime-readable asset checks as optional
- Approval Required:
  - dropping automated runtime contract tests as a standard check
  - replacing repository-local validation guidance with undocumented habits
  - changing the workflow so persona and prompt tuning no longer require regression review
- Validation:
  - runtime validation steps are explicit and reusable
  - the skill and tests remain aligned with this enabler
  - tuning work can distinguish hard failure from soft regression
- Rollback:
  - revert this enabler together with dependent skill or workflow changes that assume it

## Open Questions
- [ ] Which additional soft-regression patterns should become fixtures next?
- [ ] When should fixture output review become part of CI rather than local-only workflow?
- [ ] Which remote-backed modes, if any, are worth keeping as explicit validation-only paths?

## Evidence / References
- `docs/intent-development/enabler-proposals/ep-intent-007-multi-agent-simulation-runtime-foundation.md`
- `docs/intent-development/implementation-specs/is-intent-001-runtime-observability-and-validation.md`
- `docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md`
- `tests/runtime/runtime-contracts.test.ts`
- `package.json`
