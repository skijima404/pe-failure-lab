---
id: fm-056
title: Firewall Maintenance Is Treated as Extra Work
type: failure_mode
triggers:
  - rf-025
triggered_by: []
leads_to: []
leads_from: []
tags:
  - failure_mode
  - barriers
  - capacity
---

## Failure Mode Statement
Firewall maintenance is treated as extra work, so the boundary-protection activity that keeps the effort from drifting is under-resourced and inconsistently sustained.

## Context
This tends to emerge when the team knows it must defend scope, expectations, and reusability, but does not assign real operating capacity to maintain that protection.

## Mechanism
- Firewall work is treated as overhead instead of as part of the operating model.
- Boundary defense is delayed whenever visible delivery work feels more urgent.
- As a result, the effort gradually loses the capacity needed to keep local demand from rewriting the plan.

## Countermove
- Treat firewall maintenance as first-class operating work with explicit ownership and time.
- Review whether boundary-protection work is actually being sustained, not only declared.
- Make scope drift visible as evidence that firewall capacity is too thin.

## Notes
Initial draft linked to `rf-025`.
