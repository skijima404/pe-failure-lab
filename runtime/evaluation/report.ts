import type { RoomState, TranscriptTurn } from "../state/types.ts";
import { renderVisibleReflectionReport } from "../presentation/visible-transcript.ts";

export type StructuralResult = "Stable" | "Strained" | "Drifting" | "Failed";
export type DraftProgress = "Fragmented" | "Advancing" | "Coalescing";

export interface SimulationReflectionOverview {
  scenario: string;
  role: string;
  date: string;
  session_mode: string;
  turn_count: number;
}

export interface SimulationReflectionReport {
  title: string;
  overview: SimulationReflectionOverview;
  structural_progress: string;
  structural_result: StructuralResult;
  evaluation_summary: string;
  draft_progress: DraftProgress;
  draft_progress_summary: string;
  key_decisions_made: string[];
  strengths_observed: string[];
  areas_to_improve: string[];
  suggested_next_steps: string[];
  optional_log_highlights: string[];
}

export interface EvaluationContext {
  scenario: string;
  role: string;
  date?: string;
  session_mode?: string;
}

export function evaluateSession(roomState: RoomState, context: EvaluationContext): SimulationReflectionReport {
  const structuralScore = computeStructuralScore(roomState);
  const structuralResult = scoreToStructuralResult(structuralScore);
  const draftProgress = scoreToDraftProgress(structuralScore, roomState);

  return {
    title: `Simulation Reflection Report: ${context.scenario} - ${context.role}`,
    overview: {
      scenario: context.scenario || roomState.session_setup.scenario,
      role: context.role,
      date: context.date ?? new Date().toISOString().slice(0, 10),
      session_mode: context.session_mode ?? roomState.session_setup.session_mode ?? "brainstorming workshop",
      turn_count: roomState.recent_transcript.length,
    },
    structural_progress: `${structuralScore}/5`,
    structural_result: structuralResult,
    evaluation_summary: buildEvaluationSummary(roomState, structuralScore, structuralResult),
    draft_progress: draftProgress,
    draft_progress_summary: buildDraftProgressSummary(draftProgress, roomState),
    key_decisions_made: deriveKeyDecisions(roomState.recent_transcript),
    strengths_observed: deriveStrengths(roomState),
    areas_to_improve: deriveAreasToImprove(roomState),
    suggested_next_steps: deriveNextSteps(roomState),
    optional_log_highlights: deriveLogHighlights(roomState.recent_transcript),
  };
}

export function formatReflectionReport(report: SimulationReflectionReport): string {
  return renderVisibleReflectionReport(report);
}

function computeStructuralScore(roomState: RoomState): number {
  const {
    strategic_clarity,
    scope_coherence,
    ownership_clarity,
    support_model_clarity,
    coalition_stability,
  } = roomState.structural_state;

  const average =
    (strategic_clarity + scope_coherence + ownership_clarity + support_model_clarity + coalition_stability) / 5;

  return Math.max(1, Math.min(5, Math.round(average)));
}

function scoreToStructuralResult(score: number): StructuralResult {
  if (score >= 4) {
    return "Stable";
  }
  if (score === 3) {
    return "Strained";
  }
  if (score === 2) {
    return "Drifting";
  }
  return "Failed";
}

function scoreToDraftProgress(score: number, roomState: RoomState): DraftProgress {
  if (score >= 4) {
    return "Coalescing";
  }

  if (score >= 3 || roomState.close_readiness.ready) {
    return "Advancing";
  }

  return "Fragmented";
}

function buildEvaluationSummary(roomState: RoomState, score: number, structuralResult: StructuralResult): string {
  const summaryParts = [
    `The session ended at ${score}/5 structural progress, which reads as ${structuralResult.toLowerCase()} for this early workshop phase.`,
    roomState.close_readiness.ready
      ? "The room reached a bounded next-step shape instead of staying purely exploratory."
      : "The room surfaced useful concerns, but the next-step shape stayed partially open.",
  ];

  if (roomState.structural_state.open_risks.length > 0) {
    summaryParts.push(`Remaining visible risks: ${roomState.structural_state.open_risks.join(", ")}.`);
  } else {
    summaryParts.push("No major open structural risk remained visible in the final state snapshot.");
  }

  return summaryParts.join(" ");
}

function buildDraftProgressSummary(draftProgress: DraftProgress, roomState: RoomState): string {
  if (draftProgress === "Coalescing") {
    return "The draft moved beyond rough positioning and started to hold a clearer operating shape.";
  }

  if (draftProgress === "Advancing") {
    return roomState.close_readiness.ready
      ? "The draft moved forward with a bounded next step, even though not every later-phase detail was resolved."
      : "The draft moved forward, but some boundaries still need another discussion cycle.";
  }

  return "The session surfaced useful pressure, but the draft did not yet consolidate into a clear next-step shape.";
}

function deriveKeyDecisions(turns: TranscriptTurn[]): string[] {
  const playerTurns = turns.filter((turn) => turn.speaker_id === "player");
  const decisions = playerTurns
    .map((turn) => turn.text)
    .filter((text) => /start|first move|not taking over|standardizing|boundary/i.test(text))
    .slice(-3);

  return decisions.length > 0 ? decisions : ["The player established a bounded initial direction rather than promising a full operating model."];
}

function deriveStrengths(roomState: RoomState): string[] {
  const strengths: string[] = [];

  if (roomState.structural_state.scope_coherence >= 3) {
    strengths.push("The session improved scope coherence instead of letting the platform idea stay fully abstract.");
  }
  if (roomState.structural_state.support_model_clarity >= 2) {
    strengths.push("Support-boundary language became clearer, which reduced hidden-support ambiguity.");
  }
  if (roomState.close_readiness.ready) {
    strengths.push("The room ended with a bounded next step rather than an unresolved open loop.");
  }

  return strengths.length > 0 ? strengths : ["The session kept the conversation legible enough to surface useful structural signals."];
}

function deriveAreasToImprove(roomState: RoomState): string[] {
  const areas: string[] = [];

  if (roomState.structural_state.ownership_clarity < 2) {
    areas.push("Ownership remained under-defined for a later follow-up discussion.");
  }
  if (roomState.structural_state.support_model_clarity < 2) {
    areas.push("Support expectations still need clearer operating boundaries.");
  }
  if (roomState.structural_state.open_risks.length > 0) {
    areas.push(`The session still carried visible risk around: ${roomState.structural_state.open_risks.join(", ")}.`);
  }

  return areas.length > 0 ? areas : ["The next improvement should focus on carrying this bounded direction into more explicit ownership and follow-through detail."];
}

function deriveNextSteps(roomState: RoomState): string[] {
  const nextSteps: string[] = [];

  if (roomState.structural_state.ownership_clarity < 3) {
    nextSteps.push("Clarify who owns the next design step and who only advises it.");
  }
  if (roomState.structural_state.support_model_clarity < 3) {
    nextSteps.push("Document the first support boundary so exception handling does not become the default service model.");
  }
  nextSteps.push("Carry the current bounded direction into the next meeting with clearer owner and support assumptions.");

  return nextSteps.slice(0, 3);
}

function deriveLogHighlights(turns: TranscriptTurn[]): string[] {
  return turns.slice(-3).map((turn) => `Turn ${turn.turn_index}: ${turn.speaker_name} - ${turn.text}`);
}
