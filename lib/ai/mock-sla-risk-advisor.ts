import type { AiSlaRiskAdvisorResponse } from "@/types";

export function mockGenerateSlaRiskAdvisor(): AiSlaRiskAdvisorResponse {
  return {
    services: [
      {
        serviceName: "SAP S/4HANA Managed",
        uptime: 99.952,
        trend: "declining",
        risk: "high",
        note: "Recent incident activity and narrow SLA headroom justify tighter change control.",
      },
      {
        serviceName: "Cloud Platform",
        uptime: 99.978,
        trend: "stable",
        risk: "medium",
        note: "Performance is inside target, but keep an eye on error spikes and pending changes.",
      },
      {
        serviceName: "MPLS WAN",
        uptime: 99.991,
        trend: "stable",
        risk: "low",
        note: "Current posture is stable with enough SLA margin to absorb routine variation.",
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}
