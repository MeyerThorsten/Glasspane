import { ServiceCategory } from "./customer";

export type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance";

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  status: ServiceStatus;
  uptime: number;
  slaTarget: number;
  description: string;
}

export interface ServiceUtilization {
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  months: { month: string; usage: number; capacity: number }[];
}
