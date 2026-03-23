import type { ActorPromptInput } from "../agents/actor/prompt.ts";
import type { RoomState, TranscriptTurn, TurnOwner } from "../state/types.ts";

function hashText(value: string): number {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function extractReferenceSnippet(text: string, language: string): string | null {
  const cleaned = normalizeWhitespace(text);
  if (!cleaned) {
    return null;
  }

  if (language.startsWith("ja")) {
    const candidate = cleaned.split(/[。！？\n]/).map((item) => item.trim()).find((item) => item.length >= 8) ?? cleaned;
    return candidate.length > 44 ? `${candidate.slice(0, 44).trim()}…` : candidate;
  }

  const candidate = cleaned.split(/[.!?\n]/).map((item) => item.trim()).find((item) => item.length >= 12) ?? cleaned;
  return candidate.length > 72 ? `${candidate.slice(0, 72).trim()}…` : candidate;
}

function selectLatestRelevantTurn(input: ActorPromptInput): TranscriptTurn | null {
  const turns = [...input.recent_transcript.recent_turns].reverse();
  return turns.find((turn) => turn.speaker_id !== input.speaker_id) ?? null;
}

function translateWhisperAngle(angleShift: string | null, language: string): string | null {
  if (!angleShift || !language.startsWith("ja")) {
    return angleShift;
  }

  const translations: Record<string, string> = {
    "launch-risk": "最初の立ち上げリスク",
    "investment-credibility": "投資判断としての納得感",
    "boundary-clarity": "支援境界の明確さ",
    "operator-capacity": "運用キャパシティ",
    "adoption-friction": "導入時の摩擦",
    "workflow-fit": "現場の進め方との相性",
  };

  return translations[angleShift] ?? angleShift;
}

function translatePressureTag(tag: string | null, language: string): string | null {
  if (!tag || !language.startsWith("ja")) {
    return tag;
  }

  const translations: Record<string, string> = {
    "legacy-inertia": "既存運用の慣性",
    "vendor-mediated-delivery": "ベンダ越しの進め方",
    "uneven-modernization": "モダナイゼーションのばらつき",
    "commitment-hardens-quickly": "会議での約束が既定化しやすいこと",
    "support-function-misread": "Platform が中央支援窓口に見られやすいこと",
    "operational-default-not-target-standard": "実務の既定と戦略標準のずれ",
  };

  return translations[tag] ?? tag;
}

function chooseVariant(roomState: RoomState, speakerId: string, referenceText: string | null): number {
  return hashText(`${roomState.session_id}:${roomState.turn_index}:${speakerId}:${referenceText ?? "none"}`) % 3;
}

function derivePromptLikeQuestion(input: ActorPromptInput): string | null {
  if (input.active_whisper?.optional_question_seed) {
    return input.active_whisper.optional_question_seed;
  }

  const speakerId = input.speaker_id;
  const activeTopic = input.active_topic.label;

  if (input.language.startsWith("ja")) {
    if (speakerId === "exec") {
      return activeTopic.includes("scope") || activeTopic.includes("boundary")
        ? "最初にどこまでを対象にする想定ですか。"
        : "その一歩をどの価値につなげる想定ですか。";
    }

    if (speakerId === "platform") {
      return "Platform がどこまで持ち、どこから先を持たない想定ですか。";
    }

    if (speakerId === "delivery") {
      return "利用側が最初に何を見れば自力で着手できる想定ですか。";
    }

    return "その条件を一段具体化するとどうなりますか。";
  }

  if (speakerId === "exec") {
    return "What is the smallest scope that still makes this worthwhile?";
  }
  if (speakerId === "platform") {
    return "Where does platform support stop in this first move?";
  }
  if (speakerId === "delivery") {
    return "What would a team need to see first to start using this on their own?";
  }
  return "What does that mean in the next practical step?";
}

function buildLead(input: ActorPromptInput, referenceText: string | null, variant: number): string {
  const role = input.speaker_id;
  const language = input.language;

  if (language.startsWith("ja")) {
    if (role === "exec") {
      const subject = referenceText ? `今の「${referenceText}」という置き方` : "その整理";
      return variant === 0 ? `${subject}なら方向は追えます。` : `${subject}だと最初の筋は見えます。`;
    }

    if (role === "platform") {
      return referenceText
        ? variant === 0
          ? `「${referenceText}」ならまだ受け止め方は作れます。`
          : `今の置き方なら Platform 側でも想像はできます。`
        : variant === 0
          ? "その切り方ならまだ追えます。"
          : "今の整理なら Platform 側でも話は見えます。";
    }

    if (role === "delivery") {
      return referenceText
        ? variant === 0
          ? `「${referenceText}」なら現場でも入口は想像できます。`
          : `その置き方なら利用側でも試す絵は持てます。`
        : variant === 0
          ? "その方向なら現場でも追えます。"
          : "その切り方なら利用側でも入り口は見えます。";
    }

    return referenceText ? `「${referenceText}」という話なら理解できます。` : "話の方向は理解できます。";
  }

  if (role === "exec") {
    return referenceText ? `I can follow the idea in "${referenceText}."` : "I can follow the direction.";
  }
  if (role === "platform") {
    return referenceText ? `I can work with the shape in "${referenceText}."` : "I can work with that direction.";
  }
  if (role === "delivery") {
    return referenceText ? `From a team side, "${referenceText}" is at least usable.` : "From a team side, that is at least usable.";
  }
  return referenceText ? `I can see what "${referenceText}" is trying to do.` : "I can see the direction.";
}

function buildConcernClause(input: ActorPromptInput): string | null {
  const angle = translateWhisperAngle(input.active_whisper?.angle_shift ?? null, input.language);
  const pressureTag = translatePressureTag(input.active_whisper?.context_pressure_tag ?? null, input.language);
  const coreConcern = input.runtime_persona.core_concern;

  if (input.language.startsWith("ja")) {
    if (angle && pressureTag) {
      return `ただ、${angle} と ${pressureTag} は先に見える形にしたいです。`;
    }
    if (angle) {
      return `ただ、${angle} は先に見える形にしたいです。`;
    }
    if (pressureTag) {
      return `ただ、${pressureTag} は無視しにくいです。`;
    }

    if (input.speaker_id === "platform") {
      return `こちらとしては ${coreConcern} を曖昧にしたくありません。`;
    }
    if (input.speaker_id === "delivery") {
      return `利用側では ${coreConcern} が見えないと動きづらいです。`;
    }
    if (input.speaker_id === "exec") {
      return `事業側としては ${coreConcern} が説明できる形にしたいです。`;
    }
    return `ただ、${coreConcern} は押さえておきたいです。`;
  }

  if (angle && pressureTag) {
    return `What still matters to me is ${angle}, and the background pressure still feels like ${pressureTag}.`;
  }
  if (angle) {
    return `What still matters to me is ${angle}.`;
  }
  if (pressureTag) {
    return `The background pressure still feels like ${pressureTag}.`;
  }
  return `I do not want to lose sight of ${coreConcern}.`;
}

function buildLiveActorText(input: ActorPromptInput, roomState: RoomState): string {
  const relevantTurn = selectLatestRelevantTurn(input);
  const referenceText = relevantTurn ? extractReferenceSnippet(relevantTurn.text, input.language) : null;
  const variant = chooseVariant(roomState, input.speaker_id, referenceText);
  const lead = buildLead(input, referenceText, variant);
  const concern = buildConcernClause(input);
  const nextQuestion = derivePromptLikeQuestion(input);

  return [lead, concern, nextQuestion].filter(Boolean).join(" ");
}

function inferSpeakerName(roomState: RoomState, speakerId: string): string {
  const participant = roomState.participant_states.find((item) => item.participant_id === speakerId);
  return participant?.display_name ?? speakerId;
}

export function renderLocalLiveActorTurn(params: {
  roomState: RoomState;
  promptInput: ActorPromptInput;
  speakerId: string;
  turnOwner: TurnOwner;
}): {
  speaker_id: string;
  speaker_name: string;
  turn_owner: TurnOwner;
  text: string;
  response_metadata: Record<string, unknown>;
} {
  const { roomState, promptInput, speakerId, turnOwner } = params;

  return {
    speaker_id: speakerId,
    speaker_name: inferSpeakerName(roomState, speakerId),
    turn_owner: turnOwner,
    text: buildLiveActorText(promptInput, roomState),
    response_metadata: {
      runtime_transport: "local-live-responder",
      rendering_mode: "local-live-actor-generation",
      verification_asset: false,
    },
  };
}
