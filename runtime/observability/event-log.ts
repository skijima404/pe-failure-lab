import type { NextTurnDecision } from "../orchestration/select-next-turn.ts";
import type { RoomState } from "../state/types.ts";

export interface TurnLayerTrace {
  operator_layer: "local-codex-session";
  orchestration_layer: "local-room-orchestrator";
  speaker_layer: "runtime-actor" | "player";
  response_layer: "local-opening" | "local-facilitator" | "remote-response-chain" | "local-player-input" | "unknown";
  evaluator_layer: "local-first";
}

export interface TurnLog {
  session_id: string;
  turn_index: number;
  scene_phase: RoomState["scene_phase"];
  active_topic_before: string;
  active_topic_depth_before: number;
  turn_owner: NextTurnDecision["owner"];
  selected_speaker: string;
  selection_reason: string;
  intervention_reason: string | null;
  layer_trace: TurnLayerTrace;
  prompt_input_summary: Record<string, unknown>;
  agent_output_summary: Record<string, unknown>;
  state_changes: Record<string, unknown>;
  visible_output_classification: "simulation-visible" | "debug-only" | "suppressed-orchestration" | "suppressed-progress";
  evaluation_reference: {
    included_in_evidence_packet: boolean;
    evidence_tags: string[];
    judgment_relevance: "none" | "live-turn" | "closing-turn";
  };
  active_topic_after: string;
  active_topic_depth_after: number;
  topic_transition_reason: string | null;
}

export function createTurnLog(params: {
  roomStateBefore: RoomState;
  roomStateAfter: RoomState;
  decision: NextTurnDecision;
  promptInputSummary: Record<string, unknown>;
  agentOutputSummary: Record<string, unknown>;
  stateChanges: Record<string, unknown>;
}): TurnLog {
  const { roomStateBefore, roomStateAfter, decision, promptInputSummary, agentOutputSummary, stateChanges } = params;
  const responseChain = agentOutputSummary.response_chain as Record<string, unknown> | null | undefined;
  const speakerLayer = decision.owner === "player" ? "player" : "runtime-actor";

  return {
    session_id: roomStateBefore.session_id,
    turn_index: roomStateBefore.turn_index + 1,
    scene_phase: roomStateBefore.scene_phase,
    active_topic_before: roomStateBefore.active_topic.label,
    active_topic_depth_before: roomStateBefore.active_topic.depth,
    turn_owner: decision.owner,
    selected_speaker: decision.speaker_id,
    selection_reason: decision.selection_reason,
    intervention_reason: decision.intervention_reason,
    layer_trace: {
      operator_layer: "local-codex-session",
      orchestration_layer: "local-room-orchestrator",
      speaker_layer: speakerLayer,
      response_layer:
        speakerLayer === "player"
          ? "local-player-input"
          : agentOutputSummary.delivery_mode === "local-opening"
            ? "local-opening"
            : agentOutputSummary.delivery_mode === "local-facilitator"
              ? "local-facilitator"
            : responseChain && responseChain.mode === "per-speaker-response-chain"
              ? "remote-response-chain"
              : "unknown",
      evaluator_layer: "local-first",
    },
    prompt_input_summary: promptInputSummary,
    agent_output_summary: agentOutputSummary,
    state_changes: stateChanges,
    visible_output_classification: "simulation-visible",
    evaluation_reference: {
      included_in_evidence_packet: roomStateAfter.scene_phase === "post-game",
      evidence_tags: decision.intervention_reason === "closing-transition" ? ["closing-turn"] : [],
      judgment_relevance: decision.intervention_reason === "closing-transition" ? "closing-turn" : "live-turn",
    },
    active_topic_after: roomStateAfter.active_topic.label,
    active_topic_depth_after: roomStateAfter.active_topic.depth,
    topic_transition_reason:
      typeof stateChanges.topic_transition === "object" && stateChanges.topic_transition
        ? ((stateChanges.topic_transition as Record<string, unknown>).reason as string | null | undefined) ?? null
        : null,
  };
}
