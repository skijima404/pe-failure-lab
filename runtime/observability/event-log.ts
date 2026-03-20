import type { NextTurnDecision } from "../orchestration/select-next-turn.ts";
import type { RoomState } from "../state/types.ts";

export interface TurnLog {
  session_id: string;
  turn_index: number;
  scene_phase: RoomState["scene_phase"];
  active_topic_before: string;
  turn_owner: NextTurnDecision["owner"];
  selected_speaker: string;
  selection_reason: string;
  intervention_reason: string | null;
  prompt_input_summary: Record<string, unknown>;
  agent_output_summary: Record<string, unknown>;
  state_changes: Record<string, unknown>;
  active_topic_after: string;
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

  return {
    session_id: roomStateBefore.session_id,
    turn_index: roomStateBefore.turn_index + 1,
    scene_phase: roomStateBefore.scene_phase,
    active_topic_before: roomStateBefore.active_topic.label,
    turn_owner: decision.owner,
    selected_speaker: decision.speaker_id,
    selection_reason: decision.selection_reason,
    intervention_reason: decision.intervention_reason,
    prompt_input_summary: promptInputSummary,
    agent_output_summary: agentOutputSummary,
    state_changes: stateChanges,
    active_topic_after: roomStateAfter.active_topic.label,
  };
}
