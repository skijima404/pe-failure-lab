import type {
  ActiveTopic,
  CloseReadiness,
  ExchangeState,
  NextTurnOption,
  ParticipantSessionSetup,
  ParticipantState,
  RoomState,
  StructuralState,
  MainSessionJudgment,
  RoomSidecarState,
} from "./types.ts";
import { loadDefaultRuntimePersonaSlices } from "../personas/runtime-slice-loader.ts";
import { loadDefaultSceneSetup } from "../scene/setup-loader.ts";
import { loadDefaultPlayerInitialization } from "../scene/player-initialization-loader.ts";

const DEFAULT_ACTIVE_TOPIC: ActiveTopic = {
  topic_id: "topic-001",
  label: "Workshop framing",
  opened_by: "mika",
  opened_at_turn: 0,
  topic_type: "problem-framing",
  depth: 1,
  status: "active",
};

const DEFAULT_EXCHANGE_STATE: ExchangeState = {
  initiating_actor_id: null,
  last_player_answer_turn: null,
  follow_up_count: 0,
  stance_movement: "none",
  awaiting_reaction_from: null,
  handoff_candidate_actor_ids: [],
  should_continue_current_exchange: false,
};

const DEFAULT_STRUCTURAL_STATE: StructuralState = {
  strategic_clarity: 2,
  scope_coherence: 2,
  ownership_clarity: 1,
  support_model_clarity: 1,
  coalition_stability: 2,
  open_risks: [],
};

const DEFAULT_CLOSE_READINESS: CloseReadiness = {
  ready: false,
  reason: null,
};

const DEFAULT_MAIN_SESSION_JUDGMENT: MainSessionJudgment = {
  meeting_layer: "why",
  last_player_utterance_type: null,
  last_player_intent: null,
  multi_perspective_needed: false,
};

const DEFAULT_SIDECAR_STATE: RoomSidecarState = {
  active_whispers: [],
  whisper_history: [],
};

const DEFAULT_NEXT_TURN_OPTIONS: NextTurnOption[] = [];

export const DEFAULT_PARTICIPANTS: ParticipantState[] = [
  {
    participant_id: "player",
    role_type: "player",
    display_name: "Player",
    stance_level: 0,
    engagement_level: 3,
    last_spoke_turn: null,
    current_concern_label: null,
    cooperation_condition: null,
    escalation_trigger_visible: false,
    pending_question: null,
    last_reaction_type: "none",
  },
  {
    participant_id: "mika",
    role_type: "facilitator",
    display_name: "Mika",
    stance_level: 0,
    engagement_level: 3,
    last_spoke_turn: null,
    current_concern_label: "meeting flow",
    cooperation_condition: "keep the room legible",
    escalation_trigger_visible: false,
    pending_question: null,
    last_reaction_type: "none",
  },
  {
    participant_id: "exec",
    role_type: "stakeholder",
    display_name: "Executive Stakeholder",
    stance_level: 2,
    engagement_level: 3,
    last_spoke_turn: null,
    current_concern_label: "business clarity",
    cooperation_condition: "understand strategic value and scale",
    escalation_trigger_visible: false,
    pending_question: null,
    last_reaction_type: "none",
  },
  {
    participant_id: "platform",
    role_type: "stakeholder",
    display_name: "Platform-side Stakeholder",
    stance_level: 2,
    engagement_level: 3,
    last_spoke_turn: null,
    current_concern_label: "operating-model sustainability",
    cooperation_condition: "clear boundaries and support mode",
    escalation_trigger_visible: false,
    pending_question: null,
    last_reaction_type: "none",
  },
  {
    participant_id: "delivery",
    role_type: "stakeholder",
    display_name: "Delivery-side Stakeholder",
    stance_level: 2,
    engagement_level: 3,
    last_spoke_turn: null,
    current_concern_label: "delivery practicality",
    cooperation_condition: "visible path to usable next step",
    escalation_trigger_visible: false,
    pending_question: null,
    last_reaction_type: "none",
  },
  {
    participant_id: "evaluator",
    role_type: "evaluator",
    display_name: "Evaluator",
    stance_level: 0,
    engagement_level: 0,
    last_spoke_turn: null,
    current_concern_label: null,
    cooperation_condition: null,
    escalation_trigger_visible: false,
    pending_question: null,
    last_reaction_type: "none",
  },
];

export function createDefaultParticipants(): ParticipantState[] {
  const personaSlices = loadDefaultRuntimePersonaSlices();
  const sceneSetup = loadDefaultSceneSetup();
  const playerInitialization = loadDefaultPlayerInitialization();

  return DEFAULT_PARTICIPANTS.map((participant) => {
    const runtimePersona = personaSlices[participant.participant_id];
    const sessionSetup = createParticipantSessionSetup(participant, sceneSetup.meeting_goal, playerInitialization.player_goal);
    if (!runtimePersona) {
      return { ...participant, session_setup: sessionSetup };
    }

    return {
      ...participant,
      display_name: runtimePersona.display_name || participant.display_name,
      role_label: runtimePersona.role_label,
      current_concern_label: runtimePersona.core_concern || participant.current_concern_label,
      cooperation_condition: runtimePersona.cooperation_condition || participant.cooperation_condition,
      runtime_persona: runtimePersona,
      session_setup: sessionSetup,
    };
  });
}

export function createInitialRoomState(sessionId: string, language = "en"): RoomState {
  const sceneSetup = loadDefaultSceneSetup();
  const playerInitialization = loadDefaultPlayerInitialization();

  return {
    session_id: sessionId,
    session_setup: sceneSetup,
    player_initialization: playerInitialization,
    scene_phase: "opening",
    language,
    turn_index: 0,
    active_speaker: "mika",
    active_topic: {
      ...DEFAULT_ACTIVE_TOPIC,
      label: sceneSetup.active_topic_seed || DEFAULT_ACTIVE_TOPIC.label,
    },
    topic_status: "active",
    parking_lot: [],
    exchange_state: { ...DEFAULT_EXCHANGE_STATE },
    participant_states: createDefaultParticipants(),
    structural_state: { ...DEFAULT_STRUCTURAL_STATE },
    recent_transcript: [],
    next_turn_options: [...DEFAULT_NEXT_TURN_OPTIONS],
    close_readiness: { ...DEFAULT_CLOSE_READINESS },
    main_session_judgment: { ...DEFAULT_MAIN_SESSION_JUDGMENT },
    sidecar_state: { ...DEFAULT_SIDECAR_STATE },
  };
}

function createParticipantSessionSetup(
  participant: ParticipantState,
  meetingGoal: string,
  playerGoal: string,
): ParticipantSessionSetup {
  if (participant.role_type === "player") {
    return {
      session_role_focus: "state the current direction in a workable draft form and keep it bounded",
      current_pressure_seed: playerGoal,
      interaction_posture: "enter the room ready to clarify, not to give a polished long speech",
      likely_first_move: "start with where the room can begin today and let others react from there",
    };
  }

  if (participant.role_type === "facilitator") {
    return {
      session_role_focus: "keep the room moving on one active topic without taking over the content",
      current_pressure_seed: meetingGoal,
      interaction_posture: "stay unobtrusive until flow or ownership becomes unclear",
      likely_first_move: "open the workshop briefly and hand the room to the player",
    };
  }

  if (participant.participant_id === "exec") {
    return {
      session_role_focus: "test whether the initial direction is credible enough to matter at enterprise scale",
      current_pressure_seed: "avoid broad commitment without a believable first move and practical logic",
      interaction_posture: "curious first, then narrowing toward practical business meaning",
      likely_first_move: "ask what the first usable scope or boundary actually is",
    };
  }

  if (participant.participant_id === "platform") {
    return {
      session_role_focus: "check whether the initial path quietly expands platform-side support burden",
      current_pressure_seed: "the team is already busy and cannot silently absorb more operational or onboarding work",
      interaction_posture: "plainspoken, field-aware, and wary of invisible extra work",
      likely_first_move: "ask what the platform side is really committing to first",
    };
  }

  if (participant.participant_id === "delivery") {
    return {
      session_role_focus: "check whether the proposed path helps a delivery team move now",
      current_pressure_seed: "active roadmap pressure makes it hard to adopt a path that adds interpretation overhead before helping",
      interaction_posture: "practical and open, but impatient with vague helpfulness",
      likely_first_move: "ask what becomes easier for the team right away",
    };
  }

  return {
    session_role_focus: "react from your local role in the meeting",
    current_pressure_seed: meetingGoal,
    interaction_posture: "stay within your own role and visible concern",
    likely_first_move: "react from your current role in the room",
  };
}
