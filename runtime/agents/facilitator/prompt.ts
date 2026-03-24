import type { ParticipantState, PromptConstraint, RoomState } from "../../state/types.ts";
import { compactTranscript, type TranscriptContext } from "../../transcripts/compaction.ts";

export interface FacilitatorPromptInput {
  facilitator_runtime_slice: ParticipantState | null;
  runtime_persona: ParticipantState["runtime_persona"];
  intervention_reason: string;
  active_topic: RoomState["active_topic"];
  close_readiness: RoomState["close_readiness"];
  recent_transcript: TranscriptContext;
  visible_unresolved_items: string[];
  parked_topic_labels: string[];
  transition_goal: string;
  response_constraints: PromptConstraint[];
}

export interface FacilitatorPrompt {
  input: FacilitatorPromptInput;
  prompt_text: string;
}

function describeDefaultMove(value: NonNullable<ParticipantState["runtime_persona"]>["default_move"] | undefined): string {
  if (value === "repair-flow") {
    return "repair flow briefly and hand the room back";
  }
  if (value === "ask") {
    return "ask one bounded clarifying question";
  }
  if (value === "narrow") {
    return "narrow the active thread";
  }
  if (value === "support-with-condition") {
    return "support the room conditionally";
  }
  if (value === "push-back") {
    return "push back when the room becomes unclear";
  }
  return "repair meeting flow and hand the room back quickly";
}

function describeTrustThreshold(value: NonNullable<ParticipantState["runtime_persona"]>["trust_threshold"] | undefined): string {
  if (value === "direct-exchange-legible") {
    return "the room can continue by direct exchange";
  }
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
  return "the room can react directly without facilitator repair";
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
    close_readiness: roomState.close_readiness,
    recent_transcript: compactTranscript(roomState),
    visible_unresolved_items: roomState.structural_state.open_risks.slice(0, 3),
    parked_topic_labels: roomState.parking_lot.map((topic) => topic.label),
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
  const parkedTopics = input.parked_topic_labels.map((item) => `- ${item}`).join("\n") || "- none";
  const constraints = input.response_constraints.map((item) => `- ${item.key}: ${item.value}`).join("\n");
  const voiceCues = persona?.voice_cues.join(", ") ?? "calm, brief, neutral";
  const closeReadiness = input.close_readiness.ready
    ? `ready (${input.close_readiness.reason ?? "no-reason"})`
    : "not-ready";

  return [
    `You are ${persona?.display_name ?? "Mika"}, the facilitator.`,
    `Role label: ${persona?.role_label ?? "Facilitator"}`,
    "Your job is to protect meeting flow, not to improve the player's answer.",
    `Intervention reason: ${input.intervention_reason}`,
    `Transition goal: ${input.transition_goal}`,
    `Active topic: ${input.active_topic.label}`,
    `Active topic depth: ${input.active_topic.depth}`,
    `Close readiness: ${closeReadiness}`,
    "",
    "Runtime stance:",
    `- Tone summary: ${persona?.tone_summary ?? "calm, brief, and neutral"}`,
    `- Core concern: ${persona?.core_concern ?? "Keep the meeting legible and moving."}`,
    `- Default move: ${describeDefaultMove(persona?.default_move)}`,
    `- Patience: ${persona?.patience ?? "moderate until flow breaks"}`,
    `- Trust threshold: ${describeTrustThreshold(persona?.trust_threshold)}`,
    `- Likely misunderstanding: ${
      persona?.likely_misunderstanding ?? "treating content confusion as something the facilitator should solve directly"
    }`,
    `- Cooperation condition: ${persona?.cooperation_condition ?? "The room remains legible enough for direct exchange."}`,
    `- Voice cues: ${voiceCues}`,
    `- Session role focus: ${input.facilitator_runtime_slice?.session_setup?.role_focus ?? "Keep the meeting legible."}`,
    `- Current pressure seed: ${input.facilitator_runtime_slice?.session_setup?.current_pressure_seed ?? "Keep the current meeting goal visible."}`,
    `- Likely misunderstanding or overreach: ${
      input.facilitator_runtime_slice?.session_setup?.likely_misunderstanding_or_overreach ??
      "Do not become a hidden coach or content owner."
    }`,
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
    "Visible unresolved items:",
    unresolved,
    "",
    "Parked topics:",
    parkedTopics,
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
