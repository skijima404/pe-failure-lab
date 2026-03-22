import type { RoomState, TranscriptTurn } from "../state/types.ts";
import { renderVisibleReflectionReport } from "../presentation/visible-transcript.ts";

export type StructuralResult = "Stable" | "Strained" | "Drifting" | "Failed";
export type DraftProgress = "Fragmented" | "Advancing" | "Coalescing";
export type StructuralAspectName = "Investment" | "Adoption" | "Interfaces" | "Operations" | "Measurement";

export interface StructuralAspectAssessment {
  aspect: StructuralAspectName;
  score: 0 | 1;
  reached_level_2: boolean;
  evidence: string;
}

export interface SimulationReflectionOverview {
  scenario: string;
  role: string;
  date: string;
  session_mode: string;
  turn_count: number;
  language: string;
}

export interface SimulationReflectionReport {
  title: string;
  overview: SimulationReflectionOverview;
  structural_progress: string;
  structural_result: StructuralResult;
  structural_aspects: StructuralAspectAssessment[];
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
  const structuralAspects = evaluateStructuralAspects(roomState);
  const structuralScore = structuralAspects.reduce((total, aspect) => total + aspect.score, 0);
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
      language: roomState.language,
    },
    structural_progress: `${structuralScore}/5`,
    structural_result: structuralResult,
    structural_aspects: structuralAspects,
    evaluation_summary: buildEvaluationSummary(roomState, structuralAspects, structuralScore, structuralResult),
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

function evaluateStructuralAspects(roomState: RoomState): StructuralAspectAssessment[] {
  const isJapanese = roomState.language.startsWith("ja");
  const transcriptText = roomState.recent_transcript.map((turn) => turn.text).join("\n");
  const normalizedText = transcriptText.toLowerCase();
  const openRisks = roomState.structural_state.open_risks;
  const unresolvedSupportBoundary = openRisks.includes("support-boundary-not-yet-clear");
  const unresolvedOwnership = openRisks.includes("ownership-follow-up-not-yet-clear");

  const hasReusablePathSignal = hasAnySignal(normalizedText, [
    "template",
    "self-service",
    "standard path",
    "one pager",
    "guide",
    "workflow",
    "onboarding",
    "playbook",
    "セルフサービス",
    "テンプレート",
    "標準",
    "入口",
    "導線",
    "ワンページ",
    "ガイド",
  ]);
  const hasBoundedSupportSignal = hasAnySignal(normalizedText, [
    "boundary",
    "not taking over",
    "exception",
    "out of scope",
    "support boundary",
    "bounded",
    "対象外",
    "例外",
    "境界",
    "責任範囲",
    "支援範囲",
  ]);
  const hasAdoptionSignal = hasAnySignal(normalizedText, [
    "pilot",
    "beta",
    "can try",
    "usable",
    "onboarding",
    "feedback",
    "trial",
    "closed beta",
    "試せる",
    "使える",
    "フィードバック",
    "導入",
    "オンボーディング",
  ]);
  const hasMeasurementSignal = hasAnySignal(normalizedText, [
    "lead time",
    "metric",
    "measure",
    "feedback",
    "review",
    "success",
    "vsm",
    "リードタイム",
    "測定",
    "評価",
    "確認",
    "フィードバック",
    "効果",
  ]);
  const hasExplicitOwnerSignal = hasAnySignal(normalizedText, [
    "owner",
    "ownership",
    "who owns",
    "sponsor",
    "責任者",
    "オーナー",
    "担当",
  ]);
  const hasNextStepSignal =
    roomState.close_readiness.ready ||
    hasAnySignal(normalizedText, [
      "next step",
      "first move",
      "review",
      "closed beta",
      "we will",
      "まず何を作り",
      "次の一手",
      "次に",
      "closed beta",
    ]);

  return [
    {
      aspect: "Investment",
      ...buildAspectScore(
        (roomState.structural_state.support_model_clarity >= 2 || roomState.structural_state.scope_coherence >= 3) &&
          hasBoundedSupportSignal,
        localizeEvidence(
          isJapanese,
          "The proposal stayed bounded enough to suggest durable platform investment instead of open-ended heroic support.",
          "提案は十分に境界付きで、場当たり的な個別支援ではなく、持続可能な Platform 投資へ進める形に見えました。",
        ),
        localizeEvidence(
          isJapanese,
          "The discussion did not yet make sustainable platform investment more credible than reactive support.",
          "今回の議論だけでは、反応的な支援よりも持続可能な Platform 投資のほうが妥当だとはまだ言い切れません。",
        ),
      ),
    },
    {
      aspect: "Adoption",
      ...buildAspectScore(
        hasAdoptionSignal && roomState.structural_state.coalition_stability >= 3,
        localizeEvidence(
          isJapanese,
          "At least one plausible user path or trial shape became concrete enough that real uptake feels believable.",
          "少なくとも一つ、利用側が実際に試せそうな導入経路や試行の形が具体化しました。",
        ),
        localizeEvidence(
          isJapanese,
          "The direction still reads more like aspiration than something a team would meaningfully try soon.",
          "この方向性はまだ、チームが近いうちに本当に試す案というより理想像に寄って見えます。",
        ),
      ),
    },
    {
      aspect: "Interfaces",
      ...buildAspectScore(
        hasReusablePathSignal && roomState.structural_state.support_model_clarity >= 2,
        localizeEvidence(
          isJapanese,
          "A clearer engagement path emerged through templates, self-service, or explicit entry guidance rather than bespoke requests.",
          "個別相談ベースではなく、テンプレートやセルフサービス、明示的な入口案内を通じた利用経路が見えてきました。",
        ),
        localizeEvidence(
          isJapanese,
          "The engagement path is still too close to bespoke request flow or informal dependency on platform people.",
          "利用の入口はまだ、個別依頼や Platform 担当者への属人的な依存に近いままです。",
        ),
      ),
    },
    {
      aspect: "Operations",
      ...buildAspectScore(
        scoreOperationalSignals({
          hasBoundedSupportSignal,
          hasExplicitOwnerSignal,
          hasNextStepSignal,
          supportModelClarity: roomState.structural_state.support_model_clarity,
          ownershipClarity: roomState.structural_state.ownership_clarity,
          unresolvedSupportBoundary,
          unresolvedOwnership,
        }) >= 2,
        localizeEvidence(
          isJapanese,
          "Support scope, next steps, and operating expectations became concrete enough to suggest a more credible operating foundation.",
          "支援範囲、次の打ち手、運用上の前提がある程度具体化し、運用基盤としての見通しが出ました。",
        ),
        localizeEvidence(
          isJapanese,
          "Support scope, ownership, or next-step handling still remained too ambiguous to count as a credible operating foundation.",
          "支援範囲、オーナーシップ、次の打ち手の扱いにまだ曖昧さが残り、運用基盤としては弱いままです。",
        ),
      ),
    },
    {
      aspect: "Measurement",
      ...buildAspectScore(
        hasMeasurementSignal,
        localizeEvidence(
          isJapanese,
          "The session named observable follow-up signals that can be checked later instead of relying on goodwill alone.",
          "後で確認できる観測可能な指標やフィードバック項目が挙がり、善意頼みではない見直しができそうです。",
        ),
        localizeEvidence(
          isJapanese,
          "The session did not yet name enough observable follow-up signals to make later review consistent.",
          "後で一貫して見直せるだけの観測可能な指標や確認項目はまだ十分に挙がっていません。",
        ),
      ),
    },
  ];
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

function buildEvaluationSummary(
  roomState: RoomState,
  aspects: StructuralAspectAssessment[],
  score: number,
  structuralResult: StructuralResult,
): string {
  const isJapanese = roomState.language.startsWith("ja");
  const reached = aspects.filter((aspect) => aspect.score === 1).map((aspect) => aspect.aspect);
  const missed = aspects.filter((aspect) => aspect.score === 0).map((aspect) => aspect.aspect);
  const summaryParts = isJapanese
    ? [
        `このセッションの Structural Progress は ${score}/5 で、CNCF に沿った5つの観点で見ると、この初期ワークショップ段階では ${localizeStructuralResult(structuralResult, true)} と読めます。`,
        roomState.close_readiness.ready
          ? "部屋は探索だけで終わらず、境界付きの次の一手まで到達しました。"
          : "有益な論点は出ましたが、次の一手の形はまだ部分的に開いたままでした。",
      ]
    : [
        `The session ended at ${score}/5 structural progress, based on the five CNCF-aligned structural aspects, which reads as ${structuralResult.toLowerCase()} for this early workshop phase.`,
        roomState.close_readiness.ready
          ? "The room reached a bounded next-step shape instead of staying purely exploratory."
          : "The room surfaced useful concerns, but the next-step shape stayed partially open.",
      ];

  if (reached.length > 0) {
    summaryParts.push(
      isJapanese
        ? `この会議で Level 2 以上に届いたと見なせる観点: ${reached.join(", ")}。`
        : `Aspects that credibly reached Level 2 or higher in this meeting: ${reached.join(", ")}.`,
    );
  }

  if (missed.length > 0) {
    summaryParts.push(
      isJapanese
        ? `まだ Level 1 のパターンに留まって見える観点: ${missed.join(", ")}。`
        : `Aspects that still looked trapped in Level 1 patterns: ${missed.join(", ")}.`,
    );
  }

  if (roomState.structural_state.open_risks.length > 0) {
    summaryParts.push(
      isJapanese
        ? `最後の時点で見えていたリスク: ${roomState.structural_state.open_risks.join(", ")}。`
        : `Remaining visible risks: ${roomState.structural_state.open_risks.join(", ")}.`,
    );
  } else {
    summaryParts.push(
      isJapanese
        ? "最後の時点で大きな未解決の structural risk は見えていませんでした。"
        : "No major open structural risk remained visible in the final state snapshot.",
    );
  }

  return summaryParts.join(" ");
}

function buildDraftProgressSummary(draftProgress: DraftProgress, roomState: RoomState): string {
  const isJapanese = roomState.language.startsWith("ja");
  if (draftProgress === "Coalescing") {
    return isJapanese
      ? "ドラフトは粗い方向づけを超え、より明確な運用イメージを持ち始めました。"
      : "The draft moved beyond rough positioning and started to hold a clearer operating shape.";
  }

  if (draftProgress === "Advancing") {
    return roomState.close_readiness.ready
      ? isJapanese
        ? "ドラフトは前進し、後工程の細部が未確定でも境界付きの次の一手までは見えました。"
        : "The draft moved forward with a bounded next step, even though not every later-phase detail was resolved."
      : isJapanese
        ? "ドラフトは前進しましたが、いくつかの境界はまだ次の議論で詰める必要があります。"
        : "The draft moved forward, but some boundaries still need another discussion cycle.";
  }

  return isJapanese
    ? "このセッションでは有益な圧力や論点は出ましたが、ドラフトはまだ明確な次の一手の形にまとまり切っていません。"
    : "The session surfaced useful pressure, but the draft did not yet consolidate into a clear next-step shape.";
}

function deriveKeyDecisions(turns: TranscriptTurn[]): string[] {
  const isJapanese = turns.some((turn) => /[ぁ-んァ-ン一-龥]/.test(turn.text));
  const playerTurns = turns.filter((turn) => turn.speaker_id === "player");
  const decisions = playerTurns
    .map((turn) => turn.text)
    .filter((text) => /start|first move|not taking over|standardizing|boundary/i.test(text))
    .slice(-3);

  return decisions.length > 0
    ? decisions
    : [
        isJapanese
          ? "プレイヤーは、全面的な運用モデルを約束するのではなく、境界付きの最初の方向性を置きました。"
          : "The player established a bounded initial direction rather than promising a full operating model.",
      ];
}

function deriveStrengths(roomState: RoomState): string[] {
  const isJapanese = roomState.language.startsWith("ja");
  const strengths: string[] = [];

  if (roomState.structural_state.scope_coherence >= 3) {
    strengths.push(
      isJapanese
        ? "Platform の話を抽象論のままにせず、対象範囲のまとまりを前に進められました。"
        : "The session improved scope coherence instead of letting the platform idea stay fully abstract.",
    );
  }
  if (roomState.structural_state.support_model_clarity >= 2) {
    strengths.push(
      isJapanese
        ? "支援境界の言い方が明確になり、隠れた支援期待の曖昧さを減らせました。"
        : "Support-boundary language became clearer, which reduced hidden-support ambiguity.",
    );
  }
  if (roomState.close_readiness.ready) {
    strengths.push(
      isJapanese
        ? "部屋は未解決のまま開いたループで終わらず、境界付きの次の一手で閉じられました。"
        : "The room ended with a bounded next step rather than an unresolved open loop.",
    );
  }

  return strengths.length > 0
    ? strengths
    : [
        isJapanese
          ? "会話の見通しは保たれており、構造的に重要なシグナルを拾える状態は維持できました。"
          : "The session kept the conversation legible enough to surface useful structural signals.",
      ];
}

function deriveAreasToImprove(roomState: RoomState): string[] {
  const isJapanese = roomState.language.startsWith("ja");
  const areas: string[] = [];

  if (roomState.structural_state.ownership_clarity < 2) {
    areas.push(
      isJapanese
        ? "オーナーシップはまだ弱く、次回以降で誰が持つかを詰める必要があります。"
        : "Ownership remained under-defined for a later follow-up discussion.",
    );
  }
  if (roomState.structural_state.support_model_clarity < 2) {
    areas.push(
      isJapanese
        ? "支援期待にはまだ曖昧さがあり、運用上の境界をさらに明確にする必要があります。"
        : "Support expectations still need clearer operating boundaries.",
    );
  }
  if (roomState.structural_state.open_risks.length > 0) {
    areas.push(
      isJapanese
        ? `このセッションにはまだ、${roomState.structural_state.open_risks.join(", ")} に関する見えているリスクが残っています。`
        : `The session still carried visible risk around: ${roomState.structural_state.open_risks.join(", ")}.`,
    );
  }

  return areas.length > 0
    ? areas
    : [
        isJapanese
          ? "次は、この境界付きの方向性をより明確なオーナーシップと実行フォローへつなぐことに集中するとよさそうです。"
          : "The next improvement should focus on carrying this bounded direction into more explicit ownership and follow-through detail.",
      ];
}

function deriveNextSteps(roomState: RoomState): string[] {
  const isJapanese = roomState.language.startsWith("ja");
  const nextSteps: string[] = [];

  if (roomState.structural_state.ownership_clarity < 3) {
    nextSteps.push(
      isJapanese
        ? "次の設計ステップを誰が持ち、誰が助言に留まるのかを明確にする。"
        : "Clarify who owns the next design step and who only advises it.",
    );
  }
  if (roomState.structural_state.support_model_clarity < 3) {
    nextSteps.push(
      isJapanese
        ? "例外対応が既定サービスにならないよう、最初の支援境界を文書化する。"
        : "Document the first support boundary so exception handling does not become the default service model.",
    );
  }
  nextSteps.push(
    isJapanese
      ? "いまの境界付きの方向性を、より明確な owner と support assumption を添えて次回会議へ持ち込む。"
      : "Carry the current bounded direction into the next meeting with clearer owner and support assumptions.",
  );

  return nextSteps.slice(0, 3);
}

function deriveLogHighlights(turns: TranscriptTurn[]): string[] {
  const isJapanese = turns.some((turn) => /[ぁ-んァ-ン一-龥]/.test(turn.text));
  return turns
    .slice(-3)
    .map((turn) =>
      isJapanese
        ? `ターン ${turn.turn_index}: ${turn.speaker_name} - ${turn.text}`
        : `Turn ${turn.turn_index}: ${turn.speaker_name} - ${turn.text}`,
    );
}

function hasAnySignal(text: string, signals: string[]): boolean {
  return signals.some((signal) => text.includes(signal));
}

function buildAspectScore(
  reachedLevel2: boolean,
  positiveEvidence: string,
  negativeEvidence: string,
): Pick<StructuralAspectAssessment, "score" | "reached_level_2" | "evidence"> {
  return {
    score: reachedLevel2 ? 1 : 0,
    reached_level_2: reachedLevel2,
    evidence: reachedLevel2 ? positiveEvidence : negativeEvidence,
  };
}

function scoreOperationalSignals(params: {
  hasBoundedSupportSignal: boolean;
  hasExplicitOwnerSignal: boolean;
  hasNextStepSignal: boolean;
  supportModelClarity: number;
  ownershipClarity: number;
  unresolvedSupportBoundary: boolean;
  unresolvedOwnership: boolean;
}): number {
  let score = 0;

  if (params.hasBoundedSupportSignal && params.supportModelClarity >= 2 && !params.unresolvedSupportBoundary) {
    score += 1;
  }

  if ((params.hasExplicitOwnerSignal || params.ownershipClarity >= 2) && !params.unresolvedOwnership) {
    score += 1;
  }

  if (params.hasNextStepSignal) {
    score += 1;
  }

  return score;
}

function localizeEvidence(isJapanese: boolean, english: string, japanese: string): string {
  return isJapanese ? japanese : english;
}

function localizeStructuralResult(result: StructuralResult, isJapanese: boolean): string {
  if (!isJapanese) {
    return result.toLowerCase();
  }

  switch (result) {
    case "Stable":
      return "かなり安定している";
    case "Strained":
      return "前進はしたがまだ張りつめている";
    case "Drifting":
      return "まだ流れが定まり切っていない";
    case "Failed":
      return "失敗寄り";
  }
}
