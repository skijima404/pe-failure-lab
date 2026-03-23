import { ScriptedResponder } from "../../runtime/execution/runtime-responder.ts";
import { runRuntimeSession } from "../../runtime/execution/run-session.ts";
import { evaluateSession, formatReflectionReport } from "../../runtime/evaluation/report.ts";
import {
  createScriptedSessionInitialState,
  SCRIPTED_SESSION_FIXTURE,
} from "../../runtime/validation/fixtures/scripted-session.ts";

async function main() {
  const initialState = createScriptedSessionInitialState();
  const results = await runRuntimeSession(
    initialState,
    new ScriptedResponder(SCRIPTED_SESSION_FIXTURE),
    SCRIPTED_SESSION_FIXTURE.length,
  );
  const finalState = results.at(-1)?.room_state ?? initialState;

  const report = evaluateSession(finalState, {
    scenario: "Platform Engineering Failure Lab MVP",
    role: "Change Agent / Player",
    session_mode: "brainstorming workshop",
  });

  console.log(formatReflectionReport(report));
}

main().catch((error) => {
  console.error("Evaluator harness failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
