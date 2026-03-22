import type { RoomState } from "../state/types.ts";

export interface InitializationBrief {
  language: string;
  scenario: string;
  session_mode: string;
  session_purpose: string;
  active_topic_seed: string;
  enterprise_context_summary: string[];
  player_start_expectation: string;
  workshop_goal: string;
  facilitator_opening_frame: string;
  player_goal: string;
  participant_cast: string[];
  player_should_expect: string[];
  player_allowed_moves: string[];
  player_not_expected_to_know: string[];
  optional_setup_question_example: string;
  start_signal_examples: string[];
}

export function buildInitializationBrief(roomState: RoomState): InitializationBrief {
  return {
    language: roomState.language,
    scenario: roomState.session_setup.scenario,
    session_mode: roomState.session_setup.session_mode,
    session_purpose: roomState.player_initialization.session_purpose,
    active_topic_seed: roomState.session_setup.active_topic_seed,
    enterprise_context_summary: roomState.session_setup.enterprise_context_summary,
    player_start_expectation: roomState.session_setup.player_start_expectation,
    workshop_goal: roomState.session_setup.meeting_goal,
    facilitator_opening_frame: roomState.session_setup.facilitator_opening_frame,
    player_goal: roomState.player_initialization.player_goal,
    participant_cast: buildParticipantCast(roomState),
    player_should_expect: roomState.player_initialization.player_should_expect,
    player_allowed_moves: roomState.player_initialization.player_allowed_moves,
    player_not_expected_to_know: roomState.player_initialization.player_not_expected_to_know,
    optional_setup_question_example: roomState.player_initialization.optional_setup_question_example,
    start_signal_examples: roomState.player_initialization.start_signal_examples,
  };
}

export function formatInitializationBrief(brief: InitializationBrief): string {
  const startSignals = Array.from(new Set(brief.start_signal_examples));

  if (brief.language.startsWith("ja")) {
    return [
      "状況説明",
      "========",
      `シナリオ: ${brief.scenario}`,
      `会議モード: ${brief.session_mode}`,
      `この場のテーマ: ${brief.active_topic_seed}`,
      `会議の背景: ${brief.facilitator_opening_frame}`,
      `今回のゴール: ${brief.workshop_goal}`,
      "",
      "この会社の前提:",
      ...brief.enterprise_context_summary.map((item) => `- ${item}`),
      "",
      "登場人物:",
      ...brief.participant_cast.map((item) => `- ${item}`),
      "",
      "あなたの立ち位置:",
      `- この場でやること: ${brief.session_purpose}`,
      `- あなたの狙い: ${brief.player_goal}`,
      `- 最初に期待される動き: ${brief.player_start_expectation}`,
      "",
      "会議の進み方の目安:",
      ...brief.player_should_expect.map((item) => `- ${item}`),
      "",
      "この場で取ってよい動き:",
      ...brief.player_allowed_moves.map((item) => `- ${item}`),
      "",
      "この時点で知らなくてよいこと:",
      ...brief.player_not_expected_to_know.map((item) => `- ${item}`),
      "",
      `任意の事前確認質問の例: ${brief.optional_setup_question_example}`,
      `開始シグナル: ${startSignals.join(", ")}`,
    ].join("\n");
  }

  return [
    "Situation Brief",
    "===============",
    `Scenario: ${brief.scenario}`,
    `Session Mode: ${brief.session_mode}`,
    `Current Topic: ${brief.active_topic_seed}`,
    `Why This Meeting Exists Now: ${brief.facilitator_opening_frame}`,
    `Workshop Goal: ${brief.workshop_goal}`,
    "",
    "Enterprise Context:",
    ...brief.enterprise_context_summary.map((item) => `- ${item}`),
    "",
    "Who Is In The Room:",
    ...brief.participant_cast.map((item) => `- ${item}`),
    "",
    "Your Position In This Meeting:",
    `- Session purpose: ${brief.session_purpose}`,
    `- Player goal: ${brief.player_goal}`,
    `- Expected opening move: ${brief.player_start_expectation}`,
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
    `Start Signals: ${startSignals.join(", ")}`,
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

function buildParticipantCast(roomState: RoomState): string[] {
  return roomState.participant_states
    .filter((participant) => participant.role_type === "facilitator" || participant.role_type === "stakeholder")
    .map((participant) => describeParticipant(roomState, participant.participant_id));
}

function describeParticipant(roomState: RoomState, participantId: string): string {
  const participant = roomState.participant_states.find((item) => item.participant_id === participantId);
  if (!participant) {
    return participantId;
  }

  const concern = participant.current_concern_label ?? "their own concerns";
  const language = roomState.language;

  if (language.startsWith("ja")) {
    switch (participant.participant_id) {
      case "mika":
        return `${participant.display_name}: ファシリテーター。会議の流れを整えつつ、論点が散らないように見る。`;
      case "exec":
        return `${participant.display_name}: 事業側の視点。主に ${concern} を気にして反応する。`;
      case "platform":
        return `${participant.display_name}: Platform 側の視点。主に ${concern} を気にして反応する。`;
      case "delivery":
        return `${participant.display_name}: 利用側の視点。主に ${concern} を気にして反応する。`;
      default:
        return `${participant.display_name}: 主に ${concern} を気にして反応する。`;
    }
  }

  switch (participant.participant_id) {
    case "mika":
      return `${participant.display_name}: facilitator who keeps the room moving without taking over the content.`;
    case "exec":
      return `${participant.display_name}: business-side stakeholder who reacts mainly through ${concern}.`;
    case "platform":
      return `${participant.display_name}: platform-side stakeholder who reacts mainly through ${concern}.`;
    case "delivery":
      return `${participant.display_name}: delivery-side stakeholder who reacts mainly through ${concern}.`;
    default:
      return `${participant.display_name}: stakeholder who reacts mainly through ${concern}.`;
  }
}
