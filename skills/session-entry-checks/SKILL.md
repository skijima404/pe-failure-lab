---
name: session-entry-checks
description: Use when changing player initialization, scene setup, start-signal handling, or local opening flow in this repository and you need a focused workflow to verify the session entry path remains stable and spoiler-safe.
---

# Session Entry Checks

Use this skill after changing:
- `docs/product/concepts/runtime/mvp-scene-setup.md`
- `docs/product/concepts/runtime/mvp-player-initialization.md`
- loaders under `runtime/scene/`
- initialization helpers under `runtime/execution/initialization.ts`
- session-entry orchestration such as start-signal handling or local opening behavior

This skill operationalizes:
- `docs/intent-development/enabler-proposals/ep-intent-008-runtime-regression-validation-workflow.md`
- `docs/intent-development/development-memos/dm-intent-001-runtime-asset-boundary.md`

## Required Commands
Run these in order:

1. `npm run test:runtime`
2. `npm run fixture:initialization`
3. `npm run fixture:session-driver`

## Hard Failure Checks
Treat these as blocking:
- any failing runtime test
- initialization brief missing session purpose, workshop goal, or allowed moves
- initialization brief leaking hidden thresholds as player-known guidance
- invalid start input being accepted
- valid start input failing to enter live session
- session opening failing to use `delivery_mode: local-opening`

## Soft Regression Checks
Review these from fixture output:
- the initialization brief helps the player start without over-explaining the whole scenario
- the player-facing boundary of “what you are not expected to know” is explicit
- the start-to-live transition feels legible rather than mechanical
- Mika's opening is short, goal-aware, and not coach-like
- the flow looks like `initialization -> opening -> player articulation`

## Review Output
Summarize using:
- `hard failures: ...`
- `entry-flow risks: ...`
- `opening quality notes: ...`
- `recommended next move: ...`

Keep it short and concrete.

## Important Rule
Do not improve the opening by making it longer or more strategic than the scenario needs.

Reject a change if it:
- turns initialization into a spoiler briefing
- makes Mika act like a hidden coach before the meeting starts
- removes the player's burden to state the direction in their own words
- weakens the distinction between entry framing and live facilitation
