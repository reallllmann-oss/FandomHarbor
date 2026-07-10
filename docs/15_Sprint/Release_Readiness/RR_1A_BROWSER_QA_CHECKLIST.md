# V1 Beta Browser QA Checklist

Created by: Mission RR-1A  
Execution status: RR-1C final Browser QA and Mobile QA pass; Product Owner final acceptance pending

Record target URL, deployment ID, database environment, tester, date, browser and viewport
before checking any item. Use synthetic accounts and never paste credentials into this file.

## RR-1B accepted smoke summary

- [x] Production URL loads over HTTPS.
- [x] Home page, Archive, Search, Author and Published Work pages work.
- [x] `/sitemap.xml` and `/robots.txt` work.
- [x] Metadata, Canonical and Open Graph work.
- [x] Browser Smoke Test passes.
- [x] Console has no severe errors; Network has no abnormal failures.
- [x] Responsive Layout works.

## RR-1C final QA summary

- [x] Desktop viewport 1440 × 1000 passes.
- [x] Mobile viewport 390 × 844 passes.
- [x] Home, Archive, Search and Author public pages pass.
- [x] Published Work, Chapter and Studio unauthenticated guards pass.
- [x] `/sitemap.xml` and `/robots.txt` pass.
- [x] Metadata, Canonical and Open Graph checks pass.
- [x] Horizontal overflow checks pass.
- [x] Severe console errors = 0.
- [x] Severe network errors = 0.
- [x] Expected Next.js RSC navigation aborts are treated as non-failing automation noise.
- [x] Two generic non-severe 404 console notes are recorded as non-blocking.

## Preconditions

- [ ] Deployment target and Supabase environment are explicitly identified.
- [ ] Web and Admin point to the intended environment.
- [ ] Required migrations are applied and no pending migration exists.
- [ ] Synthetic Visitor, Reader, Author and Admin test identities are available.
- [ ] Browser starts with a clean session; stale local cookies are removed.

## Visitor / public discovery

- [ ] Landing page loads without console or network errors.
- [ ] Search returns Published Works and public Authors; Draft is absent.
- [ ] Archive pagination, four sorts, URL restoration and boundary correction work.
- [ ] Author public profile loads and lists Published Works only.
- [ ] `/sitemap.xml` and `/robots.txt` return valid content.
- [ ] Canonical, Open Graph and noindex behavior match the SEO acceptance record.

## Auth and Reader

- [ ] Registration-name/password/invitation signup succeeds with a valid invitation.
- [ ] Invalid or reused invitation is rejected without a partial account.
- [ ] Login succeeds and returns to the intended protected route.
- [ ] Unauthenticated protected routes redirect to login.
- [ ] Reader cannot access Author Studio or Admin surfaces.
- [ ] Published Work and Chapter reading, navigation and TXT download work.
- [ ] Reader preferences, history, bookmarks and local shelf recover after refresh.

## Author Studio

- [ ] Author can create a Work and save a Draft.
- [ ] Draft appears in Studio but not Search, Archive, public Author or Sitemap.
- [ ] Author can edit title, summary, category, tags, chapters and body.
- [ ] Publish makes the Work available through Reader, Search, Archive and Author profile.
- [ ] Author cannot read or edit another Author's private Work.
- [ ] Follow / Unfollow and counts remain correct and idempotent.
- [ ] Invitation Relationship shows the correct inviter/invitee relationship.

## Admin and permission boundaries

- [ ] Admin login and authorized dashboard access succeed.
- [ ] Non-Admin users are denied Admin routes.
- [ ] Private identity, owner IDs and registration names are absent from public responses.
- [ ] Draft, inactive membership and cross-owner denial paths remain enforced.

## Responsive and accessibility

- [ ] Core flows pass at desktop width.
- [ ] Core flows pass at 390 × 844 with no horizontal overflow.
- [ ] Keyboard navigation, focus visibility, labels and accessible names are usable.
- [ ] Loading, Empty, Error, Not Found and Permission Denied states have recovery paths.

## Evidence and completion

- [ ] Browser console errors = 0 for critical journeys.
- [ ] Failed network requests are explained or resolved.
- [ ] Screenshots/recordings and exact failing URLs are attached to the release record.
- [ ] New findings are classified P0/P1/P2 and linked to Known Issues.
- [ ] Product Owner signs off the deployed smoke test.
