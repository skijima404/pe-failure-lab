import type {
  ActiveTopic,
  CloseReadiness,
  ExchangeState,
  NextTurnOption,
  ParticipantState,
  RoomState,
  StructuralState,
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

  return DEFAULT_PARTICIPANTS.map((participant) => {
    const runtimePersona = personaSlices[participant.participant_id];
    if (!runtimePersona) {
      return { ...participant };
    }

    return {
      ...participant,
      display_name: runtimePersona.display_name || participant.display_name,
      role_label: runtimePersona.role_label,
      current_concern_label: runtimePersona.core_concern || participant.current_concern_label,
      cooperation_condition: runtimePersona.cooperation_condition || participant.cooperation_condition,
      runtime_persona: runtimePersona,
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
  };
}
