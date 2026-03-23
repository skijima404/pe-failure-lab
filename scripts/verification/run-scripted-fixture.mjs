import { runScriptedFixture } from "../../runtime/validation/fixture-runner.ts";
import {
  createScriptedSessionInitialState,
  SCRIPTED_SESSION_FIXTURE,
} from "../../runtime/validation/fixtures/scripted-session.ts";

function printHeader() {
  console.log("Scripted Runtime Harness");
  console.log("========================");
  console.log("Purpose: run a fixed runtime fixture and show turn-by-turn runtime decisions.");
  console.log("");
}

function printTurnSummary(result, index) {
  const log = result.turn_log;
  console.log(`Turn ${index + 1}`);
  console.log(`  Speaker: ${log.selected_speaker}`);
  console.log(`  Owner: ${log.turn_owner}`);
  console.log(`  Selection Reason: ${log.selection_reason}`);
  if (log.intervention_reason) {
    console.log(`  Intervention Reason: ${log.intervention_reason}`);
  }
  console.log(`  Topic: ${log.active_topic_before} -> ${log.active_topic_after}`);
  console.log(`  Prompt: ${JSON.stringify(log.prompt_input_summary)}`);
  if (typeof log.prompt_input_summary.prompt_text_preview === "string") {
    console.log(`  Prompt Preview: ${log.prompt_input_summary.prompt_text_preview}`);
  }
  if (typeof log.prompt_input_summary.prompt_text_excerpt === "string") {
    console.log("  Prompt Excerpt:");
    console.log(
      String(log.prompt_input_summary.prompt_text_excerpt)
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n"),
    );
  }
  if (log.prompt_input_summary.prompt_focus) {
    console.log(`  Prompt Focus: ${JSON.stringify(log.prompt_input_summary.prompt_focus)}`);
  }
  console.log(`  Output: ${JSON.stringify(log.agent_output_summary)}`);
  console.log(`  State Changes: ${JSON.stringify(log.state_changes)}`);
  console.log("");
}

function printSummary(fixtureRunResult) {
  const finalResult = fixtureRunResult.results.at(-1);
  const finalState = finalResult?.room_state;

  console.log("Run Summary");
  console.log("-----------");
  console.log(`Turns Executed: ${fixtureRunResult.results.length}`);
  console.log(`Mismatches: ${fixtureRunResult.mismatches.length}`);

  if (finalState) {
    console.log(`Final Active Topic: ${finalState.active_topic.label}`);
    console.log(`Close Ready: ${finalState.close_readiness.ready}`);
    console.log(`Open Risks: ${finalState.structural_state.open_risks.join(", ") || "(none)"}`);
  }

  console.log("");
}

function printMismatchReport(mismatches) {
  if (mismatches.length === 0) {
    console.log("Result: success");
    console.log("The scripted fixture matched the expected selection reasons.");
    return;
  }

  console.log("Result: failure");
  console.log("The scripted fixture diverged from expected selection reasons:");
  for (const mismatch of mismatches) {
    console.log(`  - ${mismatch}`);
  }
}

async function main() {
  printHeader();

  const fixtureRunResult = await runScriptedFixture(
    SCRIPTED_SESSION_FIXTURE,
    "scripted-fixture-session",
    createScriptedSessionInitialState(),
  );

  fixtureRunResult.results.forEach((result, index) => {
    printTurnSummary(result, index);
  });

  printSummary(fixtureRunResult);
  printMismatchReport(fixtureRunResult.mismatches);

  if (fixtureRunResult.mismatches.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Harness execution failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
