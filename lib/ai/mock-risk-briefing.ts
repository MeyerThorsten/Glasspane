import type { AiRiskBriefingResponse } from "@/types";

export function mockGenerateRiskBriefing(): AiRiskBriefingResponse {
  return {
    items: [
      {
        id: "risk-1",
        severity: "critical",
        text: "Critical CVEs remain open in the web tier. Prioritize the next patch window before exposure compounds.",
      },
      {
        id: "risk-2",
        severity: "warning",
        text: "Operational risk is elevated by recent P2 incident activity. Keep change volume tight until stability improves.",
      },
      {
        id: "risk-3",
        severity: "info",
        text: "SLA headroom remains healthy, but trend it weekly so small degradations do not turn into contract risk.",
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}
