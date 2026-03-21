import { createTurnDebugDump, type TurnDebugDump } from "../observability/debug-dump.ts";
import { createTurnLog, type TurnLog } from "../observability/event-log.ts";
import { createLocalOpeningOutcome } from "./local-opening.ts";
import { prepareNextRuntimeTurn } from "./prepare-runtime-turn.ts";
import type { RuntimeResponder } from "./runtime-responder.ts";
import { summarizePromptInput, summarizeTurnOutcome, type TurnDeliveryMode } from "./turn-summary.ts";
import { applyTurnOutcome, computeStateChanges } from "../state/reducers.ts";
import type { RoomState } from "../state/types.ts";

export interface SessionStepResult {
  room_state: RoomState;
  turn_log: TurnLog;
  debug_dump: TurnDebugDump;
}

export interface RuntimeActorTurnOptions {
  opening_mode?: "local" | "responder";
}

export async function runNextRuntimeActorTurn(
  roomState: RoomState,
  responder: RuntimeResponder,
  options: RuntimeActorTurnOptions = {},
): Promise<SessionStepResult> {
  if (roomState.scene_phase === "post-game") {
    throw new Error("runNextRuntimeActorTurn cannot execute after the meeting has ended.");
  }

  const preparedTurn = prepareNextRuntimeTurn(roomState);

  if (preparedTurn.decision.owner === "player") {
    throw new Error("runNextRuntimeActorTurn cannot execute a player-owned turn. Accept player input first.");
  }

  return executePreparedTurn(roomState, preparedTurn, responder, options.opening_mode ?? "local");
}

export async function runRuntimeSessionStep(roomState: RoomState, responder: RuntimeResponder): Promise<SessionStepResult> {
  const preparedTurn = prepareNextRuntimeTurn(roomState);
  return executePreparedTurn(roomState, preparedTurn, responder, "local");
}

async function executePreparedTurn(
  roomState: RoomState,
  preparedTurn: ReturnType<typeof prepareNextRuntimeTurn>,
  responder: RuntimeResponder,
  openingMode: "local" | "responder",
): Promise<SessionStepResult> {
  const deliveryMode: TurnDeliveryMode =
    preparedTurn.decision.owner === "facilitator" &&
    preparedTurn.decision.intervention_reason === "session-opening" &&
    openingMode === "local"
      ? "local-opening"
      : "responder";
  const outcome =
    deliveryMode === "local-opening"
      ? createLocalOpeningOutcome(roomState)
      : await responder.respond({ roomState, preparedTurn });
  const lifecycleOutcome =
    preparedTurn.decision.owner === "facilitator" && preparedTurn.decision.intervention_reason === "closing-transition"
      ? {
          ...outcome,
          updates: {
            ...outcome.updates,
            scene_phase: "post-game" as const,
            active_speaker: null,
          },
        }
      : outcome;
  const nextRoomState = applyTurnOutcome(roomState, lifecycleOutcome);
  const stateChanges = computeStateChanges(roomState, nextRoomState);

  const turnLog = createTurnLog({
    roomStateBefore: roomState,
    roomStateAfter: nextRoomState,
    decision: preparedTurn.decision,
    promptInputSummary: summarizePromptInput(preparedTurn.prompt_input, preparedTurn.prompt_text, deliveryMode),
    agentOutputSummary: summarizeTurnOutcome(preparedTurn.decision.speaker_id, lifecycleOutcome, deliveryMode),
    stateChanges,
  });

  const debugDump = createTurnDebugDump({
    room_state_before: roomState,
    decision_object: preparedTurn.decision,
    prompt_input: {
      input: preparedTurn.prompt_input,
      prompt_text: preparedTurn.prompt_text,
    },
    raw_agent_output: lifecycleOutcome,
    normalized_agent_output: lifecycleOutcome,
    room_state_after: nextRoomState,
  });

  return {
    room_state: nextRoomState,
    turn_log: turnLog,
    debug_dump: debugDump,
  };
}

export async function runRuntimeSession(
  initialRoomState: RoomState,
  responder: RuntimeResponder,
  maxSteps = 5,
): Promise<SessionStepResult[]> {
  const results: SessionStepResult[] = [];
  let currentRoomState = initialRoomState;

  for (let index = 0; index < maxSteps; index += 1) {
    const result = await runRuntimeSessionStep(currentRoomState, responder);
    results.push(result);
    currentRoomState = result.room_state;

    if (currentRoomState.close_readiness.ready) {
      break;
    }
  }

  return results;
}
