import type { ActorPromptInput } from "../agents/actor/prompt.ts";
import type { RoomState, TranscriptTurn, TurnOwner } from "../state/types.ts";

type SessionTension = "steady" | "guarded" | "pressured" | "looping";
type TurnMove = "ask" | "narrow" | "support-with-condition" | "push-back";
type StanceTone = "probing" | "guarded" | "constructive" | "skeptical";

interface RuntimeTurnStance {
  tone: StanceTone;
  move: TurnMove;
  focus: string;
  pressure: string | null;
  reference_text: string | null;
  session_tension: SessionTension;
}

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
    return candidate.length > 38 ? `${candidate.slice(0, 38).trim()}…` : candidate;
  }

  const candidate = cleaned.split(/[.!?\n]/).map((item) => item.trim()).find((item) => item.length >= 12) ?? cleaned;
  return candidate.length > 64 ? `${candidate.slice(0, 64).trim()}…` : candidate;
}

function selectLatestRelevantTurn(input: ActorPromptInput): TranscriptTurn | null {
  const turns = [...input.recent_transcript.recent_turns].reverse();
  return turns.find((turn) => turn.speaker_id !== input.speaker_id) ?? null;
}

function chooseVariant(roomState: RoomState, speakerId: string, referenceText: string | null): number {
  return hashText(`${roomState.session_id}:${roomState.turn_index}:${speakerId}:${referenceText ?? "none"}`) % 4;
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

  if (defaultMove === "ask") {
    return "ask";
  }
  if (defaultMove === "narrow") {
    return "narrow";
  }
  if (defaultMove === "support-with-condition") {
    return "support-with-condition";
  }
  if (defaultMove === "push-back") {
    return "push-back";
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
  return (
    input.active_whisper?.focus_cue ??
    input.speaker_runtime_slice.current_concern_label ??
    input.runtime_persona?.core_concern ??
    input.active_topic.label
  );
}

function derivePressureSeed(input: ActorPromptInput): string | null {
  return input.speaker_runtime_slice.session_setup?.current_pressure_seed ?? null;
}

function shouldHardenMove(input: ActorPromptInput, tension: SessionTension): boolean {
  return input.runtime_persona?.patience === "low" && (tension === "pressured" || tension === "looping");
}

function shouldSoftenMove(input: ActorPromptInput): boolean {
  return input.runtime_persona?.trust_threshold === "one-bounded-signal";
}

function deriveTurnStance(input: ActorPromptInput, roomState: RoomState): RuntimeTurnStance {
  const relevantTurn = selectLatestRelevantTurn(input);
  const tone = input.active_whisper?.stance_bias ?? deriveFallbackTone(input);
  const sessionTension = inferSessionTension(roomState);
  const baseMove = input.active_whisper?.move_bias ?? deriveFallbackMove(input, tone);
  const move =
    shouldHardenMove(input, sessionTension) && baseMove === "support-with-condition"
      ? "push-back"
      : shouldSoftenMove(input) && baseMove === "push-back" && sessionTension === "steady"
        ? "support-with-condition"
        : baseMove;

  return {
    tone,
    move,
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
    return "支援境界の見え方";
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
    "business clarity": "事業判断の明確さ",
    "operating-model sustainability": "運用モデルの持続性",
    "delivery practicality": "現場での実用性",
    "meeting flow": "会議の進行の見通し",
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
    "over-facilitating would make the room sound coached instead of lived-in": "進行をやりすぎると、会話が作り物っぽく見えること",
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

function buildReferenceLead(language: string, referenceText: string | null, variant: number): string | null {
  if (!referenceText) {
    return null;
  }

  if (language.startsWith("ja")) {
    const leads = [
      `今の「${referenceText}」という置き方なら追えます。`,
      `「${referenceText}」という話なら筋は見えます。`,
      `今の「${referenceText}」は受け止め方としては分かります。`,
      `「${referenceText}」まで絞るなら話は見えます。`,
    ];
    return leads[variant % leads.length] ?? leads[0];
  }

  const leads = [
    `I can follow "${referenceText}."`,
    `That framing around "${referenceText}" is at least workable.`,
    `I can see what "${referenceText}" is trying to do.`,
    `If we keep it at "${referenceText}," I can stay with it.`,
  ];
  return leads[variant % leads.length] ?? leads[0];
}

function buildPressureClause(language: string, pressure: string | null, tension: SessionTension, variant: number): string | null {
  if (!pressure && tension === "steady") {
    return null;
  }

  if (language.startsWith("ja")) {
    if (pressure && tension === "looping") {
      return variant % 2 === 0
        ? `ただ、${pressure} があるので広げすぎるとまた曖昧になります。`
        : `ただ、${pressure} が強いので、この場で広げると収まりにくいです。`;
    }
    if (pressure) {
      return variant % 2 === 0 ? `ただ、${pressure} は無視しにくいです。` : `ただ、${pressure} は先に織り込みたいです。`;
    }
    if (tension === "looping") {
      return "このまま広げるより、一段絞って話したいです。";
    }
    return "まだ少し慎重に置きたいです。";
  }

  if (pressure && tension === "looping") {
    return `The pressure still feels like ${pressure}, so if we widen this now it will get muddy again.`;
  }
  if (pressure) {
    return `I still have to account for ${pressure}.`;
  }
  if (tension === "looping") {
    return "I would rather narrow this than let it sprawl again.";
  }
  return "I still want to keep this fairly bounded.";
}

function buildAskTurn(input: ActorPromptInput, stance: RuntimeTurnStance, variant: number): string {
  const focus = focusWithWhisper(input, stance.focus);
  const pressure = translateVisiblePressure(input, stance.pressure);
  const lead = buildReferenceLead(input.language, stance.reference_text, variant);
  const pressureClause = buildPressureClause(input.language, pressure, stance.session_tension, variant);

  if (input.language.startsWith("ja")) {
    const questions = [
      `${focus} をこの場ではどこまで見る想定ですか。`,
      `${focus} を最初の一手として置くなら、どこまでを約束にしますか。`,
      `${focus} を動かすとして、最初に確認したい境界はどこですか。`,
      `${focus} で進めるなら、まず何が見えれば十分ですか。`,
    ];
    return [lead, pressureClause, questions[variant % questions.length]].filter(Boolean).join(" ");
  }

  const questions = [
    `What exactly counts as enough on ${focus} for this first move?`,
    `If ${focus} is the first step, what are we actually committing to?`,
    `Where is the boundary we need to make usable around ${focus}?`,
    `What would make ${focus} concrete enough to act on now?`,
  ];
  return [lead, pressureClause, questions[variant % questions.length]].filter(Boolean).join(" ");
}

function buildNarrowingTurn(input: ActorPromptInput, stance: RuntimeTurnStance, variant: number): string {
  const focus = focusWithWhisper(input, stance.focus);
  const pressure = translateVisiblePressure(input, stance.pressure);
  const lead = buildReferenceLead(input.language, stance.reference_text, variant);
  const pressureClause = buildPressureClause(input.language, pressure, stance.session_tension, variant);

  if (input.language.startsWith("ja")) {
    const lines = [
      `${focus} は最初から広く約束しない方がよいです。`,
      `${focus} はまず狭く置いてから反応を見たいです。`,
      `${focus} は入口だけを明確にして、それ以上は持ち込まない方が自然です。`,
      `${focus} は一段切っておかないと、すぐに重くなります。`,
    ];
    return [lead, pressureClause, lines[variant % lines.length]].filter(Boolean).join(" ");
  }

  const lines = [
    `I would keep ${focus} narrow at the start.`,
    `I do not want ${focus} framed as a broad commitment yet.`,
    `We should define only the entry point on ${focus}, not the whole future shape.`,
    `If we do not cut ${focus} down now, it will get heavy very quickly.`,
  ];
  return [lead, pressureClause, lines[variant % lines.length]].filter(Boolean).join(" ");
}

function buildConditionalSupportTurn(input: ActorPromptInput, stance: RuntimeTurnStance, variant: number): string {
  const focus = focusWithWhisper(input, stance.focus);
  const pressure = translateVisiblePressure(input, stance.pressure);
  const lead = buildReferenceLead(input.language, stance.reference_text, variant);
  const pressureClause = buildPressureClause(input.language, pressure, stance.session_tension, variant);

  if (input.language.startsWith("ja")) {
    const lines = [
      `${focus} がそのくらいに収まるなら、前に進める余地はあります。`,
      `${focus} をその粒度で置くなら、いったん乗れます。`,
      `${focus} が見えるなら、この場ではそれで十分です。`,
      `${focus} をその範囲に保てるなら、今は進めてよいです。`,
    ];
    return [lead, pressureClause, lines[variant % lines.length]].filter(Boolean).join(" ");
  }

  const lines = [
    `If ${focus} stays at that size, I can work with it.`,
    `If that is the actual shape of ${focus}, I can support moving forward.`,
    `That is enough on ${focus} for me to stay with the direction.`,
    `I can back this if ${focus} really remains that bounded.`,
  ];
  return [lead, pressureClause, lines[variant % lines.length]].filter(Boolean).join(" ");
}

function buildPushBackTurn(input: ActorPromptInput, stance: RuntimeTurnStance, variant: number): string {
  const focus = focusWithWhisper(input, stance.focus);
  const pressure = translateVisiblePressure(input, stance.pressure);
  const lead = buildReferenceLead(input.language, stance.reference_text, variant);
  const pressureClause = buildPressureClause(input.language, pressure, stance.session_tension, variant);

  if (input.language.startsWith("ja")) {
    const lines = [
      `${focus} がまだ薄いので、このまま約束には乗せたくありません。`,
      `${focus} が見えないままだと、今ここで前提にするのは早いです。`,
      `${focus} が曖昧なままだと、あとで別の期待を背負います。`,
      `${focus} をもう少し具体化しないと、納得して進めにくいです。`,
    ];
    return [lead, pressureClause, lines[variant % lines.length]].filter(Boolean).join(" ");
  }

  const lines = [
    `I do not want to commit on this while ${focus} is still that thin.`,
    `Without a clearer shape on ${focus}, this still feels early to lock in.`,
    `If ${focus} stays vague, the room will read more into it later.`,
    `I still need ${focus} made more concrete before I can back it.`,
  ];
  return [lead, pressureClause, lines[variant % lines.length]].filter(Boolean).join(" ");
}

function buildLiveActorText(input: ActorPromptInput, roomState: RoomState): string {
  const stance = deriveTurnStance(input, roomState);
  const variant = chooseVariant(roomState, input.speaker_id, stance.reference_text);

  if (stance.move === "ask") {
    return buildAskTurn(input, stance, variant);
  }

  if (stance.move === "narrow") {
    return buildNarrowingTurn(input, stance, variant);
  }

  if (stance.move === "support-with-condition") {
    return buildConditionalSupportTurn(input, stance, variant);
  }

  return buildPushBackTurn(input, stance, variant);
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
      stance_tone: stance.tone,
      stance_move: stance.move,
      session_tension: stance.session_tension,
    },
  };
}
