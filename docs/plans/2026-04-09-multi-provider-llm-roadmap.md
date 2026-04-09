# Multi-Provider LLM Roadmap

**Status**: Core Runtime And Production Hardening Complete
**Date**: 2026-04-09
**Goal**: Remove watsonx-specific lock-in from the current AI layer, add multiple interchangeable LLM providers, and turn the "AI" widgets into a truthful, testable, provider-agnostic subsystem.

## Implementation Progress

Initial Phase 1 development started on 2026-04-09. The following changes are now implemented in the repository:

- Added a provider runtime and task router:
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/router.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/provider-label.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/types.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/index.ts`
- Added provider adapters for:
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/mock.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/watsonx.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/openrouter.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/lm-studio.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/ollama.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/openai.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/anthropic.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/gemini.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/bedrock.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/openai-compatible.ts`
- Refactored the existing task entry points to route through the provider runtime:
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/generate.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/insights.ts`
- Added a new provider-backed risk briefing task:
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/gather-risk-briefing-context.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/risk-briefing-prompts.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/parse-risk-briefing.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/risk-briefing.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/mock-risk-briefing.ts`
- Added a dedicated task route:
  - `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/risk-briefing/route.ts`
- Added a provider-backed SLA risk advisor task:
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/gather-sla-risk-context.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/sla-risk-prompts.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/parse-sla-risk.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/sla-risk.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/mock-sla-risk-advisor.ts`
- Added provider-backed task pairs for the remaining AI widgets:
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/gather-cost-forecast-context.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/cost-forecast-prompts.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/parse-cost-forecast.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/cost-forecast.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/mock-cost-forecast.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/gather-capacity-planner-context.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/capacity-planner-prompts.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/parse-capacity-planner.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/capacity-planner.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/mock-capacity-planner.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/gather-root-cause-patterns-context.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/root-cause-patterns-prompts.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/parse-root-cause-patterns.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/root-cause-patterns.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/mock-root-cause-patterns.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/gather-change-impact-context.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/change-impact-prompts.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/parse-change-impact.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/change-impact.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/mock-change-impact.ts`
- Added a dedicated task route:
  - `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/sla-risk/route.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/cost-forecast/route.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/capacity-planner/route.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/root-cause-patterns/route.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/change-impact/route.ts`
- Expanded configuration to support task-specific provider selection and new provider credentials:
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/config.ts`
- Added task-level model overrides so each AI task can use a different model without code changes.
- Updated `/api/ai/*` routes to return the active provider label to the client.
- Converted the former static risk briefing widget into a real provider-backed widget:
  - `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiRiskBriefingWidget.tsx`
- Converted the former static SLA risk advisor widget into a real provider-backed widget:
  - `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiSlaRiskAdvisorWidget.tsx`
- Converted the remaining static AI widgets into real provider-backed widgets:
  - `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiCostForecastWidget.tsx`
  - `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiCapacityPlannerWidget.tsx`
  - `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiRootCausePatternsWidget.tsx`
  - `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiChangeImpactWidget.tsx`
- Hardened structured-output parsing for provider variance:
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/extract-json-object.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/parse-insights.ts`
- Added AI gateway hardening:
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/route-utils.ts`
  - request IDs on all AI route responses
  - route auth via bearer token or `x-ai-api-key`
  - tenant-aware quotas keyed by `route + customerId`
  - provider timing logs and classified AI route errors
- Added a shared AI cache abstraction and migrated task caches onto it:
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/cache.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/shared-store.ts`
  - summary, insights, risk-briefing, SLA risk, cost forecast, capacity planner, root cause patterns, and change impact now share one TTL/dedupe path
  - the cache backend can run in memory or via Upstash Redis REST
- Added streaming utilities and end-to-end chat streaming:
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/sse.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/chat/route.ts`
  - `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiChatPanel.tsx`
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/generate.ts`
- Added provider contract and infrastructure regression coverage plus a dedicated test command:
  - `/Users/thorstenmeyer/Dev/Transparency/tests/ai/cache.test.mts`
  - `/Users/thorstenmeyer/Dev/Transparency/tests/ai/extract-json-object.test.mts`
  - `/Users/thorstenmeyer/Dev/Transparency/tests/ai/route-policy.test.mts`
  - `/Users/thorstenmeyer/Dev/Transparency/tests/ai/shared-store.test.mts`
  - `/Users/thorstenmeyer/Dev/Transparency/tests/ai/sse.test.mts`
  - `/Users/thorstenmeyer/Dev/Transparency/tests/ai/providers/openai-compatible.test.mts`
  - `/Users/thorstenmeyer/Dev/Transparency/tests/ai/providers/anthropic.test.mts`
  - `/Users/thorstenmeyer/Dev/Transparency/tests/ai/providers/gemini.test.mts`
  - `/Users/thorstenmeyer/Dev/Transparency/tests/ai/providers/watsonx.test.mts`
  - `npm run test:ai`
- Removed the old single-purpose provider module:
  - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/watsonx.ts`
- Replaced hard-coded watsonx branding in model-backed widgets with dynamic provider labels.
- Re-labeled the remaining static AI widgets as scenario-based examples so they no longer falsely imply live model output.
- Verified the refactor with a successful production build on 2026-04-09.

The initial implementation adds this configuration surface:

- Shared routing:
  - `AI_PROVIDER`
  - `AI_FALLBACKS`
  - `AI_SUMMARY_PROVIDER`
  - `AI_SUMMARY_FALLBACKS`
  - `AI_SUMMARY_MODEL`
  - `AI_CHAT_PROVIDER`
  - `AI_CHAT_FALLBACKS`
  - `AI_CHAT_MODEL`
  - `AI_INSIGHTS_PROVIDER`
  - `AI_INSIGHTS_FALLBACKS`
  - `AI_INSIGHTS_MODEL`
  - `AI_RISK_BRIEFING_PROVIDER`
  - `AI_RISK_BRIEFING_FALLBACKS`
  - `AI_RISK_BRIEFING_MODEL`
  - `AI_SLA_RISK_PROVIDER`
  - `AI_SLA_RISK_FALLBACKS`
  - `AI_SLA_RISK_MODEL`
  - `AI_COST_FORECAST_PROVIDER`
  - `AI_COST_FORECAST_FALLBACKS`
  - `AI_COST_FORECAST_MODEL`
  - `AI_CAPACITY_PLANNER_PROVIDER`
  - `AI_CAPACITY_PLANNER_FALLBACKS`
  - `AI_CAPACITY_PLANNER_MODEL`
  - `AI_ROOT_CAUSE_PATTERNS_PROVIDER`
  - `AI_ROOT_CAUSE_PATTERNS_FALLBACKS`
  - `AI_ROOT_CAUSE_PATTERNS_MODEL`
  - `AI_CHANGE_IMPACT_PROVIDER`
  - `AI_CHANGE_IMPACT_FALLBACKS`
  - `AI_CHANGE_IMPACT_MODEL`
- Watsonx:
  - `WATSONX_API_KEY`
  - `WATSONX_PROJECT_ID`
  - `WATSONX_REGION`
  - `WATSONX_MODEL_ID`
- OpenRouter:
  - `OPENROUTER_API_KEY`
  - `OPENROUTER_BASE_URL`
  - `OPENROUTER_MODEL_ID`
  - `OPENROUTER_SITE_URL`
  - `OPENROUTER_APP_NAME`
- LM Studio:
  - `LM_STUDIO_BASE_URL`
  - `LM_STUDIO_MODEL_ID`
  - `LM_STUDIO_API_KEY`
- Ollama:
  - `OLLAMA_BASE_URL`
  - `OLLAMA_MODEL_ID`
  - `OLLAMA_API_KEY`
- OpenAI:
  - `OPENAI_API_KEY`
  - `OPENAI_BASE_URL`
  - `OPENAI_MODEL_ID`
- Anthropic:
  - `ANTHROPIC_API_KEY`
  - `ANTHROPIC_BASE_URL`
  - `ANTHROPIC_MODEL_ID`
  - `ANTHROPIC_VERSION`
- Gemini:
  - `GEMINI_API_KEY`
  - `GEMINI_BASE_URL`
  - `GEMINI_MODEL_ID`
- Bedrock:
  - `BEDROCK_API_KEY`
  - `BEDROCK_BASE_URL`
  - `BEDROCK_MODEL_ID`
  - `BEDROCK_REGION`
- Shared cache:
  - `AI_SHARED_CACHE_BACKEND`
  - `AI_SHARED_CACHE_URL`
  - `AI_SHARED_CACHE_TOKEN`
  - `AI_SHARED_CACHE_PREFIX`
- Route auth and quotas:
  - `AI_ROUTE_AUTH_ENABLED`
  - `AI_ROUTE_API_KEYS_JSON`
  - `AI_ROUTE_QUOTA_WINDOW_MS`
  - `AI_ROUTE_STANDARD_LIMIT_PER_MINUTE`
  - `AI_ROUTE_ENTERPRISE_LIMIT_PER_MINUTE`
  - `AI_ROUTE_ENTERPRISE_PREMIUM_LIMIT_PER_MINUTE`
  - per-route overrides such as `AI_ROUTE_CHAT_LIMIT_PER_MINUTE`

## Current State At Roadmap Start

The codebase already has a server-side AI boundary, which is the right foundation:

- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/summary/route.ts`
- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/chat/route.ts`
- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/insights/route.ts`
- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/risk-briefing/route.ts`
- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/sla-risk/route.ts`
- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/cost-forecast/route.ts`
- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/capacity-planner/route.ts`
- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/root-cause-patterns/route.ts`
- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/change-impact/route.ts`

At the start of this roadmap, the implementation behind those routes was effectively single-provider:

- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/config.ts` only supports `"mock" | "watsonx"`.
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/generate.ts` imports `watsonxChat` directly.
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/insights.ts` imports `watsonxChat` directly.
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/watsonx.ts` was the only real provider adapter.
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/token.ts` is IBM-specific IAM token exchange.

The UI is also partly coupled:

- `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiSummaryWidget.tsx` hard-codes `Powered by watsonx.ai`.
- `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiChatPanel.tsx` hard-codes `Powered by watsonx.ai`.
- `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiPredictionsWidget.tsx` and `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiAnomaliesWidget.tsx` consume the shared `insights` API, but still brand themselves as watsonx-specific.
- Several "AI" widgets are not model-backed at all and currently use static arrays:
  - `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiRiskBriefingWidget.tsx`
  - `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiCostForecastWidget.tsx`
  - `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiCapacityPlannerWidget.tsx`
  - `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiRootCausePatternsWidget.tsx`
  - `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiSlaRiskAdvisorWidget.tsx`
  - `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiChangeImpactWidget.tsx`

## Issues To Address

### P0 Architecture Issues

1. **Provider lock-in in core AI functions**
   - `generate.ts` and `insights.ts` are wired directly to `watsonxChat`.
   - Impact: adding OpenAI, Anthropic, Gemini, or Bedrock requires touching core logic instead of plugging in adapters.

2. **Config model is provider-specific**
   - `AiConfig` is centered on `watsonx`, not on provider capabilities.
   - Impact: the config surface does not scale to multiple providers or task-specific routing.

3. **Task abstraction is too thin**
   - There is no internal concept of provider capabilities such as `text`, `structured`, `streaming`, or `fallback`.
   - Impact: chat, summary, and insights cannot route intelligently per provider or degrade cleanly.

### P1 Product and UX Issues

4. **Provider branding is hard-coded into the UI**
   - Multiple components say `Powered by watsonx.ai` even when `AI_PROVIDER=mock`.
   - Impact: misleading UI and unnecessary coupling.

5. **Several AI widgets are static but presented as AI**
   - Risk briefing, cost forecast, capacity planner, root cause patterns, SLA risk advisor, and change impact use hard-coded data.
   - Impact: the feature surface is larger than the real implementation.

6. **Insights parsing is brittle**
   - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/parse-insights.ts` extracts the first JSON object using a regex.
   - Impact: one provider-format change or extra prose can silently degrade the feature.

### P2 Reliability and Operations Issues

7. **Caches are centralized but still in-memory only**
   - The task layer now uses `/Users/thorstenmeyer/Dev/Transparency/lib/ai/cache.ts` for shared TTL and request dedupe.
   - Remaining impact: cache inconsistency across instances and no shared invalidation.

8. **Streaming exists, but provider coverage is still uneven**
   - `AiChatPanel` and `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/chat/route.ts` now support SSE streaming.
   - Remaining impact: providers without native streaming still fall back to chunked full responses.

9. **Provider-agnostic errors are basic, not production-grade**
   - `/Users/thorstenmeyer/Dev/Transparency/lib/ai/route-utils.ts` now classifies common auth/quota/timeout/malformed failures.
   - Remaining impact: there is still no persistent telemetry sink or provider-specific retry policy.

10. **AI-specific tests are present but still thin**
   - `npm run test:ai` now covers the cache helper, JSON extraction, and SSE parsing.
   - Remaining impact: adapter contract tests and route-level tests are still missing.

11. **No route hardening**
   - The AI routes validate input shape minimally but have no auth, no quota, and no abuse controls.
   - Impact: acceptable for MVP, not acceptable for production.

## Target Architecture

The right abstraction level for this codebase is **task-first, provider-pluggable**.

Client components should continue to call generic internal routes:

- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/summary/route.ts`
- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/chat/route.ts`
- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/insights/route.ts`
- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/risk-briefing/route.ts`
- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/sla-risk/route.ts`

Those routes should delegate to a provider-agnostic AI runtime:

- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/types.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/mock.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/watsonx.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/openai.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/anthropic.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/gemini.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/bedrock.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/router.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/config.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/provider-label.ts`

Task logic should be separated from transport details:

- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/tasks/summary.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/tasks/chat.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/tasks/insights.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/tasks/risk-briefing.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/tasks/cost-forecast.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/tasks/capacity-plan.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/tasks/change-impact.ts`

The provider interface should support these capabilities from day one:

- `generateText`
- `generateStructured`
- `streamText`
- `supportsJsonMode`
- `supportsStreaming`
- `supportsSystemMessages`

That keeps the app stable while providers differ underneath.

## Recommended Provider Set

Implement providers in this order:

1. `mock`
2. `watsonx`
3. `openrouter`
4. `lm-studio`
5. `ollama`
6. `openai`
7. `anthropic`
8. `gemini`
9. `bedrock`

Reasoning:

- `mock` stays as the no-secrets demo path.
- `watsonx` preserves current behavior and gives a migration baseline.
- `openrouter` is the fastest path to broad hosted model coverage and cross-vendor fallback without binding the app to a single provider.
- `lm-studio` and `ollama` provide local and offline support for development, demos, and privacy-sensitive environments.
- `openai` and `anthropic` are still the next most valuable direct hosted integrations for text-heavy tasks.
- `gemini` adds a strong multimodal and streaming option.
- `bedrock` is best added after the abstraction is stable because it is a gateway to several model families, not just a single provider.

If the business wants to stay IBM-centric while still brokering multiple providers, IBM watsonx.ai software exposes a model gateway that can front providers such as OpenAI, Anthropic, Azure OpenAI, and watsonx itself. That is a valid integration option, but it does **not** satisfy the requirement to be able to replace IBM as the control plane, so it should be treated as optional infrastructure, not as the core abstraction.

## Phase 1: Decouple Watsonx From Product Logic

**Estimate**: 5-7 implementation days
**Objective**: keep current features working while making provider swap possible without editing product code.

### Epic 1.1: Introduce Provider Runtime

**Milestones**

- Add a provider interface and provider registry.
- Move IBM-specific logic out of `generate.ts` and `insights.ts`.
- Replace `AiProvider = "mock" | "watsonx"` with a scalable provider union.
- Introduce task-level routing such as:
  - `AI_SUMMARY_PROVIDER`
  - `AI_CHAT_PROVIDER`
  - `AI_INSIGHTS_PROVIDER`

**Files to create**

- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/types.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/index.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/router.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/provider-config.ts`

**Files to modify**

- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/config.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/generate.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/insights.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/watsonx.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/token.ts`

### Epic 1.2: Make UI Provider-Neutral

**Milestones**

- Replace all hard-coded `Powered by watsonx.ai` strings with a provider label helper.
- Show `Powered by Mock AI` when running mock.
- Ensure widgets do not claim model-backed output unless they actually call the AI routes.

**Files to modify**

- `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiSummaryWidget.tsx`
- `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiChatPanel.tsx`
- `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiPredictionsWidget.tsx`
- `/Users/thorstenmeyer/Dev/Transparency/components/ai/AiAnomaliesWidget.tsx`
- Static AI widgets listed above

### Epic 1.3: Stabilize Response Contracts

**Milestones**

- Replace regex-based JSON extraction with schema-first structured parsing.
- Add shared error envelopes for AI routes.
- Add provider timeout and retry helpers.
- Add a fallback policy: `task primary provider -> task fallback provider -> mock`.

**Files to create**

- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/result.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/retries.ts`
- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/structured.ts`

**Files to modify**

- `/Users/thorstenmeyer/Dev/Transparency/lib/ai/parse-insights.ts`
- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/summary/route.ts`
- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/chat/route.ts`
- `/Users/thorstenmeyer/Dev/Transparency/app/api/ai/insights/route.ts`

### Phase 1 Exit Criteria

- Current watsonx behavior still works.
- `mock` and `watsonx` both run through the same provider interface.
- UI no longer hard-codes watsonx.
- `summary`, `chat`, and `insights` can be routed independently.
- No product logic imports a provider module directly.

## Phase 2: Add New Providers and Harden Runtime

**Estimate**: 7-10 implementation days
**Objective**: add real replacement providers and make the runtime production-tolerant.

### Epic 2.1: Add OpenRouter and Local Runtime Support

**Milestones**

- Add `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/openrouter.ts`
- Add `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/lm-studio.ts`
- Add `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/ollama.ts`
- Add a shared OpenAI-compatible transport so OpenRouter and local runtimes do not duplicate HTTP logic.
- Support task-level model selection:
  - `AI_SUMMARY_MODEL`
  - `AI_CHAT_MODEL`
  - `AI_INSIGHTS_MODEL`
- Add local-runtime endpoint configuration:
  - `LM_STUDIO_BASE_URL`
  - `LM_STUDIO_MODEL_ID`
  - `OLLAMA_BASE_URL`
  - `OLLAMA_MODEL_ID`

### Epic 2.2: Add OpenAI and Anthropic

**Milestones**

- Add `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/openai.ts`
- Add `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/anthropic.ts`
- Normalize message formats so prompts remain task-owned, not provider-owned.

### Epic 2.3: Add Gemini and Bedrock

**Milestones**

- Add `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/gemini.ts`
- Add `/Users/thorstenmeyer/Dev/Transparency/lib/ai/providers/bedrock.ts`
- Implement provider capability checks for structured output and streaming.
- Support per-provider safety settings where required.

### Epic 2.4: Observability, Limits, and Shared Caching

**Milestones**

- Add request IDs and provider timing logs.
- Add server-side rate limiting for AI routes.
- Replace process-local caches with a cache abstraction so the app can later move to shared storage without changing task code.
- Add provider-specific error classification:
  - auth
  - quota
  - timeout
  - malformed response
  - safety refusal

### Epic 2.5: Test Coverage

**Milestones**

- Add provider contract tests for each adapter.
- Add route tests for summary, chat, and insights.
- Add parser tests for structured insights outputs.
- Add regression fixtures so the same prompt and context can be replayed across providers.

### Phase 2 Exit Criteria

- At least three real providers are interchangeable for `summary` and `chat`.
- `insights` has a reliable structured-output path with fallback.
- Provider outages degrade cleanly instead of breaking the widget.
- The app can be configured per task instead of all-or-nothing provider switching.
- OpenRouter plus at least one local runtime are available as non-IBM execution paths.

## Phase 3: Convert The Whole AI Surface To Real, Multi-Provider Features

**Estimate**: 10-14 implementation days
**Objective**: stop shipping static "AI" widgets and move the whole feature set onto the provider runtime.

### Epic 3.1: Replace Static AI Widgets With Task APIs

**Milestones**

- Add route and task pairs for:
  - risk briefing
  - cost forecast
  - capacity planner
  - root cause patterns
  - SLA risk advisor
  - change impact
- Refactor static widgets to fetch live task results from `/app/api/ai/*`.
- Ensure each task has a stable response type in `/Users/thorstenmeyer/Dev/Transparency/types/ai.ts`.

### Epic 3.2: Streaming and UX Improvements

**Milestones**

- Add streaming chat support to `AiChatPanel`.
- Add loading states and partial-token rendering.
- Add provider and model visibility for debugging in non-production environments.

### Epic 3.3: Governance and Cost Controls

**Milestones**

- Add per-task provider allowlists.
- Add route auth and quota controls.
- Add cost and latency dashboards per provider/model.
- Add red-team prompt regression cases for refusal and hallucination behavior.

### Epic 3.4: Rollout and Cutover

**Milestones**

- Define a production default provider for each task.
- Define a fallback provider for each task.
- Keep `mock` as the demo and incident fallback path.
- Add an operator runbook covering secrets, quotas, failure modes, and rollback.

### Phase 3 Exit Criteria

- No AI widget is falsely labeled as model-backed.
- All AI widgets obtain data through the task runtime.
- At least one non-IBM provider can replace watsonx for all existing AI routes.
- Providers can be swapped by config without touching UI code or task logic.

## Estimated Implementation Order

1. Create provider interface and registry.
2. Refactor watsonx into a provider adapter.
3. Refactor `generate.ts` and `insights.ts` to call the router instead of `watsonxChat`.
4. Remove hard-coded watsonx labels from UI.
5. Introduce structured-output parsing that does not rely on regex extraction.
6. Add OpenRouter adapter.
7. Add LM Studio adapter.
8. Add Ollama adapter.
9. Add OpenAI adapter.
10. Add Anthropic adapter.
11. Add task-level routing and fallback config.
12. Add Gemini adapter.
13. Add Bedrock adapter.
14. Replace static AI widgets with real task routes.
15. Add streaming chat.
16. Add route limits, telemetry, tests, and rollout controls.

## Deliverables By Phase

### End of Phase 1

- Provider-neutral AI core
- Existing AI routes preserved
- UI no longer watsonx-branded by default
- Safe fallback chain
- OpenRouter, LM Studio, and Ollama included in the provider strategy

### End of Phase 2

- Multi-provider runtime in place
- OpenRouter, LM Studio, and Ollama working
- OpenAI and Anthropic working
- Gemini and Bedrock optional but wired
- Tests and operational logging added

### End of Phase 3

- Full AI surface is real and provider-agnostic
- IBM watsonx is optional, not foundational
- Production rollout controls are in place

## Recommendation

Do **not** start by adding another provider beside the current watsonx code. That would increase lock-in and technical debt at the same time.

Start with Phase 1 and make the AI layer honest and swappable first. After that, implement OpenRouter and local runtime support before the native hosted adapters. That is the shortest path to proving that IBM watsonx can be replaced without destabilizing the portal and without requiring cloud credentials in every environment.
