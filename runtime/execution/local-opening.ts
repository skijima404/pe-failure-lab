import type { RoomState, TurnOutcome } from "../state/types.ts";

function extractPlayerName(roomState: RoomState): string {
  const player = roomState.participant_states.find((participant) => participant.participant_id === "player");
  return player?.display_name ?? "Player";
}

export function createLocalOpeningOutcome(roomState: RoomState): TurnOutcome {
  const facilitator = roomState.participant_states.find((participant) => participant.participant_id === "mika");
  const facilitatorName = facilitator?.display_name ?? "Mika";
  const playerName = extractPlayerName(roomState);

  return {
    speaker_id: "mika",
    speaker_name: facilitatorName,
    turn_owner: "facilitator",
    text: [
      `Thanks everyone for making time. ${roomState.session_setup.facilitator_opening_frame}.`,
      `Today's goal is to ${roomState.session_setup.meeting_goal}.`,
      `${playerName}, could you share where you think we should start, and we can react from there?`,
    ].join(" "),
  };
}
