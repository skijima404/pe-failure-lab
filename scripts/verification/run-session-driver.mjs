import { AdapterBackedResponder } from "../../runtime/execution/runtime-responder.ts";
import { LocalActorResponder } from "../../runtime/verification/local-actor-responder.ts";
import { MockModelAdapter } from "../../runtime/verification/mock-model-adapter.ts";
import {
  acceptPlayerMessageWithLocalJudger,
  evaluateIfSessionClosed,
  initializeSession,
  runNextRuntimeActorTurnFromState,
  startSession,
} from "../../runtime/execution/session-driver.ts";
import { formatReflectionReport } from "../../runtime/evaluation/report.ts";
import { renderVisibleTranscript } from "../../runtime/presentation/visible-transcript.ts";

function parseArgs(argv) {
  let adapterName = "local";
  let language = "en";
  const remaining = [];

  for (const arg of argv) {
    if (arg.startsWith("--adapter=")) {
      adapterName = arg.slice("--adapter=".length);
      continue;
    }
    if (arg.startsWith("--language=")) {
      language = arg.slice("--language=".length);
      continue;
    }
    remaining.push(arg);
  }

  return {
    adapterName,
    language,
    startMessage: remaining[0] ?? (language.startsWith("ja") ? "始めます" : "Let's start"),
    playerMessage:
      remaining[1] ??
      (language.startsWith("ja")
        ? "まずは一つのオンボーディング導線に絞って、Platform が無制限の支援窓口にならない形で試したいです。"
        : "I think we should start with one narrow onboarding path that teams can try without turning platform into an open-ended support function."),
  };
}

function createResponder(adapterName) {
  if (adapterName === "mock") {
    return new AdapterBackedResponder(new MockModelAdapter());
  }

  return new LocalActorResponder();
}

function printHeader(adapterName, language) {
  if (language.startsWith("ja")) {
    console.log("検証用セッションドライバ");
    console.log("========================");
    console.log("用途: ローカルファースト runtime の verification walkthrough。");
    console.log(`アダプタ: ${adapterName === "mock" ? "mock adapter" : "verification local responder"}`);
    console.log("");
    return;
  }

  console.log("Verification Session Driver");
  console.log("===========================");
  console.log("Purpose: verification walkthrough over the local-first runtime.");
  console.log(`Adapter: ${adapterName === "mock" ? "mock adapter" : "verification local responder"}`);
  console.log("");
}

async function main() {
  const { adapterName, language, startMessage, playerMessage } = parseArgs(process.argv.slice(2));
  printHeader(adapterName, language);
  const initialized = initializeSession("verification-session-driver-demo", language);
  const responder = createResponder(adapterName);

  const started = startSession(initialized.room_state, startMessage);

  if (!started.accepted) {
    console.log(initialized.initialization_brief);
    console.log("");
    console.log(language.startsWith("ja") ? `開始に失敗しました: ${started.rejection_reason}` : `Start failed: ${started.rejection_reason}`);
    process.exitCode = 1;
    return;
  }

  const openingResult = await runNextRuntimeActorTurnFromState(started.room_state, responder, {
    opening_mode: "local",
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
  console.error("Verification session driver failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
