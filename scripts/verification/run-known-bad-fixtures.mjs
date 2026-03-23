import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  countDistinctTopicSignals,
  facilitatorOveruse,
  hasClosingEvaluatorBoundaryCollapse,
  hasInitializationWrapperLeakage,
  hasActorKnowledgeLeakage,
  hasOrchestrationTextVisible,
  hasPlayerEntryViolation,
  hasScoringLeakage,
  hasTopicSprawl,
} from "../../runtime/validation/transcript-checks.ts";

function loadTranscript(path) {
  return JSON.parse(readFileSync(resolve(path), "utf8"));
}

function printSection(title) {
  console.log(title);
  console.log("=".repeat(title.length));
}

function printFixtureResult(name, checks) {
  console.log(name);
  for (const [label, value] of Object.entries(checks)) {
    console.log(`  ${label}: ${value}`);
  }
  console.log("");
}

async function main() {
  printSection("Known-Bad Fixture Checks");
  console.log("Purpose: detect common bad transcript patterns before live playtesting.");
  console.log("");

  const facilitatorOveruseTurns = loadTranscript("runtime/validation/fixtures/transcripts/facilitator-overuse.json");
  const topicDriftTurns = loadTranscript("runtime/validation/fixtures/transcripts/topic-drift.json");
  const actorKnowsTooMuchTurns = loadTranscript("runtime/validation/fixtures/transcripts/actor-knows-too-much.json");
  const closingBoundaryCollapseTurns = loadTranscript("runtime/validation/fixtures/transcripts/closing-evaluator-boundary-collapse.json");
  const playerEntryViolationTurns = loadTranscript("runtime/validation/fixtures/transcripts/player-entry-violation.json");

  printFixtureResult("facilitator-overuse", {
    facilitator_overuse: facilitatorOveruse(facilitatorOveruseTurns),
    facilitator_turns: facilitatorOveruseTurns.filter((turn) => turn.speaker_id === "mika").length,
  });

  const distinctTopicSignals = countDistinctTopicSignals(topicDriftTurns);
  printFixtureResult("topic-drift", {
    distinct_topic_signals: distinctTopicSignals,
    topic_sprawl: hasTopicSprawl(distinctTopicSignals),
  });

  const leakageTexts = actorKnowsTooMuchTurns.map((turn) => turn.text);
  printFixtureResult("actor-knows-too-much", {
    actor_knowledge_leakage: leakageTexts.some((text) => hasActorKnowledgeLeakage(text) || hasScoringLeakage(text)),
    leaked_turn_count: leakageTexts.filter((text) => hasActorKnowledgeLeakage(text) || hasScoringLeakage(text)).length,
  });

  printFixtureResult("closing-evaluator-boundary-collapse", {
    boundary_collapse: hasClosingEvaluatorBoundaryCollapse(closingBoundaryCollapseTurns),
  });

  printFixtureResult("player-entry-violation", {
    player_entry_violation: hasPlayerEntryViolation(playerEntryViolationTurns),
  });

  printFixtureResult("wrapper-visibility", {
    initialization_wrapper_leakage: hasInitializationWrapperLeakage("OpenAI Adapter Harness\nTurns Executed: 2"),
    orchestration_text_visible: hasOrchestrationTextVisible("Selection Reason: overlap-reaction\nPrompt Preview: ..."),
  });

  console.log("Result: success");
  console.log("Use these fixtures to check whether new prompt or orchestration changes drift toward known bad behavior.");
}

main().catch((error) => {
  console.error("Known-bad fixture harness failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
