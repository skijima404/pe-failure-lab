import { buildInitializationBrief, formatInitializationBrief, isStartSignal } from "./initialization.ts";
import { runSession, type SessionStepResult } from "./run-session.ts";
import type { RuntimeResponder } from "./model-client.ts";
import type { RoomState } from "../state/types.ts";

export interface SessionDriverResult {
  accepted: boolean;
  initialization_brief: string;
  rejection_reason: string | null;
  live_results: SessionStepResult[];
}

export async function runSessionFromPlayerStart(
  roomState: RoomState,
  startMessage: string,
  responder: RuntimeResponder,
  maxSteps = 3,
): Promise<SessionDriverResult> {
  const initializationBrief = formatInitializationBrief(buildInitializationBrief(roomState));

  if (!isStartSignal(startMessage, roomState)) {
    return {
      accepted: false,
      initialization_brief: initializationBrief,
      rejection_reason: "start-signal-required",
      live_results: [],
    };
  }

  const liveResults = await runSession(roomState, responder, maxSteps);

  return {
    accepted: true,
    initialization_brief: initializationBrief,
    rejection_reason: null,
    live_results: liveResults,
  };
}
