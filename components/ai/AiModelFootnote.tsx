"use client";

import type { AiModelInfo } from "@/types";

export default function AiModelFootnote({
  providerLabel,
  modelInfo,
}: {
  providerLabel?: string;
  modelInfo?: AiModelInfo;
}) {
  if (!modelInfo) {
    return (
      <p className="text-[10px] text-gray-400 dark:text-gray-500">
        Powered by {providerLabel || "AI"}
      </p>
    );
  }

  const fallbackText = modelInfo.fallbackCount
    ? ` · ${modelInfo.fallbackCount} fallback${modelInfo.fallbackCount === 1 ? "" : "s"}`
    : "";

  return (
    <p className="text-[10px] text-gray-400 dark:text-gray-500">
      {modelInfo.providerLabel} · {modelInfo.model} · v{modelInfo.version}
      {typeof modelInfo.latencyMs === "number" ? ` · ${modelInfo.latencyMs} ms` : ""}
      {fallbackText}
    </p>
  );
}
