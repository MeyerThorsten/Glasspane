import type { AiRootCausePatternsResponse } from "@/types";

export function mockGenerateRootCausePatterns(): AiRootCausePatternsResponse {
  return {
    patterns: [
      {
        id: "pattern-1",
        category: "Network-related",
        percentage: 40,
        description: "A large share of higher-severity incidents clusters around network changes and degraded connectivity windows.",
        recommendation: "Add automated network validation immediately after change execution.",
      },
      {
        id: "pattern-2",
        category: "Storage I/O",
        percentage: 25,
        description: "Latency spikes align with backup-heavy periods, pointing to storage contention.",
        recommendation: "Stagger backup workloads across lower-traffic windows.",
      },
      {
        id: "pattern-3",
        category: "Authentication",
        percentage: 20,
        description: "Auth-related errors rise alongside certificate and access-control events.",
        recommendation: "Tighten certificate renewal lead time and identity dependency checks.",
      },
      {
        id: "pattern-4",
        category: "Resource Exhaustion",
        percentage: 15,
        description: "Repeated capacity saturation precedes a smaller but recurring set of service disruptions.",
        recommendation: "Add proactive scaling rules before resource pressure reaches user-facing services.",
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}
