# Enterprise Context Card v1

- Product: Platform Engineering Failure Lab
- Status: draft
- Updated: 2026-03-18

## Purpose
Define the fixed enterprise context for the first thin playable version before persona design expands.

This card is intended to anchor tone, pressure, and organizational realism for the MVP simulation.

## Enterprise Context
- large enterprise with a strong legacy footprint
- roughly 85% of engineering effort is consumed by maintenance and incremental change on existing systems
- most development is outsourced to external partners
- internal teams often coordinate, review, approve, and manage vendors more than they implement directly
- delivery is still predominantly waterfall-oriented at the organizational level
- some small development teams experiment with agile practices, but this is inconsistent and not yet an enterprise-wide operating model
- commitments made in meetings tend to harden into assumed obligations
- Platform Engineering is still immature as an organizational concept and is likely to be interpreted as a central support function
- standardization pressure exists, but system reality and delivery practices are uneven across domains

## Organizational Feel
The company is modern enough to create expectations, but not mature enough to support those expectations structurally.

The intended tone is:
- heavy enterprise realism
- legacy-heavy inertia
- uneven modernization
- expectation pressure without mature operating-model support

## Platform Landscape
The organization currently operates across three different platform realities.

### 1. Legacy Platform
- on-prem infrastructure still exists
- many legacy systems still depend on it
- retirement is in progress
- new applications are not supposed to start there

### 2. Current Dominant Platform
- public cloud virtual machine environment
- mostly EC2 / VM-centered usage
- much of the practical current delivery happens here
- operationally familiar, but not strongly platformized

### 3. Target Standard Platform
- Kubernetes on public cloud
- positioned as the strategic standard direction
- actual usage is still limited
- adoption is uneven
- not yet broadly functioning as a company-wide default operating model

## Intended Asymmetry
- on-prem is the retiring past
- cloud VMs are the current operational default
- Kubernetes is the strategic target standard with weak organizational adoption

## Simulation Tensions This Context Should Enable
- executives overestimate maturity
- legacy-side stakeholders resist standardization
- new-side stakeholders expect immediate usability
- platform-side stakeholders know that strategic standard is not the same as operational default

## MVP Constraint
For v1, this enterprise context should be treated as fixed rather than dynamically generated.
