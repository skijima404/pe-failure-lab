export type MeetingLayer = "why" | "what" | "how";

export type PlayerUtteranceType =
  | "question"
  | "confirmation"
  | "proposal"
  | "objection"
  | "correction"
  | "clarification";

export interface SidecarContextPacket {
  packet_id: string;
  session_id: string;
  built_at_turn: number;
  active_topic_label: string;
  active_topic_type: string;
  meeting_layer: MeetingLayer;
  resolved_topics: string[];
  decisions_made: string[];
  visible_risks: string[];
  player_utterance: string;
  player_utterance_type: PlayerUtteranceType;
  player_intent: string;
  multi_perspective_needed: boolean;
  recent_transcript: Array<{
    turn_index: number;
    speaker_id: string;
    speaker_name: string;
    text: string;
  }>;
}

export interface PlayerTurnJudgmentPacket {
  packet_kind: "player-turn-judgment";
  packet_id: string;
  session_id: string;
  built_at_turn: number;
  language: string;
  active_topic_label: string;
  active_topic_type: string;
  current_meeting_layer: MeetingLayer;
  resolved_topics: string[];
  visible_risks: string[];
  recent_transcript: Array<{
    turn_index: number;
    speaker_id: string;
    speaker_name: string;
    text: string;
  }>;
  player_utterance: string;
}

export interface WhisperSidecarPacket extends SidecarContextPacket {
  packet_kind: "whisper-sidecar";
  target_participant_ids: string[];
}

export interface RiskSidecarPacket extends SidecarContextPacket {
  packet_kind: "risk-sidecar";
}

export type WhisperTemperatureShift = "more-curious" | "more-concerned" | "more-constructive";

export type WhisperPriorityHint = "use-if-selected" | "use-only-if-natural";

export interface WhisperInjection {
  whisper_id: string;
  target_participant_id: string;
  triggered_at_turn: number;
  expires_after_turn: number;
  source_reason: string;
  angle_shift: string;
  temperature_shift: WhisperTemperatureShift;
  priority_hint: WhisperPriorityHint;
  optional_question_seed: string | null;
  do_not_repeat_tags: string[];
}

export interface WhisperHistoryEntry extends WhisperInjection {
  final_status: "consumed" | "expired";
  final_turn: number;
}

export interface RiskCandidate {
  risk_id: string;
  label: string;
  layer_fit: "current-layer" | "cross-layer";
  evidence: string[];
  confidence: "high" | "medium" | "low";
}

export interface RiskSidecarResult {
  packet_id: string;
  top_risks: RiskCandidate[];
  excluded_as_already_resolved: string[];
  excluded_as_layer_mismatch: string[];
  candidate_follow_up_angle: string | null;
}

export interface PlayerTurnJudgmentResult {
  packet_id: string;
  utterance_type: PlayerUtteranceType;
  meeting_layer: MeetingLayer;
  player_intent: string;
  multi_perspective_needed: boolean;
}
