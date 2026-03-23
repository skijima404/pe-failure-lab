import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import { evaluateSession, formatReflectionReport } from "../evaluation/report.ts";
import { evaluateClosedSessionLocally } from "../evaluation/local-evaluator.ts";
import { buildInitializationBrief, formatInitializationBrief, isStartSignal } from "../execution/initialization.ts";
import { MockModelAdapter, AdapterBackedResponder, OpenAIResponsesAdapter } from "../execution/runtime-responder.ts";
import { AdapterBackedPlayerTurnJudger } from "../orchestration/adapter-backed-player-turn-judger.ts";
import { prepareNextRuntimeTurn } from "../execution/prepare-runtime-turn.ts";
import {
  acceptPlayerMessage,
  acceptPlayerMessageWithLocalJudger,
  acceptPlayerMessageWithJudger,
  evaluateIfSessionClosed,
  initializeSession,
  runNextRuntimeActorTurnFromState,
  runSessionFromPlayerStart,
  startSession,
} from "../execution/session-driver.ts";
import { renderVisibleTranscript } from "../presentation/visible-transcript.ts";
import { loadDefaultSceneSetup } from "../scene/setup-loader.ts";
import { loadDefaultPlayerInitialization } from "../scene/player-initialization-loader.ts";
import { applyTurnOutcome, computeStateChanges } from "../state/reducers.ts";
import { createInitialRoomState } from "../state/schema.ts";
import {
  buildWhisperSidecarPacket,
  buildRiskSidecarPacket,
} from "../sidecars/packet-builders.ts";
import { generateLocalWhispers } from "../sidecars/local-whisper-sidecar.ts";
import {
  classifyPlayerUtterance,
  inferMeetingLayer,
  inferMultiPerspectiveNeeded,
} from "../orchestration/player-turn-analysis.ts";
import { buildPlayerTurnJudgmentPacket } from "../orchestration/player-turn-judgment-packet.ts";
import { judgePlayerTurnLocally } from "../orchestration/local-player-turn-judger.ts";
import { loadRuntimePersonaSlice } from "../personas/runtime-slice-loader.ts";
import { runScriptedFixture } from "../validation/fixture-runner.ts";
import {
  countDistinctTopicSignals,
  facilitatorOveruse,
  hasClosingEvaluatorBoundaryCollapse,
  hasInitializationWrapperLeakage,
  hasActorKnowledgeLeakage,
  hasOrchestrationTextVisible,
  hasPlayerEntryViolation,
  hasScoringLeakage,
  hasTopicSprawl,
} from "../validation/transcript-checks.ts";
import {
  createDeliveryPressureInitialState,
  createPileOnRiskInitialState,
  createPlatformPressureInitialState,
  createSameTopicOverlapInitialState,
  createScriptedSessionInitialState,
  SCRIPTED_SESSION_FIXTURE,
} from "../validation/fixtures/scripted-session.ts";

test("scripted fixture completes with zero selection mismatches", async () => {
  const result = await runScriptedFixture(
    SCRIPTED_SESSION_FIXTURE,
    "test-scripted-fixture",
    createScriptedSessionInitialState(),
  );

  assert.equal(result.mismatches.length, 0);
  assert.equal(result.results.length, 3);
  assert.equal(result.results.at(-1)?.room_state.close_readiness.ready, true);
});

test("reducer derives support-boundary clarity and closes when next step is bounded", () => {
  const initialState = createScriptedSessionInitialState();

  const afterPlayerTurn = applyTurnOutcome(initialState, {
    speaker_id: "player",
    speaker_name: "Player",
    turn_owner: "player",
    text: "We are standardizing one onboarding path and not taking over ongoing delivery support.",
  });

  assert.equal(afterPlayerTurn.structural_state.support_model_clarity >= initialState.structural_state.support_model_clarity, true);
  assert.equal(afterPlayerTurn.exchange_state.awaiting_reaction_from, initialState.exchange_state.initiating_actor_id);

  const afterStakeholderTurn = applyTurnOutcome(afterPlayerTurn, {
    speaker_id: "platform",
    speaker_name: "Platform-side Stakeholder",
    turn_owner: "initiating_actor",
    text: "Good. If we keep it that narrow, I can support shaping the next step after this meeting.",
  });

  assert.equal(afterStakeholderTurn.close_readiness.ready, true);
  assert.equal(afterStakeholderTurn.close_readiness.reason, "bounded-next-step-visible");
});

test("player response can generate same-topic overlap candidates from session context", () => {
  const roomState = createScriptedSessionInitialState();
  roomState.exchange_state.awaiting_reaction_from = null;
  roomState.exchange_state.handoff_candidate_actor_ids = [];
  roomState.exchange_state.follow_up_count = 1;

  const afterPlayerTurn = applyTurnOutcome(roomState, {
    speaker_id: "player",
    speaker_name: "Player",
    turn_owner: "player",
    text: "We should keep the first onboarding path narrow so platform is not silently absorbing support exceptions for teams.",
  });

  assert.deepEqual(afterPlayerTurn.exchange_state.handoff_candidate_actor_ids, ["platform"]);
  assert.equal(afterPlayerTurn.exchange_state.awaiting_reaction_from, null);

  const preparedTurn = prepareNextRuntimeTurn(afterPlayerTurn);
  assert.equal(preparedTurn.decision.owner, "reacting_actor");
  assert.equal(preparedTurn.decision.speaker_id, "platform");
});

test("sidecar packet builders create bounded whisper and risk packets from main-session state", () => {
  const roomState = createInitialRoomState("proposal-packet-test");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    label: "Initial platform scope",
    topic_type: "scope-boundary",
  };
  roomState.main_session_judgment = {
    ...roomState.main_session_judgment,
    meeting_layer: "what",
    last_player_utterance_type: "proposal",
    last_player_intent: "propose-bounded-first-move",
    multi_perspective_needed: true,
  };
  roomState.parking_lot = [
    {
      topic_id: "topic-parked",
      label: "Support boundary",
      parked_at_turn: 3,
    },
  ];
  roomState.structural_state.open_risks = ["ownership-follow-up-not-yet-clear"];
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "exec",
      speaker_name: "Aki Tanaka",
      turn_owner: "initiating_actor",
      text: "The first move should stay narrow enough to matter this quarter.",
    },
    {
      turn_index: 2,
      speaker_id: "player",
      speaker_name: "Player",
      turn_owner: "player",
      text: "We should start with one business line and one paved path.",
    },
  ];

  const whisperPacket = buildWhisperSidecarPacket(
    roomState,
    "I think we should start with one bounded v0.1 path for a single business line.",
  );
  const riskPacket = buildRiskSidecarPacket(
    roomState,
    "I think we should start with one bounded v0.1 path for a single business line.",
  );

  assert.equal(whisperPacket.packet_kind, "whisper-sidecar");
  assert.equal(whisperPacket.meeting_layer, "what");
  assert.equal(whisperPacket.player_utterance_type, "proposal");
  assert.equal(whisperPacket.player_intent, "propose-bounded-first-move");
  assert.equal(whisperPacket.multi_perspective_needed, true);
  assert.deepEqual(whisperPacket.resolved_topics, ["Support boundary"]);
  assert.equal(whisperPacket.decisions_made.length > 0, true);
  assert.deepEqual(whisperPacket.target_participant_ids, ["exec", "platform", "delivery"]);
  assert.equal(riskPacket.packet_kind, "risk-sidecar");
  assert.deepEqual(riskPacket.visible_risks, ["ownership-follow-up-not-yet-clear"]);
});

test("player turns update canonical main-session judgment for meeting layer and intent", () => {
  const roomState = createInitialRoomState("main-session-judgment-test");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_type: "scope-boundary",
  };

  const nextState = applyTurnOutcome(roomState, {
    speaker_id: "player",
    speaker_name: "Player",
    turn_owner: "player",
    text: "I think we should start with one bounded v0.1 path for a single business line.",
  });

  assert.equal(nextState.main_session_judgment.meeting_layer, "what");
  assert.equal(nextState.main_session_judgment.last_player_utterance_type, "proposal");
  assert.equal(nextState.main_session_judgment.last_player_intent, "propose-bounded-first-move");
  assert.equal(nextState.main_session_judgment.multi_perspective_needed, true);
});

test("player-turn judgment uses a bounded packet before deriving canonical tags", () => {
  const roomState = createInitialRoomState("player-turn-judgment-packet-test", "ja");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    label: "Scope boundary",
    topic_type: "scope-boundary",
  };
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "mika",
      speaker_name: "Mika",
      turn_owner: "facilitator",
      text: "Let's clarify the issue before we debate the shape.",
    },
  ];

  const packet = buildPlayerTurnJudgmentPacket(
    roomState,
    "ではPlatform EngineeringではなくDevOpsを勧めるのはいかがでしょうか",
  );
  const result = judgePlayerTurnLocally(packet);

  assert.equal(packet.packet_kind, "player-turn-judgment");
  assert.equal(packet.current_meeting_layer, "why");
  assert.equal(packet.active_topic_type, "scope-boundary");
  assert.equal(result.utterance_type, "proposal");
  assert.equal(result.multi_perspective_needed, true);
});

test("proposal player turns seed local whispers without forcing immediate speaker reseeding", () => {
  const roomState = createInitialRoomState("proposal-sidecar-integration");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_type: "support-model",
    label: "Onboarding support boundary",
  };
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "platform",
      speaker_name: "Naoki Sato",
      turn_owner: "initiating_actor",
      text: "What does the platform side actually provide first?",
    },
  ];
  roomState.exchange_state.initiating_actor_id = "platform";

  const nextState = acceptPlayerMessage(
    roomState,
    "I think we should start with one narrow onboarding path and keep support exceptions outside the first offer.",
  );

  assert.equal(nextState.sidecar_state.active_whispers.length >= 1, true);
  assert.equal(nextState.sidecar_state.active_whispers.some((whisper) => whisper.target_participant_id === "platform"), true);
  assert.equal(nextState.exchange_state.awaiting_reaction_from, "platform");
});

test("local whisper generation produces bounded targeted hints without depending on next-speaker ownership", () => {
  const roomState = createInitialRoomState("multi-perspective-routing-test");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_type: "scope-boundary",
    label: "Initial platform scope",
  };
  roomState.main_session_judgment = {
    ...roomState.main_session_judgment,
    meeting_layer: "what",
    last_player_utterance_type: "question",
    last_player_intent: "compare-alternative-framing",
    multi_perspective_needed: true,
  };
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "exec",
      speaker_name: "Aki Tanaka",
      turn_owner: "initiating_actor",
      text: "We need a bounded first move.",
    },
  ];

  const packet = buildWhisperSidecarPacket(roomState, "Wouldn't it be better to call this DevOps instead?");
  const whispers = generateLocalWhispers(roomState, packet);

  assert.equal(whispers.length >= 1, true);
  assert.equal(whispers.some((whisper) => whisper.target_participant_id === "exec"), true);
  assert.equal(whispers.every((whisper) => whisper.priority_hint === "use-if-selected" || whisper.priority_hint === "use-only-if-natural"), true);
});

test("whisper generation can leave room-scoped hints for later speakers beyond the canonically awaiting stakeholder", () => {
  const roomState = createInitialRoomState("whisper-priority-test", "ja");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_type: "support-model",
    label: "Initial onboarding boundary",
  };
  roomState.exchange_state.initiating_actor_id = "exec";
  roomState.exchange_state.awaiting_reaction_from = "exec";
  roomState.main_session_judgment = {
    ...roomState.main_session_judgment,
    meeting_layer: "what",
    last_player_utterance_type: "proposal",
    last_player_intent: "propose-bounded-first-move",
    multi_perspective_needed: true,
  };

  const packet = buildWhisperSidecarPacket(
    roomState,
    "最初は一つの事業ラインに限定して、支援範囲を広げすぎない形で始めたいです。",
  );
  const whispers = generateLocalWhispers(roomState, packet);

  assert.equal(whispers.length >= 1, true);
  assert.equal(whispers.some((whisper) => whisper.target_participant_id === "exec"), true);
  assert.equal(whispers.some((whisper) => whisper.target_participant_id === "platform"), true);
  assert.equal(whispers.every((whisper) => whisper.expires_after_turn === packet.built_at_turn + 2), true);
});

test("non-selected whispers persist across another stakeholder turn and remain available for pull", () => {
  const roomState = createInitialRoomState("whisper-persistence-test", "ja");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_type: "support-model",
    label: "Initial onboarding boundary",
  };
  roomState.exchange_state.initiating_actor_id = "exec";
  roomState.exchange_state.awaiting_reaction_from = "exec";
  roomState.main_session_judgment = {
    ...roomState.main_session_judgment,
    meeting_layer: "what",
    last_player_utterance_type: "proposal",
    last_player_intent: "propose-bounded-first-move",
    multi_perspective_needed: true,
  };

  const afterPlayer = acceptPlayerMessage(
    roomState,
    "最初は一つの事業ラインに限定しつつ、Platform 側が例外対応を抱え込まない入口から始めたいです。",
  );

  assert.equal(afterPlayer.sidecar_state.active_whispers.some((whisper) => whisper.target_participant_id === "platform"), true);

  const afterExec = applyTurnOutcome(afterPlayer, {
    speaker_id: "exec",
    speaker_name: "Aki Tanaka",
    turn_owner: "initiating_actor",
    text: "対象の切り方は分かりました。今やる意味も確認したいです。",
  });

  assert.equal(afterExec.sidecar_state.active_whispers.some((whisper) => whisper.target_participant_id === "platform"), true);
  assert.equal(afterExec.sidecar_state.whisper_history.some((entry) => entry.target_participant_id === "platform"), false);
});

test("async player-turn judger can override canonical judgment before routing", async () => {
  const roomState = createInitialRoomState("async-player-judger-test");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_type: "scope-boundary",
    label: "Scope boundary",
  };

  const nextState = await acceptPlayerMessageWithJudger(
    roomState,
    "Wouldn't it be better to call this DevOps instead?",
    {
      async judgePlayerTurn(packet) {
        return {
          packet_id: packet.packet_id,
          utterance_type: "question",
          meeting_layer: "what",
          player_intent: "compare-alternative-framing",
          multi_perspective_needed: true,
        };
      },
    },
  );

  assert.equal(nextState.main_session_judgment.last_player_intent, "compare-alternative-framing");
  assert.equal(nextState.main_session_judgment.multi_perspective_needed, true);
  assert.equal(nextState.sidecar_state.active_whispers.length >= 1, true);
  assert.equal(nextState.sidecar_state.active_whispers.every((whisper) => whisper.source_reason.length > 0), true);
});

test("meeting layer and utterance classification prefer explicit why/how signals over topic defaults", () => {
  const roomState = createInitialRoomState("meeting-layer-test");
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_type: "delivery-shape",
  };

  assert.equal(classifyPlayerUtterance("Why are we doing this now?"), "question");
  assert.equal(inferMeetingLayer(roomState, "Why are we doing this now?"), "why");
  assert.equal(classifyPlayerUtterance("I think we should start with a narrow onboarding path."), "proposal");
  assert.equal(inferMultiPerspectiveNeeded("I think we should start with a narrow onboarding path.", "proposal"), true);
  assert.equal(inferMeetingLayer(roomState, "How do we roll this out without stalling the launch?"), "how");
});

test("japanese localization patch maps why-questions and proposal-like phrasing into canonical judgments", () => {
  const roomState = createInitialRoomState("ja-meeting-layer-test", "ja");
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_type: "scope-boundary",
  };

  assert.equal(classifyPlayerUtterance("まずはこの流れが何をきっかけにして生まれたのか、大元のIssueを確認しませんか", "ja"), "question");
  assert.equal(inferMeetingLayer(roomState, "まずはこの流れが何をきっかけにして生まれたのか、大元のIssueを確認しませんか"), "why");
  assert.equal(classifyPlayerUtterance("ではPlatform EngineeringではなくDevOpsを勧めるのはいかがでしょうか", "ja"), "proposal");
  assert.equal(
    inferMultiPerspectiveNeeded("ではPlatform EngineeringではなくDevOpsを勧めるのはいかがでしょうか", "proposal", "ja"),
    true,
  );
});

test("japanese player turns update canonical main-session judgment through localization patch", () => {
  const roomState = createInitialRoomState("ja-main-session-judgment-test", "ja");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_type: "scope-boundary",
  };

  const nextState = applyTurnOutcome(roomState, {
    speaker_id: "player",
    speaker_name: "Player",
    turn_owner: "player",
    text: "まずはこの流れが何をきっかけにして生まれたのか、大元のIssueを確認しませんか",
  });

  assert.equal(nextState.main_session_judgment.meeting_layer, "why");
  assert.equal(nextState.main_session_judgment.last_player_utterance_type, "question");
  assert.equal(nextState.main_session_judgment.last_player_intent, "request-trigger-alignment");
  assert.equal(nextState.main_session_judgment.multi_perspective_needed, false);
});

test("initial why-question after opening routes back to facilitator instead of forcing exec first", () => {
  const roomState = createInitialRoomState("initial-why-question-routes-facilitator", "ja");
  roomState.scene_phase = "discussion";
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "mika",
      speaker_name: "Mika",
      turn_owner: "facilitator",
      text: "今日はありがとうございます。どこから始めるのがよさそうか共有してください。",
    },
  ];

  const afterPlayer = acceptPlayerMessageWithLocalJudger(
    roomState,
    "まずこの活動は、どう言うきっかけで始まり、その背景にあった問題はなんだったかを教えてもらえますか",
  );
  const preparedTurn = prepareNextRuntimeTurn(afterPlayer);

  assert.equal(afterPlayer.main_session_judgment.last_player_utterance_type, "question");
  assert.equal(afterPlayer.main_session_judgment.meeting_layer, "why");
  assert.equal(afterPlayer.main_session_judgment.last_player_intent, "request-trigger-alignment");
  assert.equal(preparedTurn.decision.owner, "facilitator");
  assert.equal(preparedTurn.decision.speaker_id, "mika");
  assert.equal(preparedTurn.decision.selection_reason, "facilitator-intervention");
  assert.equal(preparedTurn.decision.intervention_reason, "trigger-alignment");
});

test("initial boundary proposal after opening routes first reaction to platform", () => {
  const roomState = createInitialRoomState("initial-boundary-routes-platform", "ja");
  roomState.scene_phase = "discussion";
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "mika",
      speaker_name: "Mika",
      turn_owner: "facilitator",
      text: "今日はありがとうございます。どこから始めるのがよさそうか共有してください。",
    },
  ];

  const afterPlayer = acceptPlayerMessageWithLocalJudger(
    roomState,
    "まずは一つのオンボーディング導線に絞って、Platform 側が例外対応を抱え込まない境界から始めたいです。",
  );
  const preparedTurn = prepareNextRuntimeTurn(afterPlayer);

  assert.equal(afterPlayer.exchange_state.initiating_actor_id, "platform");
  assert.equal(afterPlayer.exchange_state.awaiting_reaction_from, "platform");
  assert.equal(preparedTurn.decision.owner, "initiating_actor");
  assert.equal(preparedTurn.decision.speaker_id, "platform");
});

test("initial delivery-shaped proposal after opening routes first reaction to delivery", () => {
  const roomState = createInitialRoomState("initial-delivery-routes-delivery", "ja");
  roomState.scene_phase = "discussion";
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "mika",
      speaker_name: "Mika",
      turn_owner: "facilitator",
      text: "今日はありがとうございます。どこから始めるのがよさそうか共有してください。",
    },
  ];

  const afterPlayer = acceptPlayerMessageWithLocalJudger(
    roomState,
    "最初は現場チームが今のロードマップの中でも使い始められる軽い workflow から始めたいです。",
  );
  const preparedTurn = prepareNextRuntimeTurn(afterPlayer);

  assert.equal(afterPlayer.exchange_state.initiating_actor_id, "delivery");
  assert.equal(afterPlayer.exchange_state.awaiting_reaction_from, "delivery");
  assert.equal(preparedTurn.decision.owner, "initiating_actor");
  assert.equal(preparedTurn.decision.speaker_id, "delivery");
});

test("initial investment-framed proposal after opening routes first reaction to exec", () => {
  const roomState = createInitialRoomState("initial-investment-routes-exec", "ja");
  roomState.scene_phase = "discussion";
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "mika",
      speaker_name: "Mika",
      turn_owner: "facilitator",
      text: "今日はありがとうございます。どこから始めるのがよさそうか共有してください。",
    },
  ];

  const afterPlayer = acceptPlayerMessageWithLocalJudger(
    roomState,
    "最初は投資判断として説明しやすい一歩に絞って、事業価値と展開性を見せたいです。",
  );
  const preparedTurn = prepareNextRuntimeTurn(afterPlayer);

  assert.equal(afterPlayer.exchange_state.initiating_actor_id, "exec");
  assert.equal(afterPlayer.exchange_state.awaiting_reaction_from, "exec");
  assert.equal(preparedTurn.decision.owner, "initiating_actor");
  assert.equal(preparedTurn.decision.speaker_id, "exec");
});

test("local player-turn judger updates canonical judgment and seeds whispers on the default path", () => {
  const roomState = createInitialRoomState("local-player-judger-default-path", "ja");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_type: "scope-boundary",
    label: "Support boundary",
  };

  const nextState = acceptPlayerMessageWithLocalJudger(
    roomState,
    "まずは一つのオンボーディング導線に絞って、Platform 側が例外対応を抱え込まない形で始めたいです。",
  );

  assert.equal(nextState.main_session_judgment.last_player_utterance_type, "proposal");
  assert.equal(nextState.main_session_judgment.multi_perspective_needed, true);
  assert.equal(nextState.sidecar_state.active_whispers.length >= 1, true);
  assert.equal(nextState.sidecar_state.active_whispers.every((whisper) => typeof whisper.context_pressure_tag !== "undefined"), true);
});

test("multi-perspective trigger can fire for non-proposal alternative framing", () => {
  assert.equal(classifyPlayerUtterance("Wouldn't it be better to call this DevOps instead?"), "question");
  assert.equal(
    inferMultiPerspectiveNeeded("Wouldn't it be better to call this DevOps instead?", "question"),
    true,
  );
});

test("adapter-backed player-turn judger parses structured adapter output and falls back on invalid output", async () => {
  const roomState = createInitialRoomState("adapter-backed-player-judger-test");
  const packet = buildPlayerTurnJudgmentPacket(roomState, "Why are we doing this now?");
  const validJudger = new AdapterBackedPlayerTurnJudger({
    async generate() {
      return {
        text: '{"utterance_type":"question","meeting_layer":"why","player_intent":"request-trigger-alignment","multi_perspective_needed":false}',
      };
    },
  });
  const invalidJudger = new AdapterBackedPlayerTurnJudger({
    async generate() {
      return {
        text: "not-json",
      };
    },
  });

  const valid = await validJudger.judgePlayerTurn(packet);
  const invalid = await invalidJudger.judgePlayerTurn(packet);

  assert.equal(valid.utterance_type, "question");
  assert.equal(valid.meeting_layer, "why");
  assert.equal(valid.player_intent, "request-trigger-alignment");
  assert.equal(valid.multi_perspective_needed, false);

  assert.equal(invalid.packet_id, packet.packet_id);
  assert.equal(typeof invalid.player_intent, "string");
});

test("persona slice loader reads durable runtime persona assets", () => {
  const execPersona = loadRuntimePersonaSlice("exec");
  const facilitatorPersona = loadRuntimePersonaSlice("mika");
  const platformPersona = loadRuntimePersonaSlice("platform");

  assert.ok(execPersona);
  assert.equal(execPersona?.display_name, "Aki Tanaka");
  assert.equal(execPersona?.role_label, "Executive Stakeholder");
  assert.equal(execPersona?.voice_cues.includes("broad-first"), true);
  assert.ok(platformPersona);
  assert.match(platformPersona?.day_to_day_pressure ?? "", /capacity is thin/);
  assert.match(platformPersona?.protection_target ?? "", /invisible support inflation/);
  assert.ok(facilitatorPersona);
  assert.equal(facilitatorPersona?.display_name, "Mika");
  assert.equal(facilitatorPersona?.do_not_overdo.includes("do not act like a shadow evaluator"), true);
});

test("scene setup loader reads the thin runtime scene asset", () => {
  const sceneSetup = loadDefaultSceneSetup();

  assert.equal(sceneSetup.scenario, "Platform Engineering Failure Lab MVP");
  assert.equal(sceneSetup.session_mode, "brainstorming workshop");
  assert.equal(sceneSetup.active_topic_seed, "Initial platform scope");
  assert.equal(sceneSetup.enterprise_context_summary.length > 0, true);
});

test("scene setup loader localizes runtime setup for japanese sessions", () => {
  const sceneSetup = loadDefaultSceneSetup("ja");

  assert.match(sceneSetup.session_mode, /ワークショップ/);
  assert.match(sceneSetup.meeting_goal, /方向性/);
  assert.match(sceneSetup.facilitator_opening_frame, /抽象的/);
});

test("player initialization loader reads the thin player-start asset", () => {
  const playerInitialization = loadDefaultPlayerInitialization();

  assert.match(playerInitialization.session_purpose, /one-scene workshop simulation/);
  assert.match(playerInitialization.player_goal, /bounded next step/);
  assert.equal(playerInitialization.player_not_expected_to_know.includes("hidden stakeholder thresholds"), true);
  assert.equal(playerInitialization.start_signal_examples.includes("Start"), true);
});

test("player initialization loader localizes player-facing runtime copy for japanese sessions", () => {
  const playerInitialization = loadDefaultPlayerInitialization("ja");

  assert.match(playerInitialization.session_purpose, /ワークショップ型シミュレーション/);
  assert.match(playerInitialization.player_goal, /次の一手/);
  assert.equal(playerInitialization.start_signal_examples.includes("始めます"), true);
});

test("player prompt preparation includes initialization and opening guidance", () => {
  const roomState = createInitialRoomState("player-turn-test");
  roomState.exchange_state.initiating_actor_id = "exec";
  roomState.exchange_state.should_continue_current_exchange = true;
  roomState.active_speaker = "player";
  roomState.next_turn_options = [];
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "exec",
      speaker_name: "Aki Tanaka",
      turn_owner: "initiating_actor",
      text: "What direction are you asking this room to support right now?",
    },
  ];

  const preparedTurn = prepareNextRuntimeTurn(roomState);

  assert.equal(preparedTurn.decision.owner, "player");
  assert.match(preparedTurn.prompt_text, /Session purpose:/);
  assert.match(preparedTurn.prompt_text, /Opening guidance:/);
  assert.match(preparedTurn.prompt_text, /do not know hidden thresholds/i);
});

test("actor prompt includes stakeholder working context and pressure background", () => {
  const roomState = createInitialRoomState("actor-context-test");
  roomState.scene_phase = "discussion";
  roomState.exchange_state.awaiting_reaction_from = "platform";
  roomState.active_topic = {
    ...roomState.active_topic,
    label: "Onboarding support boundary",
    depth: 2,
  };
  roomState.structural_state.open_risks = ["support-boundary-not-yet-clear"];
  roomState.sidecar_state.active_whispers = [
    {
      whisper_id: "actor-context-whisper",
      target_participant_id: "platform",
      triggered_at_turn: roomState.turn_index,
      expires_after_turn: roomState.turn_index + 2,
      source_reason: "player-turn-made-support-boundary-salient",
      angle_shift: "boundary-clarity",
      context_pressure_tag: "support-function-misread",
      temperature_shift: "more-concerned",
      priority_hint: "use-if-selected",
      optional_question_seed: "What exactly does platform provide first?",
      do_not_repeat_tags: ["platform-boundary-clarity"],
    },
  ];

  const preparedTurn = prepareNextRuntimeTurn(roomState);

  assert.equal(preparedTurn.decision.speaker_id, "platform");
  assert.match(preparedTurn.prompt_text, /Working context:/);
  assert.match(preparedTurn.prompt_text, /Day-to-day pressure:/);
  assert.match(preparedTurn.prompt_text, /actual workload, team reality, or delivery context/i);
  assert.match(preparedTurn.prompt_text, /Session role focus:/);
  assert.match(preparedTurn.prompt_text, /Current pressure seed:/);
  assert.match(preparedTurn.prompt_text, /Active topic depth: 2/);
  assert.match(preparedTurn.prompt_text, /Visible unresolved items:/);
  assert.match(preparedTurn.prompt_text, /Hidden whisper:/);
});

test("actor prompt includes explicit japanese output guidance when the session language is japanese", () => {
  const roomState = createInitialRoomState("actor-language-test", "ja");
  roomState.scene_phase = "discussion";
  roomState.exchange_state.awaiting_reaction_from = "exec";

  const preparedTurn = prepareNextRuntimeTurn(roomState);

  assert.equal(preparedTurn.decision.speaker_id, "exec");
  assert.match(preparedTurn.prompt_text, /Write the visible turn in natural Japanese\./);
});

test("mock adapter renders whisper-aware stakeholder response when a whisper exists", async () => {
  const initialized = initializeSession("sidecar-local-rendering-test");
  const started = startSession(initialized.room_state, "Start");
  const afterOpening = await runNextRuntimeActorTurnFromState(started.room_state, new AdapterBackedResponder(new MockModelAdapter()), {
    opening_mode: "local",
  });
  afterOpening.room_state.active_topic = {
    ...afterOpening.room_state.active_topic,
    topic_type: "support-model",
    label: "Onboarding support boundary",
  };
  afterOpening.room_state.exchange_state.initiating_actor_id = "platform";
  afterOpening.room_state.exchange_state.awaiting_reaction_from = "platform";
  afterOpening.room_state.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "platform",
      speaker_name: "Naoki Sato",
      turn_owner: "initiating_actor",
      text: "What does the platform side actually provide first?",
    },
  ];

  const afterPlayerMessage = acceptPlayerMessage(
    afterOpening.room_state,
    "I think we should start with one narrow onboarding path and keep support exceptions outside the first offer.",
  );
  const actorTurn = await runNextRuntimeActorTurnFromState(
    afterPlayerMessage,
    new AdapterBackedResponder(new MockModelAdapter()),
  );

  assert.equal(actorTurn.turn_log.selected_speaker, "platform");
  assert.match(actorTurn.room_state.recent_transcript.at(-1)?.text ?? "", /I can work with that direction if we keep it tight\.|The angle I still care about is/);
  assert.equal(actorTurn.turn_log.agent_output_summary.response_transport, "mock-model-adapter");
});

test("mock adapter renders japanese stakeholder output when the session language is japanese", () => {
  const adapter = new MockModelAdapter();
  const response = adapter.generate({
    session_id: "ja-mock-test",
    speaker_id: "exec",
    turn_owner: "initiating_actor",
    selection_reason: "initiating-actor-follow-up",
    prompt_input: {
      language: "ja",
      runtime_persona: {
        core_concern: "business value",
        voice_cues: ["broad-first"],
      },
      active_topic: {
        label: "Initial platform scope",
      },
    },
    prompt_text: "unused",
  });

  assert.equal(/[\u3040-\u30ff\u4e00-\u9faf]/.test(response.text), true);
});

test("voice separation fixtures select platform and delivery as distinct next speakers", () => {
  const platformTurn = prepareNextRuntimeTurn(createPlatformPressureInitialState());
  const deliveryTurn = prepareNextRuntimeTurn(createDeliveryPressureInitialState());

  assert.equal(platformTurn.decision.speaker_id, "platform");
  assert.equal(deliveryTurn.decision.speaker_id, "delivery");
  assert.match(platformTurn.prompt_text, /capacity is thin/i);
  assert.match(deliveryTurn.prompt_text, /roadmap pressure/i);
});

test("same-topic overlap is allowed after player response when burden stays bounded", () => {
  const overlapTurn = prepareNextRuntimeTurn(createSameTopicOverlapInitialState());

  assert.equal(overlapTurn.decision.owner, "reacting_actor");
  assert.equal(overlapTurn.decision.speaker_id, "platform");
  assert.equal(overlapTurn.decision.selection_reason, "overlap-reaction");
});

test("substantive same-topic turns deepen the active topic", () => {
  const roomState = createInitialRoomState("topic-depth-growth");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_type: "support-model",
    depth: 1,
  };

  const nextState = applyTurnOutcome(roomState, {
    speaker_id: "player",
    speaker_name: "Player",
    turn_owner: "player",
    text: "We should keep the onboarding support boundary narrow so platform does not absorb exceptions or quiet operational work.",
  });

  assert.equal(nextState.active_topic.topic_type, "support-model");
  assert.equal(nextState.active_topic.depth, 2);
});

test("strong topic drift parks the current topic and opens a new active topic", () => {
  const roomState = createInitialRoomState("topic-drift-transition");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_id: "topic-support",
    label: "Support boundary",
    topic_type: "support-model",
    depth: 2,
    status: "active",
  };

  const nextState = applyTurnOutcome(roomState, {
    speaker_id: "exec",
    speaker_name: "Aki Tanaka",
    turn_owner: "initiating_actor",
    text: "Who is the owner, sponsor, and decision-maker for this direction?",
  });

  assert.equal(nextState.parking_lot.at(-1)?.topic_id, "topic-support");
  assert.equal(nextState.active_topic.topic_type, "ownership");
  assert.equal(nextState.active_topic.label, "Ownership and sponsorship");
  assert.equal(nextState.active_topic.depth, 1);
  assert.equal(nextState.active_topic.opened_by, "exec");
});

test("support-model topic drift uses a specific reusable label instead of a generic type name", () => {
  const roomState = createInitialRoomState("topic-labeling");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_id: "topic-scope",
    label: "Initial platform scope",
    topic_type: "scope-boundary",
    depth: 1,
    status: "active",
  };

  const nextState = applyTurnOutcome(roomState, {
    speaker_id: "platform",
    speaker_name: "Naoki Sato",
    turn_owner: "reacting_actor",
    text: "If onboarding exceptions start showing up, what support are we actually committing to?",
  });

  assert.equal(nextState.active_topic.topic_type, "support-model");
  assert.equal(nextState.active_topic.label, "Onboarding support boundary");
});

test("pile-on risk routes to facilitator instead of allowing another stakeholder stack", () => {
  const pileOnTurn = prepareNextRuntimeTurn(createPileOnRiskInitialState());

  assert.equal(pileOnTurn.decision.owner, "facilitator");
  assert.equal(pileOnTurn.decision.intervention_reason, "pile-on-risk");
});

test("player does not get selected twice in a row when no clear actor follow-up exists", () => {
  const roomState = createInitialRoomState("player-repeat-guard");
  roomState.scene_phase = "discussion";
  roomState.turn_index = 2;
  roomState.active_speaker = "player";
  roomState.exchange_state = {
    ...roomState.exchange_state,
    initiating_actor_id: null,
    awaiting_reaction_from: null,
    handoff_candidate_actor_ids: [],
    should_continue_current_exchange: true,
  };
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "mika",
      speaker_name: "Mika",
      turn_owner: "facilitator",
      text: "Player, where do you want to start?",
    },
    {
      turn_index: 2,
      speaker_id: "player",
      speaker_name: "Player",
      turn_owner: "player",
      text: "I want to start with one bounded onboarding path.",
    },
  ];

  const preparedTurn = prepareNextRuntimeTurn(roomState);

  assert.equal(preparedTurn.decision.owner, "facilitator");
  assert.equal(preparedTurn.decision.intervention_reason, "turn-ownership-unclear");
});

test("non-question stakeholder reactions do not remain as pending questions", () => {
  const roomState = createInitialRoomState("pending-question-guard");
  roomState.scene_phase = "discussion";

  const afterStakeholderTurn = applyTurnOutcome(roomState, {
    speaker_id: "exec",
    speaker_name: "Aki Tanaka",
    turn_owner: "initiating_actor",
    text: "That helps. I still need a clearer boundary for the first usable scope.",
  });

  const execState = afterStakeholderTurn.participant_states.find((participant) => participant.participant_id === "exec");
  assert.equal(execState?.pending_question, null);
});

test("supportive but unresolved stakeholder follow-up keeps the exchange open", () => {
  const roomState = createInitialRoomState("implicit-follow-up-guard");
  roomState.scene_phase = "discussion";
  roomState.exchange_state.initiating_actor_id = "exec";
  roomState.exchange_state.awaiting_reaction_from = "exec";

  const afterStakeholderTurn = applyTurnOutcome(roomState, {
    speaker_id: "exec",
    speaker_name: "Aki Tanaka",
    turn_owner: "initiating_actor",
    text: "That helps. I still need a clearer boundary for the first usable scope.",
  });

  assert.equal(afterStakeholderTurn.exchange_state.should_continue_current_exchange, true);

  const preparedTurn = prepareNextRuntimeTurn(afterStakeholderTurn);
  assert.equal(preparedTurn.decision.owner, "player");
  assert.equal(preparedTurn.decision.selection_reason, "player-clarification-needed");
});

test("supportive stakeholder acknowledgment without a next ask routes to facilitator instead of another player turn", () => {
  const roomState = createInitialRoomState("exchange-settled-guard");
  roomState.scene_phase = "discussion";
  roomState.turn_index = 2;
  roomState.exchange_state.initiating_actor_id = "exec";
  roomState.exchange_state.last_player_answer_turn = 2;
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "player",
      speaker_name: "Player",
      turn_owner: "player",
      text: "We should start with one narrow onboarding path.",
    },
    {
      turn_index: 2,
      speaker_id: "exec",
      speaker_name: "Aki Tanaka",
      turn_owner: "initiating_actor",
      text: "That helps. I can react to that as a business direction.",
    },
  ];

  const preparedTurn = prepareNextRuntimeTurn(roomState);
  assert.equal(preparedTurn.decision.owner, "facilitator");
  assert.equal(preparedTurn.decision.intervention_reason, "exchange-settled");
});

test("exchange-settled facilitator intervention does not re-trigger on the next turn", () => {
  const roomState = createInitialRoomState("exchange-settled-no-loop");
  roomState.scene_phase = "discussion";
  roomState.turn_index = 3;
  roomState.exchange_state = {
    ...roomState.exchange_state,
    initiating_actor_id: "exec",
    should_continue_current_exchange: false,
    awaiting_reaction_from: null,
    handoff_candidate_actor_ids: [],
  };
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "player",
      speaker_name: "Player",
      turn_owner: "player",
      text: "We should start with one narrow onboarding path.",
    },
    {
      turn_index: 2,
      speaker_id: "exec",
      speaker_name: "Aki Tanaka",
      turn_owner: "initiating_actor",
      text: "That helps. I can react to that as a business direction.",
    },
    {
      turn_index: 3,
      speaker_id: "mika",
      speaker_name: "Mika",
      turn_owner: "facilitator",
      text: "Sounds settled enough to lock a checkpoint.",
    },
  ];

  const preparedTurn = prepareNextRuntimeTurn(roomState);
  assert.equal(preparedTurn.decision.owner, "player");
  assert.equal(preparedTurn.decision.intervention_reason, null);
});

test("topic-drift facilitator intervention clears drift-driving exchange state", () => {
  const roomState = createInitialRoomState("topic-drift-no-loop");
  roomState.scene_phase = "discussion";
  roomState.turn_index = 3;
  roomState.active_topic = {
    ...roomState.active_topic,
    depth: 3,
  };
  roomState.exchange_state = {
    ...roomState.exchange_state,
    initiating_actor_id: "platform",
    follow_up_count: 2,
    awaiting_reaction_from: null,
    should_continue_current_exchange: true,
    handoff_candidate_actor_ids: [],
  };
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "player",
      speaker_name: "Player",
      turn_owner: "player",
      text: "We should start with one narrow onboarding path.",
    },
    {
      turn_index: 2,
      speaker_id: "platform",
      speaker_name: "Naoki Sato",
      turn_owner: "initiating_actor",
      text: "That helps, but I still need the boundary to stay narrow.",
    },
    {
      turn_index: 3,
      speaker_id: "delivery",
      speaker_name: "Emi Hayashi",
      turn_owner: "reacting_actor",
      text: "I can work with that if the workflow impact stays small.",
    },
  ];

  const afterFacilitatorTurn = applyTurnOutcome(roomState, {
    speaker_id: "mika",
    speaker_name: "Mika",
    turn_owner: "facilitator",
    text: "Let's stay with the current topic long enough to make the next decision boundary usable.",
  });

  const preparedTurn = prepareNextRuntimeTurn(afterFacilitatorTurn);
  assert.equal(preparedTurn.decision.owner, "player");
  assert.equal(preparedTurn.decision.intervention_reason, null);
  assert.equal(afterFacilitatorTurn.exchange_state.follow_up_count, 0);
  assert.equal(afterFacilitatorTurn.exchange_state.initiating_actor_id, null);
});

test("close readiness detects bounded next-step phrasing beyond the original exact wording", () => {
  const roomState = createInitialRoomState("close-readiness-variant");
  roomState.scene_phase = "discussion";

  const afterStakeholderTurn = applyTurnOutcome(roomState, {
    speaker_id: "platform",
    speaker_name: "Naoki Sato",
    turn_owner: "reacting_actor",
    text: "That helps. I can support the next step from here after this meeting.",
  });

  assert.equal(afterStakeholderTurn.close_readiness.ready, true);
  assert.equal(afterStakeholderTurn.close_readiness.reason, "bounded-next-step-visible");
});

test("bounded next-step phrasing does not close while visible risk is still unresolved", () => {
  const roomState = createInitialRoomState("close-risk-guard");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_type: "support-model",
  };
  roomState.structural_state = {
    ...roomState.structural_state,
    support_model_clarity: 1,
    open_risks: ["support-boundary-not-yet-clear"],
  };

  const afterStakeholderTurn = applyTurnOutcome(roomState, {
    speaker_id: "platform",
    speaker_name: "Naoki Sato",
    turn_owner: "reacting_actor",
    text: "Good. I can support shaping the next step after this meeting.",
  });

  assert.equal(afterStakeholderTurn.close_readiness.ready, false);
  assert.equal(afterStakeholderTurn.close_readiness.reason, null);
});

test("resolved exchange with sufficient structural progress becomes close-ready and marks topic resolved enough", () => {
  const roomState = createInitialRoomState("exchange-resolved-close");
  roomState.scene_phase = "discussion";
  roomState.turn_index = 3;
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_type: "problem-framing",
    depth: 1,
  };
  roomState.structural_state = {
    ...roomState.structural_state,
    strategic_clarity: 3,
    scope_coherence: 3,
    coalition_stability: 3,
    open_risks: [],
  };
  roomState.exchange_state = {
    ...roomState.exchange_state,
    initiating_actor_id: "exec",
    should_continue_current_exchange: true,
  };

  const afterStakeholderTurn = applyTurnOutcome(roomState, {
    speaker_id: "exec",
    speaker_name: "Aki Tanaka",
    turn_owner: "initiating_actor",
    text: "That helps. I can react to that as a business direction.",
  });

  assert.equal(afterStakeholderTurn.close_readiness.ready, true);
  assert.equal(afterStakeholderTurn.close_readiness.reason, "exchange-resolved-enough");
  assert.equal(afterStakeholderTurn.topic_status, "resolved-enough");
  assert.equal(afterStakeholderTurn.active_topic.status, "resolved-enough");
});

test("facilitator intervention clears stale stakeholder pending questions", () => {
  const roomState = createInitialRoomState("facilitator-clears-pending");
  roomState.scene_phase = "discussion";
  roomState.participant_states = roomState.participant_states.map((participant) =>
    participant.participant_id === "platform"
      ? { ...participant, pending_question: "What exactly are we committing to?" }
      : participant,
  );

  const nextState = applyTurnOutcome(roomState, {
    speaker_id: "mika",
    speaker_name: "Mika",
    turn_owner: "facilitator",
    text: "Let's stay with the first-use boundary for a moment.",
  });

  const platformState = nextState.participant_states.find((participant) => participant.participant_id === "platform");
  assert.equal(platformState?.pending_question, null);
});

test("known-bad transcript fixtures trigger expected validation flags", () => {
  const facilitatorTurns = JSON.parse(
    readFileSync(resolve("runtime/validation/fixtures/transcripts/facilitator-overuse.json"), "utf8"),
  );
  const topicDriftTurns = JSON.parse(
    readFileSync(resolve("runtime/validation/fixtures/transcripts/topic-drift.json"), "utf8"),
  );
  const actorLeakageTurns = JSON.parse(
    readFileSync(resolve("runtime/validation/fixtures/transcripts/actor-knows-too-much.json"), "utf8"),
  );
  const closingEvaluatorCollapseTurns = JSON.parse(
    readFileSync(resolve("runtime/validation/fixtures/transcripts/closing-evaluator-boundary-collapse.json"), "utf8"),
  );
  const playerEntryViolationTurns = JSON.parse(
    readFileSync(resolve("runtime/validation/fixtures/transcripts/player-entry-violation.json"), "utf8"),
  );

  assert.equal(facilitatorOveruse(facilitatorTurns), true);

  const topicSignalCount = countDistinctTopicSignals(topicDriftTurns);
  assert.equal(hasTopicSprawl(topicSignalCount), true);

  assert.equal(
    actorLeakageTurns.some((turn: { text: string }) => hasActorKnowledgeLeakage(turn.text) || hasScoringLeakage(turn.text)),
    true,
  );
  assert.equal(hasClosingEvaluatorBoundaryCollapse(closingEvaluatorCollapseTurns), true);
  assert.equal(hasPlayerEntryViolation(playerEntryViolationTurns), true);
  assert.equal(hasInitializationWrapperLeakage("OpenAI Adapter Harness\nTurns Executed: 2"), true);
  assert.equal(hasOrchestrationTextVisible("Selection Reason: overlap-reaction\nPrompt Preview: ..."), true);
});

test("initialization brief exposes player-facing start guidance without spoiler logic", () => {
  const roomState = createInitialRoomState("initialization-brief-test");
  const brief = buildInitializationBrief(roomState);
  const formatted = formatInitializationBrief(brief);

  assert.match(formatted, /Situation Brief/);
  assert.match(formatted, /Who Is In The Room:/);
  assert.match(formatted, /Mika: facilitator/);
  assert.match(formatted, /You Are Not Expected To Know:/);
  assert.equal(formatted.includes("hidden stakeholder thresholds"), true);
  assert.equal(isStartSignal("Start", roomState), true);
  assert.equal(isStartSignal("Let's start", roomState), true);
  assert.equal(isStartSignal("Go ahead", roomState), false);
});

test("japanese initialization brief and start aliases are localized for ja sessions", () => {
  const roomState = createInitialRoomState("initialization-brief-ja-test", "ja");
  const brief = buildInitializationBrief(roomState);
  const formatted = formatInitializationBrief(brief);

  assert.match(formatted, /状況説明/);
  assert.match(formatted, /登場人物:/);
  assert.match(formatted, /Mika: ファシリテーター/);
  assert.match(formatted, /この時点で知らなくてよいこと:/);
  assert.equal(isStartSignal("始めます", roomState), true);
  assert.equal(isStartSignal("開始", roomState), true);
});

test("session driver blocks live execution until a valid start signal appears", async () => {
  const roomState = createInitialRoomState("session-driver-reject-test");
  const responder = new AdapterBackedResponder(new MockModelAdapter());

  const result = await runSessionFromPlayerStart(roomState, "Go ahead", responder, 2);

  assert.equal(result.accepted, false);
  assert.equal(result.rejection_reason, "start-signal-required");
  assert.equal(result.live_results.length, 0);
  assert.match(result.initialization_brief, /Situation Brief/);
});

test("initialize and start keep session setup separate before live turns", () => {
  const initialized = initializeSession("interactive-init-test");
  assert.equal(initialized.room_state.scene_phase, "initialization");
  assert.equal(initialized.room_state.active_speaker, null);

  const started = startSession(initialized.room_state, "Start");
  assert.equal(started.accepted, true);
  assert.equal(started.room_state.scene_phase, "opening");
  assert.equal(started.room_state.active_speaker, "mika");
});

test("acceptPlayerMessage applies real player input instead of generated player text", () => {
  const initialized = initializeSession("interactive-player-test");
  const started = startSession(initialized.room_state, "Start");
  const nextState = acceptPlayerMessage(started.room_state, "We should start with one narrow onboarding path.");

  assert.equal(nextState.turn_index, started.room_state.turn_index + 1);
  assert.equal(nextState.recent_transcript.at(-1)?.speaker_id, "player");
  assert.match(nextState.recent_transcript.at(-1)?.text ?? "", /narrow onboarding path/);
});

test("interactive agent turn can use responder-backed opening instead of local opening", async () => {
  const initialized = initializeSession("interactive-opening-test");
  const started = startSession(initialized.room_state, "Let's start");
  const responder = new AdapterBackedResponder(new MockModelAdapter());

  const openingTurn = await runNextRuntimeActorTurnFromState(started.room_state, responder, {
    opening_mode: "responder",
  });

  assert.equal(openingTurn.turn_log.selected_speaker, "mika");
  assert.equal(openingTurn.turn_log.agent_output_summary.delivery_mode, "responder");
  assert.equal(openingTurn.turn_log.layer_trace.orchestration_layer, "local-room-orchestrator");
  assert.equal(openingTurn.turn_log.layer_trace.speaker_layer, "runtime-actor");
  assert.equal(openingTurn.turn_log.visible_output_classification, "simulation-visible");
});

test("turn log exposes response transport and layer separation for responder-backed turns", async () => {
  const initialized = initializeSession("layer-trace-test");
  const started = startSession(initialized.room_state, "Start");
  const responder = new AdapterBackedResponder(new MockModelAdapter());

  const openingTurn = await runNextRuntimeActorTurnFromState(started.room_state, responder, {
    opening_mode: "responder",
  });

  assert.equal(openingTurn.turn_log.agent_output_summary.response_transport, "mock-model-adapter");
  assert.equal(openingTurn.turn_log.agent_output_summary.response_chain.mode, "unknown");
  assert.equal(openingTurn.turn_log.layer_trace.response_layer, "unknown");
  assert.equal(openingTurn.turn_log.evaluation_reference.included_in_evidence_packet, false);
  assert.equal(openingTurn.turn_log.active_topic_depth_before, 1);
  assert.equal(openingTurn.turn_log.active_topic_depth_after, 1);
  assert.equal(openingTurn.turn_log.topic_transition_reason, null);
});

test("interactive runtime can keep facilitator turns local while actor turns remain responder-backed", async () => {
  const roomState = createInitialRoomState("local-facilitator-turn-test");
  roomState.scene_phase = "discussion";
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "player",
      speaker_name: "Player",
      turn_owner: "player",
      text: "I need a moment to think about the tradeoff.",
    },
  ];
  roomState.turn_index = 1;
  roomState.exchange_state.should_continue_current_exchange = true;
  roomState.exchange_state.awaiting_reaction_from = null;
  roomState.exchange_state.handoff_candidate_actor_ids = [];

  const facilitatorTurn = await runNextRuntimeActorTurnFromState(
    roomState,
    new AdapterBackedResponder(new MockModelAdapter()),
    {
      facilitator_mode: "local",
    },
  );

  assert.equal(facilitatorTurn.turn_log.selected_speaker, "mika");
  assert.equal(facilitatorTurn.turn_log.agent_output_summary.response_transport, "local-facilitator");
  assert.equal(facilitatorTurn.turn_log.layer_trace.response_layer, "local-facilitator");
});

test("local opening and local facilitator are localized for japanese sessions", async () => {
  const initialized = initializeSession("local-opening-ja-test", "ja");
  const started = startSession(initialized.room_state, "始めます");
  assert.equal(started.accepted, true);

  const openingTurn = await runNextRuntimeActorTurnFromState(started.room_state, new AdapterBackedResponder(new MockModelAdapter()), {
    opening_mode: "local",
  });
  assert.match(openingTurn.room_state.recent_transcript.at(-1)?.text ?? "", /今日のゴール/);

  const roomState = createInitialRoomState("local-facilitator-ja-test", "ja");
  roomState.scene_phase = "discussion";
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "player",
      speaker_name: "Player",
      turn_owner: "player",
      text: "少し整理したいです。",
    },
  ];
  roomState.turn_index = 1;
  roomState.exchange_state.should_continue_current_exchange = true;
  roomState.exchange_state.awaiting_reaction_from = null;
  roomState.exchange_state.handoff_candidate_actor_ids = [];

  const facilitatorTurn = await runNextRuntimeActorTurnFromState(
    roomState,
    new AdapterBackedResponder(new MockModelAdapter()),
    { facilitator_mode: "local" },
  );

  assert.match(facilitatorTurn.room_state.recent_transcript.at(-1)?.text ?? "", /まずは一人が直接答えてから広げましょう|論点をはっきりさせたい/);
});

test("facilitator prompt includes topic depth, close readiness, and parked topics", () => {
  const roomState = createInitialRoomState("facilitator-prompt-rich-state");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    label: "Ownership and sponsorship",
    depth: 3,
  };
  roomState.close_readiness = {
    ready: true,
    reason: "exchange-resolved-enough",
  };
  roomState.parking_lot = [
    {
      topic_id: "topic-parked",
      label: "Support boundary",
      parked_at_turn: 4,
    },
  ];
  roomState.exchange_state = {
    ...roomState.exchange_state,
    should_continue_current_exchange: false,
    awaiting_reaction_from: null,
    handoff_candidate_actor_ids: [],
  };
  roomState.recent_transcript = [
    {
      turn_index: 4,
      speaker_id: "exec",
      speaker_name: "Aki Tanaka",
      turn_owner: "initiating_actor",
      text: "That helps. I can react to that as a business direction.",
    },
  ];

  const preparedTurn = prepareNextRuntimeTurn(roomState);
  assert.equal(preparedTurn.decision.owner, "facilitator");
  assert.match(preparedTurn.prompt_text, /Active topic depth: 3/);
  assert.match(preparedTurn.prompt_text, /Close readiness: ready \(exchange-resolved-enough\)/);
  assert.match(preparedTurn.prompt_text, /Parked topics:/);
  assert.match(preparedTurn.prompt_text, /Support boundary/);
});

test("state changes and turn log expose topic deepening details", () => {
  const roomState = createInitialRoomState("topic-observability");
  roomState.scene_phase = "discussion";
  roomState.active_topic = {
    ...roomState.active_topic,
    topic_type: "support-model",
    depth: 1,
    label: "Support boundary",
  };

  const nextState = applyTurnOutcome(roomState, {
    speaker_id: "player",
    speaker_name: "Player",
    turn_owner: "player",
    text: "We should keep the onboarding support boundary narrow so platform does not absorb exceptions or quiet operational work.",
  });

  const stateChanges = computeStateChanges(roomState, nextState);
  assert.deepEqual((stateChanges.topic_transition as Record<string, unknown>).depth_before, 1);
  assert.deepEqual((stateChanges.topic_transition as Record<string, unknown>).depth_after, 2);
  assert.equal((stateChanges.topic_transition as Record<string, unknown>).reason, "same-topic-deepening");
});

test("visible transcript renders clean blocks without orchestration wrapper text", () => {
  const initialized = initializeSession("presentation-boundary-test");
  const started = startSession(initialized.room_state, "Start");
  const afterPlayerMessage = acceptPlayerMessage(started.room_state, "We should begin with one narrow onboarding path.");
  const visible = renderVisibleTranscript({
    initializationBrief: initialized.initialization_brief,
    transcriptTurns: afterPlayerMessage.recent_transcript,
  });

  assert.match(visible, /Situation Brief/);
  assert.match(visible, /Player: We should begin with one narrow onboarding path\./);
  assert.equal(hasInitializationWrapperLeakage(visible), false);
  assert.equal(hasOrchestrationTextVisible(visible), false);
});

test("closing facilitator turn transitions meeting to post-game and local evaluator starts after close", async () => {
  const responder = new AdapterBackedResponder(new MockModelAdapter());
  const roomState = createInitialRoomState("closing-boundary-test");
  roomState.scene_phase = "discussion";
  roomState.close_readiness = {
    ready: true,
    reason: "bounded-next-step-visible",
  };
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "player",
      speaker_name: "Player",
      turn_owner: "player",
      text: "I think we have enough to close with one bounded next step.",
    },
  ];

  const closingTurn = await runNextRuntimeActorTurnFromState(roomState, responder, {
    opening_mode: "responder",
  });

  assert.equal(closingTurn.turn_log.selected_speaker, "mika");
  assert.equal(closingTurn.turn_log.intervention_reason, "closing-transition");
  assert.equal(closingTurn.room_state.scene_phase, "post-game");

  const evaluation = evaluateIfSessionClosed(closingTurn.room_state, {
    scenario: closingTurn.room_state.session_setup.scenario,
    role: "Player",
  });

  assert.ok(evaluation);
  assert.equal(evaluation?.prose_shaping_mode, "local-first");
});

test("local evaluator builds evidence packet only after close", () => {
  const roomState = createInitialRoomState("local-evaluator-test");
  roomState.scene_phase = "post-game";
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "mika",
      speaker_name: "Mika",
      turn_owner: "facilitator",
      text: "Thanks everyone. We will close here.",
    },
  ];

  const evaluation = evaluateClosedSessionLocally(roomState, {
    scenario: roomState.session_setup.scenario,
    role: "Player",
  });

  assert.equal(evaluation.evidence_packet.scene_phase_at_close, "post-game");
  assert.equal(evaluation.evidence_packet.closing_turn?.speaker_id, "mika");
  assert.match(formatReflectionReport(evaluation.reflection_report), /Structural Progress: `/);
});

test("session driver enters live session after a valid start signal", async () => {
  const roomState = createInitialRoomState("session-driver-accept-test");
  roomState.scene_phase = "discussion";
  roomState.active_speaker = "exec";
  roomState.exchange_state.initiating_actor_id = "exec";
  roomState.recent_transcript = [
    {
      turn_index: 1,
      speaker_id: "player",
      speaker_name: "Player",
      turn_owner: "player",
      text: "I want to start with one onboarding path rather than a broad platform promise.",
    },
  ];

  const responder = new AdapterBackedResponder(new MockModelAdapter());
  const result = await runSessionFromPlayerStart(roomState, "Start", responder, 1);

  assert.equal(result.accepted, true);
  assert.equal(result.rejection_reason, null);
  assert.equal(result.live_results.length, 1);
  assert.ok(result.live_results[0]?.turn_log.selected_speaker);
  assert.ok(
    ["local-opening", "local-facilitator", "responder"].includes(
      String(result.live_results[0]?.turn_log.agent_output_summary.delivery_mode),
    ),
  );
});

test("initial opening turn is owned by the facilitator before player articulation", () => {
  const roomState = createInitialRoomState("opening-turn-test");
  const preparedTurn = prepareNextRuntimeTurn(roomState);

  assert.equal(preparedTurn.decision.owner, "facilitator");
  assert.equal(preparedTurn.decision.speaker_id, "mika");
  assert.equal(preparedTurn.decision.selection_reason, "facilitator-intervention");
  assert.equal(preparedTurn.decision.intervention_reason, "session-opening");
});

test("session opening is rendered locally instead of through the responder", async () => {
  const roomState = createInitialRoomState("local-opening-test");
  const responder = new AdapterBackedResponder(new MockModelAdapter());
  const result = await runSessionFromPlayerStart(roomState, "Let's start", responder, 2);
  const openingTurn = result.live_results[0]?.turn_log;

  assert.ok(openingTurn);
  assert.equal(openingTurn?.selected_speaker, "mika");
  assert.equal(openingTurn?.agent_output_summary.delivery_mode, "local-opening");
  assert.match(String(openingTurn?.agent_output_summary.text_preview), /Thanks everyone for making time/);
  assert.equal(openingTurn?.layer_trace.response_layer, "local-opening");
});

test("participants receive session-specific setup during initialization", () => {
  const roomState = createInitialRoomState("agent-setup-test");
  const facilitator = roomState.participant_states.find((participant) => participant.participant_id === "mika");
  const platform = roomState.participant_states.find((participant) => participant.participant_id === "platform");

  assert.ok(facilitator?.session_setup);
  assert.match(facilitator?.session_setup?.likely_first_move ?? "", /open the workshop briefly/i);
  assert.ok(platform?.session_setup);
  assert.match(platform?.session_setup?.current_pressure_seed ?? "", /cannot silently absorb more operational or onboarding work/i);
});

test("evaluator returns fixed report shape with primary x/5 structural result", async () => {
  const result = await runScriptedFixture(
    SCRIPTED_SESSION_FIXTURE,
    "test-evaluator-fixture",
    createScriptedSessionInitialState(),
  );

  const finalState = result.results.at(-1)?.room_state ?? createInitialRoomState("fallback");
  const report = evaluateSession(finalState, {
    scenario: "Runtime Test Scenario",
    role: "Player",
    date: "2026-03-20",
    session_mode: "brainstorming workshop",
  });
  const formatted = formatReflectionReport(report);

  assert.match(report.structural_progress, /^[1-5]\/5$/);
  assert.ok(["Stable", "Strained", "Drifting", "Failed"].includes(report.structural_result));
  assert.equal(report.structural_aspects.length, 5);
  assert.deepEqual(
    report.structural_aspects.map((aspect) => aspect.aspect),
    ["Investment", "Adoption", "Interfaces", "Operations", "Measurement"],
  );
  assert.equal(
    Number(report.structural_progress.split("/")[0]),
    report.structural_aspects.reduce((total, aspect) => total + aspect.score, 0),
  );
  assert.match(formatted, /## 2\. Evaluation Summary/);
  assert.match(formatted, /Structural Progress: `\d\/5`/);
  assert.match(formatted, /Aspect Checks:/);
  assert.match(formatted, /Investment: `\d` - /);
  assert.match(formatted, /## 7\. Suggested Next Steps/);
});

test("OpenAI adapter can keep separate remote response chains per speaker", async () => {
  const requests: Array<Record<string, unknown>> = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
    requests.push(body);
    const responseIndex = requests.length;

    return {
      ok: true,
      json: async () => ({
        id: `resp_${responseIndex}`,
        output_text: `response ${responseIndex}`,
        status: "completed",
      }),
    } as Response;
  }) as typeof fetch;

  try {
    const adapter = new OpenAIResponsesAdapter({
      apiKey: "test-key",
      conversationMode: "per-speaker-response-chain",
    });

    await adapter.generate({
      session_id: "session-1",
      speaker_id: "mika",
      turn_owner: "facilitator",
      selection_reason: "session-opening",
      prompt_input: {},
      prompt_text: "Opening prompt",
    });
    await adapter.generate({
      session_id: "session-1",
      speaker_id: "exec",
      turn_owner: "initiating_actor",
      selection_reason: "stakeholder-reaction",
      prompt_input: {},
      prompt_text: "Exec prompt",
    });
    await adapter.generate({
      session_id: "session-1",
      speaker_id: "mika",
      turn_owner: "facilitator",
      selection_reason: "clarify-turn-owner",
      prompt_input: {},
      prompt_text: "Follow-up prompt",
    });

    assert.equal(requests.length, 3);
    assert.equal(requests[0].previous_response_id, undefined);
    assert.equal(requests[1].previous_response_id, undefined);
    assert.equal(requests[2].previous_response_id, "resp_1");
    assert.equal((requests[2].metadata as Record<string, unknown>).runtime_speaker_id, "mika");

    const followUp = await adapter.generate({
      session_id: "session-1",
      speaker_id: "mika",
      turn_owner: "facilitator",
      selection_reason: "clarify-turn-owner",
      prompt_input: {},
      prompt_text: "Third Mika prompt",
    });

    assert.equal((followUp.metadata as Record<string, unknown>).conversation_mode, "per-speaker-response-chain");
    assert.equal((followUp.metadata as Record<string, unknown>).previous_response_id, "resp_3");
    assert.equal((followUp.metadata as Record<string, unknown>).response_chain_key, "session-1:mika");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
