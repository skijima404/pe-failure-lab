import { AdapterBackedResponder, MockModelAdapter } from "../runtime/execution/runtime-responder.ts";
import { runRuntimeSession } from "../runtime/execution/run-session.ts";
import { createScriptedSessionInitialState } from "../runtime/validation/fixtures/scripted-session.ts";

function printHeader() {
  console.log("Local Adapter Harness");
  console.log("====================");
  console.log("Purpose: run the runtime through an adapter-backed responder without scripted outcomes.");
  console.log("");
}

async function main() {
  printHeader();

  const initialState = createScriptedSessionInitialState();
  const responder = new AdapterBackedResponder(new MockModelAdapter());
  const results = await runRuntimeSession(initialState, responder, 2);

  results.forEach((result, index) => {
    console.log(`Turn ${index + 1}`);
    console.log(`  Speaker: ${result.turn_log.selected_speaker}`);
    console.log(`  Selection Reason: ${result.turn_log.selection_reason}`);
    console.log(`  Prompt Preview: ${result.turn_log.prompt_input_summary.prompt_text_preview}`);
    console.log(`  Output: ${JSON.stringify(result.turn_log.agent_output_summary)}`);
    console.log(`  Prompt: ${JSON.stringify(result.turn_log.prompt_input_summary)}`);
    console.log("");
  });

  console.log("Result: success");
  console.log("The runtime accepted a model adapter boundary and produced normalized turn outcomes.");
}

main().catch((error) => {
  console.error("Mock adapter harness failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
