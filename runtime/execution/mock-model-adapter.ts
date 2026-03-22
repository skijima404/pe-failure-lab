import type { ModelAdapter, ModelAdapterRequest, ModelAdapterResponse } from "./runtime-responder.ts";

interface SidecarReactionCandidateLike {
  angle_shift?: unknown;
  temperature_shift?: unknown;
  optional_question_seed?: unknown;
}

function hashText(value: string): number {
  let hash = 0;

  for (const char of value) {
    hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function inferLanguage(prompt: unknown): string {
  if (prompt && typeof prompt === "object" && "language" in prompt) {
    const language = (prompt as Record<string, unknown>).language;
    if (typeof language === "string") {
      return language;
    }
  }

  return "en";
}

function translateWhisperAngle(angleShift: string | null, language: string): string | null {
  if (!angleShift || !language.startsWith("ja")) {
    return angleShift;
  }

  const translations: Record<string, string> = {
    "launch-risk": "最初の立ち上げリスク",
    "investment-credibility": "投資判断としての納得感",
    "boundary-clarity": "最初の支援境界の明確さ",
    "operator-capacity": "運用キャパシティ",
    "adoption-friction": "現場導入の摩擦",
    "workflow-fit": "現場の進め方との相性",
  };

  return translations[angleShift] ?? angleShift;
}

function translateTopic(activeTopic: string, language: string): string {
  if (!language.startsWith("ja")) {
    return activeTopic;
  }

  const translations: Record<string, string> = {
    "Initial platform scope": "最初のプラットフォーム適用範囲",
    "Bounded platform scope": "絞ったプラットフォーム適用範囲",
    "Scope boundary": "スコープ境界",
    "Onboarding support boundary": "オンボーディング支援の境界",
    "First-use support boundary": "初回利用時の支援境界",
  };

  return translations[activeTopic] ?? activeTopic;
}

function translateConcern(coreConcern: string, language: string): string {
  if (!language.startsWith("ja")) {
    return coreConcern;
  }

  const translations: Record<string, string> = {
    "business value": "事業価値",
    "business value, investment credibility, and practical scale": "事業価値と投資判断の納得感、そして現実的な展開性",
    "operating-model sustainability": "運用モデルを無理なく維持できること",
    "delivery practicality": "現場で無理なく使えること",
  };

  return translations[coreConcern] ?? coreConcern;
}

export class MockModelAdapter implements ModelAdapter {
  generate(request: ModelAdapterRequest): ModelAdapterResponse {
    const prompt = request.prompt_input as Record<string, unknown>;
    const language = inferLanguage(prompt);
    const runtimePersona =
      prompt && typeof prompt === "object" && "runtime_persona" in prompt
        ? (prompt.runtime_persona as Record<string, unknown> | null)
        : null;

    const voiceCues = Array.isArray(runtimePersona?.voice_cues) ? runtimePersona.voice_cues.join(", ") : "neutral";
    const coreConcern =
      typeof runtimePersona?.core_concern === "string" ? runtimePersona.core_concern : "the current topic";
    const activeTopic =
      prompt && typeof prompt === "object" && "active_topic" in prompt
        ? extractTopicLabel(prompt.active_topic)
        : "the active topic";
    const activeWhisper =
      prompt && typeof prompt === "object" && "active_whisper" in prompt
        ? (prompt.active_whisper as SidecarReactionCandidateLike | null)
        : null;

    if (activeWhisper) {
      const rendered = renderSidecarCandidateResponse(request.session_id, request.speaker_id, language, activeWhisper);
      if (rendered) {
        return {
          text: rendered,
          metadata: {
            mock: true,
            runtime_transport: "mock-model-adapter",
            rendering_mode: "whisper-aware-local-rendering",
          },
        };
      }
    }

    return {
      text: renderGenericResponse(request.session_id, request.speaker_id, language, activeTopic, coreConcern, voiceCues),
      metadata: {
        mock: true,
        runtime_transport: "mock-model-adapter",
        rendering_mode: "generic-mock-rendering",
      },
    };
  }
}

function renderSidecarCandidateResponse(
  sessionId: string,
  speakerId: string,
  language: string,
  candidate: SidecarReactionCandidateLike,
): string | null {
  const angleShift = typeof candidate.angle_shift === "string" ? candidate.angle_shift : null;
  const temperatureShift = typeof candidate.temperature_shift === "string" ? candidate.temperature_shift : null;
  const nextQuestion = typeof candidate.optional_question_seed === "string" ? candidate.optional_question_seed : null;
  const variant = hashText(`${sessionId}:${speakerId}:${angleShift ?? "none"}:${nextQuestion ?? "none"}`) % 2;
  const translatedAngleShift = translateWhisperAngle(angleShift, language);

  if (language.startsWith("ja")) {
    if (speakerId === "platform") {
      return [
        variant === 0 ? "その方向なら受け止め方は整理できます。" : "その切り方なら現場運用としてはまだ見えます。",
        translatedAngleShift ? `ただ、今は ${translatedAngleShift} を先に揃えたいです。` : null,
        temperatureShift === "more-concerned" ? "入口を広げすぎると、あとで支援負荷が膨らみます。" : null,
        nextQuestion,
      ]
        .filter(Boolean)
        .join(" ");
    }

    if (speakerId === "delivery") {
      return [
        variant === 0 ? "それなら現場でも試す余地はあります。" : "そこまで絞るなら現場の判断はしやすいです。",
        translatedAngleShift ? `気になるのは ${translatedAngleShift} です。` : null,
        nextQuestion,
      ]
        .filter(Boolean)
        .join(" ");
    }

    if (speakerId === "exec") {
      return [
        variant === 0 ? "その一歩目なら経営判断の土台にはなります。" : "その切り方なら最初の判断材料としては扱えます。",
        translatedAngleShift ? `ただし、${translatedAngleShift} の見え方は押さえたいです。` : null,
        nextQuestion,
      ]
        .filter(Boolean)
        .join(" ");
    }
  }

  if (speakerId === "platform") {
    return [
      "I can work with that direction if we keep it tight.",
      angleShift ? `The angle I still care about is ${angleShift}.` : null,
      temperatureShift ? `I am coming at it ${temperatureShift.replaceAll("-", " ")}.` : null,
      nextQuestion,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (speakerId === "delivery") {
    return [
      "That could help if the first step is usable quickly.",
      angleShift ? `I am still thinking about ${angleShift}.` : null,
      nextQuestion,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (speakerId === "exec") {
    return [
      "That sounds credible enough for a first move.",
      angleShift ? `I want to anchor it in ${angleShift}.` : null,
      nextQuestion,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (angleShift || temperatureShift || nextQuestion) {
    return [angleShift, temperatureShift, nextQuestion].filter((value): value is string => Boolean(value)).join(" ");
  }

  return null;
}

function renderGenericResponse(
  sessionId: string,
  speakerId: string,
  language: string,
  activeTopic: string,
  coreConcern: string,
  voiceCues: string,
): string {
  const variant = hashText(`${sessionId}:${speakerId}:${activeTopic}`) % 2;
  const translatedTopic = translateTopic(activeTopic, language);
  const translatedConcern = translateConcern(coreConcern, language);

  if (language.startsWith("ja")) {
    if (speakerId === "exec") {
      return variant === 0
        ? `${translatedTopic} という整理は分かります。私は ${translatedConcern} の筋が通るかをまず見たいです。`
        : `方向性は見えます。まずは ${translatedConcern} が事業として説明できるかを確認したいです。`;
    }

    if (speakerId === "platform") {
      return variant === 0
        ? `${translatedTopic} の話としては理解できます。こちらは ${translatedConcern} を曖昧にしたくありません。`
        : `論点は分かります。ただ、${translatedConcern} がぼやけると現場では持ちきれません。`;
    }

    if (speakerId === "delivery") {
      return variant === 0
        ? `${translatedTopic} の方向性自体は分かります。現場としては ${translatedConcern} が見えるかが大事です。`
        : `その話なら追えます。ただ、${translatedConcern} がないとチームは動きづらいです。`;
    }
  }

  return `Mock response from ${speakerId} on ${activeTopic}. Concern: ${coreConcern}. Voice cues: ${voiceCues}.`;
}

function extractTopicLabel(activeTopic: unknown): string {
  if (typeof activeTopic === "string") {
    return activeTopic;
  }

  if (activeTopic && typeof activeTopic === "object") {
    const record = activeTopic as Record<string, unknown>;
    if (typeof record.label === "string") {
      return record.label;
    }
  }

  return "the active topic";
}
