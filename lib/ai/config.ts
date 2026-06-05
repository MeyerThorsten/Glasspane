import type { AiProvider, AiTask } from "./providers/types";

export interface AiTaskConfig {
  primary: AiProvider;
  fallbacks: AiProvider[];
}

export interface AiConfig {
  defaultProvider: AiProvider;
  tasks: Record<AiTask, AiTaskConfig>;
  models: Record<AiTask, string>;
  watsonx: {
    apiKey: string;
    projectId: string;
    region: string;
    modelId: string;
  };
  openrouter: {
    apiKey: string;
    baseUrl: string;
    modelId: string;
    siteUrl: string;
    appName: string;
  };
  lmStudio: {
    baseUrl: string;
    modelId: string;
    apiKey: string;
  };
  ollama: {
    baseUrl: string;
    modelId: string;
    apiKey: string;
  };
  openai: {
    apiKey: string;
    baseUrl: string;
    modelId: string;
  };
  anthropic: {
    apiKey: string;
    baseUrl: string;
    modelId: string;
    version: string;
  };
  gemini: {
    apiKey: string;
    baseUrl: string;
    modelId: string;
  };
  bedrock: {
    apiKey: string;
    baseUrl: string;
    modelId: string;
    region: string;
  };
}

const SUPPORTED_PROVIDERS: AiProvider[] = [
  "mock",
  "watsonx",
  "openrouter",
  "lm-studio",
  "ollama",
  "openai",
  "anthropic",
  "gemini",
  "bedrock",
];

const AI_TASKS: AiTask[] = [
  "summary",
  "chat",
  "insights",
  "risk-briefing",
  "sla-risk",
  "cost-forecast",
  "capacity-planner",
  "root-cause-patterns",
  "change-impact",
  "workforce-growth",
];
const TASK_ENV_PREFIX: Record<AiTask, string> = {
  summary: "SUMMARY",
  chat: "CHAT",
  insights: "INSIGHTS",
  "risk-briefing": "RISK_BRIEFING",
  "sla-risk": "SLA_RISK",
  "cost-forecast": "COST_FORECAST",
  "capacity-planner": "CAPACITY_PLANNER",
  "root-cause-patterns": "ROOT_CAUSE_PATTERNS",
  "change-impact": "CHANGE_IMPACT",
  "workforce-growth": "WORKFORCE_GROWTH",
};

function isAiProvider(value: string | undefined): value is AiProvider {
  return !!value && SUPPORTED_PROVIDERS.includes(value as AiProvider);
}

function resolveProvider(value: string | undefined, fallback: AiProvider): AiProvider {
  return isAiProvider(value) ? value : fallback;
}

function parseProviderList(value: string | undefined): AiProvider[] {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(isAiProvider)
    .filter((item, index, list) => list.indexOf(item) === index);
}

export function getTaskEnvPrefix(task: AiTask): string {
  return TASK_ENV_PREFIX[task];
}

function getTaskConfig(task: AiTask, defaultProvider: AiProvider): AiTaskConfig {
  const taskPrefix = getTaskEnvPrefix(task);
  const primary = resolveProvider(process.env[`AI_${taskPrefix}_PROVIDER`], defaultProvider);
  const fallbacks = parseProviderList(
    process.env[`AI_${taskPrefix}_FALLBACKS`] || process.env.AI_FALLBACKS,
  ).filter((provider) => provider !== primary);

  return { primary, fallbacks };
}

export function getAiConfig(): AiConfig {
  const defaultProvider = resolveProvider(process.env.AI_PROVIDER, "mock");
  const tasks = Object.fromEntries(
    AI_TASKS.map((task) => [task, getTaskConfig(task, defaultProvider)]),
  ) as Record<AiTask, AiTaskConfig>;
  const models = Object.fromEntries(
    AI_TASKS.map((task) => [task, process.env[`AI_${getTaskEnvPrefix(task)}_MODEL`] || ""]),
  ) as Record<AiTask, string>;

  return {
    defaultProvider,
    tasks,
    models,
    watsonx: {
      apiKey: process.env.WATSONX_API_KEY || "",
      projectId: process.env.WATSONX_PROJECT_ID || "",
      region: process.env.WATSONX_REGION || "us-south",
      modelId: process.env.WATSONX_MODEL_ID || "ibm/granite-4-h-small",
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || "",
      baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
      modelId: process.env.OPENROUTER_MODEL_ID || "openai/gpt-4o-mini",
      siteUrl: process.env.OPENROUTER_SITE_URL || "",
      appName: process.env.OPENROUTER_APP_NAME || "Glasspane",
    },
    lmStudio: {
      baseUrl: process.env.LM_STUDIO_BASE_URL || "http://127.0.0.1:1234/v1",
      modelId: process.env.LM_STUDIO_MODEL_ID || "",
      apiKey: process.env.LM_STUDIO_API_KEY || "",
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/v1",
      modelId: process.env.OLLAMA_MODEL_ID || "",
      apiKey: process.env.OLLAMA_API_KEY || "",
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      modelId: process.env.OPENAI_MODEL_ID || "gpt-4o-mini",
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
      baseUrl: process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com/v1",
      modelId: process.env.ANTHROPIC_MODEL_ID || "claude-3-5-sonnet-latest",
      version: process.env.ANTHROPIC_VERSION || "2023-06-01",
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || "",
      baseUrl: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta",
      modelId: process.env.GEMINI_MODEL_ID || "gemini-2.5-flash",
    },
    bedrock: {
      apiKey: process.env.BEDROCK_API_KEY || "",
      region: process.env.BEDROCK_REGION || "us-east-1",
      baseUrl:
        process.env.BEDROCK_BASE_URL
        || `https://bedrock-runtime.${process.env.BEDROCK_REGION || "us-east-1"}.amazonaws.com/openai/v1`,
      modelId: process.env.BEDROCK_MODEL_ID || "openai.gpt-oss-20b-1:0",
    },
  };
}

export function getModelForTask(provider: AiProvider, task: AiTask, config = getAiConfig()): string {
  const taskOverride = config.models[task];
  if (taskOverride) {
    return taskOverride;
  }

  switch (provider) {
    case "watsonx":
      return config.watsonx.modelId;
    case "openrouter":
      return config.openrouter.modelId;
    case "lm-studio":
      return config.lmStudio.modelId;
    case "ollama":
      return config.ollama.modelId;
    case "openai":
      return config.openai.modelId;
    case "anthropic":
      return config.anthropic.modelId;
    case "gemini":
      return config.gemini.modelId;
    case "bedrock":
      return config.bedrock.modelId;
    case "mock":
      return process.env.MOCK_MODEL_ID || "glasspane-mock-ai";
    default:
      return "";
  }
}

export function validateAiConfig(config: AiConfig): string[] {
  const errors: string[] = [];
  const hasTaskModelOverride = Object.values(config.models).some(Boolean);
  const configuredProviders = new Set<AiProvider>();

  for (const taskConfig of Object.values(config.tasks)) {
    configuredProviders.add(taskConfig.primary);
    for (const fallback of taskConfig.fallbacks) {
      configuredProviders.add(fallback);
    }
  }

  if (configuredProviders.has("watsonx")) {
    if (!config.watsonx.apiKey) errors.push("WATSONX_API_KEY is required for provider watsonx");
    if (!config.watsonx.projectId) errors.push("WATSONX_PROJECT_ID is required for provider watsonx");
  }

  if (configuredProviders.has("openrouter")) {
    if (!config.openrouter.apiKey) errors.push("OPENROUTER_API_KEY is required for provider openrouter");
    if (!config.openrouter.modelId && !hasTaskModelOverride) {
      errors.push("OPENROUTER_MODEL_ID or task-specific AI_*_MODEL is required for provider openrouter");
    }
  }

  if (configuredProviders.has("lm-studio") && !config.lmStudio.modelId && !hasTaskModelOverride) {
    errors.push("LM_STUDIO_MODEL_ID or task-specific AI_*_MODEL is required for provider lm-studio");
  }

  if (configuredProviders.has("ollama") && !config.ollama.modelId && !hasTaskModelOverride) {
    errors.push("OLLAMA_MODEL_ID or task-specific AI_*_MODEL is required for provider ollama");
  }

  if (configuredProviders.has("openai")) {
    if (!config.openai.apiKey) errors.push("OPENAI_API_KEY is required for provider openai");
    if (!config.openai.modelId && !hasTaskModelOverride) {
      errors.push("OPENAI_MODEL_ID or task-specific AI_*_MODEL is required for provider openai");
    }
  }

  if (configuredProviders.has("anthropic")) {
    if (!config.anthropic.apiKey) errors.push("ANTHROPIC_API_KEY is required for provider anthropic");
    if (!config.anthropic.modelId && !hasTaskModelOverride) {
      errors.push("ANTHROPIC_MODEL_ID or task-specific AI_*_MODEL is required for provider anthropic");
    }
  }

  if (configuredProviders.has("gemini")) {
    if (!config.gemini.apiKey) errors.push("GEMINI_API_KEY is required for provider gemini");
    if (!config.gemini.modelId && !hasTaskModelOverride) {
      errors.push("GEMINI_MODEL_ID or task-specific AI_*_MODEL is required for provider gemini");
    }
  }

  if (configuredProviders.has("bedrock")) {
    if (!config.bedrock.apiKey) errors.push("BEDROCK_API_KEY is required for provider bedrock");
    if (!config.bedrock.modelId && !hasTaskModelOverride) {
      errors.push("BEDROCK_MODEL_ID or task-specific AI_*_MODEL is required for provider bedrock");
    }
  }

  return errors;
}
