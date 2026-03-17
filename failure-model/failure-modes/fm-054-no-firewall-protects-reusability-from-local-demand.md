---
id: fm-054
title: No Firewall Protects Reusability from Local Demand
type: failure_mode
triggers:
  - rf-024
triggered_by: []
leads_to: []
leads_from: []
tags:
  - failure_mode
  - barriers
  - expectations
---

## Failure Mode Statement
No firewall protects reusability from local demand, so tools, services, and workflows are shaped around immediate cases that are hard to reuse later.

## Context
This tends to emerge when the team keeps saying yes to local requests, but does not defend the architectural and product boundaries needed for repeatable platform value.

## Mechanism
- Local demand is allowed to define what gets built before reusability criteria are enforced.
- The team optimizes for solving the present request rather than for creating something others can adopt repeatedly.
- As a result, the platform accumulates hard-to-reuse tools and one-off solutions instead of durable leverage.

## Countermove
- Apply a clear firewall between local urgency and what is allowed to shape reusable platform assets.
- Check whether proposed work improves repeatability before treating it as platform work.
- Refuse or redirect work that only solves a local case and would damage broader reusability.

## Notes
Initial draft linked to `rf-024`.
