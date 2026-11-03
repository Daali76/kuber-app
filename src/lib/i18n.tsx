"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { ui, type UiKey } from "@data/ui";
import type { Lang, LocalizedString } from "@/lib/types";

const LANG_KEY = "cna-lang";
const LANG_EVENT = "cna-lang-change";

function subscribeLang(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(LANG_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(LANG_EVENT, handler);
  };
}

function getLangSnapshot(): Lang {
  try {
    const v = window.localStorage.getItem(LANG_KEY);
    return v === "fa" ? "fa" : "en";
  } catch {
    return "en";
  }
}

function getServerLangSnapshot(): Lang {
  return "en";
}

export function t(lang: Lang, value: LocalizedString | string): string {
  if (typeof value === "string") return value;
  return value[lang] || value.en;
}

export function useLang(): {
  lang: Lang;
  setLang: (lang: Lang) => void;
  tr: (value: LocalizedString | string) => string;
  ui: (key: UiKey) => string;
} {
  const lang = useSyncExternalStore(
    subscribeLang,
    getLangSnapshot,
    getServerLangSnapshot,
  );

  const setLang = useCallback((next: Lang) => {
    window.localStorage.setItem(LANG_KEY, next);
    window.dispatchEvent(new Event(LANG_EVENT));
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("lang-fa", lang === "fa");
  }, [lang]);

  const tr = useCallback(
    (value: LocalizedString | string) => t(lang, value),
    [lang],
  );

  const uiT = useCallback((key: UiKey) => t(lang, ui[key]), [lang]);

  return useMemo(
    () => ({ lang, setLang, tr, ui: uiT }),
    [lang, setLang, tr, uiT],
  );
}

const LangContext = createContext<ReturnType<typeof useLang> | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const value = useLang();
  return (
    <LangContext.Provider value={value}>{children}</LangContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return ctx;
}
