"use client";

import { Suspense } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { WidgetConfig, WidgetSize } from "@/types";
import { getWidgetComponent } from "@/config/widget-registry";
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
}

function WidgetFallback({ title, size }: { title: string; size: string }) {
  return (
    <WidgetShell title={title} size={size as "small" | "medium" | "large" | "full"} loading>
      <div />
    </WidgetShell>
  );
}

export default function SortableWidget({ config, index }: SortableWidgetProps) {
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

  const Component = getWidgetComponent(config.id);

  return (
    <div ref={setNodeRef} style={style} className={sizeClasses[config.size]} {...attributes}>
      <Suspense fallback={<WidgetFallback title={config.title} size={config.size} />}>
        <WidgetShell
          title={config.title}
          size={config.size}
          widgetId={config.id}
          dragListeners={listeners}
          animationDelay={index !== undefined ? index * 50 : 0}
        >
          <Component key={`${config.id}-${refreshKey}`} />
        </WidgetShell>
      </Suspense>
    </div>
  );
}
