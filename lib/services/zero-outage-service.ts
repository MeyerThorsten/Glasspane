import { ZeroOutageScore, DigitalTransformationMilestone } from "@/types";
import zeroOutageData from "@/data/mock/zero-outage.json";
import infraData from "@/data/mock/infrastructure.json";

const zoData = zeroOutageData as Record<string, ZeroOutageScore>;
const infra = infraData as Record<string, { digitalTransformation: DigitalTransformationMilestone[] }>;

export async function getZeroOutageScore(customerId: string): Promise<ZeroOutageScore> {
  return zoData[customerId] ?? { overall: 0, target: 0, pillars: [] };
}

export async function getDigitalTransformation(customerId: string): Promise<DigitalTransformationMilestone[]> {
  return infra[customerId]?.digitalTransformation ?? [];
}
