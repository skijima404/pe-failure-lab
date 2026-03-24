import type { ParticipantState, PromptConstraint, RoomState } from "../../state/types.ts";
import { compactTranscript, type TranscriptContext } from "../../transcripts/compaction.ts";
import type { WhisperInjection } from "../../sidecars/types.ts";

export interface ActorPromptInput {
  speaker_id: string;
  language: string;
  speaker_runtime_slice: ParticipantState;
  runtime_persona: ParticipantState["runtime_persona"];
  turn_role: "initiating_actor" | "reacting_actor";
  scene_phase: RoomState["scene_phase"];
  active_topic: RoomState["active_topic"];
  exchange_state_summary: RoomState["exchange_state"];
  visible_unresolved_items: string[];
  close_readiness: RoomState["close_readiness"];
  active_whisper: WhisperInjection | null;
  recent_transcript: TranscriptContext;
  response_constraints: PromptConstraint[];
}

export interface ActorPrompt {
  input: ActorPromptInput;
  prompt_text: string;
}

function describeDefaultMove(value: NonNullable<ParticipantState["runtime_persona"]>["default_move"] | undefined): string {
  if (value === "ask") {
    return "ask for one concrete clarification";
  }
  if (value === "narrow") {
    return "narrow the scope or boundary before backing it";
  }
  if (value === "support-with-condition") {
    return "offer conditional support if one bounded condition is visible";
  }
  if (value === "push-back") {
    return "push back on ambiguity until the path sounds believable";
  }
  if (value === "repair-flow") {
    return "repair flow briefly and hand the room back";
  }
  return "react from your local concern and ask for one concrete clarification";
}

function describeTrustThreshold(value: NonNullable<ParticipantState["runtime_persona"]>["trust_threshold"] | undefined): string {
  if (value === "one-bounded-signal") {
    return "one believable bounded signal";
  }
  if (value === "visible-support-boundary") {
    return "a visible support boundary";
  }
  if (value === "day-one-utility") {
    return "one concrete day-one benefit";
  }
  if (value === "credible-transition-path") {
    return "a credible transition path";
  }
  if (value === "direct-exchange-legible") {
    return "the room staying legible enough for direct exchange";
  }
  return "one believable bounded signal";
}

export function buildActorPromptInput(
  roomState: RoomState,
  speaker: ParticipantState,
  turnRole: "initiating_actor" | "reacting_actor",
): ActorPromptInput {
  return {
    speaker_id: speaker.participant_id,
    language: roomState.language,
    speaker_runtime_slice: speaker,
    runtime_persona: speaker.runtime_persona,
    turn_role: turnRole,
    scene_phase: roomState.scene_phase,
    active_topic: roomState.active_topic,
    exchange_state_summary: roomState.exchange_state,
    visible_unresolved_items: roomState.structural_state.open_risks.slice(0, 3),
    close_readiness: roomState.close_readiness,
    active_whisper:
      roomState.sidecar_state.active_whispers.find((whisper) => whisper.target_participant_id === speaker.participant_id) ?? null,
    recent_transcript: compactTranscript(roomState),
    response_constraints: [
      { key: "main-point-count", value: "1" },
      { key: "tone", value: "natural-enterprise" },
      { key: "scoring-language", value: "forbidden" },
      { key: "reaction-first", value: "preferred-when-natural" },
    ],
  };
}

export function renderActorPrompt(input: ActorPromptInput): string {
  const persona = input.runtime_persona;
  const voiceCues = persona?.voice_cues.join(", ") ?? "natural enterprise tone";
  const recentTurns = input.recent_transcript.recent_turns
    .map((turn) => `${turn.speaker_name}: ${turn.text}`)
    .join("\n");
  const constraints = input.response_constraints.map((item) => `- ${item.key}: ${item.value}`).join("\n");
  const unresolved = input.visible_unresolved_items.map((item) => `- ${item}`).join("\n") || "- none";
  const closeReadiness = input.close_readiness.ready
    ? `ready (${input.close_readiness.reason ?? "no-reason"})`
    : "not-ready";
  const responseLanguage =
    input.language.startsWith("ja")
      ? "Write the visible turn in natural Japanese."
      : "Write the visible turn in natural English.";
  const activeWhisper = input.active_whisper
    ? [
        `- source reason: ${input.active_whisper.source_reason}`,
        `- temporary angle shift: ${input.active_whisper.angle_shift}`,
        `- enterprise context pressure tag: ${input.active_whisper.context_pressure_tag ?? "none"}`,
        `- temperature shift: ${input.active_whisper.temperature_shift}`,
        `- priority hint: ${input.active_whisper.priority_hint}`,
        `- stance bias: ${input.active_whisper.stance_bias}`,
        `- move bias: ${input.active_whisper.move_bias}`,
        `- focus cue: ${input.active_whisper.focus_cue ?? "none"}`,
      ].join("\n")
    : "- none";

  return [
    `You are ${input.speaker_runtime_slice.display_name}.`,
    `Role label: ${persona?.role_label ?? input.speaker_runtime_slice.role_label ?? "Stakeholder"}`,
    `Turn role: ${input.turn_role}`,
    `Scene phase: ${input.scene_phase}`,
    `Active topic: ${input.active_topic.label}`,
    `Active topic depth: ${input.active_topic.depth}`,
    `Close readiness: ${closeReadiness}`,
    "",
    "Runtime persona:",
    `- Tone summary: ${persona?.tone_summary ?? "natural enterprise stakeholder tone"}`,
    `- Core concern: ${persona?.core_concern ?? input.speaker_runtime_slice.current_concern_label ?? "the current topic"}`,
    `- Default move: ${describeDefaultMove(persona?.default_move)}`,
    `- Patience: ${persona?.patience ?? "moderate"}`,
    `- Trust threshold: ${describeTrustThreshold(persona?.trust_threshold)}`,
    `- Likely misunderstanding: ${persona?.likely_misunderstanding ?? "you may over-read the room's intent unless the boundary stays visible"}`,
    `- Cooperation condition: ${persona?.cooperation_condition ?? input.speaker_runtime_slice.cooperation_condition ?? "Find a bounded next step."}`,
    `- Voice cues: ${voiceCues}`,
    `- Session role focus: ${input.speaker_runtime_slice.session_setup?.role_focus ?? "Stay within your role in this meeting."}`,
    `- Current pressure seed: ${input.speaker_runtime_slice.session_setup?.current_pressure_seed ?? "Respond from the pressure visible in the room."}`,
    `- Likely misunderstanding or overreach: ${
      input.speaker_runtime_slice.session_setup?.likely_misunderstanding_or_overreach ??
      "Do not over-read the room or make the draft broader than it is."
    }`,
    `- Likely first move: ${input.speaker_runtime_slice.session_setup?.likely_first_move ?? "Make one natural move from your role."}`,
    "",
    "Conversation rules:",
    "- Sound like a real stakeholder in a working meeting, not an evaluator.",
    "- Prefer a natural reaction before over-structured analysis when that fits the moment.",
    "- Keep to one main point.",
    "- Stay on the active topic.",
    "- Do not mention scores, rubrics, or hidden system logic.",
    "- Let your concern come from your actual workload, team reality, or delivery context, not from abstract best-practice debate alone.",
    "- If close readiness is visible, either name one bounded support point or one concrete unresolved concern. Do not pretend the room fully converged if it did not.",
    "- If a hidden whisper is present, treat it as a temporary nudge only. Keep persona core and topic fit first.",
    "- Ignore the hidden whisper if using it would sound forced or would open a second topic.",
    `- ${responseLanguage}`,
    "",
    "Visible unresolved items:",
    unresolved,
    "",
    "Hidden whisper:",
    activeWhisper,
    "",
    "Recent transcript:",
    recentTurns || "(none)",
    "",
    "Prompt constraints:",
    constraints,
    "",
    "Write one short natural meeting turn for the visible transcript.",
  ].join("\n");
}

export function buildActorPrompt(
  roomState: RoomState,
  speaker: ParticipantState,
  turnRole: "initiating_actor" | "reacting_actor",
): ActorPrompt {
  const input = buildActorPromptInput(roomState, speaker, turnRole);
  return {
    input,
    prompt_text: renderActorPrompt(input),
  };
}
