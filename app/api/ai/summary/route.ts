import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/ai/generate";
import type { ViewType } from "@/types";

const VALID_VIEWS: ViewType[] = ["c-level", "business", "technical"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, view } = body;

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

    const summary = await generateSummary(customerId, view);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("AI summary error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to generate summary", detail: message },
      { status: 500 },
    );
  }
}
