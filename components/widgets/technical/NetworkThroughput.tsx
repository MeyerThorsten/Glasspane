"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getNetworkThroughput } from "@/lib/services/infrastructure-service";
import { AreaChart } from "@tremor/react";
import { NetworkThroughput as NetworkThroughputType } from "@/types";

export default function NetworkThroughput() {
  const { customer } = useCustomer();
  const [data, setData] = useState<NetworkThroughputType[]>([]);

  useEffect(() => {
    if (!customer) return;
    getNetworkThroughput(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    timestamp: d.timestamp,
    Inbound: d.inbound,
    Outbound: d.outbound,
  }));

  return (
    <div>
      <AreaChart
        data={chartData}
        index="timestamp"
        categories={["Inbound", "Outbound"]}
        colors={["cyan", "fuchsia"]}
        yAxisWidth={64}
        showAnimation
        curveType="monotone"
        valueFormatter={(v: number) => `${v} Mbps`}
        className="h-64"
      />
    </div>
  );
}
