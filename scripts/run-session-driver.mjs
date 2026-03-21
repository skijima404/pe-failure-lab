import { AdapterBackedResponder, MockModelAdapter, OpenAIResponsesAdapter } from "../runtime/execution/model-client.ts";
import {
  acceptPlayerMessage,
  evaluateIfSessionClosed,
  initializeSession,
  runNextAgentTurn,
  startSession,
} from "../runtime/execution/session-driver.ts";
import { formatReflectionReport } from "../runtime/evaluation/report.ts";
import { renderVisibleTranscript } from "../runtime/presentation/visible-transcript.ts";
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
    playerMessage:
      remaining[1] ??
      "I think we should start with one narrow onboarding path that teams can try without turning platform into an open-ended support function.",
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

async function main() {
  const { adapterName, startMessage, playerMessage } = parseArgs(process.argv.slice(2));
  const initialized = initializeSession("session-driver-demo");
  const responder = createResponder(adapterName);

  const started = startSession(initialized.room_state, startMessage);

  if (!started.accepted) {
    console.log(initialized.initialization_brief);
    console.log("");
    console.log(`Start failed: ${started.rejection_reason}`);
    process.exitCode = 1;
    return;
  }

  const openingResult = await runNextAgentTurn(started.room_state, responder, {
    opening_mode: adapterName === "openai" ? "responder" : "local",
  });
  const afterPlayerMessage = acceptPlayerMessage(openingResult.room_state, playerMessage);
  const nextAgentResult = await runNextAgentTurn(afterPlayerMessage, responder);
  const finalRoomState = nextAgentResult.room_state;
  const evaluation = evaluateIfSessionClosed(finalRoomState, {
    scenario: finalRoomState.session_setup.scenario,
    role: "Player",
    session_mode: finalRoomState.session_setup.session_mode,
  });

  console.log(
    renderVisibleTranscript({
      initializationBrief: initialized.initialization_brief,
      transcriptTurns: finalRoomState.recent_transcript,
      reflectionText: evaluation ? formatReflectionReport(evaluation.reflection_report) : null,
    }),
  );
}

main().catch((error) => {
  console.error("Session driver failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
