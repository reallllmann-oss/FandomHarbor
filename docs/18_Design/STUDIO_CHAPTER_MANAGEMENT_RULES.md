# Fandom Harbor Studio Chapter Management Rules

Status: Accepted and Frozen as supplemental Studio UX foundation
Phase: UX Design Intelligence
Depends on: `STUDIO_EXPERIENCE.md`, `Figma/STUDIO_VISUAL_DIRECTION.md`, `UX_IMPLEMENTATION_GUIDELINES.md`
Scope: Author Studio / Work Editor chapter management and publish-selection UX rules only；not implementation authorization

## 1. Purpose

This document freezes the experience rules for authors who edit and publish multi-chapter works。

The goal is to protect:

- Current-chapter editing focus。
- Clear saved、unsaved、valid and published states。
- Deliberate chapter publication。
- Efficient selection when several chapters are publishable。
- Mobile usability without flattened chapter sprawl。

Why: A multi-chapter literary work is a structured creative object，not a stack of unrelated CMS records。
Impact: Authors can understand which chapter they are editing and what will become public without scanning an indefinitely long page。
Application: A future independently authorized Author Studio / Chapter Management implementation Mission。

## 2. Experience Hierarchy

### Primary

- Current editing chapter。
- Save state and validation state。
- Publish consequence。

### Secondary

- Chapter sequence and chapter identity。
- Selection of currently publishable chapters。
- Add Chapter entry。

### Supporting

- Last saved time or publication time。
- Other collapsed saved chapters。
- Recovery guidance。

Why: Editing focus and state safety must remain stronger than chapter inventory density。
Impact: The Work Editor stays a creator workspace rather than becoming a database-like chapter dashboard。
Application: Chapter manager hierarchy、responsive composition and publish review。

## 3. Single-Chapter Rule

When a work contains exactly one chapter:

- The editor may retain the existing simple editing experience。
- A separate chapter-management surface is not mandatory。
- Batch selection and Select All are not required。
- Save and publish intent must still remain clear。

Why: Multi-chapter controls add unnecessary cognitive load to a single-chapter work。
Impact: Simple works remain simple while the system can scale when chapter count grows。
Application: Conditional Work Editor composition in the future Studio Mission。

## 4. Multi-Chapter Management Rules

When a work contains more than one chapter:

1. A clear chapter-management region is required。
2. Saved chapters may be collapsed and should not all remain expanded by default。
3. The chapter currently being edited remains expanded and visually distinguished。
4. Selecting `Edit` on another chapter moves editing focus to that chapter and may collapse the previously active chapter。
5. The active chapter must carry an explicit current-editing indicator；highlight alone is insufficient。
6. Each chapter entry exposes chapter number、title、save state and either publication time or last saved time when available。
7. `Add Chapter` remains a clear author command and is not hidden inside unrelated settings。
8. Unsaved work must not be visually confused with a saved chapter record。
9. Multi-chapter content must not be presented as an unordered、permanently expanded stack。

Why: As chapter count grows，a flattened editor makes state comparison difficult and creates a high risk of editing the wrong chapter。
Impact: Authors retain orientation and can move between chapters without losing the current creative task。
Application: Desktop chapter list / editing region and Mobile accordion、drawer or simplified chapter panel。

## 5. Chapter Publish Eligibility

`Publish Selected Chapters` operates only on chapters that are currently eligible to publish。

A chapter must be excluded from publish selection when it is:

- Already published。
- Not publishable under the existing lifecycle or permission rules。
- Failing current validation。
- Currently being edited with unsaved changes。
- Otherwise unavailable to the existing publish action。

Eligibility must be communicated through state and explanation，not color alone。

Why: Selection UI must never imply that an invalid or unsaved chapter can safely become public。
Impact: Batch assistance reduces repetitive work without weakening publication safety。
Application: Publish review、selection controls、disabled states and validation feedback。

## 6. Select All Rules

When multiple eligible chapters exist:

1. The publish region provides `Select All / 全选`。
2. Select All affects only currently eligible chapters。
3. Selection exposes three clear states: none selected、partially selected and all eligible selected。
4. Deselecting one selected chapter changes the aggregate state to partial。
5. Eligibility changes must recalculate the aggregate state；an ineligible chapter cannot remain silently selected。
6. The primary action uses explicit language such as `Publish Selected Chapters / 发布所选章节`。
7. When no eligible chapter is selected，the publish action is disabled or accompanied by an equally explicit blocking message。
8. The selection state must remain understandable to keyboard and screen-reader users；the partial state cannot rely on visual styling alone。

Why: Requiring repetitive per-chapter selection creates avoidable friction，while indiscriminate Select All creates accidental-publication risk。
Impact: Authors can prepare several chapters efficiently and still understand the exact publication scope。
Application: Future publish-selection model、tri-state control and confirmation summary。

## 7. Responsive Rules

### Desktop / Laptop

- May use a chapter list with a current editing region。
- The list may appear left、above or inside a collapsible panel；the exact composition remains open。
- The active chapter must remain visually and textually prominent。
- Publish selection must not compete with save and validation feedback。

### Mobile

- Must not flatten every chapter editor into one long page。
- The active editing chapter receives priority；other saved chapters default to collapsed management entries。
- Chapter management may use a top control、drawer、accordion or simplified panel。
- Select All may sit at the chapter panel start or near publish actions。
- Checkbox、chapter title、state and publish action must not squeeze、overlap or cause horizontal overflow。
- Save and publish actions must remain locatable and unambiguous。

Why: Mobile width cannot safely carry chapter inventory、editing controls and publication choices at equal visual weight。
Impact: The author can edit and publish without losing context or fighting compressed controls。
Application: Mobile Work Editor QA and future responsive component decisions。

## 8. Interaction and Accessibility Rules

- Expand / collapse controls require explicit accessible names and visible focus。
- Current editing state and current selection state must not rely on color alone。
- Interactive targets follow the existing 44px mobile target rule。
- Collapsing another chapter must not discard unsaved content or conceal an unresolved save failure。
- Selection counts and blocking reasons should update close to the publish action。
- Long chapter titles wrap or truncate with an accessible full name；they must not expand the editor horizontally。

Why: Chapter management combines frequent navigation with high-consequence state transitions。
Impact: Authors can operate the editor reliably across pointer、keyboard、touch and assistive technology。
Application: Component semantics、focus management、state messaging and responsive QA。

## 9. Frozen UX Decisions

The following are frozen:

- More than one chapter requires an intentional chapter-management structure。
- Saved non-active chapters can collapse；the active editing chapter remains expanded and clearly identified。
- Add Chapter remains visible。
- Multi-chapter publish selection includes Select All for eligible chapters only。
- Selection supports none、partial and all-eligible states。
- Zero selection cannot trigger publication。
- Published、ineligible、invalid and unsaved chapters cannot be accidentally batch-published。
- Mobile prioritizes the active chapter and avoids flattened chapter sprawl or horizontal overflow。

## 10. Implementation Decisions Still Open

The future implementation Mission may decide，within these frozen rules:

- Left list、top list、accordion、drawer or panel composition。
- Exact component boundaries and state ownership。
- Exact labels after content-design review。
- Whether eligible chapters begin selected or unselected。
- Focus transition details after save、selection or chapter change。
- Confirmation composition and selection summary placement。

These are implementation decisions，not permission to change the frozen UX behavior。

## 11. Out of Scope and Boundary

This foundation does not authorize:

- React、Component、CSS、Tailwind or route changes。
- Database、Supabase、Migration or RLS changes。
- Publish permission or lifecycle changes。
- Reader rendering or visibility changes。
- Auth、Work or Chapter ownership changes。
- Drag sorting、batch deletion、chapter-specific permissions、scheduled publishing or version rollback。
- Site Settings panel、global backend configuration or admin configuration system。

Any code implementation requires a separate Author Studio / Chapter Management Mission。

## 12. Acceptance Contract

Future implementation cannot pass unless it confirms:

- Multi-chapter works are not fully and unorderedly expanded。
- More than one chapter activates a collapsible management structure。
- The active chapter is expanded、highlighted and explicitly identified。
- Other saved chapters can collapse。
- Add Chapter is clear。
- Select All affects eligible chapters only。
- Published、ineligible、invalid and unsaved chapters are excluded from batch publication。
- None、partial and all selection states are clear。
- Zero selection cannot publish。
- Mobile has no chapter-content overflow、editor compression or ambiguous save / publish placement。
- Existing permission、data、route、Reader and publish contracts remain intact。
