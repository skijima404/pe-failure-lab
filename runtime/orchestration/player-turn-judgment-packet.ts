import type { RoomState } from "../state/types.ts";
import type { PlayerTurnJudgmentPacket } from "../sidecars/types.ts";

function recentTranscriptSlice(roomState: RoomState, maxTurns = 4): PlayerTurnJudgmentPacket["recent_transcript"] {
  return roomState.recent_transcript.slice(-maxTurns).map((turn) => ({
    turn_index: turn.turn_index,
    speaker_id: turn.speaker_id,
    speaker_name: turn.speaker_name,
    text: turn.text,
  }));
}

function extractResolvedTopics(roomState: RoomState): string[] {
  const parkedTopics = roomState.parking_lot.map((topic) => topic.label);
  const resolvedActiveTopic = roomState.topic_status === "resolved-enough" ? [roomState.active_topic.label] : [];

  return [...new Set([...parkedTopics, ...resolvedActiveTopic])];
}

export function buildPlayerTurnJudgmentPacket(
  roomState: RoomState,
  playerUtterance: string,
): PlayerTurnJudgmentPacket {
  return {
    packet_kind: "player-turn-judgment",
    packet_id: `${roomState.session_id}:judgment:${roomState.turn_index + 1}`,
    session_id: roomState.session_id,
    built_at_turn: roomState.turn_index + 1,
    language: roomState.language,
    active_topic_label: roomState.active_topic.label,
    active_topic_type: roomState.active_topic.topic_type,
    current_meeting_layer: roomState.main_session_judgment.meeting_layer,
    resolved_topics: extractResolvedTopics(roomState),
    visible_risks: [...roomState.structural_state.open_risks],
    recent_transcript: recentTranscriptSlice(roomState),
    player_utterance: playerUtterance,
  };
}
