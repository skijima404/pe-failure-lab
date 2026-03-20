import type { ParticipantState, RoomState, TurnOwner } from "../state/types.ts";

export interface NextTurnDecision {
  owner: TurnOwner;
  speaker_id: string;
  selection_reason: string;
  intervention_reason: string | null;
}

function findParticipant(roomState: RoomState, participantId: string | null): ParticipantState | null {
  if (!participantId) {
    return null;
  }

  return roomState.participant_states.find((participant) => participant.participant_id === participantId) ?? null;
}

function findFacilitator(roomState: RoomState): ParticipantState {
  const facilitator = roomState.participant_states.find((participant) => participant.role_type === "facilitator");

  if (!facilitator) {
    throw new Error("Facilitator participant is required in room state.");
  }

  return facilitator;
}

function requiresFacilitator(roomState: RoomState): string | null {
  if (roomState.scene_phase === "opening" && roomState.recent_transcript.length === 0) {
    return "session-opening";
  }

  if (roomState.close_readiness.ready) {
    return "closing-transition";
  }

  if (roomState.exchange_state.handoff_candidate_actor_ids.length > 1) {
    return "turn-ownership-unclear";
  }

  if (roomState.active_topic.depth > 1 && roomState.exchange_state.follow_up_count > 1) {
    return "topic-drift-risk";
  }

  return null;
}

export function selectNextTurn(roomState: RoomState): NextTurnDecision {
  const facilitatorReason = requiresFacilitator(roomState);
  if (facilitatorReason) {
    return {
      owner: "facilitator",
      speaker_id: findFacilitator(roomState).participant_id,
      selection_reason: "facilitator-intervention",
      intervention_reason: facilitatorReason,
    };
  }

  const awaitingReaction = findParticipant(roomState, roomState.exchange_state.awaiting_reaction_from);
  if (awaitingReaction) {
    return {
      owner: "initiating_actor",
      speaker_id: awaitingReaction.participant_id,
      selection_reason: "initiating-actor-follow-up",
      intervention_reason: null,
    };
  }

  const overlapActorId = roomState.exchange_state.handoff_candidate_actor_ids[0];
  const overlapActor = findParticipant(roomState, overlapActorId);
  if (overlapActor) {
    return {
      owner: "reacting_actor",
      speaker_id: overlapActor.participant_id,
      selection_reason: "overlap-reaction",
      intervention_reason: null,
    };
  }

  return {
    owner: "player",
    speaker_id: "player",
    selection_reason: "player-clarification-needed",
    intervention_reason: null,
  };
}
