import type { CloseReadiness, RoomState, StructuralState, TurnOutcome } from "./types.ts";
import { isBoundedNextStepSignal, isSupportiveAcknowledgment } from "./text-signals.ts";

export function deriveStructuralState(roomState: RoomState, outcome: TurnOutcome): StructuralState {
  const current = roomState.structural_state;
  const text = outcome.text.toLowerCase();
  const nextOpenRisks = [...current.open_risks];

  let supportModelClarity = current.support_model_clarity;
  let scopeCoherence = current.scope_coherence;
  let strategicClarity = current.strategic_clarity;
  let coalitionStability = current.coalition_stability;

  if (/one onboarding path|narrow/i.test(text)) {
    scopeCoherence = Math.min(scopeCoherence + 1, 5);
    strategicClarity = Math.min(strategicClarity + 1, 5);
  }

  if (/not taking over ongoing delivery support|support boundary|boundary/i.test(text)) {
    supportModelClarity = Math.min(supportModelClarity + 1, 5);
  }

  if (isSupportiveAcknowledgment(outcome.text)) {
    coalitionStability = Math.min(coalitionStability + 1, 5);
  }

  const filteredOpenRisks = nextOpenRisks.filter((risk) => {
    if (risk === "support-boundary-not-yet-clear" && supportModelClarity >= 2) {
      return false;
    }

    return true;
  });

  return {
    ...current,
    strategic_clarity: strategicClarity,
    scope_coherence: scopeCoherence,
    support_model_clarity: supportModelClarity,
    coalition_stability: coalitionStability,
    open_risks: filteredOpenRisks,
  };
}

function hasSufficientStructuralProgress(roomState: RoomState): boolean {
  const { structural_state: structuralState, active_topic: activeTopic } = roomState;

  const baselineProgress =
    structuralState.strategic_clarity >= 3 &&
    structuralState.scope_coherence >= 3 &&
    structuralState.coalition_stability >= 3;

  if (!baselineProgress) {
    return false;
  }

  if (activeTopic.topic_type === "support-model" || activeTopic.topic_type === "scope-boundary") {
    return structuralState.support_model_clarity >= 2;
  }

  if (activeTopic.topic_type === "ownership") {
    return structuralState.ownership_clarity >= 2 || structuralState.strategic_clarity >= 4;
  }

  return true;
}

function hasMatureEnoughTopicDepth(roomState: RoomState): boolean {
  return roomState.active_topic.depth <= 1 || roomState.structural_state.scope_coherence >= 4;
}

function exchangeSettledEnoughToClose(roomState: RoomState): boolean {
  return (
    !roomState.exchange_state.should_continue_current_exchange &&
    roomState.exchange_state.awaiting_reaction_from === null &&
    roomState.exchange_state.handoff_candidate_actor_ids.length === 0
  );
}

export function deriveCloseReadiness(
  roomStateBeforeTurn: RoomState,
  outcome: TurnOutcome,
  roomStateAfterTurn: RoomState = roomStateBeforeTurn,
): CloseReadiness {
  if (roomStateBeforeTurn.close_readiness.ready) {
    return roomStateBeforeTurn.close_readiness;
  }

  const noVisibleRisks = roomStateAfterTurn.structural_state.open_risks.length === 0;
  const enoughProgress = hasSufficientStructuralProgress(roomStateAfterTurn);
  const matureTopicDepth = hasMatureEnoughTopicDepth(roomStateAfterTurn);
  const exchangeSettled = exchangeSettledEnoughToClose(roomStateAfterTurn);

  if (isBoundedNextStepSignal(outcome.text) && noVisibleRisks && matureTopicDepth) {
    return {
      ready: true,
      reason: "bounded-next-step-visible",
    };
  }

  if (exchangeSettled && noVisibleRisks && enoughProgress && matureTopicDepth) {
    return {
      ready: true,
      reason: "exchange-resolved-enough",
    };
  }

  return roomStateBeforeTurn.close_readiness;
}
