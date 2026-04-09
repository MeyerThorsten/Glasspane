import test from "node:test";
import assert from "node:assert/strict";
import { chunkText, parseSseEventBlock, readSseEvents } from "../../lib/ai/sse.ts";

test("parseSseEventBlock parses event and multi-line data payloads", () => {
  const event = parseSseEventBlock([
    "event: delta",
    "data: {\"text\":\"Hello\"}",
    "data: world",
    "",
  ].join("\n"));

  assert.deepEqual(event, {
    event: "delta",
    data: "{\"text\":\"Hello\"}\nworld",
  });
});

test("readSseEvents reads multiple events across chunk boundaries", async () => {
  const encoder = new TextEncoder();
  const chunks = [
    encoder.encode("event: meta\ndata: {\"providerLabel\":\"OpenAI\"}\n\n"),
    encoder.encode("event: delta\ndata: {\"text\":\"Hello\"}\n\n"),
    encoder.encode("event: done\ndata: {}\n\n"),
  ];

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

  const events = [];
  for await (const event of readSseEvents(stream)) {
    events.push(event);
  }

  assert.deepEqual(events, [
    { event: "meta", data: '{"providerLabel":"OpenAI"}' },
    { event: "delta", data: '{"text":"Hello"}' },
    { event: "done", data: "{}" },
  ]);
});

test("chunkText keeps word boundaries when possible", () => {
  assert.deepEqual(
    chunkText("alpha beta gamma delta", 11),
    ["alpha beta ", "gamma delta"],
  );
});
