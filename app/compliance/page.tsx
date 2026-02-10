"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getSecurityPosture } from "@/lib/services/security-service";
import { getPatchCompliance, getCertificates, getBackups } from "@/lib/services/infrastructure-service";
import { SecurityPosture, PatchCompliance, CertificateInfo, BackupStatus } from "@/types";
import WidgetShell from "@/components/widgets/WidgetShell";
import StatusBadge from "@/components/widgets/shared/StatusBadge";
import { DonutChart, BarList } from "@tremor/react";

function SecurityScore() {
  const { customer } = useCustomer();
  const [data, setData] = useState<SecurityPosture | null>(null);

  useEffect(() => {
    if (!customer) return;
    getSecurityPosture(customer.id).then(setData);
  }, [customer]);

  if (!data) return null;

  const scoreColor =
    data.overallScore >= 80
      ? "text-emerald-600"
      : data.overallScore >= 60
        ? "text-amber-600"
        : "text-red-600";

  const donutData = data.vulnerabilities.map((v) => ({
    name: v.severity.charAt(0).toUpperCase() + v.severity.slice(1),
    value: v.count,
  }));

  const severityColors: Record<string, string> = {
    Critical: "rose",
    High: "orange",
    Medium: "amber",
    Low: "emerald",
  };

  const barData = data.vulnerabilities.map((v) => ({
    name: v.severity.charAt(0).toUpperCase() + v.severity.slice(1),
    value: v.count,
    color: severityColors[v.severity.charAt(0).toUpperCase() + v.severity.slice(1)] ?? "gray",
  }));

  return (
    <WidgetShell title="Security Score" size="full">
      <div className="space-y-6">
        <div className="flex items-start gap-8">
          <div>
            <p className={`text-4xl font-bold ${scoreColor}`}>{data.overallScore}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Overall Security Score</p>
          </div>
          <div className="w-40 h-40">
            <DonutChart
              data={donutData}
              category="value"
              index="name"
              colors={["rose", "orange", "amber", "emerald"]}
              showAnimation
              showTooltip
              showLabel={false}
            />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Vulnerability Breakdown</p>
            <BarList
              data={barData}
              className="mt-2"
            />
          </div>
        </div>
        {data.topCves.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Top CVEs</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#252533]">
                    <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">CVE</th>
                    <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Severity</th>
                    <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Affected</th>
                    <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topCves.map((cve) => (
                    <tr key={cve.id} className="border-b border-gray-50 dark:border-[#1C1C27]">
                      <td className="py-2 px-3 font-mono text-xs text-gray-900 dark:text-gray-100">{cve.id}</td>
                      <td className="py-2 px-3">
                        <StatusBadge
                          label={cve.severity}
                          variant={cve.severity === "critical" ? "danger" : cve.severity === "high" ? "warning" : "info"}
                        />
                      </td>
                      <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{cve.affected}</td>
                      <td className="py-2 px-3 text-gray-500 dark:text-gray-400 text-xs">{cve.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}

function PatchComplianceSection() {
  const { customer } = useCustomer();
  const [data, setData] = useState<PatchCompliance[]>([]);

  useEffect(() => {
    if (!customer) return;
    getPatchCompliance(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  return (
    <WidgetShell title="Patch Compliance" size="full">
      <div className="space-y-4">
        {data.map((item) => {
          const pct = item.total > 0 ? (item.compliant / item.total) * 100 : 0;
          return (
            <div key={item.category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-900 dark:text-gray-100">{item.category}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.compliant}/{item.total} ({pct.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-[#262633] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 90 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </WidgetShell>
  );
}

function CertificateStatus() {
  const { customer } = useCustomer();
  const [data, setData] = useState<CertificateInfo[]>([]);

  useEffect(() => {
    if (!customer) return;
    getCertificates(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  const statusVariant = (s: string) => {
    switch (s) {
      case "valid": return "success" as const;
      case "expiring-soon": return "warning" as const;
      case "expired": return "danger" as const;
      default: return "neutral" as const;
    }
  };

  return (
    <WidgetShell title="Certificate Status" size="full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-[#252533]">
              <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Domain</th>
              <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Issuer</th>
              <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Expires</th>
              <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Days Left</th>
              <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((cert) => (
              <tr key={cert.domain} className="border-b border-gray-50 dark:border-[#1C1C27]">
                <td className="py-2 px-3 text-gray-900 dark:text-gray-100 font-mono text-xs">{cert.domain}</td>
                <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{cert.issuer}</td>
                <td className="py-2 px-3 text-gray-500 dark:text-gray-400 text-xs">{cert.expiresAt}</td>
                <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{cert.daysUntilExpiry}</td>
                <td className="py-2 px-3 text-right">
                  <StatusBadge label={cert.status} variant={statusVariant(cert.status)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetShell>
  );
}

function BackupStatusSection() {
  const { customer } = useCustomer();
  const [data, setData] = useState<BackupStatus[]>([]);

  useEffect(() => {
    if (!customer) return;
    getBackups(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  return (
    <WidgetShell title="Backup Status" size="full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-[#252533]">
              <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Service</th>
              <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Last Backup</th>
              <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Next Scheduled</th>
              <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Success Rate</th>
              <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((backup) => (
              <tr key={backup.serviceName} className="border-b border-gray-50 dark:border-[#1C1C27]">
                <td className="py-2 px-3 text-gray-900 dark:text-gray-100">{backup.serviceName}</td>
                <td className="py-2 px-3 text-gray-500 dark:text-gray-400 text-xs">{backup.lastBackup}</td>
                <td className="py-2 px-3 text-gray-500 dark:text-gray-400 text-xs">{backup.nextScheduled}</td>
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-[#262633] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          backup.successRate >= 95 ? "bg-emerald-500" : backup.successRate >= 80 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${backup.successRate}%` }}
                      />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{backup.successRate}%</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-right">
                  <StatusBadge
                    label={backup.successRate >= 95 ? "Healthy" : backup.successRate >= 80 ? "Warning" : "Critical"}
                    variant={backup.successRate >= 95 ? "success" : backup.successRate >= 80 ? "warning" : "danger"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetShell>
  );
}

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <SecurityScore />
      <PatchComplianceSection />
      <CertificateStatus />
      <BackupStatusSection />
    </div>
  );
}
