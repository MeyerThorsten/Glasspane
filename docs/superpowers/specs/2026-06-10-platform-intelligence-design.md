# Platform Intelligence — Design

**Date:** 2026-06-10
**Status:** Approved for implementation (autonomous session)
**Goal:** Push Glasspane from a monitoring dashboard toward a Palantir-class decision platform: an entity ontology with drill-down, vertical (industry) intelligence so the product is useful across all verticals named in the marketing pages, operational scores computed from real signals instead of hardcoded values, and a prescriptive action layer that turns telemetry into decisions.

## Context

Glasspane today is a widget-driven transparency dashboard over mock data with a strong multi-provider AI layer. Gaps identified against the marketing claims:

- "Works for every vertical" — only two hardcoded customers (Manufacturing, Technology); no industry-specific intelligence anywhere.
- Zero Outage pillar scores are static JSON, not computed from operational data.
- Data is presented but never *connected* — no way to ask "what does this incident touch?" (the core Palantir ontology idea).
- Insight stops at description; nothing prescribes what to do next.

## Features

### F1 — Vertical Intelligence packs

A registry of industry vertical profiles (Manufacturing, Healthcare, Financial Services, Retail, Public Sector, Energy & Utilities, Technology, Logistics + General fallback). Each profile declares: priority service categories, applicable compliance frameworks (e.g. HIPAA, PCI DSS, NIS2, KRITIS, TISAX), industry benchmark targets (SLA, security score, change success, patch compliance, budget variance tolerance), and key operational risks.

- `types/vertical.ts` — `VerticalProfile`, `VerticalBenchmarkResult`, `BenchmarkMetricStatus`
- `config/vertical-registry.ts` — profiles + `resolveVerticalProfile(industry)` (exact match → alias match → General)
- `lib/verticals/benchmark.ts` — pure `computeVerticalBenchmark(profile, snapshot)` comparing the customer's actuals against vertical targets ("ahead" / "on-par" / "behind")
- `lib/services/vertical-service.ts` — gathers actuals from existing services, returns profile + benchmark
- `components/widgets/c-level/VerticalBenchmark.tsx` — "Industry Benchmark" widget on the C-Level view (registry + view config)

### F2 — Ontology / Entity Graph Explorer (Palantir signature)

A typed entity graph built per customer from existing data sources, plus an Explorer page for drill-down navigation.

- `types/ontology.ts` — `EntityKind` (customer, service, incident, change, costCategory, certificate, cve), `OntologyNode`, `OntologyEdge` (relations: subscribes, affects, targets, spend-on, secures, threatens), `OntologyGraph`
- `lib/ontology/build-graph.ts` — pure `buildOntologyGraph(input)` from injected domain records (no JSON imports in the pure layer; the service does the gathering)
- `lib/ontology/queries.ts` — pure `getNeighbors`, `blastRadius` (transitive connectivity from a node, with hop depth), `findEntities` (text search), `graphSummary`
- `lib/services/ontology-service.ts` — `getOntologyGraph(customer)` assembling from service/incident/change/cost/security/infrastructure services
- `app/explorer/page.tsx` + `app/explorer/layout.tsx` — Explorer: searchable entity list grouped by kind, selection detail panel showing attributes, direct relations, and blast radius
- Nav item "Explorer" in `config/navigation.ts`

### F3 — Computed Zero Outage scores

Replace static pillar values with scores derived from operational signals.

- `lib/zero-outage/compute.ts` — pure `computeZeroOutageScore(signals)`:
  - **People** = workforce engagement avg + opportunity readiness avg
  - **Processes** = change success rate + MTTR-derived score + patch compliance
  - **Platforms** = SLA attainment vs target + security score + backup success
  - Overall = mean of pillar scores; each metric carries value/target/unit for the existing widgets
- `lib/services/zero-outage-service.ts` — new `getComputedZeroOutageScore(customerId)` gathering signals from kpi/incident/infrastructure/security/workforce services; falls back to the static mock on missing data. Existing widgets (`ZeroOutageScore`, `ZeroOutagePillars`) switch to it.

### F4 — Action Center (prescriptive layer)

A deterministic rules engine that converts the current operational snapshot into ranked, recommended actions — the "so what" layer.

- `types/action.ts` — `RecommendedAction` (severity critical/warning/info, rationale, suggested steps, related entity)
- `lib/actions/rules.ts` — pure `evaluateActionRules(snapshot)` covering: expiring/expired certificates, patch compliance below vertical target, SLA below target, budget overruns, open P1/P2 incidents, weak change success rate, critical CVE pressure, backup success degradation
- `lib/services/action-service.ts` — snapshot assembly + rule evaluation
- `components/widgets/c-level/ActionCenter.tsx` — "Recommended Actions" widget on the C-Level view

## Approach choices

Considered alternatives:
1. **Real data integrations first** (replace mocks) — highest long-term value but requires external systems/credentials not available here; rejected for this iteration.
2. **AI-only enhancement** (more LLM tasks) — easy but adds little structural capability; the platform needs a data model spine first.
3. **Ontology + verticals + computed scores + actions (chosen)** — pure-logic core that is unit-testable today over mock data and survives the future swap to real APIs unchanged, since it consumes the service layer.

## Architecture principles

- All new business logic is **pure functions with injected data** (testable with `node --test` + tsx, like `tests/ai/`); services remain the only layer touching mock JSON.
- UI follows existing conventions: client components, `useCustomer()`, services in `useEffect`, Tremor + Tailwind, widget registry + view configs, per-section layout wrapper.
- No new dependencies.

## Error handling

- Vertical resolution always returns the General profile as fallback — no customer can be unprofiled.
- Computed Zero Outage falls back to static JSON per pillar when a signal source is empty.
- Ontology builder tolerates dangling references (e.g. incident pointing at an unknown service) by linking to the customer node instead of dropping data.

## Testing

`tests/platform/*.test.mts` run via new `npm run test:platform` (and `npm test` running both suites):
- vertical registry resolution (exact, alias, fallback) + benchmark status classification
- ontology graph construction (node/edge counts, dangling-reference handling) + blast radius/search queries
- zero-outage computation (weights, bounds, missing-signal fallback)
- action rules (each rule fires on its trigger condition and stays silent otherwise; severity ordering)

Verification: `npm run typecheck`, `npm run lint`, `npm run build`, full test suites.

## Documentation

- `docs/PLATFORM-INTELLIGENCE.md` — detailed feature documentation
- `docs/platform-intelligence.html` — standalone styled HTML overview
- README + landing page (`app/page.tsx`) updated to reflect the new capabilities

## Tracking

Items created and maintained in Threlmark: `http://localhost:4789/projects/transparency` (one item per feature, ranked with impact/evidence/fit/effort and acceptance criteria; moved to done when verified).
