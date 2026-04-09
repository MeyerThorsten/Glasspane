export function buildCostForecastMessages(
  contextData: string,
): Array<{ role: "system" | "user"; content: string }> {
  return [
    {
      role: "system",
      content: `You are a FinOps analyst for an IT transparency portal. Use the cost data below and return a JSON object with:

- "summary": 1 short sentence under 170 characters
- "forecast": an array of exactly 3 objects, one for each forecast month

Each forecast object must contain:
- "month": string
- "Projected": integer euro amount
- "Optimistic": integer euro amount
- "Pessimistic": integer euro amount
- "Budget": integer euro amount

Rules:
- Keep Optimistic <= Projected <= Pessimistic for each month.
- Use the provided budget consistently unless the context implies otherwise.
- Reflect the month-over-month trend from the input.
- Return ONLY valid JSON. No markdown.`,
    },
    {
      role: "user",
      content: contextData,
    },
  ];
}
