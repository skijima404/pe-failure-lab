import type { PlayerTurnJudgmentPacket, PlayerTurnJudgmentResult, PlayerUtteranceType } from "../sidecars/types.ts";
import {
  classifyPlayerUtteranceHeuristically,
  inferMeetingLayerHeuristically,
  inferMultiPerspectiveNeededHeuristically,
  inferPlayerIntentHeuristically,
} from "./heuristic-player-turn-judger.ts";
import type { RoomState } from "../state/types.ts";

function packetAsRoomState(packet: PlayerTurnJudgmentPacket): RoomState {
  return {
    session_id: packet.session_id,
    session_setup: {
      scenario: "",
      session_mode: "",
      meeting_goal: "",
      active_topic_seed: "",
      facilitator_opening_frame: "",
      player_start_expectation: "",
      enterprise_context_summary: [],
    },
    player_initialization: {
      session_purpose: "",
      player_goal: "",
      player_should_expect: [],
      player_allowed_moves: [],
      player_not_expected_to_know: [],
      optional_setup_question_example: "",
      start_signal_examples: [],
      opening_move_guidance: "",
    },
    scene_phase: "discussion",
    language: packet.language,
    turn_index: packet.built_at_turn - 1,
    active_speaker: null,
    active_topic: {
      topic_id: "judgment-preview-topic",
      label: packet.active_topic_label,
      opened_by: "system",
      opened_at_turn: 0,
      topic_type: packet.active_topic_type as RoomState["active_topic"]["topic_type"],
      depth: 1,
      status: "active",
    },
    topic_status: "active",
    parking_lot: packet.resolved_topics.map((label, index) => ({
      topic_id: `resolved-${index + 1}`,
      label,
      parked_at_turn: packet.built_at_turn,
    })),
    exchange_state: {
      initiating_actor_id: null,
      last_player_answer_turn: null,
      follow_up_count: 0,
      stance_movement: "none",
      awaiting_reaction_from: null,
      handoff_candidate_actor_ids: [],
      should_continue_current_exchange: false,
    },
    participant_states: [],
    structural_state: {
      strategic_clarity: 0,
      scope_coherence: 0,
      ownership_clarity: 0,
      support_model_clarity: 0,
      coalition_stability: 0,
      open_risks: [...packet.visible_risks],
    },
    recent_transcript: packet.recent_transcript.map((turn) => ({
      ...turn,
      turn_owner: "player",
    })),
    next_turn_options: [],
    close_readiness: {
      ready: false,
      reason: null,
    },
    main_session_judgment: {
      meeting_layer: packet.current_meeting_layer,
      last_player_utterance_type: null,
      last_player_intent: null,
      multi_perspective_needed: false,
    },
    sidecar_state: {
      active_whispers: [],
      whisper_history: [],
    },
  };
}

export function judgePlayerTurnLocally(packet: PlayerTurnJudgmentPacket): PlayerTurnJudgmentResult {
  const roomState = packetAsRoomState(packet);
  const utteranceType: PlayerUtteranceType = classifyPlayerUtteranceHeuristically(packet.player_utterance, packet.language);

  return {
    packet_id: packet.packet_id,
    utterance_type: utteranceType,
    meeting_layer: inferMeetingLayerHeuristically(roomState, packet.player_utterance),
    player_intent: inferPlayerIntentHeuristically(packet.player_utterance, utteranceType, packet.language),
    multi_perspective_needed: inferMultiPerspectiveNeededHeuristically(
      packet.player_utterance,
      utteranceType,
      packet.language,
    ),
  };
}
