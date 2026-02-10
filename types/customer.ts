export interface Customer {
  id: string;
  name: string;
  industry: string;
  tier: "Enterprise Premium" | "Enterprise" | "Standard";
  subscribedCategories: ServiceCategory[];
  contactEmail: string;
  logoInitials: string;
}

export type ServiceCategory =
  | "Cloud"
  | "SAP"
  | "Security"
  | "Connectivity"
  | "Workplace"
  | "AI & Data"
  | "IoT";
