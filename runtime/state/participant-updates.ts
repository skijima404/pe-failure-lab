import type { ParticipantState, RoomState, TurnOutcome } from "./types.ts";
import { hasExplicitQuestion } from "./text-signals.ts";

function deriveReactionType(text: string): ParticipantState["last_reaction_type"] {
  const normalized = text.toLowerCase();

  if (normalized.includes("helpful") || normalized.includes("that helps")) {
    return "relief";
  }
  if (normalized.includes("concern") || normalized.includes("worry") || normalized.includes("risk")) {
    return "concern";
  }
  if (hasExplicitQuestion(text)) {
    return "curiosity";
  }
  if (normalized.includes("surpr")) {
    return "surprise";
  }
  if (normalized.includes("support")) {
    return "conditional-support";
  }

  return "recognition";
}

function updateSpeakingParticipant(participant: ParticipantState, roomState: RoomState, outcome: TurnOutcome): ParticipantState {
  const nextPendingQuestion =
    (outcome.turn_owner === "initiating_actor" || outcome.turn_owner === "reacting_actor") && hasExplicitQuestion(outcome.text)
      ? outcome.text
      : null;

  return {
    ...participant,
    last_spoke_turn: roomState.turn_index + 1,
    pending_question: nextPendingQuestion,
    last_reaction_type: deriveReactionType(outcome.text),
  };
}

function clearPendingQuestionForPlayer(participant: ParticipantState): ParticipantState {
  return {
    ...participant,
    pending_question: null,
  };
}

export function deriveParticipantStates(roomState: RoomState, outcome: TurnOutcome): ParticipantState[] {
  return roomState.participant_states.map((participant) => {
    if (participant.participant_id === outcome.speaker_id) {
      return updateSpeakingParticipant(participant, roomState, outcome);
    }

    if ((outcome.turn_owner === "player" || outcome.turn_owner === "facilitator") && participant.role_type === "stakeholder") {
      return clearPendingQuestionForPlayer(participant);
    }

    return participant;
  });
}
