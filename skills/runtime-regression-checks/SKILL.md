---
name: runtime-regression-checks
description: Use when changing multi-agent runtime prompts, persona slices, facilitator behavior, reducers, or runtime-readable assets in this repository and you need to run the standard regression workflow to catch hard failures and soft conversation-quality regressions.
---

# Runtime Regression Checks

Use this skill after runtime-affecting changes, especially:
- persona tuning
- facilitator prompt changes
- actor prompt changes
- reducer or orchestration changes
- runtime-readable asset changes under `docs/product/personas/runtime/`
- runtime-readable setup changes under `docs/product/concepts/runtime/`
- player initialization, start-signal, or opening-flow changes

This skill operationalizes:
- `docs/intent-development/enabler-proposals/ep-intent-008-runtime-regression-validation-workflow.md`
- `docs/intent-development/implementation-specs/is-intent-001-runtime-observability-and-validation.md`
- `docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md`

## Required Commands
Run these in order:

1. `npm run test:runtime`
2. `npm run fixture:initialization`
3. `npm run fixture:session-driver`
4. `npm run fixture:scripted`
5. `npm run fixture:facilitator`
6. `npm run fixture:mock-adapter`
7. `npm run fixture:evaluator`

Stop early only if a hard failure makes later checks meaningless.

## Hard Failure Checks
Treat these as blocking:
- any failing test in `npm run test:runtime`
- fixture mismatch count not equal to `0`
- initialization brief missing player-facing start guidance
- session driver accepting invalid start input or failing to enter live flow after a valid start signal
- runtime-readable persona asset failing to load
- evaluator output missing primary `x/5` structural result
- harness execution errors

## Soft Regression Checks
Review these from fixture output:
- initialization brief shows allowed moves and hidden-information boundary clearly
- session driver shows `initialization -> opening -> live turn` in that order
- session opening uses `delivery_mode: local-opening` rather than calling the model adapter
- facilitator is selected only for a natural intervention reason
- actor prompt preview shows persona-specific concern and voice cues
- facilitator prompt preview shows non-coaching restraint
- mock-adapter output reflects persona-derived concern rather than generic text only
- evaluator output still reads like workshop reflection rather than live-room coaching

## Review Output
After running the workflow, summarize:
- what changed
- which commands passed
- any soft regressions observed
- whether follow-up tuning is needed

Use concise wording.
Prefer explicit statements such as:
- `hard failures: none`
- `soft regression risk: facilitator language becoming too directive`

## Do Not Skip
- Do not skip `fixture:facilitator` after changing Mika or facilitator rules.
- Do not skip `fixture:initialization` or `fixture:session-driver` after changing player entry assumptions, start handling, or local opening behavior.
- Do not skip `fixture:mock-adapter` after changing prompt builders or persona slices.
- Do not skip `fixture:evaluator` after changing evaluator logic or structural state behavior.
