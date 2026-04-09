import { mockGenerateChat, mockGenerateSummary } from "../mock";
import { mockGenerateInsights } from "../mock-insights";
import { mockGenerateRiskBriefing } from "../mock-risk-briefing";
import { mockGenerateSlaRiskAdvisor } from "../mock-sla-risk-advisor";
import { mockGenerateCostForecast } from "../mock-cost-forecast";
import { mockGenerateCapacityPlanner } from "../mock-capacity-planner";
import { mockGenerateRootCausePatterns } from "../mock-root-cause-patterns";
import { mockGenerateChangeImpact } from "../mock-change-impact";
import type { AiProviderClient } from "./types";

export const mockProvider: AiProviderClient = {
  id: "mock",
  async generateText(request) {
    switch (request.task) {
      case "summary":
        return mockGenerateSummary(request.metadata?.view ?? "c-level");
      case "chat":
        return mockGenerateChat(
          request.metadata?.question || request.messages[request.messages.length - 1]?.content || "",
        );
      case "insights":
        return JSON.stringify(mockGenerateInsights());
      case "risk-briefing":
        return JSON.stringify(mockGenerateRiskBriefing());
      case "sla-risk":
        return JSON.stringify(mockGenerateSlaRiskAdvisor());
      case "cost-forecast":
        return JSON.stringify(mockGenerateCostForecast());
      case "capacity-planner":
        return JSON.stringify(mockGenerateCapacityPlanner());
      case "root-cause-patterns":
        return JSON.stringify(mockGenerateRootCausePatterns());
      case "change-impact":
        return JSON.stringify(mockGenerateChangeImpact());
      default:
        return "";
    }
  },
};
