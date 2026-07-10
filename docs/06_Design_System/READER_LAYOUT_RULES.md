# Reader Layout Rules

Status: Accepted; Sprint 002B baseline implemented

- Prose owns the primary visual column.
- Default measure is 68ch and never exceeds the supported 80ch maximum.
- Title, pen name, rating and warnings appear before chapter content.
- Previous/next chapter navigation is labeled and available without gestures.
- Reader controls adjust size, line height, measure and theme without layout loss.
- Progress/history controls are private and never dominate prose.
- Comments and recommendations are downstream of the reading experience, not a feed beside it.
- Mobile safe areas and one-hand reach guide controls without permanently obscuring text.

## Sprint 002B baseline variables

- `--reader-font-size`: default `1.1875rem` (19px), with 17px and 21px alternatives.
- `--reader-line-height`: default `1.8`, with `1.65` and `2` alternatives.
- `--reader-measure`: default `68ch`, with `58ch` and `78ch` alternatives.
- Reader preferences persist for the current browser origin under `fandom-harbor.reader-preferences.v1` and do not become authorization or account settings.
- Preference storage contains no identity, work/chapter ID or reading history and safely falls back when unavailable or corrupt.
