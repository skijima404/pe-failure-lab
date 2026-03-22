import { buildInitializationBrief, formatInitializationBrief, isStartSignal } from "./initialization.ts";
import {
  runNextRuntimeActorTurn,
  runRuntimeSession,
  type SessionStepResult,
  type RuntimeActorTurnOptions,
} from "./run-session.ts";
import { createInitialRoomState } from "../state/schema.ts";
import { applyTurnOutcome } from "../state/reducers.ts";
import type { RuntimeResponder } from "./runtime-responder.ts";
import type { RoomState, TurnOutcome } from "../state/types.ts";
import { evaluateClosedSessionLocally, type LocalEvaluationResult } from "../evaluation/local-evaluator.ts";
import type { EvaluationContext } from "../evaluation/report.ts";
import { buildWhisperSidecarPacket } from "../sidecars/packet-builders.ts";
import { generateLocalWhispers } from "../sidecars/local-whisper-sidecar.ts";
import { buildPlayerTurnJudgmentPacket } from "../orchestration/player-turn-judgment-packet.ts";
import type { AsyncPlayerTurnJudger } from "../orchestration/adapter-backed-player-turn-judger.ts";
import { judgePlayerTurnLocally } from "../orchestration/local-player-turn-judger.ts";

export interface SessionDriverResult {
  accepted: boolean;
  initialization_brief: string;
  rejection_reason: string | null;
  live_results: SessionStepResult[];
}

export interface SessionInitializationResult {
  room_state: RoomState;
  initialization_brief: string;
}

export interface SessionStartResult {
  accepted: boolean;
  room_state: RoomState;
  initialization_brief: string;
  rejection_reason: string | null;
}

export interface SessionCloseResult {
  room_state: RoomState;
  evaluation: LocalEvaluationResult | null;
}

function buildAcceptedPlayerTurnOutcome(
  roomState: RoomState,
  text: string,
  speakerName: string,
  mainSessionJudgmentOverride?: RoomState["main_session_judgment"],
): TurnOutcome {
  const needsInitialStakeholderReaction =
    roomState.exchange_state.initiating_actor_id === null &&
    roomState.recent_transcript.at(-1)?.speaker_id === "mika";

  return {
    speaker_id: "player",
    speaker_name: speakerName,
    turn_owner: "player",
    text,
    updates: {
      ...(needsInitialStakeholderReaction
        ? {
            exchange_state: {
              ...roomState.exchange_state,
              initiating_actor_id: "exec",
              awaiting_reaction_from: "exec",
              follow_up_count: 0,
              handoff_candidate_actor_ids: [],
              should_continue_current_exchange: true,
            },
          }
        : {}),
      ...(mainSessionJudgmentOverride ? { main_session_judgment: mainSessionJudgmentOverride } : {}),
    },
  };
}

function finalizeAcceptedPlayerMessage(nextState: RoomState, text: string): RoomState {
  if (!nextState.main_session_judgment.multi_perspective_needed) {
    return {
      ...nextState,
      sidecar_state: {
        ...nextState.sidecar_state,
        active_whispers: [],
      },
    };
  }

  const whisperPacket = buildWhisperSidecarPacket(nextState, text);
  const activeWhispers = generateLocalWhispers(nextState, whisperPacket);

  return {
    ...nextState,
    sidecar_state: {
      ...nextState.sidecar_state,
      active_whispers: activeWhispers,
    },
  };
}

export function initializeSession(sessionId: string, language = "en"): SessionInitializationResult {
  const roomState = createInitialRoomState(sessionId, language);
  return {
    room_state: {
      ...roomState,
      scene_phase: "initialization",
      active_speaker: null,
    },
    initialization_brief: formatInitializationBrief(buildInitializationBrief(roomState)),
  };
}

export function startSession(roomState: RoomState, startMessage: string): SessionStartResult {
  const initializationBrief = formatInitializationBrief(buildInitializationBrief(roomState));

  if (!isStartSignal(startMessage, roomState)) {
    return {
      accepted: false,
      room_state: roomState,
      initialization_brief: initializationBrief,
      rejection_reason: "start-signal-required",
    };
  }

  return {
    accepted: true,
    room_state: {
      ...roomState,
      scene_phase: roomState.scene_phase === "initialization" ? "opening" : roomState.scene_phase,
      active_speaker: "mika",
    },
    initialization_brief: initializationBrief,
    rejection_reason: null,
  };
}

export function acceptPlayerMessage(
  roomState: RoomState,
  text: string,
  speakerName = "Player",
): RoomState {
  const playerOutcome = buildAcceptedPlayerTurnOutcome(roomState, text, speakerName);
  return finalizeAcceptedPlayerMessage(applyTurnOutcome(roomState, playerOutcome), text);
}

export async function acceptPlayerMessageWithJudger(
  roomState: RoomState,
  text: string,
  judger: AsyncPlayerTurnJudger,
  speakerName = "Player",
): Promise<RoomState> {
  const packet = buildPlayerTurnJudgmentPacket(roomState, text);
  const judgment = await judger.judgePlayerTurn(packet);
  const playerOutcome = buildAcceptedPlayerTurnOutcome(roomState, text, speakerName, {
    meeting_layer: judgment.meeting_layer,
    last_player_utterance_type: judgment.utterance_type,
    last_player_intent: judgment.player_intent,
    multi_perspective_needed: judgment.multi_perspective_needed,
  });

  return finalizeAcceptedPlayerMessage(applyTurnOutcome(roomState, playerOutcome), text);
}

export function acceptPlayerMessageWithLocalJudger(
  roomState: RoomState,
  text: string,
  speakerName = "Player",
): RoomState {
  const packet = buildPlayerTurnJudgmentPacket(roomState, text);
  const judgment = judgePlayerTurnLocally(packet);
  const playerOutcome = buildAcceptedPlayerTurnOutcome(roomState, text, speakerName, {
    meeting_layer: judgment.meeting_layer,
    last_player_utterance_type: judgment.utterance_type,
    last_player_intent: judgment.player_intent,
    multi_perspective_needed: judgment.multi_perspective_needed,
  });

  return finalizeAcceptedPlayerMessage(applyTurnOutcome(roomState, playerOutcome), text);
}

export async function runNextRuntimeActorTurnFromState(
  roomState: RoomState,
  responder: RuntimeResponder,
  options: RuntimeActorTurnOptions = {},
): Promise<SessionStepResult> {
  return runNextRuntimeActorTurn(roomState, responder, options);
}

export function evaluateIfSessionClosed(
  roomState: RoomState,
  context: EvaluationContext,
): LocalEvaluationResult | null {
  if (roomState.scene_phase !== "post-game") {
    return null;
  }

  return evaluateClosedSessionLocally(roomState, context);
}

export async function runSessionFromPlayerStart(
  roomState: RoomState,
  startMessage: string,
  responder: RuntimeResponder,
  maxSteps = 3,
): Promise<SessionDriverResult> {
  const startResult = startSession(roomState, startMessage);

  if (!startResult.accepted) {
    return {
      accepted: false,
      initialization_brief: startResult.initialization_brief,
      rejection_reason: startResult.rejection_reason,
      live_results: [],
    };
  }

  const liveResults = await runRuntimeSession(startResult.room_state, responder, maxSteps);

  return {
    accepted: true,
    initialization_brief: startResult.initialization_brief,
    rejection_reason: null,
    live_results: liveResults,
  };
}
