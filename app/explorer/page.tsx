"use client";

import { useEffect, useMemo, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getOntologyGraph } from "@/lib/services/ontology-service";
import { getNeighbors, blastRadius, findEntities, graphSummary } from "@/lib/ontology/queries";
import { EntityKind, OntologyGraph, RelationKind } from "@/types";
import {
  RiBuilding2Line,
  RiCloudLine,
  RiAlarmWarningLine,
  RiGitBranchLine,
  RiMoneyEuroCircleLine,
  RiShieldKeyholeLine,
  RiBugLine,
  RiSearchLine,
} from "@remixicon/react";

const kindMeta: Record<EntityKind, { label: string; icon: typeof RiBuilding2Line; accent: string }> = {
  customer: { label: "Customer", icon: RiBuilding2Line, accent: "text-indigo-500" },
  service: { label: "Services", icon: RiCloudLine, accent: "text-blue-500" },
  incident: { label: "Incidents", icon: RiAlarmWarningLine, accent: "text-red-500" },
  change: { label: "Changes", icon: RiGitBranchLine, accent: "text-amber-500" },
  costCategory: { label: "Cost Categories", icon: RiMoneyEuroCircleLine, accent: "text-emerald-500" },
  certificate: { label: "Certificates", icon: RiShieldKeyholeLine, accent: "text-teal-500" },
  cve: { label: "Vulnerabilities", icon: RiBugLine, accent: "text-rose-500" },
};

const relationLabels: Record<RelationKind, { out: string; in: string }> = {
  subscribes: { out: "subscribes to", in: "subscribed by" },
  affects: { out: "affects", in: "affected by" },
  targets: { out: "targets", in: "targeted by" },
  "spend-on": { out: "spends on", in: "funded by" },
  secures: { out: "secures", in: "secured by" },
  threatens: { out: "threatens", in: "threatened by" },
};

const kindOrder: EntityKind[] = [
  "customer",
  "service",
  "incident",
  "change",
  "costCategory",
  "certificate",
  "cve",
];

function statusColor(status?: string): string {
  switch (status) {
    case "operational":
    case "valid":
    case "resolved":
    case "closed":
    case "completed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
    case "degraded":
    case "expiring-soon":
    case "investigating":
    case "high":
    case "in-progress":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
    case "outage":
    case "expired":
    case "open":
    case "critical":
    case "rolled-back":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-[#262633] dark:text-gray-300";
  }
}

function metaLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

export default function ExplorerPage() {
  const { customer } = useCustomer();
  const [loaded, setLoaded] = useState<{ customerId: string; graph: OntologyGraph } | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) return;
    let cancelled = false;
    getOntologyGraph(customer).then((graph) => {
      if (!cancelled) setLoaded({ customerId: customer.id, graph });
    });
    return () => {
      cancelled = true;
    };
  }, [customer]);

  // A graph from a previously selected customer is treated as not loaded;
  // stale selections resolve to null through the lookups below.
  const graph = customer && loaded?.customerId === customer.id ? loaded.graph : null;

  const results = useMemo(() => (graph ? findEntities(graph, query) : []), [graph, query]);
  const summary = useMemo(() => (graph ? graphSummary(graph) : null), [graph]);
  const selected = useMemo(
    () => (graph && selectedId ? (graph.nodes.find((n) => n.id === selectedId) ?? null) : null),
    [graph, selectedId]
  );
  const neighbors = useMemo(
    () => (graph && selectedId ? getNeighbors(graph, selectedId) : []),
    [graph, selectedId]
  );
  const radius = useMemo(
    () => (graph && selectedId ? blastRadius(graph, selectedId, 2) : []),
    [graph, selectedId]
  );

  if (!graph || !summary) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-pulse">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-96 rounded-xl bg-gray-100 dark:bg-[#1C1C27]" />
        ))}
      </div>
    );
  }

  const grouped = kindOrder
    .map((kind) => ({ kind, nodes: results.filter((n) => n.kind === kind) }))
    .filter((g) => g.nodes.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {kindOrder.map((kind) => {
          const count = summary.byKind[kind] ?? 0;
          if (count === 0) return null;
          const meta = kindMeta[kind];
          const Icon = meta.icon;
          return (
            <span
              key={kind}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#1C1C27] border border-gray-200 dark:border-[#2E2E3D] text-sm text-gray-700 dark:text-gray-300"
            >
              <Icon className={`w-4 h-4 ${meta.accent}`} />
              {count} {meta.label}
            </span>
          );
        })}
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-white dark:bg-[#1C1C27] border border-gray-200 dark:border-[#2E2E3D] text-sm text-gray-500 dark:text-gray-400">
          {summary.edgeCount} relations
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="bg-white dark:bg-[#1C1C27] border border-gray-200 dark:border-[#2E2E3D] rounded-xl overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-[#2E2E3D]">
            <div className="relative">
              <RiSearchLine className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search entities, statuses, metadata…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-[#262633] border border-gray-200 dark:border-[#2E2E3D] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {grouped.length === 0 && (
              <p className="p-4 text-sm text-gray-500 dark:text-gray-400">No entities match.</p>
            )}
            {grouped.map(({ kind, nodes }) => {
              const meta = kindMeta[kind];
              const Icon = meta.icon;
              return (
                <div key={kind}>
                  <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {meta.label}
                  </p>
                  {nodes.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedId(node.id)}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#1F1F2B] transition-colors ${
                        selectedId === node.id ? "bg-indigo-50 dark:bg-indigo-950/30" : ""
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${meta.accent}`} />
                      <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">
                        {node.label}
                      </span>
                      {node.status && (
                        <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${statusColor(node.status)}`}>
                          {node.status}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="bg-white dark:bg-[#1C1C27] border border-gray-200 dark:border-[#2E2E3D] rounded-xl p-10 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select an entity to inspect its attributes, relations, and blast radius.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-[#1C1C27] border border-gray-200 dark:border-[#2E2E3D] rounded-xl p-5">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = kindMeta[selected.kind].icon;
                      return <Icon className={`w-5 h-5 ${kindMeta[selected.kind].accent}`} />;
                    })()}
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {selected.label}
                    </h2>
                  </div>
                  {selected.status && (
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor(selected.status)}`}>
                      {selected.status}
                    </span>
                  )}
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {Object.entries(selected.meta).map(([key, value]) => (
                    <div key={key} className="flex items-baseline justify-between gap-3 text-sm">
                      <dt className="text-gray-500 dark:text-gray-400">{metaLabel(key)}</dt>
                      <dd className="text-gray-900 dark:text-gray-100 font-medium text-right truncate">
                        {String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="bg-white dark:bg-[#1C1C27] border border-gray-200 dark:border-[#2E2E3D] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Direct relations ({neighbors.length})
                </h3>
                <div className="space-y-1">
                  {neighbors.map(({ node, relation, direction }) => (
                    <button
                      key={`${node.id}-${relation}-${direction}`}
                      onClick={() => setSelectedId(node.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-[#1F1F2B] transition-colors"
                    >
                      <span className="text-xs text-gray-400 w-28 shrink-0">
                        {direction === "out"
                          ? relationLabels[relation].out
                          : relationLabels[relation].in}
                      </span>
                      <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                        {node.label}
                      </span>
                      <span className="ml-auto text-[11px] text-gray-400">{kindMeta[node.kind].label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1C1C27] border border-gray-200 dark:border-[#2E2E3D] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Blast radius ({radius.length})
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Everything connected within two hops — what an issue here could touch.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {radius.map(({ node, hops }) => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedId(node.id)}
                      title={`${hops} hop${hops > 1 ? "s" : ""}`}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors hover:border-indigo-400 ${
                        hops === 1
                          ? "border-gray-300 dark:border-[#3A3A4A] text-gray-800 dark:text-gray-200"
                          : "border-gray-200 dark:border-[#2E2E3D] text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {node.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
