import { ScriptedResponder } from "../execution/model-client.ts";
import { runSession, type SessionStepResult } from "../execution/run-session.ts";
import { createInitialRoomState } from "../state/schema.ts";
import type { RoomState, ScriptedTurnOutcome } from "../state/types.ts";

export interface FixtureRunResult {
  results: SessionStepResult[];
  mismatches: string[];
}

export async function runScriptedFixture(
  scriptedOutcomes: ScriptedTurnOutcome[],
  sessionId = "fixture-session",
  initialRoomState?: RoomState,
): Promise<FixtureRunResult> {
  const roomState = initialRoomState ?? createInitialRoomState(sessionId);
  const responder = new ScriptedResponder(scriptedOutcomes);
  const results = await runSession(roomState, responder, scriptedOutcomes.length);

  const mismatches = results.flatMap((result, index) => {
    const expected = scriptedOutcomes[index]?.expected_selection_reason;
    if (!expected || expected === result.turn_log.selection_reason) {
      return [];
    }

    return [
      `turn ${index + 1}: expected selection_reason=${expected}, actual=${result.turn_log.selection_reason}`,
    ];
  });

  return {
    results,
    mismatches,
  };
}
