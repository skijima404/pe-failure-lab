import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { RuntimeSceneSetup } from "../state/types.ts";

const SCENE_SETUP_PATH = "docs/product/concepts/runtime/mvp-scene-setup.md";

function localizeSceneSetupForJapanese(sceneSetup: RuntimeSceneSetup): RuntimeSceneSetup {
  return {
    ...sceneSetup,
    scenario: "Platform Engineering Failure Lab MVP",
    session_mode: "ブレインストーミング型ワークショップ",
    meeting_goal: "支援と責任分担への含意を見える形にしながら、Platform の最初の方向性を境界付きで形にする",
    active_topic_seed: "最初の Platform スコープ",
    facilitator_opening_frame:
      "今回は抽象的な Platform 論を繰り返すのではなく、まず使える最初の方向性をこの場で置く必要があるため、このワークショップが設定されています",
    player_start_expectation:
      "プレイヤーは最初に現在の方向性を短く明確にし、その後は一度に一つのアクティブトピックで stakeholder の反応を捌いていくことが期待されます",
    enterprise_context_summary: [
      "大きなエンタープライズで、レガシー資産の比重が高い",
      "多くのデリバリーは依然としてベンダ依存かつウォーターフォール寄り",
      "実務上の既定はクラウド VM で、Kubernetes は戦略上の到達先として見られている",
      "会議でのコミットメントが、そのまま既定の約束として固定化しやすい",
      "Platform Engineering が中央支援機能だと誤解されやすい",
    ],
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

export function loadDefaultSceneSetup(language = "en"): RuntimeSceneSetup {
  const content = readFileSync(resolve(SCENE_SETUP_PATH), "utf8");
  const lines = content.split("\n");

  const sceneSetup = {
    scenario: parseScalar(lines, "scenario"),
    session_mode: parseScalar(lines, "session_mode"),
    meeting_goal: parseScalar(lines, "meeting_goal"),
    active_topic_seed: parseScalar(lines, "active_topic_seed"),
    facilitator_opening_frame: parseScalar(lines, "facilitator_opening_frame"),
    player_start_expectation: parseScalar(lines, "player_start_expectation"),
    enterprise_context_summary: parseList(lines, "enterprise_context_summary"),
  };

  return language.startsWith("ja") ? localizeSceneSetupForJapanese(sceneSetup) : sceneSetup;
}
