"use client";

import { startTransition, useState, useEffect, useCallback } from "react";

function getStoredFavorites(view: string): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  const stored = localStorage.getItem(`widget-favorites:${view}`);
  if (!stored) {
    return new Set();
  }

  try {
    return new Set(JSON.parse(stored));
  } catch {
    return new Set();
  }
}

export function useFavorites(view: string) {
  const [favorites, setFavorites] = useState<Set<string>>(() => getStoredFavorites(view));

  useEffect(() => {
    startTransition(() => setFavorites(getStoredFavorites(view)));
  }, [view]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(`widget-favorites:${view}`, JSON.stringify([...next]));
      return next;
    });
  }, [view]);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { favorites, isFavorite, toggleFavorite };
}
