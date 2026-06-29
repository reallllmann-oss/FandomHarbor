# Information Architecture

Status: Proposed

## Top-level domains

1. Access: introduction, authentication, invitation redemption and membership state.
2. Archive: works, chapters, series, authorship/pen names and revisions.
3. Metadata: ratings, warnings, fandoms, characters, relationships and additional tags.
4. Discovery: browse, search, filters and canonical-tag destinations.
5. Reading: work/chapter view, navigation, preferences and history.
6. Interaction: Kudos, bookmarks, recommendations and comments.
7. Trust & Safety: reports, evidence, moderation workflow and audit trail.
8. Administration: users, roles, invites, content, tags, reports, analytics and configuration.

## Content hierarchy

```text
Archive
├── Pen Name
│   └── authored Works
├── Series
│   └── ordered Works
└── Work
    ├── metadata and authorship
    ├── ordered Chapters
    ├── Tags / Ratings / Warnings / Relationships
    ├── Versions
    └── Interactions
```

## Metadata taxonomy

- Controlled: rating, warning vocabulary, work state, language and completion state.
- Governed free-form: fandom, character, relationship/CP and additional tags.
- Each tag has a type, lifecycle state and optional canonical destination.
- Synonyms redirect to a canonical tag; merges do not destroy historical tag usage.
- Relationship tags must remain distinguishable from generic tags for filtering and governance.

## Findability rules

- Reader URLs use stable slugs plus immutable IDs where collision/reuse matters.
- Canonical-tag pages explain aliases and preserve inbound links after merges.
- Search and navigation expose only content authorized for the current membership.
- Private drafts, hidden works, report evidence and audit data never enter public search indexes.
- No external search engine may index gated work bodies.

## Ownership of truth

- PostgreSQL is the durable source for archive metadata, identity links, permissions and workflow state.
- TipTap JSON revisions are the durable source for rich work/chapter content.
- Derived HTML, plain text, search vectors, counters and analytics aggregates are rebuildable projections.
- Vercel caches and TanStack Query caches are disposable delivery layers, never authority.

