# Architecture Review Checklist

- checklist_id: architecture-review-checklist
- title: Runtime Architecture Review Checklist
- owner: shared
- status: draft
- created_at: 2026-03-24
- updated_at: 2026-03-24
- related_runtime_specs:
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md
  - docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md
  - docs/intent-development/implementation-specs/is-intent-001-local-first-live-actor-generation.md
- related_memo:
  - docs/intent-development/development-memos/dm-20260324-production-runtime-reset-direction.md

## Purpose
Use this checklist after implementation work to verify that runtime changes did not collapse product architecture boundaries.

## Review Questions
1. Product vs verification boundary
- Do product-facing flows stay under `scripts/production/`?
- Do verification-only flows stay under `scripts/verification/`?
- Do product runtime modules avoid imports from `runtime/verification/`?

2. Runtime ownership
- Does canonical state still live under `runtime/state/`?
- Does turn selection still live under `runtime/orchestration/`?
- Does execution coordinate turns without becoming a second orchestration layer?

3. Conversation generation boundary
- Is live actor phrasing generated from actor runtime input rather than deterministic verification renderers?
- Did the change avoid hard-coding full-sentence turn templates as the primary product behavior?
- Are persona and topic fit still stronger than hidden variation hints?

4. Evaluation boundary
- Is evaluation still derived from transcript and state evidence?
- Did the change avoid pushing evaluation requirements directly into every live utterance?
- Are scoring, report, and reflection concerns still outside in-world actor speech?

5. Production-first direction
- Does the change improve or preserve the path toward a demo-grade production artifact?
- If mocks or deterministic assets were introduced, are they clearly support-only?
- If OpenAI-backed behavior was touched, does the change still preserve local-first as the primary runtime stance?

## Review Output
Summarize findings in this shape:

- `pass`
  - architecture boundaries preserved
- `risk`
  - list any weak boundary or coupling introduced
- `follow-up`
  - list required cleanup before merge or demo use
