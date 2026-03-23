import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

import { AdapterBackedResponder, MockModelAdapter } from "../runtime/execution/runtime-responder.ts";
import {
  acceptPlayerMessageWithLocalJudger,
  evaluateIfSessionClosed,
  initializeSession,
  runNextRuntimeActorTurnFromState,
  startSession,
} from "../runtime/execution/session-driver.ts";
import { prepareNextRuntimeTurn } from "../runtime/execution/prepare-runtime-turn.ts";
import { formatReflectionReport } from "../runtime/evaluation/report.ts";

function parseArgs(argv) {
  let language = "en";
  let startMessage = "Let's start";
  let showDebug = true;

  for (const arg of argv) {
    if (arg.startsWith("--language=")) {
      language = arg.slice("--language=".length);
      continue;
    }
    if (arg.startsWith("--start=")) {
      startMessage = arg.slice("--start=".length);
      continue;
    }
    if (arg === "--no-debug") {
      showDebug = false;
    }
  }

  if (language.startsWith("ja") && startMessage === "Let's start") {
    startMessage = "始めます";
  }

  return { language, startMessage, showDebug };
}

function printHeader(language, showDebug) {
  if (language.startsWith("ja")) {
    console.log("ローカル対話プレイ");
    console.log("==================");
    console.log("進行権は常に local-first runtime 側にあります。");
    console.log("開始シグナルも Player 発話も自動投入しません。");
    console.log(`デバッグ表示: ${showDebug ? "on" : "off"}`);
    console.log("");
    return;
  }

  console.log("Local Interactive Play");
  console.log("======================");
  console.log("Turn progression is always owned by the local-first runtime.");
  console.log("No start signal or player turn will be auto-submitted.");
  console.log(`Debug output: ${showDebug ? "on" : "off"}`);
  console.log("");
}

function printDivider() {
  console.log("");
  console.log("--------------------------------------------------");
  console.log("");
}

function formatDebugLine(turnLog, debugDump, language) {
  const whisper = debugDump.room_state_before.sidecar_state.active_whispers.find(
    (item) => item.target_participant_id === turnLog.selected_speaker,
  );
  const handoff = debugDump.room_state_before.exchange_state.handoff_candidate_actor_ids;

  if (language.startsWith("ja")) {
    return [
      `[runtime] selected=${turnLog.selected_speaker}`,
      `reason=${turnLog.selection_reason ?? "unknown"}`,
      `owner=${turnLog.turn_owner}`,
      `handoff=[${handoff.join(", ")}]`,
      `whisper=${whisper ? `${whisper.angle_shift}/${whisper.context_pressure_tag ?? "none"}` : "none"}`,
    ].join(" | ");
  }

  return [
    `[runtime] selected=${turnLog.selected_speaker}`,
    `reason=${turnLog.selection_reason ?? "unknown"}`,
    `owner=${turnLog.turn_owner}`,
    `handoff=[${handoff.join(", ")}]`,
    `whisper=${whisper ? `${whisper.angle_shift}/${whisper.context_pressure_tag ?? "none"}` : "none"}`,
  ].join(" | ");
}

class LineReader {
  constructor(rl, out) {
    this.rl = rl;
    this.out = out;
    this.pendingResolvers = [];
    this.bufferedLines = [];
    this.closed = false;

    rl.on("line", (line) => {
      const next = this.pendingResolvers.shift();
      if (next) {
        next(line);
        return;
      }

      this.bufferedLines.push(line);
    });

    rl.on("close", () => {
      this.closed = true;

      while (this.pendingResolvers.length > 0) {
        const next = this.pendingResolvers.shift();
        next("");
      }
    });
  }

  async readLine(prompt) {
    this.out.write(prompt);

    if (this.bufferedLines.length > 0) {
      return this.bufferedLines.shift();
    }

    if (this.closed) {
      return "";
    }

    return await new Promise((resolve) => {
      this.pendingResolvers.push(resolve);
    });
  }
}

async function main() {
  const { language, startMessage, showDebug } = parseArgs(process.argv.slice(2));
  printHeader(language, showDebug);
  const responder = new AdapterBackedResponder(new MockModelAdapter());
  const initialized = initializeSession("local-interactive-session", language);
  console.log(initialized.initialization_brief);
  printDivider();

  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity,
    historySize: 0,
    terminal: false,
  });
  const lineReader = new LineReader(rl, output);

  try {
    let started = null;
    while (!started?.accepted) {
      const startInput = (
        await lineReader.readLine(
          language.startsWith("ja")
            ? `開始シグナルを入力してください [example: ${startMessage}] > `
            : `Enter start signal [example: ${startMessage}] > `,
        )
      ).trim();

      if (!startInput) {
        console.log(
          language.startsWith("ja")
            ? "開始シグナルは自動入力されません。開始するには明示的に入力してください。"
            : "The start signal is not auto-submitted. Enter it explicitly to begin.",
        );
        continue;
      }

      if (startInput === "/quit") {
        console.log(language.startsWith("ja") ? "ローカル対話プレイを終了しました。" : "Local interactive play stopped.");
        return;
      }

      started = startSession(initialized.room_state, startInput);

      if (!started.accepted) {
        console.log(
          language.startsWith("ja")
            ? `開始に失敗しました: ${started.rejection_reason}`
            : `Start failed: ${started.rejection_reason}`,
        );
      }
    }

    let state = started.room_state;

    while (state.scene_phase !== "post-game") {
      const nextTurn = prepareNextRuntimeTurn(state);

      if (nextTurn.decision.owner === "player") {
        const playerInput = (await lineReader.readLine(language.startsWith("ja") ? "Player> " : "Player> ")).trim();

        if (!playerInput) {
          console.log(language.startsWith("ja") ? "発話を入力してください。終了するには /quit を入力します。" : "Enter a player turn, or use /quit.");
          continue;
        }

        if (playerInput === "/quit") {
          console.log(language.startsWith("ja") ? "ローカル対話プレイを終了しました。" : "Local interactive play stopped.");
          return;
        }

        state = acceptPlayerMessageWithLocalJudger(state, playerInput, "Player");
        console.log("");
        console.log(`Player: ${playerInput}`);
        printDivider();
        continue;
      }

      const result = await runNextRuntimeActorTurnFromState(state, responder, {
        opening_mode: "local",
        facilitator_mode: "local",
      });
      state = result.room_state;
      const visibleTurn = state.recent_transcript.at(-1);

      if (showDebug) {
        console.log(formatDebugLine(result.turn_log, result.debug_dump, language));
      }

      if (visibleTurn) {
        console.log(`${visibleTurn.speaker_name}: ${visibleTurn.text}`);
      }

      printDivider();
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
  console.error("Local interactive play failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
