# Development Memo

- memo_id: dm-20260324-clarification-turn-handling-direction
- title: Clarification Turn Handling Direction
- owner: shared
- status: draft
- created_at: 2026-03-24
- updated_at: 2026-03-24
- related_intent:
  - docs/intent-development/intents/in-intent-001-simulation-core-loop.md
- related_feature_proposal:
  - docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_runtime_specs:
  - docs/intent-development/implementation-specs/is-intent-001-local-first-live-actor-generation.md
  - docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md

## Purpose
Record the architecture direction for clarification-style player turns in the local-first live runtime.

## Problem
The current local live actor path can answer clarification-style player turns with repeated persona-pressure reactions rather than contentful answers.

This failure mode appears when:
- the player asks for background or clarification
- turn routing keeps the current stakeholder engaged
- local live actor rendering stays in a generic reaction posture

The result is structurally consistent but conversationally unnatural dialogue.

## Decision
Clarification-style player turns should be treated as a first-class runtime mode rather than as ordinary stakeholder reaction turns.

The live runtime should distinguish at least:
- `answer mode`
- `reaction mode`

## Direction
### 1. Clarification intent is a control signal
`main_session_judgment.last_player_intent` should be allowed to influence live actor realization, not only routing and evaluation.

At minimum, these intent families should be treated specially:
- background clarification
- trigger alignment
- concrete example request
- scope clarification

### 2. Answer-capable role should respond
Clarification handling should prefer the role best positioned to answer:
- facilitator for trigger/background alignment that belongs to room framing
- currently engaged stakeholder for role-local clarification
- another stakeholder only when the requested content clearly belongs to that role

### 3. Content answer before stance
When the player asks for clarification, the visible turn should:
1. answer or frame the requested content
2. optionally add one bounded concern or condition

The runtime should avoid opening with repeated persona-pressure warnings when the player's immediate intent is informational.

## Minimal Implementation Path
1. Add regression tests for clarification and background-request turns.
2. Introduce `answer mode` in local live actor rendering.
3. Route `trigger-alignment` and similar framing requests to facilitator recap.
4. Keep role-specific clarification with the engaged stakeholder when appropriate.
5. Let stance remain secondary to the content answer in `answer mode`.

## What This Does Not Require
- a full multi-agent redesign
- abandoning local-first runtime ownership
- replacing the actor renderer with remote generation
- treating every question as facilitator-owned

## Follow-up
- refine the list of clarification intent classes if repeated play shows more cases
- decide whether explanation-capable routing should become explicit in orchestration rather than implicit in actor rendering
