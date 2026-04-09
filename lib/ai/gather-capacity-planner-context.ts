import { getResourceUtilization, getServiceUtilization } from "@/lib/services/infrastructure-service";

function describeTrend(values: number[]): { current: number; dailyGrowth: number } {
  if (values.length === 0) {
    return { current: 0, dailyGrowth: 0 };
  }

  const current = values[values.length - 1];
  const first = values[Math.max(0, values.length - 7)];
  const span = Math.max(1, values.slice(-7).length - 1);
  const dailyGrowth = Number(((current - first) / span).toFixed(2));

  return {
    current: Number(current.toFixed(1)),
    dailyGrowth,
  };
}

export async function gatherCapacityPlannerContext(customerId: string): Promise<string> {
  const [resources, serviceUtilization] = await Promise.all([
    getResourceUtilization(customerId),
    getServiceUtilization(customerId),
  ]);

  const cpu = describeTrend(resources.map((item) => item.cpu));
  const memory = describeTrend(resources.map((item) => item.memory));
  const disk = describeTrend(resources.map((item) => item.disk));

  const networkSource = serviceUtilization.find((item) => item.category === "Connectivity")
    ?? serviceUtilization[0];
  const networkMonths = networkSource?.months ?? [];
  const network = describeTrend(networkMonths.map((item) => item.usage));

  return [
    `CPU: current ${cpu.current}%, daily growth ${cpu.dailyGrowth}%`,
    `Memory: current ${memory.current}%, daily growth ${memory.dailyGrowth}%`,
    `Disk: current ${disk.current}%, daily growth ${disk.dailyGrowth}%`,
    `Network proxy from service utilization: current ${network.current}%, daily growth ${network.dailyGrowth}%`,
    ...serviceUtilization.map((item) => {
      const latest = item.months[item.months.length - 1];
      return `${item.serviceName}: usage ${latest?.usage ?? 0}%, capacity ${latest?.capacity ?? 0}%`;
    }),
  ].join("\n");
}
