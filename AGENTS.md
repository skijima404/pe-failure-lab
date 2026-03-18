# Repository Operating Guidance

This repository is AI-native. Documents and structures should be optimized primarily for durable machine reasoning, traceability, and reuse.

## Default Language
- Use English by default unless a task explicitly requires another language.
- Existing Japanese source material may be preserved when it is itself part of the domain asset or raw input.
- New repository-facing specifications, proposals, schemas, and operating documents should be written in English unless intentionally noted otherwise.

## AI-Native Writing Policy
- Optimize for explicit structure over narrative polish.
- Prefer stable identifiers, relation fields, and reusable sections over prose written only for human browsing.
- Write documents so they can later be parsed, linked, and projected into graph-like structures.
- Human readability still matters, but secondary to precision, traceability, and reuse.

## Durable Asset Policy
- Treat failure models, expected outputs, intent documents, and related schemas as product assets.
- Avoid burying important logic inside chat transcripts or ad hoc notes.
- When implementation changes depend on a product asset, record that relationship explicitly.

## Traceability Policy
- Keep links explicit between vision, enablers, features, UI specs, implementation specs, expected outputs, and failure-model assets.
- Prefer consistent relation names and stable ids.
- If a new artifact becomes important to downstream reasoning, give it a clear place in the repository instead of leaving it implicit.

## Intent-Gated Development Policy
- Do not introduce new product behavior, durable assets, workflows, repository rules, skills, scripts, or validation helpers unless they are linked to an Intent and Proposal in `docs/intent-development/`.
- Treat this as the default gate for development work in this repository.
- Before implementing non-trivial development work, identify whether it belongs to:
  - an existing Enabler Proposal
  - an existing Feature Proposal
  - or a new Intent that must be added first
- If the required Intent/Proposal does not exist yet, create or update the relevant intent documents before proceeding with implementation.
- Small changes do not require a new Intent or Proposal when they stay clearly inside existing approved or draft scope. Examples include:
  - typo fixes
  - wording clarification
  - link repair
  - file renames for consistency
  - frontmatter correction
  - small edits that only refine an already-defined asset or proposal
- When uncertain, bias toward creating or updating the Intent/Proposal rather than implementing first and documenting later.

## Skill Storage Policy
- Unless explicitly requested otherwise, create new skills inside this repository rather than in the global Codex home directory.
- Treat repository-local skills as durable project assets that should remain traceable to Intent, Proposal, and Value Stream documents.
- Prefer storing repository-local skills under `skills/`.
- Only create or install a skill into `$CODEX_HOME/skills` when the user explicitly asks for a global skill or cross-repository installation.

## Repo Bias
- This repository is not optimized primarily as a reading experience.
- It is optimized as a structured working substrate for humans and GenAI collaborating on a simulation product.

## Root-Level Simulation Entry Policy
- Treat the repository root as a valid entry point for simulation execution as well as development work.
- If the user asks to run, test-play, or simulate from the root, do not assume the task is only about implementation planning.
- In simulation-execution contexts, prioritize:
  - `docs/product/contracts/mvp-simulation-contract-v1.md`
  - `docs/product/concepts/enterprise-context-card-v1.md`
  - `docs/product/concepts/mvp-simulation-session-concept.md`
  - `docs/product/contracts/facilitator-role-contract-v1.md`
  - `docs/product/personas/`
  - `failure-model/`
- When simulation and development intents are both plausible, prefer the user's explicit execution request over the repository's development-document bias.
