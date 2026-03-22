import type { RoomState, TranscriptTurn } from "../state/types.ts";

export interface EvaluatorEvidencePacket {
  session_id: string;
  scene_phase_at_close: RoomState["scene_phase"];
  close_reason: string | null;
  active_topic_at_close: string;
  structural_state_snapshot: RoomState["structural_state"];
  parked_items: string[];
  unresolved_items: string[];
  closing_turn: TranscriptTurn | null;
  key_turns: TranscriptTurn[];
}

function collectKeyTurns(turns: TranscriptTurn[]): TranscriptTurn[] {
  if (turns.length <= 5) {
    return turns;
  }

  return [
    turns[0],
    ...turns.slice(-4),
  ];
}

export function buildEvaluatorEvidencePacket(roomState: RoomState): EvaluatorEvidencePacket {
  const closingTurn = roomState.recent_transcript.at(-1) ?? null;

  return {
    session_id: roomState.session_id,
    scene_phase_at_close: roomState.scene_phase,
    close_reason: roomState.close_readiness.reason,
    active_topic_at_close: roomState.active_topic.label,
    structural_state_snapshot: roomState.structural_state,
    parked_items: roomState.parking_lot.map((item) => item.label),
    unresolved_items: roomState.structural_state.open_risks,
    closing_turn: closingTurn,
    key_turns: collectKeyTurns(roomState.recent_transcript),
  };
}
