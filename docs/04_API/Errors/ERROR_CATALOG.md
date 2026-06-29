# Error Catalog

| Code | Meaning |
|---|---|
| `VALIDATION_ERROR` | Input failed schema/domain validation |
| `UNAUTHENTICATED` | No valid trusted identity |
| `MEMBERSHIP_REQUIRED` | Identity lacks active archive admission |
| `FORBIDDEN` | Role, ownership or field permission denied |
| `NOT_FOUND` | Missing or intentionally concealed resource |
| `CONFLICT` | Stale revision, duplicate action or invalid transition |
| `RATE_LIMITED` | Abuse/rate policy blocked the request |
| `CONTENT_REJECTED` | Unsafe or unsupported content/upload |
| `INTERNAL_ERROR` | Correlated server failure with no sensitive detail |

New codes require one meaning, recovery guidance and contract/version review. User-facing copy is localized separately from stable codes.

