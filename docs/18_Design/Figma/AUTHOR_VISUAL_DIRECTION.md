# Fandom Harbor Author Visual Direction

Status: Completed for UX-05D Author Visual Intelligence; awaiting Product Owner acceptance
Phase: UX Design Intelligence
Scope: Author Profile visual direction only; not final UI, Figma production, implementation, CSS, Tailwind, component design, pixel specification or code

## 1. Author Profile Purpose

Author Profile is Fandom Harbor's public creator identity space inside the private archive.

It exists to help readers understand a public pen name, sense the author's creative presence, and move into that author's published works.

Author Profile should not behave like a personal account page, social profile, follower hub, content-uploader page, Studio dashboard or creator-commerce storefront.

Why: UX-01 and UX-02 define Fandom Harbor as a work archive and reading product with strict public/private identity separation.
Impact: Readers can understand authors through their public body of work, while authors remain protected from private identity exposure and social performance pressure.
Application: UX-06 should review Author Profile against public pen-name clarity, published-work hierarchy and social-drift avoidance.

## 2. Creator Identity Experience

The core experience goal is:

**Literary Creator Identity Space**

Readers should feel:

- This author has a coherent public identity.
- The author's works belong to a recognizable creative presence.
- The page is literary, calm and respectful.
- The archive protects the author's identity boundaries.
- The next meaningful action is to explore works, not follow a social account.

Authors should feel:

- Represented by published works and public context.
- Safe from private account leakage.
- Not pressured into fan metrics, activity posting or popularity performance.
- Confident that the archive treats their works as preserved creative output.

Why: Fandom Harbor positions authors as creators of story worlds, not as content uploaders or social accounts.
Impact: Author Profile becomes a bridge between attribution and story discovery rather than a profile page competing for attention.
Application: UX-06 should preserve the author-as-creator reading and avoid turning identity into a user-card or analytics summary.

## 3. Author Page Identity

### 3.1 Author Profile Is

Author Profile is:

- A public pen-name identity space.
- A literary creator introduction.
- A body-of-work gateway.
- A story-world orientation point.
- A trust and attribution layer inside the archive.
- A bridge from Work byline or Archive discovery to more published works.

Why: Readers often understand a work partly through who created it and what else that creator has published.
Impact: Author Profile deepens context and supports intentional reading without becoming a social relationship surface.
Application: Author Profile should make public identity and published works feel connected.

### 3.2 Author Profile Is Not

Author Profile is not:

- A personal account page.
- A normal user profile.
- A social media homepage.
- A follower or fan-count page.
- An activity timeline.
- A popularity dashboard.
- A Studio management page.
- A CMS author backend.
- A storefront for works.

Why: These patterns would collapse public creator identity, private account identity, social status and author work management into one page.
Impact: The page would violate pen-name separation and shift Fandom Harbor toward social-platform or creator-economy patterns.
Application: UX-06 should exclude follower mechanics, private identity facts, draft works, Studio controls and public ranking emphasis.

## 4. Author / Work Relationship

Author identity and works should form a quiet archive relationship:

```text
Public Pen Name
-> Creator Context
-> Published Works
-> Work Detail
-> Reading
```

### 4.1 Author Identity

Author identity should be public, intentional and bounded.

It may include:

- Public pen name or display name.
- Public bio or creator context when available.
- Public archive-relevant identity cues.
- Relationship to published works.

It must not include:

- Private registration identity.
- Email, account metadata or admin-only identity facts.
- Reader history.
- Draft status not meant for public view.

Why: Pen-name separation is a trust boundary, not a cosmetic choice.
Impact: Authors can build a recognizable creative identity without exposing private account facts.
Application: UX-06 should audit all identity fields for public/private separation.

### 4.2 Published Works

Published works are the primary expression of author identity.

Work presentation should show:

- Work title.
- Summary or story cue.
- Rating and warning context.
- Completion / publication state.
- Key metadata enough for reader selection.

Why: In Fandom Harbor, authors are known through preserved works rather than follower count or activity frequency.
Impact: Readers move from creator understanding into story decisions.
Application: UX-06 should treat works as a body of work, not as products, posts or performance units.

### 4.3 Story World

Story world is the sense that an author's works have creative texture and continuity.

Direction:

- Let themes, summaries, series context or work grouping suggest creative range.
- Keep the author's creative voice connected to published works.
- Avoid forcing every author into a branded creator persona.

Why: Fandom Harbor supports many creators and fandom contexts; author identity should be expressive without becoming self-marketing.
Impact: Readers can understand creative atmosphere while works retain individual meaning.
Application: UX-06 can support work grouping or contextual copy only when it serves reading and discovery.

### 4.4 Reader Relationship

Reader relationship should be quiet and work-oriented.

Readers should be able to:

- Understand public attribution.
- Find more published works.
- Return to a specific Work Detail.
- Enter Reading without social pressure.

Readers should not be pushed to:

- Follow.
- Subscribe.
- Join a fan space.
- Compare author popularity.
- Treat author identity as social status.

Why: Fandom Harbor is archive-first, not creator-network-first.
Impact: The author relationship remains respectful and useful without creating social drift.
Application: UX-06 should keep reader actions attached to works and reading paths.

## 5. Visual Direction

Author visual direction:

**Literary Creator Identity Space**

This direction extends Homepage's **Quiet Editorial Harbor**, Archive's **Curated Story Discovery Space**, and Reading's **Private Literary Reading Space** into a public creator context.

Author Profile should visually feel:

- Literary and respectful.
- Calmly personal, but not social.
- Work-centered.
- Identity-boundary aware.
- Editorial rather than promotional.
- Warm without becoming fan-economy branding.

Why: Author Profile needs more human presence than Archive, but less personal exposure than a social profile.
Impact: Readers can recognize the creator while staying oriented toward stories.
Application: UX-06 should balance public author identity and published works without letting either become a social module.

## 6. Layout Philosophy

Author layout should follow an identity-to-works rhythm.

Recommended experience rhythm:

```text
Public identity orientation
-> Creator context
-> Published works as body of work
-> Work selection
-> Story decision / reading
```

Direction:

- Start with public pen-name clarity.
- Use creator context to create trust and literary tone.
- Let published works become the main body of the page.
- Keep navigation back to works and reading clear.
- Keep supporting metadata below identity and work discovery.

Why: Author Profile is a Decision Space that helps readers evaluate creator context and choose works.
Impact: The page becomes readable and purposeful without becoming a personal homepage.
Application: UX-06 should avoid social-profile header patterns, timeline layouts and analytics-led page structures.

Non-decision:

- UX-05D does not define layout columns, profile header structure, avatar size, work card design, breakpoints or component behavior.

## 7. Identity Expression

Identity expression should be text-led and public-boundary aware.

Direction:

- Public pen name should be the identity anchor.
- Bio or creator context should feel literary, not promotional.
- Identity should be expressed through works, tone and attribution.
- Any visual identity element should remain quiet and optional.
- Private account facts must never appear.

Why: The author's public identity is a protected layer between private account and public works.
Impact: Author Profile feels human and authored without becoming a social user profile.
Application: UX-06 should validate byline, profile title, bio/context and identity metadata against this boundary.

## 8. Work Presentation

Published works should feel like a body of work.

Work presentation should:

- Make works easy to browse.
- Preserve rating and warning visibility.
- Keep summaries readable.
- Keep metadata useful for selection.
- Avoid treating works as products, posts or ranked inventory.
- Allow readers to move naturally to Work Detail.

Why: Works are the center of the archive graph and the strongest expression of author identity.
Impact: Readers understand the creator through stories and can choose the next reading path with confidence.
Application: UX-06 should make work presentation consistent with Archive discovery while adding author-context continuity.

## 9. Image Usage

Image usage should be restrained and identity-supportive.

Direction:

- Author identity should not depend on a large avatar or influencer-style profile image.
- If public image or visual treatment exists, it should support literary identity and archive warmth.
- Avoid generic avatar dominance.
- Avoid fandom-specific imagery that implies ownership of the platform identity.
- Avoid promotional banners or creator-brand hero imagery.
- Typography and works should be able to carry the page without images.

Why: Image-heavy profile patterns often signal social media, creator economy or personal branding.
Impact: Author Profile remains archive-first and works-centered.
Application: UX-06 should treat imagery as optional support, not the primary identity system.

## 10. Metadata Usage

Metadata should support reader selection and identity boundaries.

Metadata should:

- Clarify works through rating, warnings, category, language, status and tags.
- Keep author-level identity public and minimal.
- Keep statistics supporting and non-competitive.
- Avoid making popularity or output volume the primary identity.
- Preserve warning visibility on work entries.

Metadata should not:

- Expose private account details.
- Rank the author.
- Turn works into performance tiles.
- Hide work-level warnings under author branding.

Why: Metadata is a reader safety and discovery tool, not a creator-status system.
Impact: Readers can choose works safely while authors avoid social-comparison pressure.
Application: UX-06 should keep work metadata readable and author metrics restrained.

## 11. Forbidden Experience

Author Profile must avoid:

- Social media homepage feeling.
- Follower economy.
- Fan club framing.
- Public author ranking.
- Creator leaderboard or popularity competition.
- Activity timeline.
- Normal user profile pattern.
- CMS author backend feeling.
- Studio management controls for ordinary readers.
- Draft or unpublished works.
- Private account identity, email or admin-only facts.
- Works presented as products or storefront inventory.
- Analytics dashboards or traffic-performance language.

Why: These patterns conflict with Fandom Harbor's pen-name separation, archive-first identity and no-social-drift principles.
Impact: Authors remain safe and respected, while readers experience author identity through stories rather than status.
Application: UX-06 should use this list as Author Profile implementation review guardrails.

## 12. Homepage / Archive / Author / Reading Relationship

Homepage, Archive, Author and Reading form a continuous reader experience:

```text
Homepage
-> enters the literary harbor

Archive
-> discovers stories

Author
-> recognizes the creator and body of work

Work Detail
-> decides whether to enter a specific story

Reading
-> enters the story interior
```

### Homepage Relationship

Homepage is the brand threshold.

Why: It establishes private archive meaning and routes users by access and intent.
Impact: Author Profile should inherit calm editorial trust, not marketing-page energy.
Application: UX-06 should keep Author Profile within the same quiet archive atmosphere.

### Archive Relationship

Archive is the discovery layer.

Why: Archive may introduce public author identity as one of the story-selection signals.
Impact: Author Profile deepens that signal into a body-of-work view.
Application: UX-06 should make Archive-to-Author movement feel like expanding context, not switching into a social profile.

### Author Relationship

Author Profile is the creator identity layer.

Why: It helps readers understand public author context and published works.
Impact: Reader trust and discovery deepen without creating follower mechanics.
Application: UX-06 should connect Author Profile to Work Detail and Reading through published works.

### Reading Relationship

Reading is the story interior.

Why: Once a reader enters a story, prose focus should take over and author context should recede to attribution.
Impact: Author Profile should support entry into reading, not compete with the story itself.
Application: UX-06 should avoid importing profile modules, popularity signals or author promotion into Reading.

## 13. UX-06 Implementation Guidance

When UX-06 begins, Author Profile implementation polish should preserve:

1. Author Profile as public creator identity, not a normal user profile.
2. Public pen name as the identity anchor.
3. Published works as the primary expression of author identity.
4. Work-level rating, warnings, summary and metadata for reader selection.
5. Clear separation between public author identity and private account identity.
6. Quiet literary tone with restrained visual identity.
7. Reader movement from author context to Work Detail and Reading.
8. No social follower, fan-club, ranking or activity-feed mechanics.
9. No Studio controls or draft works for ordinary readers.
10. Continuity with Homepage's Quiet Editorial Harbor, Archive's Curated Story Discovery Space and Reading's Private Literary Reading Space.

UX-06 should avoid:

- Avatar-led social profile layouts.
- Follower or subscriber metrics.
- Public author rankings.
- Creator-commerce storefront patterns.
- CMS backend cues.
- Hidden work warnings.
- Author analytics as identity.
- Private account facts.

UX-05D does not authorize code changes, token changes, component creation, CSS, Tailwind, Figma file generation, route changes, database changes or business logic changes.

## 14. Non-Decisions

This document does not decide:

- Final page layout.
- Final author profile component.
- Avatar or image upload behavior.
- Follow, subscribe or notification features.
- Work grouping implementation.
- Component specifications.
- Font files, color values or spacing values.
- CSS, Tailwind, token or code changes.
- Figma frames or production design.
- Route, database, Supabase or business logic changes.
