import type { RoomState } from "../state/types.ts";
import type {
  WhisperInjection,
  WhisperMoveBias,
  WhisperPriorityHint,
  WhisperSidecarPacket,
  WhisperStanceBias,
  WhisperTemperatureShift,
} from "./types.ts";

interface WhisperTemplate {
  source_reason: string;
  angle_shift: string;
  context_pressure_tag: string | null;
  temperature_shift: WhisperTemperatureShift;
  priority_hint: WhisperPriorityHint;
  stance_bias: WhisperStanceBias;
  move_bias: WhisperMoveBias;
  focus_cue: string | null;
  do_not_repeat_tags: string[];
}

function hashText(value: string): number {
  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function normalizedText(packet: WhisperSidecarPacket): string {
  return packet.player_utterance.toLowerCase();
}

function isWhisperWorthy(packet: WhisperSidecarPacket): boolean {
  if (!packet.multi_perspective_needed) {
    return false;
  }

  if (
    packet.player_utterance_type !== "proposal" &&
    packet.player_utterance_type !== "clarification" &&
    packet.player_utterance_type !== "question"
  ) {
    return false;
  }

  return packet.active_topic_type !== "ownership";
}

function scoreParticipant(packet: WhisperSidecarPacket, participantId: string): number {
  const text = normalizedText(packet);
  let score = 0;

  if (participantId === "platform" && /support|onboarding|boundary|exception|platform|支援|例外|境界/i.test(text)) {
    score += 4;
  }
  if (participantId === "delivery" && /delivery|workflow|team|adopt|roadmap|sprint|現場|ロードマップ|導線|試せ/i.test(text)) {
    score += 4;
  }
  if (participantId === "exec" && /business|launch|investment|scope|v0\.1|line|事業|投資|対象/i.test(text)) {
    score += 4;
  }

  if (packet.active_topic_type === "support-model" && participantId === "platform") {
    score += 3;
  }
  if (packet.active_topic_type === "delivery-shape" && participantId === "delivery") {
    score += 3;
  }
  if ((packet.active_topic_type === "scope-boundary" || packet.active_topic_type === "problem-framing") && participantId === "exec") {
    score += 2;
  }

  return score;
}

function buildPriorityParticipantIds(packet: WhisperSidecarPacket): string[] {
  return [...packet.target_participant_ids].sort((left, right) => scoreParticipant(packet, right) - scoreParticipant(packet, left));
}

function selectTemplate(templates: WhisperTemplate[], packet: WhisperSidecarPacket, participantId: string): WhisperTemplate {
  const seed = `${packet.session_id}:${packet.built_at_turn}:${participantId}:${packet.player_utterance}`;
  return templates[hashText(seed) % templates.length] ?? templates[0];
}

function templatesForParticipant(packet: WhisperSidecarPacket, participantId: string): WhisperTemplate[] {
  const text = normalizedText(packet);
  const enterpriseContextTags = extractEnterpriseContextTags(packet);

  if (participantId === "platform") {
    return [
      {
        source_reason: "player-turn-made-support-boundary-salient",
        angle_shift: "boundary-clarity",
        context_pressure_tag: selectEnterpriseContextTag(enterpriseContextTags, participantId, packet),
        temperature_shift: "more-concerned",
        priority_hint: "use-if-selected",
        stance_bias: "guarded",
        move_bias: "narrow",
        focus_cue: "first support boundary",
        do_not_repeat_tags: ["platform-boundary-clarity"],
      },
      {
        source_reason: "player-turn-made-platform-capacity-salient",
        angle_shift: "operator-capacity",
        context_pressure_tag: selectEnterpriseContextTag(enterpriseContextTags, participantId, packet),
        temperature_shift: "more-curious",
        priority_hint: "use-if-selected",
        stance_bias: "probing",
        move_bias: "ask",
        focus_cue: "initial platform load",
        do_not_repeat_tags: ["platform-operator-capacity"],
      },
    ];
  }

  if (participantId === "delivery") {
    return [
      {
        source_reason: "player-turn-opened-a-day-one-usage-angle",
        angle_shift: "adoption-friction",
        context_pressure_tag: selectEnterpriseContextTag(enterpriseContextTags, participantId, packet),
        temperature_shift: "more-curious",
        priority_hint: "use-only-if-natural",
        stance_bias: "probing",
        move_bias: "ask",
        focus_cue: "day-one team usefulness",
        do_not_repeat_tags: ["delivery-adoption-friction"],
      },
      {
        source_reason: "player-turn-surfaced-near-term-delivery-pressure",
        angle_shift: "workflow-fit",
        context_pressure_tag: selectEnterpriseContextTag(enterpriseContextTags, participantId, packet),
        temperature_shift: "more-constructive",
        priority_hint: "use-only-if-natural",
        stance_bias: "constructive",
        move_bias: "support-with-condition",
        focus_cue: "roadmap-fit first move",
        do_not_repeat_tags: ["delivery-workflow-fit"],
      },
    ];
  }

  const execTemplates: WhisperTemplate[] = [
    {
      source_reason: "player-turn-opened-a-bounded-business-line-choice",
      angle_shift: "launch-risk",
      context_pressure_tag: selectEnterpriseContextTag(enterpriseContextTags, participantId, packet),
      temperature_shift: "more-constructive",
      priority_hint: "use-if-selected",
      stance_bias: "constructive",
      move_bias: "narrow",
      focus_cue: "smallest credible first target",
      do_not_repeat_tags: ["exec-launch-risk"],
    },
    {
      source_reason: "player-turn-opened-an-investment-credibility-angle",
      angle_shift: "investment-credibility",
      context_pressure_tag: selectEnterpriseContextTag(enterpriseContextTags, participantId, packet),
      temperature_shift: text.includes("line") || text.includes("事業") ? "more-constructive" : "more-curious",
      priority_hint: "use-if-selected",
      stance_bias: text.includes("line") || text.includes("事業") ? "constructive" : "skeptical",
      move_bias: text.includes("line") || text.includes("事業") ? "support-with-condition" : "push-back",
      focus_cue: "investment logic for this move",
      do_not_repeat_tags: ["exec-investment-credibility"],
    },
  ];

  return execTemplates;
}

function alreadyRepeated(roomState: RoomState, candidate: WhisperTemplate): boolean {
  return roomState.sidecar_state.whisper_history.some((entry) =>
    candidate.do_not_repeat_tags.some((tag) => entry.do_not_repeat_tags.includes(tag)),
  );
}

function buildWhisper(
  packet: WhisperSidecarPacket,
  participantId: string,
  template: WhisperTemplate,
): WhisperInjection {
  return {
    whisper_id: `${packet.packet_id}:${participantId}:${template.angle_shift}`,
    target_participant_id: participantId,
    triggered_at_turn: packet.built_at_turn,
    expires_after_turn: packet.built_at_turn + 2,
    source_reason: template.source_reason,
    angle_shift: template.angle_shift,
    context_pressure_tag: template.context_pressure_tag,
    temperature_shift: template.temperature_shift,
    priority_hint: template.priority_hint,
    stance_bias: template.stance_bias,
    move_bias: template.move_bias,
    focus_cue: template.focus_cue,
    do_not_repeat_tags: template.do_not_repeat_tags,
  };
}

export function generateLocalWhispers(roomState: RoomState, packet: WhisperSidecarPacket): WhisperInjection[] {
  if (!isWhisperWorthy(packet)) {
    return [];
  }

  const whispers: WhisperInjection[] = [];

  for (const participantId of buildPriorityParticipantIds(packet)) {
    const template = selectTemplate(templatesForParticipant(packet, participantId), packet, participantId);
    if (!alreadyRepeated(roomState, template)) {
      whispers.push(buildWhisper(packet, participantId, template));
    }

    if (whispers.length >= 2) {
      break;
    }
  }

  return whispers;
}

function extractEnterpriseContextTags(packet: WhisperSidecarPacket): string[] {
  const text = packet.recent_transcript.map((turn) => turn.text).join("\n").toLowerCase();
  const tags = new Set<string>();

  if (/legacy|レガシー/.test(text)) {
    tags.add("legacy-inertia");
  }
  if (/vendor|partner|external|ベンダ/.test(text)) {
    tags.add("vendor-mediated-delivery");
  }
  if (/waterfall|ウォーターフォール|uneven|ばらつき|不均一/.test(text)) {
    tags.add("uneven-modernization");
  }
  if (/commitment|obligation|約束|固定化/.test(text)) {
    tags.add("commitment-hardens-quickly");
  }
  if (/support function|support|中央支援|支援機能/.test(text)) {
    tags.add("support-function-misread");
  }
  if (/vm|ec2|cloud|kubernetes|k8s|仮想マシン/.test(text)) {
    tags.add("operational-default-not-target-standard");
  }

  if (tags.size === 0) {
    tags.add("legacy-inertia");
    tags.add("support-function-misread");
    tags.add("commitment-hardens-quickly");
    tags.add("operational-default-not-target-standard");
    tags.add("uneven-modernization");
  }

  return [...tags];
}

function selectEnterpriseContextTag(
  availableTags: string[],
  participantId: string,
  packet: WhisperSidecarPacket,
): string | null {
  const preferred = preferredTagsForParticipant(participantId).filter((tag) => availableTags.includes(tag));
  const candidates = preferred.length > 0 ? preferred : availableTags;
  if (candidates.length === 0) {
    return null;
  }

  const seed = `${packet.session_id}:${packet.built_at_turn}:${participantId}:context`;
  return candidates[hashText(seed) % candidates.length] ?? null;
}

function preferredTagsForParticipant(participantId: string): string[] {
  if (participantId === "platform") {
    return ["support-function-misread", "commitment-hardens-quickly", "operational-default-not-target-standard"];
  }

  if (participantId === "delivery") {
    return ["legacy-inertia", "uneven-modernization", "operational-default-not-target-standard"];
  }

  return ["commitment-hardens-quickly", "support-function-misread", "uneven-modernization"];
}
