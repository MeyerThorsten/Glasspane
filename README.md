# T-Systems Transparency Dashboard

A demo-ready dashboard showcasing how T-Systems customers can monitor their subscribed IT services. Built around T-Systems' **Zero Outage** strategy (99.999% availability target) and the 3P pillars: People, Processes, Platforms.

This MVP uses mock data to demonstrate the look, feel, and interaction model of a widget-driven, role-based transparency portal.

## Quick Start

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to the C-Level dashboard view.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) + TypeScript | SSR-ready, file-based routing |
| UI Components | Tremor + shadcn/ui primitives | Dashboard charts and UI elements |
| Charts | Recharts (via Tremor) | AreaChart, BarChart, DonutChart, LineChart |
| Styling | Tailwind CSS 4 | Utility-first CSS with T-Systems theme |
| Layout | CSS Grid (12-column) | Responsive widget grid |
| Icons | @remixicon/react | Tremor's default icon set |

## Branding

| Element | Value |
|---------|-------|
| Primary | `#E20074` (Telekom Magenta) |
| Hover | `#C00063` |
| Light tint | `#FFF0F8` |
| Success | `#00C26D` |
| Danger | `#F2321E` |
| Warning | `#FC7E21` |
| Info | `#3950EA` |
| Font | Inter / system-ui |

CSS variables and Tailwind theme tokens are defined in `app/globals.css`.

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
│   ├── globals.css                   # Tailwind + T-Systems CSS variables
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
│       ├── shared/                   # KpiCard, StatusBadge, TrendIndicator
│       ├── c-level/                  # 8 widget components
│       ├── business/                 # 10 widget components
│       └── technical/                # 13 widget components
├── config/
│   ├── widget-registry.ts            # Widget ID → lazy component mapping
│   ├── view-configs.ts               # Widget layout arrays per view
│   ├── navigation.ts                 # Sidebar nav items
│   └── theme.ts                      # Brand color tokens
├── lib/
│   ├── customer-context.tsx           # React Context for active customer
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
    └── tsystems-logo.svg
```

## Widget Catalog

### C-Level View (8 widgets)

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

### Business View (10 widgets)

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

### Technical View (13 widgets)

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

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build (TypeScript check + optimize) |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
