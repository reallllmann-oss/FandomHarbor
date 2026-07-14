# Fandom Harbor Homepage Visual Direction

Status: Completed for UX-05 Homepage Visual Exploration; awaiting Product Owner acceptance
Phase: UX Design Intelligence
Scope: Homepage visual direction only; not final UI, Figma production, implementation, CSS, Tailwind, component design or code

## 1. Homepage Visual Goal

Homepage should visually express Fandom Harbor as a quiet private literary harbor.

It should help users understand:

1. This is a protected archive, not a public content feed.
2. Reading and preserved works are the center.
3. Their next action depends on access and memory state.
4. The product is calm, literary, trustworthy and worth returning to.

Why: UX-04 defines Homepage as the brand threshold and access-state routing surface.
Impact: Users feel invited, oriented and calm before moving to discovery, return, reading or creation.
UX-06 Application: Homepage implementation should be reviewed against threshold clarity before visual polish.

## 2. Brand Expression

Recommended brand expression:

**Quiet Editorial Harbor**

Visual qualities:

- Literary typography as the primary brand carrier.
- Intentional whitespace that creates calm and trust.
- Soft editorial rhythm rather than marketing hero density.
- A restrained navigation structure.
- Story preview as invitation, not feed.
- Warm but low-noise archive atmosphere.

Should feel:

- Invited.
- Private.
- Editorial.
- Calm.
- Trustworthy.
- Ready for long reading.

Should not feel:

- Promotional.
- Social.
- Trend-driven.
- Retail.
- SaaS.
- Dashboard-like.

Why: This expression connects UX-01 Brand DNA with UX-03 Design Language.
Impact: Homepage becomes a distinct product entrance rather than a generic web template.
UX-06 Application: Visual QA should flag social feed, marketing CTA, dashboard card and retail hero drift.

## 3. Recommended Composition Direction

This section defines composition direction, not concrete layout.

### 3.1 Entry Threshold

The first screen should establish:

- Fandom Harbor identity.
- Private archive meaning.
- Current access or next step.
- One clear primary path.

Why: Homepage is Entry Space and must build trust before discovery.
Impact: Visitors and returning users understand where they are and what to do next.
UX-06 Application: Ensure first viewport does not behave like a work list or feature grid.

### 3.2 Sparse Intent Navigation

Navigation should prioritize a small set of intent-based paths:

- Enter / sign in.
- Discover / Archive.
- Continue / Library when signed in.
- Studio when authorized.

Why: UX-02 navigation philosophy is task-based, not technical or CMS-based.
Impact: Users move by purpose rather than by internal product structure.
UX-06 Application: Review labels and visibility for permission-aware clarity.

### 3.3 Editorial Story Preview

Homepage may include restrained story previews only after the brand threshold has done its job.

Recommended direction:

- Text-led work presentation.
- Title, short summary and public author identity.
- Rating / warning / metadata cues when needed.
- No popularity-first stats.
- No endless feed rhythm.

Why: Works should feel like literary archive entries, but Homepage must not become Archive.
Impact: Readers sense the reading value without being pushed into a list-scrolling mode.
UX-06 Application: Treat preview as a bridge to Archive or Work Detail, not the primary Homepage object.

### 3.4 Quiet Trust Section

Homepage should explain the archive promise without SaaS feature-card language.

Possible content direction:

- Private access and invitation.
- Reading-first environment.
- Metadata and warning clarity.
- Author identity boundary.
- Calm return to reading.

Why: Fandom Harbor needs trust context more than marketing claims.
Impact: New users understand product values without feeling sold to.
UX-06 Application: Avoid feature grid density and conversion-copy patterns.

### 3.5 Calm Closing

The page ending should feel resolved and archive-oriented.

Recommended direction:

- Quiet footer rhythm.
- Sign-in / return / archive paths.
- Brand identity and governance tone.
- No aggressive newsletter or subscription conversion.

Why: The page should end as a protected archive, not a campaign.
Impact: Users leave with clarity and trust, even if they do not act immediately.
UX-06 Application: Replace retail/newsletter endings with archive access and return guidance.

## 4. Content Presentation Direction

### Primary Content

- Brand identity.
- Private archive statement.
- Access-state next action.
- Continue / discover path depending on state.

Why: Homepage should orient and route before presenting inventory.
Impact: Users can enter the correct task space quickly.
UX-06 Application: Preserve access and next-action hierarchy in implementation.

### Secondary Content

- Editorial story preview.
- Archive value and metadata trust.
- Reading-first promise.
- Author Studio entry when authorized.

Why: Secondary content supports confidence after orientation.
Impact: Homepage communicates value without becoming a generic landing page.
UX-06 Application: Keep secondary blocks calm and non-promotional.

### Supporting Content

- Footer navigation.
- Help / access recovery.
- Policy or governance cues when appropriate.
- Low-pressure return paths.

Why: Supporting content should help recovery and trust, not add noise.
Impact: The page remains usable without feeling crowded.
UX-06 Application: Keep footer and utility content restrained and readable.

## 5. Experience Flow

Recommended visual experience flow:

```text
Brand threshold
-> Access / state recognition
-> Primary action
-> Quiet story or archive preview
-> Trust / reading value
-> Calm closing and recovery paths
```

User-path mapping:

| User              | Homepage Visual Priority                     | Next Experience            |
| ----------------- | -------------------------------------------- | -------------------------- |
| Visitor           | Understand private archive and access        | Sign in / invitation path  |
| New Reader        | Feel trust, then discover                    | Archive                    |
| Returning Reader  | Resume privately                             | Continue Reading / Library |
| Authorized Author | Reach workroom without losing reader context | Studio                     |

Why: UX-02 and UX-04 require Homepage to route by state and intent.
Impact: Figma and implementation can support multiple states without changing the brand foundation.
UX-06 Application: Validate signed-out, signed-in and author-capable states separately.

## 6. Selected Visual Principles

| Principle             | Source Reference | Why                                    | Impact                                | UX-06 Application                                        |
| --------------------- | ---------------- | -------------------------------------- | ------------------------------------- | -------------------------------------------------------- |
| Editorial whitespace  | Reference 1      | Supports quiet premium archive feeling | Creates trust and calm                | Preserve spacing around major content groups             |
| Text-led work preview | Reference 3      | Aligns with story-first archive        | Avoids cover grid and popularity feed | Use for small curated preview only                       |
| Sparse navigation     | Reference 4      | Supports intent-based movement         | Reduces cognitive load                | Keep primary nav short and permission-aware              |
| Calm closing rhythm   | Reference 5      | Reinforces warm restraint              | Avoids conversion pressure            | Use archive/return ending instead of subscription ending |
| Minimal reading tone  | Reference 2      | Protects long-form calm                | Keeps visual noise low                | Use as restraint reference, not page structure           |

## 7. Directions to Avoid

Homepage should avoid:

- Full work catalog as first impression.
- Trending, ranking or public popularity modules.
- Blog/news/magazine issue framing.
- Newsletter subscription as main conversion.
- Retail hero with product imagery.
- Generic SaaS feature grids.
- Dashboard or CMS menu language.
- Overly narrow text-only page with weak actions.
- Decorative image-led mood that hides product purpose.

Why: These directions conflict with accepted UX-01 to UX-04 decisions.
Impact: Avoids product-category drift and protects private archive identity.
UX-06 Application: Use this list as implementation review guardrail.

## 8. UX-06 Implementation Guidance

When UX-06 begins, Homepage implementation polish should check:

1. Does the first viewport communicate private archive identity?
2. Is the primary next action clear for visitor, reader and author states?
3. Does typography feel literary without harming readability?
4. Does work preview remain secondary to Homepage purpose?
5. Are warnings, metadata and story cues treated with enough clarity where present?
6. Does navigation remain intent-based and permission-aware?
7. Does the page avoid feed, SaaS, CMS, blog and retail patterns?
8. Does the ending reinforce trust and return rather than conversion pressure?

UX-06 should not treat UX-05 as permission to modify code, tokens or components unless separately authorized.

## 9. Non-Decisions

This document does not decide:

- Final Figma layout.
- Final homepage copy.
- Component specifications.
- Exact visual assets.
- Font files or color values.
- Spacing values or breakpoints.
- CSS, Tailwind, token or code changes.
- Route, database or business logic changes.
