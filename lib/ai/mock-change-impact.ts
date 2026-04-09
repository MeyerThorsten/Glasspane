import type { AiChangeImpactResponse } from "@/types";

export function mockGenerateChangeImpact(): AiChangeImpactResponse {
  return {
    changes: [
      {
        id: "CHG-001",
        title: "SAP kernel upgrade v7.89",
        riskScore: 4,
        affectedServices: ["SAP S/4HANA", "SAP BW"],
        successRate: 72,
        date: "Mar 12",
        note: "Kernel changes have wide blast radius and lower historical success than routine updates.",
      },
      {
        id: "CHG-002",
        title: "Firewall rule update — DMZ segment",
        riskScore: 3,
        affectedServices: ["Cloud IaaS", "Managed Security"],
        successRate: 88,
        date: "Mar 13",
        note: "Security changes are manageable but still touch shared ingress paths.",
      },
      {
        id: "CHG-003",
        title: "Storage array firmware v4.2.1",
        riskScore: 3,
        affectedServices: ["Cloud IaaS"],
        successRate: 91,
        date: "Mar 14",
      },
      {
        id: "CHG-004",
        title: "SSL certificate rotation — web tier",
        riskScore: 2,
        affectedServices: ["Workplace Services"],
        successRate: 97,
        date: "Mar 14",
      },
      {
        id: "CHG-005",
        title: "Monitoring agent update v3.1",
        riskScore: 1,
        affectedServices: ["All Services"],
        successRate: 99,
        date: "Mar 15",
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}
