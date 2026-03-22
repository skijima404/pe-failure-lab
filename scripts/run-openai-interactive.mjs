import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

import { AdapterBackedResponder, OpenAIResponsesAdapter } from "../runtime/execution/runtime-responder.ts";
import { AdapterBackedPlayerTurnJudger } from "../runtime/orchestration/adapter-backed-player-turn-judger.ts";
import {
  acceptPlayerMessage,
  acceptPlayerMessageWithJudger,
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
  let playerJudger = "openai";

  for (const arg of argv) {
    if (arg.startsWith("--language=")) {
      language = arg.slice("--language=".length);
      continue;
    }
    if (arg.startsWith("--start=")) {
      startMessage = arg.slice("--start=".length);
      continue;
    }
    if (arg.startsWith("--player-judger=")) {
      playerJudger = arg.slice("--player-judger=".length);
    }
  }

  return { language, startMessage, playerJudger };
}

function printDivider() {
  console.log("");
  console.log("--------------------------------------------------");
  console.log("");
}

function findSpeakerName(roomState, speakerId) {
  if (speakerId === "player") {
    return "Player";
  }

  const participant = roomState.participant_states.find((item) => item.participant_id === speakerId);
  return participant?.display_name ?? speakerId;
}

function printPlayerDebugSummary(roomState, nextDecision) {
  const judgment = roomState.main_session_judgment;

  console.log("Debug Summary");
  console.log("=============");
  console.log(`meeting_layer: ${judgment.meeting_layer}`);
  console.log(`player_intent: ${judgment.last_player_intent ?? "null"}`);
  console.log(`multi_perspective_needed: ${judgment.multi_perspective_needed}`);
  console.log(
    `selected_next_speaker: ${findSpeakerName(roomState, nextDecision.speaker_id)} (${nextDecision.speaker_id})`,
  );
  console.log(`selection_reason: ${nextDecision.selection_reason ?? "unknown"}`);
}

function printHeader(remoteMultiAgent, playerJudger) {
  console.log("Remote-Backed Interactive Harness");
  console.log("=================================");
  console.log("Purpose: run human play over the local-first runtime with remote-backed actor generation.");
  console.log(`Response chain mode: ${remoteMultiAgent ? "per-speaker remote continuation" : "stateless remote calls"}`);
  console.log(`Player-turn judgment mode: ${playerJudger === "openai" ? "remote-backed stateless model judgment" : "local default judgment"}`);
  console.log("Player input mode: single-line by default. Use /multi for a multi-line player turn, /send to submit, /cancel to discard.");
  console.log("");
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

async function readPlayerTurn(lineReader) {
  const firstLine = (await lineReader.readLine("Player> ")).trimEnd();
  const normalizedFirstLine = firstLine.trim();

  if (normalizedFirstLine !== "/multi") {
    return normalizedFirstLine;
  }

  console.log("Multi-line mode. Enter player turn lines. Use /send to submit, /cancel to discard, /quit to stop.");
  const lines = [];

  while (true) {
    const nextLine = await lineReader.readLine("... ");
    const normalized = nextLine.trim();

    if (normalized === "/send") {
      const combined = lines.join("\n").trim();

      if (!combined) {
        console.log("Multi-line player turn is empty. Keep typing, or use /cancel to discard.");
        continue;
      }

      return combined;
    }

    if (normalized === "/cancel") {
      console.log("Multi-line player turn discarded.");
      return "";
    }

    if (normalized === "/quit") {
      return "/quit";
    }

    lines.push(nextLine);
  }
}

async function main() {
  loadRepoEnv();

  const { language, startMessage, playerJudger } = parseArgs(process.argv.slice(2));
  const remoteMultiAgent = parseBooleanEnv(process.env.OPENAI_REMOTE_MULTI_AGENT, true);
  printHeader(remoteMultiAgent, playerJudger);
  const actorAdapter = new OpenAIResponsesAdapter({
    apiKey: requiredEnv("OPENAI_API_KEY"),
    model: process.env.OPENAI_MODEL ?? "gpt-5",
    reasoningEffort: parseReasoningEffort(process.env.OPENAI_REASONING_EFFORT),
    conversationMode: remoteMultiAgent ? "per-speaker-response-chain" : "stateless",
  });
  const responder = new AdapterBackedResponder(actorAdapter);
  const playerTurnJudger =
    playerJudger === "openai"
      ? new AdapterBackedPlayerTurnJudger(
          new OpenAIResponsesAdapter({
            apiKey: requiredEnv("OPENAI_API_KEY"),
            model: process.env.OPENAI_MODEL ?? "gpt-5",
            reasoningEffort: parseReasoningEffort(process.env.OPENAI_REASONING_EFFORT),
            conversationMode: "stateless",
          }),
        )
      : null;
  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity,
    historySize: 0,
    terminal: false,
  });
  const lineReader = new LineReader(rl, output);

  try {
    const initialized = initializeSession("openai-interactive-session", language);
    console.log(initialized.initialization_brief);
    printDivider();

    const startInput = await lineReader.readLine(`Start Signal [default: ${startMessage}]: `);
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
        const normalized = await readPlayerTurn(lineReader);

        if (!normalized) {
          console.log("Please enter a player turn or type /quit.");
          continue;
        }

        if (normalized === "/quit") {
          console.log("Interactive playtest stopped.");
          return;
        }

        state = playerTurnJudger
          ? await acceptPlayerMessageWithJudger(state, normalized, playerTurnJudger, "Player")
          : acceptPlayerMessage(state, normalized, "Player");
        const nextDecision = prepareNextRuntimeTurn(state).decision;
        console.log("");
        console.log(`Player: ${normalized}`);
        console.log("");
        printPlayerDebugSummary(state, nextDecision);
        printDivider();
        continue;
      }

      const runtimeActorTurn = await runNextRuntimeActorTurnFromState(state, responder, {
        opening_mode: "local",
        facilitator_mode: "local",
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
