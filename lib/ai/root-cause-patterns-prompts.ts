export function buildRootCausePatternsMessages(
  contextData: string,
): Array<{ role: "system" | "user"; content: string }> {
  return [
    {
      role: "system",
      content: `You are an SRE analyst. Return a JSON object with one array: "patterns".

Return 3 to 4 root-cause patterns. Each pattern must contain:
- "id": unique string
- "category": short category label
- "percentage": integer from 1 to 100
- "description": short sentence under 140 characters
- "recommendation": short sentence under 120 characters

Use the incident, error, change, certificate, and patch signals provided. Return ONLY valid JSON.`,
    },
    {
      role: "user",
      content: contextData,
    },
  ];
}
