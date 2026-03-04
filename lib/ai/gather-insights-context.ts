import { getResourceUtilization, getLatencyMetrics, getErrorRates, getNetworkThroughput, getDnsResolution } from "@/lib/services/infrastructure-service";
import { getSlaHistory } from "@/lib/services/kpi-service";
import { getCostBreakdown } from "@/lib/services/cost-service";
import { getTicketVolume, getMttrTrends } from "@/lib/services/incident-service";

function stats(values: number[], label: string, unit = ""): string {
  if (values.length === 0) return "";
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const last3 = values.slice(-3);
  const trend = last3.length >= 2
    ? last3[last3.length - 1] > last3[0] * 1.05 ? "rising"
      : last3[last3.length - 1] < last3[0] * 0.95 ? "falling" : "stable"
    : "stable";
  return `${label}: avg=${avg.toFixed(1)}${unit}, min=${min.toFixed(1)}${unit}, max=${max.toFixed(1)}${unit}, trend=${trend}, recent=[${last3.map(v => v.toFixed(1) + unit).join(", ")}]`;
}

export async function gatherInsightsContext(customerId: string): Promise<string> {
  const [util, latency, errors, throughput, dns, sla, costs, tickets, mttr] = await Promise.all([
    getResourceUtilization(customerId),
    getLatencyMetrics(customerId),
    getErrorRates(customerId),
    getNetworkThroughput(customerId),
    getDnsResolution(customerId),
    getSlaHistory(customerId),
    getCostBreakdown(customerId),
    getTicketVolume(customerId),
    getMttrTrends(customerId),
  ]);

  const sections: string[] = [];

  // Resource Utilization
  sections.push("=== RESOURCE UTILIZATION ===");
  sections.push(stats(util.map(u => u.cpu), "CPU", "%"));
  sections.push(stats(util.map(u => u.memory), "Memory", "%"));
  sections.push(stats(util.map(u => u.disk), "Disk", "%"));

  // Latency
  sections.push("\n=== LATENCY ===");
  sections.push(stats(latency.map(l => l.p50), "P50", "ms"));
  sections.push(stats(latency.map(l => l.p95), "P95", "ms"));
  sections.push(stats(latency.map(l => l.p99), "P99", "ms"));

  // Error Rates by Service
  sections.push("\n=== ERROR RATES ===");
  const serviceNames = [...new Set(errors.map(e => e.serviceName))];
  for (const svc of serviceNames) {
    const rates = errors.filter(e => e.serviceName === svc).map(e => e.rate * 100);
    sections.push(stats(rates, svc, "%"));
  }

  // Network
  sections.push("\n=== NETWORK ===");
  sections.push(stats(throughput.map(t => t.inbound), "Inbound", " Mbps"));
  sections.push(stats(throughput.map(t => t.outbound), "Outbound", " Mbps"));

  // DNS
  sections.push("\n=== DNS ===");
  sections.push(stats(dns.map(d => d.avgMs), "Resolution", "ms"));

  // SLA
  sections.push("\n=== SLA ===");
  if (sla.length > 0) {
    const latest = sla[sla.length - 1];
    const last3 = sla.slice(-3).map(s => `${s.availability}%`).join(", ");
    sections.push(`Current: ${latest.availability}%, Target: ${latest.target}%, 3-month: [${last3}]`);
  }

  // Costs
  sections.push("\n=== COSTS ===");
  const totalCurrent = costs.reduce((s, c) => s + c.currentMonth, 0);
  const totalBudget = costs.reduce((s, c) => s + c.budget, 0);
  const overPct = totalBudget > 0 ? ((totalCurrent - totalBudget) / totalBudget * 100).toFixed(1) : "0";
  sections.push(`Total: €${totalCurrent.toFixed(0)}, Budget: €${totalBudget.toFixed(0)}, Delta: ${overPct}%`);
  const overBudget = costs.filter(c => c.currentMonth > c.budget);
  if (overBudget.length > 0) {
    sections.push(`Over budget: ${overBudget.map(c => `${c.category} (+${((c.currentMonth - c.budget) / c.budget * 100).toFixed(1)}%)`).join(", ")}`);
  }

  // Tickets
  sections.push("\n=== TICKETS ===");
  const recentTickets = tickets.slice(-6);
  sections.push(`Opened: [${recentTickets.map(t => t.opened).join(", ")}]`);
  sections.push(`Resolved: [${recentTickets.map(t => t.resolved).join(", ")}]`);

  // MTTR
  sections.push("\n=== MTTR (minutes) ===");
  const recentMttr = mttr.slice(-6);
  sections.push(`P1: [${recentMttr.map(m => m.p1).join(", ")}]`);
  sections.push(`P2: [${recentMttr.map(m => m.p2).join(", ")}]`);

  return sections.filter(Boolean).join("\n");
}
