import { AdapterBackedResponder, OpenAIResponsesAdapter } from "../runtime/execution/model-client.ts";
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

async function main() {
  loadRepoEnv();

  const apiKey = requiredEnv("OPENAI_API_KEY");
  const model = process.env.OPENAI_MODEL ?? "gpt-5";
  const reasoningEffort = parseReasoningEffort(process.env.OPENAI_REASONING_EFFORT);
  const startMessage = process.argv[2] ?? "Let's start";
  const playerMessage =
    process.argv[3] ??
    "I think we should start with one narrow onboarding path that teams can try first, without turning the platform team into an open-ended support desk.";

  const adapter = new OpenAIResponsesAdapter({
    apiKey,
    model,
    reasoningEffort,
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
  const openingResult = await runNextAgentTurn(started.room_state, responder, { opening_mode: "responder" });
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
  console.error("OpenAI adapter harness failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
