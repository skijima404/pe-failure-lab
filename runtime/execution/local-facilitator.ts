import type { PreparedRuntimeTurn } from "./prepare-runtime-turn.ts";
import type { RoomState, TurnOutcome } from "../state/types.ts";

function extractPlayerName(roomState: RoomState): string {
  const player = roomState.participant_states.find((participant) => participant.participant_id === "player");
  return player?.display_name ?? "Player";
}

export function createLocalFacilitatorOutcome(
  roomState: RoomState,
  preparedTurn: PreparedRuntimeTurn,
): TurnOutcome {
  const facilitator = roomState.participant_states.find((participant) => participant.participant_id === "mika");
  const facilitatorName = facilitator?.display_name ?? "Mika";
  const playerName = extractPlayerName(roomState);
  const interventionReason = preparedTurn.decision.intervention_reason ?? "turn-ownership-unclear";

  return {
    speaker_id: "mika",
    speaker_name: facilitatorName,
    turn_owner: "facilitator",
    text: renderLocalFacilitatorText(roomState, interventionReason, playerName),
    response_metadata: {
      runtime_transport: "local-facilitator",
      intervention_reason: interventionReason,
    },
  };
}

function renderLocalFacilitatorText(
  roomState: RoomState,
  interventionReason: string,
  playerName: string,
): string {
  if (interventionReason === "session-opening") {
    return [
      `Thanks everyone for making time. ${roomState.session_setup.facilitator_opening_frame}.`,
      `Today's goal is to ${roomState.session_setup.meeting_goal}.`,
      `${playerName}, could you share where you think we should start, and we can react from there?`,
    ].join(" ");
  }

  if (interventionReason === "closing-transition") {
    return "We have enough to lock a bounded checkpoint. Let’s close this topic with the owner and next review point made explicit.";
  }

  if (interventionReason === "exchange-settled") {
    return "That gives us enough to mark this point as tentatively settled. If something material is still open, name that one item; otherwise we can move on.";
  }

  if (interventionReason === "pile-on-risk") {
    return "Let’s keep this to one reaction at a time. I want one clear response before we stack more concerns.";
  }

  if (interventionReason === "topic-drift-risk") {
    return "We’re starting to drift. Let’s stay with the current topic long enough to make the next decision boundary usable.";
  }

  return "Let’s keep the thread clear. I want one person to answer directly before we widen this.";
}
