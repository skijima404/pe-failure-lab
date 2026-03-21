import type { ActiveTopic, RoomState, TopicSummary, TopicType, TurnOutcome, TopicStatus } from "../state/types.ts";

interface TopicStateChange {
  active_topic: ActiveTopic;
  topic_status: TopicStatus;
  parking_lot: TopicSummary[];
}

const TOPIC_LABEL_BY_TYPE: Record<TopicType, string> = {
  "problem-framing": "Problem framing",
  "scope-boundary": "Scope boundary",
  "support-model": "Support model",
  ownership: "Ownership",
  "delivery-shape": "Delivery shape",
};

function deriveTopicLabel(topicType: TopicType, text: string, currentTopicLabel: string): string {
  if (topicType === "support-model") {
    if (/onboarding/i.test(text) && /boundary|narrow|exception/i.test(text)) {
      return "Onboarding support boundary";
    }
    if (/exception/i.test(text)) {
      return "Exception support boundary";
    }
    return "Support boundary";
  }

  if (topicType === "scope-boundary") {
    if (/first usable|first use|first team/i.test(text)) {
      return "First-use scope boundary";
    }
    if (/narrow|included|not taking over/i.test(text)) {
      return "Bounded platform scope";
    }
    return "Scope boundary";
  }

  if (topicType === "ownership") {
    if (/sponsor/i.test(text) && /owner|decision/i.test(text)) {
      return "Ownership and sponsorship";
    }
    if (/decision/i.test(text)) {
      return "Decision ownership";
    }
    return "Ownership follow-up";
  }

  if (topicType === "delivery-shape") {
    if (/reusable|bespoke/i.test(text)) {
      return "Reusable vs bespoke delivery shape";
    }
    if (/roadmap|sprint|move now/i.test(text)) {
      return "Near-term delivery shape";
    }
    return "Delivery shape";
  }

  if (topicType === "problem-framing") {
    if (/why now/i.test(text)) {
      return "Why now";
    }
    if (/current situation|pain|problem/i.test(text)) {
      return "Current problem framing";
    }
    return currentTopicLabel === TOPIC_LABEL_BY_TYPE[topicType] ? "Problem framing" : currentTopicLabel;
  }

  return TOPIC_LABEL_BY_TYPE[topicType];
}

function topicSignalScores(text: string): Record<TopicType, number> {
  return {
    "problem-framing": Number(/why now|problem|pain|current situation|what is happening/i.test(text)),
    "scope-boundary": Number(/scope|boundary|first usable|narrow|included|not taking over/i.test(text)),
    "support-model": Number(/support|onboarding|exception|operate|operational|absorb/i.test(text)),
    ownership: Number(/owner|ownership|sponsor|decision|who decides/i.test(text)),
    "delivery-shape": Number(/delivery|roadmap|workflow|sprint|bespoke|reusable/i.test(text)),
  };
}

function inferDominantTopicType(text: string, fallback: TopicType): { dominant: TopicType; dominantScore: number; currentScore: number } {
  const scores = topicSignalScores(text);
  let dominant = fallback;
  let dominantScore = scores[fallback];

  (Object.keys(scores) as TopicType[]).forEach((topicType) => {
    if (scores[topicType] > dominantScore) {
      dominant = topicType;
      dominantScore = scores[topicType];
    }
  });

  return {
    dominant,
    dominantScore,
    currentScore: scores[fallback],
  };
}

function isSubstantiveTurn(outcome: TurnOutcome): boolean {
  return outcome.text.trim().length >= 40;
}

export function deriveTopicState(roomState: RoomState, outcome: TurnOutcome): TopicStateChange {
  const currentTopic = roomState.active_topic;
  const currentStatus = roomState.topic_status;
  const nextTurnIndex = roomState.turn_index + 1;

  if (outcome.turn_owner === "facilitator") {
    return {
      active_topic: currentTopic,
      topic_status: currentStatus,
      parking_lot: roomState.parking_lot,
    };
  }

  const { dominant, dominantScore, currentScore } = inferDominantTopicType(outcome.text, currentTopic.topic_type);
  const strongDrift = dominant !== currentTopic.topic_type && dominantScore >= 1 && currentScore === 0;

  if (strongDrift) {
    const parkedTopic: TopicSummary = {
      topic_id: currentTopic.topic_id,
      label: currentTopic.label,
      parked_at_turn: nextTurnIndex,
    };

    return {
      active_topic: {
        topic_id: `${dominant}-${nextTurnIndex}`,
        label: deriveTopicLabel(dominant, outcome.text, currentTopic.label),
        opened_by: outcome.speaker_id,
        opened_at_turn: nextTurnIndex,
        topic_type: dominant,
        depth: 1,
        status: "active",
      },
      topic_status: "active",
      parking_lot: [...roomState.parking_lot, parkedTopic],
    };
  }

  if (isSubstantiveTurn(outcome) && dominant === currentTopic.topic_type && dominantScore >= 1) {
    return {
      active_topic: {
        ...currentTopic,
        depth: Math.min(currentTopic.depth + 1, 3),
      },
      topic_status: currentStatus,
      parking_lot: roomState.parking_lot,
    };
  }

  return {
    active_topic: currentTopic,
    topic_status: currentStatus,
    parking_lot: roomState.parking_lot,
  };
}

export function parkActiveTopic(roomState: RoomState, parkedAtTurn: number): RoomState {
  const parkedTopic: TopicSummary = {
    topic_id: roomState.active_topic.topic_id,
    label: roomState.active_topic.label,
    parked_at_turn: parkedAtTurn,
  };

  return {
    ...roomState,
    topic_status: "parked",
    active_topic: {
      ...roomState.active_topic,
      status: "parked",
    },
    parking_lot: [...roomState.parking_lot, parkedTopic],
  };
}

export function setActiveTopic(roomState: RoomState, nextTopic: ActiveTopic): RoomState {
  return {
    ...roomState,
    active_topic: nextTopic,
    topic_status: nextTopic.status,
  };
}
