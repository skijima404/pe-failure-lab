import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { AdapterBackedResponder, OpenAIResponsesAdapter } from "../runtime/execution/runtime-responder.ts";
import {
  acceptPlayerMessage,
  evaluateIfSessionClosed,
  initializeSession,
  runNextRuntimeActorTurnFromState,
  startSession,
} from "../runtime/execution/session-driver.ts";
import { prepareNextRuntimeTurn } from "../runtime/execution/prepare-runtime-turn.ts";
import { formatReflectionReport } from "../runtime/evaluation/report.ts";
import { loadRepoEnv, parseBooleanEnv, parseReasoningEffort, requiredEnv } from "./_env.mjs";

function parseArgs(argv) {
  let language = "en";
  let startMessage = "Let's start";

  for (const arg of argv) {
    if (arg.startsWith("--language=")) {
      language = arg.slice("--language=".length);
      continue;
    }
    if (arg.startsWith("--start=")) {
      startMessage = arg.slice("--start=".length);
    }
  }

  return { language, startMessage };
}

function printDivider() {
  console.log("");
  console.log("--------------------------------------------------");
  console.log("");
}

function printHeader(remoteMultiAgent) {
  console.log("Remote-Backed Interactive Harness");
  console.log("=================================");
  console.log("Purpose: run human play over the local-first runtime with remote-backed actor generation.");
  console.log(`Response chain mode: ${remoteMultiAgent ? "per-speaker remote continuation" : "stateless remote calls"}`);
  console.log("");
}

async function main() {
  loadRepoEnv();

  const { language, startMessage } = parseArgs(process.argv.slice(2));
  const remoteMultiAgent = parseBooleanEnv(process.env.OPENAI_REMOTE_MULTI_AGENT, true);
  printHeader(remoteMultiAgent);
  const responder = new AdapterBackedResponder(
    new OpenAIResponsesAdapter({
      apiKey: requiredEnv("OPENAI_API_KEY"),
      model: process.env.OPENAI_MODEL ?? "gpt-5",
      reasoningEffort: parseReasoningEffort(process.env.OPENAI_REASONING_EFFORT),
      conversationMode: remoteMultiAgent ? "per-speaker-response-chain" : "stateless",
    }),
  );
  const rl = readline.createInterface({ input, output });

  try {
    const initialized = initializeSession("openai-interactive-session", language);
    console.log(initialized.initialization_brief);
    printDivider();

    const startInput = await rl.question(`Start Signal [default: ${startMessage}]: `);
    const started = startSession(initialized.room_state, startInput.trim() || startMessage);

    if (!started.accepted) {
      console.log(`Start failed: ${started.rejection_reason}`);
      process.exitCode = 1;
      return;
    }

    let state = started.room_state;

    while (state.scene_phase !== "post-game") {
      const nextTurn = prepareNextRuntimeTurn(state);

      if (nextTurn.decision.owner === "player") {
        const playerMessage = await rl.question("Player> ");
        const normalized = playerMessage.trim();

        if (!normalized) {
          console.log("Please enter a player turn or type /quit.");
          continue;
        }

        if (normalized === "/quit") {
          console.log("Interactive playtest stopped.");
          return;
        }

        state = acceptPlayerMessage(state, normalized, "Player");
        console.log("");
        console.log(`Player: ${normalized}`);
        printDivider();
        continue;
      }

      const runtimeActorTurn = await runNextRuntimeActorTurnFromState(state, responder, {
        opening_mode: "responder",
      });
      state = runtimeActorTurn.room_state;
      const visibleTurn = state.recent_transcript.at(-1);

      if (visibleTurn) {
        console.log(`${visibleTurn.speaker_name}: ${visibleTurn.text}`);
        printDivider();
      }
    }

    const evaluation = evaluateIfSessionClosed(state, {
      scenario: state.session_setup.scenario,
      role: "Player",
      session_mode: state.session_setup.session_mode,
    });

    if (evaluation) {
      console.log(formatReflectionReport(evaluation.reflection_report));
    }
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error("Interactive remote-backed runtime failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
