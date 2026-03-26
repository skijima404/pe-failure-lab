import type { ActorPromptInput } from "../agents/actor/prompt.ts";
import type { RoomState, TranscriptTurn, TurnOwner } from "../state/types.ts";
import { resolvePlayReadSurfaceMode } from "./play-read-surface.ts";

type SessionTension = "steady" | "guarded" | "pressured" | "looping";
type TurnMove = "ask" | "narrow" | "support-with-condition" | "push-back";
type StanceTone = "probing" | "guarded" | "constructive" | "skeptical";

interface RuntimeTurnStance {
  tone: StanceTone;
  move: TurnMove;
  mode: "answer" | "reaction";
  focus: string;
  pressure: string | null;
  reference_text: string | null;
  session_tension: SessionTension;
}

interface RepetitionContext {
  same_actor_continuation: boolean;
  repeated_focus: boolean;
  repeated_pressure: boolean;
}

interface CompactTurnHandoff {
  speaker_id: string;
  language: string;
  mode: "answer" | "reaction";
  tone: StanceTone;
  move: TurnMove;
  topic_label: string;
  topic_type: ActorPromptInput["active_topic"]["topic_type"];
  reference_text: string | null;
  focus: string;
  pressure: string | null;
  session_tension: SessionTension;
  repetition: RepetitionContext;
  last_player_intent: ActorPromptInput["last_player_intent"];
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
    return candidate.length > 38 ? `${candidate.slice(0, 38).trim()}…` : candidate;
  }

  const candidate = cleaned.split(/[.!?\n]/).map((item) => item.trim()).find((item) => item.length >= 12) ?? cleaned;
  return candidate.length > 64 ? `${candidate.slice(0, 64).trim()}…` : candidate;
}

function selectLatestRelevantTurn(input: ActorPromptInput): TranscriptTurn | null {
  const turns = [...input.recent_transcript.recent_turns].reverse();
  return turns.find((turn) => turn.speaker_id !== input.speaker_id) ?? null;
}

function selectLatestSpeakerTurn(input: ActorPromptInput): TranscriptTurn | null {
  const turns = [...input.recent_transcript.recent_turns].reverse();
  return turns.find((turn) => turn.speaker_id === input.speaker_id) ?? null;
}

function inferSessionTension(roomState: RoomState): SessionTension {
  if (roomState.exchange_state.follow_up_count >= 2 || roomState.turn_index >= 8) {
    return "looping";
  }

  if (roomState.structural_state.open_risks.length >= 2 || roomState.turn_index >= 6) {
    return "pressured";
  }

  if (roomState.main_session_judgment.multi_perspective_needed || roomState.exchange_state.should_continue_current_exchange) {
    return "guarded";
  }

  return "steady";
}

function deriveFallbackTone(input: ActorPromptInput): StanceTone {
  const toneSummary = input.runtime_persona?.tone_summary?.toLowerCase() ?? "";

  if (/skeptic|skeptical|commercially serious/.test(toneSummary)) {
    return "skeptical";
  }
  if (/guarded|cautious|wary/.test(toneSummary)) {
    return "guarded";
  }
  if (/practical|exploratory|curious|reflective/.test(toneSummary)) {
    return "probing";
  }
  if (/constructive|supportive|calm/.test(toneSummary)) {
    return "constructive";
  }
  if (input.turn_role === "reacting_actor") {
    return "probing";
  }
  if (input.speaker_id === "platform") {
    return "guarded";
  }
  if (input.speaker_id === "delivery") {
    return "probing";
  }
  return "constructive";
}

function deriveFallbackMove(input: ActorPromptInput, tone: StanceTone): TurnMove {
  const defaultMove = input.runtime_persona?.default_move;

  if (defaultMove === "ask" || defaultMove === "narrow" || defaultMove === "support-with-condition" || defaultMove === "push-back") {
    return defaultMove;
  }

  if (tone === "probing") {
    return "ask";
  }
  if (input.speaker_id === "platform") {
    return "narrow";
  }
  if (input.speaker_id === "exec") {
    return "support-with-condition";
  }
  if (tone === "skeptical") {
    return "push-back";
  }

  return "ask";
}

function deriveFocus(input: ActorPromptInput): string {
  if (resolvePlayReadSurfaceMode() === "narrow") {
    return input.active_whisper?.focus_cue ?? input.runtime_persona?.core_concern ?? input.active_topic.label;
  }

  return (
    input.active_whisper?.focus_cue ??
    input.speaker_runtime_slice.current_concern_label ??
    input.runtime_persona?.core_concern ??
    input.active_topic.label
  );
}

function derivePressureSeed(input: ActorPromptInput): string | null {
  if (resolvePlayReadSurfaceMode() === "narrow") {
    return null;
  }

  return input.speaker_runtime_slice.session_setup?.current_pressure_seed ?? null;
}

function shouldHardenMove(input: ActorPromptInput, tension: SessionTension): boolean {
  return input.runtime_persona?.patience === "low" && (tension === "pressured" || tension === "looping");
}

function shouldSoftenMove(input: ActorPromptInput): boolean {
  return input.runtime_persona?.trust_threshold === "one-bounded-signal";
}

function deriveRealizationMode(input: ActorPromptInput): "answer" | "reaction" {
  if (input.last_player_intent === "request-trigger-alignment") {
    return "answer";
  }

  if (
    input.last_player_intent === "request-role-specific-explanation" ||
    input.last_player_intent === "clarify-current-layer" ||
    input.last_player_intent === "confirm-current-understanding"
  ) {
    return "answer";
  }

  if (input.last_player_utterance_type === "clarification") {
    return "answer";
  }

  if (input.last_player_utterance_type === "question" && !input.active_whisper) {
    return "answer";
  }

  return "reaction";
}

function deriveTurnStance(input: ActorPromptInput, roomState: RoomState): RuntimeTurnStance {
  const relevantTurn = selectLatestRelevantTurn(input);
  const tone = input.active_whisper?.stance_bias ?? deriveFallbackTone(input);
  const sessionTension = inferSessionTension(roomState);
  const baseMove = input.active_whisper?.move_bias ?? deriveFallbackMove(input, tone);
  const mode = deriveRealizationMode(input);
  const move =
    mode === "answer"
      ? baseMove
      : shouldHardenMove(input, sessionTension) && baseMove === "support-with-condition"
        ? "push-back"
        : shouldSoftenMove(input) && baseMove === "push-back" && sessionTension === "steady"
          ? "support-with-condition"
          : baseMove;

  return {
    tone,
    move,
    mode,
    focus: deriveFocus(input),
    pressure: input.active_whisper?.context_pressure_tag ?? derivePressureSeed(input),
    reference_text: relevantTurn ? extractReferenceSnippet(relevantTurn.text, input.language) : null,
    session_tension: sessionTension,
  };
}

function translateAngle(angleShift: string, language: string): string {
  if (!language.startsWith("ja")) {
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

function translatePressure(pressureTag: string | null, language: string): string | null {
  if (!pressureTag || !language.startsWith("ja")) {
    return pressureTag;
  }

  const translations: Record<string, string> = {
    "legacy-inertia": "既存運用の慣性",
    "vendor-mediated-delivery": "ベンダ越しの進め方",
    "uneven-modernization": "モダナイゼーションのばらつき",
    "commitment-hardens-quickly": "会議での約束が既定化しやすいこと",
    "support-function-misread": "Platform が中央支援窓口に見られやすいこと",
    "operational-default-not-target-standard": "実務の既定と戦略標準のずれ",
  };

  return translations[pressureTag] ?? pressureTag;
}

function looksLikeEnglishRuntimeText(value: string): boolean {
  return /^[A-Za-z0-9 ,.'()/-]+$/.test(value.trim());
}

function fallbackJapaneseFocus(input: ActorPromptInput): string {
  if (input.speaker_id === "exec") {
    return "最初の事業判断の筋";
  }
  if (input.speaker_id === "platform") {
    return "支援境界";
  }
  if (input.speaker_id === "delivery") {
    return "現場での使いやすさ";
  }
  return "この論点";
}

function fallbackJapanesePressure(input: ActorPromptInput): string {
  if (input.speaker_id === "exec") {
    return "広い約束に見えすぎること";
  }
  if (input.speaker_id === "platform") {
    return "Platform 側の負荷が静かに膨らむこと";
  }
  if (input.speaker_id === "delivery") {
    return "現場のロードマップ負荷";
  }
  return "この場の進行負荷";
}

function translateVisibleFocus(input: ActorPromptInput, focus: string): string {
  if (!input.language.startsWith("ja")) {
    return focus;
  }

  const translations: Record<string, string> = {
    "business value and investment credibility for the first move": "最初の一手としての事業価値と投資判断の筋",
    "support boundary staying real enough that platform does not absorb invisible work": "Platform が見えない追加作業を抱え込まない支援境界",
    "immediate usability and reduced delivery friction": "すぐに使えて現場の進めにくさを減らせること",
    "migration safety and believable risk reduction for a fragile system": "壊れやすい既存システムに対する移行安全性と納得できるリスク低減",
    "keep the room legible without taking over the content": "内容を取り上げずに場の見通しを保つこと",
  };

  if (translations[focus]) {
    return translations[focus];
  }

  return looksLikeEnglishRuntimeText(focus) ? fallbackJapaneseFocus(input) : focus;
}

function translateVisiblePressure(input: ActorPromptInput, pressure: string | null): string | null {
  if (!pressure || !input.language.startsWith("ja")) {
    return pressure;
  }

  const translatedTag = translatePressure(pressure, input.language);
  if (translatedTag !== pressure) {
    return translatedTag;
  }

  const translations: Record<string, string> = {
    "avoid broad commitment without a believable first move and practical logic": "もっともらしい最初の一手がないまま広い約束に見えること",
    "the team is already busy and cannot silently absorb more operational or onboarding work": "Platform 側がこれ以上の運用やオンボーディング負荷を静かに抱え込めないこと",
    "active roadmap pressure makes it hard to adopt a path that adds interpretation overhead before helping": "ロードマップ圧の中で、役に立つ前に読み解き負荷を増やす道は取りにくいこと",
    "trying to sound too complete too early can make the room read broad commitment into a draft idea": "早い段階で言い切りすぎると、粗い案が広い約束に見えてしまうこと",
  };

  if (translations[pressure]) {
    return translations[pressure];
  }

  return looksLikeEnglishRuntimeText(pressure) ? fallbackJapanesePressure(input) : pressure;
}

function focusWithWhisper(input: ActorPromptInput, focus: string): string {
  if (input.active_whisper) {
    return translateAngle(input.active_whisper.angle_shift, input.language);
  }

  return translateVisibleFocus(input, focus);
}

function deriveRepetitionContext(input: ActorPromptInput, roomState: RoomState, stance: RuntimeTurnStance): RepetitionContext {
  const latestSpeakerTurn = selectLatestSpeakerTurn(input);
  const previousText = normalizeWhitespace(latestSpeakerTurn?.text ?? "").toLowerCase();
  const visibleFocus = normalizeWhitespace(focusWithWhisper(input, stance.focus)).toLowerCase();
  const visiblePressure = normalizeWhitespace(translateVisiblePressure(input, stance.pressure) ?? "").toLowerCase();

  return {
    same_actor_continuation:
      roomState.recent_transcript.at(-1)?.speaker_id === input.speaker_id || roomState.exchange_state.follow_up_count >= 2,
    repeated_focus: visibleFocus.length > 0 && previousText.includes(visibleFocus),
    repeated_pressure: visiblePressure.length > 0 && previousText.includes(visiblePressure),
  };
}

function buildCompactTurnHandoff(input: ActorPromptInput, roomState: RoomState): CompactTurnHandoff {
  const stance = deriveTurnStance(input, roomState);

  return {
    speaker_id: input.speaker_id,
    language: input.language,
    mode: stance.mode,
    tone: stance.tone,
    move: stance.move,
    topic_label: input.active_topic.label,
    topic_type: input.active_topic.topic_type,
    reference_text: stance.reference_text,
    focus: focusWithWhisper(input, stance.focus),
    pressure: translateVisiblePressure(input, stance.pressure),
    session_tension: stance.session_tension,
    repetition: deriveRepetitionContext(input, roomState, stance),
    last_player_intent: input.last_player_intent,
  };
}

function buildPressureHint(handoff: CompactTurnHandoff): string | null {
  if (!handoff.pressure) {
    if (handoff.session_tension === "looping") {
      return handoff.language.startsWith("ja")
        ? "ここで広げるより、まず一点だけ見たいです。"
        : "I would keep this to one point instead of widening it here.";
    }
    return null;
  }

  if (handoff.repetition.repeated_pressure && handoff.session_tension !== "looping") {
    return null;
  }

  if (handoff.language.startsWith("ja")) {
    return handoff.session_tension === "looping"
      ? `ただ、${handoff.pressure} を外すとまた曖昧になります。`
      : `ただ、${handoff.pressure} は外せません。`;
  }

  return handoff.session_tension === "looping"
    ? `If we drop ${handoff.pressure}, this gets muddy again.`
    : `I still need ${handoff.pressure} kept in view.`;
}

function buildTopicLead(handoff: CompactTurnHandoff): string | null {
  if (!handoff.reference_text || handoff.repetition.same_actor_continuation) {
    return null;
  }

  if (handoff.language.startsWith("ja")) {
    return `「${handoff.reference_text}」の話なら`;
  }

  return `On "${handoff.reference_text}"`;
}

function buildShortFocus(handoff: CompactTurnHandoff): string {
  return handoff.repetition.repeated_focus ? (handoff.language.startsWith("ja") ? "その点" : "that point") : handoff.focus;
}

function buildAnswerCore(input: ActorPromptInput, handoff: CompactTurnHandoff): string {
  const focus = buildShortFocus(handoff);

  if (handoff.language.startsWith("ja")) {
    if (input.speaker_id === "exec") {
      return `事業側としては、${focus}が最初の一手として説明できるかを見ます。`;
    }
    if (input.speaker_id === "platform") {
      return `Platform 側としては、${focus}で最初に持つ範囲と持たない範囲を切り分けたいです。`;
    }
    if (input.speaker_id === "delivery") {
      return `現場側としては、${focus}が最初に使える形になるかを見ます。`;
    }
    return `${focus}なら、まず輪郭をはっきりさせたいです。`;
  }

  if (input.speaker_id === "exec") {
    return `On ${focus}, I need a first move that is explainable in business terms.`;
  }
  if (input.speaker_id === "platform") {
    return `On ${focus}, I want the support boundary made explicit early.`;
  }
  if (input.speaker_id === "delivery") {
    return `On ${focus}, I am looking for something delivery teams can actually use first.`;
  }
  return `On ${focus}, I want the shape made legible first.`;
}

function buildReactionCore(handoff: CompactTurnHandoff): string {
  const focus = buildShortFocus(handoff);

  if (handoff.language.startsWith("ja")) {
    if (handoff.move === "ask") {
      return handoff.topic_type === "support-model"
        ? `${focus}なら、先に支援境界を一つだけ決めたいです。`
        : `${focus}なら、先に一つだけ具体化したいです。`;
    }

    if (handoff.move === "narrow") {
      return `${focus}は、まず一つの対象に切って見たいです。`;
    }

    if (handoff.move === "support-with-condition") {
      return `${focus}がその範囲で収まるなら進められます。`;
    }

    return `${focus}だけではまだ判断しきれません。`;
  }

  if (handoff.move === "ask") {
    return handoff.topic_type === "support-model"
      ? `On ${focus}, I want one explicit support boundary first.`
      : `On ${focus}, I want one concrete point first.`;
  }

  if (handoff.move === "narrow") {
    return `I would cut ${focus} to one first slice.`;
  }

  if (handoff.move === "support-with-condition") {
    return `I can move if ${focus} really stays that bounded.`;
  }

  return `${focus} is still too thin for me to treat as a real commitment.`;
}

function buildAskTail(handoff: CompactTurnHandoff): string | null {
  if (handoff.move !== "ask") {
    return null;
  }

  if (handoff.language.startsWith("ja")) {
    return handoff.last_player_intent === "request-role-specific-explanation"
      ? "そこが見えれば読み違いはかなり減ります。"
      : "そこが見えれば次に進めます。";
  }

  return handoff.last_player_intent === "request-role-specific-explanation"
    ? "If that is visible, the room is much less likely to misread this."
    : "If that is visible, the next move becomes clearer.";
}

function buildAnswerRealization(input: ActorPromptInput, handoff: CompactTurnHandoff): string {
  const topicLead = buildTopicLead(handoff);
  const pressureHint = buildPressureHint(handoff);
  const core = buildAnswerCore(input, handoff);

  return [topicLead, core, pressureHint].filter(Boolean).join(" ");
}

function buildReactionRealization(_input: ActorPromptInput, handoff: CompactTurnHandoff): string {
  const topicLead = buildTopicLead(handoff);
  const pressureHint = buildPressureHint(handoff);
  const core = buildReactionCore(handoff);
  const askTail = buildAskTail(handoff);

  return [topicLead, core, pressureHint, askTail].filter(Boolean).join(" ");
}

function buildLiveActorText(input: ActorPromptInput, roomState: RoomState): string {
  const handoff = buildCompactTurnHandoff(input, roomState);
  return handoff.mode === "answer" ? buildAnswerRealization(input, handoff) : buildReactionRealization(input, handoff);
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
  const stance = deriveTurnStance(promptInput, roomState);

  return {
    speaker_id: speakerId,
    speaker_name: inferSpeakerName(roomState, speakerId),
    turn_owner: turnOwner,
    text: buildLiveActorText(promptInput, roomState),
    response_metadata: {
      runtime_transport: "local-live-responder",
      rendering_mode: "local-live-actor-generation",
      verification_asset: false,
      read_surface_mode: resolvePlayReadSurfaceMode(),
      realization_mode: stance.mode,
      stance_tone: stance.tone,
      stance_move: stance.move,
      session_tension: stance.session_tension,
    },
  };
}
