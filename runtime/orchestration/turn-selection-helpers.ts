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

function participantAddressAliases(participant: ParticipantState): string[] {
  const aliases = new Set<string>();
  aliases.add(participant.display_name);

  const firstToken = participant.display_name.split(/\s+/)[0]?.trim();
  if (firstToken) {
    aliases.add(firstToken);
  }

  return [...aliases].filter(Boolean);
}

function textMentionsAlias(text: string, alias: string): boolean {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    new RegExp(`(^|[\\s"'])${escaped}($|[\\s,.!?:"'])`, "i").test(text) ||
    new RegExp(`${escaped}(さん|くん|君|氏|さま|様)`, "i").test(text)
  );
}

export function findDirectAddressedParticipant(roomState: RoomState): ParticipantState | null {
  const lastTurn = roomState.recent_transcript.at(-1);
  if (!lastTurn || lastTurn.speaker_id !== "player") {
    return null;
  }

  const candidates = roomState.participant_states.filter(
    (participant) => participant.role_type !== "player" && participant.role_type !== "evaluator",
  );

  for (const participant of candidates) {
    if (participantAddressAliases(participant).some((alias) => textMentionsAlias(lastTurn.text, alias))) {
      return participant;
    }
  }

  return null;
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

export function capabilityShiftPreferred(roomState: RoomState): boolean {
  const overlapActorId = roomState.exchange_state.handoff_candidate_actor_ids[0] ?? null;
  const awaitingActorId = roomState.exchange_state.awaiting_reaction_from;

  if (!overlapActorId || !awaitingActorId || overlapActorId === awaitingActorId || playerResponseOwed(roomState)) {
    return false;
  }

  return (
    roomState.main_session_judgment.last_player_intent === "request-role-specific-explanation" ||
    roomState.main_session_judgment.multi_perspective_needed
  );
}

export function directActorReplyPreferred(roomState: RoomState, participant: ParticipantState | null): boolean {
  if (!participant || lastTranscriptSpeaker(roomState) !== "player") {
    return false;
  }

  if (roomState.main_session_judgment.last_player_intent === "request-trigger-alignment") {
    return participant.role_type === "facilitator";
  }

  if (participant.role_type === "facilitator") {
    return false;
  }

  return (
    roomState.main_session_judgment.last_player_intent === "request-role-specific-explanation" ||
    roomState.main_session_judgment.last_player_intent === "clarify-current-layer" ||
    roomState.main_session_judgment.last_player_intent === "confirm-current-understanding" ||
    roomState.main_session_judgment.last_player_utterance_type === "question" ||
    roomState.main_session_judgment.last_player_utterance_type === "clarification" ||
    roomState.main_session_judgment.last_player_utterance_type === "confirmation"
  );
}

export function directActorReplyCanBypassFacilitator(roomState: RoomState, participant: ParticipantState | null): boolean {
  const facilitatorReason = requiresFacilitatorIntervention(roomState);
  if (!facilitatorReason || !directActorReplyPreferred(roomState, participant)) {
    return false;
  }

  return facilitatorReason === "turn-ownership-unclear" || facilitatorReason === "pile-on-risk";
}

export function engagedActorAnswerPreferred(roomState: RoomState): ParticipantState | null {
  if (lastTranscriptSpeaker(roomState) !== "player") {
    return null;
  }

  if (
    roomState.main_session_judgment.last_player_intent === "request-trigger-alignment" ||
    (roomState.main_session_judgment.last_player_utterance_type !== "question" &&
      roomState.main_session_judgment.last_player_utterance_type !== "clarification" &&
      roomState.main_session_judgment.last_player_utterance_type !== "confirmation")
  ) {
    return null;
  }

  if (
    roomState.main_session_judgment.last_player_intent === "request-role-specific-explanation" &&
    roomState.exchange_state.handoff_candidate_actor_ids.length > 0
  ) {
    return null;
  }

  const engagedActorId = roomState.exchange_state.awaiting_reaction_from;
  const engagedActor = findParticipant(roomState, engagedActorId);
  return engagedActor?.role_type === "stakeholder" ? engagedActor : null;
}

export function engagedActorAnswerCanBypassFacilitator(roomState: RoomState): boolean {
  const facilitatorReason = requiresFacilitatorIntervention(roomState);
  if (!facilitatorReason || !engagedActorAnswerPreferred(roomState)) {
    return false;
  }

  return facilitatorReason === "turn-ownership-unclear" || facilitatorReason === "pile-on-risk";
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
    lastTranscriptSpeaker(roomState) === "player" &&
    roomState.main_session_judgment.last_player_utterance_type === "question" &&
    roomState.main_session_judgment.last_player_intent === "request-trigger-alignment" &&
    roomState.exchange_state.awaiting_reaction_from === null &&
    roomState.exchange_state.handoff_candidate_actor_ids.length === 0 &&
    !roomState.exchange_state.should_continue_current_exchange
  ) {
    return "trigger-alignment";
  }

  if (
    roomState.recent_transcript.length > 0 &&
    !roomState.exchange_state.should_continue_current_exchange &&
    roomState.exchange_state.awaiting_reaction_from === null &&
    roomState.exchange_state.handoff_candidate_actor_ids.length === 0 &&
    !playerResponseOwed(roomState)
  ) {
    return null;
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
