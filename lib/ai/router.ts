import { getAiConfig } from "./config";
import { getAiProviderLabel } from "./provider-label";
import { getProviderClient } from "./providers";
import type { AiProvider, AiTask, AiTextRequest } from "./providers/types";
import { streamTextChunks } from "./sse";

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
  text: string;
}

export interface AiTaskStreamExecutionResult {
  provider: AiProvider;
  providerLabel: string;
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

export async function executeTextForTask(
  task: AiTask,
  request: Omit<AiTextRequest, "task">,
): Promise<AiTaskExecutionResult> {
  const errors: string[] = [];

  for (const provider of getProviderChain(task)) {
    const startedAt = Date.now();
    try {
      const text = await getProviderClient(provider).generateText({
        task,
        ...request,
      });
      console.info(JSON.stringify({
        scope: "ai.provider",
        task,
        provider,
        status: "success",
        durationMs: Date.now() - startedAt,
      }));
      return {
        provider,
        providerLabel: getAiProviderLabel(provider),
        text,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(JSON.stringify({
        scope: "ai.provider",
        task,
        provider,
        status: "error",
        durationMs: Date.now() - startedAt,
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

  for (const provider of getProviderChain(task)) {
    const startedAt = Date.now();
    try {
      const client = getProviderClient(provider);
      const stream = client.streamText
        ? client.streamText({ task, ...request })
        : streamTextChunks(await client.generateText({ task, ...request }));
      const iterator = stream[Symbol.asyncIterator]();

      while (true) {
        const firstChunk = await iterator.next();

        if (firstChunk.done) {
          console.info(JSON.stringify({
            scope: "ai.provider",
            task,
            provider,
            mode: "stream",
            status: "success",
            durationMs: Date.now() - startedAt,
            chunks: 0,
          }));
          return {
            provider,
            providerLabel: getAiProviderLabel(provider),
            stream: emptyStream(),
          };
        }

        if (!firstChunk.value) {
          continue;
        }

        console.info(JSON.stringify({
          scope: "ai.provider",
          task,
          provider,
          mode: "stream",
          status: "ready",
          durationMs: Date.now() - startedAt,
        }));
        return {
          provider,
          providerLabel: getAiProviderLabel(provider),
          stream: withLeadingChunk(iterator, firstChunk.value),
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(JSON.stringify({
        scope: "ai.provider",
        task,
        provider,
        mode: "stream",
        status: "error",
        durationMs: Date.now() - startedAt,
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
