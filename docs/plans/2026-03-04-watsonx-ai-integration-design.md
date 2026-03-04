# watsonx.ai Integration Design

## Context

The Transparency Portal is a Next.js 16 dashboard with 31 "use client" widgets showing infrastructure metrics, incidents, SLA, costs, and security data. All data currently comes from mock JSON files with deterministic perturbation.

We are integrating IBM watsonx.ai to add AI-powered capabilities:
1. **AI Summary widget** — natural-language summary of dashboard state per view
2. **AI Chat panel** — ask natural-language questions about the data
3. **Anomaly annotations** — flag unusual metric trends (future phase)

The user has an IBM Cloud Pay-As-You-Go account (active). watsonx.ai is not yet provisioned.

## Architecture

```
Browser                         Vercel (server)                    IBM Cloud
┌──────────────┐  fetch()  ┌─────────────────────┐  REST API  ┌────────────┐
│ AI Summary   │ ────────→ │ /api/ai/summary     │ ────────→ │ watsonx.ai │
│ widget       │ ←──────── │                     │ ←──────── │            │
├──────────────┤           ├─────────────────────┤           │ Granite /  │
│ AI Chat      │ ────────→ │ /api/ai/chat        │ ────────→ │ Llama      │
│ panel        │ ←──────── │                     │ ←──────── │            │
└──────────────┘   JSON    │                     │           └────────────┘
                            │ AI_PROVIDER=mock?   │
                            │  → return canned    │
                            │ AI_PROVIDER=watsonx? │
                            │  → call IBM API     │
                            └─────────────────────┘
```

### Key decisions

- **Hybrid approach (Approach C)**: Direct watsonx.ai API calls in BFF routes with `AI_PROVIDER` env toggle (`mock` | `watsonx`). No adapter class hierarchy — overkill for a single API surface.
- **BFF routes required**: Widgets are client components; IBM credentials cannot be in client bundles.
- **Mock fallback**: Development works without IBM credentials. Flip to real AI when provisioned.
- **Model**: `ibm/granite-3-8b-instruct` — IBM's own, cheapest ($0.10/M tokens), fast, sufficient for structured summaries and data-aware Q&A.

### Auth flow (watsonx mode)

1. BFF route reads `WATSONX_API_KEY` from env
2. Exchanges for bearer token via `POST https://iam.cloud.ibm.com/identity/token`
3. Token cached for 55 minutes (expires after 60)
4. Calls `POST https://{region}.ml.cloud.ibm.com/ml/v1/text/generation?version=2025-02-06`

## Feature 1: AI Summary Widget

### Placement

Top of each dashboard view (c-level, business, technical) as a `medium`-sized widget. View-aware — summary changes based on which view is active.

### Data flow

1. Widget mounts → `POST /api/ai/summary` with `{ customerId, view }`
2. BFF route gathers widget data server-side by calling service functions
3. Builds prompt from template + gathered data
4. Calls watsonx.ai (or returns canned response in mock mode)
5. Returns summary text to widget

### Data gathered per view

| View | Service functions called | Key data points |
|------|------------------------|-----------------|
| c-level | `getCurrentSla`, `getIncidentSummary`, `getRisk`, `getCosts`, `getSecurityPosture` | SLA, incidents, risk score, cost vs budget, security score |
| business | `getTicketVolume`, `getMttrTrends`, `getChangeSuccessRate`, `getSlaHistory` | Ticket trends, MTTR, change success, SLA trend |
| technical | `getResourceUtilization`, `getLatencyMetrics`, `getErrorRates`, `getNetworkThroughput` | CPU/mem/disk, latency p95/p99, error rates, throughput |

### Prompt template (summary)

```
You are an IT operations analyst for a managed services provider.
Summarize the following dashboard data for a {viewAudience} in 3-4 sentences.
Focus on what needs attention.

Data:
{formattedData}
```

### UI

- `medium` widget with AI sparkle icon in header
- Generated text as body content
- "Powered by watsonx.ai" subtle footer
- Loading skeleton while generating (~2-3 seconds)

### Mock mode

Returns hardcoded summary string per view. No API call, instant response.

## Feature 2: AI Chat Panel

### Placement

Global UI element — slide-out panel from bottom-right floating button. Available on all views. Not a widget.

### Data flow

1. User clicks floating button → panel slides in
2. User types question → `POST /api/ai/chat` with `{ customerId, view, question, history }`
3. BFF route gathers view-relevant data (same as summary), appends conversation history
4. Builds system prompt with data context + conversation
5. Calls watsonx.ai → returns answer

### Prompt template (chat)

```
You are an AI assistant for an IT transparency portal.
Answer questions about the customer's infrastructure and services
using ONLY the data provided below. If you cannot answer from the
data, say so clearly. Keep answers concise (2-4 sentences).

Dashboard data:
{formattedData}

Conversation:
{history}
User: {question}
Assistant:
```

### UI elements

- Floating button (bottom-right): AI icon + "Ask AI" label
- Slide-out panel (~400px wide):
  - Header: "AI Assistant" + close button
  - Message list: user messages right-aligned, AI left-aligned
  - Text input + send button at bottom
  - "Powered by watsonx.ai" footer
- Conversation kept in React state (resets on page refresh)

### Constraints

- History limited to last 5 exchanges (10 messages) to stay within token budget
- Each request: ~1,000-2,000 tokens context + conversation
- At 300K free tokens/month: ~100-150 chat interactions/month for free

### Mock mode

Returns canned responses based on keyword matching (e.g., "latency" → pre-written latency analysis).

## File Plan

### New files (12)

| # | File | Purpose |
|---|------|---------|
| 1 | `.env.example` (update) | Add `AI_PROVIDER`, `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`, `WATSONX_REGION` |
| 2 | `lib/ai/config.ts` | Read AI env vars, validate config |
| 3 | `lib/ai/token.ts` | IBM IAM token exchange + 55-min cache |
| 4 | `lib/ai/watsonx.ts` | Call watsonx.ai text generation endpoint |
| 5 | `lib/ai/mock.ts` | Canned responses per view + keyword-matched chat |
| 6 | `lib/ai/generate.ts` | Public API: `generateSummary()`, `generateChatResponse()` — routes to mock or watsonx |
| 7 | `lib/ai/prompts.ts` | Prompt templates for summary (per view) and chat |
| 8 | `lib/ai/gather-context.ts` | Calls service functions server-side, formats data into prompt-ready text |
| 9 | `app/api/ai/summary/route.ts` | BFF route for summary generation |
| 10 | `app/api/ai/chat/route.ts` | BFF route for chat |
| 11 | `components/ai/AiSummaryWidget.tsx` | Summary widget component |
| 12 | `components/ai/AiChatPanel.tsx` | Chat panel with floating button |

### Modified files (3)

| File | Change |
|------|--------|
| `config/view-configs.ts` | Add `ai-summary` widget to each view |
| `config/widget-registry.ts` | Register `ai-summary` component |
| `app/dashboard/page.tsx` | Add `<AiChatPanel />` alongside `<WidgetGrid />` |

### Unchanged

All existing services, widgets, types, and mock data files.

## Implementation Order

| Step | What | Verification |
|------|------|-------------|
| 1 | `lib/ai/*` (config, token, watsonx, mock, generate, prompts, gather-context) | `npm run build` |
| 2 | `app/api/ai/summary/route.ts` + `app/api/ai/chat/route.ts` | `curl` both endpoints with mock mode |
| 3 | `components/ai/AiSummaryWidget.tsx` + register in widget config | Dashboard shows summary widget |
| 4 | `components/ai/AiChatPanel.tsx` + add to dashboard page | Chat panel opens and works with mock |
| 5 | Provision watsonx.ai, set env vars, flip `AI_PROVIDER=watsonx` | Real AI responses |

## IBM Cloud Provisioning Steps

Before flipping to real watsonx.ai:

1. **Watson Machine Learning instance** — IBM Cloud catalog → search "Watson Machine Learning" → create with Lite/Essentials plan
2. **watsonx.ai project** — dataplatform.cloud.ibm.com → create project → associate WML instance → copy `project_id` from Settings > General
3. **API key** — IBM Cloud → Manage → Access (IAM) → API keys → Create

Then set in `.env.local`:
```env
AI_PROVIDER=watsonx
WATSONX_API_KEY=<your-api-key>
WATSONX_PROJECT_ID=<your-project-id>
WATSONX_REGION=eu-de
```

## Token Budget

- Free tier: 300,000 tokens/month
- Summary request: ~500 input + ~200 output = ~700 tokens
- Chat request: ~1,500 input + ~200 output = ~1,700 tokens
- Summaries auto-generated per view load: ~3 views × 10 loads/day × 700 = ~21,000 tokens/day
- Chat: ~5 questions/day × 1,700 = ~8,500 tokens/day
- Monthly estimate: ~885,000 tokens/month — exceeds free tier
- Mitigation: cache summary responses for 5 minutes, reducing summary calls by ~90% → ~110,000 tokens/month (within free tier)

## Future: Anomaly Annotations (Phase 2)

Not built in this phase. Design sketch:
- New BFF route `POST /api/ai/anomalies` gathers time-series data
- Prompt asks watsonx.ai to identify unusual patterns
- Response includes metric name, timestamp range, and description
- Existing chart widgets receive anomaly data as optional prop
- Rendered as colored badges or tooltip overlays on Tremor charts
