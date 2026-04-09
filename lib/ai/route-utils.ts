import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCustomerById } from "@/lib/services/customer-service";
import type { Customer } from "@/types";
import { getAiSharedStore } from "./shared-store";
import type { AiTask } from "./providers/types";

type AiErrorCode =
  | "auth"
  | "quota"
  | "timeout"
  | "malformed_response"
  | "safety_refusal"
  | "upstream"
  | "unknown";

interface AiRouteApiKeyConfig {
  id: string;
  token: string;
  allowedCustomers: string[];
  requestsPerMinute?: number;
  routeLimits?: Partial<Record<AiTask, number>>;
}

interface AiRoutePolicyConfig {
  authEnabled: boolean;
  quotaWindowMs: number;
  tierLimits: Record<Customer["tier"], number>;
  routeLimits: Partial<Record<AiTask, number>>;
  tokens: AiRouteApiKeyConfig[];
}

export interface AiRouteAccessContext {
  authSubject: string;
  customerId: string;
  customerTier: Customer["tier"];
  quotaLimit: number;
  quotaUsed: number;
  quotaRemaining: number;
  quotaResetAt: number | null;
}

const ROUTE_ENV_PREFIX: Record<AiTask, string> = {
  summary: "SUMMARY",
  chat: "CHAT",
  insights: "INSIGHTS",
  "risk-briefing": "RISK_BRIEFING",
  "sla-risk": "SLA_RISK",
  "cost-forecast": "COST_FORECAST",
  "capacity-planner": "CAPACITY_PLANNER",
  "root-cause-patterns": "ROOT_CAUSE_PATTERNS",
  "change-impact": "CHANGE_IMPACT",
};

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseTokensJson(value: string | undefined): AiRouteApiKeyConfig[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as Array<Record<string, unknown>>;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item, index) => {
        const token = typeof item.token === "string" ? item.token : "";
        const id = typeof item.id === "string" && item.id.trim() ? item.id.trim() : `token-${index + 1}`;
        const allowedCustomers = Array.isArray(item.allowedCustomers)
          ? item.allowedCustomers.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
          : [];
        const routeLimits = typeof item.routeLimits === "object" && item.routeLimits
          ? Object.fromEntries(
              Object.entries(item.routeLimits).filter(
                ([route, limit]) =>
                  route in ROUTE_ENV_PREFIX && Number.isFinite(Number(limit)) && Number(limit) > 0,
              ),
            ) as Partial<Record<AiTask, number>>
          : undefined;

        return {
          id,
          token,
          allowedCustomers,
          requestsPerMinute:
            Number.isFinite(Number(item.requestsPerMinute)) && Number(item.requestsPerMinute) > 0
              ? Number(item.requestsPerMinute)
              : undefined,
          routeLimits,
        };
      })
      .filter((item) => item.token.length > 0);
  } catch {
    console.warn(JSON.stringify({
      scope: "ai.route",
      status: "warning",
      detail: "Failed to parse AI_ROUTE_API_KEYS_JSON",
    }));
    return [];
  }
}

function getAiRoutePolicyConfig(): AiRoutePolicyConfig {
  const tokens = parseTokensJson(process.env.AI_ROUTE_API_KEYS_JSON);
  const authEnabled = process.env.AI_ROUTE_AUTH_ENABLED === "true" || tokens.length > 0;

  return {
    authEnabled,
    quotaWindowMs: parsePositiveInteger(process.env.AI_ROUTE_QUOTA_WINDOW_MS, 60_000),
    tierLimits: {
      Standard: parsePositiveInteger(process.env.AI_ROUTE_STANDARD_LIMIT_PER_MINUTE, 20),
      Enterprise: parsePositiveInteger(process.env.AI_ROUTE_ENTERPRISE_LIMIT_PER_MINUTE, 60),
      "Enterprise Premium": parsePositiveInteger(
        process.env.AI_ROUTE_ENTERPRISE_PREMIUM_LIMIT_PER_MINUTE,
        120,
      ),
    },
    routeLimits: Object.fromEntries(
      Object.entries(ROUTE_ENV_PREFIX)
        .map(([route, prefix]) => [
          route,
          process.env[`AI_ROUTE_${prefix}_LIMIT_PER_MINUTE`]
            ? parsePositiveInteger(process.env[`AI_ROUTE_${prefix}_LIMIT_PER_MINUTE`], 1)
            : undefined,
        ])
        .filter(([, value]) => value !== undefined),
    ) as Partial<Record<AiTask, number>>,
    tokens,
  };
}

function getMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function matchesToken(candidate: string, token: string): boolean {
  const candidateBuffer = Buffer.from(candidate);
  const tokenBuffer = Buffer.from(token);

  if (candidateBuffer.length !== tokenBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, tokenBuffer);
}

function getProvidedApiKey(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return request.headers.get("x-ai-api-key");
}

function createAiResponse(
  requestId: string,
  payload: object,
  status: number,
  access?: Partial<AiRouteAccessContext>,
) {
  const response = NextResponse.json(payload, { status });
  response.headers.set("x-request-id", requestId);

  if (access?.customerId) {
    response.headers.set("x-ai-tenant", access.customerId);
  }
  if (access?.authSubject) {
    response.headers.set("x-ai-auth-subject", access.authSubject);
  }
  if (typeof access?.quotaLimit === "number") {
    response.headers.set("x-ratelimit-limit", String(access.quotaLimit));
  }
  if (typeof access?.quotaRemaining === "number") {
    response.headers.set("x-ratelimit-remaining", String(access.quotaRemaining));
  }
  if (access?.quotaResetAt) {
    response.headers.set("x-ratelimit-reset", String(Math.ceil(access.quotaResetAt / 1000)));
  }

  return response;
}

function buildAuthErrorResponse(
  requestId: string,
  status: number,
  message: string,
  access?: Partial<AiRouteAccessContext>,
) {
  return createAiResponse(
    requestId,
    {
      error: message,
      code: "auth",
      requestId,
    },
    status,
    access,
  );
}

function buildQuotaErrorResponse(
  requestId: string,
  access: AiRouteAccessContext,
) {
  const retryAfterSeconds = access.quotaResetAt
    ? Math.max(1, Math.ceil((access.quotaResetAt - Date.now()) / 1000))
    : 60;
  const response = createAiResponse(
    requestId,
    {
      error: "Rate limit exceeded",
      code: "quota",
      requestId,
      retryAfterSeconds,
    },
    429,
    access,
  );
  response.headers.set("retry-after", String(retryAfterSeconds));
  return response;
}

function resolveQuotaLimit(
  routeName: AiTask,
  customer: Customer,
  policyConfig: AiRoutePolicyConfig,
  tokenConfig?: AiRouteApiKeyConfig,
) {
  return tokenConfig?.routeLimits?.[routeName]
    ?? tokenConfig?.requestsPerMinute
    ?? policyConfig.routeLimits[routeName]
    ?? policyConfig.tierLimits[customer.tier];
}

export function getAiRequestId(request: NextRequest): string {
  return request.headers.get("x-request-id") || crypto.randomUUID();
}

export async function authorizeAiRoute(
  request: NextRequest,
  routeName: AiTask,
  requestId: string,
  customerId: string,
): Promise<{ context: AiRouteAccessContext } | { response: NextResponse }> {
  const customer = await getCustomerById(customerId);
  if (!customer) {
    return {
      response: createAiResponse(
        requestId,
        {
          error: "Unknown customerId",
          requestId,
        },
        404,
      ),
    };
  }

  const policyConfig = getAiRoutePolicyConfig();
  const providedToken = getProvidedApiKey(request);
  const tokenConfig = policyConfig.tokens.find((item) => providedToken && matchesToken(providedToken, item.token));

  if (policyConfig.authEnabled) {
    if (!providedToken) {
      return {
        response: buildAuthErrorResponse(requestId, 401, "Missing AI API key"),
      };
    }

    if (!tokenConfig) {
      return {
        response: buildAuthErrorResponse(requestId, 403, "Invalid AI API key"),
      };
    }

    if (
      tokenConfig.allowedCustomers.length > 0
      && !tokenConfig.allowedCustomers.includes("*")
      && !tokenConfig.allowedCustomers.includes(customerId)
    ) {
      return {
        response: buildAuthErrorResponse(
          requestId,
          403,
          "AI API key is not allowed to access this customer",
          {
            authSubject: tokenConfig.id,
            customerId,
          },
        ),
      };
    }
  }

  const quotaLimit = resolveQuotaLimit(routeName, customer, policyConfig, tokenConfig);
  const counter = await getAiSharedStore().incrementFixedWindow(
    `quota:${routeName}:${customerId}`,
    policyConfig.quotaWindowMs,
  );
  const accessContext: AiRouteAccessContext = {
    authSubject: tokenConfig?.id || "anonymous",
    customerId,
    customerTier: customer.tier,
    quotaLimit,
    quotaUsed: counter.value,
    quotaRemaining: Math.max(0, quotaLimit - counter.value),
    quotaResetAt: counter.resetAt,
  };

  if (counter.value > quotaLimit) {
    return {
      response: buildQuotaErrorResponse(requestId, accessContext),
    };
  }

  return {
    context: accessContext,
  };
}

export function applyAiAccessHeaders(
  response: Response,
  access: AiRouteAccessContext,
) {
  response.headers.set("x-ai-tenant", access.customerId);
  response.headers.set("x-ai-auth-subject", access.authSubject);
  response.headers.set("x-ratelimit-limit", String(access.quotaLimit));
  response.headers.set("x-ratelimit-remaining", String(access.quotaRemaining));
  if (access.quotaResetAt) {
    response.headers.set("x-ratelimit-reset", String(Math.ceil(access.quotaResetAt / 1000)));
  }
  return response;
}

export function classifyAiError(error: unknown): { code: AiErrorCode; status: number; detail: string } {
  const detail = getMessage(error);
  const normalized = detail.toLowerCase();

  if (normalized.includes("401") || normalized.includes("403") || normalized.includes("unauthorized") || normalized.includes("api key")) {
    return { code: "auth", status: 502, detail };
  }

  if (normalized.includes("429") || normalized.includes("rate limit") || normalized.includes("quota")) {
    return { code: "quota", status: 429, detail };
  }

  if (normalized.includes("timeout") || normalized.includes("timed out") || normalized.includes("abort")) {
    return { code: "timeout", status: 504, detail };
  }

  if (normalized.includes("json") || normalized.includes("parse") || normalized.includes("malformed")) {
    return { code: "malformed_response", status: 502, detail };
  }

  if (normalized.includes("safety") || normalized.includes("refus")) {
    return { code: "safety_refusal", status: 502, detail };
  }

  if (normalized.includes("failed")) {
    return { code: "upstream", status: 502, detail };
  }

  return { code: "unknown", status: 500, detail };
}

export function aiValidationError(
  requestId: string,
  message: string,
  status = 400,
) {
  return createAiResponse(
    requestId,
    {
      error: message,
      requestId,
    },
    status,
  );
}

export function aiSuccess<T extends object>(
  requestId: string,
  payload: T,
  status = 200,
  access?: AiRouteAccessContext,
) {
  return createAiResponse(
    requestId,
    {
      requestId,
      ...payload,
    },
    status,
    access,
  );
}

export function aiErrorResponse(
  requestId: string,
  fallbackMessage: string,
  error: unknown,
  access?: AiRouteAccessContext,
) {
  const classified = classifyAiError(error);
  return createAiResponse(
    requestId,
    {
      error: fallbackMessage,
      detail: classified.detail,
      code: classified.code,
      requestId,
    },
    classified.status,
    access,
  );
}

export function logAiRoute(
  routeName: string,
  requestId: string,
  status: "success" | "error",
  details: Record<string, unknown>,
) {
  const logger = status === "success" ? console.info : console.warn;
  logger(
    JSON.stringify({
      scope: "ai.route",
      route: routeName,
      requestId,
      status,
      ...details,
    }),
  );
}
