"use client";
import { useState, useEffect, useCallback } from "react";

/**
 * useLocalStorage — syncs state to localStorage automatically.
 * SSR-safe: initializes from localStorage only on the client.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Read from localStorage once on mount (client only)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) setStoredValue(JSON.parse(item));
    } catch (err) {
      console.warn(`useLocalStorage: could not read key "${key}"`, err);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
          window.localStorage.setItem(key, JSON.stringify(next));
          return next;
        });
      } catch (err) {
        console.warn(`useLocalStorage: could not write key "${key}"`, err);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

/**
 * useRecentCalculators — tracks the last N visited calculator slugs.
 */
export function useRecentCalculators(maxItems = 10) {
  const [recent, setRecent] = useLocalStorage<string[]>("uc_recent", []);

  const trackVisit = useCallback(
    (slug: string) => {
      setRecent((prev) =>
        [slug, ...prev.filter((s) => s !== slug)].slice(0, maxItems)
      );
    },
    [setRecent, maxItems]
  );

  return { recent, trackVisit };
}

/**
 * useBookmarks — manages bookmarked calculators.
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>("uc_bookmarks", []);

  const toggle = useCallback(
    (slug: string) => {
      setBookmarks((prev) =>
        prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
      );
    },
    [setBookmarks]
  );

  const isBookmarked = useCallback(
    (slug: string) => bookmarks.includes(slug),
    [bookmarks]
  );

  return { bookmarks, toggle, isBookmarked };
}
