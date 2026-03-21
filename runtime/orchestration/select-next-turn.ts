import type { RoomState, TurnOwner } from "../state/types.ts";
import {
  findFacilitator,
  findParticipant,
  playerResponseOwed,
  requiresFacilitatorIntervention,
  sameTopicOverlapAllowed,
} from "./turn-selection-helpers.ts";

export interface NextTurnDecision {
  owner: TurnOwner;
  speaker_id: string;
  selection_reason: string;
  intervention_reason: string | null;
}

export function selectNextTurn(roomState: RoomState): NextTurnDecision {
  const facilitatorReason = requiresFacilitatorIntervention(roomState);
  if (facilitatorReason) {
    return {
      owner: "facilitator",
      speaker_id: findFacilitator(roomState).participant_id,
      selection_reason: "facilitator-intervention",
      intervention_reason: facilitatorReason,
    };
  }

  const awaitingReaction = findParticipant(roomState, roomState.exchange_state.awaiting_reaction_from);
  if (awaitingReaction && !playerResponseOwed(roomState)) {
    return {
      owner: "initiating_actor",
      speaker_id: awaitingReaction.participant_id,
      selection_reason: "initiating-actor-follow-up",
      intervention_reason: null,
    };
  }

  const overlapActorId = roomState.exchange_state.handoff_candidate_actor_ids[0];
  const overlapActor = findParticipant(roomState, overlapActorId);
  if (overlapActor && sameTopicOverlapAllowed(roomState)) {
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
