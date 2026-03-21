import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
import { renderVisibleTranscript } from "../runtime/presentation/visible-transcript.ts";
import { loadRepoEnv, parseBooleanEnv, parseReasoningEffort, requiredEnv } from "./_env.mjs";

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

function printHeader(remoteMultiAgent) {
  console.log("Remote-Backed Full Session Harness");
  console.log("==================================");
  console.log("Purpose: run remote-backed actor generation with the local-first runtime and local-first evaluator.");
  console.log(`Response chain mode: ${remoteMultiAgent ? "per-speaker remote continuation" : "stateless remote calls"}`);
  console.log("");
}

function normalizeText(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function takeBucketTurn(bucketName, playerTurns, bucketIndexes) {
  const bucket = Array.isArray(playerTurns?.[bucketName]) ? playerTurns[bucketName] : [];
  const index = bucketIndexes[bucketName] ?? 0;

  if (bucket[index]) {
    bucketIndexes[bucketName] = index + 1;
    return bucket[index];
  }

  return null;
}

function choosePlayerTurn(state, playerTurns, bucketIndexes, recentAgentTexts) {
  const lastTurn = state.recent_transcript.at(-1) ?? null;
  const lastSpeakerId = lastTurn?.speaker_id ?? null;
  const lastText = normalizeText(lastTurn?.text ?? "");
  const repeatedPrompt = recentAgentTexts.length >= 2 && recentAgentTexts.at(-1) === recentAgentTexts.at(-2);

  if (lastSpeakerId && lastSpeakerId !== "player" && lastText) {
    recentAgentTexts.push(lastText);
    if (recentAgentTexts.length > 4) {
      recentAgentTexts.shift();
    }
  }

  if (state.close_readiness.ready || repeatedPrompt) {
    return (
      takeBucketTurn("close_push", playerTurns, bucketIndexes) ??
      playerTurns.fallback ??
      "I want to close on one bounded first path and a clear next review."
    );
  }

  if (state.active_topic.topic_type === "ownership") {
    return (
      takeBucketTurn("ownership", playerTurns, bucketIndexes) ??
      takeBucketTurn("close_push", playerTurns, bucketIndexes) ??
      playerTurns.fallback
    );
  }

  if (state.active_topic.topic_type === "delivery-shape") {
    return (
      takeBucketTurn("delivery_shape", playerTurns, bucketIndexes) ??
      takeBucketTurn("support_model", playerTurns, bucketIndexes) ??
      playerTurns.fallback
    );
  }

  if (state.active_topic.topic_type === "support-model") {
    return (
      takeBucketTurn("support_model", playerTurns, bucketIndexes) ??
      takeBucketTurn("ownership", playerTurns, bucketIndexes) ??
      playerTurns.fallback
    );
  }

  if (lastSpeakerId === "exec") {
    return (
      takeBucketTurn("exec_scope", playerTurns, bucketIndexes) ??
      takeBucketTurn("support_model", playerTurns, bucketIndexes) ??
      playerTurns.fallback
    );
  }

  if (lastSpeakerId === "platform") {
    return (
      takeBucketTurn("support_model", playerTurns, bucketIndexes) ??
      takeBucketTurn("ownership", playerTurns, bucketIndexes) ??
      playerTurns.fallback
    );
  }

  if (lastSpeakerId === "delivery") {
    return (
      takeBucketTurn("delivery_shape", playerTurns, bucketIndexes) ??
      takeBucketTurn("support_model", playerTurns, bucketIndexes) ??
      playerTurns.fallback
    );
  }

  return (
    takeBucketTurn("opening", playerTurns, bucketIndexes) ??
    takeBucketTurn("exec_scope", playerTurns, bucketIndexes) ??
    playerTurns.fallback ??
    "I want to start with one narrow reusable onboarding path."
  );
}

async function main() {
  loadRepoEnv();

  const { turnsPath, language, startMessage } = parseArgs(process.argv.slice(2));
  const playerTurns = loadPlayerTurns(turnsPath);
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
  let stepCount = 0;
  const maxSteps = 20;
  const bucketIndexes = {};
  const recentAgentTexts = [];

  state = (await runNextRuntimeActorTurnFromState(state, responder, { opening_mode: "responder" })).room_state;
  stepCount += 1;

  while (state.scene_phase !== "post-game" && stepCount < maxSteps) {
    const nextTurn = prepareNextRuntimeTurn(state);

    if (nextTurn.decision.owner === "player") {
      const playerMessage = choosePlayerTurn(state, playerTurns, bucketIndexes, recentAgentTexts);
      state = acceptPlayerMessage(state, playerMessage, "Player");
      stepCount += 1;
      continue;
    }

    state = (await runNextRuntimeActorTurnFromState(state, responder)).room_state;
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
  console.error("Remote-backed full-session harness failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
