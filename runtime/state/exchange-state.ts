import type { ExchangeState, RoomState, TurnOutcome } from "./types.ts";
import {
  hasExplicitQuestion,
  hasImplicitClarificationNeed,
  isSupportiveAcknowledgment,
} from "./text-signals.ts";

function mergeUnique(values: string[]): string[] {
  return [...new Set(values)];
}

function deriveTopicAwareHandoffCandidates(roomState: RoomState, outcome: TurnOutcome): string[] {
  const text = outcome.text.toLowerCase();
  const activeTopicType = roomState.active_topic.topic_type;
  const excluded = new Set([
    "player",
    "mika",
    "evaluator",
    outcome.speaker_id,
    roomState.exchange_state.initiating_actor_id ?? "",
  ]);
  const candidates: string[] = [];

  const addCandidate = (participantId: string, condition: boolean) => {
    if (!condition || excluded.has(participantId)) {
      return;
    }

    candidates.push(participantId);
  };

  addCandidate("platform", /support|boundary|platform|onboarding|exception|absorb|capacity|operate|operational/.test(text));
  addCandidate("delivery", /team|delivery|roadmap|workflow|move now|adopt|use this|next month|sprint/.test(text));
  addCandidate("exec", /business|value|investment|credible|scale|sponsor|direction|enterprise/.test(text));

  if (activeTopicType === "support-model") {
    addCandidate("platform", true);
  } else if (activeTopicType === "delivery-shape") {
    addCandidate("delivery", true);
  } else if (activeTopicType === "scope-boundary") {
    addCandidate("exec", /scope|boundary|first move|first usable/i.test(text));
  } else if (activeTopicType === "ownership") {
    addCandidate("exec", /owner|ownership|decision|sponsor/i.test(text));
    addCandidate("platform", /operate|support|platform/i.test(text));
  }

  return mergeUnique(candidates).slice(0, 1);
}

function derivePlayerExchangeState(
  roomState: RoomState,
  outcome: TurnOutcome,
  current: ExchangeState,
  nextTurnIndex: number,
): ExchangeState {
  const handoffCandidates =
    current.follow_up_count >= 1 ? deriveTopicAwareHandoffCandidates(roomState, outcome) : current.handoff_candidate_actor_ids;
  const shouldRouteToOverlap =
    current.awaiting_reaction_from === null && handoffCandidates.length > 0 && current.follow_up_count >= 1;

  return {
    ...current,
    last_player_answer_turn: nextTurnIndex,
    awaiting_reaction_from: shouldRouteToOverlap ? null : current.initiating_actor_id,
    should_continue_current_exchange: true,
    stance_movement: /important|clear|boundary|standardizing|narrow/i.test(outcome.text) ? "visible" : current.stance_movement,
    handoff_candidate_actor_ids: handoffCandidates,
  };
}

function deriveReactingActorExchangeState(
  roomState: RoomState,
  outcome: TurnOutcome,
  current: ExchangeState,
): ExchangeState {
  const nextHandoffCandidates = deriveTopicAwareHandoffCandidates(roomState, outcome);
  const soundsSupportive = isSupportiveAcknowledgment(outcome.text);
  const clarificationStillNeeded = hasExplicitQuestion(outcome.text) || hasImplicitClarificationNeed(outcome.text);

  return {
    ...current,
    initiating_actor_id: outcome.speaker_id,
    follow_up_count: 1,
    awaiting_reaction_from: null,
    handoff_candidate_actor_ids: nextHandoffCandidates,
    should_continue_current_exchange: clarificationStillNeeded || !soundsSupportive,
    stance_movement: soundsSupportive ? "partial" : current.stance_movement,
  };
}

function deriveInitiatingActorExchangeState(
  roomState: RoomState,
  outcome: TurnOutcome,
  current: ExchangeState,
): ExchangeState {
  const nextHandoffCandidates = deriveTopicAwareHandoffCandidates(roomState, outcome);
  const clarificationStillNeeded = hasExplicitQuestion(outcome.text) || hasImplicitClarificationNeed(outcome.text);
  const soundsSupportive = isSupportiveAcknowledgment(outcome.text);

  return {
    ...current,
    initiating_actor_id: outcome.speaker_id,
    follow_up_count: current.initiating_actor_id === outcome.speaker_id ? current.follow_up_count + 1 : 1,
    awaiting_reaction_from: null,
    handoff_candidate_actor_ids: nextHandoffCandidates,
    should_continue_current_exchange: clarificationStillNeeded || !soundsSupportive,
    stance_movement: soundsSupportive ? "visible" : current.stance_movement,
  };
}

export function deriveExchangeState(roomState: RoomState, outcome: TurnOutcome): ExchangeState {
  const nextTurnIndex = roomState.turn_index + 1;
  const current = roomState.exchange_state;

  if (outcome.turn_owner === "player") {
    return derivePlayerExchangeState(roomState, outcome, current, nextTurnIndex);
  }

  if (outcome.turn_owner === "reacting_actor") {
    return deriveReactingActorExchangeState(roomState, outcome, current);
  }

  if (outcome.turn_owner === "initiating_actor") {
    return deriveInitiatingActorExchangeState(roomState, outcome, current);
  }

  if (outcome.turn_owner === "facilitator") {
    return {
      ...current,
      initiating_actor_id: null,
      follow_up_count: 0,
      awaiting_reaction_from: null,
      should_continue_current_exchange: false,
      handoff_candidate_actor_ids: [],
    };
  }

  return current;
}
