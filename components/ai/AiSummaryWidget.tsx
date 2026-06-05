"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { useSearchParams } from "next/navigation";
import AiModelFootnote from "./AiModelFootnote";
import { readAiJson } from "./ai-client";
import type { AiModelInfo, ViewType } from "@/types";

export default function AiSummaryWidget() {
  const { customer } = useCustomer();
  const searchParams = useSearchParams();
  const view = (searchParams.get("view") as ViewType) || "c-level";
  const [summary, setSummary] = useState<string | null>(null);
  const [providerLabel, setProviderLabel] = useState("AI");
  const [modelInfo, setModelInfo] = useState<AiModelInfo | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resetRequestState = useEffectEvent(() => {
    startTransition(() => {
      setLoading(true);
      setError(null);
    });
  });

  useEffect(() => {
    if (!customer) return;

    resetRequestState();

    fetch("/api/ai/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: customer.id, view }),
    })
      .then(async (res) => {
        const data = await readAiJson<{
          summary: string;
          providerLabel?: string;
          modelInfo?: AiModelInfo;
        }>(res);
        setSummary(data.summary);
        setProviderLabel(data.providerLabel || "AI");
        setModelInfo(data.modelInfo);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [customer, view]);

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-full" />
          <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-5/6" />
          <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-4/6" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {summary}
          </p>
          <AiModelFootnote providerLabel={providerLabel} modelInfo={modelInfo} />
        </>
      )}
    </div>
  );
}
