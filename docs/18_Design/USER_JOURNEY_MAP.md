# Fandom Harbor User Journey Map

Status: Proposed for UX-02 Information Architecture Intelligence
Depends on: `BRAND_EXPERIENCE.md`, `UX_PRINCIPLES.md`, `INFORMATION_ARCHITECTURE.md`
Scope: Journey and experience intent only; not UI flow implementation, routing changes or product feature expansion

## 1. Purpose

本文定义 Fandom Harbor V1 的核心用户路径：New Reader、Returning Reader、Author 和 Publishing Journey。

UX-02 的 Journey Map 不只是页面跳转图，而是说明用户为什么进入下一步、每一步需要解决什么情绪和信息问题、后续页面体验应如何保持 Fandom Harbor 的品牌方向。

## 2. Foundation

UX-01 已确认：

- Reader 应感到“我可以慢慢找，也可以安心读完”。
- Author 应感到“我的作品被认真保存，我的身份边界被尊重”。
- Studio 应像创作和归档工作台，而不是普通后台 CMS。
- 互动和统计不应主导阅读或作品发现。

UX-02 将这些原则转换为用户路径。

## 3. New Reader Journey

Journey:

```text
Landing
-> Discover
-> Select Story
-> Reading
-> Return
```

### 3.1 Landing

User question: “这里是什么？我是否被允许进入？这里是否值得信任？”

User motivation to move forward:

Reader 进入下一步不是因为被营销刺激，而是因为他们理解这是一个受邀进入、重视阅读和归档的私域空间。

Required experience:

- 解释 Fandom Harbor 是私域文学归档。
- 明确进入路径：登录、邀请、继续访问。
- 建立安静、可信、可治理的第一印象。

Why: Invitation gate is part of the brand experience, not a growth funnel.
Impact: New Reader enters discovery with trust instead of confusion.
Application: Homepage, Gate, Auth entry.

### 3.2 Discover

User question: “我现在想读什么？哪些作品符合我的偏好和边界？”

User motivation to move forward:

Reader 进入作品详情，是因为 Archive / Search 提供了足够的标题、摘要、作者、分级、预警和元数据，让他们能做出安全和兴趣判断。

Required experience:

- 浏览 published works。
- 使用元数据理解作品类型和边界。
- 能从空结果、无匹配或筛选过度中恢复。

Why: Discovery is intentional, not feed-driven.
Impact: Reader feels in control of selection rather than pulled by popularity.
Application: Archive, Search, Metadata filters.

### 3.3 Select Story

User question: “这篇作品适合我现在开始读吗？从哪里开始？”

User motivation to move forward:

Reader 进入 Reading，是因为 Work Detail 解决了阅读前的关键判断：内容是什么、谁写的、有什么警告、章节如何开始或继续。

Required experience:

- 标题、摘要、作者、警告和元数据清楚。
- 章节入口清楚。
- Continue Reading 如果存在，应帮助恢复而不是打断判断。

Why: Work Detail is the consent and commitment point before reading.
Impact: Reader starts reading with clarity and emotional readiness.
Application: Work Detail, Chapter list, Continue Reading.

### 3.4 Reading

User question: “我能不能舒服地读下去？”

User motivation to move forward:

Reader 继续阅读或进入下一章，是因为正文体验稳定、章节位置明确、偏好可调、上一章 / 下一章可恢复。

Required experience:

- 正文是视觉中心。
- 章节上下文和导航可见但不抢正文。
- 阅读偏好服务舒适度。
- 互动入口保持下游。

Why: Reading is Fandom Harbor’s core emotional moment.
Impact: Reader can stay with the story without platform pressure.
Application: Reading Page, Chapter navigation, Reader controls.

### 3.5 Return

User question: “下次我怎么回来？”

User motivation to return:

Reader 回来不是因为通知或社交压力，而是因为历史、书签、继续阅读和作品结构让回访自然、私密、可控。

Required experience:

- 继续阅读路径。
- 私有书签 / 历史。
- 回到 Archive 的发现路径。
- 不公开阅读状态。

Why: Return behavior must support reading continuity without virality.
Impact: Reader builds trust in the archive as a long-term reading place.
Application: Reader Library, History, Bookmarks, Homepage signed-in state.

## 4. Returning Reader Journey

Journey:

```text
Landing
-> Continue Reading
-> Library / History
-> Reading
```

### 4.1 Landing

User question: “我之前读到哪里了？”

User motivation to move forward:

Returning Reader 希望快速回到阅读，而不是重新理解产品或重新浏览所有内容。

Required experience:

- 识别 signed-in / returning state。
- 提供继续阅读或 Library 入口。
- 保留 Archive 作为发现新作品的次要路径。

Why: Returning users have memory, not discovery as their only intent.
Impact: The product feels personal without exposing private behavior publicly.
Application: Homepage, Reader entry, Continue Reading module.

### 4.2 Continue Reading

User question: “我能否直接回到上次的位置？”

User motivation to move forward:

Reader 进入 Reading，是因为系统以低摩擦方式恢复他们已知的作品或章节。

Required experience:

- 最近阅读作品或章节。
- 明确标题和位置。
- 失败时提供 Library / Archive recovery。

Why: Long-form reading depends on continuity.
Impact: Reader does not need to reconstruct history manually.
Application: Continue Reading, Work Detail, Reader Library.

### 4.3 Library / History

User question: “我收藏或读过哪些内容？”

User motivation to move forward:

Reader 从 Library / History 进入 Reading，是因为该空间帮助他们在私有回访内容中选择，而不是重新搜索。

Required experience:

- Bookmarks。
- Recent reading history。
- Clear distinction between private return and public discovery。
- Storage failure / empty states with recovery.

Why: Library is a return space, not another public archive feed.
Impact: Reader feels ownership and privacy around reading behavior.
Application: Reader Library, History, Bookmarks.

### 4.4 Reading

User question: “我能否继续沉浸？”

User motivation to continue:

Reader 保持在 Reading，是因为页面恢复了上下文，同时让正文重新成为主角。

Required experience:

- 回到正确章节。
- 保留阅读偏好。
- 章节导航清楚。
- 不用重新经过发现流程。

Why: Returning flow should minimize interaction.
Impact: Reading becomes durable and comfortable across sessions.
Application: Reading Page, Reader preferences, History.

## 5. Author Journey

Journey:

```text
Register
-> Create Work
-> Manage Work
-> Publish
-> Build Identity
```

Note: Author role is manually granted by Admin / Super Admin. Invitation admission alone does not grant Author capability.

### 5.1 Register

User question: “我能否进入这个私域空间？我现在是什么身份？”

User motivation to move forward:

Author starts as a member, then receives author capability through governance. Once authorized, they need to understand Studio as a workroom.

Required experience:

- Clear admission and identity state.
- No implication that invitation equals author permission.
- Author capability appears as a trusted upgrade, not a public self-serve creator funnel.

Why: Manual Author elevation protects governance and archive trust.
Impact: Author identity feels deliberate and controlled.
Application: Gate, Account state, Studio entry.

### 5.2 Create Work

User question: “我如何 safely start preserving a work?”

User motivation to move forward:

Author enters creation because Studio makes the next step clear: title, summary, category, tags and draft state support the first durable archive object.

Required experience:

- Draft creation intent.
- Required metadata clarity.
- Save state and validation.
- No pressure to publish before ready.

Why: Creation is the start of archival responsibility.
Impact: Author feels safe starting drafts without fearing accidental publication.
Application: Studio, New Work, Draft creation.

### 5.3 Manage Work

User question: “我的作品现在处于什么状态？还缺什么？”

User motivation to move forward:

Author continues managing because Studio explains status, content completeness and available next actions.

Required experience:

- Work list and status.
- Draft / published distinction.
- Chapter structure.
- Metadata completeness.
- Recovery from empty / error states.

Why: Management should be about stewardship, not dashboard administration.
Impact: Studio supports calm maintenance and reduces publishing mistakes.
Application: Studio Work list, Work detail, Editor.

### 5.4 Publish

User question: “发布后读者会看到什么？我是否准备好了？”

User motivation to move forward:

Author publishes only after understanding content state, metadata, warnings and reader-facing result.

Required experience:

- Clear publish intent.
- Save-before-publish confidence.
- Reader-facing outcome clarity.
- Recovery if publish fails.

Why: Publish changes reader visibility and author responsibility.
Impact: Authors trust the system and avoid accidental exposure.
Application: Publish flow, Studio save state, Preview / reader return.

### 5.5 Build Identity

User question: “读者如何理解我公开展示的作者身份？”

User motivation to move forward:

Author identity grows through published works and public profile context, not through follower mechanics or social status loops.

Required experience:

- Public author profile.
- Published works.
- Pen name / public identity clarity.
- No private account leakage.

Why: Fandom Harbor protects separation between public pen name and private account.
Impact: Author feels respected and safe while building a body of work.
Application: Author Profile, Work byline, Studio identity context.

## 6. Publishing Journey

Journey:

```text
Draft Intent
-> Metadata Definition
-> Body Creation
-> State Review
-> Publish
-> Reader Verification
```

### 6.1 Draft Intent

Author begins with a safe draft, not a public post.

Why: Fandom Harbor is an archive, and archival objects need stable drafts before publication.
Impact: Authors can start without public pressure.
Application: Studio, New Work.

### 6.2 Metadata Definition

Author provides category, warnings, tags and summary to help readers decide.

Why: Metadata is not decoration; it is part of reader consent and discovery.
Impact: Better Archive quality and safer reading decisions.
Application: Work creation, Work management, Publish review.

### 6.3 Body Creation

Author writes or edits story content.

Why: Story content is primary content.
Impact: Editing experience must prioritize content safety and save clarity.
Application: Draft editor, Chapter management.

### 6.4 State Review

Author checks readiness before publication.

Why: Publish changes visibility; ambiguous states reduce trust.
Impact: Authors understand what readers will see.
Application: Publish flow, Work detail preview.

### 6.5 Publish

Author intentionally makes content reader-visible.

Why: Publication is an archival transition, not just a button action.
Impact: The transition should feel deliberate and recoverable.
Application: Publish action, Success state, Reader return.

### 6.6 Reader Verification

Author can view the reader-facing result.

Why: Authors need confidence that the public presentation matches intent.
Impact: Builds trust in Studio and reduces support burden.
Application: Reader-facing Work link, Published state.

## 7. Key Experience Moments

| Moment               | User Emotion Target | Why                                       | Impact                                      | Application       |
| -------------------- | ------------------- | ----------------------------------------- | ------------------------------------------- | ----------------- |
| First entrance       | 被邀请、安心        | Private archive begins at the threshold   | Trust before discovery                      | Homepage / Gate   |
| First archive browse | 可发现、有秩序      | Reader needs controlled exploration       | Avoids feed pressure                        | Archive / Search  |
| Work selection       | 清楚、有边界        | Reader consent depends on metadata        | Better reading readiness                    | Work Detail       |
| First chapter        | 沉浸、安静          | The story must take over                  | Interface recedes                           | Reading Page      |
| Return visit         | 可回访、私密        | Long reading happens across sessions      | Builds archive loyalty without virality     | Library / History |
| First draft          | 安全、可保存        | Author needs confidence before publishing | Reduces fear of loss or accidental exposure | Studio            |
| Publish              | 审慎、明确          | Publishing changes visibility             | Author trust and reader clarity             | Publish Journey   |
| Public author view   | 被尊重、有边界      | Identity separation matters               | Supports discovery without social drift     | Author Profile    |

## 8. Journey Guardrails

- Do not turn New Reader into a marketing conversion funnel.
- Do not turn Returning Reader into a notification or engagement loop.
- Do not turn Author Studio into a generic CMS.
- Do not turn Author Profile into a fan/social page.
- Do not let Kudos, comments or recommendations become the dominant journey driver.
- Do not expose private account identity or draft content in reader journeys.

## 9. Non-Decisions

This document does not decide:

- Exact navigation labels.
- Exact page layouts.
- Route changes.
- UI components.
- Figma prototype structure.
- CSS, Tailwind or Design Token changes.
- Database, Supabase or business logic changes.
