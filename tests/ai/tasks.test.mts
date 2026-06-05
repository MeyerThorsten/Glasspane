import test from "node:test";
import assert from "node:assert/strict";
import { generateSummary, generateChatResponse } from "../../lib/ai/generate.ts";
import { generateInsights } from "../../lib/ai/insights.ts";
import { generateRiskBriefing } from "../../lib/ai/risk-briefing.ts";
import { generateSlaRiskAdvisor } from "../../lib/ai/sla-risk.ts";
import { generateCostForecast } from "../../lib/ai/cost-forecast.ts";
import { generateCapacityPlanner } from "../../lib/ai/capacity-planner.ts";
import { generateRootCausePatterns } from "../../lib/ai/root-cause-patterns.ts";
import { generateChangeImpact } from "../../lib/ai/change-impact.ts";
import { generateWorkforceGrowthRecommendations } from "../../lib/ai/workforce-growth.ts";
import { clearAiSharedStore } from "../../lib/ai/shared-store.ts";
import { withEnv } from "./test-helpers.mts";

test("mock provider covers every AI task contract", async () => {
  const restoreEnv = withEnv({
    AI_PROVIDER: "mock",
    AI_FALLBACKS: undefined,
  });
  await clearAiSharedStore("model-telemetry:");

  try {
    const summary = await generateSummary("cust-001", "c-level");
    assert.match(summary.text, /availability|dashboard|SLA/i);
    assert.equal(summary.modelInfo.provider, "mock");

    const chat = await generateChatResponse("cust-001", "business", "What needs attention?", []);
    assert.ok(chat.text.length > 0);
    assert.equal(chat.modelInfo.task, "chat");

    const insights = await generateInsights("cust-001");
    assert.ok(insights.anomalies.length > 0);
    assert.ok(insights.predictions.length > 0);
    assert.equal(insights.modelInfo?.task, "insights");

    const riskBriefing = await generateRiskBriefing("cust-001");
    assert.ok(riskBriefing.items.length > 0);
    assert.equal(riskBriefing.modelInfo?.task, "risk-briefing");

    const slaRisk = await generateSlaRiskAdvisor("cust-001");
    assert.ok(slaRisk.services.length > 0);
    assert.ok((slaRisk.trend ?? []).some((point) => point.Target === 99.999));
    assert.equal(slaRisk.modelInfo?.task, "sla-risk");

    const costForecast = await generateCostForecast("cust-001");
    assert.ok(costForecast.forecast.length > 0);
    assert.ok((costForecast.history ?? []).length > 0);
    assert.equal(costForecast.modelInfo?.task, "cost-forecast");

    const capacityPlanner = await generateCapacityPlanner("cust-001");
    assert.ok(capacityPlanner.resources.length > 0);
    assert.equal(capacityPlanner.modelInfo?.task, "capacity-planner");

    const rootCausePatterns = await generateRootCausePatterns("cust-001");
    assert.ok(rootCausePatterns.patterns.length > 0);
    assert.equal(rootCausePatterns.modelInfo?.task, "root-cause-patterns");

    const changeImpact = await generateChangeImpact("cust-001");
    assert.ok(changeImpact.changes.length > 0);
    assert.equal(changeImpact.modelInfo?.task, "change-impact");

    const workforceGrowth = await generateWorkforceGrowthRecommendations("emp-001");
    assert.ok(workforceGrowth.recommendations.length > 0);
    assert.ok(workforceGrowth.recommendations[0].sources.length > 0);
    assert.equal(workforceGrowth.modelInfo?.task, "workforce-growth");
  } finally {
    restoreEnv();
  }
});
