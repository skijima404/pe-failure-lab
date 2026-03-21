import type { ParticipantState, PromptConstraint, RoomState } from "../../state/types.ts";
import { compactTranscript, type TranscriptContext } from "../../transcripts/compaction.ts";

export interface FacilitatorPromptInput {
  facilitator_runtime_slice: ParticipantState | null;
  runtime_persona: ParticipantState["runtime_persona"];
  intervention_reason: string;
  active_topic: RoomState["active_topic"];
  recent_transcript: TranscriptContext;
  visible_unresolved_items: string[];
  transition_goal: string;
  response_constraints: PromptConstraint[];
}

export interface FacilitatorPrompt {
  input: FacilitatorPromptInput;
  prompt_text: string;
}

export function buildFacilitatorPromptInput(
  roomState: RoomState,
  interventionReason: string,
  transitionGoal: string,
): FacilitatorPromptInput {
  const facilitator =
    roomState.participant_states.find((participant) => participant.role_type === "facilitator") ?? null;

  return {
    facilitator_runtime_slice: facilitator,
    runtime_persona: facilitator?.runtime_persona,
    intervention_reason: interventionReason,
    active_topic: roomState.active_topic,
    recent_transcript: compactTranscript(roomState),
    visible_unresolved_items: roomState.structural_state.open_risks.slice(0, 3),
    transition_goal: transitionGoal,
    response_constraints: [
      { key: "tone", value: "calm-neutral-brief" },
      { key: "repair-player-answer", value: "forbidden" },
      { key: "traffic-control", value: "only-when-needed" },
    ],
  };
}

export function renderFacilitatorPrompt(input: FacilitatorPromptInput): string {
  const persona = input.runtime_persona;
  const recentTurns = input.recent_transcript.recent_turns
    .map((turn) => `${turn.speaker_name}: ${turn.text}`)
    .join("\n");
  const unresolved = input.visible_unresolved_items.map((item) => `- ${item}`).join("\n") || "- none";
  const constraints = input.response_constraints.map((item) => `- ${item.key}: ${item.value}`).join("\n");
  const voiceCues = persona?.voice_cues.join(", ") ?? "calm, brief, neutral";
  const doNotOverdo = persona?.do_not_overdo.map((item) => `- ${item}`).join("\n") ?? "- Do not over-facilitate.";

  return [
    `You are ${persona?.display_name ?? "Mika"}, the facilitator.`,
    `Role label: ${persona?.role_label ?? "Facilitator"}`,
    "Your job is to protect meeting flow, not to improve the player's answer.",
    `Intervention reason: ${input.intervention_reason}`,
    `Transition goal: ${input.transition_goal}`,
    `Active topic: ${input.active_topic.label}`,
    "",
    "Runtime stance:",
    `- Core concern: ${persona?.core_concern ?? "Keep the meeting legible and moving."}`,
    `- Typical bias: ${persona?.typical_bias ?? "Protect flow without taking over content."}`,
    `- Escalation trigger: ${persona?.escalation_trigger ?? input.intervention_reason}`,
    `- Cooperation condition: ${persona?.cooperation_condition ?? "The room remains legible enough for direct exchange."}`,
    `- Voice cues: ${voiceCues}`,
    `- Session role focus: ${input.facilitator_runtime_slice?.session_setup?.session_role_focus ?? "Keep the meeting legible."}`,
    `- Current pressure seed: ${input.facilitator_runtime_slice?.session_setup?.current_pressure_seed ?? "Keep the current meeting goal visible."}`,
    `- Interaction posture: ${input.facilitator_runtime_slice?.session_setup?.interaction_posture ?? "Stay calm and unobtrusive."}`,
    `- Likely first move: ${input.facilitator_runtime_slice?.session_setup?.likely_first_move ?? "Open briefly and hand the room on."}`,
    "",
    "Facilitator rules:",
    "- Intervene briefly and only because the room needs structure.",
    "- Do not paraphrase the player's meaning into a better answer.",
    "- Do not sound like an evaluator or hidden coach.",
    "- You are a good human facilitator, but not a deep Platform Engineering expert.",
    "- You may notice drift in the conversation, but do not invent hidden PE diagnosis on your own.",
    "- Keep the room on one active topic.",
    "",
    "Do not overdo:",
    doNotOverdo,
    "",
    "Visible unresolved items:",
    unresolved,
    "",
    "Recent transcript:",
    recentTurns || "(none)",
    "",
    "Prompt constraints:",
    constraints,
    "",
    "Write one short facilitator turn.",
  ].join("\n");
}

export function buildFacilitatorPrompt(
  roomState: RoomState,
  interventionReason: string,
  transitionGoal: string,
): FacilitatorPrompt {
  const input = buildFacilitatorPromptInput(roomState, interventionReason, transitionGoal);
  return {
    input,
    prompt_text: renderFacilitatorPrompt(input),
  };
}
