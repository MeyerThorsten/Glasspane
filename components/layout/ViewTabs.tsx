"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ViewType } from "@/types";

const views: { id: ViewType; label: string }[] = [
  { id: "c-level", label: "C-Level" },
  { id: "business", label: "Business" },
  { id: "technical", label: "Technical" },
];

export default function ViewTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentView = (searchParams.get("view") as ViewType) || "c-level";

  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
      {views.map((v) => (
        <button
          key={v.id}
          onClick={() => router.push(`/dashboard?view=${v.id}`)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            currentView === v.id
              ? "bg-white text-magenta shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
