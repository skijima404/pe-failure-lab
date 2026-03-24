import type { ParticipantState, PromptConstraint, RoomState } from "../../state/types.ts";
import { compactTranscript, type TranscriptContext } from "../../transcripts/compaction.ts";
import type { WhisperInjection } from "../../sidecars/types.ts";
import { resolvePlayReadSurfaceMode, type PlayReadSurfaceMode } from "../../execution/play-read-surface.ts";

export interface ActorPromptInput {
  speaker_id: string;
  language: string;
  speaker_runtime_slice: ParticipantState;
  runtime_persona: ParticipantState["runtime_persona"];
  read_surface_mode: PlayReadSurfaceMode;
  last_player_utterance_type: RoomState["main_session_judgment"]["last_player_utterance_type"];
  last_player_intent: RoomState["main_session_judgment"]["last_player_intent"];
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
    read_surface_mode: resolvePlayReadSurfaceMode(),
    last_player_utterance_type: roomState.main_session_judgment.last_player_utterance_type,
    last_player_intent: roomState.main_session_judgment.last_player_intent,
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
  const recentTurns = input.recent_transcript.recent_turns.slice(-3).map((turn) => `${turn.speaker_name}: ${turn.text}`).join("\n");
  const selectedReference = input.recent_transcript.recent_turns.at(-1)?.text ?? "none";
  const isNarrow = input.read_surface_mode === "narrow";
  const responseLanguage =
    input.language.startsWith("ja")
      ? "Write the visible turn in natural Japanese."
      : "Write the visible turn in natural English.";

  return [
    `You are ${input.speaker_runtime_slice.display_name}.`,
    `Role: ${persona?.role_label ?? input.speaker_runtime_slice.role_label ?? "Stakeholder"}`,
    "",
    "Character contract:",
    `- tone_summary: ${persona?.tone_summary ?? "natural enterprise stakeholder tone"}`,
    `- core_concern: ${persona?.core_concern ?? input.speaker_runtime_slice.current_concern_label ?? "the current topic"}`,
    `- default_move: ${describeDefaultMove(persona?.default_move)}`,
    `- trust_threshold: ${describeTrustThreshold(persona?.trust_threshold)}`,
    `- likely_misunderstanding: ${persona?.likely_misunderstanding ?? "you may over-read the room's intent unless the boundary stays visible"}`,
    `- voice_cues: ${voiceCues}`,
    "",
    "Current moment:",
    `- player_utterance_type: ${input.last_player_utterance_type ?? "none"}`,
    `- player_intent: ${input.last_player_intent ?? "none"}`,
    `- turn_role: ${input.turn_role}`,
    `- active_topic: ${input.active_topic.label}`,
    `- latest_reference: ${selectedReference}`,
    `- read_surface_mode: ${input.read_surface_mode}`,
    `- whisper_hint: ${input.active_whisper?.focus_cue ?? input.active_whisper?.angle_shift ?? "none"}`,
    "",
    "Behavior:",
    "- Stay in character.",
    "- Give one short natural meeting turn.",
    "- Answer content-first when the player is asking for clarification or explanation.",
    "- Let topic progression come from the current exchange, not from hidden evaluation goals.",
    "- Do not mention scores, rubrics, or hidden system logic.",
    `- ${responseLanguage}`,
    "",
    "Recent transcript:",
    recentTurns || "(none)",
    ...(isNarrow
      ? []
      : [
          "",
          "Additional runtime hints:",
          `- role_focus: ${input.speaker_runtime_slice.session_setup?.role_focus ?? "stay within your role in this meeting"}`,
          `- current_pressure_seed: ${input.speaker_runtime_slice.session_setup?.current_pressure_seed ?? "respond from the pressure visible in the room"}`,
          `- likely_first_move: ${input.speaker_runtime_slice.session_setup?.likely_first_move ?? "make one natural move from your role"}`,
        ]),
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
