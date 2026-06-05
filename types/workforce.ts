import type { AiModelInfo } from "./ai";

export interface WorkforceEmployee {
  id: string;
  name: string;
  role: string;
  track: string;
  level: string;
  manager: string;
  skills: string[];
  goals: string[];
  engagementScore: number;
  opportunityReadiness: number;
  recentSignals: string[];
}

export interface CareerLadderStep {
  level: string;
  title: string;
  expectations: string[];
  skills: string[];
}

export interface WorkforceGrowthRecommendation {
  id: string;
  title: string;
  rationale: string;
  actions: string[];
  sources: string[];
  confidence: "low" | "medium" | "high";
}

export interface AiWorkforceGrowthResponse {
  employeeId: string;
  recommendations: WorkforceGrowthRecommendation[];
  generatedAt: string;
  providerLabel?: string;
  modelInfo?: AiModelInfo;
}
