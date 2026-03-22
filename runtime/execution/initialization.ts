import type { RoomState } from "../state/types.ts";

export interface InitializationBrief {
  language: string;
  session_purpose: string;
  workshop_goal: string;
  facilitator_opening_frame: string;
  player_goal: string;
  player_should_expect: string[];
  player_allowed_moves: string[];
  player_not_expected_to_know: string[];
  optional_setup_question_example: string;
  start_signal_examples: string[];
}

export function buildInitializationBrief(roomState: RoomState): InitializationBrief {
  return {
    language: roomState.language,
    session_purpose: roomState.player_initialization.session_purpose,
    workshop_goal: roomState.session_setup.meeting_goal,
    facilitator_opening_frame: roomState.session_setup.facilitator_opening_frame,
    player_goal: roomState.player_initialization.player_goal,
    player_should_expect: roomState.player_initialization.player_should_expect,
    player_allowed_moves: roomState.player_initialization.player_allowed_moves,
    player_not_expected_to_know: roomState.player_initialization.player_not_expected_to_know,
    optional_setup_question_example: roomState.player_initialization.optional_setup_question_example,
    start_signal_examples: roomState.player_initialization.start_signal_examples,
  };
}

export function formatInitializationBrief(brief: InitializationBrief): string {
  if (brief.language.startsWith("ja")) {
    return [
      "セッション初期化",
      "================",
      `セッションの目的: ${brief.session_purpose}`,
      `ワークショップのゴール: ${brief.workshop_goal}`,
      `今回この会議が開かれた背景: ${brief.facilitator_opening_frame}`,
      `プレイヤーの目的: ${brief.player_goal}`,
      "",
      "想定しておくこと:",
      ...brief.player_should_expect.map((item) => `- ${item}`),
      "",
      "この場で取ってよい動き:",
      ...brief.player_allowed_moves.map((item) => `- ${item}`),
      "",
      "この時点で知らなくてよいこと:",
      ...brief.player_not_expected_to_know.map((item) => `- ${item}`),
      "",
      `任意の事前確認質問の例: ${brief.optional_setup_question_example}`,
      `開始シグナル: ${brief.start_signal_examples.join(", ")}, 始めます, 開始`,
    ].join("\n");
  }

  return [
    "Session Initialization",
    "======================",
    `Session Purpose: ${brief.session_purpose}`,
    `Workshop Goal: ${brief.workshop_goal}`,
    `Why This Meeting Exists Now: ${brief.facilitator_opening_frame}`,
    `Player Goal: ${brief.player_goal}`,
    "",
    "What To Expect:",
    ...brief.player_should_expect.map((item) => `- ${item}`),
    "",
    "Allowed Moves:",
    ...brief.player_allowed_moves.map((item) => `- ${item}`),
    "",
    "You Are Not Expected To Know:",
    ...brief.player_not_expected_to_know.map((item) => `- ${item}`),
    "",
    `Optional Setup Question Example: ${brief.optional_setup_question_example}`,
    `Start Signals: ${brief.start_signal_examples.join(", ")}`,
  ].join("\n");
}

function normalizeStartSignal(text: string): string {
  return text.trim().toLowerCase().replace(/[!.]/g, "");
}

export function isStartSignal(text: string, roomState: RoomState): boolean {
  const normalized = normalizeStartSignal(text);
  const startSignalExamples = [...roomState.player_initialization.start_signal_examples];

  if (roomState.language.startsWith("ja")) {
    startSignalExamples.push("始めます", "開始", "始めましょう", "スタート");
  }

  return startSignalExamples.some(
    (candidate) => normalizeStartSignal(candidate) === normalized,
  );
}
