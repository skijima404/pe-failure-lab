import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { RuntimePlayerInitialization } from "../state/types.ts";

const PLAYER_INITIALIZATION_PATH = "docs/product/concepts/runtime/mvp-player-initialization.md";

function localizePlayerInitializationForJapanese(
  playerInitialization: RuntimePlayerInitialization,
): RuntimePlayerInitialization {
  return {
    ...playerInitialization,
    session_purpose:
      "実際の stakeholder pressure の中で、境界付きの最初の Platform 方向性を形にしていく一場面のワークショップ型シミュレーションに入る",
    player_goal:
      "現在の方向性を平易な言葉で明確にし、stakeholder からの圧力に応答しながら、完璧な運用モデルではなく境界付きの次の一手を残して部屋を出る",
    player_should_expect: [
      "会議は短いファシリテーターのオープニングから始まり、長い事前説明はない",
      "序盤は、いきなり詳細に入るのではなく framing や scope、方向性の確認に留まることがある",
      "stakeholder は多くの場合、自分の立場の言葉でまず反応してから議論が進む",
      "通常は一度に一つの active topic に集中する",
    ],
    player_allowed_moves: [
      "現在の問題と意図する方向性を、ドラフトとして境界付きで説明する",
      "回答を絞り込み、細かい後続設計は次回以降に送る",
      "次の一手と判断境界が使えるなら、不確実さを認める",
      "ライブ会議に入る前に、ネタバレしない短い確認質問をする",
    ],
    player_not_expected_to_know: [
      "stakeholder ごとの隠れた閾値",
      "見えている structural progress 以外の採点ロジック",
      "各 stakeholder の私的な圧力ロジック",
      "この部屋にとっての唯一の正解",
    ],
    optional_setup_question_example: "この会議が今ここで開かれることになった直前のやり取りはどのようなものだったか",
    start_signal_examples: ["Start", "Begin", "Let's start", "始めます", "開始"],
    opening_move_guidance:
      "ファシリテーターのオープニングの後、まず現在の方向性を短く平易に述べ、その後はすべての下流詳細を一度に解こうとせず反応を捌いていく",
  };
}

function stripInlineCode(value: string): string {
  return value.replace(/`/g, "").trim();
}

function parseScalar(lines: string[], key: string): string {
  const prefix = `- ${key}:`;
  const line = lines.find((candidate) => candidate.startsWith(prefix));
  return line ? stripInlineCode(line.slice(prefix.length)) : "";
}

function parseList(lines: string[], key: string): string[] {
  const prefix = `- ${key}:`;
  const startIndex = lines.findIndex((candidate) => candidate.startsWith(prefix));
  if (startIndex === -1) {
    return [];
  }

  const values: string[] = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith("- ") && !line.startsWith("  - ")) {
      break;
    }
    if (line.startsWith("  - ")) {
      values.push(stripInlineCode(line.slice(4)));
    }
  }

  return values;
}

export function loadDefaultPlayerInitialization(language = "en"): RuntimePlayerInitialization {
  const content = readFileSync(resolve(PLAYER_INITIALIZATION_PATH), "utf8");
  const lines = content.split("\n");

  const playerInitialization = {
    session_purpose: parseScalar(lines, "session_purpose"),
    player_goal: parseScalar(lines, "player_goal"),
    player_should_expect: parseList(lines, "player_should_expect"),
    player_allowed_moves: parseList(lines, "player_allowed_moves"),
    player_not_expected_to_know: parseList(lines, "player_not_expected_to_know"),
    optional_setup_question_example: parseScalar(lines, "optional_setup_question_example"),
    start_signal_examples: parseList(lines, "start_signal_examples"),
    opening_move_guidance: parseScalar(lines, "opening_move_guidance"),
  };

  return language.startsWith("ja") ? localizePlayerInitializationForJapanese(playerInitialization) : playerInitialization;
}
