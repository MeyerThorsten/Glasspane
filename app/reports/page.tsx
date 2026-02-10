"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getSlaHistory } from "@/lib/services/kpi-service";
import { getIncidents } from "@/lib/services/incident-service";
import { getTicketVolume } from "@/lib/services/incident-service";
import { getCostBreakdown } from "@/lib/services/cost-service";
import { MonthlySla, Incident, TicketVolume, CostBreakdown } from "@/types";
import WidgetShell from "@/components/widgets/WidgetShell";
import StatusBadge from "@/components/widgets/shared/StatusBadge";
import TrendIndicator from "@/components/widgets/shared/TrendIndicator";
import { AreaChart, BarChart } from "@tremor/react";

function SlaPerformance() {
  const { customer } = useCustomer();
  const [data, setData] = useState<MonthlySla[]>([]);

  useEffect(() => {
    if (!customer) return;
    getSlaHistory(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  const latest = data[data.length - 1];
  const prev = data.length > 1 ? data[data.length - 2] : null;
  const trend = prev
    ? latest.availability > prev.availability
      ? "up"
      : latest.availability < prev.availability
        ? "down"
        : "stable"
    : "stable";

  const chartData = data.map((d) => ({
    month: d.month,
    Availability: d.availability,
    Target: d.target,
  }));

  return (
    <WidgetShell title="SLA Performance" size="full">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {latest.availability.toFixed(3)}%
          </span>
          <TrendIndicator
            direction={trend as "up" | "down" | "stable"}
            value={prev ? `${(latest.availability - prev.availability).toFixed(3)}%` : undefined}
            positive={trend === "up"}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Target: {latest.target}%
          </span>
        </div>
        <AreaChart
          data={chartData}
          index="month"
          categories={["Availability", "Target"]}
          colors={["emerald", "gray"]}
          valueFormatter={(v: number) => `${v.toFixed(3)}%`}
          yAxisWidth={72}
          showAnimation
          className="h-64"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#252533]">
                <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Month</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Availability</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Target</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.month} className="border-b border-gray-50 dark:border-[#1C1C27]">
                  <td className="py-2 px-3 text-gray-900 dark:text-gray-100">{row.month}</td>
                  <td className="py-2 px-3 text-right text-gray-900 dark:text-gray-100">{row.availability.toFixed(3)}%</td>
                  <td className="py-2 px-3 text-right text-gray-500 dark:text-gray-400">{row.target}%</td>
                  <td className="py-2 px-3 text-right">
                    <StatusBadge
                      label={row.availability >= row.target ? "Met" : "Below"}
                      variant={row.availability >= row.target ? "success" : "warning"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </WidgetShell>
  );
}

function IncidentReport() {
  const { customer } = useCustomer();
  const [data, setData] = useState<Incident[]>([]);

  useEffect(() => {
    if (!customer) return;
    getIncidents(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  const severityVariant = (s: string) => {
    switch (s) {
      case "P1": return "danger" as const;
      case "P2": return "warning" as const;
      case "P3": return "info" as const;
      default: return "neutral" as const;
    }
  };

  const statusVariant = (s: string) => {
    switch (s) {
      case "resolved":
      case "closed": return "success" as const;
      case "investigating": return "warning" as const;
      case "open": return "danger" as const;
      default: return "neutral" as const;
    }
  };

  return (
    <WidgetShell title="Incident Report" size="full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-[#252533]">
              <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">ID</th>
              <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Title</th>
              <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Severity</th>
              <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Status</th>
              <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Service</th>
              <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Created</th>
              <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Resolved</th>
              <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">MTTR</th>
            </tr>
          </thead>
          <tbody>
            {data.map((incident) => (
              <tr key={incident.id} className="border-b border-gray-50 dark:border-[#1C1C27]">
                <td className="py-2 px-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{incident.id}</td>
                <td className="py-2 px-3 text-gray-900 dark:text-gray-100">{incident.title}</td>
                <td className="py-2 px-3">
                  <StatusBadge label={incident.severity} variant={severityVariant(incident.severity)} />
                </td>
                <td className="py-2 px-3">
                  <StatusBadge label={incident.status} variant={statusVariant(incident.status)} />
                </td>
                <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{incident.serviceName}</td>
                <td className="py-2 px-3 text-gray-500 dark:text-gray-400 text-xs">{incident.createdAt}</td>
                <td className="py-2 px-3 text-gray-500 dark:text-gray-400 text-xs">{incident.resolvedAt ?? "—"}</td>
                <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">
                  {incident.mttrMinutes ? `${incident.mttrMinutes}m` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetShell>
  );
}

function CostSummary() {
  const { customer } = useCustomer();
  const [data, setData] = useState<CostBreakdown[]>([]);

  useEffect(() => {
    if (!customer) return;
    getCostBreakdown(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  const totalCurrent = data.reduce((sum, c) => sum + c.currentMonth, 0);
  const totalBudget = data.reduce((sum, c) => sum + c.budget, 0);
  const fmt = (v: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

  const chartData = data.map((c) => ({
    category: c.category,
    "Current Month": c.currentMonth,
    Budget: c.budget,
  }));

  return (
    <WidgetShell title="Cost Summary" size="full">
      <div className="space-y-4">
        <div className="flex items-baseline gap-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{fmt(totalCurrent)}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Budget: {fmt(totalBudget)}</span>
        </div>
        <BarChart
          data={chartData}
          index="category"
          categories={["Current Month", "Budget"]}
          colors={["fuchsia", "cyan"]}
          valueFormatter={(v: number) => fmt(v)}
          yAxisWidth={72}
          showAnimation
          className="h-64"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#252533]">
                <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Category</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Current</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Previous</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Budget</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">vs Budget</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const diff = row.currentMonth - row.budget;
                const pct = row.budget > 0 ? (diff / row.budget) * 100 : 0;
                return (
                  <tr key={row.category} className="border-b border-gray-50 dark:border-[#1C1C27]">
                    <td className="py-2 px-3 text-gray-900 dark:text-gray-100">{row.category}</td>
                    <td className="py-2 px-3 text-right text-gray-900 dark:text-gray-100">{fmt(row.currentMonth)}</td>
                    <td className="py-2 px-3 text-right text-gray-500 dark:text-gray-400">{fmt(row.previousMonth)}</td>
                    <td className="py-2 px-3 text-right text-gray-500 dark:text-gray-400">{fmt(row.budget)}</td>
                    <td className="py-2 px-3 text-right">
                      <StatusBadge
                        label={`${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`}
                        variant={pct <= 0 ? "success" : pct < 10 ? "warning" : "danger"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </WidgetShell>
  );
}

function TicketTrends() {
  const { customer } = useCustomer();
  const [data, setData] = useState<TicketVolume[]>([]);

  useEffect(() => {
    if (!customer) return;
    getTicketVolume(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    month: d.month,
    Opened: d.opened,
    Resolved: d.resolved,
  }));

  const totalOpened = data.reduce((sum, d) => sum + d.opened, 0);
  const totalResolved = data.reduce((sum, d) => sum + d.resolved, 0);

  return (
    <WidgetShell title="Ticket Trends" size="full">
      <div className="space-y-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Total Opened</span>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalOpened}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Total Resolved</span>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalResolved}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Resolution Rate</span>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {totalOpened > 0 ? ((totalResolved / totalOpened) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
        <AreaChart
          data={chartData}
          index="month"
          categories={["Opened", "Resolved"]}
          colors={["fuchsia", "emerald"]}
          valueFormatter={(v: number) => `${v}`}
          yAxisWidth={40}
          showAnimation
          className="h-64"
        />
      </div>
    </WidgetShell>
  );
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <SlaPerformance />
      <IncidentReport />
      <CostSummary />
      <TicketTrends />
    </div>
  );
}
