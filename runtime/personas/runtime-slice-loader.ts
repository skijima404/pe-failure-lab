import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { RuntimePersonaSlice } from "../state/types.ts";

const PERSONA_SLICE_PATHS: Record<string, string> = {
  mika: "docs/product/personas/runtime/facilitator-runtime.md",
  exec: "docs/product/personas/runtime/executive-stakeholder-runtime.md",
  platform: "docs/product/personas/runtime/platform-side-stakeholder-runtime.md",
  delivery: "docs/product/personas/runtime/new-product-tech-lead-runtime.md",
  legacy: "docs/product/personas/runtime/legacy-app-side-stakeholder-runtime.md",
};

function stripInlineCode(value: string): string {
  return value.replace(/`/g, "").trim();
}

function parseScalar(lines: string[], key: string): string {
  const prefix = `- ${key}:`;
  const line = lines.find((candidate) => candidate.startsWith(prefix));
  return line ? stripInlineCode(line.slice(prefix.length)) : "";
}

function parseList(lines: string[], key: string): string[] {
  const prefix = `- ${key}:`;
  const startIndex = lines.findIndex((candidate) => candidate.startsWith(prefix));
  if (startIndex === -1) {
    return [];
  }

  const values: string[] = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith("- ") && !line.startsWith("  - ")) {
      break;
    }
    if (line.startsWith("  - ")) {
      values.push(stripInlineCode(line.slice(4)));
    }
  }

  return values;
}

function parseRuntimeSliceFile(personaId: string, relativePath: string): RuntimePersonaSlice {
  const fullPath = resolve(relativePath);
  const content = readFileSync(fullPath, "utf8");
  const lines = content.split("\n");

  return {
    persona_id: personaId,
    source_path: relativePath,
    display_name: parseScalar(lines, "display_name"),
    role_label: parseScalar(lines, "role_label"),
    core_concern: parseScalar(lines, "core_concern"),
    typical_bias: parseScalar(lines, "typical_bias"),
    escalation_trigger: parseScalar(lines, "escalation_trigger"),
    cooperation_condition: parseScalar(lines, "cooperation_condition"),
    working_context: parseScalar(lines, "working_context"),
    day_to_day_pressure: parseScalar(lines, "day_to_day_pressure"),
    protection_target: parseScalar(lines, "protection_target"),
    relationship_to_change: parseScalar(lines, "relationship_to_change"),
    voice_cues: parseList(lines, "voice_cues"),
    do_not_overdo: parseList(lines, "do_not_overdo"),
  };
}

export function loadRuntimePersonaSlice(personaId: string): RuntimePersonaSlice | null {
  const relativePath = PERSONA_SLICE_PATHS[personaId];
  if (!relativePath) {
    return null;
  }

  return parseRuntimeSliceFile(personaId, relativePath);
}

export function loadDefaultRuntimePersonaSlices(): Record<string, RuntimePersonaSlice> {
  return Object.fromEntries(
    Object.entries(PERSONA_SLICE_PATHS).map(([personaId, relativePath]) => [
      personaId,
      parseRuntimeSliceFile(personaId, relativePath),
    ]),
  );
}
