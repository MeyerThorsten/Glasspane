# Work Plan: Date-Shifting Service Layer

Created Date: 2026-02-10
Type: feature
Estimated Duration: 1 day
Estimated Impact: 4 files (1 new, 3 modified)

## Related Documents

- Design Doc: [docs/design/date-shifting-service.md](/docs/design/date-shifting-service.md)

## Objective

Make mock data appear current regardless of when the portal is viewed. All dates in the static JSON data are anchored to 2026-02-10. As time passes, incidents look stale, trend charts stop, certificate countdowns freeze, and backup timestamps age. This plan introduces a date-shifting utility at the service layer so every date field advances forward automatically.

## Background

The portal serves static JSON data through service functions. Every date and timestamp is hardcoded around February 10, 2026. After even a week, the data looks obviously outdated. The fix: shift all dates forward by the elapsed time since the anchor date, computed at read time in the service layer. JSON files, type definitions, and UI components remain untouched.

## Risks and Countermeasures

### Technical Risks

- **Risk**: Month-boundary or year-boundary arithmetic errors in `shiftMonth`
  - **Impact**: SLA history, ticket volume, MTTR trends display wrong months
  - **Countermeasure**: Use JavaScript `Date` constructor with month overflow (it handles `month=13` correctly); verify with boundary test cases

- **Risk**: Certificate `daysUntilExpiry` and `status` become inconsistent after shifting
  - **Impact**: Certificate widget shows "valid" for an expired certificate
  - **Countermeasure**: Always recompute `daysUntilExpiry` from the shifted `expiresAt` date relative to today, then derive `status` from the recomputed value (never shift the original `daysUntilExpiry` number directly)

- **Risk**: Timezone discrepancies between `Date.now()` and UTC-based mock data
  - **Impact**: Off-by-one day errors near midnight
  - **Countermeasure**: All date arithmetic uses UTC methods (`getUTCDate`, `setUTCDate`, `Date.UTC`); `computeDaysUntilExpiry` normalizes "today" to UTC midnight

- **Risk**: `null` values for `resolvedAt` on open incidents
  - **Impact**: Runtime error if shift function receives `null`
  - **Countermeasure**: Use dedicated `shiftISODateNullable` that passes `null` through unchanged

### Schedule Risks

- **Risk**: Infrastructure service has 11 functions to modify -- easy to miss one
  - **Impact**: Some widgets still show stale dates
  - **Countermeasure**: Use the explicit function checklist in Step 4 below; verify with build check

---

## Implementation Steps

### Step 1: Create `lib/utils/date-shift.ts` -- Core Utility

**Files to create**: `lib/utils/date-shift.ts`

**What to implement**:
- [ ] `ANCHOR_DATE` constant set to `new Date("2026-02-10T00:00:00Z")`
- [ ] `getDaysDelta()` -- full days between anchor and today, clamped to >= 0
- [ ] `getMonthsDelta()` -- calendar month difference between anchor and today
- [ ] `shiftISODate(isoString)` -- shifts ISO 8601 timestamps (e.g., `"2026-01-15T08:30:00Z"`) forward by day delta
- [ ] `shiftDate(dateString)` -- shifts YYYY-MM-DD strings forward by day delta
- [ ] `shiftMonth(monthString)` -- shifts YYYY-MM strings forward by month delta
- [ ] `shiftISODateNullable(isoString)` -- null-safe wrapper around `shiftISODate`
- [ ] `computeDaysUntilExpiry(shiftedExpiresAt)` -- days from today to expiry date, clamped to >= 0
- [ ] `computeCertificateStatus(daysUntilExpiry)` -- returns `"expired"` / `"expiring-soon"` / `"valid"`

**Acceptance criteria**:
- [ ] File exports all 8 functions and 1 constant listed above
- [ ] All shift functions return the original value unchanged when delta is 0 (early return optimization)
- [ ] `getDaysDelta()` returns 0 when run on or before anchor date
- [ ] No external dependencies (vanilla `Date` only)
- [ ] TypeScript compiles without errors

**Verification**:
```bash
npx tsc --noEmit lib/utils/date-shift.ts
```

---

### Step 2: Modify `lib/services/kpi-service.ts` -- SLA History Months

**Files to modify**: `lib/services/kpi-service.ts`

**What to implement**:
- [ ] Add import: `import { shiftMonth } from "@/lib/utils/date-shift"`
- [ ] Modify `getSlaHistory()`: map over results and apply `shiftMonth` to each entry's `month` field

**Current code** (line 13-15):
```typescript
export async function getSlaHistory(customerId: string): Promise<MonthlySla[]> {
  return data[customerId]?.slaHistory ?? [];
}
```

**Target code**:
```typescript
export async function getSlaHistory(customerId: string): Promise<MonthlySla[]> {
  const history = data[customerId]?.slaHistory ?? [];
  return history.map((h) => ({ ...h, month: shiftMonth(h.month) }));
}
```

**Functions unchanged**: `getCurrentSla`, `getCosts`, `getRisk`, `getChangeSuccessRate` (no date fields)

**Acceptance criteria**:
- [ ] Only `getSlaHistory` is modified; other 4 functions untouched
- [ ] Return type `Promise<MonthlySla[]>` is preserved
- [ ] File compiles without errors

**Verification**:
```bash
npx tsc --noEmit lib/services/kpi-service.ts
```

---

### Step 3: Modify `lib/services/incident-service.ts` -- Incidents and Trends

**Files to modify**: `lib/services/incident-service.ts`

**What to implement**:
- [ ] Add import: `import { shiftISODate, shiftISODateNullable, shiftMonth } from "@/lib/utils/date-shift"`
- [ ] Modify `getIncidents()`: map and shift `createdAt` (ISO), `resolvedAt` (nullable ISO)
- [ ] Modify `getTicketVolume()`: map and shift `month` (YYYY-MM)
- [ ] Modify `getMttrTrends()`: map and shift `month` (YYYY-MM)
- [ ] Modify `getOpenIncidents()`: after filtering, map and shift `createdAt`, `resolvedAt`

**Functions unchanged**: `getIncidentSummary` (no date fields)

**Acceptance criteria**:
- [ ] 4 functions modified, 1 function unchanged
- [ ] `resolvedAt` uses `shiftISODateNullable` (handles null for open incidents)
- [ ] All return types preserved (`Promise<Incident[]>`, `Promise<TicketVolume[]>`, `Promise<MttrTrend[]>`)
- [ ] File compiles without errors

**Verification**:
```bash
npx tsc --noEmit lib/services/incident-service.ts
```

---

### Step 4: Modify `lib/services/infrastructure-service.ts` -- All Infrastructure Fields

**Files to modify**: `lib/services/infrastructure-service.ts`

**What to implement**:
- [ ] Add import: `import { shiftDate, shiftISODate, shiftMonth, computeDaysUntilExpiry, computeCertificateStatus } from "@/lib/utils/date-shift"`
- [ ] `getResourceUtilization()`: shift `timestamp` (YYYY-MM-DD)
- [ ] `getLatencyMetrics()`: shift `timestamp` (YYYY-MM-DD)
- [ ] `getNetworkThroughput()`: shift `timestamp` (YYYY-MM-DD)
- [ ] `getCertificates()`: shift `expiresAt` (YYYY-MM-DD), recompute `daysUntilExpiry` from shifted expiry, recompute `status` from recomputed days
- [ ] `getBackups()`: shift `lastBackup` and `nextScheduled` (ISO 8601)
- [ ] `getChangeCalendar()`: shift `date` (YYYY-MM-DD)
- [ ] `getErrorRates()`: shift `timestamp` (YYYY-MM-DD)
- [ ] `getDnsResolution()`: shift `timestamp` (YYYY-MM-DD)
- [ ] `getPendingChanges()`: shift `scheduledDate` (YYYY-MM-DD)
- [ ] `getProjects()`: shift `dueDate` (YYYY-MM-DD)
- [ ] `getServiceUtilization()`: shift nested `months[].month` (YYYY-MM)

**Functions unchanged**: `getPatchCompliance` (no date fields)

**Special attention -- `getCertificates`**:
```typescript
export async function getCertificates(customerId: string): Promise<CertificateInfo[]> {
  const certs = data[customerId]?.certificates ?? [];
  return certs.map((c) => {
    const shiftedExpiry = shiftDate(c.expiresAt);
    const daysUntilExpiry = computeDaysUntilExpiry(shiftedExpiry);
    return {
      ...c,
      expiresAt: shiftedExpiry,
      daysUntilExpiry,
      status: computeCertificateStatus(daysUntilExpiry),
    };
  });
}
```

**Acceptance criteria**:
- [ ] 11 functions modified, 1 function (`getPatchCompliance`) unchanged
- [ ] `getCertificates` recomputes both `daysUntilExpiry` AND `status` (not just shifting `expiresAt`)
- [ ] `getBackups` uses `shiftISODate` (ISO 8601 format), not `shiftDate` (YYYY-MM-DD)
- [ ] `getServiceUtilization` handles the nested `.months[].month` structure
- [ ] All return types preserved
- [ ] File compiles without errors

**Verification**:
```bash
npx tsc --noEmit lib/services/infrastructure-service.ts
```

---

### Step 5: Build Check

- [ ] Run `npm run build` (or `npx next build`) and confirm zero TypeScript errors
- [ ] Confirm no new warnings introduced

**Acceptance criteria**:
- [ ] Build completes successfully with exit code 0
- [ ] No type errors in any modified file
- [ ] No new lint warnings

---

### Step 6: Manual Verification -- Data Appears Current

Open the portal in a browser and verify each category of shifted data:

- [ ] **Incidents**: Open the incidents widget. `createdAt` dates should appear within the last ~40 days relative to today, not anchored to January/February 2026
- [ ] **Ticket volume chart**: The x-axis months should end at or near the current month
- [ ] **MTTR trends chart**: The x-axis months should end at or near the current month
- [ ] **SLA history chart**: The x-axis months should end at or near the current month
- [ ] **Certificate expiry**: `daysUntilExpiry` should reflect actual days from today to the shifted expiry date. If sufficient time has passed since anchor, some certificates may show `expired`
- [ ] **Backups**: `lastBackup` should appear as a recent timestamp (today or yesterday). `nextScheduled` should appear as upcoming
- [ ] **Infrastructure time-series** (resource utilization, latency, network throughput, error rates, DNS resolution): Dates on charts should appear as recent
- [ ] **Change calendar**: Dates should appear as upcoming/recent
- [ ] **Pending changes**: `scheduledDate` should appear current
- [ ] **Projects**: `dueDate` values should shift proportionally forward
- [ ] **Service utilization**: Nested month labels should reflect current timeframe

---

## Risk Notes

1. **Midnight boundary**: `getDaysDelta()` uses `Math.floor`, so the delta increments at midnight UTC. If the portal is viewed near midnight in a non-UTC timezone, dates might appear to jump by one day. This is acceptable for mock data.

2. **Long-running tabs**: The delta is recalculated on every service call (no caching). If a user leaves a tab open overnight, data will refresh correctly on the next navigation or data fetch.

3. **Leap years and month-length differences**: JavaScript's `Date` handles month overflow correctly (`new Date(2026, 12, 1)` becomes `2027-01-01`). The design relies on this built-in behavior. No special-case code is needed.

4. **Pre-anchor-date execution**: If the system clock is somehow set before 2026-02-10, `getDaysDelta()` clamps to 0 and all data appears unchanged. This prevents backward shifting.

5. **No unit tests in this plan**: The design doc includes a full test strategy table, but this plan focuses on implementation and build verification. Unit tests for `date-shift.ts` can be added as a follow-up task using the test cases specified in the design doc.

---

## Completion Criteria

- [ ] `lib/utils/date-shift.ts` exists with all 8 exported functions and 1 constant
- [ ] `lib/services/kpi-service.ts` shifts `slaHistory` months
- [ ] `lib/services/incident-service.ts` shifts incidents (4 functions) and trends (2 functions)
- [ ] `lib/services/infrastructure-service.ts` shifts all 11 date-containing functions
- [ ] `npm run build` passes with zero errors
- [ ] No files modified in `data/mock/`, `types/`, or `components/`
- [ ] Manual verification confirms data appears current in the browser

## Progress Tracking

### Step 1: date-shift.ts utility
- Start:
- Complete:

### Step 2: kpi-service.ts
- Start:
- Complete:

### Step 3: incident-service.ts
- Start:
- Complete:

### Step 4: infrastructure-service.ts
- Start:
- Complete:

### Step 5: Build check
- Start:
- Complete:

### Step 6: Manual verification
- Start:
- Complete:
