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
  const needsInitialStakeholderReaction =
    roomState.exchange_state.initiating_actor_id === null &&
    roomState.recent_transcript.at(-1)?.speaker_id === "mika";
  const playerOutcome: TurnOutcome = {
    speaker_id: "player",
    speaker_name: speakerName,
    turn_owner: "player",
    text,
    updates: needsInitialStakeholderReaction
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
      : undefined,
  };

  return applyTurnOutcome(roomState, playerOutcome);
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
