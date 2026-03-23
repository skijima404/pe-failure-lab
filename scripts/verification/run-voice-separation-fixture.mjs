import { AdapterBackedResponder } from "../../runtime/execution/runtime-responder.ts";
import { MockModelAdapter } from "../../runtime/verification/mock-model-adapter.ts";
import { runRuntimeSession } from "../../runtime/execution/run-session.ts";
import {
  createDeliveryPressureInitialState,
  createPlatformPressureInitialState,
} from "../../runtime/validation/fixtures/scripted-session.ts";

function printSection(title) {
  console.log(title);
  console.log("=".repeat(title.length));
}

function printTurn(label, result) {
  const log = result.turn_log;
  console.log(label);
  console.log(`  Speaker: ${log.selected_speaker}`);
  console.log(`  Selection Reason: ${log.selection_reason}`);
  console.log(`  Prompt Preview: ${log.prompt_input_summary.prompt_text_preview}`);
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
  console.log("");
}

async function main() {
  const responder = new AdapterBackedResponder(new MockModelAdapter());

  printSection("Voice Separation Fixture");
  console.log("Purpose: compare platform-side and delivery-side stakeholder turns under a similar active topic.");
  console.log("");

  const platformResults = await runRuntimeSession(createPlatformPressureInitialState(), responder, 1);
  const deliveryResults = await runRuntimeSession(createDeliveryPressureInitialState(), responder, 1);

  printTurn("Platform Case", platformResults[0]);
  printTurn("Delivery Case", deliveryResults[0]);

  console.log("Result: success");
  console.log("Use this fixture to compare whether similar practical concerns still come from different stakeholder backgrounds.");
}

main().catch((error) => {
  console.error("Voice separation fixture failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
