import { Incident, IncidentSummary, TicketVolume, MttrTrend } from "@/types";
import incidentsData from "@/data/mock/incidents.json";
import { shiftISODate, shiftISODateNullable, shiftMonth } from "@/lib/utils/date-shift";

const data = incidentsData as Record<string, {
  incidents: Incident[];
  summary: IncidentSummary[];
  ticketVolume: TicketVolume[];
  mttrTrends: MttrTrend[];
}>;

export async function getIncidents(customerId: string): Promise<Incident[]> {
  const incidents = data[customerId]?.incidents ?? [];
  return incidents.map((i) => ({
    ...i,
    createdAt: shiftISODate(i.createdAt),
    resolvedAt: shiftISODateNullable(i.resolvedAt),
  }));
}

export async function getIncidentSummary(customerId: string): Promise<IncidentSummary[]> {
  return data[customerId]?.summary ?? [];
}

export async function getTicketVolume(customerId: string): Promise<TicketVolume[]> {
  const volume = data[customerId]?.ticketVolume ?? [];
  return volume.map((v) => ({ ...v, month: shiftMonth(v.month) }));
}

export async function getMttrTrends(customerId: string): Promise<MttrTrend[]> {
  const trends = data[customerId]?.mttrTrends ?? [];
  return trends.map((t) => ({ ...t, month: shiftMonth(t.month) }));
}

export async function getOpenIncidents(customerId: string): Promise<Incident[]> {
  const incidents = data[customerId]?.incidents ?? [];
  return incidents
    .filter((i) => i.status === "open" || i.status === "investigating")
    .map((i) => ({
      ...i,
      createdAt: shiftISODate(i.createdAt),
      resolvedAt: shiftISODateNullable(i.resolvedAt),
    }));
}
