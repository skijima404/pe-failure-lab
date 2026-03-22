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

export interface ProposalSidecarPacket extends SidecarContextPacket {
  packet_kind: "proposal-sidecar";
  target_participant_ids: string[];
}

export interface RiskSidecarPacket extends SidecarContextPacket {
  packet_kind: "risk-sidecar";
}

export interface ProposalReactionCandidate {
  participant_id: string;
  stance: "support" | "concern" | "conditional-support";
  what_is_good: string | null;
  what_is_risky: string | null;
  what_is_missing: string | null;
  suggested_next_question: string | null;
  speaker_fit: "high" | "medium" | "low";
}

export interface ProposalSidecarResult {
  packet_id: string;
  candidates: ProposalReactionCandidate[];
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

export interface ProposalSidecarContext {
  packet: ProposalSidecarPacket;
  result: ProposalSidecarResult;
  selected_candidate_participant_id: string | null;
}

export interface PlayerTurnJudgmentResult {
  packet_id: string;
  utterance_type: PlayerUtteranceType;
  meeting_layer: MeetingLayer;
  player_intent: string;
  multi_perspective_needed: boolean;
}
