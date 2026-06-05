"use client";

import { startTransition, useEffect, useEffectEvent, useMemo, useState } from "react";
import WidgetShell from "@/components/widgets/WidgetShell";
import AiModelFootnote from "@/components/ai/AiModelFootnote";
import { readAiJson } from "@/components/ai/ai-client";
import {
  getCareerProgress,
  getWorkforceEmployees,
} from "@/lib/services/workforce-service";
import type {
  AiWorkforceGrowthResponse,
  CareerLadderStep,
  WorkforceEmployee,
} from "@/types";

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  return "text-red-600";
}

function CareerLadder({
  employee,
  ladder,
  currentIndex,
}: {
  employee: WorkforceEmployee;
  ladder: CareerLadderStep[];
  currentIndex: number;
}) {
  return (
    <WidgetShell title="Career Ladder" size="full">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{employee.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {employee.role} · {employee.track} · Manager: {employee.manager}
            </p>
          </div>
          <span className="rounded-lg bg-magenta-50 px-3 py-1 text-xs font-medium text-magenta dark:bg-[#1e1b4b]">
            {employee.level}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {ladder.map((step, index) => {
            const isCurrent = index === currentIndex;
            const isComplete = index < currentIndex;
            return (
              <div
                key={step.level}
                className={`rounded-lg border p-3 ${
                  isCurrent
                    ? "border-magenta bg-magenta-50/60 dark:border-magenta dark:bg-[#1e1b4b]/40"
                    : isComplete
                      ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                      : "border-gray-200 dark:border-[#2E2E3D]"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{step.level}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{step.title}</p>
                </div>
                <ul className="space-y-1">
                  {step.expectations.slice(0, 3).map((expectation) => (
                    <li key={expectation} className="text-xs text-gray-600 dark:text-gray-400">
                      {expectation}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </WidgetShell>
  );
}

function GrowthSignals({ employee, nextStep }: { employee: WorkforceEmployee; nextStep?: CareerLadderStep }) {
  return (
    <WidgetShell title="Growth Signals" size="medium">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className={`text-2xl font-bold ${scoreColor(employee.engagementScore)}`}>
              {employee.engagementScore}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Engagement</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${scoreColor(employee.opportunityReadiness)}`}>
              {employee.opportunityReadiness}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Readiness</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {employee.skills.map((skill) => (
            <span key={skill} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-[#262633] dark:text-gray-400">
              {skill}
            </span>
          ))}
        </div>
        {nextStep ? (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Next Level Skills</p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{nextStep.skills.join(", ")}</p>
          </div>
        ) : null}
      </div>
    </WidgetShell>
  );
}

function GoalsAndEvidence({ employee }: { employee: WorkforceEmployee }) {
  return (
    <WidgetShell title="Evidence" size="medium">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Goals</p>
          <ul className="space-y-2">
            {employee.goals.map((goal) => (
              <li key={goal} className="text-sm text-gray-700 dark:text-gray-300">{goal}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Signals</p>
          <ul className="space-y-2">
            {employee.recentSignals.map((signal) => (
              <li key={signal} className="text-sm text-gray-700 dark:text-gray-300">{signal}</li>
            ))}
          </ul>
        </div>
      </div>
    </WidgetShell>
  );
}

function AiGrowthRecommendations({ employeeId }: { employeeId: string }) {
  const [data, setData] = useState<AiWorkforceGrowthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const beginRequest = useEffectEvent(() => {
    startTransition(() => {
      setLoading(true);
      setError(null);
    });
  });

  useEffect(() => {
    const controller = new AbortController();
    beginRequest();

    fetch("/api/ai/workforce-growth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
      signal: controller.signal,
    })
      .then((response) => readAiJson<AiWorkforceGrowthResponse>(response))
      .then(setData)
      .catch((fetchError) => {
        if (controller.signal.aborted) {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Lost API access");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [employeeId]);

  return (
    <WidgetShell title="AI Growth Recommendations" size="full">
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-14 rounded-lg bg-gray-100 dark:bg-[#262633]" />
          <div className="h-14 rounded-lg bg-gray-100 dark:bg-[#262633]" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <div className="space-y-4">
          {(data?.recommendations ?? []).map((recommendation) => (
            <div key={recommendation.id} className="rounded-lg border border-gray-200 p-3 dark:border-[#2E2E3D]">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{recommendation.title}</p>
                <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-600 dark:bg-blue-950/30 dark:text-blue-300">
                  {recommendation.confidence}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation.rationale}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Actions</p>
                  <ul className="space-y-1">
                    {recommendation.actions.map((action) => (
                      <li key={action} className="text-xs text-gray-600 dark:text-gray-400">{action}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Sources</p>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendation.sources.map((source) => (
                      <span key={source} className="rounded-md bg-gray-100 px-2 py-1 text-[10px] text-gray-600 dark:bg-[#262633] dark:text-gray-400">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <AiModelFootnote providerLabel={data?.providerLabel} modelInfo={data?.modelInfo} />
        </div>
      )}
    </WidgetShell>
  );
}

export default function WorkforceDashboard() {
  const [employees, setEmployees] = useState<WorkforceEmployee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("emp-001");
  const [progress, setProgress] = useState<{
    employee: WorkforceEmployee;
    ladder: CareerLadderStep[];
    currentIndex: number;
    nextStep?: CareerLadderStep;
  } | null>(null);

  useEffect(() => {
    getWorkforceEmployees().then(setEmployees);
  }, []);

  useEffect(() => {
    getCareerProgress(selectedEmployeeId).then(setProgress);
  }, [selectedEmployeeId]);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === selectedEmployeeId),
    [employees, selectedEmployeeId],
  );

  if (!progress || !selectedEmployee) {
    return (
      <div className="widget-grid">
        <div className="widget-full rounded-xl border border-gray-200 bg-white p-5 dark:border-[#2E2E3D] dark:bg-[#1C1C27]">
          <div className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-[#262633]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Workforce Growth</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedEmployee.track}</p>
        </div>
        <select
          value={selectedEmployeeId}
          onChange={(event) => setSelectedEmployeeId(event.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-magenta dark:border-[#2E2E3D] dark:bg-[#1C1C27] dark:text-gray-100"
        >
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name} · {employee.role}
            </option>
          ))}
        </select>
      </div>

      <div className="widget-grid">
        <CareerLadder
          employee={progress.employee}
          ladder={progress.ladder}
          currentIndex={progress.currentIndex}
        />
        <GrowthSignals employee={progress.employee} nextStep={progress.nextStep} />
        <GoalsAndEvidence employee={progress.employee} />
        <AiGrowthRecommendations employeeId={progress.employee.id} />
      </div>
    </div>
  );
}
