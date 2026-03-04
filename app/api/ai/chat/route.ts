import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/ai/generate";
import type { ViewType } from "@/types";

const VALID_VIEWS: ViewType[] = ["c-level", "business", "technical"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, view, question, history } = body;

    if (!customerId || typeof customerId !== "string") {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 },
      );
    }

    if (!view || !VALID_VIEWS.includes(view)) {
      return NextResponse.json(
        { error: `view must be one of: ${VALID_VIEWS.join(", ")}` },
        { status: 400 },
      );
    }

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 },
      );
    }

    const answer = await generateChatResponse(
      customerId,
      view,
      question,
      Array.isArray(history) ? history.slice(-10) : [],
    );

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AI chat error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to generate response", detail: message },
      { status: 500 },
    );
  }
}
