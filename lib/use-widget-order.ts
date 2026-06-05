"use client";

import { startTransition, useState, useCallback, useEffect } from "react";
import { WidgetConfig } from "@/types";
import { arrayMove } from "@dnd-kit/sortable";

function getStorageKey(view: string) {
  return `widget-order:${view}`;
}

function resolveStoredOrder(view: string, defaults: WidgetConfig[]) {
  if (typeof window === "undefined") {
    return { widgets: defaults, hasCustomOrder: false };
  }

  try {
    const saved = localStorage.getItem(getStorageKey(view));
    if (!saved) {
      return { widgets: defaults, hasCustomOrder: false };
    }

    const savedIds: string[] = JSON.parse(saved);
    const defaultMap = new Map(defaults.map((w) => [w.id, w]));
    const ordered: WidgetConfig[] = [];

    for (const id of savedIds) {
      const config = defaultMap.get(id);
      if (config) {
        ordered.push(config);
        defaultMap.delete(id);
      }
    }

    for (const config of defaultMap.values()) {
      ordered.push(config);
    }

    return { widgets: ordered, hasCustomOrder: true };
  } catch {
    return { widgets: defaults, hasCustomOrder: false };
  }
}

export function useWidgetOrder(view: string, defaults: WidgetConfig[]) {
  const [initialState] = useState(() => resolveStoredOrder(view, defaults));
  const [widgets, setWidgets] = useState<WidgetConfig[]>(initialState.widgets);
  const [hasCustomOrder, setHasCustomOrder] = useState(initialState.hasCustomOrder);

  useEffect(() => {
    startTransition(() => {
      const next = resolveStoredOrder(view, defaults);
      setWidgets(next.widgets);
      setHasCustomOrder(next.hasCustomOrder);
    });
  }, [view, defaults]);

  const reorder = useCallback(
    (activeId: string, overId: string) => {
      setWidgets((prev) => {
        const oldIndex = prev.findIndex((w) => w.id === activeId);
        const newIndex = prev.findIndex((w) => w.id === overId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const next = arrayMove(prev, oldIndex, newIndex);
        localStorage.setItem(
          getStorageKey(view),
          JSON.stringify(next.map((w) => w.id))
        );
        setHasCustomOrder(true);
        return next;
      });
    },
    [view]
  );

  const reset = useCallback(() => {
    localStorage.removeItem(getStorageKey(view));
    setWidgets(defaults);
    setHasCustomOrder(false);
  }, [view, defaults]);

  return { widgets, reorder, reset, hasCustomOrder };
}
