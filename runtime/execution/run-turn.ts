import { buildActorPrompt } from "../agents/actor/prompt.ts";
import { buildFacilitatorPrompt } from "../agents/facilitator/prompt.ts";
import { selectNextTurn, type NextTurnDecision } from "../orchestration/select-next-turn.ts";
import type { ParticipantState, RoomState } from "../state/types.ts";

export interface PreparedTurn {
  decision: NextTurnDecision;
  prompt_input: unknown;
  prompt_text: string;
}

function findParticipant(roomState: RoomState, participantId: string): ParticipantState {
  const participant = roomState.participant_states.find((item) => item.participant_id === participantId);

  if (!participant) {
    throw new Error(`Participant not found: ${participantId}`);
  }

  return participant;
}

export function prepareNextTurn(roomState: RoomState): PreparedTurn {
  const decision = selectNextTurn(roomState);

  if (decision.owner === "facilitator") {
    const transitionGoal =
      decision.intervention_reason === "session-opening"
        ? "open-workshop-and-hand-off-to-player"
        : "clarify-turn-owner";
    const facilitatorPrompt = buildFacilitatorPrompt(
      roomState,
      decision.intervention_reason ?? "turn-ownership-unclear",
      transitionGoal,
    );
    return {
      decision,
      prompt_input: facilitatorPrompt.input,
      prompt_text: facilitatorPrompt.prompt_text,
    };
  }

  if (decision.owner === "initiating_actor" || decision.owner === "reacting_actor") {
    const participant = findParticipant(roomState, decision.speaker_id);
    const actorPrompt = buildActorPrompt(roomState, participant, decision.owner);
    return {
      decision,
      prompt_input: actorPrompt.input,
      prompt_text: actorPrompt.prompt_text,
    };
  }

  return {
    decision,
    prompt_input: {
      speaker_id: "player",
      turn_role: "player",
      active_topic: roomState.active_topic.label,
      session_setup: roomState.session_setup,
      player_initialization: roomState.player_initialization,
    },
    prompt_text: [
      "You are the player.",
      `Session purpose: ${roomState.player_initialization.session_purpose}`,
      `Player goal: ${roomState.player_initialization.player_goal}`,
      `Active topic: ${roomState.active_topic.label}`,
      `Opening guidance: ${roomState.player_initialization.opening_move_guidance}`,
      `Current expectation: ${roomState.session_setup.player_start_expectation}`,
      "Respond directly to the active stakeholder and keep the answer bounded.",
      "You do not know hidden thresholds or stakeholder-private pressure logic.",
    ].join("\n"),
  };
}
