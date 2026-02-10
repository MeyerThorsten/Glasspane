export type IncidentSeverity = "P1" | "P2" | "P3" | "P4";
export type IncidentStatus = "open" | "investigating" | "resolved" | "closed";

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  serviceId: string;
  serviceName: string;
  createdAt: string;
  resolvedAt: string | null;
  mttrMinutes: number | null;
}

export interface IncidentSummary {
  severity: IncidentSeverity;
  open: number;
  resolved: number;
  total: number;
}

export interface MttrTrend {
  month: string;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
}

export interface TicketVolume {
  month: string;
  opened: number;
  resolved: number;
}
