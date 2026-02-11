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
import { perturb, perturbInt, perturbAbsolute, extendMonthlyData, extendDailyData } from "@/lib/utils/data-variation";

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
  const shifted = items.map((i, idx) => ({
    ...i,
    timestamp: shiftDate(i.timestamp),
    cpu: perturb(i.cpu, 3, `cpu|${idx}`, 0, 100),
    memory: perturb(i.memory, 3, `memory|${idx}`, 0, 100),
    disk: perturb(i.disk, 3, `disk|${idx}`, 0, 100),
  }));
  return extendDailyData(shifted, "timestamp", (date, rng, prev) => ({
    timestamp: date,
    cpu: Math.round(Math.max(0, Math.min(100, (prev.cpu as number) + (rng() * 10 - 5))) * 100) / 100,
    memory: Math.round(Math.max(0, Math.min(100, (prev.memory as number) + (rng() * 6 - 3))) * 100) / 100,
    disk: Math.round(Math.max(0, Math.min(100, (prev.disk as number) + (rng() * 2 - 0.5))) * 100) / 100,
  }));
}

export async function getLatencyMetrics(customerId: string): Promise<LatencyMetric[]> {
  const items = data[customerId]?.latency ?? [];
  const shifted = items.map((i, idx) => ({
    ...i,
    timestamp: shiftDate(i.timestamp),
    p50: perturb(i.p50, 5, `p50|${idx}`, 0),
    p95: perturb(i.p95, 5, `p95|${idx}`, 0),
    p99: perturb(i.p99, 5, `p99|${idx}`, 0),
  }));
  return extendDailyData(shifted, "timestamp", (date, rng, prev) => ({
    timestamp: date,
    p50: Math.round(Math.max(1, (prev.p50 as number) + (rng() * 4 - 2)) * 100) / 100,
    p95: Math.round(Math.max(5, (prev.p95 as number) + (rng() * 10 - 5)) * 100) / 100,
    p99: Math.round(Math.max(10, (prev.p99 as number) + (rng() * 30 - 15)) * 100) / 100,
  }));
}

export async function getNetworkThroughput(customerId: string): Promise<NetworkThroughput[]> {
  const items = data[customerId]?.networkThroughput ?? [];
  const shifted = items.map((i, idx) => ({
    ...i,
    timestamp: shiftDate(i.timestamp),
    inbound: perturb(i.inbound, 8, `inbound|${idx}`, 0),
    outbound: perturb(i.outbound, 8, `outbound|${idx}`, 0),
  }));
  return extendDailyData(shifted, "timestamp", (date, rng, prev) => ({
    timestamp: date,
    inbound: Math.round(Math.max(100, (prev.inbound as number) + (rng() * 200 - 100)) * 100) / 100,
    outbound: Math.round(Math.max(100, (prev.outbound as number) + (rng() * 150 - 75)) * 100) / 100,
  }));
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
  return items.map((i, idx) => ({
    ...i,
    lastBackup: shiftISODate(i.lastBackup),
    nextScheduled: shiftISODate(i.nextScheduled),
    successRate: perturb(i.successRate, 1, `backupRate|${idx}`, 90, 100),
  }));
}

export async function getChangeCalendar(customerId: string): Promise<ChangeCalendarEntry[]> {
  const items = data[customerId]?.changeCalendar ?? [];
  return items.map((i, idx) => ({
    ...i,
    date: shiftDate(i.date),
    count: perturbAbsolute(i.count, 1, `changeCount|${idx}`, 0),
  }));
}

export async function getErrorRates(customerId: string): Promise<ErrorRate[]> {
  const items = data[customerId]?.errorRates ?? [];
  const shifted = items.map((i, idx) => ({
    ...i,
    timestamp: shiftDate(i.timestamp),
    rate: perturb(i.rate, 10, `errorRate|${idx}`, 0, 5),
  }));
  // Group by service, extend each independently, then merge
  const byService = new Map<string, ErrorRate[]>();
  for (const item of shifted) {
    const group = byService.get(item.serviceName) ?? [];
    group.push(item);
    byService.set(item.serviceName, group);
  }
  const extended: ErrorRate[] = [];
  for (const [, group] of byService) {
    extended.push(...extendDailyData(group, "timestamp", (date, rng, prev) => ({
      timestamp: date,
      serviceName: prev.serviceName as string,
      rate: Math.round(Math.max(0, Math.min(5, (prev.rate as number) + (rng() * 0.02 - 0.01))) * 1000) / 1000,
    })));
  }
  return extended;
}

export async function getDnsResolution(customerId: string): Promise<DnsResolution[]> {
  const items = data[customerId]?.dnsResolution ?? [];
  const shifted = items.map((i, idx) => ({
    ...i,
    timestamp: shiftDate(i.timestamp),
    avgMs: perturb(i.avgMs, 5, `dnsAvg|${idx}`, 0),
  }));
  return extendDailyData(shifted, "timestamp", (date, rng, prev) => ({
    timestamp: date,
    avgMs: Math.round(Math.max(1, (prev.avgMs as number) + (rng() * 2 - 1)) * 100) / 100,
  }));
}

export async function getPatchCompliance(customerId: string): Promise<PatchCompliance[]> {
  const items = data[customerId]?.patchCompliance ?? [];
  return items.map((i, idx) => {
    const delta = perturbAbsolute(0, 2, `patchDelta|${idx}`);
    const compliant = Math.max(0, i.compliant + delta);
    const nonCompliant = Math.max(0, i.nonCompliant - delta);
    return { ...i, compliant, nonCompliant, total: compliant + nonCompliant };
  });
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
  return items.map((svc) => ({
    ...svc,
    months: extendMonthlyData(
      svc.months.map((m, idx) => ({
        ...m,
        month: shiftMonth(m.month),
        usage: perturb(m.usage, 3, `svcUsage|${svc.serviceId}|${idx}`, 0),
        capacity: perturb(m.capacity, 3, `svcCap|${svc.serviceId}|${idx}`, 0),
      })),
      "month",
      (month, rng) => ({
        month,
        usage: Math.round(70 + rng() * 20),
        capacity: Math.round(90 + rng() * 10),
      }),
    ),
  }));
}
