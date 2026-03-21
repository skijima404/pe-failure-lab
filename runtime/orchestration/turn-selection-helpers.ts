import type { ParticipantState, RoomState, TurnOwner } from "../state/types.ts";

export function findParticipant(roomState: RoomState, participantId: string | null): ParticipantState | null {
  if (!participantId) {
    return null;
  }

  return roomState.participant_states.find((participant) => participant.participant_id === participantId) ?? null;
}

export function findFacilitator(roomState: RoomState): ParticipantState {
  const facilitator = roomState.participant_states.find((participant) => participant.role_type === "facilitator");

  if (!facilitator) {
    throw new Error("Facilitator participant is required in room state.");
  }

  return facilitator;
}

export function lastTranscriptSpeaker(roomState: RoomState): string | null {
  return roomState.recent_transcript.at(-1)?.speaker_id ?? null;
}

export function lastTranscriptOwner(roomState: RoomState): TurnOwner | null {
  return roomState.recent_transcript.at(-1)?.turn_owner ?? null;
}

export function playerResponseOwed(roomState: RoomState): boolean {
  const lastOwner = lastTranscriptOwner(roomState);

  if (!roomState.exchange_state.should_continue_current_exchange) {
    return false;
  }

  if (!lastOwner || lastOwner === "player") {
    return false;
  }

  return lastTranscriptSpeaker(roomState) !== "player";
}

export function sameTopicOverlapAllowed(roomState: RoomState): boolean {
  return (
    roomState.exchange_state.handoff_candidate_actor_ids.length === 1 &&
    roomState.exchange_state.awaiting_reaction_from === null &&
    roomState.exchange_state.should_continue_current_exchange &&
    roomState.exchange_state.follow_up_count <= 1 &&
    !playerResponseOwed(roomState)
  );
}

export function playerJustSpokeWithoutClearActorPath(roomState: RoomState): boolean {
  return (
    lastTranscriptSpeaker(roomState) === "player" &&
    roomState.exchange_state.should_continue_current_exchange &&
    roomState.exchange_state.awaiting_reaction_from === null &&
    roomState.exchange_state.handoff_candidate_actor_ids.length === 0
  );
}

export function facilitatorJustHandledSettledExchange(roomState: RoomState): boolean {
  return (
    lastTranscriptSpeaker(roomState) === "mika" &&
    lastTranscriptOwner(roomState) === "facilitator" &&
    !roomState.exchange_state.should_continue_current_exchange &&
    roomState.exchange_state.awaiting_reaction_from === null &&
    roomState.exchange_state.handoff_candidate_actor_ids.length === 0
  );
}

export function requiresFacilitatorIntervention(roomState: RoomState): string | null {
  if (roomState.scene_phase === "post-game") {
    return null;
  }

  if (roomState.scene_phase === "opening" && roomState.recent_transcript.length === 0) {
    return "session-opening";
  }

  if (roomState.close_readiness.ready) {
    return "closing-transition";
  }

  if (
    roomState.recent_transcript.length > 0 &&
    !facilitatorJustHandledSettledExchange(roomState) &&
    !roomState.exchange_state.should_continue_current_exchange &&
    roomState.exchange_state.awaiting_reaction_from === null &&
    roomState.exchange_state.handoff_candidate_actor_ids.length === 0 &&
    !playerResponseOwed(roomState)
  ) {
    return "exchange-settled";
  }

  if (roomState.exchange_state.handoff_candidate_actor_ids.length > 1) {
    return "turn-ownership-unclear";
  }

  if (playerJustSpokeWithoutClearActorPath(roomState)) {
    return "turn-ownership-unclear";
  }

  if (
    roomState.exchange_state.handoff_candidate_actor_ids.length > 0 &&
    roomState.exchange_state.follow_up_count > 1 &&
    !playerResponseOwed(roomState)
  ) {
    return "pile-on-risk";
  }

  if (roomState.active_topic.depth > 2 && roomState.exchange_state.follow_up_count > 1) {
    return "topic-drift-risk";
  }

  return null;
}
