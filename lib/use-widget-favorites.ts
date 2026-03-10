"use client";

import { useState, useEffect, useCallback } from "react";

export function useFavorites(view: string) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem(`widget-favorites:${view}`);
    if (stored) {
      try {
        setFavorites(new Set(JSON.parse(stored)));
      } catch {}
    }
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
