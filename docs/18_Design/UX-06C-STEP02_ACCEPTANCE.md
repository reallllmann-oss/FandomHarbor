# UX-06C Step 02 Acceptance Record

Mission: UX-06C Reading Track Step 02 — Typography & Reading Rhythm
Status: PASS — Product Owner Accepted
Phase: Implementation Polish

## Completed

- Audited current Reading font family、size、line height、letter spacing、measure、paragraph spacing and heading hierarchy。
- Established a route-local Reading typeface stack using available system serif families only。
- Refined Chapter opening hierarchy and replaced viewport-scaled Chapter title type with discrete responsive sizes。
- Refined structured prose rhythm for paragraphs、headings、lists and blockquotes。
- Replaced the permanently visible Reading settings toolbar with one quiet `Aa` disclosure control。
- Preserved all existing font-size、line-height、measure and theme controls inside an on-demand settings region。
- Preserved Reader font-size、line-height、measure and theme preference values and storage contract。
- Verified Mobile、Tablet and Desktop computed typography and responsive geometry。

## Changed Files

- `apps/web/src/app/globals.css`
- `apps/web/src/app/reading-canvas.tsx`
- `docs/18_Design/DESIGN_STATUS.md`
- `docs/18_Design/UX_PHASE_ROADMAP.md`
- `docs/18_Design/UX-06C-STEP02_ACCEPTANCE.md`
- `.ai/PROJECT_STATUS.md`
- `.ai/MEMORY.md`
- `.ai/CHANGELOG.md`

## Typography Decisions

1. Story prose remains the Primary typography layer；Chapter title is Secondary and UI / metadata remains Supporting。
2. Existing Reader values remain frozen：17 / 19 / 21px font sizes，1.65 / 1.8 / 2 line heights and 58 / 68 / 78ch measures。
3. Standard long-reading baseline remains 19px、1.8 line height and 68ch measure。
4. Reading prose and Chapter title share a system-serif fallback stack supporting Chinese、English and mixed-language text；no font file or external font dependency was added。
5. Letter spacing remains zero / normal；literary feeling comes from typeface、measure and rhythm rather than decorative tracking。
6. Chapter title uses discrete responsive sizes：36px Desktop、32px Tablet and 30px Mobile。It does not scale continuously with viewport width。
7. Chapter label、Work identity and Author identity remain supporting metadata scale and do not compete with prose。

## Reading Rhythm Decisions

1. Paragraphs use spacing without first-line indentation；heavy indentation and heavy spacing are not combined。
2. Standard paragraph separation is `0.95em` and continues to respect the selected line-height variable。
3. In-prose H2 and H3 use the Reading typeface with stronger section separation and quieter post-heading spacing。
4. Lists preserve readable indentation and item spacing without compressing nested paragraphs。
5. Blockquotes keep semantic emphasis through a restrained border、muted text and internal paragraph rhythm。
6. Chapter opening receives stable breathing room before prose without inserting decoration or unrelated content。
7. Long uninterrupted text retains the Step 01 emergency wrapping rule。

## Reading Control Decisions

1. Reading hierarchy is frozen as Story Content > Reading Comfort > Navigation > Controls。
2. The default Reading state does not render the complete settings toolbar；it exposes one quiet `Aa / 阅读设置` button after Chapter context and before prose。
3. The disclosure button keeps a 44px minimum target、visible focus state、`aria-expanded` and `aria-controls` semantics。
4. User activation reveals the existing font size、line height、reading width and light / dark controls inside a labeled settings region。
5. Closing the region restores the Content First reading state without resetting the selected preferences。
6. Preference values and `fandom-harbor.reader-preferences.v1` storage remain unchanged；only the panel's open state is transient and defaults to closed on each page load。
7. Reading controls remain in document flow and never become a permanent dashboard、floating obstruction or settings page。

## Validation

| Validation Item                                | Result                                      |
| ---------------------------------------------- | ------------------------------------------- |
| Desktop 1440 × 900                             | PASS                                        |
| Tablet 768 × 1024                              | PASS                                        |
| Mobile 390 × 844                               | PASS                                        |
| Standard prose size / line height              | PASS — 19px / 34.2px                        |
| Standard prose width                           | 683px Desktop / 641px Tablet / 308px Mobile |
| Chapter title responsive scale                 | 36px / 32px / 30px                          |
| Paragraph separation                           | PASS — approximately 18px at standard size  |
| Maximum preference on Mobile                   | PASS — 21px / 42px / no overflow            |
| Preference persistence after reload            | PASS                                        |
| Complete settings panel hidden by default      | PASS                                        |
| Settings open / adjust / close                 | PASS                                        |
| Settings values preserved after panel close    | PASS                                        |
| Panel state resets closed after reload         | PASS                                        |
| Disclosure semantics / 44px target / focus     | PASS                                        |
| Existing light / dark preference compatibility | PASS                                        |
| Reading Navigation / Chapter Directory         | PRESERVED                                   |
| Heading hierarchy                              | PASS — Chapter H1 remains primary           |
| Light prose / muted contrast                   | PASS — approximately 17.36 / 6.58           |
| Dark prose / muted contrast                    | PASS — approximately 14.00 / 7.14           |
| Reduced Motion contract                        | PRESERVED                                   |
| Zoom / reflow safety                           | PASS — 390px plus maximum preference        |
| Web TypeScript / ESLint                        | PASS                                        |
| Web Vitest                                     | PASS — 79 / 79                              |
| Full repository validation / production build  | PASS                                        |
| Database / Supabase / Migration changes        | NONE                                        |
| Auth / Permission / business logic changes     | NONE                                        |

## Next Step

Recommended next mission: UX-06C Step 03 Reading Interaction。

Step 02 was accepted by the Product Owner on 2026-07-12。Step 03 still requires separate Mission authorization and has not started。
