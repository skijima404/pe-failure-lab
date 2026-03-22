import type { TranscriptTurn } from "../state/types.ts";

export function countFacilitatorTurns(turns: TranscriptTurn[], facilitatorId = "mika"): number {
  return turns.filter((turn) => turn.speaker_id === facilitatorId).length;
}

export function hasScoringLeakage(text: string): boolean {
  return /\b[1-5]\/5\b|\bscore\b|\brating\b/i.test(text);
}

export function hasTopicSprawl(activeTopicCount: number): boolean {
  return activeTopicCount > 1;
}

export function countDistinctTopicSignals(turns: TranscriptTurn[]): number {
  const topicSignals = new Set<string>();

  for (const turn of turns) {
    const text = turn.text.toLowerCase();
    if (/scope|boundary/.test(text)) {
      topicSignals.add("scope-boundary");
    }
    if (/support|platform side|onboarding path/.test(text)) {
      topicSignals.add("support-model");
    }
    if (/owner|ownership|who owns/.test(text)) {
      topicSignals.add("ownership");
    }
    if (/delivery|roadmap|team/.test(text)) {
      topicSignals.add("delivery-shape");
    }
  }

  return topicSignals.size;
}

export function hasActorKnowledgeLeakage(text: string): boolean {
  return /hidden threshold|score\b|rubric|structural progress|selection reason|orchestration/i.test(text);
}

export function facilitatorOveruse(turns: TranscriptTurn[], threshold = 0.34, facilitatorId = "mika"): boolean {
  if (turns.length === 0) {
    return false;
  }

  return countFacilitatorTurns(turns, facilitatorId) / turns.length > threshold;
}

export function hasInitializationWrapperLeakage(text: string): boolean {
  return /\bopenai adapter harness\b|\bsession driver\b|\bturns executed\b|\baccepted:\b/i.test(text);
}

export function hasOrchestrationTextVisible(text: string): boolean {
  return /\bselection reason\b|\bprompt preview\b|\bprompt excerpt\b|\bdelivery_mode\b|\borchestration\b|\bworked for\b/i.test(text);
}

export function hasClosingEvaluatorBoundaryCollapse(turns: TranscriptTurn[], facilitatorId = "mika"): boolean {
  return turns.some((turn) => {
    if (turn.speaker_id !== facilitatorId) {
      return false;
    }

    return /structural progress|simulation reflection report|suggested next steps|areas to improve|[1-5]\/5/i.test(turn.text);
  });
}

export function hasPlayerEntryViolation(turns: TranscriptTurn[]): boolean {
  const firstPlayerTurnIndex = turns.findIndex((turn) => turn.speaker_id === "player");

  if (firstPlayerTurnIndex <= 1) {
    return false;
  }

  const prePlayerTurns = turns.slice(0, firstPlayerTurnIndex);
  const nonPlayerTurns = prePlayerTurns.filter((turn) => turn.speaker_id !== "player");
  const stakeholderTurns = nonPlayerTurns.filter((turn) => turn.speaker_id !== "mika");

  return nonPlayerTurns.length > 1 && stakeholderTurns.length > 0;
}
