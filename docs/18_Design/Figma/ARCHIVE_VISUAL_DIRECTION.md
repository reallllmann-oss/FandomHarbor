# Fandom Harbor Archive Visual Direction

Status: Completed for UX-05C Archive Visual Intelligence; awaiting Product Owner acceptance
Phase: UX Design Intelligence
Scope: Archive Page visual direction only; not final UI, Figma production, implementation, CSS, Tailwind, component design, pixel specification or code

## 1. Archive Page Purpose

Archive is Fandom Harbor's public discovery space for published works.

It exists to help readers move from general interest to a specific story decision through title, summary, public author identity, rating, warnings, category, status and tags.

Archive should not behave like a generic novel list, content database, category directory, marketplace shelf, ranking board or CMS table.

Why: UX-02 defines Archive as Discovery Space, while Library / History / Continue Reading are private Return Space concepts.
Impact: Readers enter Archive when they want to find something new or suitable, not when they simply want to resume a known work.
Application: UX-06 should preserve Archive as a discovery experience and avoid mixing it with private reader-return modules unless the hierarchy is clearly secondary.

## 2. Discovery Experience Goal

The core experience goal is:

**Curated Story Discovery Space**

Readers should feel:

- Quietly curious.
- In control of choice.
- Protected by clear boundaries.
- Able to compare works without pressure.
- Invited into stories rather than pushed by popularity.

Readers should not feel:

- They are shopping in a novel marketplace.
- They are browsing a raw database.
- They are inside a social feed.
- They are responding to a ranking system.
- They are managing content in a CMS.

Why: Fandom Harbor's archive value comes from intentional discovery and readable metadata, not trend pressure or inventory volume.
Impact: Discovery becomes calmer, safer and more literary; users choose by story fit, boundary clarity and reading mood.
Application: UX-06 Archive polish should evaluate whether the page helps users understand and compare works without turning statistics into the main signal.

## 3. Archive Identity

### 3.1 Archive Is

Archive is:

- A story discovery space.
- A curated, searchable literary catalog.
- A metadata-supported browsing environment.
- A bridge from Homepage brand threshold to Work Detail decision.
- A place where published works become legible and comparable.

Why: Archive must translate Fandom Harbor's rich metadata into reader confidence.
Impact: Users can understand what a work is, whether it fits their boundaries, and why they may want to open it.
Application: Archive story entries should prioritize story identity, summary, warning context and metadata before supporting signals.

### 3.2 Archive Is Not

Archive is not:

- A full work-reading page.
- A personal library.
- A continue-reading module.
- An author work-management area.
- A popularity leaderboard.
- A social feed.
- A storefront.
- A CMS content table.

Why: These patterns would collapse Discovery, Return and Creation into one undifferentiated list.
Impact: Reader intent stays clear and Archive avoids drifting into novel-site or backend patterns.
Application: UX-06 should keep private return, Studio management controls and public engagement pressure out of the primary Archive hierarchy.

## 4. Archive / Library / Works / Continue Reading Relationship

This Mission clarifies experience responsibilities without locking final navigation names.

| Concept          | Experience Role               | Primary User Intent                                      | What It Should Prioritize                                                              | What It Should Avoid                                               |
| ---------------- | ----------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Archive          | Public discovery              | Find a work that matches current interest and boundaries | Published works, story previews, rating, warnings, metadata and discovery filters      | Private reading history, Studio controls, popularity-first ranking |
| Library / Shelf  | Private return                | Revisit known saved or read works                        | Bookmarks, history, saved works, personal continuity and privacy                       | Public catalog browsing, social proof, public identity display     |
| Works            | Context-specific object label | Depends on reader, author or Studio context              | In reader context: published work objects; in author context: authored work management | Using one label to blur Archive discovery and Studio management    |
| Continue Reading | Direct recovery               | Resume a known reading position                          | Last work, chapter position, recovery path and reading state                           | Browsing, filtering, ranking or catalog comparison                 |

Why: A user who wants "find something new" and a user who wants "return to where I left off" have different emotional states.
Impact: Archive can stay exploratory and comparison-friendly, while Library and Continue Reading can stay private and low-friction.
Application: UX-06 should treat these as separate experience modes even if final labels or navigation placement are refined later.

## 5. Visual Direction

Archive visual direction:

**Curated Story Discovery Space**

This direction extends Homepage's **Quiet Editorial Harbor** into an active browsing environment, while remaining outside Reading's **Private Literary Reading Space**.

Archive should visually feel:

- Editorial and organized.
- Calm but useful.
- Scannable without becoming dense.
- Metadata-rich without becoming noisy.
- Text-led and story-led.
- Private-archive aligned, not commerce aligned.

Why: Archive needs more information density than Homepage and Reading, but it must still preserve Fandom Harbor's quiet editorial DNA.
Impact: Users can browse with intention instead of scrolling through a feed or scanning a shopping grid.
Application: UX-06 should balance readable story entries, clear metadata groups and restrained action hierarchy.

## 6. Layout Philosophy

Archive layout should follow a discovery catalog rhythm.

Direction:

- Start with orientation: what space the user is in and what kind of discovery is possible.
- Let browsing controls support intent without becoming the page's visual center.
- Present works in a repeatable rhythm that supports comparison.
- Keep story entries text-led rather than image- or statistic-led.
- Preserve recovery from empty, over-filtered or narrow results.

Why: Archive is a task space for intentional selection, not an endless entertainment surface.
Impact: Readers can understand the available works and adjust their discovery path without feeling rushed.
Application: UX-06 should avoid infinite-feed energy, raw database tables and decorative card grids that obscure story meaning.

Non-decision:

- UX-05C does not define column counts, card size, pagination, sticky behavior, breakpoints or component structure.

## 7. Information Density

Archive should use moderate density:

- Denser than Reading Page.
- More structured than Homepage story preview.
- Less compressed than forum lists, dashboards or CMS tables.
- Less visually sparse than a marketing page.

Primary density belongs to:

- Work title.
- Summary or short story preview.
- Rating and warnings.
- Public author identity.
- Category, language, status and key metadata.

Supporting density belongs to:

- Tags.
- Updated context.
- Statistics.
- Kudos, comments or recommendation counts.

Why: Reader discovery depends on enough information to make a safe and interesting choice, but too much equal-weight metadata becomes noise.
Impact: Important content boundaries remain visible while discovery stays calm.
Application: UX-06 should stage long tag sets and keep supporting signals downstream from story identity and safety context.

## 8. Story Presentation

Story presentation should feel like a literary invitation.

Recommended direction:

- Title anchors each work.
- Summary explains story promise and tone.
- Public author identity supports attribution and trust.
- Rating and warnings appear before or alongside deeper story evaluation.
- Status and category help set reading expectations.
- Tags support discovery after the story's core identity is understood.

Why: Archive is the reader's first evaluation point before Work Detail.
Impact: Readers can decide which works deserve deeper inspection without opening every detail page.
Application: UX-06 should make Work Detail the full decision page, while Archive provides enough preview for confident selection.

## 9. Author Presence

Author presence should be warm and secondary.

Direction:

- Public pen name or display name may appear as attribution.
- Author presence should help readers understand story context.
- Author identity should not become follower, fan or popularity framing.
- Private account identity must never appear.

Why: UX-01 and UX-02 protect pen-name separation and reject social-profile drift.
Impact: Archive feels authored and human without becoming creator-centric social browsing.
Application: UX-06 should use author presence as a trust cue and path to Author Profile, not as a social module.

## 10. Metadata Usage

Metadata is the discovery engine of Archive.

Metadata should:

- Clarify reader boundaries and preferences.
- Make rating and warnings highly legible.
- Group category, status, language and relationship information by meaning.
- Let tags help discovery without becoming rainbow noise.
- Keep statistics available but visually supporting.

Metadata should not:

- Hide warnings to make entries cleaner.
- Turn every tag into equal visual weight.
- Use color as the only semantic signal.
- Let engagement metrics outrank title, summary and warnings.

Why: Fandom Harbor's archive identity depends on precise metadata, but metadata must serve reader choice rather than visual decoration.
Impact: Readers can explore safely and efficiently, especially when works have complex fandom-specific context.
Application: UX-06 should audit Archive entries for warning visibility, tag grouping, readable wrapping and non-dominant statistics.

## 11. Discovery Mood

Archive should create calm curiosity.

Mood direction:

- Quiet enough to feel private.
- Structured enough to compare works.
- Warm enough to invite reading.
- Clear enough to respect boundaries.
- Slow enough to avoid feed pressure.

Why: Readers should feel they are choosing a story for themselves, not being pulled by platform urgency.
Impact: Discovery supports long-term trust and return instead of short-term clicks.
Application: UX-06 should avoid trending labels, urgency badges, aggressive sort emphasis and public competition cues.

## 12. Forbidden Experience

Archive must avoid:

- Novel marketplace feeling.
- Best-seller shelf or cover-grid dominance.
- Ranking / trending / hot-list hierarchy.
- Social feed rhythm.
- Forum list density.
- CMS table layout.
- Blog index structure.
- Dashboard filter panel dominance.
- Public popularity as the main visual signal.
- Studio management controls in reader discovery.
- Private reading history as the primary Archive object.

Why: These patterns conflict with Fandom Harbor's accepted Brand DNA, Information Architecture and Design System Intelligence.
Impact: Avoids product-category drift and protects Archive as a quiet literary discovery space.
Application: UX-06 should use this list as an Archive implementation review guardrail.

## 13. Homepage / Archive / Reading Relationship

Homepage, Archive and Reading form a continuous reader experience:

```text
Homepage
-> enters the literary harbor

Archive
-> explores the story space

Work Detail
-> decides whether to enter a specific story

Reading
-> enters the story interior
```

### Homepage Relationship

Homepage is the brand threshold.

Why: It explains Fandom Harbor and routes users by access and intent.
Impact: Homepage can offer restrained story preview, but it should not become the discovery catalog.
Application: Archive should receive users who are ready to browse, filter and compare.

### Archive Relationship

Archive is the discovery layer.

Why: It turns published works and metadata into a calm exploration experience.
Impact: Users can move from general curiosity to a specific Work Detail decision.
Application: Archive should present enough story and boundary context to make opening a Work feel intentional.

### Reading Relationship

Reading is the story interior.

Why: Once a user enters Reading, discovery should recede and prose should own the experience.
Impact: Archive should not import feed pressure into Reading, and Reading should not carry Archive density.
Application: UX-06 should keep Archive's comparison rhythm separate from Reading's private focus rhythm.

## 14. UX-06 Implementation Guidance

When UX-06 begins, Archive implementation polish should preserve:

1. Archive as discovery, not private return.
2. Story title, summary, public author identity, rating and warnings as primary signals.
3. Metadata as structured reading-choice support.
4. Moderate density that supports comparison without feed or dashboard pressure.
5. Statistics and engagement as supporting context only.
6. Clear recovery from empty or over-filtered states.
7. Separation from Library, Continue Reading and Studio management modes.
8. Continuity with Homepage's Quiet Editorial Harbor and Reading's Private Literary Reading Space.

UX-06 should avoid:

- Cover-grid marketplace patterns.
- Public ranking or trending dominance.
- Social feed modules.
- CMS tables.
- Hidden warnings.
- Over-colored tag taxonomies.
- Studio controls in reader discovery.
- Mixing private reading history into Archive's primary hierarchy.

UX-05C does not authorize code changes, token changes, component creation, CSS, Tailwind, Figma file generation, route changes, database changes or business logic changes.

## 15. Non-Decisions

This document does not decide:

- Final page layout.
- Final navigation label.
- Final Archive / Library / Works / Shelf naming.
- Component specifications.
- Exact filter UI.
- Pagination or infinite scroll implementation.
- Font files, color values or spacing values.
- CSS, Tailwind, token or code changes.
- Figma frames or production design.
- Route, database, Supabase or business logic changes.
