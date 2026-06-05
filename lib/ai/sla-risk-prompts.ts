export function buildSlaRiskMessages(
  contextData: string,
): Array<{ role: "system" | "user"; content: string }> {
  return [
    {
      role: "system",
      content: `You are an IT service reliability analyst. Review the service data below and return a JSON object with one array: "services".
Also return a "trend" array with historical and projected SLA points against the Zero Outage target.

Rules:
- Return up to 5 services, sorted from highest 30-day SLA risk to lowest.
- Each service must include:
  - "serviceName": string
  - "uptime": number with up to 3 decimals
  - "trend": "declining" | "stable" | "improving"
  - "risk": "high" | "medium" | "low"
  - "note": one short sentence under 140 characters explaining the main reason
- "trend" must contain 6 to 8 monthly objects:
  - historical points use "Historical": number
  - projected points use "Projected": number
  - every point includes "month": string and "Target": 99.999
- Base the risk on SLA buffer, service status, recent/open incidents, and pending change risk.
- Do not invent services or signals not present in the context.
- If a service has healthy margin and little recent activity, prefer "low" risk.

Return ONLY valid JSON. No markdown. No extra explanation.`,
    },
    {
      role: "user",
      content: contextData,
    },
  ];
}
