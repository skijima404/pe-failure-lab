import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { RuntimeSceneSetup } from "../state/types.ts";

const SCENE_SETUP_PATH = "docs/product/concepts/runtime/mvp-scene-setup.md";

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

export function loadDefaultSceneSetup(): RuntimeSceneSetup {
  const content = readFileSync(resolve(SCENE_SETUP_PATH), "utf8");
  const lines = content.split("\n");

  return {
    scenario: parseScalar(lines, "scenario"),
    session_mode: parseScalar(lines, "session_mode"),
    meeting_goal: parseScalar(lines, "meeting_goal"),
    active_topic_seed: parseScalar(lines, "active_topic_seed"),
    facilitator_opening_frame: parseScalar(lines, "facilitator_opening_frame"),
    player_start_expectation: parseScalar(lines, "player_start_expectation"),
    enterprise_context_summary: parseList(lines, "enterprise_context_summary"),
  };
}
