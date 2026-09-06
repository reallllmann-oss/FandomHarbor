# Architecture Decision Records

Status: Permanent engineering documentation

ADRs explain why durable decisions were made, alternatives/trade-offs and consequences. `.ai/DECISIONS.md` remains the compact AI memory/index; these files are the permanent engineering record. Design-only choices remain in `.ai/DESIGN_DECISIONS.md` unless they have material architecture consequences.

## Rules

- One ADR per durable decision; never rewrite history to hide a change.
- Status is Proposed, Accepted, Superseded or Deprecated.
- A replacement ADR links to the superseded record and migration impact.
- Each ADR links to relevant `.ai` Decision IDs, requirements, risks and affected documentation.
- Use `ADR_TEMPLATE.md` for new records.

## Registry

| ADR     | Title                                                             | Related decisions                |
| ------- | ----------------------------------------------------------------- | -------------------------------- |
| ADR-001 | Why Supabase and PostgreSQL                                       | D-008                            |
| ADR-002 | Why TipTap for Structured Editing                                 | D-008, D-012                     |
| ADR-003 | Why Invitations Form a Trust Chain                                | D-003, D-005                     |
| ADR-004 | Why Version History Is Immutable                                  | D-012                            |
| ADR-005 | AO3 Product Philosophy Without AO3 UI                             | D-001, D-004; DD-001–DD-004      |
| ADR-006 | Three Application Boundaries                                      | D-002 (superseded), D-017        |
| ADR-007 | Modular Monolith and Purpose-Specific Packages                    | D-009, D-010                     |
| ADR-008 | Authorization Defense in Depth                                    | D-011                            |
| ADR-009 | Governed Free-Form Tags                                           | D-006                            |
| ADR-010 | Separate Pen Names From Private Identity                          | D-007                            |
| ADR-011 | Manual Elevated Role Grants                                       | D-005                            |
| ADR-012 | Documentation-First Phase and Sprint Workflow                     | D-013, D-015                     |
| ADR-013 | Numbered Documentation and Decision Ownership                     | D-016 (superseded), D-018, D-019 |
| ADR-014 | UI, Design System and Component Separation                        | D-020                            |
| ADR-015 | Database and Interface Traceability Registries                    | D-021                            |
| ADR-016 | AI Tech Lead Behavior and Phase Documentation                     | D-023                            |
| ADR-017 | Vercel + Supabase Baseline and Cloud-Server Migration Constraints | D-031                            |
| ADR-018 | Phase 1C Identity, Admission and Manual Roles                     | D-003, D-005, D-011, D-033       |
| ADR-019 | `works + chapters + articles` Content Domain Model                | D-003, D-006, D-007, D-034       |
| ADR-020 | Registration-name Credentials and Atomic Invitation Signup        | D-003, D-005, D-011, D-037       |
| ADR-021 | Admin Identity & Access Governance Contract                       | D-005, D-011, D-039              |
| ADR-022 | Admin Step-up Reauthentication Trust Boundary — Option 3 Accepted | D-039, KI-033                    |
| ADR-023 | Identity Access Read RPC Authority Boundary                       | ADR-008, ADR-021, ADR-022        |
