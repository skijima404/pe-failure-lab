import { evaluateSession, type EvaluationContext, type SimulationReflectionReport } from "./report.ts";
import { buildEvaluatorEvidencePacket, type EvaluatorEvidencePacket } from "../transcripts/evaluator-evidence.ts";
import type { RoomState } from "../state/types.ts";

export interface LocalEvaluationResult {
  evidence_packet: EvaluatorEvidencePacket;
  reflection_report: SimulationReflectionReport;
  prose_shaping_mode: "local-first";
}

export function evaluateClosedSessionLocally(
  roomState: RoomState,
  context: EvaluationContext,
): LocalEvaluationResult {
  if (roomState.scene_phase !== "post-game") {
    throw new Error("Local evaluator can only run after the live meeting has ended.");
  }

  return {
    evidence_packet: buildEvaluatorEvidencePacket(roomState),
    reflection_report: evaluateSession(roomState, context),
    prose_shaping_mode: "local-first",
  };
}
