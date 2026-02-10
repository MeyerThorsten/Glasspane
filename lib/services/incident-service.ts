import { Incident, IncidentSummary, TicketVolume, MttrTrend } from "@/types";
import incidentsData from "@/data/mock/incidents.json";

const data = incidentsData as Record<string, {
  incidents: Incident[];
  summary: IncidentSummary[];
  ticketVolume: TicketVolume[];
  mttrTrends: MttrTrend[];
}>;

export async function getIncidents(customerId: string): Promise<Incident[]> {
  return data[customerId]?.incidents ?? [];
}

export async function getIncidentSummary(customerId: string): Promise<IncidentSummary[]> {
  return data[customerId]?.summary ?? [];
}

export async function getTicketVolume(customerId: string): Promise<TicketVolume[]> {
  return data[customerId]?.ticketVolume ?? [];
}

export async function getMttrTrends(customerId: string): Promise<MttrTrend[]> {
  return data[customerId]?.mttrTrends ?? [];
}

export async function getOpenIncidents(customerId: string): Promise<Incident[]> {
  const incidents = data[customerId]?.incidents ?? [];
  return incidents.filter((i) => i.status === "open" || i.status === "investigating");
}
