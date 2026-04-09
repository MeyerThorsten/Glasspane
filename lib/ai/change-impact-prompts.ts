export function buildChangeImpactMessages(
  contextData: string,
): Array<{ role: "system" | "user"; content: string }> {
  return [
    {
      role: "system",
      content: `You are a change risk analyst. Return a JSON object with one array: "changes".

Return up to 5 changes ranked from highest expected impact to lowest. Each change must include:
- "id": string
- "title": string
- "riskScore": integer 1-5
- "affectedServices": array of one or more strings
- "successRate": integer 0-100
- "date": short date string
- "note": optional short sentence under 120 characters

Use the supplied change risk, service, and incident history only. Return ONLY valid JSON.`,
    },
    {
      role: "user",
      content: contextData,
    },
  ];
}
