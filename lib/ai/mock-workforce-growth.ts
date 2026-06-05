import type { AiWorkforceGrowthResponse } from "@/types";

export function mockGenerateWorkforceGrowthRecommendations(employeeId = "emp-001"): AiWorkforceGrowthResponse {
  return {
    employeeId,
    recommendations: [
      {
        id: "growth-ownership",
        title: "Take one visible ownership lane",
        rationale:
          "Recent delivery signals show readiness for a scoped leadership step with measurable reliability impact.",
        actions: [
          "Own the next production readiness review",
          "Publish the action log and decision rationale",
          "Ask the manager to calibrate outcomes against the next level expectations",
        ],
        sources: ["recentSignals", "goals", "careerLadder.nextStep"],
        confidence: "high",
      },
      {
        id: "growth-communication",
        title: "Turn technical progress into stakeholder evidence",
        rationale:
          "The strongest growth path is easier to approve when operational work is tied to customer or team outcomes.",
        actions: [
          "Summarize one project as outcome, evidence, and next risk",
          "Share the summary in the monthly service review",
          "Collect feedback from one cross-functional stakeholder",
        ],
        sources: ["skills", "engagementScore", "opportunityReadiness"],
        confidence: "medium",
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}
