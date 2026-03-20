---
name: persona-tuning-checklist
description: Use when tuning stakeholder or facilitator personas, prompt wording, or runtime-readable persona assets in this repository and you need a fixed review checklist for voice separation, hidden-information leakage, and over-instrumented behavior.
---

# Persona Tuning Checklist

Use this skill after changing:
- runtime persona slices under `docs/product/personas/runtime/`
- actor prompt wording
- facilitator prompt wording
- prompt-rendering logic
- persona-loading logic

This skill operationalizes:
- `docs/intent-development/enabler-proposals/ep-intent-008-runtime-regression-validation-workflow.md`
- `docs/intent-development/implementation-specs/is-intent-001-runtime-observability-and-validation.md`
- `docs/intent-development/development-memos/dm-intent-001-runtime-asset-boundary.md`

## First Run The Regression Workflow
Before using this checklist, run:

1. `npm run test:runtime`
2. `npm run fixture:scripted`
3. `npm run fixture:facilitator`
4. `npm run fixture:mock-adapter`
5. `npm run fixture:evaluator`

If hard failures exist, fix them before doing qualitative persona review.

## Checklist
Review the changed output and prompt previews for these questions.

### Voice Separation
- Does each stakeholder sound distinguishable before their domain topic is fully explicit?
- Do sentence rhythm, framing style, and concern emphasis differ across personas?
- Has any persona drifted into generic enterprise-skeptic language?

### Information Discipline
- Is the persona speaking only from its own visible concern and local understanding?
- Is the persona receiving hidden operating logic it does not need?
- Does the persona sound like it knows scoring, orchestration, or structural-state internals?

### Leakage Checks
- Is evaluator language leaking into live actor turns?
- Is facilitator-only knowledge leaking into stakeholder turns?
- Is orchestration logic leaking into natural dialogue, such as sounding like explicit traffic control?
- Is there any sign that runtime-readable assets now expose more information than the role should have?

### Meeting Naturalness
- Does the stakeholder react naturally before analytical pressure when appropriate?
- Is the actor asking one main thing rather than stacking an oral-exam prompt?
- Does the room still allow stance movement instead of one-question verdict turns?

### Facilitator Restraint
- Does Mika protect goal, layer, and topic without becoming a hidden coach?
- Does Mika avoid repairing weak Platform Engineering content?
- Does Mika avoid acting like a shadow evaluator or domain expert?

### Structural Safety
- Is important structural pressure still visible?
- Has persona softening accidentally removed meaningful failure signal exposure?
- Has realism improved without flattening the learning value of the scene?

## Soft Regression Flags
Call these out explicitly if they appear:
- `voice-collapse`
- `evaluator-language-leakage`
- `facilitator-overreach`
- `actor-knows-too-much`
- `generic-skepticism`
- `rubric-speaker-tone`
- `traffic-control-dialogue`

## Review Output Format
Summarize using:
- `hard failures: ...`
- `soft regression risks: ...`
- `persona-specific notes: ...`
- `recommended next tuning move: ...`

Keep the output short and concrete.

## Important Rule
Do not treat smoother dialogue as automatically better.

Reject a tuning change if it:
- hides structural pressure that should remain visible
- gives a persona information it should not have
- makes a stakeholder sound like the operating team behind the simulation
- turns Mika into the person who prevents failure instead of surfacing legible meeting flow
