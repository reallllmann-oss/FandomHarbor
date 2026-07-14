# Fandom Harbor Information Architecture

Status: Proposed for UX-02 Information Architecture Intelligence
Depends on: `BRAND_EXPERIENCE.md`, `VISUAL_DNA.md`, `UX_PRINCIPLES.md`
Scope: Information architecture and experience model only; not UI layout, routing implementation, component design or code

## 1. Purpose

本文基于 UX-01 Brand Experience Foundation，重新审视 Fandom Harbor V1 的信息架构体验模型。

UX-02 的目标不是重命名现有路由、修改导航 UI 或调整业务逻辑，而是定义后续 UX-03 至 UX-06 必须遵守的信息组织方式：

- 用户为什么进入某个页面。
- 页面承担什么体验职责。
- 内容之间如何形成层级。
- 导航如何服务阅读、发现、创作和回访。
- 哪些信息不应该进入某个体验场景。

## 2. UX-01 Foundation Reference

UX-02 继承 UX-01 已验收的方向：

- Brand Direction: 安静、可信、文学、私域、可治理。
- Visual DNA: quiet editorial、private archive、literary calm、precise metadata、long-form comfort。
- UX Principles: Reader First、Content Hierarchy、Emotional Reading、Minimal Interaction、Premium Editorial Experience。
- Rejected drift: 普通 SaaS、论坛、博客、社交 feed、电商促销页、公开热度竞争。

Why: 信息架构必须先保护品牌体验，否则页面关系会自然滑向论坛导航、CMS 后台导航或普通小说站导航。
Impact: 后续导航、页面策略和视觉系统都以作品归档和阅读连续性为中心。
Application: UX-03 Design System Intelligence、UX-04 Page Experience Redesign、UX-05 Figma Intelligence、UX-06 Implementation Polish。

## 3. Current Architecture Analysis

当前 V1 Beta 功能结构可以概括为：

```text
Home
Archive
Work
Chapter
Author
Studio
```

该结构已经完成 Reader -> Author -> Studio -> Publish -> Reading 的功能闭环，但从体验角度仍有几个 IA 问题需要在后续设计中处理。

### 3.1 Current Strengths

| Area              | Existing Value                 | UX Meaning                           |
| ----------------- | ------------------------------ | ------------------------------------ |
| Home              | 提供入口和品牌说明             | 用户知道自己进入的是一个私域归档产品 |
| Archive           | 提供作品发现和浏览             | Reader 可以开始寻找作品              |
| Work Detail       | 提供作品摘要、元数据和章节入口 | Reader 判断是否进入阅读              |
| Chapter / Reading | 提供正文和章节导航             | Reader 完成长文阅读                  |
| Author Profile    | 提供公开作者身份和作品聚合     | Reader 理解作品背后的公开创作者      |
| Studio            | 提供作者创建、管理、保存、发布 | Author 完成作品归档与发布            |

### 3.2 Current IA Risks

| Risk                                           | Why It Matters                                           | Impact                                        | Application                                 |
| ---------------------------------------------- | -------------------------------------------------------- | --------------------------------------------- | ------------------------------------------- |
| Archive / Library meaning overlap              | 当前历史文档中 Archive、Works、Library、Shelf 有语义叠加 | Reader 可能分不清“发现新作品”和“回到我的阅读” | UX-02 navigation model; UX-04 page strategy |
| Studio could feel like CMS                     | Studio 承载作品管理，但品牌方向要求它像创作归档工作台    | Author 可能感到自己在管理后台，而不是维护作品 | Studio IA, Author Journey, Publish Flow     |
| Author profile could drift into social profile | 作者页容易被设计成粉丝主页                               | 违反 No Social Drift 和身份边界原则           | Author Profile strategy                     |
| Work detail could become metadata dump         | 同人归档元数据丰富，未经层级会压过阅读判断               | Reader 无法快速判断是否适合阅读               | Work hierarchy, Archive cards               |
| Reading page could inherit platform chrome     | 阅读页若保留过多全局导航和互动，会打断长读               | 降低 Emotional Reading 和 Minimal Interaction | Reading experience strategy                 |

## 4. Future Experience Architecture

UX-02 建议将 Fandom Harbor V1 的体验架构从“页面集合”调整为“任务空间”：

```text
Entry Space
├── Homepage / Gate
│   └── explains private archive and routes users by access state

Discovery Space
├── Archive
├── Search
└── Metadata exploration
    └── helps readers find works intentionally

Decision Space
├── Work Detail
└── Author Profile
    └── helps readers evaluate story, context and public author identity

Reading Space
├── Chapter Reading
├── Article Reading
└── Reader controls
    └── protects long-form reading and continuity

Return Space
├── Continue Reading
├── Library / History
└── Bookmarks
    └── helps readers resume privately without social pressure

Creation Space
├── Studio
├── Work Draft
├── Manage Work
└── Publish
    └── helps authors preserve and publish works responsibly
```

### Key IA Decision: Separate Discovery From Return

Archive should mean discovery and browsing. Library / History / Continue Reading should mean private return.

Why: A reader who wants “find something new” and a reader who wants “resume something known” have different intent and emotion.
Impact: Discovery pages can prioritize metadata comparison; return pages can prioritize continuity and privacy.
Application: Archive, Reader Library, Homepage signed-in state, mobile navigation.

### Key IA Decision: Treat Studio as Creation Space, Not Backend

Studio should be the author’s workroom for preserving, maintaining and publishing works, not a generic CMS dashboard.

Why: UX-01 defines Author emotion target as “my works are seriously preserved and my identity boundary is respected.”
Impact: Studio hierarchy should prioritize work status, draft safety, publish clarity and recovery paths over analytics or admin-like panels.
Application: Studio overview, Work list, Draft editor, Publish journey.

### Key IA Decision: Reading Space Must Be Narrower Than Product Space

Reading pages should expose only the context needed to read, navigate and recover.

Why: Reading Before Interface is the foundation of Fandom Harbor’s brand experience.
Impact: Global product structure should recede during reading; downstream interaction remains available but not visually dominant.
Application: Reading Page, Chapter navigation, reader preferences, post-reading actions.

## 5. Content Relationship

Fandom Harbor content relationships should be understood as an archive graph, not a social graph.

```text
Story Content
├── Work
│   ├── Chapters
│   ├── Summary
│   ├── Rating / Warnings
│   ├── Category / Language / Status
│   ├── Tags / Relationships / Fandom metadata
│   └── Public Author Identity
├── Article
└── Series (future / planned)

Public Identity
├── Author Profile
├── Pen Name
└── Authored Works

Reader Return
├── Continue Reading
├── History
└── Bookmarks

Interaction
├── Kudos
├── Comments
└── Recommendations
```

### Relationship Rule

Works are the center. Authors, metadata, return states and interactions orbit around works; they do not replace works as the primary object.

Why: Fandom Harbor is a work archive and reading platform, not a creator social network.
Impact: Author pages and interaction surfaces support story discovery and trust without becoming follow/fan hubs.
Application: Author Profile, Work Detail, Archive, Recommendations.

## 6. Information Hierarchy

### 6.1 Primary Content

Primary content is the material the product exists to preserve and read.

| Content                | Why It Is Primary                              | Impact                                                      | Application                   |
| ---------------------- | ---------------------------------------------- | ----------------------------------------------------------- | ----------------------------- |
| Story content          | It is the main reason readers enter and return | Reading pages must protect prose from platform noise        | Reading Page, Article Reading |
| Work title and summary | They define the story before entry             | Readers need fast judgment before committing                | Archive, Work Detail          |
| Chapter structure      | It controls long-form reading continuity       | Navigation must support progress and recovery               | Work Detail, Reading Page     |
| Rating and warnings    | They affect reader safety and consent          | Must appear before content and never hide behind decoration | Work Detail, Reading Page     |

### 6.2 Secondary Content

Secondary content helps readers understand, trust and choose works.

| Content                                 | Why It Is Secondary                                      | Impact                                                              | Application                  |
| --------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------- |
| Public author identity                  | It gives works context without exposing private identity | Author identity supports trust and discovery, not fandom popularity | Work Detail, Author Profile  |
| Category / language / completion status | It helps readers filter and set expectations             | Must be scannable before reading                                    | Archive, Search, Work Detail |
| Metadata and relationships              | They express fandom-specific discovery needs             | Must be structured and governed, not flattened                      | Archive Filters, Work Detail |
| Publish / update state                  | It helps readers decide whether to start or continue     | Should support reading expectation, not urgency manipulation        | Archive, Work Detail         |

### 6.3 Supporting Content

Supporting content enriches the archive but must not dominate reading decisions.

| Content                            | Why It Is Supporting                                   | Impact                                                 | Application                  |
| ---------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ | ---------------------------- |
| Tags                               | Important for discovery but can overwhelm if unbounded | Group and stage tags so they clarify rather than flood | Archive, Search, Work Detail |
| Statistics                         | Useful context but dangerous as popularity signal      | Keep below story, author and metadata hierarchy        | Work cards, Author Profile   |
| Kudos / comments / recommendations | Meaningful interaction but not feed material           | Place downstream from story evaluation and reading     | Work Detail, Post-reading    |
| Reader history / bookmarks         | Private return aids, not public identity               | Support continuity without social pressure             | Library, Continue Reading    |

## 7. Navigation Philosophy

Navigation should answer four questions:

1. Where can I enter the archive?
2. Where can I find something to read?
3. Where can I return to something I was reading?
4. Where can I maintain my own works?

It should not mirror technical routes, database objects, CMS sections or admin module names.

### Home

Purpose: orient users to the private archive and route them according to access state.

Why: Fandom Harbor is invitation-based; the entrance must establish trust and context before sending users into content.
Impact: Home should not behave like a generic marketing page or social landing feed.
Application: Homepage strategy, Visitor flow, signed-in reader entry.

### Archive

Purpose: help readers intentionally discover works.

Why: Archive is where rich metadata becomes useful. It should be a calm catalog, not an endless feed.
Impact: Archive navigation should support browsing, filtering and comparison.
Application: Archive, Search, metadata pages.

### Studio

Purpose: help authors create, maintain and publish works.

Why: Studio is not an admin backend; it is an author’s private workroom.
Impact: Studio navigation should follow creation and maintenance tasks rather than organizational menus.
Application: Studio overview, Works, Draft editor, Publish.

### Profile

Purpose: explain public author identity and connect readers to that author’s published works.

Why: Fandom Harbor separates public pen name from private account. Profile must support trust without becoming a social fan page.
Impact: Profile navigation should center author context and published works, not follower growth or popularity loops.
Application: Author Profile, Work byline, Author Journey.

## 8. Page Responsibility Matrix

### 8.1 Homepage

Purpose: Establish Fandom Harbor as a private literary archive and route users by intent and access state.

Primary User Goal: Understand where they are and continue into the right next action.

Secondary Goal: Communicate invitation, reading, authoring and trust boundaries.

Required Information:

- Product identity as private archive.
- Access state and next step.
- Reader discovery path.
- Author Studio path when authorized.
- Invitation / sign-in / return cues.

Forbidden Information:

- Gated work body previews for visitors.
- Public ranking, trending feed or competitive social proof.
- Generic SaaS feature grid as the main story.
- Admin or backend concepts for ordinary readers.

Why: Home is the threshold into a private literary space.
Impact: It sets expectations for privacy, reading and governance.
Application: Homepage Experience Strategy, Entry Space.

### 8.2 Archive

Purpose: Help readers discover published works through intentional browsing and metadata.

Primary User Goal: Find a work that matches current interest, safety needs and reading mood.

Secondary Goal: Support comparison, filtering and recovery from empty/no-result states.

Required Information:

- Work title.
- Public author identity.
- Summary.
- Rating and warnings.
- Category / language / status.
- Key metadata and tags.
- Update or publish context when relevant.

Forbidden Information:

- Draft or private content.
- Private account identity.
- Popularity-first ranking as the dominant hierarchy.
- Feed-style endless engagement prompts.
- Author management controls.

Why: Archive is the discovery engine of an archive-first product.
Impact: Readers can make informed choices without being pushed by heat or virality.
Application: Archive, Search, Work cards.

### 8.3 Work Detail

Purpose: Help readers decide whether and how to begin reading a specific work.

Primary User Goal: Evaluate the work and enter the correct reading point.

Secondary Goal: Provide story context, author context and chapter structure.

Required Information:

- Title and summary.
- Public author identity.
- Rating and warnings before reading.
- Category, language, completion / publication status.
- Tags and relationship metadata.
- Chapter list and reading entry.
- Continue Reading when valid.

Forbidden Information:

- Unpublished chapters for readers.
- Private author account fields.
- Studio-only edit controls for readers.
- Statistics as the main decision layer.
- Hidden warning patterns that obscure reader consent.

Why: Work Detail is the commitment point between discovery and reading.
Impact: It should reduce uncertainty and protect reader consent.
Application: Work Experience Strategy, Content Hierarchy.

### 8.4 Reading Page

Purpose: Protect uninterrupted long-form reading while preserving chapter orientation and recovery.

Primary User Goal: Read the current chapter or article comfortably.

Secondary Goal: Move to previous/next chapter, adjust reading preferences and return to work context.

Required Information:

- Work / chapter title context.
- Public author identity when needed for context.
- Rating / warning context before or near entry.
- Prose content.
- Chapter position and previous/next navigation.
- Reader preference controls.
- Recovery path to work detail or archive.

Forbidden Information:

- Dominant global navigation.
- Popularity stats beside prose.
- Feed modules.
- Author Studio controls.
- Admin or moderation controls for ordinary readers.
- Decorative motion that delays reading.

Why: Reading is the emotional core of the product.
Impact: The interface recedes and the text becomes the primary experience.
Application: Reading Experience Strategy, Reader Journey.

### 8.5 Author Profile

Purpose: Present a public author identity and their published works without exposing private account identity.

Primary User Goal: Understand who this public author is and find more of their works.

Secondary Goal: Support trust, attribution and return to related works.

Required Information:

- Public display name / pen name.
- Public author bio or context when available.
- Published works.
- Work metadata enough for selection.
- Clear relationship to works, not private account facts.

Forbidden Information:

- Registration name, account email, private user identity or admin-only identity facts.
- Draft works.
- Fan/follower growth framing.
- Social timeline.
- Competitive popularity dashboard.

Why: Author identity supports archive trust and discovery, not social status.
Impact: Readers can follow an author’s public body of work without collapsing identity boundaries.
Application: Author Experience Strategy, Work byline, Profile navigation.

### 8.6 Studio

Purpose: Help authorized authors create, maintain and publish works safely.

Primary User Goal: Manage works, drafts, chapters and publication status with confidence.

Secondary Goal: Understand identity context, recover from errors and move back to reader-facing views.

Required Information:

- Current author capability / Studio context.
- Works and draft / published status.
- Save and publish state.
- Chapter structure.
- Metadata completeness.
- Recovery paths and validation.
- Reader-facing preview or return path when available.

Forbidden Information:

- Generic CMS module clutter.
- Admin-only moderation or user-management concepts.
- Growth analytics as the primary dashboard.
- Reader private history.
- Ambiguous publish state or false save success.

Why: Studio is the author’s private archive workroom.
Impact: Authors feel control and safety rather than dashboard pressure.
Application: Author Journey, Publishing Journey, Studio Experience Strategy.

## 9. Non-Decisions

This document does not decide:

- Final navigation labels.
- URL or route changes.
- Page layout.
- Component structure.
- CSS, Tailwind, token or visual implementation.
- Database, Supabase, permission or business logic changes.
- Figma file creation.

All implementation decisions remain out of scope for UX-02.
