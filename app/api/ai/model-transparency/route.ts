import { NextRequest } from "next/server";
import { getAiModelTransparencySnapshot } from "@/lib/ai/model-telemetry";

const WINDOW_PRESETS: Record<string, number> = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

function resolveWindowMs(request: NextRequest): number {
  const requested = request.nextUrl.searchParams.get("window") || "24h";
  return WINDOW_PRESETS[requested] ?? WINDOW_PRESETS["24h"];
}

export async function GET(request: NextRequest) {
  const snapshot = await getAiModelTransparencySnapshot(resolveWindowMs(request));
  return Response.json(snapshot, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
