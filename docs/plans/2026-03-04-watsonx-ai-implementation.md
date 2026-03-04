# watsonx.ai Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add AI-powered summary widget and chat panel to the Transparency Portal using IBM watsonx.ai with a mock fallback for development.

**Architecture:** Two BFF API routes (`/api/ai/summary`, `/api/ai/chat`) call watsonx.ai text generation behind an `AI_PROVIDER` env toggle. Mock mode returns canned responses. All AI logic lives in `lib/ai/`. UI adds one new widget and a global chat panel.

**Tech Stack:** Next.js 16 App Router, IBM watsonx.ai REST API, IBM IAM token auth, Tailwind CSS, Tremor React

---

### Task 1: Environment Config

**Files:**
- Create: `.env.example`
- Create: `lib/ai/config.ts`

**Step 1: Create `.env.example`**

```env
# AI Provider: "mock" (default, no credentials needed) | "watsonx"
AI_PROVIDER=mock

# IBM watsonx.ai (required when AI_PROVIDER=watsonx)
WATSONX_API_KEY=
WATSONX_PROJECT_ID=
WATSONX_REGION=eu-de
WATSONX_MODEL_ID=ibm/granite-3-8b-instruct
```

**Step 2: Create `lib/ai/config.ts`**

```typescript
export type AiProvider = "mock" | "watsonx";

export interface AiConfig {
  provider: AiProvider;
  watsonx: {
    apiKey: string;
    projectId: string;
    region: string;
    modelId: string;
  };
}

export function getAiConfig(): AiConfig {
  const provider = (process.env.AI_PROVIDER as AiProvider) || "mock";
  return {
    provider,
    watsonx: {
      apiKey: process.env.WATSONX_API_KEY || "",
      projectId: process.env.WATSONX_PROJECT_ID || "",
      region: process.env.WATSONX_REGION || "eu-de",
      modelId: process.env.WATSONX_MODEL_ID || "ibm/granite-3-8b-instruct",
    },
  };
}

export function validateAiConfig(config: AiConfig): string[] {
  const errors: string[] = [];
  if (config.provider === "watsonx") {
    if (!config.watsonx.apiKey) errors.push("WATSONX_API_KEY is required");
    if (!config.watsonx.projectId) errors.push("WATSONX_PROJECT_ID is required");
  }
  return errors;
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build passes (new files are not imported anywhere yet)

**Step 4: Commit**

```bash
git add .env.example lib/ai/config.ts
git commit -m "feat(ai): add environment config for watsonx.ai integration"
```

---

### Task 2: IBM IAM Token Exchange

**Files:**
- Create: `lib/ai/token.ts`

**Step 1: Create `lib/ai/token.ts`**

This exchanges an IBM Cloud API key for a bearer token, caching it for 55 minutes (tokens expire after 60).

```typescript
interface TokenCache {
  token: string;
  expiresAt: number; // Date.now() ms
}

let cachedToken: TokenCache | null = null;

const IAM_URL = "https://iam.cloud.ibm.com/identity/token";
const TOKEN_TTL_MS = 55 * 60 * 1000; // 55 minutes

export async function getIamToken(apiKey: string): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const response = await fetch(IAM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${encodeURIComponent(apiKey)}`,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`IAM token exchange failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const token = data.access_token as string;

  cachedToken = {
    token,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  };

  return token;
}

/** For testing: clear cached token */
export function clearTokenCache(): void {
  cachedToken = null;
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build passes

**Step 3: Commit**

```bash
git add lib/ai/token.ts
git commit -m "feat(ai): add IBM IAM token exchange with 55-min cache"
```

---

### Task 3: watsonx.ai Client + Mock Provider

**Files:**
- Create: `lib/ai/watsonx.ts`
- Create: `lib/ai/mock.ts`
- Create: `lib/ai/generate.ts`

**Step 1: Create `lib/ai/watsonx.ts`**

Calls the watsonx.ai text generation endpoint.

```typescript
import { getIamToken } from "./token";
import { getAiConfig } from "./config";

interface WatsonxGenerationParams {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
}

interface WatsonxResponse {
  results: Array<{
    generated_text: string;
    generated_token_count: number;
    input_token_count: number;
    stop_reason: string;
  }>;
}

export async function watsonxGenerate(params: WatsonxGenerationParams): Promise<string> {
  const config = getAiConfig();
  const token = await getIamToken(config.watsonx.apiKey);

  const url = `https://${config.watsonx.region}.ml.cloud.ibm.com/ml/v1/text/generation?version=2025-02-06`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      model_id: config.watsonx.modelId,
      project_id: config.watsonx.projectId,
      input: params.prompt,
      parameters: {
        max_new_tokens: params.maxTokens ?? 300,
        temperature: params.temperature ?? 0.3,
        stop_sequences: params.stopSequences ?? [],
        repetition_penalty: 1.1,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`watsonx.ai generation failed (${response.status}): ${text}`);
  }

  const data: WatsonxResponse = await response.json();
  return data.results[0]?.generated_text?.trim() ?? "";
}
```

**Step 2: Create `lib/ai/mock.ts`**

Canned responses for development without IBM credentials.

```typescript
import type { ViewType } from "@/types";

const MOCK_SUMMARIES: Record<ViewType, string> = {
  "c-level":
    "Overall service delivery is healthy with SLA compliance above target at 99.94%. There is one active P1 incident currently under investigation that requires executive attention. Security posture remains strong with a score of 87/100. Infrastructure costs are tracking 2.3% above budget this month, primarily driven by increased compute usage.",
  business:
    "Ticket volume has decreased 8% month-over-month, indicating improving service stability. Mean time to resolve P1 incidents has improved to 28 minutes, well within the 30-minute target. Change success rate remains high at 97.2%. SLA compliance across all monitored services is above contracted thresholds.",
  technical:
    "CPU utilization is averaging 67% across monitored hosts with memory at 72% — both within normal operating ranges. P95 latency is at 145ms, a slight increase from last week. Error rates remain below 0.5% across all services. Network throughput is stable with no anomalies detected in DNS resolution times.",
};

const MOCK_CHAT_RESPONSES: Array<{ keywords: string[]; response: string }> = [
  {
    keywords: ["latency", "slow", "response time", "p95", "p99"],
    response: "Based on the current data, P95 latency is at 145ms and P99 at 320ms. These are within normal ranges but show a slight upward trend over the past week. The primary contributors are the API Gateway and Authentication services.",
  },
  {
    keywords: ["incident", "outage", "down", "issue"],
    response: "There are currently 3 open incidents: 1 P1 (Authentication Service degradation, under investigation for 45 minutes), 1 P3 (DNS resolution intermittent delays), and 1 P4 (Dashboard rendering slow for some users). The P1 is the most critical and the team is actively working on it.",
  },
  {
    keywords: ["cost", "budget", "spend", "expensive"],
    response: "Current month infrastructure costs are at €847,200, which is 2.3% over the monthly budget of €828,000. The primary driver is increased compute usage in the EU-West region. Previous month costs were €831,500, so there's an upward trend worth monitoring.",
  },
  {
    keywords: ["security", "vulnerability", "cve", "patch"],
    response: "Security posture score is 87/100. There are 3 critical vulnerabilities pending remediation, 12 high-severity, and 28 medium. Patch compliance is at 94% overall. The critical CVEs affect the Java runtime and should be prioritized for the next maintenance window.",
  },
  {
    keywords: ["sla", "availability", "uptime"],
    response: "Current SLA compliance is at 99.94%, above the 99.9% target. All monitored services are meeting their individual SLA thresholds. The lowest-performing service is the Payment Gateway at 99.91%, still above target but worth monitoring.",
  },
];

const DEFAULT_CHAT_RESPONSE =
  "Based on the available dashboard data, I can see that overall system health is good. Could you ask a more specific question about latency, incidents, costs, security, or SLA compliance? I can provide more detailed analysis on those topics.";

export function mockGenerateSummary(view: ViewType): string {
  return MOCK_SUMMARIES[view] ?? MOCK_SUMMARIES["c-level"];
}

export function mockGenerateChat(question: string): string {
  const lower = question.toLowerCase();
  for (const entry of MOCK_CHAT_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return DEFAULT_CHAT_RESPONSE;
}
```

**Step 3: Create `lib/ai/generate.ts`**

Public API that routes to mock or watsonx based on `AI_PROVIDER`.

```typescript
import type { ViewType } from "@/types";
import { getAiConfig } from "./config";
import { watsonxGenerate } from "./watsonx";
import { mockGenerateSummary, mockGenerateChat } from "./mock";
import { buildSummaryPrompt, buildChatPrompt } from "./prompts";
import { gatherContext } from "./gather-context";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Summary response cache: key = "customerId|view", TTL = 5 minutes
const summaryCache = new Map<string, { text: string; expiresAt: number }>();
const SUMMARY_CACHE_TTL = 5 * 60 * 1000;

export async function generateSummary(customerId: string, view: ViewType): Promise<string> {
  const cacheKey = `${customerId}|${view}`;
  const cached = summaryCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.text;
  }

  const config = getAiConfig();

  if (config.provider === "mock") {
    const text = mockGenerateSummary(view);
    summaryCache.set(cacheKey, { text, expiresAt: Date.now() + SUMMARY_CACHE_TTL });
    return text;
  }

  const context = await gatherContext(customerId, view);
  const prompt = buildSummaryPrompt(view, context);
  const text = await watsonxGenerate({ prompt, maxTokens: 250, temperature: 0.3 });

  summaryCache.set(cacheKey, { text, expiresAt: Date.now() + SUMMARY_CACHE_TTL });
  return text;
}

export async function generateChatResponse(
  customerId: string,
  view: ViewType,
  question: string,
  history: ChatMessage[],
): Promise<string> {
  const config = getAiConfig();

  if (config.provider === "mock") {
    return mockGenerateChat(question);
  }

  const context = await gatherContext(customerId, view);
  const prompt = buildChatPrompt(view, context, question, history);
  return watsonxGenerate({
    prompt,
    maxTokens: 300,
    temperature: 0.3,
    stopSequences: ["User:", "\n\nUser:"],
  });
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build will fail because `./prompts` and `./gather-context` don't exist yet. That's OK — we create them in the next task.

**Step 5: Commit**

```bash
git add lib/ai/watsonx.ts lib/ai/mock.ts lib/ai/generate.ts
git commit -m "feat(ai): add watsonx client, mock provider, and generate router"
```

---

### Task 4: Prompt Templates + Context Gathering

**Files:**
- Create: `lib/ai/prompts.ts`
- Create: `lib/ai/gather-context.ts`

**Step 1: Create `lib/ai/prompts.ts`**

```typescript
import type { ViewType } from "@/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const VIEW_AUDIENCES: Record<ViewType, string> = {
  "c-level": "C-level executive (CIO/CTO)",
  business: "business service manager",
  technical: "technical operations engineer",
};

export function buildSummaryPrompt(view: ViewType, contextData: string): string {
  const audience = VIEW_AUDIENCES[view];
  return `You are an IT operations analyst for a managed services provider.
Summarize the following dashboard data for a ${audience} in 3-4 sentences.
Focus on what needs attention and any notable trends.
Be specific with numbers. Do not use bullet points.

Data:
${contextData}

Summary:`;
}

export function buildChatPrompt(
  view: ViewType,
  contextData: string,
  question: string,
  history: ChatMessage[],
): string {
  const audience = VIEW_AUDIENCES[view];

  const historyText = history
    .slice(-10) // Last 5 exchanges (10 messages)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  return `You are an AI assistant for an IT transparency portal.
You are speaking to a ${audience}.
Answer questions about the customer's infrastructure and services using ONLY the data provided below.
If you cannot answer from the data, say so clearly.
Keep answers concise (2-4 sentences). Be specific with numbers.

Dashboard data:
${contextData}

${historyText ? `Conversation:\n${historyText}\n` : ""}User: ${question}
Assistant:`;
}
```

**Step 2: Create `lib/ai/gather-context.ts`**

This calls existing service functions server-side and formats the data into a prompt-ready string.

```typescript
import type { ViewType } from "@/types";
import { getCurrentSla, getCosts, getRisk, getChangeSuccessRate, getSlaHistory } from "@/lib/services/kpi-service";
import { getIncidentSummary, getTicketVolume, getMttrTrends } from "@/lib/services/incident-service";
import { getSecurityPosture } from "@/lib/services/security-service";
import { getResourceUtilization, getLatencyMetrics, getErrorRates, getNetworkThroughput } from "@/lib/services/infrastructure-service";

export async function gatherContext(customerId: string, view: ViewType): Promise<string> {
  switch (view) {
    case "c-level":
      return gatherCLevelContext(customerId);
    case "business":
      return gatherBusinessContext(customerId);
    case "technical":
      return gatherTechnicalContext(customerId);
    default:
      return gatherCLevelContext(customerId);
  }
}

async function gatherCLevelContext(customerId: string): Promise<string> {
  const [sla, incidents, risk, costs, security] = await Promise.all([
    getCurrentSla(customerId),
    getIncidentSummary(customerId),
    getRisk(customerId),
    getCosts(customerId),
    getSecurityPosture(customerId),
  ]);

  const totalOpen = incidents.reduce((sum, s) => sum + s.open, 0);
  const totalIncidents = incidents.reduce((sum, s) => sum + s.total, 0);
  const incidentBreakdown = incidents.map((s) => `${s.severity}: ${s.total} total, ${s.open} open`).join("; ");

  const totalCost = costs.reduce((sum, c) => sum + c.currentMonth, 0);
  const totalBudget = costs.reduce((sum, c) => sum + c.budget, 0);
  const costDelta = totalBudget > 0 ? ((totalCost - totalBudget) / totalBudget * 100).toFixed(1) : "N/A";

  const vulnSummary = security.vulnerabilities.map((v) => `${v.severity}: ${v.count}`).join(", ");

  return [
    `SLA Compliance: ${sla.toFixed(2)}% (target: 99.9%)`,
    `Incidents: ${totalIncidents} total, ${totalOpen} open (${incidentBreakdown})`,
    `Risk Score: ${risk.overall} (high: ${risk.high}, medium: ${risk.medium}, low: ${risk.low}, trend: ${risk.trend})`,
    `Monthly Cost: €${totalCost.toLocaleString()} (budget: €${totalBudget.toLocaleString()}, ${costDelta}% vs budget)`,
    `Security Score: ${security.overallScore}/100, vulnerabilities: ${vulnSummary}`,
  ].join("\n");
}

async function gatherBusinessContext(customerId: string): Promise<string> {
  const [tickets, mttr, changeRate, slaHistory] = await Promise.all([
    getTicketVolume(customerId),
    getMttrTrends(customerId),
    getChangeSuccessRate(customerId),
    getSlaHistory(customerId),
  ]);

  const latestTickets = tickets[tickets.length - 1];
  const prevTickets = tickets.length > 1 ? tickets[tickets.length - 2] : null;
  const ticketDelta = prevTickets
    ? ((latestTickets.opened - prevTickets.opened) / prevTickets.opened * 100).toFixed(1)
    : "N/A";

  const latestMttr = mttr[mttr.length - 1];
  const latestSla = slaHistory[slaHistory.length - 1];

  return [
    `Ticket Volume (${latestTickets?.month}): ${latestTickets?.opened} opened, ${latestTickets?.resolved} resolved (${ticketDelta}% vs previous month)`,
    `MTTR: P1=${latestMttr?.p1}min, P2=${latestMttr?.p2}min, P3=${latestMttr?.p3}min, P4=${latestMttr?.p4}min`,
    `Change Success Rate: ${changeRate.rate.toFixed(1)}% (trend: ${changeRate.trend})`,
    `SLA History (${latestSla?.month}): ${latestSla?.availability.toFixed(2)}% (target: ${latestSla?.target}%)`,
  ].join("\n");
}

async function gatherTechnicalContext(customerId: string): Promise<string> {
  const [utilization, latency, errors, throughput] = await Promise.all([
    getResourceUtilization(customerId),
    getLatencyMetrics(customerId),
    getErrorRates(customerId),
    getNetworkThroughput(customerId),
  ]);

  const latestUtil = utilization[utilization.length - 1];
  const latestLatency = latency[latency.length - 1];
  const latestThroughput = throughput[throughput.length - 1];

  // Get unique services and their latest error rates
  const serviceErrors = new Map<string, number>();
  for (const e of errors) {
    serviceErrors.set(e.serviceName, e.rate);
  }
  const errorSummary = Array.from(serviceErrors.entries())
    .map(([name, rate]) => `${name}: ${rate.toFixed(3)}%`)
    .join(", ");

  return [
    `Resource Utilization: CPU=${latestUtil?.cpu.toFixed(1)}%, Memory=${latestUtil?.memory.toFixed(1)}%, Disk=${latestUtil?.disk.toFixed(1)}%`,
    `Latency: P50=${latestLatency?.p50.toFixed(0)}ms, P95=${latestLatency?.p95.toFixed(0)}ms, P99=${latestLatency?.p99.toFixed(0)}ms`,
    `Error Rates: ${errorSummary}`,
    `Network Throughput: Inbound=${latestThroughput?.inbound.toFixed(0)} Mbps, Outbound=${latestThroughput?.outbound.toFixed(0)} Mbps`,
  ].join("\n");
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build passes — all `lib/ai/*` modules now resolve

**Step 4: Commit**

```bash
git add lib/ai/prompts.ts lib/ai/gather-context.ts
git commit -m "feat(ai): add prompt templates and dashboard context gathering"
```

---

### Task 5: BFF Route — Summary

**Files:**
- Create: `app/api/ai/summary/route.ts`

**Step 1: Create `app/api/ai/summary/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import type { ViewType } from "@/types";
import { generateSummary } from "@/lib/ai/generate";

const VALID_VIEWS: ViewType[] = ["c-level", "business", "technical"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, view } = body as { customerId?: string; view?: string };

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }
    if (!view || !VALID_VIEWS.includes(view as ViewType)) {
      return NextResponse.json({ error: `view must be one of: ${VALID_VIEWS.join(", ")}` }, { status: 400 });
    }

    const summary = await generateSummary(customerId, view as ViewType);

    return NextResponse.json({
      summary,
      meta: { provider: process.env.AI_PROVIDER || "mock", timestamp: Date.now() },
    });
  } catch (error) {
    console.error("[AI Summary] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build passes

**Step 3: Test with curl (start dev server in a separate terminal first: `npm run dev`)**

Run: `curl -s -X POST http://localhost:3000/api/ai/summary -H 'Content-Type: application/json' -d '{"customerId":"cust-001","view":"c-level"}' | jq .`

Expected: JSON with `summary` field containing the mock c-level summary text and `meta.provider: "mock"`

**Step 4: Commit**

```bash
git add app/api/ai/summary/route.ts
git commit -m "feat(ai): add BFF route for AI summary generation"
```

---

### Task 6: BFF Route — Chat

**Files:**
- Create: `app/api/ai/chat/route.ts`

**Step 1: Create `app/api/ai/chat/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import type { ViewType } from "@/types";
import { generateChatResponse } from "@/lib/ai/generate";

const VALID_VIEWS: ViewType[] = ["c-level", "business", "technical"];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, view, question, history } = body as {
      customerId?: string;
      view?: string;
      question?: string;
      history?: ChatMessage[];
    };

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }
    if (!view || !VALID_VIEWS.includes(view as ViewType)) {
      return NextResponse.json({ error: `view must be one of: ${VALID_VIEWS.join(", ")}` }, { status: 400 });
    }
    if (!question || question.trim().length === 0) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const answer = await generateChatResponse(
      customerId,
      view as ViewType,
      question.trim(),
      history ?? [],
    );

    return NextResponse.json({
      answer,
      meta: { provider: process.env.AI_PROVIDER || "mock", timestamp: Date.now() },
    });
  } catch (error) {
    console.error("[AI Chat] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build passes

**Step 3: Test with curl**

Run: `curl -s -X POST http://localhost:3000/api/ai/chat -H 'Content-Type: application/json' -d '{"customerId":"cust-001","view":"technical","question":"What is the current latency?","history":[]}' | jq .`

Expected: JSON with `answer` containing the mock latency response and `meta.provider: "mock"`

**Step 4: Commit**

```bash
git add app/api/ai/chat/route.ts
git commit -m "feat(ai): add BFF route for AI chat"
```

---

### Task 7: AI Summary Widget

**Files:**
- Create: `components/ai/AiSummaryWidget.tsx`
- Modify: `config/widget-registry.ts` (add `"ai-summary"` entry)
- Modify: `config/view-configs.ts` (add widget to each view)

**Step 1: Create `components/ai/AiSummaryWidget.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { useSearchParams } from "next/navigation";
import type { ViewType } from "@/types";

export default function AiSummaryWidget() {
  const { customer } = useCustomer();
  const searchParams = useSearchParams();
  const view = (searchParams.get("view") as ViewType) || "c-level";
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) return;
    setLoading(true);
    setError(null);

    fetch("/api/ai/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: customer.id, view }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load summary (${res.status})`);
        const data = await res.json();
        setSummary(data.summary);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [customer, view]);

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-3 bg-gray-100 dark:bg-[#262633] rounded w-full" />
        <div className="h-3 bg-gray-100 dark:bg-[#262633] rounded w-5/6" />
        <div className="h-3 bg-gray-100 dark:bg-[#262633] rounded w-4/6" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
      <p className="text-[10px] text-gray-400 dark:text-gray-600">Powered by watsonx.ai</p>
    </div>
  );
}
```

**Step 2: Add to widget registry**

In `config/widget-registry.ts`, add this line after the existing Technical widgets section (before the closing `};` on line 42):

```typescript
  // AI widgets
  "ai-summary": () => import("@/components/ai/AiSummaryWidget"),
```

**Step 3: Add to view configs**

In `config/view-configs.ts`, add `ai-summary` as the **first** widget in each view array. Add this entry at the start of each array:

```typescript
{ id: "ai-summary", title: "AI Insights", size: "full", category: "ai" },
```

Add it as the first entry in the `"c-level"` array (before `"sla-compliance-gauge"`), the `"business"` array (before `"service-utilization"`), and the `"technical"` array (before `"system-status-grid"`).

**Step 4: Verify build**

Run: `npm run build`
Expected: Build passes

**Step 5: Test visually**

Run: `npm run dev`, open `http://localhost:3000/dashboard`
Expected: "AI Insights" widget appears at the top of each view, showing the mock summary text. Switching views changes the summary.

**Step 6: Commit**

```bash
git add components/ai/AiSummaryWidget.tsx config/widget-registry.ts config/view-configs.ts
git commit -m "feat(ai): add AI Summary widget to all dashboard views"
```

---

### Task 8: AI Chat Panel

**Files:**
- Create: `components/ai/AiChatPanel.tsx`
- Modify: `app/dashboard/page.tsx` (add `<AiChatPanel />`)

**Step 1: Create `components/ai/AiChatPanel.tsx`**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useCustomer } from "@/lib/customer-context";
import { useSearchParams } from "next/navigation";
import type { ViewType } from "@/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AiChatPanel() {
  const { customer } = useCustomer();
  const searchParams = useSearchParams();
  const view = (searchParams.get("view") as ViewType) || "c-level";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const question = input.trim();
    if (!question || !customer || loading) return;

    const userMsg: ChatMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          view,
          question,
          history: messages.slice(-10),
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();

      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that request. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-white shadow-lg hover:bg-blue-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a8 8 0 0 1 8 8c0 3.3-2 6.2-5 7.5V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2.5C6 16.2 4 13.3 4 10a8 8 0 0 1 8-8z" />
          <path d="M9.5 14.5L12 12l2.5 2.5" />
        </svg>
        <span className="text-sm font-medium">Ask AI</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[400px] h-[500px] sm:bottom-6 sm:right-6 sm:rounded-xl bg-white dark:bg-[#1C1C27] border border-gray-200 dark:border-[#2E2E3D] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#252533]">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">AI Assistant</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" /><path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-8">
                Ask a question about your dashboard data
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-[#262633] text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-[#262633] rounded-lg px-3 py-2 text-sm text-gray-400">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 dark:border-[#252533] px-4 py-3">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your data..."
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-200 dark:border-[#2E2E3D] bg-white dark:bg-[#1C1C27] px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-lg bg-blue-600 px-3 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </form>
            <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1.5">Powered by watsonx.ai</p>
          </div>
        </div>
      )}
    </>
  );
}
```

**Step 2: Add to dashboard page**

In `app/dashboard/page.tsx`, add the import at the top (after the existing imports):

```typescript
import AiChatPanel from "@/components/ai/AiChatPanel";
```

Then in the `DashboardContent` function, add `<AiChatPanel />` after `<WidgetGrid>` inside the fragment. The return block should look like:

```tsx
    return (
      <>
        <ZeroOutageBanner />
        <WidgetGrid widgets={filteredWidgets} />
        <AiChatPanel />
      </>
    );
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build passes

**Step 4: Test visually**

Run: `npm run dev`, open `http://localhost:3000/dashboard`
Expected:
- Blue "Ask AI" button visible in bottom-right corner
- Clicking it opens the chat panel
- Typing "What is the current latency?" and pressing Send returns the mock latency response
- Typing "Tell me about costs" returns the mock cost response
- Close button works, messages persist while panel is open

**Step 5: Commit**

```bash
git add components/ai/AiChatPanel.tsx app/dashboard/page.tsx
git commit -m "feat(ai): add AI Chat panel with floating button"
```

---

### Task 9: Build Verification + Final Commit

**Files:** None new — this is a verification step.

**Step 1: Full build**

Run: `npm run build`
Expected: Build passes with zero errors

**Step 2: Visual verification checklist**

Start dev server: `npm run dev`

- [ ] C-level view: "AI Insights" widget at top shows mock summary
- [ ] Business view: "AI Insights" widget shows different mock summary
- [ ] Technical view: "AI Insights" widget shows different mock summary
- [ ] "Ask AI" button visible on all views
- [ ] Chat panel opens/closes
- [ ] Chat responds to latency, incident, cost, security, SLA questions
- [ ] Chat shows default response for unrecognized questions
- [ ] Dark mode: all AI components render correctly
- [ ] No console errors

**Step 3: Test API routes directly**

Run: `curl -s -X POST http://localhost:3000/api/ai/summary -H 'Content-Type: application/json' -d '{"customerId":"cust-001","view":"business"}' | jq .`
Expected: Business mock summary

Run: `curl -s -X POST http://localhost:3000/api/ai/chat -H 'Content-Type: application/json' -d '{"customerId":"cust-001","view":"c-level","question":"How are incidents?","history":[]}' | jq .`
Expected: Incident mock response

**Step 4: Push**

```bash
git push origin main
```

---

### Task 10: Provision watsonx.ai (Manual — User Steps)

This is NOT a code task. The user performs these steps in IBM Cloud:

1. Go to https://cloud.ibm.com/catalog and search "Watson Machine Learning"
2. Create an instance (Lite or Essentials plan)
3. Go to https://dataplatform.cloud.ibm.com and create a new project
4. Associate the WML instance with the project
5. Copy the `project_id` from the project's Settings > General page
6. Go to IBM Cloud > Manage > Access (IAM) > API keys > Create an API key
7. Create `.env.local`:
   ```env
   AI_PROVIDER=watsonx
   WATSONX_API_KEY=<your-key>
   WATSONX_PROJECT_ID=<your-project-id>
   WATSONX_REGION=eu-de
   WATSONX_MODEL_ID=ibm/granite-3-8b-instruct
   ```
8. Restart dev server: `npm run dev`
9. Verify: summary widget should take ~2-3 seconds and show a genuinely different AI-generated summary
10. Verify: chat responses should be contextual and based on actual dashboard data
11. For Vercel: add the same env vars in Vercel dashboard > Settings > Environment Variables, then redeploy

---

Plan complete and saved to `docs/plans/2026-03-04-watsonx-ai-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** — Open new session with executing-plans, batch execution with checkpoints

Which approach?