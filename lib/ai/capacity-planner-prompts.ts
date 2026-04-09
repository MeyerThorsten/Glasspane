export function buildCapacityPlannerMessages(
  contextData: string,
): Array<{ role: "system" | "user"; content: string }> {
  return [
    {
      role: "system",
      content: `You are a capacity planning analyst. Return a JSON object with one array: "resources".

Return exactly 4 resources in this order: CPU, Memory, Disk, Network.
Each resource must contain:
- "type": string
- "current": number
- "dailyGrowth": number
- "threshold80": short string like "~15 days" or ">180 days"
- "threshold90": short string like "~40 days" or ">240 days"
- "summary": one short sentence under 110 characters

Use the supplied metrics only. Return ONLY valid JSON.`,
    },
    {
      role: "user",
      content: contextData,
    },
  ];
}
