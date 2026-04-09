import type { AiCapacityPlannerResponse } from "@/types";

export function mockGenerateCapacityPlanner(): AiCapacityPlannerResponse {
  return {
    resources: [
      {
        type: "CPU",
        current: 68,
        dailyGrowth: 0.3,
        threshold80: "~40 days",
        threshold90: "~73 days",
        summary: "CPU will reach 80% in ~40 days at the current trajectory.",
      },
      {
        type: "Memory",
        current: 74,
        dailyGrowth: 0.4,
        threshold80: "~15 days",
        threshold90: "~40 days",
        summary: "Memory is the tightest resource and should be scaled before the next demand spike.",
      },
      {
        type: "Disk",
        current: 61,
        dailyGrowth: 0.2,
        threshold80: "~95 days",
        threshold90: "~145 days",
        summary: "Disk headroom remains healthy for the next quarter.",
      },
      {
        type: "Network",
        current: 52,
        dailyGrowth: 0.15,
        threshold80: "~187 days",
        threshold90: "~253 days",
        summary: "Network bandwidth remains well inside comfortable limits.",
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}
