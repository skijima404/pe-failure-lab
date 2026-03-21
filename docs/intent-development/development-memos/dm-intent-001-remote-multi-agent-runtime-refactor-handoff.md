# Development Memo

- intent_id: intent-001
- title: Remote Multi-Agent Runtime Refactor Handoff
- artifact_type: development-memo
- owner: shared
- status: working
- created_at: 2026-03-21
- updated_at: 2026-03-21
- related_decision: docs/decisions/adr-20260321-local-first-runtime-and-multi-agent-scope.md
- related_feature_proposal: docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_implementation_specs:
  - docs/intent-development/implementation-specs/is-intent-001-mvp-multi-agent-runtime-design.md
  - docs/intent-development/implementation-specs/is-intent-001-remote-multi-agent-session-boundaries.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md
- related_development_memos:
  - docs/intent-development/development-memos/dm-intent-001-multi-agent-runtime-implementation-map.md
  - docs/intent-development/development-memos/dm-intent-001-conversation-naturalness-multi-agent-playtest-notes.md

## Purpose
Capture the current runtime-structure confusion and the refactor questions that should be carried into the next development session.

This memo is not the final contract.
It is a handoff artifact for clarifying:
- what "multi-agent" currently means in this repository
- which agent-like concepts are being conflated
- what was discovered during troubleshooting
- which refactor directions should be evaluated next

Decision outcome note:
- after this handoff was written, the repository adopted a `local-first` live runtime posture in `adr-20260321-local-first-runtime-and-multi-agent-scope`
- this memo remains useful as historical evidence of why that change became necessary
- remote actor separation should now be treated as an optional future investigation, not the default live-runtime direction

## Trigger
During troubleshooting on 2026-03-21, the operator expected:
- `simulate:openai:interactive`
- with Human Play
- and remote multi-agent behavior

Observed mismatch:
- the runtime accepted human player input correctly
- but visible Codex child sessions such as `Harvy` or `Galileo` did not appear
- this made it look as if remote multi-agent mode was not active

## Confirmed Findings
- `simulate:openai:interactive` was previously using the same basic stateless OpenAI adapter pattern as the thin harness
- the runtime already had local turn orchestration for facilitator and stakeholder roles
- the runtime did not previously preserve remote per-role conversational continuity during Human Play
- the repository also lacked a clean explanation of how Codex sub-sessions differ from simulation actors

## Immediate Code Change Already Applied
The OpenAI adapter now supports:
- `stateless`
- `per-speaker-response-chain`

Current intended meaning of `per-speaker-response-chain`:
- the local orchestrator still decides who speaks next
- each speaking runtime participant gets its own remote response continuation chain
- continuation is tracked by speaker through `previous_response_id`
- player turns remain local Human Play input

This is enough to make Human Play compatible with remote role-separated response continuity.

It is not the same as:
- visible Codex child-agent windows
- independent long-running remote worker processes
- free autonomous agent-to-agent conversation outside the room-state orchestrator

## Structural Confusion To Resolve
The word `agent` is currently overloaded across at least four meanings:

### 1. Codex Operator Session
Examples:
- the main Codex chat
- local child sessions such as `Galileo`

Responsibility:
- repository work
- debugging
- implementation
- shell execution
- coordination of local developer tasks

### 2. Runtime Orchestrator
Examples:
- `selectNextTurn`
- session-driver and execution loop logic

Responsibility:
- canonical `room_state`
- next-speaker selection
- player-entry control
- transcript and lifecycle boundaries

### 3. Simulation Runtime Actor
Examples:
- facilitator
- executive stakeholder
- platform stakeholder
- delivery stakeholder

Responsibility:
- produce in-world dialogue for one role at a time
- stay inside bounded role knowledge
- respond to the active meeting topic

### 4. Evaluator
Responsibility:
- post-game reflection
- structural assessment
- evidence-based session interpretation

The current repo does not clearly separate these four layers in naming or operator guidance.

## Important Clarification
Visible Codex child windows are not evidence of the simulation runtime working correctly.

Those windows belong to the Codex operator layer.
They are local work-delegation artifacts.

They should not be treated as the same thing as:
- runtime actors
- remote response chains
- simulation-facing multi-agent behavior

## Current Working Runtime Model
The current runtime should be understood as:
- local canonical state
- local orchestrator
- local Human Play input for the player
- remote role-specific generation for facilitator and stakeholders
- local-first evaluation after close

Short form:
- operator layer is local
- orchestration layer is local
- actor generation is remote
- evaluator is local-first

## Why The Operator Could Reasonably Get Confused
The confusion is structurally understandable because:
- "multi-agent" was used informally for both Codex sub-sessions and simulation participants
- README wording implied interactive remote playtest support before the implementation had role-separated remote continuity
- visible child windows are intuitive evidence of "multiple agents" even though they belong to a different layer
- the runtime did not yet have an explicit durable explanation for the difference between:
  - local sub-session
  - runtime actor
  - response chain
  - evaluator

## Refactor Goal
The next refactor should make the architecture legible enough that an operator can answer all of the following quickly:
- what is local
- what is remote
- which components are simulation-facing
- which components are only development tooling
- what "multi-agent" means in each layer

## Recommended Refactor Direction
Prefer clarifying the architecture in three explicit layers.

### Layer A: Operator Layer
Suggested concepts:
- main session
- worker session or sub-session

Suggested responsibility:
- coding and local execution workflow

### Layer B: Runtime Orchestration Layer
Suggested concepts:
- room orchestrator
- turn selector
- transcript boundary controller
- session lifecycle controller

Suggested responsibility:
- simulation control logic
- bounded state transitions
- player-input and close/evaluator boundaries

### Layer C: Simulation Agent Layer
Suggested concepts:
- runtime actor
- facilitator actor
- stakeholder actor
- evaluator
- remote response chain

Suggested responsibility:
- in-world speaking behavior
- post-game evaluation behavior

## Naming Questions For Refactor
The next session should decide whether to standardize terms like:
- `subsession` or `worker-session` for Codex child sessions
- `runtime-orchestrator` for local turn control
- `runtime-actor` for facilitator and stakeholders
- `response-chain` for per-speaker remote continuation
- `local-evaluator` versus `remote-evaluator`

## Open Design Questions
- Should `interactive` and `full` both be treated as remote-enabled modes by default, with only player-input behavior differing, or should local-first naming stay primary?
- Should the repository define a future stronger mode that uses truly separate remote actor sessions rather than per-speaker response chains as an optional later experiment?
- Should observability explicitly log layer information so operator traces never mix Codex work sessions with simulation runtime actors?
- Should UI/operator docs stop using `agent` without a prefix such as `operator-agent`, `runtime-actor`, or `evaluator`?

## Recommended Next Actions
1. Refactor runtime/operator terminology into explicit layer-specific names.
2. Update operator-facing docs so `simulate:openai`, `simulate:openai:interactive`, and `simulate:openai:full` have non-overlapping semantics.
3. Add observability fields that identify:
   - operator layer
   - orchestration layer
   - simulation actor layer
4. Treat true remote independent actor sessions as an optional future implementation mode unless product evidence justifies stronger separation.
5. Keep Human Play as a first-class path while preserving local-first runtime clarity.

## Current Decision Boundary
For now, the repository may use the phrase `remote multi-agent` to mean:
- one local orchestrator
- multiple role-specific remote response chains
- Human Play or autoplay at the player boundary

For now, it should not imply:
- visible Codex child-session windows
- one remote worker process per actor
- fully autonomous actor-to-actor control without local orchestration
