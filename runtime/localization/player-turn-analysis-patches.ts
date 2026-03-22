import type { MeetingLayer, PlayerUtteranceType } from "../sidecars/types.ts";

interface PlayerTurnAnalysisPatchResult {
  utterance_type?: PlayerUtteranceType;
  meeting_layer?: MeetingLayer;
  player_intent?: string;
  multi_perspective_needed?: boolean;
}

function japanesePlayerTurnPatch(text: string): PlayerTurnAnalysisPatchResult {
  const normalized = text.toLowerCase();

  if (/きっかけ|トリガー|なぜ始ま|なぜこの流れ|大元のissue|大元の課題/.test(text)) {
    return {
      utterance_type: text.includes("か") || text.includes("？") || text.includes("?") ? "question" : "clarification",
      meeting_layer: "why",
      player_intent: "request-trigger-alignment",
    };
  }

  if (/確認しませんか|確認したい|確認したく|確認です/.test(text)) {
    return {
      utterance_type: "confirmation",
    };
  }

  if (/いかがでしょうか|どうでしょうか|しませんか|してはどう|を勧める/.test(text)) {
    return {
      utterance_type: "proposal",
      multi_perspective_needed: true,
    };
  }

  if (/問題設定|issue|課題/.test(normalized) && /どうやる|how|ではない/.test(normalized)) {
    return {
      utterance_type: "correction",
      meeting_layer: "why",
      player_intent: "reframe-the-issue",
      multi_perspective_needed: true,
    };
  }

  if (/どうやって|どう実装|どう進め|ロールアウト|導入/.test(text)) {
    return {
      utterance_type: text.includes("か") || text.includes("？") || text.includes("?") ? "question" : undefined,
      meeting_layer: "how",
    };
  }

  if (/まずは|最初は|v0\.1|最小機能|スコープ案|標準化|DevOps/.test(text)) {
    return {
      utterance_type: "proposal",
      meeting_layer: "what",
      player_intent: "propose-bounded-first-move",
      multi_perspective_needed: true,
    };
  }

  return {};
}

export function analyzeLocalizedPlayerTurn(text: string, language: string): PlayerTurnAnalysisPatchResult {
  if (language.startsWith("ja")) {
    return japanesePlayerTurnPatch(text);
  }

  return {};
}
