import { NextRequest } from "next/server";
import { generateSummary } from "@/lib/ai/generate";
import { aiErrorResponse, aiSuccess, aiValidationError, authorizeAiRoute, getAiRequestId, logAiRoute } from "@/lib/ai/route-utils";
import type { ViewType } from "@/types";

const VALID_VIEWS: ViewType[] = ["c-level", "business", "technical"];

export async function POST(request: NextRequest) {
  const requestId = getAiRequestId(request);
  const startedAt = Date.now();

  try {
    const body = await request.json();
    const { customerId, view } = body;

    if (!customerId || typeof customerId !== "string") {
      return aiValidationError(requestId, "customerId is required");
    }

    if (!view || !VALID_VIEWS.includes(view)) {
      return aiValidationError(requestId, `view must be one of: ${VALID_VIEWS.join(", ")}`);
    }

    const access = await authorizeAiRoute(request, "summary", requestId, customerId);
    if ("response" in access) {
      return access.response;
    }

    const summary = await generateSummary(customerId, view);
    logAiRoute("summary", requestId, "success", {
      durationMs: Date.now() - startedAt,
      providerLabel: summary.providerLabel,
      customerId,
      authSubject: access.context.authSubject,
      quotaRemaining: access.context.quotaRemaining,
    });

    return aiSuccess(requestId, {
      summary: summary.text,
      providerLabel: summary.providerLabel,
    }, 200, access.context);
  } catch (error) {
    logAiRoute("summary", requestId, "error", {
      durationMs: Date.now() - startedAt,
      detail: error instanceof Error ? error.message : String(error),
    });
    return aiErrorResponse(requestId, "Failed to generate summary", error);
  }
}
