# Development Memo

- id: dm-20260322-frozen-runtime-exploration-carry-forward-plan
- title: Frozen runtime exploration branch and carry-forward plan for main
- status: active
- created_at: 2026-03-22
- related_branch_refs:
  - local: `codex/frozen-multi-agent-runtime-foundation-20260322`
  - source_local: `codex/multi-agent-runtime-foundation`
  - source_remote: `origin/codex/multi-agent-runtime-foundation`
- source_commit: `b194c326a1dce5ce4dd07106af517f172ee40441`
- related_intent:
  - `docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md`
- related_learning_threads:
  - local-first live runtime is easier to observe and explain than remote-heavy live routing
  - facilitator stability matters more than remote actor separation
  - player input packaging quality can dominate perceived conversation quality
  - `multi_perspective_needed` is safer as an intervention signal than as a strong routing override

## Purpose
Preserve the exploratory value of the frozen runtime branch without treating that branch as current implementation truth for `main`.

This memo exists to prevent two failure modes:
- losing the architectural learning and repo-structure gains from the exploration branch
- accidentally treating the frozen branch as the preferred implementation base for current work

## Frozen Branch Rule
The following branch is preserved as an archive of a completed exploration:
- `codex/frozen-multi-agent-runtime-foundation-20260322`

Interpretation:
- preserve it for reading, comparison, cherry-picking, and traceability
- do not treat it as the default base branch for new runtime implementation work
- do not resume day-to-day implementation there unless a new explicit decision says so

Current implementation base:
- `main`

## What Should Be Carried Forward
Carry forward durable assets, operating rules, and architecture learning before carrying forward implementation complexity.

### Priority A: carry into `main` first
Repository-structure and operating assets that remain valid even if the runtime implementation is restarted from a simpler local base.

Recommended carry-forward candidates:
- `AGENTS.md`
- `docs/decisions/README.md`
- `docs/decisions/_template.md`
- `docs/decisions/adr-20260321-local-first-runtime-and-multi-agent-scope.md`
- `docs/intent-development/intents/`
- `docs/intent-development/enabler-proposals/ep-intent-007-multi-agent-simulation-runtime-foundation.md`
- `docs/intent-development/enabler-proposals/ep-intent-008-runtime-regression-validation-workflow.md`
- `docs/intent-development/implementation-specs/is-intent-001-mvp-multi-agent-runtime-design.md`
- `docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md`
- `docs/intent-development/implementation-specs/is-intent-001-runtime-observability-and-validation.md`
- `docs/intent-development/development-memos/dm-intent-001-runtime-asset-boundary.md`
- `docs/templates/playtest/runtime-playtest-note-template.md`
- `docs/operations/global-traceability-operating-model-notes.md`
- repo-local skills that reinforce runtime validation and playtest discipline

Reason:
- these assets improve repo strength, traceability, and AI-native operating discipline without re-importing unstable runtime behavior

### Priority B: preserve as learning history
Exploration artifacts that should remain readable but should not be treated as current truth.

Recommended preserve-only candidates:
- `docs/intent-development/development-memos/dm-intent-001-conversation-naturalness-multi-agent-playtest-notes.md`
- `docs/intent-development/development-memos/dm-intent-001-multi-agent-runtime-implementation-map.md`
- `docs/intent-development/development-memos/dm-intent-001-remote-multi-agent-runtime-refactor-handoff.md`

Reason:
- these explain why certain implementation directions became too complex, too remote-heavy, or too hard to observe
- they should inform future work without pulling `main` back toward the same shape by inertia

### Priority C: defer until `main` has a stable fully-local runtime again
Implementation-heavy assets that should only be reintroduced selectively.

Defer for now:
- `runtime/`
- `scripts/`
- `package.json`
- remote-backed harness wiring
- sidecar routing logic
- model-backed player-turn judgment code

Reason:
- the current `main` branch is intentionally simpler
- the next product need is to improve the fully-local conversation loop before reintroducing architecture substrate from the exploration branch

## Carry-Forward Principles
When migrating from the frozen branch into `main`:

1. carry durable structure before carry runtime logic
2. carry accepted decisions before carry experiments
3. prefer docs, templates, and repo rules over code
4. do not re-import remote-heavy runtime assumptions by default
5. treat the frozen branch as a reference shelf, not as active truth

## Accepted Learning To Keep
The following learning should survive even if the implementation is simplified again:
- local-first live runtime is the correct default center of gravity
- facilitator control should stay highly observable and preferably local
- player-turn judgment needs an explicit boundary, even if the implementation behind it changes
- `multi_perspective_needed` should stay conservative
- long-form player input handling is a first-order runtime concern, not a minor UX detail
- context design and stakeholder selection should be revisited before adding more conversation richness

## Immediate Next-Step Recommendation
Use `main` as the active implementation branch.

Then, in order:
1. carry Priority A assets into `main`
2. keep Priority B artifacts as clearly historical learning
3. rebuild only the minimum fully-local runtime behavior needed for stable playtests
4. reconsider which pieces of the frozen branch are still justified after the local loop works well enough
