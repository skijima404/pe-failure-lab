import type { NextTurnDecision } from "../orchestration/select-next-turn.ts";
import type { RoomState } from "../state/types.ts";

export interface TurnDebugDump {
  room_state_before: RoomState;
  decision_object: NextTurnDecision;
  prompt_input: unknown;
  raw_agent_output: unknown;
  normalized_agent_output: unknown;
  visible_output?: unknown;
  suppressed_output?: unknown;
  evaluation_links?: unknown;
  room_state_after: RoomState;
}

export function createTurnDebugDump(params: TurnDebugDump): TurnDebugDump {
  return params;
}
