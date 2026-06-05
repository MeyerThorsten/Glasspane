import { NextRequest } from "next/server";
import { generateWorkforceGrowthRecommendations } from "@/lib/ai/workforce-growth";
import { getWorkforceEmployeeById } from "@/lib/services/workforce-service";
import {
  aiErrorResponse,
  aiSuccess,
  aiValidationError,
  authorizeAiRoute,
  getAiRequestId,
  logAiRoute,
} from "@/lib/ai/route-utils";

const WORKFORCE_AI_CUSTOMER_ID = "cust-001";

export async function POST(request: NextRequest) {
  const requestId = getAiRequestId(request);
  const startedAt = Date.now();

  try {
    const body = await request.json();
    const { employeeId } = body;

    if (!employeeId || typeof employeeId !== "string") {
      return aiValidationError(requestId, "employeeId is required");
    }

    const employee = await getWorkforceEmployeeById(employeeId);
    if (!employee) {
      return aiValidationError(requestId, "Unknown employeeId", 404);
    }

    const access = await authorizeAiRoute(
      request,
      "workforce-growth",
      requestId,
      WORKFORCE_AI_CUSTOMER_ID,
    );
    if ("response" in access) {
      return access.response;
    }

    const response = await generateWorkforceGrowthRecommendations(employeeId);
    logAiRoute("workforce-growth", requestId, "success", {
      durationMs: Date.now() - startedAt,
      providerLabel: response.providerLabel,
      employeeId,
      authSubject: access.context.authSubject,
      quotaRemaining: access.context.quotaRemaining,
    });
    return aiSuccess(requestId, response, 200, access.context);
  } catch (error) {
    logAiRoute("workforce-growth", requestId, "error", {
      durationMs: Date.now() - startedAt,
      detail: error instanceof Error ? error.message : String(error),
    });
    return aiErrorResponse(requestId, "Lost API access", error);
  }
}
