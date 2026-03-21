import { AdapterBackedResponder, MockModelAdapter, OpenAIResponsesAdapter } from "../runtime/execution/model-client.ts";
import { runSessionFromPlayerStart } from "../runtime/execution/session-driver.ts";
import { createInitialRoomState } from "../runtime/state/schema.ts";
import { loadRepoEnv, parseReasoningEffort, requiredEnv } from "./_env.mjs";

function parseArgs(argv) {
  let adapterName = "mock";
  const remaining = [];

  for (const arg of argv) {
    if (arg.startsWith("--adapter=")) {
      adapterName = arg.slice("--adapter=".length);
      continue;
    }
    remaining.push(arg);
  }

  return {
    adapterName,
    startMessage: remaining[0] ?? "Let's start",
  };
}

function createResponder(adapterName) {
  if (adapterName === "openai") {
    loadRepoEnv();

    return new AdapterBackedResponder(
      new OpenAIResponsesAdapter({
        apiKey: requiredEnv("OPENAI_API_KEY"),
        model: process.env.OPENAI_MODEL ?? "gpt-5",
        reasoningEffort: parseReasoningEffort(process.env.OPENAI_REASONING_EFFORT),
      }),
    );
  }

  return new AdapterBackedResponder(new MockModelAdapter());
}

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
  const { adapterName, startMessage } = parseArgs(process.argv.slice(2));
  const roomState = createInitialRoomState("session-driver-demo");
  const responder = createResponder(adapterName);

  const result = await runSessionFromPlayerStart(roomState, startMessage, responder, 2);

  console.log("Session Driver");
  console.log("==============");
  console.log(`Adapter: ${adapterName}`);
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
