import type { ActiveTopic, RoomState, TopicSummary } from "../state/types.ts";

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
