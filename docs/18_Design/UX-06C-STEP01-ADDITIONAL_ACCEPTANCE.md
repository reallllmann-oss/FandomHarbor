# UX-06C Step 01 Additional Acceptance Record

Mission: UX-06C Reading Track Step 01 — Reading Mobile Foundation Correction
Status: PASS — Product Owner Accepted
Phase: Implementation Polish

## Completed

- Retained the existing Reading grid intrinsic-width containment and uninterrupted-text wrapping fix。
- Added a mobile-only、low-distraction Reading Navigation bar。
- Added direct Return to Work、Homepage、Archive / Discovery、Library / Shelf and Search paths。
- Added a collapsible top Reading Navigation panel containing chapter position、previous / next and Chapter Directory。
- Changed the desktop Chapter Directory from permanently open to closed by default。
- Preserved Reading settings、typography、bookmark、history、Auth、permission and data contracts。

## Final Issue Analysis

### Issue 01 — Mobile Reading Layout Overflow

Root cause: uninterrupted prose produced an intrinsic minimum width larger than the mobile Reading grid。The grid then expanded the Reader toolbar and document beyond the viewport。

Resolution: retain `min-width: 0` containment on Reading grid children and `overflow-wrap: anywhere` on prose。No typography or Reader preference value changed。

### Issue 02 — Mobile Reading Navigation Foundation

Root cause: global navigation is intentionally simplified on mobile，while Chapter Reading exposed only breadcrumb、shelf and a jump to the bottom directory。Readers lacked a quiet、local exit model near the reading start。

Resolution: add a mobile Reading Navigation bar with a direct Work return and an on-demand navigation control。Site exits remain Supporting information and do not become a traditional website header。

### Issue 03 — Collapsible Chapter Navigation

Root cause: the Chapter Directory used an always-open native `details` element，permanently consuming reading space。

Resolution: the mobile top panel and desktop bottom directory are closed by default。Mobile opening reveals chapter sequence and directory in normal document flow；closing restores full reading width。Previous / next remains available after prose for natural continuation。

## Changed Files

- `apps/web/src/app/works/[slug]/chapters/[chapterSlug]/page.tsx`
- `apps/web/src/app/globals.css`
- `docs/18_Design/DESIGN_STATUS.md`
- `docs/18_Design/UX_PHASE_ROADMAP.md`
- `docs/18_Design/UX-06C-STEP01-ADDITIONAL_ACCEPTANCE.md`
- `.ai/PROJECT_STATUS.md`
- `.ai/MEMORY.md`
- `.ai/CHANGELOG.md`

## Navigation Decisions

1. Story Content remains Primary；previous / next remains Secondary；site exits remain Supporting。
2. Mobile Reading Navigation is page-local and does not replace or expand the global Header。
3. Return to Work is always visible。Homepage、Archive、Shelf and Search appear only inside the collapsible panel。
4. Shelf uses the existing `/archive#local-shelf-title` destination；no Archive implementation changed。
5. Native `details` / `summary` provides keyboard operation、open / close semantics and no client-state dependency。
6. Navigation expands in document flow，never overlays or obstructs prose。
7. All mobile navigation targets use a minimum 44px height。

## Validation

| Validation Item                                    | Result         |
| -------------------------------------------------- | -------------- |
| Mobile viewport 390 × 844                          | PASS           |
| Continuous prose wrapping                          | PASS           |
| Horizontal overflow                                | NONE           |
| Return to Work                                     | PASS           |
| Homepage / Archive / Shelf / Search entries        | PASS           |
| Open and close Reading Navigation                  | PASS           |
| Current Chapter indicator                          | PASS           |
| Select another Chapter                             | PASS           |
| Previous / next Chapter                            | PASS           |
| Closed state restores full Reading width           | PASS           |
| Desktop 1280 × 720 low-distraction behavior        | PASS           |
| Reading settings and typography values             | UNCHANGED      |
| Work Detail / Chapter Reading / Homepage / Archive | PASS           |
| Reader permission and published-only boundary      | PASS           |
| Database / Supabase / Migration changes            | NONE           |
| Auth / Permission / business logic changes         | NONE           |
| Web Vitest                                         | PASS — 79 / 79 |
| Full repository validation and production build    | PASS           |

## Next Step

The Product Owner accepted UX-06C Step 01 and this Additional Acceptance record on 2026-07-12。UX-06C Step 02 Typography & Reading Rhythm may begin only after separate Mission authorization。
