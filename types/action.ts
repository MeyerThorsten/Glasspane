export type ActionSeverity = "critical" | "warning" | "info";

export interface RecommendedAction {
  id: string;
  title: string;
  severity: ActionSeverity;
  category: string;
  rationale: string;
  suggestedSteps: string[];
  relatedEntity?: string;
}
