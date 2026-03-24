export type ScenePhase = "initialization" | "opening" | "discussion" | "closing" | "post-game";

export type TopicType =
  | "problem-framing"
  | "scope-boundary"
  | "support-model"
  | "ownership"
  | "delivery-shape";

export type TopicStatus = "active" | "parked" | "resolved-enough";

export type TurnOwner = "player" | "initiating_actor" | "reacting_actor" | "facilitator";

export type ParticipantRoleType = "player" | "facilitator" | "stakeholder" | "evaluator";

export type RuntimeDefaultMove = "ask" | "narrow" | "support-with-condition" | "push-back" | "repair-flow";

export type RuntimePatience = "low" | "medium" | "high";

export type RuntimeTrustThreshold =
  | "one-bounded-signal"
  | "visible-support-boundary"
  | "day-one-utility"
  | "credible-transition-path"
  | "direct-exchange-legible";

export type ReactionType =
  | "none"
  | "recognition"
  | "surprise"
  | "concern"
  | "relief"
  | "curiosity"
  | "conditional-support";

export interface RuntimePersonaSlice {
  persona_id: string;
  source_path: string;
  display_name: string;
  role_label: string;
  tone_summary: string;
  core_concern: string;
  default_move: RuntimeDefaultMove;
  patience: RuntimePatience;
  trust_threshold: RuntimeTrustThreshold;
  likely_misunderstanding: string;
  cooperation_condition?: string;
  voice_cues: string[];
}

export interface RuntimeSceneSetup {
  scenario: string;
  session_mode: string;
  meeting_goal: string;
  active_topic_seed: string;
  facilitator_opening_frame: string;
  player_start_expectation: string;
  enterprise_context_summary: string[];
}

export interface RuntimePlayerInitialization {
  session_purpose: string;
  player_goal: string;
  player_should_expect: string[];
  player_allowed_moves: string[];
  player_not_expected_to_know: string[];
  optional_setup_question_example: string;
  start_signal_examples: string[];
  opening_move_guidance: string;
}

export interface ParticipantSessionSetup {
  role_focus: string;
  current_pressure_seed: string;
  likely_misunderstanding_or_overreach: string;
  likely_first_move: string;
}

export interface ActiveTopic {
  topic_id: string;
  label: string;
  opened_by: string;
  opened_at_turn: number;
  topic_type: TopicType;
  depth: number;
  status: TopicStatus;
}

export interface ExchangeState {
  initiating_actor_id: string | null;
  last_player_answer_turn: number | null;
  follow_up_count: number;
  stance_movement: "none" | "partial" | "visible";
  awaiting_reaction_from: string | null;
  handoff_candidate_actor_ids: string[];
  should_continue_current_exchange: boolean;
}

export interface ParticipantState {
  participant_id: string;
  role_type: ParticipantRoleType;
  display_name: string;
  role_label?: string;
  stance_level: number;
  engagement_level: number;
  last_spoke_turn: number | null;
  current_concern_label: string | null;
  cooperation_condition: string | null;
  escalation_trigger_visible: boolean;
  pending_question: string | null;
  last_reaction_type: ReactionType;
  runtime_persona?: RuntimePersonaSlice;
  session_setup?: ParticipantSessionSetup;
}

export interface StructuralState {
  strategic_clarity: number;
  scope_coherence: number;
  ownership_clarity: number;
  support_model_clarity: number;
  coalition_stability: number;
  open_risks: string[];
}

export interface TranscriptTurn {
  turn_index: number;
  speaker_id: string;
  speaker_name: string;
  turn_owner: TurnOwner;
  text: string;
}

export interface TurnOutcome {
  speaker_id: string;
  speaker_name: string;
  turn_owner: TurnOwner;
  text: string;
  response_metadata?: Record<string, unknown>;
  updates?: Partial<{
    active_speaker: string | null;
    scene_phase: ScenePhase;
    topic_status: TopicStatus;
    active_topic: ActiveTopic;
    parking_lot: TopicSummary[];
    exchange_state: ExchangeState;
    participant_states: ParticipantState[];
    structural_state: StructuralState;
    close_readiness: CloseReadiness;
    main_session_judgment: MainSessionJudgment;
    sidecar_state: RoomSidecarState;
  }>;
}

export interface ScriptedTurnOutcome extends TurnOutcome {
  expected_selection_reason?: string;
}

export interface TopicSummary {
  topic_id: string;
  label: string;
  parked_at_turn: number;
}

export interface PromptConstraint {
  key: string;
  value: string;
}

export interface NextTurnOption {
  owner: TurnOwner;
  speaker_id: string;
  reason: string;
}

export interface CloseReadiness {
  ready: boolean;
  reason: string | null;
}

export interface MainSessionJudgment {
  meeting_layer: "why" | "what" | "how";
  last_player_utterance_type: "question" | "confirmation" | "proposal" | "objection" | "correction" | "clarification" | null;
  last_player_intent: string | null;
  multi_perspective_needed: boolean;
}

export interface RoomSidecarState {
  active_whispers: import("../sidecars/types.ts").WhisperInjection[];
  whisper_history: import("../sidecars/types.ts").WhisperHistoryEntry[];
}

export interface RoomState {
  session_id: string;
  session_setup: RuntimeSceneSetup;
  player_initialization: RuntimePlayerInitialization;
  scene_phase: ScenePhase;
  language: string;
  turn_index: number;
  active_speaker: string | null;
  active_topic: ActiveTopic;
  topic_status: TopicStatus;
  parking_lot: TopicSummary[];
  exchange_state: ExchangeState;
  participant_states: ParticipantState[];
  structural_state: StructuralState;
  recent_transcript: TranscriptTurn[];
  next_turn_options: NextTurnOption[];
  close_readiness: CloseReadiness;
  main_session_judgment: MainSessionJudgment;
  sidecar_state: RoomSidecarState;
}
