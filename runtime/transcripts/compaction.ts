import type { RoomState, TranscriptTurn } from "../state/types.ts";

export interface TranscriptContext {
  recent_turns: TranscriptTurn[];
  active_topic_label: string;
  parked_topic_labels: string[];
  unresolved_summary: string[];
}

export function compactTranscript(roomState: RoomState, maxTurns = 8): TranscriptContext {
  const recentTurns = roomState.recent_transcript.slice(-maxTurns);
  const unresolvedSummary = roomState.structural_state.open_risks.slice(0, 3);

  return {
    recent_turns: recentTurns,
    active_topic_label: roomState.active_topic.label,
    parked_topic_labels: roomState.parking_lot.map((topic) => topic.label),
    unresolved_summary: unresolvedSummary,
  };
}
