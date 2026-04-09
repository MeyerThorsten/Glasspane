import { NextRequest } from "next/server";
import { generateCapacityPlanner } from "@/lib/ai/capacity-planner";
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

    const access = await authorizeAiRoute(request, "capacity-planner", requestId, customerId);
    if ("response" in access) {
      return access.response;
    }

    const response = await generateCapacityPlanner(customerId);
    logAiRoute("capacity-planner", requestId, "success", {
      durationMs: Date.now() - startedAt,
      providerLabel: response.providerLabel,
      customerId,
      authSubject: access.context.authSubject,
      quotaRemaining: access.context.quotaRemaining,
    });
    return aiSuccess(requestId, response, 200, access.context);
  } catch (error) {
    logAiRoute("capacity-planner", requestId, "error", {
      durationMs: Date.now() - startedAt,
      detail: error instanceof Error ? error.message : String(error),
    });
    return aiErrorResponse(requestId, "Failed to generate capacity planner", error);
  }
}
