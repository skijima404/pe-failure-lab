import type { RoomState } from "../state/types.ts";
import type { MeetingLayer, PlayerTurnJudgmentPacket, PlayerTurnJudgmentResult, PlayerUtteranceType } from "../sidecars/types.ts";
import {
  classifyPlayerUtteranceHeuristically,
  inferMeetingLayerHeuristically,
  inferMultiPerspectiveNeededHeuristically,
  inferPlayerIntentHeuristically,
} from "./heuristic-player-turn-judger.ts";
import { buildPlayerTurnJudgmentPacket } from "./player-turn-judgment-packet.ts";
import { judgePlayerTurnLocally } from "./local-player-turn-judger.ts";

export interface PlayerTurnJudgment {
  meeting_layer: MeetingLayer;
  utterance_type: PlayerUtteranceType;
  player_intent: string;
  multi_perspective_needed: boolean;
}

export interface PlayerTurnJudger {
  judgePlayerTurn(packet: PlayerTurnJudgmentPacket): PlayerTurnJudgmentResult;
}

const defaultPlayerTurnJudger: PlayerTurnJudger = {
  judgePlayerTurn(packet) {
    return judgePlayerTurnLocally(packet);
  },
};

export function analyzePlayerTurn(
  roomState: RoomState,
  playerText: string,
  judger: PlayerTurnJudger = defaultPlayerTurnJudger,
): PlayerTurnJudgment {
  const packet = buildPlayerTurnJudgmentPacket(roomState, playerText);
  const result = judger.judgePlayerTurn(packet);

  return {
    meeting_layer: result.meeting_layer,
    utterance_type: result.utterance_type,
    player_intent: result.player_intent,
    multi_perspective_needed: result.multi_perspective_needed,
  };
}

// Compatibility wrappers. Keep callers on the boundary file while the default judger remains heuristic.
export function classifyPlayerUtterance(text: string, language = "en"): PlayerUtteranceType {
  return classifyPlayerUtteranceHeuristically(text, language);
}

export function inferMeetingLayer(roomState: RoomState, playerText: string): MeetingLayer {
  return inferMeetingLayerHeuristically(roomState, playerText);
}

export function inferPlayerIntent(playerText: string, utteranceType: PlayerUtteranceType, language = "en"): string {
  return inferPlayerIntentHeuristically(playerText, utteranceType, language);
}

export function inferMultiPerspectiveNeeded(
  playerText: string,
  utteranceType: PlayerUtteranceType,
  language = "en",
): boolean {
  return inferMultiPerspectiveNeededHeuristically(playerText, utteranceType, language);
}
