import type { ModelAdapter } from "../execution/runtime-responder.ts";
import type { PlayerTurnJudgmentPacket, PlayerTurnJudgmentResult } from "../sidecars/types.ts";
import { judgePlayerTurnLocally } from "./local-player-turn-judger.ts";

export interface AsyncPlayerTurnJudger {
  judgePlayerTurn(packet: PlayerTurnJudgmentPacket): Promise<PlayerTurnJudgmentResult> | PlayerTurnJudgmentResult;
}

export class AdapterBackedPlayerTurnJudger implements AsyncPlayerTurnJudger {
  private readonly adapter: ModelAdapter;

  constructor(adapter: ModelAdapter) {
    this.adapter = adapter;
  }

  async judgePlayerTurn(packet: PlayerTurnJudgmentPacket): Promise<PlayerTurnJudgmentResult> {
    const fallback = judgePlayerTurnLocally(packet);
    const response = await this.adapter.generate({
      session_id: packet.session_id,
      speaker_id: "player-turn-judger",
      turn_owner: "player",
      selection_reason: "player-turn-judgment",
      prompt_input: packet,
      prompt_text: buildJudgmentPrompt(packet),
    });

    return parseJudgmentResponse(response.text, fallback);
  }
}

function buildJudgmentPrompt(packet: PlayerTurnJudgmentPacket): string {
  return [
    "You are a runtime judgment worker.",
    "Read the player turn in context and return only one JSON object.",
    'Valid utterance_type values: "question", "confirmation", "proposal", "objection", "correction", "clarification".',
    'Valid meeting_layer values: "why", "what", "how".',
    "Return this JSON shape exactly:",
    '{"utterance_type":"question","meeting_layer":"why","player_intent":"request-trigger-alignment","multi_perspective_needed":false}',
    "Do not add markdown fences or any explanation.",
    "",
    JSON.stringify(packet, null, 2),
  ].join("\n");
}

function parseJudgmentResponse(text: string, fallback: PlayerTurnJudgmentResult): PlayerTurnJudgmentResult {
  const parsed = tryParseJsonObject(text);
  if (!parsed) {
    return fallback;
  }

  const utteranceType = normalizeEnum(parsed.utterance_type, [
    "question",
    "confirmation",
    "proposal",
    "objection",
    "correction",
    "clarification",
  ]);
  const meetingLayer = normalizeEnum(parsed.meeting_layer, ["why", "what", "how"]);
  const playerIntent = typeof parsed.player_intent === "string" && parsed.player_intent.trim() ? parsed.player_intent.trim() : null;
  const multiPerspectiveNeeded = typeof parsed.multi_perspective_needed === "boolean" ? parsed.multi_perspective_needed : null;

  if (!utteranceType || !meetingLayer || !playerIntent || multiPerspectiveNeeded === null) {
    return fallback;
  }

  return {
    packet_id: fallback.packet_id,
    utterance_type: utteranceType,
    meeting_layer: meetingLayer,
    player_intent: playerIntent,
    multi_perspective_needed: multiPerspectiveNeeded,
  };
}

function tryParseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();

  for (const candidate of [trimmed, extractFirstJsonObject(trimmed)]) {
    if (!candidate) {
      continue;
    }

    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {}
  }

  return null;
}

function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return text.slice(start, end + 1);
}

function normalizeEnum<T extends string>(value: unknown, allowed: T[]): T | null {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : null;
}
