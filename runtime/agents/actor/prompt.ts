import type { ParticipantState, PromptConstraint, RoomState } from "../../state/types.ts";
import { compactTranscript, type TranscriptContext } from "../../transcripts/compaction.ts";

export interface ActorPromptInput {
  speaker_id: string;
  speaker_runtime_slice: ParticipantState;
  runtime_persona: ParticipantState["runtime_persona"];
  turn_role: "initiating_actor" | "reacting_actor";
  scene_phase: RoomState["scene_phase"];
  active_topic: RoomState["active_topic"];
  exchange_state_summary: RoomState["exchange_state"];
  recent_transcript: TranscriptContext;
  response_constraints: PromptConstraint[];
}

export interface ActorPrompt {
  input: ActorPromptInput;
  prompt_text: string;
}

export function buildActorPromptInput(
  roomState: RoomState,
  speaker: ParticipantState,
  turnRole: "initiating_actor" | "reacting_actor",
): ActorPromptInput {
  return {
    speaker_id: speaker.participant_id,
    speaker_runtime_slice: speaker,
    runtime_persona: speaker.runtime_persona,
    turn_role: turnRole,
    scene_phase: roomState.scene_phase,
    active_topic: roomState.active_topic,
    exchange_state_summary: roomState.exchange_state,
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
  const doNotOverdo = persona?.do_not_overdo.map((item) => `- ${item}`).join("\n") ?? "- Do not sound scripted.";
  const recentTurns = input.recent_transcript.recent_turns
    .map((turn) => `${turn.speaker_name}: ${turn.text}`)
    .join("\n");
  const constraints = input.response_constraints.map((item) => `- ${item.key}: ${item.value}`).join("\n");

  return [
    `You are ${input.speaker_runtime_slice.display_name}.`,
    `Role label: ${persona?.role_label ?? input.speaker_runtime_slice.role_label ?? "Stakeholder"}`,
    `Turn role: ${input.turn_role}`,
    `Scene phase: ${input.scene_phase}`,
    `Active topic: ${input.active_topic.label}`,
    "",
    "Runtime persona:",
    `- Core concern: ${persona?.core_concern ?? input.speaker_runtime_slice.current_concern_label ?? "the current topic"}`,
    `- Typical bias: ${persona?.typical_bias ?? "Stay within your own viewpoint."}`,
    `- Escalation trigger: ${persona?.escalation_trigger ?? "Escalate only when the player's answer creates a real concern."}`,
    `- Cooperation condition: ${persona?.cooperation_condition ?? input.speaker_runtime_slice.cooperation_condition ?? "Find a bounded next step."}`,
    `- Working context: ${persona?.working_context ?? "Respond from your real day-to-day working context."}`,
    `- Day-to-day pressure: ${persona?.day_to_day_pressure ?? "You have normal delivery and operational pressure."}`,
    `- Protection target: ${persona?.protection_target ?? "Protect the work and people you are responsible for."}`,
    `- Relationship to change: ${persona?.relationship_to_change ?? "React to change from your own practical position."}`,
    `- Voice cues: ${voiceCues}`,
    `- Session role focus: ${input.speaker_runtime_slice.session_setup?.session_role_focus ?? "Stay within your role in this meeting."}`,
    `- Current pressure seed: ${input.speaker_runtime_slice.session_setup?.current_pressure_seed ?? "Respond from the pressure visible in the room."}`,
    `- Interaction posture: ${input.speaker_runtime_slice.session_setup?.interaction_posture ?? "React in a natural meeting posture."}`,
    `- Likely first move: ${input.speaker_runtime_slice.session_setup?.likely_first_move ?? "Make one natural move from your role."}`,
    "",
    "Conversation rules:",
    "- Sound like a real stakeholder in a working meeting, not an evaluator.",
    "- Prefer a natural reaction before over-structured analysis when that fits the moment.",
    "- Keep to one main point.",
    "- Stay on the active topic.",
    "- Do not mention scores, rubrics, or hidden system logic.",
    "- Let your concern come from your actual workload, team reality, or delivery context, not from abstract best-practice debate alone.",
    "",
    "Do not overdo:",
    doNotOverdo,
    "",
    "Recent transcript:",
    recentTurns || "(none)",
    "",
    "Prompt constraints:",
    constraints,
    "",
    "Write one short natural meeting turn.",
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
