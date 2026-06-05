import workforceData from "@/data/mock/workforce.json";
import type { CareerLadderStep, WorkforceEmployee } from "@/types";

interface WorkforceData {
  employees: WorkforceEmployee[];
  ladders: Record<string, CareerLadderStep[]>;
}

const data = workforceData as WorkforceData;

export async function getWorkforceEmployees(): Promise<WorkforceEmployee[]> {
  return data.employees;
}

export async function getWorkforceEmployeeById(id: string): Promise<WorkforceEmployee | undefined> {
  return data.employees.find((employee) => employee.id === id);
}

export async function getCareerLadderForRole(role: string): Promise<CareerLadderStep[]> {
  return data.ladders[role] ?? [];
}

export async function getCareerProgress(employeeId: string): Promise<{
  employee: WorkforceEmployee;
  ladder: CareerLadderStep[];
  currentIndex: number;
  nextStep?: CareerLadderStep;
} | null> {
  const employee = await getWorkforceEmployeeById(employeeId);
  if (!employee) {
    return null;
  }

  const ladder = await getCareerLadderForRole(employee.role);
  const currentIndex = Math.max(0, ladder.findIndex((step) => step.level === employee.level));

  return {
    employee,
    ladder,
    currentIndex,
    nextStep: ladder[currentIndex + 1],
  };
}
