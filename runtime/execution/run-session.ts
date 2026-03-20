import { createTurnDebugDump, type TurnDebugDump } from "../observability/debug-dump.ts";
import { createTurnLog, type TurnLog } from "../observability/event-log.ts";
import { createLocalOpeningOutcome } from "./local-opening.ts";
import { prepareNextTurn } from "./run-turn.ts";
import type { RuntimeResponder } from "./model-client.ts";
import { applyTurnOutcome, computeStateChanges } from "../state/reducers.ts";
import type { RoomState } from "../state/types.ts";

export interface SessionStepResult {
  room_state: RoomState;
  turn_log: TurnLog;
  debug_dump: TurnDebugDump;
}

export async function runSessionStep(roomState: RoomState, responder: RuntimeResponder): Promise<SessionStepResult> {
  const preparedTurn = prepareNextTurn(roomState);
  const deliveryMode =
    preparedTurn.decision.owner === "facilitator" && preparedTurn.decision.intervention_reason === "session-opening"
      ? "local-opening"
      : "responder";
  const outcome =
    deliveryMode === "local-opening"
      ? createLocalOpeningOutcome(roomState)
      : await responder.respond({ roomState, preparedTurn });
  const nextRoomState = applyTurnOutcome(roomState, outcome);
  const stateChanges = computeStateChanges(roomState, nextRoomState);

  const turnLog = createTurnLog({
    roomStateBefore: roomState,
    roomStateAfter: nextRoomState,
    decision: preparedTurn.decision,
    promptInputSummary: summarizePromptInput(preparedTurn.prompt_input, preparedTurn.prompt_text, deliveryMode),
    agentOutputSummary: summarizeOutcome(outcome, deliveryMode),
    stateChanges,
  });

  const debugDump = createTurnDebugDump({
    room_state_before: roomState,
    decision_object: preparedTurn.decision,
    prompt_input: {
      input: preparedTurn.prompt_input,
      prompt_text: preparedTurn.prompt_text,
    },
    raw_agent_output: outcome,
    normalized_agent_output: outcome,
    room_state_after: nextRoomState,
  });

  return {
    room_state: nextRoomState,
    turn_log: turnLog,
    debug_dump: debugDump,
  };
}

export async function runSession(
  initialRoomState: RoomState,
  responder: RuntimeResponder,
  maxSteps = 5,
): Promise<SessionStepResult[]> {
  const results: SessionStepResult[] = [];
  let currentRoomState = initialRoomState;

  for (let index = 0; index < maxSteps; index += 1) {
    const result = await runSessionStep(currentRoomState, responder);
    results.push(result);
    currentRoomState = result.room_state;

    if (currentRoomState.close_readiness.ready) {
      break;
    }
  }

  return results;
}

function summarizePromptInput(
  promptInput: unknown,
  promptText: string,
  deliveryMode: "local-opening" | "responder",
): Record<string, unknown> {
  const promptLines = promptText.split("\n").map((line) => line.trim()).filter(Boolean);
  const promptExcerpt = promptLines.slice(0, 14).join("\n");

  if (!promptInput || typeof promptInput !== "object") {
    return {
      kind: "unknown",
      delivery_mode: deliveryMode,
      prompt_text_preview: promptText.slice(0, 180),
      prompt_text_excerpt: promptExcerpt,
    };
  }

  const record = promptInput as Record<string, unknown>;
  return {
    delivery_mode: deliveryMode,
    speaker_id: record.speaker_id ?? null,
    turn_role: record.turn_role ?? null,
    active_topic:
      typeof record.active_topic === "object" && record.active_topic
        ? (record.active_topic as Record<string, unknown>).label ?? null
        : record.active_topic ?? null,
    transition_goal: record.transition_goal ?? null,
    runtime_persona_core_concern:
      record.runtime_persona && typeof record.runtime_persona === "object"
        ? ((record.runtime_persona as Record<string, unknown>).core_concern ?? null)
        : null,
    prompt_focus:
      record.runtime_persona && typeof record.runtime_persona === "object"
        ? {
            core_concern: (record.runtime_persona as Record<string, unknown>).core_concern ?? null,
            day_to_day_pressure: (record.runtime_persona as Record<string, unknown>).day_to_day_pressure ?? null,
            protection_target: (record.runtime_persona as Record<string, unknown>).protection_target ?? null,
          }
        : null,
    prompt_text_preview: promptText.slice(0, 180),
    prompt_text_excerpt: promptExcerpt,
  };
}

function summarizeOutcome(
  outcome: { speaker_id: string; text: string },
  deliveryMode: "local-opening" | "responder",
): Record<string, unknown> {
  return {
    delivery_mode: deliveryMode,
    speaker_id: outcome.speaker_id,
    text_preview: outcome.text.slice(0, 140),
  };
}
