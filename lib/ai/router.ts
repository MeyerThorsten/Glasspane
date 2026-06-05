import { getAiConfig } from "./config";
import { getAiProviderLabel } from "./provider-label";
import { getProviderClient } from "./providers";
import type { AiProvider, AiTask, AiTextRequest } from "./providers/types";
import { streamTextChunks } from "./sse";
import { getAiModelInfo, recordAiModelEvent } from "./model-telemetry";
import type { AiModelInfo } from "@/types";

function uniqueProviders(providers: AiProvider[]): AiProvider[] {
  return providers.filter((provider, index) => providers.indexOf(provider) === index);
}

function getProviderChain(task: AiTask): AiProvider[] {
  const config = getAiConfig();
  const taskConfig = config.tasks[task];
  return uniqueProviders([taskConfig.primary, ...taskConfig.fallbacks]);
}

export function getPrimaryProviderForTask(task: AiTask): AiProvider {
  return getProviderChain(task)[0];
}

export function getProviderLabelForTask(task: AiTask): string {
  return getAiProviderLabel(getPrimaryProviderForTask(task));
}

export interface AiTaskExecutionResult {
  provider: AiProvider;
  providerLabel: string;
  modelInfo: AiModelInfo;
  text: string;
}

export interface AiTaskStreamExecutionResult {
  provider: AiProvider;
  providerLabel: string;
  modelInfo: AiModelInfo;
  stream: AsyncIterable<string>;
}

function withLeadingChunk(
  iterator: AsyncIterator<string>,
  firstChunk: string,
): AsyncIterable<string> {
  return {
    async *[Symbol.asyncIterator]() {
      yield firstChunk;

      while (true) {
        const next = await iterator.next();
        if (next.done) {
          return;
        }

        if (next.value) {
          yield next.value;
        }
      }
    },
  };
}

function emptyStream(): AsyncIterable<string> {
  return {
    async *[Symbol.asyncIterator]() {},
  };
}

async function recordModelEventSafely(
  event: Parameters<typeof recordAiModelEvent>[0],
): Promise<void> {
  try {
    await recordAiModelEvent(event);
  } catch (error) {
    console.warn(JSON.stringify({
      scope: "ai.model-telemetry",
      status: "error",
      detail: error instanceof Error ? error.message : String(error),
    }));
  }
}

export async function executeTextForTask(
  task: AiTask,
  request: Omit<AiTextRequest, "task">,
): Promise<AiTaskExecutionResult> {
  const errors: string[] = [];
  const chain = getProviderChain(task);

  for (const [index, provider] of chain.entries()) {
    const startedAt = Date.now();
    const modelInfo = getAiModelInfo(task, provider);
    try {
      const text = await getProviderClient(provider).generateText({
        task,
        ...request,
      });
      const durationMs = Date.now() - startedAt;
      const servedAt = new Date().toISOString();
      const resultModelInfo = {
        ...modelInfo,
        latencyMs: durationMs,
        fallbackCount: errors.length,
        servedAt,
      };
      await recordModelEventSafely({
        ...resultModelInfo,
        status: "success",
      });
      console.info(JSON.stringify({
        scope: "ai.provider",
        task,
        provider,
        model: modelInfo.model,
        version: modelInfo.version,
        status: "success",
        durationMs,
        fallbackCount: errors.length,
      }));
      return {
        provider,
        providerLabel: getAiProviderLabel(provider),
        modelInfo: resultModelInfo,
        text,
      };
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const message = error instanceof Error ? error.message : String(error);
      await recordModelEventSafely({
        ...modelInfo,
        latencyMs: durationMs,
        fallbackCount: errors.length,
        servedAt: new Date().toISOString(),
        status: "error",
        error: message,
        fallbackTo: chain[index + 1],
      });
      console.warn(JSON.stringify({
        scope: "ai.provider",
        task,
        provider,
        model: modelInfo.model,
        version: modelInfo.version,
        status: "error",
        durationMs,
        fallbackTo: chain[index + 1],
        detail: message,
      }));
      errors.push(`[${provider}] ${message}`);
    }
  }

  throw new Error(`All AI providers failed for task "${task}": ${errors.join(" | ")}`);
}

export async function executeTextStreamForTask(
  task: AiTask,
  request: Omit<AiTextRequest, "task">,
): Promise<AiTaskStreamExecutionResult> {
  const errors: string[] = [];
  const chain = getProviderChain(task);

  for (const [index, provider] of chain.entries()) {
    const startedAt = Date.now();
    const modelInfo = getAiModelInfo(task, provider);
    try {
      const client = getProviderClient(provider);
      const stream = client.streamText
        ? client.streamText({ task, ...request })
        : streamTextChunks(await client.generateText({ task, ...request }));
      const iterator = stream[Symbol.asyncIterator]();

      while (true) {
        const firstChunk = await iterator.next();

        if (firstChunk.done) {
          const durationMs = Date.now() - startedAt;
          const servedAt = new Date().toISOString();
          const resultModelInfo = {
            ...modelInfo,
            latencyMs: durationMs,
            fallbackCount: errors.length,
            servedAt,
          };
          await recordModelEventSafely({
            ...resultModelInfo,
            status: "success",
          });
          console.info(JSON.stringify({
            scope: "ai.provider",
            task,
            provider,
            model: modelInfo.model,
            version: modelInfo.version,
            mode: "stream",
            status: "success",
            durationMs,
            fallbackCount: errors.length,
            chunks: 0,
          }));
          return {
            provider,
            providerLabel: getAiProviderLabel(provider),
            modelInfo: resultModelInfo,
            stream: emptyStream(),
          };
        }

        if (!firstChunk.value) {
          continue;
        }

        const durationMs = Date.now() - startedAt;
        const servedAt = new Date().toISOString();
        const resultModelInfo = {
          ...modelInfo,
          latencyMs: durationMs,
          fallbackCount: errors.length,
          servedAt,
        };
        await recordModelEventSafely({
          ...resultModelInfo,
          status: "success",
        });
        console.info(JSON.stringify({
          scope: "ai.provider",
          task,
          provider,
          model: modelInfo.model,
          version: modelInfo.version,
          mode: "stream",
          status: "ready",
          durationMs,
          fallbackCount: errors.length,
        }));
        return {
          provider,
          providerLabel: getAiProviderLabel(provider),
          modelInfo: resultModelInfo,
          stream: withLeadingChunk(iterator, firstChunk.value),
        };
      }
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const message = error instanceof Error ? error.message : String(error);
      await recordModelEventSafely({
        ...modelInfo,
        latencyMs: durationMs,
        fallbackCount: errors.length,
        servedAt: new Date().toISOString(),
        status: "error",
        error: message,
        fallbackTo: chain[index + 1],
      });
      console.warn(JSON.stringify({
        scope: "ai.provider",
        task,
        provider,
        model: modelInfo.model,
        version: modelInfo.version,
        mode: "stream",
        status: "error",
        durationMs,
        fallbackTo: chain[index + 1],
        detail: message,
      }));
      errors.push(`[${provider}] ${message}`);
    }
  }

  throw new Error(`All AI providers failed for task "${task}": ${errors.join(" | ")}`);
}

export async function generateTextForTask(
  task: AiTask,
  request: Omit<AiTextRequest, "task">,
): Promise<string> {
  const result = await executeTextForTask(task, request);
  return result.text;
}
