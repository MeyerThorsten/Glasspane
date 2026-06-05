"use client";

import { Suspense } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { WidgetConfig, WidgetSize } from "@/types";
import { getWidgetElement } from "@/config/widget-registry";
import WidgetShell from "./WidgetShell";
import { useRefresh } from "@/lib/refresh-context";

const sizeClasses: Record<WidgetSize, string> = {
  small: "widget-small",
  medium: "widget-medium",
  large: "widget-large",
  full: "widget-full",
};

interface SortableWidgetProps {
  config: WidgetConfig;
  index?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  dimmed?: boolean;
}

function WidgetFallback({ title, size }: { title: string; size: string }) {
  return (
    <WidgetShell title={title} size={size as "small" | "medium" | "large" | "full"} loading>
      <div />
    </WidgetShell>
  );
}

export default function SortableWidget({ config, index, isFavorite, onToggleFavorite, dimmed }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: config.id });

  const { refreshKey } = useRefresh();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`${sizeClasses[config.size]}${isFavorite ? " ring-1 ring-amber-400/20" : ""}${dimmed ? " opacity-20 pointer-events-none scale-[0.98] transition-all duration-300" : ""}`} {...attributes}>
      <Suspense fallback={<WidgetFallback title={config.title} size={config.size} />}>
        <WidgetShell
          title={config.title}
          size={config.size}
          widgetId={config.id}
          dragListeners={listeners}
          animationDelay={index !== undefined ? index * 50 : 0}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          supportsComparison={config.supportsComparison}
        >
          {getWidgetElement(config.id, `${config.id}-${refreshKey}`)}
        </WidgetShell>
      </Suspense>
    </div>
  );
}
