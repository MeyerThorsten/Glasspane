# Platform Intelligence

> Detailed documentation for the platform-intelligence layer added in June 2026: Vertical Intelligence, the Ontology Explorer, computed Zero Outage scores, and the Action Center. A styled HTML version of this document lives at [`docs/platform-intelligence.html`](platform-intelligence.html). The design spec is at [`docs/superpowers/specs/2026-06-10-platform-intelligence-design.md`](superpowers/specs/2026-06-10-platform-intelligence-design.md).

Glasspane started as a transparency dashboard: it *showed* operational data. The platform-intelligence layer turns it into a decision tool: it *connects* the data (ontology), *contextualizes* it per industry (verticals), *grades* it against the Zero Outage promise (computed scores), and *prescribes* what to do next (action center).

All four features share two architectural rules:

1. **Pure logic, injected data.** Every scoring, graph, and rules function is a pure function that receives domain records as input. The `lib/services/*` layer is the only place that touches the (currently mock) data sources. When real APIs replace the mock JSON, the intelligence layer does not change.
2. **Existing conventions.** Client components use `useCustomer()` + service calls in `useEffect`, widgets register in `config/widget-registry.ts` and appear via `config/view-configs.ts`, pages get their own layout wrapper. No new dependencies were added.

---

## 1. Vertical Intelligence

**Problem.** Glasspane claims to serve managed-service customers across every industry, but nothing in the product knew what industry a customer was in. A hospital and a logistics carrier saw identical dashboards with identical targets.

**Solution.** A registry of vertical profiles plus a benchmark engine.

### Vertical profiles (`config/vertical-registry.ts`)

Nine profiles: Manufacturing, Healthcare, Financial Services, Retail, Public Sector, Energy & Utilities, Technology, Logistics, and a General fallback. Each profile declares:

| Field | Meaning | Example (Healthcare) |
|---|---|---|
| `industries` | Industry names/aliases that map to this profile | Healthcare, Pharma, Life Sciences, Hospital |
| `priorityCategories` | Service categories that matter most in this vertical | Security, Cloud, Workplace, AI & Data |
| `complianceFrameworks` | Regulations/standards in scope | HIPAA, GDPR, ISO 27799 |
| `benchmarks` | Industry target values | SLA 99.99 %, security 92, change success 98 %, patch 96 %, budget tolerance 4 % |
| `keyRisks` | Operational risks characteristic of the vertical | "Clinical system outages directly impact patient care" |

`resolveVerticalProfile(industry)` resolves a customer's industry string in three steps: exact match → partial/alias match → General fallback. **No customer is ever unprofiled.** Note that resolution is ordered: "Retail Banking" matches Financial Services (via *Banking*) before Retail — by design.

### Benchmark engine (`lib/verticals/benchmark.ts`)

`computeVerticalBenchmark(profile, snapshot)` grades five actuals against the vertical's targets:

| Metric | Source | Direction |
|---|---|---|
| Service availability | `getCurrentSla` | higher is better |
| Security score | `getSecurityPosture` | higher is better |
| Change success rate | `getChangeSuccessRate` | higher is better |
| Patch compliance | `getPatchCompliance` (aggregated across categories) | higher is better |
| Budget variance | `getCosts` (spend vs budget overrun %) | **lower is better** |

Each metric gets a status: **ahead** (clearly above target), **on-par** (within a per-metric tolerance band, so noisy demo data doesn't flap), or **behind**. The tolerance scales with the metric's magnitude (SLA ±0.02 pp, scores ±1 pt, change success ±0.5 pp).

### Surface

The **Industry Benchmark** widget (C-Level view, `components/widgets/c-level/VerticalBenchmark.tsx`) shows the resolved vertical, its compliance-framework chips (hover for descriptions), each metric with value/target, and the ahead/behind tally.

---

## 2. Ontology Explorer

**Problem.** The dashboards presented each data set in isolation. There was no way to ask the Palantir question: *"this thing broke — what does it touch?"*

**Solution.** A typed entity graph per customer plus a drill-down Explorer page at **`/explorer`**.

### Graph model (`types/ontology.ts`)

| Entity kind | Source | Relation | Target |
|---|---|---|---|
| `customer` | `customers.json` | — | (root) |
| `service` | subscribed services | `customer —subscribes→ service` | |
| `incident` | incident history | `incident —affects→ service` | |
| `change` | pending changes | `change —targets→ service` | |
| `costCategory` | cost breakdown | `customer —spend-on→ costCategory` | |
| `certificate` | certificate inventory | `certificate —secures→ customer` | |
| `cve` | top CVEs | `cve —threatens→ service` | |

Every node carries a `label`, optional `status` (rendered as a color-coded chip), and a `meta` record of attributes shown in the detail panel.

**Dangling references are never dropped.** Incidents/changes/CVEs that reference a service not in the graph (e.g. a decommissioned system) link to the customer node instead, so the inventory stays complete.

### Pure layers

- `lib/ontology/build-graph.ts` — `buildOntologyGraph(input)` assembles nodes and edges from injected records.
- `lib/ontology/queries.ts` —
  - `getNeighbors(graph, id)`: direct relations with direction (`in`/`out`) and relation kind;
  - `blastRadius(graph, id, maxHops)`: breadth-first connectivity — everything an issue at this node could touch, with hop distance;
  - `findEntities(graph, query)`: text search across label, kind, status, and metadata values;
  - `graphSummary(graph)`: node counts by kind plus edge count.
- `lib/services/ontology-service.ts` — gathers from six services concurrently and builds the graph.

### Explorer page (`app/explorer/page.tsx`)

Three zones:

1. **Summary chips** — entity counts per kind and total relation count.
2. **Entity list** (left) — searchable, grouped by kind, status chips per entity.
3. **Detail panel** (right) — attributes, **direct relations** (clickable, labeled "affected by" / "targets" / "threatened by" …), and the **blast radius**: every entity within two hops, 1-hop entities visually emphasized. Clicking any related entity re-centers the exploration on it.

---

## 3. Computed Zero Outage scores

**Problem.** The Zero Outage Score — the headline metric of the whole product — was a hardcoded number in `zero-outage.json`. The marketing said "measured", the code said "constant".

**Solution.** `lib/zero-outage/compute.ts` derives all three pillars from live signals; `getComputedZeroOutageScore(customerId)` in the service layer assembles the inputs. The banner, the C-Level *Zero Outage Score* widget, and the Business *Zero Outage Pillars* widget all use the computed value.

### Signal map

| Pillar | Signal | Source | Stretch target |
|---|---|---|---|
| **People** | Engagement average | workforce employees | 90 pts |
| | Opportunity readiness average | workforce employees | 85 pts |
| **Processes** | Change success rate | KPI service | 98 % |
| | P1 response (MTTR-derived score) | MTTR trends, last 3 months | 95 pts |
| | Patch compliance | infrastructure service | 98 % |
| **Platforms** | SLA attainment (error-budget burn) | current SLA vs target | 100 pts |
| | Security score | security posture | 95 pts |
| | Backup success average | backup status | 99.9 % |

### Scoring rules

- **Metric attainment** = `min(100, value / target × 100)` — over-performance on one metric cannot mask a gap on another.
- **Pillar score** = mean attainment of its available metrics, graded against the conventional **95-point target** (same convention as the original mock data).
- **Overall** = mean of the three pillar scores.
- **MTTR → score**: ≤ 60 min on P1 is 100 points, ≥ 480 min (a working day) is 0, linear in between.
- **SLA attainment**: meeting target is 100. Below target, each *multiple of the error budget* burned costs 25 points — tight five-nines targets degrade gradually instead of collapsing to zero on the first miss.
- **Missing signals**: a pillar skips metrics whose sources are empty; if an entire pillar has no signals, the computation returns `null` and the service **falls back to the static JSON**, so the UI never breaks.

Targets are deliberately *stretch* targets so a healthy estate scores in the realistic 90s rather than saturating at a meaningless 100.

---

## 4. Action Center

**Problem.** Every widget described state; none prescribed a response. The "so-what" was left entirely to the reader.

**Solution.** A deterministic rules engine (`lib/actions/rules.ts`) over the assembled operational snapshot (`lib/services/action-service.ts`), surfaced as the **Recommended Actions** widget at the top of the C-Level view.

### Rule catalog

| Rule id | Trigger | Severity |
|---|---|---|
| `cert-expired` | any certificate `expired` | critical |
| `cert-expiring` | any certificate `expiring-soon` | warning |
| `incident-p1` | any open/investigating P1 | critical |
| `incident-p2-cluster` | ≥ 2 concurrent open P2s | warning |
| `sla-below-target` | current SLA < contractual target | critical |
| `patch-below-target` | aggregate patch compliance < **vertical benchmark** | warning |
| `budget-overrun` | any cost category over budget (worst named) | warning |
| `change-success-low` | change success rate < **vertical benchmark** | warning |
| `critical-cves` | any critical-severity CVE | critical |
| `backup-degraded` | any backup success rate < 99 % | warning |
| `all-clear` | nothing else fired | info |

Two thresholds intentionally come from the customer's **vertical profile**, so a hospital is held to stricter patch/change standards than a retailer.

Every action carries a severity, a category, a **rationale naming the offending entities**, ordered **suggested steps**, and (where applicable) a `relatedEntity` id that matches the ontology graph's node ids — the two features share one identity scheme.

Actions are sorted critical → warning → info. The widget renders them as expandable rows.

---

## Testing

33 unit tests in `tests/platform/` (Node test runner + tsx, same harness as `tests/ai/`):

| File | Covers |
|---|---|
| `vertical.test.mts` | profile resolution (exact/partial/fallback), registry completeness, benchmark classification incl. lower-is-better budget variance |
| `ontology.test.mts` | node/edge construction for all kinds, dangling-reference fallback, name-based resolution, neighbors with direction, blast-radius hop expansion, search, summary |
| `zero-outage-compute.test.mts` | pillar assembly, overall mean, missing-signal skipping and whole-pillar null, MTTR and SLA scoring curves, 100-point cap |
| `action-rules.test.mts` | every rule on and off its trigger, severity ordering, worst-category selection, all-clear |

```bash
npm run test:platform   # platform intelligence suite
npm run test:ai         # existing AI suite
npm test                # both
```

Verified additionally with `npm run typecheck`, `npm run lint`, `npm run build`, and a Playwright smoke pass over `/explorer` and `/dashboard?view=c-level`.

---

## Extending

- **New vertical** — add a `VerticalProfile` to `config/vertical-registry.ts`. Resolution, benchmarking, the widget, and the vertical-aware action rules pick it up automatically. Order matters for partial matches: put more specific profiles before generic ones.
- **New entity kind** — add the kind/relation to `types/ontology.ts`, emit nodes/edges in `build-graph.ts`, add an icon entry in the Explorer's `kindMeta`. Queries and search need no changes.
- **New action rule** — append a block to `evaluateActionRules` and a pair of on/off tests in `action-rules.test.mts`. Use `relatedEntity` ids matching ontology node ids (`kind:id`).
- **New Zero Outage signal** — extend `ZeroOutageSignals`, add the metric to the right pillar with a stretch target, and feed it in `getComputedZeroOutageScore`.
