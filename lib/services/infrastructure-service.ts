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
  return data[customerId]?.resourceUtilization ?? [];
}

export async function getLatencyMetrics(customerId: string): Promise<LatencyMetric[]> {
  return data[customerId]?.latency ?? [];
}

export async function getNetworkThroughput(customerId: string): Promise<NetworkThroughput[]> {
  return data[customerId]?.networkThroughput ?? [];
}

export async function getCertificates(customerId: string): Promise<CertificateInfo[]> {
  return data[customerId]?.certificates ?? [];
}

export async function getBackups(customerId: string): Promise<BackupStatus[]> {
  return data[customerId]?.backups ?? [];
}

export async function getChangeCalendar(customerId: string): Promise<ChangeCalendarEntry[]> {
  return data[customerId]?.changeCalendar ?? [];
}

export async function getErrorRates(customerId: string): Promise<ErrorRate[]> {
  return data[customerId]?.errorRates ?? [];
}

export async function getDnsResolution(customerId: string): Promise<DnsResolution[]> {
  return data[customerId]?.dnsResolution ?? [];
}

export async function getPatchCompliance(customerId: string): Promise<PatchCompliance[]> {
  return data[customerId]?.patchCompliance ?? [];
}

export async function getPendingChanges(customerId: string): Promise<ChangeRecord[]> {
  return data[customerId]?.pendingChanges ?? [];
}

export async function getProjects(customerId: string): Promise<ProjectDelivery[]> {
  return data[customerId]?.projects ?? [];
}

export async function getServiceUtilization(customerId: string): Promise<ServiceUtilization[]> {
  return data[customerId]?.serviceUtilization ?? [];
}
