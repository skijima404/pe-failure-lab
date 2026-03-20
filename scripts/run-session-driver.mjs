import { AdapterBackedResponder, MockModelAdapter } from "../runtime/execution/model-client.ts";
import { runSessionFromPlayerStart } from "../runtime/execution/session-driver.ts";
import { createInitialRoomState } from "../runtime/state/schema.ts";

function printTurnSummary(result, index) {
  console.log(`Turn ${index + 1}`);
  console.log(`  Speaker: ${result.turn_log.selected_speaker}`);
  console.log(`  Selection Reason: ${result.turn_log.selection_reason}`);
  console.log(`  Prompt Preview: ${result.turn_log.prompt_input_summary.prompt_text_preview}`);
  if (typeof result.turn_log.prompt_input_summary.prompt_text_excerpt === "string") {
    console.log("  Prompt Excerpt:");
    console.log(
      String(result.turn_log.prompt_input_summary.prompt_text_excerpt)
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n"),
    );
  }
  if (result.turn_log.prompt_input_summary.prompt_focus) {
    console.log(`  Prompt Focus: ${JSON.stringify(result.turn_log.prompt_input_summary.prompt_focus)}`);
  }
  console.log(`  Output: ${JSON.stringify(result.turn_log.agent_output_summary)}`);
  console.log("");
}

async function main() {
  const roomState = createInitialRoomState("session-driver-demo");
  const responder = new AdapterBackedResponder(new MockModelAdapter());
  const startMessage = process.argv[2] ?? "Let's start";

  const result = await runSessionFromPlayerStart(roomState, startMessage, responder, 2);

  console.log("Session Driver");
  console.log("==============");
  console.log(result.initialization_brief);
  console.log("");
  console.log(`Start Message: ${startMessage}`);
  console.log(`Accepted: ${result.accepted}`);

  if (!result.accepted) {
    console.log(`Rejection Reason: ${result.rejection_reason}`);
    process.exitCode = 1;
    return;
  }

  console.log("");
  console.log("Live Session");
  console.log("------------");
  result.live_results.forEach((step, index) => {
    printTurnSummary(step, index);
  });
}

main().catch((error) => {
  console.error("Session driver failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
