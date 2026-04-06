# All Is Well — Your End-to-End Digital Health Dashboard

A demo-ready dashboard showcasing how managed service customers can monitor their subscribed IT services. Built around the **Zero Outage** strategy (99.999% availability target) and the 3P pillars: People, Processes, Platforms. **All Is Well** provides AI-powered insights alongside real-time operational metrics in a unified transparency portal.

*Your End-to-End Digital Health Dashboard*

This MVP uses mock data to demonstrate the look, feel, and interaction model of a widget-driven, role-based transparency portal with AI-powered insights.

## Quick Start

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to the C-Level dashboard view.

> **Note:** `--legacy-peer-deps` is required because Tremor v3 declares a peer dependency on React 18, while this project uses React 19 / Next.js 16. Tremor works fine at runtime.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) + TypeScript | SSR-ready, file-based routing |
| UI Components | Tremor + shadcn/ui primitives | Dashboard charts and UI elements |
| Charts | Recharts (via Tremor) | AreaChart, BarChart, DonutChart, LineChart |
| Styling | Tailwind CSS 4 | Utility-first CSS with custom indigo theme |
| Layout | CSS Grid (12-column) | Responsive widget grid |
| Icons | @remixicon/react | Tremor's default icon set |

## Branding

| Element | Value |
|---------|-------|
| Primary | `#4F46E5` (Indigo) |
| Hover | `#4338CA` |
| Light tint | `#EEF2FF` |
| Success | `#00C26D` |
| Danger | `#F2321E` |
| Warning | `#FC7E21` |
| Info | `#3950EA` |
| Font | Inter / system-ui |

CSS variables and Tailwind theme tokens are defined in `app/globals.css`.

## Tremor v3 + Tailwind CSS v4 Compatibility

Tremor v3 constructs Tailwind class names dynamically at runtime using template literals (e.g. `` `fill-${color}-500` ``). Tailwind CSS v4's JIT scanner only detects class names that appear as complete strings in source files, so these dynamic classes are never generated — causing all chart colors to render as black (SVG default fill).

### Color Safelist

`app/globals.css` includes a `@source inline("...")` directive that explicitly safelists every color utility Tremor needs:

- `fill-{color}-500` and `stroke-{color}-500` — SVG chart fills and strokes
- `bg-{color}-{50,100,200,500,600}` — backgrounds at various shades
- `text-{color}-{500,700,900}` — text colors
- `border-{color}-500` and `ring-{color}-300` — borders and focus rings

This covers 22 Tailwind colors (blue, cyan, slate, gray, red, orange, amber, emerald, violet, fuchsia, rose, indigo, green, pink, sky, teal, purple, yellow, zinc, neutral, stone, lime).

### Tremor Semantic Tokens

Tremor also uses semantic class names like `fill-tremor-content`, `bg-tremor-background`, `text-tremor-label`, etc. These require two things in `globals.css`:

1. **Safelist entries** — the semantic classes are included in the `@source inline(...)` block
2. **Theme definitions** — the `@theme inline` block defines the corresponding CSS custom properties (`--color-tremor-brand`, `--color-tremor-background`, `--color-tremor-content`, etc.) and font sizes (`--text-tremor-label`, `--text-tremor-default`, `--text-tremor-title`, `--text-tremor-metric`)

### Adding New Chart Colors

If you use a Tremor color not already in the safelist (e.g. `"warmGray"`), add its utilities to the `@source inline(...)` block in `globals.css` or the chart will render without color.

## Architecture

### View Switching

Single `/dashboard` page with tab-based view switching stored in URL search params (`?view=c-level`). Three views:

- **C-Level** — Executive KPIs, SLA gauges, cost overview, risk score
- **Business** — Operational metrics, tickets, changes, project delivery
- **Technical** — System status, latency, resource utilization, vulnerabilities

### Widget System

Each widget is a self-contained `"use client"` React component wrapped by `WidgetShell` (consistent card styling, loading skeleton, error boundary). Widgets are:

- **Lazy-loaded** via `React.lazy()` through `config/widget-registry.ts`
- **Configured per view** in `config/view-configs.ts` (widget ID, size, title)
- **Filtered by customer** — only widgets relevant to subscribed service categories appear

### Data Flow

```
data/mock/*.json  →  lib/services/*-service.ts  →  Widget components (useEffect + useState)
                          ↑
                    async functions
                    (swap for real APIs later)
```

### Customer Context

`CustomerProvider` wraps the dashboard layout. The `useCustomer()` hook provides the active customer to all widgets. Switching customers in the `CustomerSelector` dropdown re-renders all widget data.

## Project Structure

```
Transparency/
├── app/
│   ├── layout.tsx                    # Root layout (html, body, metadata)
│   ├── page.tsx                      # Landing → redirect to /dashboard
│   ├── globals.css                   # Tailwind + brand CSS variables
│   └── dashboard/
│       ├── layout.tsx                # Sidebar + Header + CustomerProvider
│       ├── page.tsx                  # Widget grid (reads ?view= param)
│       └── loading.tsx               # Skeleton loader
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx               # Logo, navigation, customer selector
│   │   ├── Header.tsx                # View tabs, avatar, notifications
│   │   ├── ViewTabs.tsx              # C-Level / Business / Technical switcher
│   │   └── CustomerSelector.tsx      # Dropdown to switch customer context
│   └── widgets/
│       ├── WidgetShell.tsx           # Card wrapper (title, loading, error)
│       ├── WidgetGrid.tsx            # CSS Grid renderer: config → components
│       ├── SortableWidget.tsx        # Drag-and-drop widget wrapper
│       ├── AiChatPanel.tsx           # Conversational AI panel
│       ├── shared/                   # KpiCard, StatusBadge, TrendIndicator
│       ├── c-level/                  # 13 widget components (incl. AI + optimization)
│       ├── business/                 # 14 widget components (incl. AI)
│       ├── technical/                # 17 widget components (incl. AI)
│       └── ai/                       # 9 AI-powered widget components
├── config/
│   ├── widget-registry.ts            # Widget ID → lazy component mapping (44 widgets)
│   ├── view-configs.ts               # Widget layout arrays per view
│   ├── navigation.ts                 # Sidebar nav items
│   └── theme.ts                      # Brand color tokens
├── lib/
│   ├── customer-context.tsx           # React Context for active customer
│   ├── sidebar-context.tsx            # React Context for sidebar collapsed state
│   ├── use-widget-order.ts            # Hook for persisted drag-and-drop widget order
│   └── services/                      # 8 service modules (async data access)
│       ├── customer-service.ts
│       ├── service-service.ts
│       ├── kpi-service.ts
│       ├── incident-service.ts
│       ├── zero-outage-service.ts
│       ├── cost-service.ts
│       ├── security-service.ts
│       └── infrastructure-service.ts
├── data/
│   └── mock/                          # 7 JSON files with mock data
│       ├── customers.json
│       ├── services.json
│       ├── kpis.json
│       ├── incidents.json
│       ├── zero-outage.json
│       ├── costs.json
│       ├── security.json
│       └── infrastructure.json
├── types/                             # 8 TypeScript definition files
│   ├── index.ts                       # Barrel export
│   ├── customer.ts
│   ├── service.ts
│   ├── kpi.ts
│   ├── incident.ts
│   ├── zero-outage.ts
│   ├── widget.ts
│   ├── infrastructure.ts
│   └── security.ts
└── public/
    └── logo.png
```

## Widget Catalog

44 widgets are registered across 3 role-based views. AI-powered widgets are shared across views and powered by the AI service layer.

### C-Level View (13 widgets)

| Widget | Size | Visualization |
|--------|------|--------------|
| SLA Compliance Gauge | medium | DonutChart with 99.999% target ring |
| Zero Outage Score | medium | Large metric + 3 CategoryBars (People/Processes/Platforms) |
| Service Health Overview | large | Grid of service cards with status badges |
| Cost Overview | medium | BarChart by service category + month-over-month trend |
| Risk Score | small | Single number with risk distribution CategoryBar |
| Major Incidents Summary | medium | BarList of P1-P4 incidents with counts |
| Digital Transformation Progress | medium | ProgressBars for migration milestones |
| Security Posture | small | DonutChart of vulnerabilities + overall score |
| Optimization | medium | Cost and performance optimization recommendations |
| AI Summary | medium | AI-generated executive summary of service health |
| AI Risk Briefing | medium | AI-assessed risk factors and mitigation priorities |
| AI Cost Forecast | medium | AI-predicted cost trends and budget recommendations |
| AI Predictions | medium | AI-driven forecasts for key operational metrics |

### Business View (14 widgets)

| Widget | Size | Visualization |
|--------|------|--------------|
| Service Utilization | medium | Stacked BarChart by category |
| Ticket Volume Trends | medium | AreaChart (opened vs resolved, 12 months) |
| MTTR Trends | medium | LineChart by severity |
| Change Success Rate | small | Donut gauge with trend arrow |
| Project Delivery Status | large | Table with progress bars |
| SLA Compliance by Service | large | BarList sorted by SLA % |
| Top Open Issues | medium | Table with severity badges |
| Pending Changes | medium | Table with date/risk/service |
| Zero Outage Pillars | medium | Three CategoryBars with metrics |
| Service Availability Trend | full | AreaChart with 99.999% reference line |
| AI Summary | medium | AI-generated operational summary |
| AI Anomalies | medium | AI-detected anomalies in service behaviour |
| AI SLA Risk Advisor | medium | AI-ranked SLA breach risk per service |
| AI Change Impact | medium | AI-predicted impact assessment for pending changes |

### Technical View (17 widgets)

| Widget | Size | Visualization |
|--------|------|--------------|
| System Status Grid | full | Tile grid with colored status indicators |
| Uptime by Service | large | BarList with SLA target comparison |
| Latency Metrics | medium | LineChart (p50/p95/p99) |
| Incidents by Severity | medium | Stacked BarChart (P1-P4) |
| Patch Compliance | small | DonutChart |
| Resource Utilization | large | Triple AreaChart (CPU/Memory/Disk) |
| Network Throughput | medium | AreaChart (inbound/outbound) |
| Certificate Expiry | medium | Table with countdown badges |
| Vulnerability Summary | medium | DonutChart + top CVE list |
| Backup Success Rate | small | Success rate + timestamp per service |
| Change Calendar | medium | Heatmap grid by day/risk |
| Error Rate by Service | medium | LineChart per service |
| DNS Resolution Time | small | Sparkline with 7-day trend |
| AI Anomalies | medium | AI-detected infrastructure anomalies |
| AI Root Cause Patterns | medium | AI-identified recurring failure patterns |
| AI Capacity Planner | medium | AI-driven capacity forecasting and scaling advice |
| AI Predictions | medium | AI-driven forecasts for infrastructure metrics |

### AI Widgets (9 components, shared across views)

| Widget | Purpose |
|--------|---------|
| AiSummaryWidget | Executive / operational health summary |
| AiAnomaliesWidget | Anomaly detection across services |
| AiPredictionsWidget | Predictive metric forecasting |
| AiRiskBriefingWidget | Risk factor analysis and prioritisation |
| AiCostForecastWidget | Cost trend predictions and budget guidance |
| AiRootCausePatternsWidget | Recurring failure pattern analysis |
| AiSlaRiskAdvisorWidget | SLA breach risk ranking |
| AiCapacityPlannerWidget | Capacity forecasting and scaling recommendations |
| AiChangeImpactWidget | Change risk and impact assessment |

## Mock Data

Two mock customers demonstrate service filtering:

**Muster AG** (Manufacturing, Enterprise Premium)
- Subscribed: Cloud, SAP, Security, Connectivity, Workplace
- 5 services, full Zero Outage coverage

**TechVision GmbH** (Technology, Standard)
- Subscribed: Cloud, AI & Data, IoT
- 3 services, technology-focused portfolio

Each customer has 12 months of KPI history, realistic incident records, infrastructure metrics, cost breakdowns, and Zero Outage pillar scores.

## Responsive Grid

The widget grid uses a 12-column CSS Grid with predefined size classes:

| Size | Desktop (>1280px) | Tablet (>768px) | Mobile |
|------|-------------------|-----------------|--------|
| small | 3 columns | 4 columns | 6 → 12 columns |
| medium | 4 columns | 6 columns | 12 columns |
| large | 6 columns | 6 columns | 12 columns |
| full | 12 columns | 12 columns | 12 columns |

## Adding a New Widget

1. Create the component in the appropriate view folder:
   ```
   components/widgets/{view}/MyWidget.tsx
   ```

2. Register it in `config/widget-registry.ts`:
   ```ts
   "my-widget": () => import("@/components/widgets/{view}/MyWidget"),
   ```

3. Add it to the view config in `config/view-configs.ts`:
   ```ts
   { id: "my-widget", title: "My Widget", size: "medium", category: "kpi" }
   ```

The widget will automatically appear in the dashboard grid, be lazy-loaded, and wrapped with the WidgetShell card styling.

### Widget Authoring Guidelines

- **Empty state:** Return `<div />` (not `null`) when data is loading or empty. Returning `null` unmounts the widget shell, causing Recharts `ResponsiveContainer` to lose its dimensions and log `width(0)` / `height(0)` warnings on re-mount (e.g. when switching customers).
- **Chart colors:** Use high-contrast color pairs. Avoid pairing a color with `"gray"` — use `"slate"` or a distinct hue instead. Verify the colors you use are included in the safelist in `globals.css`.
- **DonutChart center labels:** If you render a custom overlay in the center of a `DonutChart`, pass `showLabel={false}` and `showTooltip={false}` to prevent Tremor's built-in center label from overlapping.
- **X-axis labels:** Tremor's bar/line charts may skip labels when the axis is crowded. Add `tickGap={2}` to force all labels to display.

## Connecting Real APIs

Each service file in `lib/services/` exposes async functions that currently read from JSON files. To connect real APIs:

1. Replace the JSON import with a `fetch()` call
2. Keep the same function signature and return type
3. All widgets continue working without changes

Example migration:
```ts
// Before (mock)
import kpisData from "@/data/mock/kpis.json";
export async function getCurrentSla(customerId: string): Promise<number> {
  return data[customerId]?.currentSla ?? 0;
}

// After (real API)
export async function getCurrentSla(customerId: string): Promise<number> {
  const res = await fetch(`/api/kpis/${customerId}/sla`);
  const data = await res.json();
  return data.currentSla;
}
```

## Known Issues

- **Tremor DonutChart `wrapperStyle` warning** — In development mode, React 19 logs a warning: `"Invalid prop wrapperStyle supplied to React.Fragment"`. This is a known Tremor v3 bug where `wrapperStyle` is passed to a `<React.Fragment>`. It is cosmetic, dev-only, and does not affect functionality. It will be resolved when Tremor releases a React 19-compatible version.

- **`--legacy-peer-deps` required** — Tremor v3 has not updated its peer dependency to include React 19. The library works correctly; only the peer dependency declaration is outdated.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build (TypeScript check + optimize) |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0-only).

Copyright (c) 2026 Thorsten Meyer
