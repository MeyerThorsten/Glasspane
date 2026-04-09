export function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

export function sseResponse(events: string[]) {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      start(controller) {
        for (const event of events) {
          controller.enqueue(encoder.encode(event));
        }
        controller.close();
      },
    }),
    {
      status: 200,
      headers: {
        "content-type": "text/event-stream",
      },
    },
  );
}

export function withMockFetch(handler: typeof fetch) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = handler;

  return () => {
    globalThis.fetch = originalFetch;
  };
}

export function withEnv(overrides: Record<string, string | undefined>) {
  const snapshot: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(overrides)) {
    snapshot[key] = process.env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return () => {
    for (const [key, value] of Object.entries(snapshot)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };
}

export async function collectStream(iterable: AsyncIterable<string>) {
  const chunks: string[] = [];

  for await (const chunk of iterable) {
    chunks.push(chunk);
  }

  return chunks;
}
