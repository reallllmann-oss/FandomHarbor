export const READER_PREFERENCES_STORAGE_KEY =
  "fandom-harbor.reader-preferences.v1";

export type ReaderTheme = "dark" | "light";
export type ReaderFontSize = "large" | "medium" | "small";
export type ReaderLineHeight = "comfortable" | "compact" | "relaxed";
export type ReaderMeasure = "narrow" | "standard" | "wide";

export interface ReaderPreferences {
  fontSize: ReaderFontSize;
  lineHeight: ReaderLineHeight;
  measure: ReaderMeasure;
  theme: ReaderTheme;
}

interface ReaderPreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  fontSize: "medium",
  lineHeight: "comfortable",
  measure: "standard",
  theme: "light",
};

const allowedValues = {
  fontSize: new Set<ReaderFontSize>(["small", "medium", "large"]),
  lineHeight: new Set<ReaderLineHeight>(["compact", "comfortable", "relaxed"]),
  measure: new Set<ReaderMeasure>(["narrow", "standard", "wide"]),
  theme: new Set<ReaderTheme>(["light", "dark"]),
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizePreferences(
  value: Record<string, unknown>,
): ReaderPreferences {
  return {
    fontSize: allowedValues.fontSize.has(value.fontSize as ReaderFontSize)
      ? (value.fontSize as ReaderFontSize)
      : DEFAULT_READER_PREFERENCES.fontSize,
    lineHeight: allowedValues.lineHeight.has(
      value.lineHeight as ReaderLineHeight,
    )
      ? (value.lineHeight as ReaderLineHeight)
      : DEFAULT_READER_PREFERENCES.lineHeight,
    measure: allowedValues.measure.has(value.measure as ReaderMeasure)
      ? (value.measure as ReaderMeasure)
      : DEFAULT_READER_PREFERENCES.measure,
    theme: allowedValues.theme.has(value.theme as ReaderTheme)
      ? (value.theme as ReaderTheme)
      : DEFAULT_READER_PREFERENCES.theme,
  };
}

export function parseReaderPreferences(
  serialized: string | null,
): ReaderPreferences | null {
  if (!serialized) return null;

  try {
    const parsed: unknown = JSON.parse(serialized);
    return isRecord(parsed) ? normalizePreferences(parsed) : null;
  } catch {
    return null;
  }
}

export function readReaderPreferences(
  storage: ReaderPreferenceStorage,
): ReaderPreferences | null {
  try {
    return parseReaderPreferences(
      storage.getItem(READER_PREFERENCES_STORAGE_KEY),
    );
  } catch {
    return null;
  }
}

export function writeReaderPreferences(
  storage: ReaderPreferenceStorage,
  preferences: ReaderPreferences,
): boolean {
  try {
    storage.setItem(
      READER_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences),
    );
    return true;
  } catch {
    return false;
  }
}
