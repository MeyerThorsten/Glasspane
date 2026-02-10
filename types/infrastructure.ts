export interface ResourceUtilization {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
}

export interface LatencyMetric {
  timestamp: string;
  p50: number;
  p95: number;
  p99: number;
}

export interface NetworkThroughput {
  timestamp: string;
  inbound: number;
  outbound: number;
}

export interface CertificateInfo {
  domain: string;
  issuer: string;
  expiresAt: string;
  daysUntilExpiry: number;
  status: "valid" | "expiring-soon" | "expired";
}

export interface BackupStatus {
  serviceName: string;
  lastBackup: string;
  successRate: number;
  nextScheduled: string;
}

export interface ChangeCalendarEntry {
  date: string;
  count: number;
  risk: "low" | "medium" | "high";
}

export interface ErrorRate {
  timestamp: string;
  serviceName: string;
  rate: number;
}

export interface DnsResolution {
  timestamp: string;
  avgMs: number;
}

export interface PatchCompliance {
  category: string;
  compliant: number;
  nonCompliant: number;
  total: number;
}

export interface ChangeRecord {
  id: string;
  title: string;
  scheduledDate: string;
  risk: "low" | "medium" | "high";
  serviceName: string;
  status: "pending" | "approved" | "in-progress" | "completed" | "rolled-back";
}

export interface ProjectDelivery {
  id: string;
  name: string;
  progress: number;
  status: "on-track" | "at-risk" | "delayed" | "completed";
  dueDate: string;
  owner: string;
}
