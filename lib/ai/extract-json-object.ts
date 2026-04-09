function isEscaped(value: string, index: number): boolean {
  let slashCount = 0;

  for (let cursor = index - 1; cursor >= 0 && value[cursor] === "\\"; cursor -= 1) {
    slashCount += 1;
  }

  return slashCount % 2 === 1;
}

function findBalancedJsonObject(value: string): string | null {
  let depth = 0;
  let startIndex = -1;
  let inString = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (char === "\"" && !isEscaped(value, index)) {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        startIndex = index;
      }
      depth += 1;
      continue;
    }

    if (char === "}") {
      if (depth === 0) {
        continue;
      }

      depth -= 1;
      if (depth === 0 && startIndex >= 0) {
        return value.slice(startIndex, index + 1);
      }
    }
  }

  return null;
}

function isJsonObject(candidate: string): boolean {
  try {
    const parsed = JSON.parse(candidate);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
  } catch {
    return false;
  }
}

export function extractFirstJsonObject(raw: string): string | null {
  const trimmed = raw.trim();
  const candidates = [trimmed];
  const fencedBlocks = raw.match(/```(?:json)?\s*([\s\S]*?)```/gi) ?? [];

  for (const block of fencedBlocks) {
    const content = block
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    if (content) {
      candidates.push(content);
    }
  }

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    if (candidate.startsWith("{") && candidate.endsWith("}") && isJsonObject(candidate)) {
      return candidate;
    }

    const extracted = findBalancedJsonObject(candidate);
    if (extracted && isJsonObject(extracted)) {
      return extracted;
    }
  }

  return null;
}
