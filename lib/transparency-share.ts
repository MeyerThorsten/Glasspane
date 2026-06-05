import { viewConfigs } from "@/config/view-configs";
import type { WidgetConfig } from "@/types";

export type PublicAudienceRole = "executive" | "operations" | "service";

export interface PublicTransparencyShare {
  version: 1;
  customerId: string;
  audience: PublicAudienceRole;
  widgets: string[];
  createdAt: string;
  expiresAt?: string;
}

export interface PublicWidgetOption extends WidgetConfig {
  roles: PublicAudienceRole[];
}

const PUBLIC_WIDGET_IDS = new Set([
  "sla-compliance-gauge",
  "zero-outage-score",
  "service-health-overview",
  "cost-overview",
  "risk-score",
  "major-incidents-summary",
  "service-utilization",
  "ticket-volume-trends",
  "mttr-trends",
  "change-success-rate",
  "sla-compliance-by-service",
  "zero-outage-pillars",
  "service-availability-trend",
  "system-status-grid",
  "uptime-by-service",
  "latency-metrics",
  "incident-by-severity",
  "patch-compliance",
  "resource-utilization",
  "network-throughput",
  "certificate-expiry",
  "vulnerability-summary",
  "backup-success-rate",
  "error-rate-by-service",
]);

export const PUBLIC_ROLE_WIDGETS: Record<PublicAudienceRole, string[]> = {
  executive: [
    "sla-compliance-gauge",
    "zero-outage-score",
    "service-health-overview",
    "cost-overview",
    "risk-score",
    "major-incidents-summary",
    "service-availability-trend",
  ],
  operations: [
    "service-health-overview",
    "sla-compliance-by-service",
    "system-status-grid",
    "uptime-by-service",
    "latency-metrics",
    "incident-by-severity",
    "resource-utilization",
    "error-rate-by-service",
    "backup-success-rate",
  ],
  service: [
    "sla-compliance-gauge",
    "zero-outage-score",
    "service-availability-trend",
    "service-utilization",
    "ticket-volume-trends",
    "mttr-trends",
    "change-success-rate",
    "zero-outage-pillars",
  ],
};

function allWidgets(): WidgetConfig[] {
  const widgets = new Map<string, WidgetConfig>();
  for (const view of Object.values(viewConfigs)) {
    for (const widget of view) {
      if (PUBLIC_WIDGET_IDS.has(widget.id) && !widgets.has(widget.id)) {
        widgets.set(widget.id, widget);
      }
    }
  }

  return [...widgets.values()];
}

export const PUBLIC_WIDGET_CATALOG: PublicWidgetOption[] = allWidgets().map((widget) => ({
  ...widget,
  roles: (Object.entries(PUBLIC_ROLE_WIDGETS) as Array<[PublicAudienceRole, string[]]>)
    .filter(([, widgetIds]) => widgetIds.includes(widget.id))
    .map(([role]) => role),
}));

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function isAudienceRole(value: unknown): value is PublicAudienceRole {
  return value === "executive" || value === "operations" || value === "service";
}

export function encodeTransparencyShareToken(config: PublicTransparencyShare): string {
  return toBase64Url(JSON.stringify(config));
}

export function decodeTransparencyShareToken(token: string): PublicTransparencyShare | null {
  try {
    const parsed = JSON.parse(fromBase64Url(token)) as Partial<PublicTransparencyShare>;
    if (
      parsed.version !== 1
      || typeof parsed.customerId !== "string"
      || !isAudienceRole(parsed.audience)
      || !Array.isArray(parsed.widgets)
      || typeof parsed.createdAt !== "string"
    ) {
      return null;
    }

    if (parsed.expiresAt && Date.parse(parsed.expiresAt) < Date.now()) {
      return null;
    }

    return {
      version: 1,
      customerId: parsed.customerId,
      audience: parsed.audience,
      widgets: parsed.widgets.filter((id): id is string => typeof id === "string"),
      createdAt: parsed.createdAt,
      expiresAt: typeof parsed.expiresAt === "string" ? parsed.expiresAt : undefined,
    };
  } catch {
    return null;
  }
}

export function getPublicWidgetsForShare(config: PublicTransparencyShare): PublicWidgetOption[] {
  const requested = new Set(config.widgets);
  const allowed = new Set(PUBLIC_ROLE_WIDGETS[config.audience]);

  return PUBLIC_WIDGET_CATALOG.filter((widget) =>
    requested.has(widget.id) && allowed.has(widget.id),
  );
}
