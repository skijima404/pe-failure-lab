---
name: playtest-initialize
description: Use when preparing to run a live runtime playtest in this repository and you need a fixed initialization workflow that checks environment readiness, shows the exact command the user must run, and points to the playtest note template.
---

# Playtest Initialize

Use this skill before a runtime playtest, especially when:
- switching from mock fixtures to real-model playtesting
- confirming `.env` and API setup
- preparing a user to run the playtest command themselves
- making sure the playtest note flow is ready

This skill operationalizes:
- `docs/intent-development/enabler-proposals/ep-intent-008-runtime-regression-validation-workflow.md`
- `docs/templates/playtest/runtime-playtest-note-template.md`
- `runtime/README.md`

## Purpose
Provide one standard playtest-start workflow.

This skill is not for changing code.
It is for getting a playtest session into a ready state and making the next human action explicit.

## Workflow
1. Confirm which playtest path is intended:
   - mock
   - OpenAI-backed
2. Confirm whether the repository-root `.env` is expected to supply:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional)
   - `OPENAI_REASONING_EFFORT` (optional)
3. State whether the runtime is ready or blocked.
4. If the user must run a local command themselves, show the exact command in a fenced code block.
5. Point the user to:
   - `docs/templates/playtest/runtime-playtest-note-template.md`
6. After the user returns with output, switch to runtime debugging or naturalness review as appropriate.

## Important Rule
If the next step requires the user to execute code locally, do not leave that implicit.

Always show:
- the exact command
- the working directory assumption if needed
- the minimum reason for running it

Example:

```bash
npm run fixture:openai-adapter
```

## Recommended Output Shape
Keep the message short and operational.

Include:
- readiness status
- required user action
- exact command if the user must run one
- note template reference

## Do Not
- do not assume the user knows they need to run the command
- do not bury the command inside a long paragraph
- do not start code changes when the real need is playtest setup
