import { getCareerProgress } from "@/lib/services/workforce-service";

export async function gatherWorkforceGrowthContext(employeeId: string): Promise<string> {
  const progress = await getCareerProgress(employeeId);
  if (!progress) {
    return "";
  }

  const { employee, ladder, currentIndex, nextStep } = progress;

  return [
    `employeeId: ${employee.id}`,
    `name: ${employee.name}`,
    `role: ${employee.role}`,
    `track: ${employee.track}`,
    `currentLevel: ${employee.level}`,
    `manager: ${employee.manager}`,
    `skills: ${employee.skills.join(", ")}`,
    `goals: ${employee.goals.join(" | ")}`,
    `engagementScore: ${employee.engagementScore}`,
    `opportunityReadiness: ${employee.opportunityReadiness}`,
    `recentSignals: ${employee.recentSignals.join(" | ")}`,
    `careerLadder.currentStep: ${JSON.stringify(ladder[currentIndex] ?? null)}`,
    `careerLadder.nextStep: ${JSON.stringify(nextStep ?? null)}`,
    `careerLadder.fullPath: ${JSON.stringify(ladder)}`,
  ].join("\n");
}
