import test from "node:test";
import assert from "node:assert/strict";
import { extractFirstJsonObject } from "../../lib/ai/extract-json-object.ts";

test("extractFirstJsonObject returns the first balanced object from prose", () => {
  const raw = 'Here is the result:\n{"summary":"ok","nested":{"count":2}}\nThanks.';

  assert.equal(
    extractFirstJsonObject(raw),
    '{"summary":"ok","nested":{"count":2}}',
  );
});

test("extractFirstJsonObject handles fenced json blocks", () => {
  const raw = [
    "The model responded with:",
    "```json",
    '{ "items": [{"id":"1"}] }',
    "```",
  ].join("\n");

  assert.equal(
    extractFirstJsonObject(raw),
    '{ "items": [{"id":"1"}] }',
  );
});
