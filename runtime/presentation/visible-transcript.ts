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
  const isJapanese = report.overview.language.startsWith("ja");

  return [
    `# ${isJapanese ? `シミュレーション振り返りレポート: ${report.overview.scenario} - ${report.overview.role}` : report.title}`,
    "",
    isJapanese ? "## 1. 概要" : "## 1. Overview",
    `- ${isJapanese ? "シナリオ" : "Scenario"}: ${report.overview.scenario}`,
    `- ${isJapanese ? "役割" : "Role"}: ${report.overview.role}`,
    `- ${isJapanese ? "日付" : "Date"}: ${report.overview.date}`,
    `- ${isJapanese ? "セッションモード" : "Session mode"}: ${report.overview.session_mode}`,
    `- ${isJapanese ? "ターン数" : "Turn count"}: ${report.overview.turn_count}`,
    "",
    isJapanese ? "## 2. 評価サマリー" : "## 2. Evaluation Summary",
    `- ${isJapanese ? "Structural Progress" : "Structural Progress"}: \`${report.structural_progress}\``,
    `- ${isJapanese ? "Structural Result" : "Structural Result"}: \`${isJapanese ? localizeResultLabel(report.structural_result) : report.structural_result}\``,
    "",
    isJapanese ? "Summary:" : "Summary:",
    report.evaluation_summary,
    "",
    isJapanese ? "Aspect Checks:" : "Aspect Checks:",
    ...report.structural_aspects.map(
      (aspect) => `- ${isJapanese ? localizeAspectLabel(aspect.aspect) : aspect.aspect}: \`${aspect.score}\` - ${aspect.evidence}`,
    ),
    "",
    isJapanese ? "## 3. ドラフト進捗" : "## 3. Draft Progress",
    `- \`${isJapanese ? localizeDraftProgressLabel(report.draft_progress) : report.draft_progress}\``,
    report.draft_progress_summary,
    "",
    isJapanese ? "## 4. 主な判断" : "## 4. Key Decisions Made",
    ...report.key_decisions_made.map((item) => `- ${item}`),
    "",
    isJapanese ? "## 5. 良かった点" : "## 5. Strengths Observed",
    ...report.strengths_observed.map((item) => `- ${item}`),
    "",
    isJapanese ? "## 6. 改善余地" : "## 6. Areas to Improve",
    ...report.areas_to_improve.map((item) => `- ${item}`),
    "",
    isJapanese ? "## 7. 次の一手" : "## 7. Suggested Next Steps",
    ...report.suggested_next_steps.map((item) => `- ${item}`),
    ...(report.optional_log_highlights.length > 0
      ? [
          "",
          isJapanese ? "## 8. ログハイライト" : "## 8. Optional Log Highlights",
          ...report.optional_log_highlights.map((item) => `- ${item}`),
        ]
      : []),
  ].join("\n");
}

function localizeResultLabel(result: SimulationReflectionReport["structural_result"]): string {
  switch (result) {
    case "Stable":
      return "安定";
    case "Strained":
      return "前進したが緊張あり";
    case "Drifting":
      return "漂流気味";
    case "Failed":
      return "失敗寄り";
  }
}

function localizeDraftProgressLabel(progress: SimulationReflectionReport["draft_progress"]): string {
  switch (progress) {
    case "Fragmented":
      return "断片的";
    case "Advancing":
      return "前進";
    case "Coalescing":
      return "収束中";
  }
}

function localizeAspectLabel(aspect: SimulationReflectionReport["structural_aspects"][number]["aspect"]): string {
  switch (aspect) {
    case "Investment":
      return "投資";
    case "Adoption":
      return "導入";
    case "Interfaces":
      return "利用インターフェース";
    case "Operations":
      return "運用";
    case "Measurement":
      return "計測";
  }
}
