import { AdapterBackedResponder, OpenAIResponsesAdapter } from "../runtime/execution/runtime-responder.ts";
import {
  acceptPlayerMessageWithLocalJudger,
  evaluateIfSessionClosed,
  initializeSession,
  runNextRuntimeActorTurnFromState,
  startSession,
} from "../runtime/execution/session-driver.ts";
import { formatReflectionReport } from "../runtime/evaluation/report.ts";
import { renderVisibleTranscript } from "../runtime/presentation/visible-transcript.ts";
import { loadRepoEnv, parseBooleanEnv, parseReasoningEffort, requiredEnv } from "./_env.mjs";

function printHeader(remoteMultiAgent) {
  console.log("Remote-Backed Smoke Harness");
  console.log("===========================");
  console.log("Purpose: run a thin remote-backed smoke test over the local-first runtime.");
  console.log(`Response chain mode: ${remoteMultiAgent ? "per-speaker remote continuation" : "stateless remote calls"}`);
  console.log("");
}

async function main() {
  loadRepoEnv();

  const apiKey = requiredEnv("OPENAI_API_KEY");
  const model = process.env.OPENAI_MODEL ?? "gpt-5";
  const reasoningEffort = parseReasoningEffort(process.env.OPENAI_REASONING_EFFORT);
  const remoteMultiAgent = parseBooleanEnv(process.env.OPENAI_REMOTE_MULTI_AGENT, false);
  const startMessage = process.argv[2] ?? "Let's start";
  const playerMessage =
    process.argv[3] ??
    "I think we should start with one narrow onboarding path that teams can try first, without turning the platform team into an open-ended support desk.";
  printHeader(remoteMultiAgent);

  const adapter = new OpenAIResponsesAdapter({
    apiKey,
    model,
    reasoningEffort,
    conversationMode: remoteMultiAgent ? "per-speaker-response-chain" : "stateless",
  });

  const responder = new AdapterBackedResponder(adapter);
  const initialized = initializeSession("openai-e2e-session");
  const started = startSession(initialized.room_state, startMessage);

  if (!started.accepted) {
    console.log(initialized.initialization_brief);
    console.log("");
    console.log(`Start failed: ${started.rejection_reason}`);
    process.exitCode = 1;
    return;
  }
  const openingResult = await runNextRuntimeActorTurnFromState(started.room_state, responder, {
    opening_mode: "responder",
  });
  const afterPlayerMessage = acceptPlayerMessageWithLocalJudger(openingResult.room_state, playerMessage);
  const nextAgentResult = await runNextRuntimeActorTurnFromState(afterPlayerMessage, responder);
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
  console.error("Remote-backed adapter harness failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
