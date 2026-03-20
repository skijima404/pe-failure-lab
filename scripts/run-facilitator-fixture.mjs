import { runScriptedFixture } from "../runtime/validation/fixture-runner.ts";
import {
  createFacilitatorInterventionInitialState,
  FACILITATOR_INTERVENTION_FIXTURE,
} from "../runtime/validation/fixtures/scripted-session.ts";

async function main() {
  const result = await runScriptedFixture(
    FACILITATOR_INTERVENTION_FIXTURE,
    "facilitator-fixture-session",
    createFacilitatorInterventionInitialState(),
  );

  const firstTurn = result.results[0]?.turn_log;
  if (!firstTurn) {
    throw new Error("No facilitator turn was produced.");
  }

  console.log("Facilitator Fixture");
  console.log("===================");
  console.log(`Speaker: ${firstTurn.selected_speaker}`);
  console.log(`Selection Reason: ${firstTurn.selection_reason}`);
  console.log(`Intervention Reason: ${firstTurn.intervention_reason}`);
  console.log(`Prompt Preview: ${firstTurn.prompt_input_summary.prompt_text_preview}`);
  console.log(`Output: ${JSON.stringify(firstTurn.agent_output_summary)}`);
  console.log(`Mismatches: ${result.mismatches.length}`);

  if (result.mismatches.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Facilitator fixture failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
