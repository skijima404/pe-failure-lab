import type { SimulationReflectionReport } from "../evaluation/report.ts";
import type { TranscriptTurn } from "../state/types.ts";

export interface VisibleTranscriptSections {
  initialization_block: string;
  live_transcript_block: string;
  reflection_block: string | null;
}

function formatVisibleTurn(turn: TranscriptTurn): string {
  return `${turn.speaker_name}: ${turn.text}`;
}

export function buildVisibleTranscriptSections(params: {
  initializationBrief: string;
  transcriptTurns: TranscriptTurn[];
  reflectionText?: string | null;
}): VisibleTranscriptSections {
  return {
    initialization_block: params.initializationBrief.trim(),
    live_transcript_block: params.transcriptTurns.map(formatVisibleTurn).join("\n\n").trim(),
    reflection_block: params.reflectionText?.trim() || null,
  };
}

export function renderVisibleTranscript(params: {
  initializationBrief: string;
  transcriptTurns: TranscriptTurn[];
  reflectionText?: string | null;
}): string {
  const sections = buildVisibleTranscriptSections(params);
  return [sections.initialization_block, sections.live_transcript_block, sections.reflection_block]
    .filter((section) => section && section.length > 0)
    .join("\n\n");
}

export function renderVisibleReflectionReport(report: SimulationReflectionReport): string {
  return [
    `# ${report.title}`,
    "",
    "## 1. Overview",
    `- Scenario: ${report.overview.scenario}`,
    `- Role: ${report.overview.role}`,
    `- Date: ${report.overview.date}`,
    `- Session mode: ${report.overview.session_mode}`,
    `- Turn count: ${report.overview.turn_count}`,
    "",
    "## 2. Evaluation Summary",
    `- Structural Progress: \`${report.structural_progress}\``,
    `- Structural Result: \`${report.structural_result}\``,
    "",
    "Summary:",
    report.evaluation_summary,
    "",
    "## 3. Draft Progress",
    `- \`${report.draft_progress}\``,
    report.draft_progress_summary,
    "",
    "## 4. Key Decisions Made",
    ...report.key_decisions_made.map((item) => `- ${item}`),
    "",
    "## 5. Strengths Observed",
    ...report.strengths_observed.map((item) => `- ${item}`),
    "",
    "## 6. Areas to Improve",
    ...report.areas_to_improve.map((item) => `- ${item}`),
    "",
    "## 7. Suggested Next Steps",
    ...report.suggested_next_steps.map((item) => `- ${item}`),
    ...(report.optional_log_highlights.length > 0
      ? ["", "## 8. Optional Log Highlights", ...report.optional_log_highlights.map((item) => `- ${item}`)]
      : []),
  ].join("\n");
}
