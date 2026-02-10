import { SecurityPosture } from "@/types";
import securityData from "@/data/mock/security.json";

const data = securityData as Record<string, SecurityPosture>;

export async function getSecurityPosture(customerId: string): Promise<SecurityPosture> {
  return data[customerId] ?? { overallScore: 0, vulnerabilities: [], topCves: [] };
}
