import { AdapterBackedResponder, OpenAIResponsesAdapter } from "../runtime/execution/model-client.ts";
import { runSessionFromPlayerStart } from "../runtime/execution/session-driver.ts";
import { createInitialRoomState } from "../runtime/state/schema.ts";
import { loadRepoEnv, parseReasoningEffort, requiredEnv } from "./_env.mjs";

async function main() {
  loadRepoEnv();

  const apiKey = requiredEnv("OPENAI_API_KEY");
  const model = process.env.OPENAI_MODEL ?? "gpt-5";
  const reasoningEffort = parseReasoningEffort(process.env.OPENAI_REASONING_EFFORT);
  const startMessage = process.argv[2] ?? "Let's start";

  const adapter = new OpenAIResponsesAdapter({
    apiKey,
    model,
    reasoningEffort,
  });

  const responder = new AdapterBackedResponder(adapter);
  const result = await runSessionFromPlayerStart(createInitialRoomState("openai-e2e-session"), startMessage, responder, 2);

  console.log("OpenAI Adapter Harness");
  console.log("======================");
  console.log(`Model: ${model}`);
  console.log(`Start Message: ${startMessage}`);
  console.log(`Accepted: ${result.accepted}`);

  if (!result.accepted) {
    console.log(`Rejection Reason: ${result.rejection_reason}`);
    process.exitCode = 1;
    return;
  }

  console.log(result.initialization_brief);
  console.log("");
  console.log(`Turns Executed: ${result.live_results.length}`);

  result.live_results.forEach((step, index) => {
    console.log(`Turn ${index + 1}`);
    console.log(`  Speaker: ${step.turn_log.selected_speaker}`);
    console.log(`  Selection Reason: ${step.turn_log.selection_reason}`);
    console.log(`  Prompt Preview: ${step.turn_log.prompt_input_summary.prompt_text_preview}`);
    if (typeof step.turn_log.prompt_input_summary.prompt_text_excerpt === "string") {
      console.log("  Prompt Excerpt:");
      console.log(
        String(step.turn_log.prompt_input_summary.prompt_text_excerpt)
          .split("\n")
          .map((line) => `    ${line}`)
          .join("\n"),
      );
    }
    console.log(`  Output: ${JSON.stringify(step.turn_log.agent_output_summary)}`);
  });
}

main().catch((error) => {
  console.error("OpenAI adapter harness failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
