# Fandom Harbor Page Experience Strategy

Status: Proposed for UX-02 Information Architecture Intelligence
Depends on: `BRAND_EXPERIENCE.md`, `VISUAL_DNA.md`, `UX_PRINCIPLES.md`, `INFORMATION_ARCHITECTURE.md`, `USER_JOURNEY_MAP.md`
Scope: Page experience strategy only; not layout, component, CSS, visual implementation or routing changes

## 1. Purpose

本文定义 Fandom Harbor V1 关键页面的未来体验策略：

- Homepage
- Archive
- Work
- Reading
- Author
- Studio

本文件只定义页面体验方向，不进入 layout、component、CSS、Design Token、Figma 或前端实现。

## 2. Strategy Principles

后续页面体验必须遵守 UX-01 和 UX-02 的共同约束：

- 作品和阅读优先于平台展示。
- 发现是有意图的，不是 feed。
- Studio 是作者创作归档工作台，不是 CMS。
- Author Profile 是公开作者身份，不是社交主页。
- Reading Page 是沉浸空间，不是内容详情页的延伸广告位。
- Navigation 服务用户任务，不服务技术结构。

## 3. Homepage Experience Strategy

### Experience Role

Homepage 是 Fandom Harbor 的 threshold：它解释这里是什么、谁可以进入、当前用户下一步应该做什么。

### Future Direction

Homepage 应从“功能入口集合”升级为“私域文学归档入口”。它需要同时服务 Visitor、Reader 和 Author，但不能变成营销落地页、SaaS 功能页或公开社区首页。

### Primary User Goal

- Visitor: 理解 Fandom Harbor 是邀请制私域归档，并找到登录 / 邀请路径。
- Reader: 回到发现或继续阅读。
- Author: 进入 Studio 或回到 Reader 空间。

### Experience Strategy

| Strategy                                | Why                                                         | Impact                                                 | Application                             |
| --------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------- |
| Treat Home as entry threshold           | Invitation-first product needs a calm gate                  | Users understand trust and access before content       | Visitor state, signed-in state          |
| Route by intent, not feature list       | Different users arrive with different memory and capability | Reduces confusion and supports minimal interaction     | Continue Reading, Archive, Studio entry |
| Keep brand explanation quiet and useful | UX-01 rejects growth funnel language                        | Home feels like a private archive, not a campaign page | Hero copy, access explanation           |

### Must Avoid

- Public trending modules.
- Gated story body previews for unauthenticated visitors.
- Generic “features / pricing / testimonials” SaaS structure.
- Large social proof blocks.
- Admin or backend concepts in the primary reader entry.

### Non-Implementation Boundary

This strategy does not define hero layout, card design, navigation placement, visual assets or copy finalization.

## 4. Archive Experience Strategy

### Experience Role

Archive is the discovery catalog. It helps readers find works intentionally through story identity and metadata.

### Future Direction

Archive should feel like a curated, searchable literary catalog. It should support comparison and discovery without becoming an endless feed or popularity board.

### Primary User Goal

Find a work that matches current reading intent, content boundaries and metadata preferences.

### Experience Strategy

| Strategy                                    | Why                                                         | Impact                                                    | Application                 |
| ------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------- | --------------------------- |
| Make metadata useful before it is beautiful | Archive value comes from ratings, warnings, tags and status | Readers choose with confidence                            | Work cards, filter strategy |
| Separate discovery from return              | Browse intent differs from continue-reading intent          | Archive stays focused and Reader Library can stay private | Archive, Library / History  |
| Avoid popularity-first hierarchy            | Fandom Harbor rejects public competitive ranking            | Works are selected by fit, not heat                       | Sorts, stats placement      |
| Support recovery from over-filtering        | Rich metadata can produce empty states                      | Readers feel guided, not stuck                            | Empty / no-result strategy  |

### Required Information

- Work title.
- Public author identity.
- Summary.
- Rating and warnings.
- Category / language / completion status.
- Key tags and relationship metadata.
- Update context when it helps discovery.

### Forbidden Information

- Draft content.
- Private account identity.
- Studio controls.
- Feed engagement prompts.
- Public ranking as the dominant structure.

### Non-Implementation Boundary

This strategy does not define card dimensions, filter components, pagination UI, visual grouping or sort implementation.

## 5. Work Experience Strategy

### Experience Role

Work Detail is the reader’s decision page. It turns discovery into a reading commitment.

### Future Direction

Work Detail should make the work legible and safe to enter: what it is, who it is by, what boundaries it carries, and where to begin or resume.

### Primary User Goal

Decide whether to start / continue reading and choose the correct entry point.

### Experience Strategy

| Strategy                          | Why                                             | Impact                                 | Application                                  |
| --------------------------------- | ----------------------------------------------- | -------------------------------------- | -------------------------------------------- |
| Put reader consent before reading | Rating and warnings affect safety and readiness | Reader starts with clarity             | Warning / rating hierarchy                   |
| Treat summary as story invitation | Summary bridges metadata and prose              | Work feels literary, not database-like | Work detail content order                    |
| Make chapter structure visible    | Long-form reading needs orientation             | Reader understands scope and path      | Chapter list, continue reading               |
| Keep interactions downstream      | Interaction should follow story evaluation      | Avoids social pressure before reading  | Kudos / comments / recommendations placement |

### Required Information

- Title.
- Summary.
- Public author identity.
- Rating and warnings.
- Category, language, status.
- Tags and relationship metadata.
- Chapter entry and continue reading when valid.

### Forbidden Information

- Private author account identity.
- Draft chapters.
- Studio-only edit controls for readers.
- Hidden warning patterns.
- Statistics as the primary visual anchor.

### Non-Implementation Boundary

This strategy does not decide layout columns, warning component design, tag chip style or chapter list UI.

## 6. Reading Experience Strategy

### Experience Role

Reading is the emotional core of Fandom Harbor. It is where the product should disappear enough for the story to take over.

### Future Direction

Reading pages should create a stable, quiet, long-form reading environment. They should preserve orientation and recovery without turning into a general content detail page.

### Primary User Goal

Read comfortably and continue across chapters or sessions.

### Experience Strategy

| Strategy                                | Why                                    | Impact                                    | Application                  |
| --------------------------------------- | -------------------------------------- | ----------------------------------------- | ---------------------------- |
| Let prose own the page                  | UX-01 defines Reading Before Interface | Reader can stay immersed                  | Chapter / Article reading    |
| Keep navigation contextual              | Readers still need chapter orientation | Movement feels safe without crowding text | Previous / next, work return |
| Make preferences supportive             | Comfort differs by reader and device   | Long reading becomes sustainable          | Reading preferences          |
| Push interactions after reading context | Interaction should not interrupt prose | Maintains emotional continuity            | Comments, Kudos, bookmarks   |

### Required Information

- Work and chapter context.
- Prose content.
- Chapter position.
- Previous / next navigation.
- Reader preferences.
- Recovery path to Work or Archive.

### Forbidden Information

- Dominant global nav.
- Side feed.
- Popularity modules beside prose.
- Decorative motion that delays reading.
- Studio / Admin controls for ordinary readers.

### Non-Implementation Boundary

This strategy does not decide reading toolbar placement, typography values, sticky behavior, CSS or motion timing.

## 7. Author Experience Strategy

### Experience Role

Author Profile presents public author identity and helps readers discover the author’s published works.

### Future Direction

Author Profile should feel like a literary author page inside a private archive, not a social profile or fan hub.

### Primary User Goal

Understand the public author identity and find more published works by that author.

### Experience Strategy

| Strategy                                   | Why                                        | Impact                                      | Application                     |
| ------------------------------------------ | ------------------------------------------ | ------------------------------------------- | ------------------------------- |
| Protect public/private identity separation | Product decisions require pen-name privacy | Author feels safe and respected             | Author Profile, Work byline     |
| Center works over popularity               | Fandom Harbor is archive-first             | Profile supports reading, not social status | Published works list            |
| Use author context to deepen trust         | Readers benefit from public author framing | Profile feels literary and useful           | Bio, attribution, work grouping |

### Required Information

- Public display name or pen name.
- Public bio/context when available.
- Published works.
- Work metadata enough for selection.
- Clear link back to works and reading.

### Forbidden Information

- Private registration identity.
- Account email or admin identity facts.
- Draft works.
- Fan/follower growth framing.
- Social timeline or public ranking.

### Non-Implementation Boundary

This strategy does not decide profile layout, avatar treatment, biography component, follow UI or visual style.

## 8. Studio Experience Strategy

### Experience Role

Studio is the Author creation and archive stewardship space.

### Future Direction

Studio should help Authors create, manage, save and publish works with confidence. It should not look or feel like a generic backend CMS, marketing dashboard or analytics control panel.

### Primary User Goal

Maintain works safely and understand what is draft, published, incomplete or ready.

### Experience Strategy

| Strategy                              | Why                                               | Impact                                                | Application                     |
| ------------------------------------- | ------------------------------------------------- | ----------------------------------------------------- | ------------------------------- |
| Organize around work stewardship      | Authors maintain archive objects, not CMS entries | Studio feels purpose-built for writing and publishing | Studio overview, Work list      |
| Make state and consequence explicit   | Save and publish are trust-critical               | Reduces fear of loss and accidental exposure          | Draft editor, publish flow      |
| Keep reader-facing connection visible | Authors need to verify public result              | Builds confidence after publishing                    | Reader return, public work link |
| Keep analytics secondary              | Growth metrics can distort author experience      | Studio stays aligned with archive values              | Studio dashboard strategy       |

### Required Information

- Author capability context.
- Work status.
- Draft / published distinction.
- Save / publish feedback.
- Chapter structure.
- Metadata completeness.
- Recovery path.
- Reader-facing result after publish.

### Forbidden Information

- Admin user-management concepts.
- Generic CMS modules.
- Public ranking pressure.
- Reader private behavior.
- Ambiguous save or publish state.

### Non-Implementation Boundary

This strategy does not decide Studio layout, sidebar design, form components, editor implementation, mutation behavior or route changes.

## 9. Cross-Page Experience Relationships

| From     | To                         | Relationship                                     |
| -------- | -------------------------- | ------------------------------------------------ |
| Homepage | Archive                    | Entry to intentional discovery                   |
| Homepage | Continue Reading / Library | Entry to private return                          |
| Archive  | Work                       | Discovery to decision                            |
| Work     | Reading                    | Decision to immersion                            |
| Reading  | Work                       | Context recovery                                 |
| Work     | Author                     | Story to public identity                         |
| Author   | Work                       | Public identity to published works               |
| Studio   | Work / Reading             | Author stewardship to reader-facing verification |

Why: Fandom Harbor’s IA should be a loop of discovery, reading, return and creation, not a flat nav bar.
Impact: Each page knows what it hands off to the next page.
Application: UX-04 Page Experience Redesign, UX-05 Figma Intelligence.

## 10. Design System Implications for UX-03

UX-02 does not define visual tokens, but it establishes what UX-03 must support:

- Distinct treatment for discovery, decision, reading, return and creation spaces.
- Metadata hierarchy that is scannable but not noisy.
- Reading-first typography and motion restraint.
- Studio state clarity without backend visual language.
- Author identity treatment that protects public/private separation.
- Navigation patterns that support intent and recovery.

## 11. Non-Decisions

This document does not decide:

- Layout.
- Component design.
- CSS / Tailwind.
- Design Tokens.
- Figma frames.
- Copy finalization.
- Route changes.
- Database, Supabase or business logic.
