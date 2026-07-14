"use client";

import { useAppTheme } from "@fandom-harbor/ui";
import {
  createContext,
  useEffect,
  useContext,
  useRef,
  useState,
  type CSSProperties,
  type PropsWithChildren,
  type ReactNode,
} from "react";

import {
  DEFAULT_READER_PREFERENCES,
  readReaderPreferences,
  writeReaderPreferences,
  type ReaderPreferences,
} from "../lib/reader-preferences";

type ReaderStyle = CSSProperties & {
  "--reader-font-size": string;
  "--reader-line-height": string;
  "--reader-measure": string;
};

type ReadingPanel = "chapter-directory" | "navigation" | "settings";

interface ReadingInteractionContextValue {
  activePanel: ReadingPanel | null;
  closePanel: () => void;
  togglePanel: (panel: ReadingPanel) => void;
}

const ReadingInteractionContext =
  createContext<ReadingInteractionContextValue | null>(null);

function useReadingInteractions() {
  const context = useContext(ReadingInteractionContext);
  if (!context) {
    throw new Error(
      "Reading interactions must be rendered inside ReadingInteractionProvider",
    );
  }
  return context;
}

export function ReadingInteractionProvider({ children }: PropsWithChildren) {
  const [activePanel, setActivePanel] = useState<ReadingPanel | null>(null);

  return (
    <ReadingInteractionContext.Provider
      value={{
        activePanel,
        closePanel: () => setActivePanel(null),
        togglePanel: (panel) =>
          setActivePanel((current) => (current === panel ? null : panel)),
      }}
    >
      {children}
    </ReadingInteractionContext.Provider>
  );
}

export function ReadingDisclosure({
  children,
  className,
  closeLabel,
  expandedLabel,
  panel,
  panelClassName,
  triggerLabel,
  triggerMeta,
}: {
  children: ReactNode;
  className: string;
  closeLabel: string;
  expandedLabel: string;
  panel: Exclude<ReadingPanel, "settings">;
  panelClassName: string;
  triggerLabel: string;
  triggerMeta?: string;
}) {
  const { activePanel, closePanel, togglePanel } = useReadingInteractions();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const open = activePanel === panel;
  const panelId = `reading-${panel}-panel`;

  function closeAndRestoreFocus() {
    closePanel();
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <div className={className} data-open={open || undefined}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className="reading-disclosure-trigger"
        onClick={() => togglePanel(panel)}
        ref={triggerRef}
        type="button"
      >
        <span>{open ? expandedLabel : triggerLabel}</span>
        {triggerMeta ? (
          <span className="chapter-directory-count">{triggerMeta}</span>
        ) : null}
      </button>
      {open ? (
        <div className={panelClassName} id={panelId}>
          {children}
          <button
            className="reading-disclosure-close"
            onClick={closeAndRestoreFocus}
            type="button"
          >
            {closeLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

const fontSizes = [
  { label: "小", value: "small" },
  { label: "中", value: "medium" },
  { label: "大", value: "large" },
] as const;

const lineHeights = [
  { label: "紧凑", value: "compact" },
  { label: "舒适", value: "comfortable" },
  { label: "宽松", value: "relaxed" },
] as const;

const measures = [
  { label: "窄", value: "narrow" },
  { label: "标准", value: "standard" },
  { label: "宽", value: "wide" },
] as const;

const themes = [
  { label: "浅色", value: "light" },
  { label: "深色", value: "dark" },
] as const;

const preferenceStyles = {
  fontSize: {
    large: "1.3125rem",
    medium: "1.1875rem",
    small: "1.0625rem",
  },
  lineHeight: { comfortable: "1.8", compact: "1.65", relaxed: "2" },
  measure: { narrow: "58ch", standard: "68ch", wide: "78ch" },
} as const;

function getBrowserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function ChoiceGroup<Value extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: Value) => void;
  options: ReadonlyArray<{ label: string; value: Value }>;
  value: Value;
}) {
  return (
    <fieldset className="reader-choice-group">
      <legend>{label}</legend>
      <div className="reader-choice-list">
        {options.map((option) => (
          <button
            aria-label={`${label}：${option.label}${value === option.value ? "（当前）" : ""}`}
            aria-pressed={value === option.value}
            className="reader-choice"
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function ReadingCanvas({ children }: PropsWithChildren) {
  const { resolvedTheme, setTheme } = useAppTheme();
  const { activePanel, togglePanel } = useReadingInteractions();
  const initialized = useRef(false);
  const [preferences, setPreferences] = useState(DEFAULT_READER_PREFERENCES);
  const settingsOpen = activePanel === "settings";

  useEffect(() => {
    if (initialized.current || !resolvedTheme) return;
    initialized.current = true;

    const storage = getBrowserStorage();
    const stored = storage ? readReaderPreferences(storage) : null;
    const initial =
      stored ??
      ({
        ...DEFAULT_READER_PREFERENCES,
        theme: resolvedTheme === "dark" ? "dark" : "light",
      } satisfies ReaderPreferences);

    setPreferences(initial);
    if (stored && stored.theme !== resolvedTheme) setTheme(stored.theme);
  }, [resolvedTheme, setTheme]);

  function updatePreference<Key extends keyof ReaderPreferences>(
    key: Key,
    value: ReaderPreferences[Key],
  ) {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      const storage = getBrowserStorage();
      if (storage) writeReaderPreferences(storage, next);
      return next;
    });

    if (key === "theme") setTheme(value as ReaderPreferences["theme"]);
  }

  const style: ReaderStyle = {
    "--reader-font-size": preferenceStyles.fontSize[preferences.fontSize],
    "--reader-line-height": preferenceStyles.lineHeight[preferences.lineHeight],
    "--reader-measure": preferenceStyles.measure[preferences.measure],
  };

  return (
    <section
      aria-label="阅读正文与显示设置"
      className="reader-canvas"
      style={style}
    >
      <div className="reader-settings">
        <button
          aria-controls="reader-settings-panel"
          aria-expanded={settingsOpen}
          className="reader-settings-trigger"
          onClick={() => togglePanel("settings")}
          type="button"
        >
          <span aria-hidden="true" className="reader-settings-glyph">
            Aa
          </span>
          <span>{settingsOpen ? "收起阅读设置" : "阅读设置"}</span>
        </button>

        {settingsOpen ? (
          <div
            aria-labelledby="reader-settings-heading"
            className="reader-settings-panel"
            id="reader-settings-panel"
            role="region"
          >
            <h2 className="sr-only" id="reader-settings-heading">
              阅读显示设置
            </h2>
            <div className="reader-toolbar">
              <ChoiceGroup
                label="字号"
                onChange={(value) => updatePreference("fontSize", value)}
                options={fontSizes}
                value={preferences.fontSize}
              />
              <ChoiceGroup
                label="行高"
                onChange={(value) => updatePreference("lineHeight", value)}
                options={lineHeights}
                value={preferences.lineHeight}
              />
              <ChoiceGroup
                label="宽度"
                onChange={(value) => updatePreference("measure", value)}
                options={measures}
                value={preferences.measure}
              />
              <ChoiceGroup
                label="明暗"
                onChange={(value) => updatePreference("theme", value)}
                options={themes}
                value={preferences.theme}
              />
              <p
                aria-live="polite"
                className="reader-preference-status"
                role="status"
              >
                阅读偏好自动保存在此设备
              </p>
            </div>
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
