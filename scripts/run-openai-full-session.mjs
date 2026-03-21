import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { AdapterBackedResponder, OpenAIResponsesAdapter } from "../runtime/execution/model-client.ts";
import {
  acceptPlayerMessage,
  evaluateIfSessionClosed,
  initializeSession,
  runNextAgentTurn,
  startSession,
} from "../runtime/execution/session-driver.ts";
import { prepareNextTurn } from "../runtime/execution/run-turn.ts";
import { formatReflectionReport } from "../runtime/evaluation/report.ts";
import { renderVisibleTranscript } from "../runtime/presentation/visible-transcript.ts";
import { loadRepoEnv, parseReasoningEffort, requiredEnv } from "./_env.mjs";

function parseArgs(argv) {
  let turnsPath = "runtime/validation/fixtures/player-turns/openai-full-session-ja.json";
  let language = "ja";
  let startMessage = "Let's start";

  for (const arg of argv) {
    if (arg.startsWith("--turns=")) {
      turnsPath = arg.slice("--turns=".length);
      continue;
    }
    if (arg.startsWith("--language=")) {
      language = arg.slice("--language=".length);
      continue;
    }
    if (arg.startsWith("--start=")) {
      startMessage = arg.slice("--start=".length);
    }
  }

  return { turnsPath, language, startMessage };
}

function loadPlayerTurns(turnsPath) {
  return JSON.parse(readFileSync(resolve(turnsPath), "utf8"));
}

async function main() {
  loadRepoEnv();

  const { turnsPath, language, startMessage } = parseArgs(process.argv.slice(2));
  const playerTurns = loadPlayerTurns(turnsPath);
  const responder = new AdapterBackedResponder(
    new OpenAIResponsesAdapter({
      apiKey: requiredEnv("OPENAI_API_KEY"),
      model: process.env.OPENAI_MODEL ?? "gpt-5",
      reasoningEffort: parseReasoningEffort(process.env.OPENAI_REASONING_EFFORT),
    }),
  );

  const initialized = initializeSession("openai-full-session", language);
  const started = startSession(initialized.room_state, startMessage);

  if (!started.accepted) {
    console.log(initialized.initialization_brief);
    console.log("");
    console.log(`Start failed: ${started.rejection_reason}`);
    process.exitCode = 1;
    return;
  }

  let state = started.room_state;
  let playerIndex = 0;
  let stepCount = 0;
  const maxSteps = 20;

  state = (await runNextAgentTurn(state, responder, { opening_mode: "responder" })).room_state;
  stepCount += 1;

  while (state.scene_phase !== "post-game" && stepCount < maxSteps) {
    const nextTurn = prepareNextTurn(state);

    if (nextTurn.decision.owner === "player") {
      const fallbackTurn = playerTurns[playerTurns.length - 1] ?? "I want to keep the first path narrow and usable.";
      const playerMessage = playerTurns[Math.min(playerIndex, playerTurns.length - 1)] ?? fallbackTurn;
      playerIndex += 1;
      state = acceptPlayerMessage(state, playerMessage, "Player");
      stepCount += 1;
      continue;
    }

    state = (await runNextAgentTurn(state, responder)).room_state;
    stepCount += 1;
  }

  const evaluation = evaluateIfSessionClosed(state, {
    scenario: state.session_setup.scenario,
    role: "Player",
    session_mode: state.session_setup.session_mode,
  });

  console.log(
    renderVisibleTranscript({
      initializationBrief: initialized.initialization_brief,
      transcriptTurns: state.recent_transcript,
      reflectionText: evaluation ? formatReflectionReport(evaluation.reflection_report) : null,
    }),
  );

  if (state.scene_phase !== "post-game") {
    process.stderr.write(
      `\n[playtest-note] full-session harness stopped before post-game. scene_phase=${state.scene_phase} step_count=${stepCount}\n`,
    );
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("OpenAI full-session harness failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
