import { NextRequest } from "next/server";
import { generateChatResponse, streamChatResponse } from "@/lib/ai/generate";
import { aiErrorResponse, aiSuccess, aiValidationError, applyAiAccessHeaders, authorizeAiRoute, getAiRequestId, logAiRoute } from "@/lib/ai/route-utils";
import { encodeSseEvent } from "@/lib/ai/sse";
import type { ViewType } from "@/types";

const VALID_VIEWS: ViewType[] = ["c-level", "business", "technical"];

export async function POST(request: NextRequest) {
  const requestId = getAiRequestId(request);
  const startedAt = Date.now();

  try {
    const body = await request.json();
    const { customerId, view, question, history } = body;
    const wantsStream =
      body?.stream === true
      || request.headers.get("accept")?.includes("text/event-stream")
      || false;

    if (!customerId || typeof customerId !== "string") {
      return aiValidationError(requestId, "customerId is required");
    }

    if (!view || !VALID_VIEWS.includes(view)) {
      return aiValidationError(requestId, `view must be one of: ${VALID_VIEWS.join(", ")}`);
    }

    if (!question || typeof question !== "string") {
      return aiValidationError(requestId, "question is required");
    }

    const access = await authorizeAiRoute(request, "chat", requestId, customerId);
    if ("response" in access) {
      return access.response;
    }

    if (wantsStream) {
      const result = await streamChatResponse(
        customerId,
        view,
        question,
        Array.isArray(history) ? history.slice(-10) : [],
      );
      const encoder = new TextEncoder();

      const response = new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            void (async () => {
              let chunkCount = 0;

              try {
                controller.enqueue(
                  encoder.encode(
                    encodeSseEvent("meta", {
                      requestId,
                      providerLabel: result.providerLabel,
                    }),
                  ),
                );

                for await (const chunk of result.stream) {
                  if (!chunk) {
                    continue;
                  }

                  chunkCount += 1;
                  controller.enqueue(encoder.encode(encodeSseEvent("delta", { text: chunk })));
                }

                controller.enqueue(
                  encoder.encode(
                    encodeSseEvent("done", {
                      requestId,
                      providerLabel: result.providerLabel,
                    }),
                  ),
                );
                logAiRoute("chat", requestId, "success", {
                  durationMs: Date.now() - startedAt,
                  providerLabel: result.providerLabel,
                  streamed: true,
                  chunkCount,
                  customerId,
                  authSubject: access.context.authSubject,
                  quotaRemaining: access.context.quotaRemaining,
                });
              } catch (error) {
                controller.enqueue(
                  encoder.encode(
                    encodeSseEvent("error", {
                      requestId,
                      message: "Failed to generate response",
                    }),
                  ),
                );
                logAiRoute("chat", requestId, "error", {
                  durationMs: Date.now() - startedAt,
                  streamed: true,
                  detail: error instanceof Error ? error.message : String(error),
                });
              } finally {
                controller.close();
              }
            })();
          },
        }),
        {
          headers: {
            "cache-control": "no-cache, no-transform",
            "content-type": "text/event-stream; charset=utf-8",
            "x-request-id": requestId,
          },
        },
      );

      return applyAiAccessHeaders(response, access.context);
    }

    const answer = await generateChatResponse(
      customerId,
      view,
      question,
      Array.isArray(history) ? history.slice(-10) : [],
    );
    logAiRoute("chat", requestId, "success", {
      durationMs: Date.now() - startedAt,
      providerLabel: answer.providerLabel,
      customerId,
      authSubject: access.context.authSubject,
      quotaRemaining: access.context.quotaRemaining,
    });

    return aiSuccess(requestId, {
      answer: answer.text,
      providerLabel: answer.providerLabel,
    }, 200, access.context);
  } catch (error) {
    logAiRoute("chat", requestId, "error", {
      durationMs: Date.now() - startedAt,
      detail: error instanceof Error ? error.message : String(error),
    });
    return aiErrorResponse(requestId, "Failed to generate response", error);
  }
}
