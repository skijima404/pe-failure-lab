import type { ParticipantState, RoomState } from "../state/types.ts";
import type { MeetingLayer, PlayerUtteranceType, RiskSidecarPacket, WhisperSidecarPacket } from "./types.ts";
import { analyzePlayerTurn } from "../orchestration/player-turn-analysis.ts";

function stakeholderParticipantIds(roomState: RoomState): string[] {
  return roomState.participant_states
    .filter((participant) => participant.role_type === "stakeholder")
    .map((participant) => participant.participant_id);
}

function recentTranscriptSlice(roomState: RoomState, maxTurns = 4): WhisperSidecarPacket["recent_transcript"] {
  return roomState.recent_transcript.slice(-maxTurns).map((turn) => ({
    turn_index: turn.turn_index,
    speaker_id: turn.speaker_id,
    speaker_name: turn.speaker_name,
    text: turn.text,
  }));
}

function isStakeholder(participant: ParticipantState): boolean {
  return participant.role_type === "stakeholder";
}

function extractResolvedTopics(roomState: RoomState): string[] {
  const parkedTopics = roomState.parking_lot.map((topic) => topic.label);
  const resolvedActiveTopic = roomState.topic_status === "resolved-enough" ? [roomState.active_topic.label] : [];

  return [...new Set([...parkedTopics, ...resolvedActiveTopic])];
}

function looksLikeDecision(text: string): boolean {
  return /we should|we will|start with|first move|next step|owner|decision|v0\.1|standardizing|not taking over/i.test(text);
}

function extractDecisionsMade(roomState: RoomState): string[] {
  return roomState.recent_transcript
    .filter((turn) => looksLikeDecision(turn.text))
    .slice(-3)
    .map((turn) => turn.text);
}

function buildBasePacket(roomState: RoomState, playerUtterance: string) {
  const fallbackJudgment = analyzePlayerTurn(roomState, playerUtterance);
  const utteranceType = roomState.main_session_judgment.last_player_utterance_type ?? fallbackJudgment.utterance_type;
  return {
    packet_id: `${roomState.session_id}:${roomState.turn_index + 1}`,
    session_id: roomState.session_id,
    built_at_turn: roomState.turn_index + 1,
    active_topic_label: roomState.active_topic.label,
    active_topic_type: roomState.active_topic.topic_type,
    meeting_layer: roomState.main_session_judgment.meeting_layer,
    resolved_topics: extractResolvedTopics(roomState),
    decisions_made: extractDecisionsMade(roomState),
    visible_risks: [...roomState.structural_state.open_risks],
    player_utterance: playerUtterance,
    player_utterance_type: utteranceType,
    player_intent: roomState.main_session_judgment.last_player_intent ?? fallbackJudgment.player_intent,
    multi_perspective_needed: roomState.main_session_judgment.multi_perspective_needed ?? fallbackJudgment.multi_perspective_needed,
    recent_transcript: recentTranscriptSlice(roomState),
  };
}

export function buildWhisperSidecarPacket(roomState: RoomState, playerUtterance: string): WhisperSidecarPacket {
  return {
    packet_kind: "whisper-sidecar",
    ...buildBasePacket(roomState, playerUtterance),
    target_participant_ids: roomState.participant_states.filter(isStakeholder).map((participant) => participant.participant_id),
  };
}

export function buildRiskSidecarPacket(roomState: RoomState, playerUtterance: string): RiskSidecarPacket {
  return {
    packet_kind: "risk-sidecar",
    ...buildBasePacket(roomState, playerUtterance),
  };
}

export function buildWhisperTargetParticipantIds(roomState: RoomState): string[] {
  return stakeholderParticipantIds(roomState);
}
