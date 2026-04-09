export function buildRiskBriefingMessages(
  contextData: string,
): Array<{ role: "system" | "user"; content: string }> {
  return [
    {
      role: "system",
      content: `You are an IT risk analyst for an executive transparency portal. Review the operational context below and return a JSON object with one array: "items".

Rules:
- Return 3 to 4 items, highest priority first.
- Each item must contain:
  - "id": unique string such as "risk-1"
  - "severity": "critical" | "warning" | "info"
  - "text": one concise sentence under 180 characters
- Every item must cite a real signal from the provided context and include a clear action or watchpoint.
- Do not invent incidents, CVEs, budgets, or SLA targets.
- If there is no critical risk, use warning/info items only.

Return ONLY valid JSON. No markdown. No prose outside the JSON.`,
    },
    {
      role: "user",
      content: contextData,
    },
  ];
}
