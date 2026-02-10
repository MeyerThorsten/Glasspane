"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getCertificates } from "@/lib/services/infrastructure-service";
import { CertificateInfo } from "@/types";
import StatusBadge from "@/components/widgets/shared/StatusBadge";

const statusVariant: Record<CertificateInfo["status"], "success" | "warning" | "danger"> = {
  valid: "success",
  "expiring-soon": "warning",
  expired: "danger",
};

export default function CertificateExpiry() {
  const { customer } = useCustomer();
  const [data, setData] = useState<CertificateInfo[]>([]);

  useEffect(() => {
    if (!customer) return;
    getCertificates(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th className="pb-2 font-medium">Domain</th>
            <th className="pb-2 font-medium">Issuer</th>
            <th className="pb-2 font-medium">Expiry Date</th>
            <th className="pb-2 font-medium text-right">Days Left</th>
            <th className="pb-2 font-medium text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((cert) => (
            <tr key={cert.domain} className="border-b border-gray-50">
              <td className="py-2 font-medium text-gray-900">{cert.domain}</td>
              <td className="py-2 text-gray-600">{cert.issuer}</td>
              <td className="py-2 text-gray-600">{cert.expiresAt}</td>
              <td className="py-2 text-right text-gray-700">{cert.daysUntilExpiry}</td>
              <td className="py-2 text-right">
                <StatusBadge
                  label={cert.status.replace("-", " ")}
                  variant={statusVariant[cert.status]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
