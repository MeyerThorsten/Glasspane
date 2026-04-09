import { NextRequest } from "next/server";
import { generateRootCausePatterns } from "@/lib/ai/root-cause-patterns";
import { aiErrorResponse, aiSuccess, aiValidationError, authorizeAiRoute, getAiRequestId, logAiRoute } from "@/lib/ai/route-utils";

export async function POST(request: NextRequest) {
  const requestId = getAiRequestId(request);
  const startedAt = Date.now();

  try {
    const body = await request.json();
    const { customerId } = body;

    if (!customerId || typeof customerId !== "string") {
      return aiValidationError(requestId, "customerId is required");
    }

    const access = await authorizeAiRoute(request, "root-cause-patterns", requestId, customerId);
    if ("response" in access) {
      return access.response;
    }

    const response = await generateRootCausePatterns(customerId);
    logAiRoute("root-cause-patterns", requestId, "success", {
      durationMs: Date.now() - startedAt,
      providerLabel: response.providerLabel,
      customerId,
      authSubject: access.context.authSubject,
      quotaRemaining: access.context.quotaRemaining,
    });
    return aiSuccess(requestId, response, 200, access.context);
  } catch (error) {
    logAiRoute("root-cause-patterns", requestId, "error", {
      durationMs: Date.now() - startedAt,
      detail: error instanceof Error ? error.message : String(error),
    });
    return aiErrorResponse(requestId, "Failed to generate root cause patterns", error);
  }
}
