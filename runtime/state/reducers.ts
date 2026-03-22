import type { RoomState, TurnOutcome } from "./types.ts";
import type { WhisperHistoryEntry, WhisperInjection } from "../sidecars/types.ts";
import { deriveParticipantStates } from "./participant-updates.ts";
import { deriveExchangeState } from "./exchange-state.ts";
import { computeStateChanges } from "./state-change-summary.ts";
import { deriveCloseReadiness, deriveStructuralState } from "./structural-state.ts";
import { appendTranscriptTurn } from "./transcript.ts";
import { deriveTopicState } from "../orchestration/topic-management.ts";
import { analyzePlayerTurn } from "../orchestration/player-turn-analysis.ts";

function deriveMainSessionJudgment(roomState: RoomState, outcome: TurnOutcome): RoomState["main_session_judgment"] {
  if (outcome.turn_owner !== "player") {
    return roomState.main_session_judgment;
  }

  const judgment = analyzePlayerTurn(roomState, outcome.text);

  return {
    meeting_layer: judgment.meeting_layer,
    last_player_utterance_type: judgment.utterance_type,
    last_player_intent: judgment.player_intent,
    multi_perspective_needed: judgment.multi_perspective_needed,
  };
}

function deriveSidecarState(roomState: RoomState, outcome: TurnOutcome, nextTurnIndex: number): RoomState["sidecar_state"] {
  const history: WhisperHistoryEntry[] = [...roomState.sidecar_state.whisper_history];
  const activeWhispers: WhisperInjection[] = [];

  for (const whisper of roomState.sidecar_state.active_whispers) {
    const consumed =
      outcome.speaker_id === whisper.target_participant_id && outcome.turn_owner !== "player" && outcome.turn_owner !== "facilitator";
    const expired = nextTurnIndex >= whisper.expires_after_turn;

    if (consumed || expired) {
      history.push({
        ...whisper,
        final_status: consumed ? "consumed" : "expired",
        final_turn: nextTurnIndex,
      });
      continue;
    }

    activeWhispers.push(whisper);
  }

  return {
    active_whispers: activeWhispers,
    whisper_history: history,
  };
}

export function applyTurnOutcome(roomState: RoomState, outcome: TurnOutcome): RoomState {
  const transcriptTurn = appendTranscriptTurn(roomState, outcome);
  const updates = outcome.updates ?? {};
  const participantStates = updates.participant_states ?? deriveParticipantStates(roomState, outcome);
  const exchangeState = updates.exchange_state ?? deriveExchangeState(roomState, outcome);
  const structuralState = updates.structural_state ?? deriveStructuralState(roomState, outcome);
  const mainSessionJudgment = updates.main_session_judgment ?? deriveMainSessionJudgment(roomState, outcome);
  const sidecarState = updates.sidecar_state ?? deriveSidecarState(roomState, outcome, transcriptTurn.turn_index);
  const derivedTopicState = deriveTopicState(roomState, outcome);
  const activeTopic = updates.active_topic ?? derivedTopicState.active_topic;
  const roomStatePreview = {
    ...roomState,
    turn_index: transcriptTurn.turn_index,
    active_speaker: updates.active_speaker ?? outcome.speaker_id,
    active_topic: activeTopic,
    topic_status: updates.topic_status ?? derivedTopicState.topic_status,
    exchange_state: exchangeState,
    participant_states: participantStates,
    structural_state: structuralState,
    main_session_judgment: mainSessionJudgment,
    sidecar_state: sidecarState,
    recent_transcript: [...roomState.recent_transcript, transcriptTurn].slice(-12),
  };
  const closeReadiness = updates.close_readiness ?? deriveCloseReadiness(roomState, outcome, roomStatePreview);
  const topicStatus = updates.topic_status ?? (closeReadiness.ready ? "resolved-enough" : derivedTopicState.topic_status);
  const nextActiveTopic =
    updates.active_topic ??
    ((activeTopic.status !== topicStatus || activeTopic !== roomState.active_topic)
      ? { ...activeTopic, status: topicStatus }
      : roomState.active_topic);

  return {
    ...roomState,
    turn_index: transcriptTurn.turn_index,
    active_speaker: updates.active_speaker ?? outcome.speaker_id,
    scene_phase:
      updates.scene_phase ??
      (roomState.scene_phase === "opening" && outcome.turn_owner === "facilitator" ? "discussion" : roomState.scene_phase),
    topic_status: topicStatus,
    active_topic: nextActiveTopic,
    parking_lot: updates.parking_lot ?? derivedTopicState.parking_lot,
    exchange_state: exchangeState,
    participant_states: participantStates,
    structural_state: structuralState,
    close_readiness: closeReadiness,
    main_session_judgment: mainSessionJudgment,
    sidecar_state: sidecarState,
    recent_transcript: [...roomState.recent_transcript, transcriptTurn].slice(-12),
  };
}
export { computeStateChanges } from "./state-change-summary.ts";
