# Decisions

Purpose: store ADRs for major architecture or product-structure changes that need a durable record of what happened, why it happened, and what changed because of it.

## When to Write an ADR
Write an ADR when:
- a significant architecture change was triggered by failure, repeated playtest evidence, or implementation breakdown
- the repository needs a durable record of what happened, not only what foundation now exists
- a previous Enabler or implementation direction was materially revised because reality contradicted the earlier assumption

## Relationship to Enablers
- Enabler Proposals are the default format for foundational assets and reusable operating foundations.
- ADRs are not the default replacement for Enablers.
- Use an ADR when the important thing to preserve is the decision event, tradeoff, and trigger, especially after failure or architectural correction.
- When both are needed, the ADR records the event and reasoning, and the Enabler records the durable foundation that downstream work should depend on.

## Naming Convention
- ADR: `adr-YYYYMMDD-<slug>.md`

## Minimum Content
- status
- context
- trigger or failure evidence
- decision
- consequences
- related enablers, features, specs, or contracts
