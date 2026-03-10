"use client";

import { WidgetConfig } from "@/types";
import { AnomalyProvider } from "@/components/ai/AnomalyContext";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import SortableWidget from "./SortableWidget";

interface WidgetGridProps {
  widgets: WidgetConfig[];
  onReorder?: (activeId: string, overId: string) => void;
  isFavorite?: (id: string) => boolean;
  toggleFavorite?: (id: string) => void;
}

export default function WidgetGrid({ widgets, onReorder, isFavorite, toggleFavorite }: WidgetGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorder) {
      onReorder(active.id as string, over.id as string);
    }
  }

  return (
    <AnomalyProvider>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="widget-grid">
            {widgets.map((config, index) => (
              <SortableWidget
                key={config.id}
                config={config}
                index={index}
                isFavorite={isFavorite ? isFavorite(config.id) : undefined}
                onToggleFavorite={toggleFavorite ? () => toggleFavorite(config.id) : undefined}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </AnomalyProvider>
  );
}
