export interface SseEvent {
  event: string;
  data: string;
  id?: string;
}

export function encodeSseEvent(event: string, payload: unknown): string {
  const data = typeof payload === "string" ? payload : JSON.stringify(payload);
  const lines = data.split("\n").map((line) => `data: ${line}`).join("\n");
  return `event: ${event}\n${lines}\n\n`;
}

export function parseSseEventBlock(block: string): SseEvent | null {
  const normalized = block.replace(/\r/g, "").trim();

  if (!normalized) {
    return null;
  }

  let event = "message";
  let id: string | undefined;
  const dataLines: string[] = [];

  for (const line of normalized.split("\n")) {
    if (!line || line.startsWith(":")) {
      continue;
    }

    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim() || "message";
      continue;
    }

    if (line.startsWith("id:")) {
      id = line.slice("id:".length).trim() || undefined;
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trimStart());
    }
  }

  if (dataLines.length === 0) {
    return null;
  }

  return {
    event,
    data: dataLines.join("\n"),
    ...(id ? { id } : {}),
  };
}

export async function* readSseEvents(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<SseEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done }).replace(/\r/g, "");

      let separatorIndex = buffer.indexOf("\n\n");
      while (separatorIndex >= 0) {
        const event = parseSseEventBlock(buffer.slice(0, separatorIndex));
        if (event) {
          yield event;
        }
        buffer = buffer.slice(separatorIndex + 2);
        separatorIndex = buffer.indexOf("\n\n");
      }

      if (done) {
        break;
      }
    }

    const trailingEvent = parseSseEventBlock(buffer);
    if (trailingEvent) {
      yield trailingEvent;
    }
  } finally {
    reader.releaseLock();
  }
}

export function chunkText(text: string, maxChunkSize = 64): string[] {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }

  const tokens = trimmed.match(/\S+\s*/g) ?? [trimmed];
  const chunks: string[] = [];
  let current = "";

  for (const token of tokens) {
    if (token.length > maxChunkSize) {
      if (current) {
        chunks.push(current);
        current = "";
      }

      for (let index = 0; index < token.length; index += maxChunkSize) {
        chunks.push(token.slice(index, index + maxChunkSize));
      }
      continue;
    }

    if (current && current.length + token.length > maxChunkSize) {
      chunks.push(current);
      current = token;
      continue;
    }

    current += token;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

export async function* streamTextChunks(
  text: string,
  maxChunkSize = 64,
): AsyncGenerator<string> {
  for (const chunk of chunkText(text, maxChunkSize)) {
    yield chunk;
  }
}
