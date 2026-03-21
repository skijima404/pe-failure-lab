import type { RoomState, TranscriptTurn, TurnOutcome } from "./types.ts";

export function appendTranscriptTurn(roomState: RoomState, outcome: TurnOutcome): TranscriptTurn {
  return {
    turn_index: roomState.turn_index + 1,
    speaker_id: outcome.speaker_id,
    speaker_name: outcome.speaker_name,
    turn_owner: outcome.turn_owner,
    text: outcome.text,
  };
}
