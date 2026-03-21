import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AdapterBackedResponder, OpenAIResponsesAdapter } from "../runtime/execution/model-client.ts";
import { runSession } from "../runtime/execution/run-session.ts";
import { createScriptedSessionInitialState } from "../runtime/validation/fixtures/scripted-session.ts";

function loadRepoEnv() {
  const envPath = resolve(".env");
  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function main() {
  loadRepoEnv();

  const apiKey = requiredEnv("OPENAI_API_KEY");
  const model = process.env.OPENAI_MODEL ?? "gpt-5";
  const reasoningEffort = process.env.OPENAI_REASONING_EFFORT;

  const adapter = new OpenAIResponsesAdapter({
    apiKey,
    model,
    reasoningEffort:
      reasoningEffort === "low" || reasoningEffort === "medium" || reasoningEffort === "high"
        ? reasoningEffort
        : undefined,
  });

  const responder = new AdapterBackedResponder(adapter);
  const results = await runSession(createScriptedSessionInitialState(), responder, 2);

  console.log("OpenAI Adapter Harness");
  console.log("======================");
  console.log(`Model: ${model}`);
  console.log(`Turns Executed: ${results.length}`);

  results.forEach((result, index) => {
    console.log(`Turn ${index + 1}`);
    console.log(`  Speaker: ${result.turn_log.selected_speaker}`);
    console.log(`  Selection Reason: ${result.turn_log.selection_reason}`);
    console.log(`  Prompt Preview: ${result.turn_log.prompt_input_summary.prompt_text_preview}`);
    console.log(`  Output: ${JSON.stringify(result.turn_log.agent_output_summary)}`);
  });
}

main().catch((error) => {
  console.error("OpenAI adapter harness failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
