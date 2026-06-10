import { VerticalProfile } from "@/types";

export const verticalProfiles: VerticalProfile[] = [
  {
    id: "manufacturing",
    label: "Manufacturing",
    industries: ["Manufacturing", "Automotive", "Industrial"],
    priorityCategories: ["SAP", "IoT", "Connectivity", "Security"],
    complianceFrameworks: [
      { id: "iso-27001", name: "ISO 27001", description: "Information security management" },
      { id: "tisax", name: "TISAX", description: "Automotive supply-chain information security" },
      { id: "nis2", name: "NIS2", description: "EU directive for critical-entity cyber resilience" },
    ],
    benchmarks: {
      slaTarget: 99.95,
      securityScoreTarget: 85,
      changeSuccessTarget: 96,
      patchComplianceTarget: 92,
      budgetVarianceTolerancePct: 5,
    },
    keyRisks: [
      "OT/IT convergence exposes production lines to cyber incidents",
      "ERP downtime halts plant logistics and order fulfilment",
      "Legacy shop-floor devices delay patch rollouts",
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare",
    industries: ["Healthcare", "Pharma", "Life Sciences", "Hospital"],
    priorityCategories: ["Security", "Cloud", "Workplace", "AI & Data"],
    complianceFrameworks: [
      { id: "hipaa", name: "HIPAA", description: "US health-data privacy and security" },
      { id: "gdpr", name: "GDPR", description: "EU personal-data protection (special-category health data)" },
      { id: "iso-27799", name: "ISO 27799", description: "Health informatics security management" },
    ],
    benchmarks: {
      slaTarget: 99.99,
      securityScoreTarget: 92,
      changeSuccessTarget: 98,
      patchComplianceTarget: 96,
      budgetVarianceTolerancePct: 4,
    },
    keyRisks: [
      "Patient-data breaches carry regulatory and clinical consequences",
      "Clinical system outages directly impact patient care",
      "Medical devices run long-lived, hard-to-patch firmware",
    ],
  },
  {
    id: "financial-services",
    label: "Financial Services",
    industries: ["Financial Services", "Banking", "Insurance", "Fintech"],
    priorityCategories: ["Security", "Cloud", "AI & Data", "Connectivity"],
    complianceFrameworks: [
      { id: "dora", name: "DORA", description: "EU digital operational resilience for finance" },
      { id: "pci-dss", name: "PCI DSS", description: "Payment-card data security" },
      { id: "iso-27001", name: "ISO 27001", description: "Information security management" },
    ],
    benchmarks: {
      slaTarget: 99.99,
      securityScoreTarget: 94,
      changeSuccessTarget: 98,
      patchComplianceTarget: 97,
      budgetVarianceTolerancePct: 3,
    },
    keyRisks: [
      "Operational resilience incidents are reportable under DORA",
      "Transaction-platform latency erodes trading and payment revenue",
      "Third-party concentration risk in cloud and market-data feeds",
    ],
  },
  {
    id: "retail",
    label: "Retail",
    industries: ["Retail", "E-Commerce", "Consumer Goods", "Wholesale"],
    priorityCategories: ["Cloud", "Workplace", "AI & Data", "Connectivity"],
    complianceFrameworks: [
      { id: "pci-dss", name: "PCI DSS", description: "Payment-card data security" },
      { id: "gdpr", name: "GDPR", description: "EU personal-data protection for customer records" },
    ],
    benchmarks: {
      slaTarget: 99.9,
      securityScoreTarget: 82,
      changeSuccessTarget: 95,
      patchComplianceTarget: 90,
      budgetVarianceTolerancePct: 6,
    },
    keyRisks: [
      "Storefront or POS downtime during peak trading windows",
      "Seasonal load spikes stress capacity planning",
      "Cardholder-data scope creep across channels",
    ],
  },
  {
    id: "public-sector",
    label: "Public Sector",
    industries: ["Public Sector", "Government", "Education", "Municipal"],
    priorityCategories: ["Security", "Workplace", "Cloud", "Connectivity"],
    complianceFrameworks: [
      { id: "bsi-grundschutz", name: "BSI IT-Grundschutz", description: "German federal baseline security" },
      { id: "nis2", name: "NIS2", description: "EU directive for critical-entity cyber resilience" },
      { id: "gdpr", name: "GDPR", description: "EU personal-data protection for citizen data" },
    ],
    benchmarks: {
      slaTarget: 99.9,
      securityScoreTarget: 88,
      changeSuccessTarget: 96,
      patchComplianceTarget: 93,
      budgetVarianceTolerancePct: 2,
    },
    keyRisks: [
      "Citizen-service portals are high-visibility outage targets",
      "Strict procurement rules slow remediation budgets",
      "Sovereignty requirements constrain cloud placement",
    ],
  },
  {
    id: "energy-utilities",
    label: "Energy & Utilities",
    industries: ["Energy", "Utilities", "Oil & Gas", "Renewables"],
    priorityCategories: ["IoT", "Security", "Connectivity", "AI & Data"],
    complianceFrameworks: [
      { id: "kritis", name: "KRITIS", description: "German critical-infrastructure protection" },
      { id: "nis2", name: "NIS2", description: "EU directive for critical-entity cyber resilience" },
      { id: "iec-62443", name: "IEC 62443", description: "Industrial automation and control-system security" },
    ],
    benchmarks: {
      slaTarget: 99.99,
      securityScoreTarget: 90,
      changeSuccessTarget: 97,
      patchComplianceTarget: 94,
      budgetVarianceTolerancePct: 4,
    },
    keyRisks: [
      "Grid-control and SCADA systems are critical-infrastructure targets",
      "Field IoT fleets create a wide, distributed attack surface",
      "Regulatory reporting deadlines after security incidents",
    ],
  },
  {
    id: "technology",
    label: "Technology",
    industries: ["Technology", "Software", "Telecommunications", "Media"],
    priorityCategories: ["Cloud", "AI & Data", "Security", "Workplace"],
    complianceFrameworks: [
      { id: "soc2", name: "SOC 2", description: "Trust-services criteria for service organizations" },
      { id: "iso-27001", name: "ISO 27001", description: "Information security management" },
    ],
    benchmarks: {
      slaTarget: 99.95,
      securityScoreTarget: 88,
      changeSuccessTarget: 97,
      patchComplianceTarget: 95,
      budgetVarianceTolerancePct: 8,
    },
    keyRisks: [
      "Customer-facing platform reliability is the product",
      "High deployment velocity raises change-failure exposure",
      "Cloud cost growth outpaces revenue without governance",
    ],
  },
  {
    id: "logistics",
    label: "Logistics",
    industries: ["Logistics", "Transportation", "Aviation", "Shipping"],
    priorityCategories: ["Connectivity", "IoT", "Cloud", "SAP"],
    complianceFrameworks: [
      { id: "nis2", name: "NIS2", description: "EU directive for critical-entity cyber resilience" },
      { id: "iso-28000", name: "ISO 28000", description: "Supply-chain security management" },
    ],
    benchmarks: {
      slaTarget: 99.9,
      securityScoreTarget: 84,
      changeSuccessTarget: 95,
      patchComplianceTarget: 91,
      budgetVarianceTolerancePct: 6,
    },
    keyRisks: [
      "Tracking and telematics outages blind the supply chain",
      "Hub connectivity failures cascade into delivery delays",
      "Partner-integration sprawl widens the attack surface",
    ],
  },
  {
    id: "general",
    label: "General",
    industries: [],
    priorityCategories: ["Cloud", "Security", "Workplace"],
    complianceFrameworks: [
      { id: "iso-27001", name: "ISO 27001", description: "Information security management" },
      { id: "gdpr", name: "GDPR", description: "EU personal-data protection" },
    ],
    benchmarks: {
      slaTarget: 99.9,
      securityScoreTarget: 85,
      changeSuccessTarget: 95,
      patchComplianceTarget: 90,
      budgetVarianceTolerancePct: 5,
    },
    keyRisks: [
      "Unplanned downtime erodes business confidence",
      "Unpatched systems accumulate exploitable vulnerabilities",
    ],
  },
];

const generalProfile = verticalProfiles.find((p) => p.id === "general")!;

export function resolveVerticalProfile(industry: string): VerticalProfile {
  const needle = industry.trim().toLowerCase();
  if (!needle) return generalProfile;

  const exact = verticalProfiles.find((p) =>
    p.industries.some((i) => i.toLowerCase() === needle)
  );
  if (exact) return exact;

  const partial = verticalProfiles.find((p) =>
    p.industries.some(
      (i) => needle.includes(i.toLowerCase()) || i.toLowerCase().includes(needle)
    )
  );
  return partial ?? generalProfile;
}
