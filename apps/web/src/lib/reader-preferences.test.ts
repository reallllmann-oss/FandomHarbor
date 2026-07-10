import { beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_READER_PREFERENCES,
  parseReaderPreferences,
  readReaderPreferences,
  READER_PREFERENCES_STORAGE_KEY,
  writeReaderPreferences,
} from "./reader-preferences";

describe("reader preferences", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips all display preferences through the versioned local key", () => {
    const preferences = {
      fontSize: "large",
      lineHeight: "relaxed",
      measure: "wide",
      theme: "dark",
    } as const;

    expect(writeReaderPreferences(window.localStorage, preferences)).toBe(true);
    expect(
      window.localStorage.getItem(READER_PREFERENCES_STORAGE_KEY),
    ).not.toBe(null);
    expect(readReaderPreferences(window.localStorage)).toEqual(preferences);
  });

  it("uses safe field defaults when stored values are unknown", () => {
    expect(
      parseReaderPreferences(
        JSON.stringify({
          fontSize: "huge",
          lineHeight: "compact",
          measure: "edge-to-edge",
          theme: "dark",
        }),
      ),
    ).toEqual({
      ...DEFAULT_READER_PREFERENCES,
      lineHeight: "compact",
      theme: "dark",
    });
  });

  it("falls back without throwing when storage is missing, corrupt or blocked", () => {
    expect(parseReaderPreferences(null)).toBeNull();
    expect(parseReaderPreferences("not-json")).toBeNull();
    expect(
      readReaderPreferences({
        getItem() {
          throw new Error("blocked");
        },
        setItem() {},
      }),
    ).toBeNull();
    expect(
      writeReaderPreferences(
        {
          getItem() {
            return null;
          },
          setItem() {
            throw new Error("blocked");
          },
        },
        DEFAULT_READER_PREFERENCES,
      ),
    ).toBe(false);
  });
});
