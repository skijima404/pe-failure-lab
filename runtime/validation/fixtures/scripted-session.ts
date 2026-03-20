import type { RoomState, ScriptedTurnOutcome } from "../../state/types.ts";
import { createInitialRoomState } from "../../state/schema.ts";

export function createScriptedSessionInitialState(): RoomState {
  const roomState = createInitialRoomState("scripted-fixture-session");

  return {
    ...roomState,
    scene_phase: "discussion",
    turn_index: 4,
    active_speaker: "player",
    active_topic: {
      topic_id: "topic-002",
      label: "Initial platform scope",
      opened_by: "exec",
      opened_at_turn: 1,
      topic_type: "scope-boundary",
      depth: 1,
      status: "active",
    },
    exchange_state: {
      initiating_actor_id: "exec",
      last_player_answer_turn: 4,
      follow_up_count: 1,
      stance_movement: "partial",
      awaiting_reaction_from: "exec",
      handoff_candidate_actor_ids: ["platform"],
      should_continue_current_exchange: true,
    },
    structural_state: {
      strategic_clarity: 3,
      scope_coherence: 2,
      ownership_clarity: 1,
      support_model_clarity: 1,
      coalition_stability: 3,
      open_risks: ["support-boundary-not-yet-clear"],
    },
    recent_transcript: [
      {
        turn_index: 1,
        speaker_id: "exec",
        speaker_name: "Executive Stakeholder",
        turn_owner: "initiating_actor",
        text: "Before we go too far, what is the first usable scope you want us to align around?",
      },
      {
        turn_index: 2,
        speaker_id: "player",
        speaker_name: "Player",
        turn_owner: "player",
        text: "I want to start with a narrow developer enablement offer rather than a broad platform promise.",
      },
      {
        turn_index: 3,
        speaker_id: "exec",
        speaker_name: "Executive Stakeholder",
        turn_owner: "initiating_actor",
        text: "That is directionally helpful. I still need a clearer boundary for what teams should expect first.",
      },
      {
        turn_index: 4,
        speaker_id: "player",
        speaker_name: "Player",
        turn_owner: "player",
        text: "The first move is standardizing a limited onboarding path, not taking over full delivery support.",
      },
    ],
  };
}

export function createFacilitatorInterventionInitialState(): RoomState {
  const roomState = createInitialRoomState("facilitator-fixture-session");

  return {
    ...roomState,
    scene_phase: "discussion",
    turn_index: 6,
    active_speaker: "player",
    active_topic: {
      topic_id: "topic-003",
      label: "Support boundary and first-use path",
      opened_by: "platform",
      opened_at_turn: 3,
      topic_type: "support-model",
      depth: 1,
      status: "active",
    },
    exchange_state: {
      initiating_actor_id: "platform",
      last_player_answer_turn: 6,
      follow_up_count: 1,
      stance_movement: "partial",
      awaiting_reaction_from: null,
      handoff_candidate_actor_ids: ["exec", "delivery"],
      should_continue_current_exchange: true,
    },
    structural_state: {
      strategic_clarity: 3,
      scope_coherence: 3,
      ownership_clarity: 1,
      support_model_clarity: 2,
      coalition_stability: 3,
      open_risks: ["ownership-follow-up-not-yet-clear"],
    },
    recent_transcript: [
      {
        turn_index: 3,
        speaker_id: "platform",
        speaker_name: "Naoki Sato",
        turn_owner: "initiating_actor",
        text: "If the first team tries this next month, what do they actually get from the platform side?",
      },
      {
        turn_index: 4,
        speaker_id: "player",
        speaker_name: "Player",
        turn_owner: "player",
        text: "They get one narrow onboarding path, not open-ended delivery support.",
      },
      {
        turn_index: 5,
        speaker_id: "exec",
        speaker_name: "Aki Tanaka",
        turn_owner: "reacting_actor",
        text: "That helps, but I still need a practical sense of what is reusable versus bespoke.",
      },
      {
        turn_index: 6,
        speaker_id: "player",
        speaker_name: "Player",
        turn_owner: "player",
        text: "Reusable means the standard onboarding path. Exceptions would need explicit follow-up, not quiet support expansion.",
      },
    ],
  };
}

export function createPlatformPressureInitialState(): RoomState {
  const roomState = createInitialRoomState("platform-voice-fixture-session");

  return {
    ...roomState,
    scene_phase: "discussion",
    turn_index: 5,
    active_speaker: "player",
    active_topic: {
      topic_id: "topic-004",
      label: "First-use support boundary",
      opened_by: "platform",
      opened_at_turn: 3,
      topic_type: "support-model",
      depth: 1,
      status: "active",
    },
    exchange_state: {
      initiating_actor_id: "platform",
      last_player_answer_turn: 5,
      follow_up_count: 1,
      stance_movement: "partial",
      awaiting_reaction_from: "platform",
      handoff_candidate_actor_ids: [],
      should_continue_current_exchange: true,
    },
    recent_transcript: [
      {
        turn_index: 3,
        speaker_id: "platform",
        speaker_name: "Naoki Sato",
        turn_owner: "initiating_actor",
        text: "If one team starts using this next month, what are we actually committing to from the platform side?",
      },
      {
        turn_index: 4,
        speaker_id: "player",
        speaker_name: "Player",
        turn_owner: "player",
        text: "The platform side would support one standard onboarding path, not an open-ended support model.",
      },
      {
        turn_index: 5,
        speaker_id: "player",
        speaker_name: "Player",
        turn_owner: "player",
        text: "I want the first path to stay narrow enough that your team does not absorb project cleanup by default.",
      },
    ],
  };
}

export function createDeliveryPressureInitialState(): RoomState {
  const roomState = createInitialRoomState("delivery-voice-fixture-session");

  return {
    ...roomState,
    scene_phase: "discussion",
    turn_index: 5,
    active_speaker: "player",
    active_topic: {
      topic_id: "topic-005",
      label: "First-use support boundary",
      opened_by: "delivery",
      opened_at_turn: 3,
      topic_type: "support-model",
      depth: 1,
      status: "active",
    },
    exchange_state: {
      initiating_actor_id: "delivery",
      last_player_answer_turn: 5,
      follow_up_count: 1,
      stance_movement: "partial",
      awaiting_reaction_from: "delivery",
      handoff_candidate_actor_ids: [],
      should_continue_current_exchange: true,
    },
    recent_transcript: [
      {
        turn_index: 3,
        speaker_id: "delivery",
        speaker_name: "Emi Hayashi",
        turn_owner: "initiating_actor",
        text: "If my team tried this now, what gets simpler for us right away and what still lands back on us to figure out?",
      },
      {
        turn_index: 4,
        speaker_id: "player",
        speaker_name: "Player",
        turn_owner: "player",
        text: "The first path should remove some local setup work, but it would not replace all project-specific decisions.",
      },
      {
        turn_index: 5,
        speaker_id: "player",
        speaker_name: "Player",
        turn_owner: "player",
        text: "I want the path to help your team move now without forcing you to reverse-engineer a full operating model.",
      },
    ],
  };
}

export const SCRIPTED_SESSION_FIXTURE: ScriptedTurnOutcome[] = [
  {
    speaker_id: "exec",
    speaker_name: "Executive Stakeholder",
    turn_owner: "initiating_actor",
    text: "That helps. What is the first boundary you expect teams to experience?",
    expected_selection_reason: "initiating-actor-follow-up",
    updates: {
      exchange_state: {
        initiating_actor_id: "exec",
        handoff_candidate_actor_ids: ["platform"],
        last_player_answer_turn: 4,
        follow_up_count: 2,
        stance_movement: "visible",
        awaiting_reaction_from: null,
        should_continue_current_exchange: true
      },
    },
  },
  {
    speaker_id: "platform",
    speaker_name: "Platform-side Stakeholder",
    turn_owner: "reacting_actor",
    text: "I can work with that shape, but I need the support boundary to stay explicit.",
    expected_selection_reason: "overlap-reaction",
  },
  {
    speaker_id: "player",
    speaker_name: "Player",
    turn_owner: "player",
    text: "Yes, that boundary is important. We are standardizing one onboarding path, not taking over ongoing delivery support.",
    expected_selection_reason: "player-clarification-needed",
  },
  {
    speaker_id: "platform",
    speaker_name: "Platform-side Stakeholder",
    turn_owner: "initiating_actor",
    text: "Good. If we keep it that narrow, I can support shaping the next step after this meeting.",
    expected_selection_reason: "initiating-actor-follow-up",
  },
];

export const FACILITATOR_INTERVENTION_FIXTURE: ScriptedTurnOutcome[] = [
  {
    speaker_id: "mika",
    speaker_name: "Mika",
    turn_owner: "facilitator",
    text: "Let's stay with the support boundary for a moment. Aki, give us the one practical distinction you still need, then we'll come to Emi.",
    expected_selection_reason: "facilitator-intervention",
  },
];
