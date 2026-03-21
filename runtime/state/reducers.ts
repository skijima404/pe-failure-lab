import type { RoomState, TranscriptTurn, TurnOutcome } from "./types.ts";
import { deriveParticipantStates } from "./participant-updates.ts";

function appendTranscriptTurn(roomState: RoomState, outcome: TurnOutcome): TranscriptTurn {
  return {
    turn_index: roomState.turn_index + 1,
    speaker_id: outcome.speaker_id,
    speaker_name: outcome.speaker_name,
    turn_owner: outcome.turn_owner,
    text: outcome.text,
  };
}

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

function deriveExchangeState(roomState: RoomState, outcome: TurnOutcome) {
  const nextTurnIndex = roomState.turn_index + 1;
  const current = roomState.exchange_state;
  const text = outcome.text.toLowerCase();
  const hasQuestion = outcome.text.includes("?");
  const soundsSupportive = /i can support|that helps|good\./i.test(outcome.text);

  if (outcome.turn_owner === "player") {
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

  if (outcome.turn_owner === "reacting_actor") {
    const nextHandoffCandidates = deriveTopicAwareHandoffCandidates(roomState, outcome);

    return {
      ...current,
      initiating_actor_id: outcome.speaker_id,
      follow_up_count: 1,
      awaiting_reaction_from: null,
      handoff_candidate_actor_ids: nextHandoffCandidates,
      should_continue_current_exchange: true,
      stance_movement: soundsSupportive ? "partial" : current.stance_movement,
    };
  }

  if (outcome.turn_owner === "initiating_actor") {
    const nextHandoffCandidates = deriveTopicAwareHandoffCandidates(roomState, outcome);

    return {
      ...current,
      initiating_actor_id: outcome.speaker_id,
      follow_up_count: current.initiating_actor_id === outcome.speaker_id ? current.follow_up_count + 1 : 1,
      awaiting_reaction_from: null,
      handoff_candidate_actor_ids: nextHandoffCandidates,
      should_continue_current_exchange: hasQuestion || !soundsSupportive,
      stance_movement: soundsSupportive ? "visible" : current.stance_movement,
    };
  }

  if (outcome.turn_owner === "facilitator") {
    return {
      ...current,
      awaiting_reaction_from: null,
      should_continue_current_exchange: false,
      handoff_candidate_actor_ids: [],
    };
  }

  return current;
}

function deriveStructuralState(roomState: RoomState, outcome: TurnOutcome) {
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

  if (/i can support|that helps|good\./i.test(outcome.text)) {
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

function deriveCloseReadiness(roomState: RoomState, outcome: TurnOutcome) {
  if (roomState.close_readiness.ready) {
    return roomState.close_readiness;
  }

  if (/i can support shaping the next step|support shaping the next step|next step after this meeting/i.test(outcome.text)) {
    return {
      ready: true,
      reason: "bounded-next-step-visible",
    };
  }

  return roomState.close_readiness;
}

export function applyTurnOutcome(roomState: RoomState, outcome: TurnOutcome): RoomState {
  const transcriptTurn = appendTranscriptTurn(roomState, outcome);
  const updates = outcome.updates ?? {};
  const participantStates = updates.participant_states ?? deriveParticipantStates(roomState, outcome);
  const exchangeState = updates.exchange_state ?? deriveExchangeState(roomState, outcome);
  const structuralState = updates.structural_state ?? deriveStructuralState(roomState, outcome);
  const closeReadiness = updates.close_readiness ?? deriveCloseReadiness(roomState, outcome);

  return {
    ...roomState,
    turn_index: transcriptTurn.turn_index,
    active_speaker: updates.active_speaker ?? outcome.speaker_id,
    scene_phase:
      updates.scene_phase ??
      (roomState.scene_phase === "opening" && outcome.turn_owner === "facilitator" ? "discussion" : roomState.scene_phase),
    topic_status: updates.topic_status ?? roomState.topic_status,
    active_topic: updates.active_topic ?? roomState.active_topic,
    parking_lot: updates.parking_lot ?? roomState.parking_lot,
    exchange_state: exchangeState,
    participant_states: participantStates,
    structural_state: structuralState,
    close_readiness: closeReadiness,
    recent_transcript: [...roomState.recent_transcript, transcriptTurn].slice(-12),
  };
}

export function computeStateChanges(before: RoomState, after: RoomState): Record<string, unknown> {
  const changedFields: string[] = [];

  if (before.active_speaker !== after.active_speaker) {
    changedFields.push("active_speaker");
  }
  if (before.scene_phase !== after.scene_phase) {
    changedFields.push("scene_phase");
  }
  if (before.active_topic.topic_id !== after.active_topic.topic_id || before.active_topic.status !== after.active_topic.status) {
    changedFields.push("active_topic");
  }
  if (before.parking_lot.length !== after.parking_lot.length) {
    changedFields.push("parking_lot");
  }
  if (before.exchange_state.follow_up_count !== after.exchange_state.follow_up_count) {
    changedFields.push("exchange_state.follow_up_count");
  }
  if (before.close_readiness.ready !== after.close_readiness.ready) {
    changedFields.push("close_readiness.ready");
  }

  return {
    changed_fields: changedFields,
    topic_transition: {
      before: before.active_topic.label,
      after: after.active_topic.label,
      status_before: before.active_topic.status,
      status_after: after.active_topic.status,
    },
    participant_updates: after.participant_states
      .filter((participant) => {
        const previous = before.participant_states.find((item) => item.participant_id === participant.participant_id);
        return previous && previous.last_spoke_turn !== participant.last_spoke_turn;
      })
      .map((participant) => participant.participant_id),
    parking_lot_updates: {
      before_count: before.parking_lot.length,
      after_count: after.parking_lot.length,
    },
    close_readiness_change: {
      before: before.close_readiness.ready,
      after: after.close_readiness.ready,
    },
  };
}
