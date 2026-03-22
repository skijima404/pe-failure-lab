# Runtime Playtest Note Template

- asset_type: playtest-note-template
- purpose: lightweight human-readable note format for runtime playtests
- related_enabler: intent-008
- related_feature: intent-001
- updated_at: 2026-03-21

## Use
Use this template after a mock-adapter, scripted, or real-model playtest when you want a short record of:
- what was tested
- what failed or felt wrong
- which turns mattered
- what should be tuned next

This template is intentionally light.
It is not a replacement for turn logs or debug dumps.

## Template
```md
# Playtest Note

- session_id:
- date:
- runtime_mode:
  - scripted
  - mock-adapter
  - openai-adapter
- scenario:
- tester:

## Hard Failures
- none | ...

## Soft Regression Risks
- none | ...

## Notable Turns
- turn N:
  - what happened:
  - why it mattered:

## Prompt / Persona Observations
- actor:
- facilitator:
- player-entry:

## Structural Pressure Observations
- visible pressure:
- pressure that felt too weak or too strong:

## Suggested Next Tuning Move
- ...
```

## Suggested Usage Rules
- keep notes short
- reference exact turn numbers when possible
- prefer observable statements over broad impressions
- separate hard failures from qualitative discomfort
- name one next move rather than a long wishlist
