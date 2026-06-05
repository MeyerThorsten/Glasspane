interface AiErrorPayload {
  error?: string;
  detail?: string;
  code?: string;
}

export function formatAiErrorMessage(payload: AiErrorPayload | null, fallback = "Lost API access") {
  const detail = payload?.detail || "";
  const error = payload?.error || "";

  if (error.includes("All configured AI providers failed") || detail.startsWith("All AI providers failed")) {
    return "All configured AI providers failed. Review the provider fallback chain.";
  }

  if (payload?.code === "quota") {
    return "AI rate limit reached. Try again after the quota window resets.";
  }

  if (payload?.code === "auth") {
    return "AI access is not authorized for this dashboard.";
  }

  if (payload?.code === "timeout") {
    return "AI provider timed out before returning a response.";
  }

  return error || fallback;
}

export async function readAiErrorMessage(response: Response, fallback = "Lost API access") {
  const payload = await response.json().catch(() => null) as AiErrorPayload | null;
  return formatAiErrorMessage(payload, fallback);
}

export async function readAiJson<T>(response: Response, fallback = "Lost API access"): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  throw new Error(await readAiErrorMessage(response, fallback));
}
