# Fandom Harbor Glossary

Status: Proposed for Phase 0.6 approval

These terms are canonical across product documentation, database, API, UI and code. New synonyms must redirect to the canonical term rather than creating parallel concepts.

| Term | Official definition |
|---|---|
| Visitor | An unauthenticated or non-admitted person who may see only the introduction/access experience, not gated works. |
| Reader | An account with active archive membership and Reader capabilities. |
| Author | A Reader with a manually granted Author role who may publish through owned Pen Names. |
| Admin | An operational role that manages approved users, Author grants, invitations, content, tags and moderation within scoped permissions. |
| Super Admin | The highest-risk role for Admin elevation, system policy, recovery and exceptional operations; not a daily-use role. |
| Membership | The admission state controlling whether an account may access the gated archive. It is separate from Role. |
| Role Grant | An explicit, auditable assignment of Author, Admin or Super Admin capability. Invitation redemption never creates an elevated Role Grant. |
| Pen Name | A public creator identity owned by one private account. Use “Pen Name,” not persona/alias/马甲 as a separate data concept. |
| Work | The stable archive entity representing one creative work, its metadata, authorship, publication state and ordered Chapters. |
| Chapter | An ordered content unit inside a Work with its own current immutable revision pointer. |
| Series | An explicitly ordered collection of Works. A Series is not a Work and does not contain Chapters directly. |
| Revision | An immutable snapshot of Work or Chapter content/metadata created by an edit or restore. |
| Diff | A comparison between two Revisions. Diff is derived and does not replace revision snapshots. |
| Restore | Creating a new current Revision from an older Revision; history is never overwritten. |
| Tag | A typed metadata label attached to a Work, such as fandom, character, Relationship or additional tag. |
| Canonical Tag | The governed preferred Tag representing equivalent aliases and preserving redirects/history. |
| Relationship | A typed Tag describing a character/person pairing or relationship (often called CP). Use `Relationship` as the canonical English domain term. |
| Rating | A controlled content-intensity/audience classification displayed before reading. |
| Warning | A controlled or policy-approved content warning displayed before reading; it is distinct from Rating. |
| Bookmark | A Reader's saved Work record, potentially private/public and containing private notes. |
| Recommendation | An explicit Bookmark state indicating the Reader recommends the Work; it is not an algorithmic ranking. |
| Kudos | A lightweight appreciation action with one active record per Reader/Work under the current proposed semantics. |
| Comment | A work/chapter-attached response. It is archive-centered interaction, not a general forum post. |
| Anonymous Comment | A Comment whose public attribution is hidden under the approved policy; exact moderator accountability remains KI-002. |
| Invitation | A revocable, expiring, usage-limited secret that may admit a Reader but never grants an elevated role. |
| Invitation Chain | The traceable ancestry from an Invitation creator through redemptions and later Invitations; it represents trust provenance, not automatic collective guilt. |
| Report | A reasoned moderation request against a defined target, optionally with private evidence. |
| Moderation | The accountable human workflow that reviews Reports and content/user actions under policy. |
| Audit Log | An append-only record of privileged/security-significant actions including actor, action, target, time and reason/correlation. |
| Reading History | Sensitive, private behavioral data about previously read Works/Chapters; distinct from current Reading Progress. |
| Reading Progress | The Reader's current position in a Work/Chapter used to resume reading. |
| Feature Flag | A governed availability control. It never replaces authorization, migrations or documented product decisions. |
| Product Phase | A product-evolution stage with goals, scope, acceptance and risks. |
| Sprint | A bounded engineering execution unit inside one Product Phase. |

## Vocabulary governance

- Database/API names use canonical English terms consistently.
- UI localization may translate a term, but the translation maps back to one canonical concept.
- Ambiguous words such as “user,” “post,” “feed,” “like” and “profile” require context or replacement with the canonical term.
- Glossary changes must update affected requirements, ERD, contracts and UI copy guidance.

