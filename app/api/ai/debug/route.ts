import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.WATSONX_API_KEY || "";
  return NextResponse.json({
    provider: process.env.AI_PROVIDER,
    keyPrefix: apiKey.slice(0, 4),
    keySuffix: apiKey.slice(-4),
    keyLength: apiKey.length,
    region: process.env.WATSONX_REGION,
    projectId: process.env.WATSONX_PROJECT_ID ? "set" : "missing",
    modelId: process.env.WATSONX_MODEL_ID,
  });
}
