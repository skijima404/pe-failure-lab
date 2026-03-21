import type { RoomState } from "./types.ts";

function deriveTopicTransitionReason(before: RoomState, after: RoomState): string | null {
  if (before.active_topic.topic_id !== after.active_topic.topic_id) {
    return "topic-drift";
  }

  if (before.active_topic.depth !== after.active_topic.depth) {
    return "same-topic-deepening";
  }

  if (before.active_topic.status !== after.active_topic.status && after.active_topic.status === "resolved-enough") {
    return "topic-resolved-enough";
  }

  if (before.active_topic.status !== after.active_topic.status) {
    return "topic-status-change";
  }

  return null;
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
      topic_id_before: before.active_topic.topic_id,
      topic_id_after: after.active_topic.topic_id,
      depth_before: before.active_topic.depth,
      depth_after: after.active_topic.depth,
      status_before: before.active_topic.status,
      status_after: after.active_topic.status,
      reason: deriveTopicTransitionReason(before, after),
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
