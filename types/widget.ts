export type WidgetSize = "small" | "medium" | "large" | "full";

export interface WidgetConfig {
  id: string;
  title: string;
  size: WidgetSize;
  category: string;
  requiredCategories?: string[];
}

export type ViewType = "c-level" | "business" | "technical";
