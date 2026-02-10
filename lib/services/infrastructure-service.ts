import {
  ResourceUtilization,
  LatencyMetric,
  NetworkThroughput,
  CertificateInfo,
  BackupStatus,
  ChangeCalendarEntry,
  ErrorRate,
  DnsResolution,
  PatchCompliance,
  ChangeRecord,
  ProjectDelivery,
  ServiceUtilization,
} from "@/types";
import infraData from "@/data/mock/infrastructure.json";
import {
  shiftDate,
  shiftISODate,
  shiftMonth,
  computeDaysUntilExpiry,
  computeCertificateStatus,
} from "@/lib/utils/date-shift";

type InfraData = {
  resourceUtilization: ResourceUtilization[];
  latency: LatencyMetric[];
  networkThroughput: NetworkThroughput[];
  certificates: CertificateInfo[];
  backups: BackupStatus[];
  changeCalendar: ChangeCalendarEntry[];
  errorRates: ErrorRate[];
  dnsResolution: DnsResolution[];
  patchCompliance: PatchCompliance[];
  pendingChanges: ChangeRecord[];
  projects: ProjectDelivery[];
  serviceUtilization: ServiceUtilization[];
};

const data = infraData as Record<string, InfraData>;

export async function getResourceUtilization(customerId: string): Promise<ResourceUtilization[]> {
  const items = data[customerId]?.resourceUtilization ?? [];
  return items.map((i) => ({ ...i, timestamp: shiftDate(i.timestamp) }));
}

export async function getLatencyMetrics(customerId: string): Promise<LatencyMetric[]> {
  const items = data[customerId]?.latency ?? [];
  return items.map((i) => ({ ...i, timestamp: shiftDate(i.timestamp) }));
}

export async function getNetworkThroughput(customerId: string): Promise<NetworkThroughput[]> {
  const items = data[customerId]?.networkThroughput ?? [];
  return items.map((i) => ({ ...i, timestamp: shiftDate(i.timestamp) }));
}

export async function getCertificates(customerId: string): Promise<CertificateInfo[]> {
  const certs = data[customerId]?.certificates ?? [];
  return certs.map((c) => {
    const shiftedExpiry = shiftDate(c.expiresAt);
    const daysUntilExpiry = computeDaysUntilExpiry(shiftedExpiry);
    return {
      ...c,
      expiresAt: shiftedExpiry,
      daysUntilExpiry,
      status: computeCertificateStatus(daysUntilExpiry),
    };
  });
}

export async function getBackups(customerId: string): Promise<BackupStatus[]> {
  const items = data[customerId]?.backups ?? [];
  return items.map((i) => ({
    ...i,
    lastBackup: shiftISODate(i.lastBackup),
    nextScheduled: shiftISODate(i.nextScheduled),
  }));
}

export async function getChangeCalendar(customerId: string): Promise<ChangeCalendarEntry[]> {
  const items = data[customerId]?.changeCalendar ?? [];
  return items.map((i) => ({ ...i, date: shiftDate(i.date) }));
}

export async function getErrorRates(customerId: string): Promise<ErrorRate[]> {
  const items = data[customerId]?.errorRates ?? [];
  return items.map((i) => ({ ...i, timestamp: shiftDate(i.timestamp) }));
}

export async function getDnsResolution(customerId: string): Promise<DnsResolution[]> {
  const items = data[customerId]?.dnsResolution ?? [];
  return items.map((i) => ({ ...i, timestamp: shiftDate(i.timestamp) }));
}

export async function getPatchCompliance(customerId: string): Promise<PatchCompliance[]> {
  return data[customerId]?.patchCompliance ?? [];
}

export async function getPendingChanges(customerId: string): Promise<ChangeRecord[]> {
  const items = data[customerId]?.pendingChanges ?? [];
  return items.map((i) => ({ ...i, scheduledDate: shiftDate(i.scheduledDate) }));
}

export async function getProjects(customerId: string): Promise<ProjectDelivery[]> {
  const items = data[customerId]?.projects ?? [];
  return items.map((i) => ({ ...i, dueDate: shiftDate(i.dueDate) }));
}

export async function getServiceUtilization(customerId: string): Promise<ServiceUtilization[]> {
  const items = data[customerId]?.serviceUtilization ?? [];
  return items.map((i) => ({
    ...i,
    months: i.months.map((m) => ({ ...m, month: shiftMonth(m.month) })),
  }));
}
