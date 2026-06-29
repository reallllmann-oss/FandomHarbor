# Navigation Flow and Page Structure

Status: Proposed

## Visitor flow

```text
Landing → Sign in
       └→ Redeem invitation → Create/confirm account → Membership admitted → Reader home
```

Pages: landing, product/access explanation, sign in, invitation redemption, recovery, invalid/expired/revoked invitation, access suspended and legal/policy pages. Visitors never receive work previews containing gated content.

## Reader navigation

Primary: Home, Browse, Search, Bookmarks, History, Account.  
Contextual: Work details → chapter reader → chapter navigation → comments.  
Secondary: Series, canonical tag pages, pen-name profile, recommendations and reading preferences.

## Author navigation

Author entry lives within `apps/web` and is shown only to Authors.

Primary: Overview, Works, Series, Pen Names, Invitations, Comments, Analytics.  
Core flow: Works → New/Edit work → metadata → chapters/editor → preview → publish → versions.  
Every editor provides save state, validation summary, preview, publication state and recovery path.

## Admin navigation

`apps/admin` primary: Overview, Users, Roles, Invitations, Works, Tags, Reports, Audit Log, Analytics, Settings.

- Lists preserve filter/search state in shareable URLs when safe.
- Detail pages show summary, status, history and allowed actions.
- Destructive or high-risk actions require reason, confirmation and audit preview.
- Super Admin-only controls are segregated; they do not merely appear as extra buttons in routine screens.

## Page-state contract

Every applicable page defines loading, empty, partial, error, unauthorized, forbidden, suspended, not found, stale/conflict and success states. Forms add dirty-state, autosave/save, validation and retry behavior. Lists add pagination, filter reset and no-results behavior.

## Mobile rules

- Reader primary actions remain reachable with one hand and do not obscure content.
- Metadata collapses progressively without hiding ratings/warnings.
- Chapter navigation never depends on hover.
- Admin dense tables become prioritized cards or horizontal regions with clear labels; risky actions remain explicit.

## URL principles

- Stable IDs protect identity; readable slugs improve comprehension.
- Filter state uses validated query parameters.
- Private identifiers, invitation secrets and report evidence never appear in analytics-friendly URLs.
- Redirects preserve canonical work/tag links after title or tag changes.

