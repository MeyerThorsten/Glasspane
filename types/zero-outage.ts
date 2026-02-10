export interface ZeroOutagePillar {
  name: "People" | "Processes" | "Platforms";
  score: number;
  target: number;
  metrics: PillarMetric[];
}

export interface PillarMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
}

export interface ZeroOutageScore {
  overall: number;
  target: number;
  pillars: ZeroOutagePillar[];
}

export interface DigitalTransformationMilestone {
  name: string;
  progress: number;
  target: number;
  status: "on-track" | "at-risk" | "delayed" | "completed";
}
