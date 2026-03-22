import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { RuntimePlayerInitialization } from "../state/types.ts";

const PLAYER_INITIALIZATION_PATH = "docs/product/concepts/runtime/mvp-player-initialization.md";

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

export function loadDefaultPlayerInitialization(): RuntimePlayerInitialization {
  const content = readFileSync(resolve(PLAYER_INITIALIZATION_PATH), "utf8");
  const lines = content.split("\n");

  return {
    session_purpose: parseScalar(lines, "session_purpose"),
    player_goal: parseScalar(lines, "player_goal"),
    player_should_expect: parseList(lines, "player_should_expect"),
    player_allowed_moves: parseList(lines, "player_allowed_moves"),
    player_not_expected_to_know: parseList(lines, "player_not_expected_to_know"),
    optional_setup_question_example: parseScalar(lines, "optional_setup_question_example"),
    start_signal_examples: parseList(lines, "start_signal_examples"),
    opening_move_guidance: parseScalar(lines, "opening_move_guidance"),
  };
}
