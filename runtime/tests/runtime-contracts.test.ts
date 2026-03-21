import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import { evaluateSession, formatReflectionReport } from "../evaluation/report.ts";
import { buildInitializationBrief, formatInitializationBrief, isStartSignal } from "../execution/initialization.ts";
import { MockModelAdapter, AdapterBackedResponder } from "../execution/model-client.ts";
import { prepareNextTurn } from "../execution/run-turn.ts";
import { runSessionFromPlayerStart } from "../execution/session-driver.ts";
import { loadDefaultSceneSetup } from "../scene/setup-loader.ts";
import { loadDefaultPlayerInitialization } from "../scene/player-initialization-loader.ts";
import { applyTurnOutcome } from "../state/reducers.ts";
import { createInitialRoomState } from "../state/schema.ts";
import { loadRuntimePersonaSlice } from "../personas/runtime-slice-loader.ts";
import { runScriptedFixture } from "../validation/fixture-runner.ts";
import {
  countDistinctTopicSignals,
  facilitatorOveruse,
  hasActorKnowledgeLeakage,
  hasScoringLeakage,
  hasTopicSprawl,
} from "../validation/transcript-checks.ts";
import {
  createDeliveryPressureInitialState,
  createPlatformPressureInitialState,
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
  assert.equal(result.results.length, 4);
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

test("player initialization loader reads the thin player-start asset", () => {
  const playerInitialization = loadDefaultPlayerInitialization();

  assert.match(playerInitialization.session_purpose, /one-scene workshop simulation/);
  assert.match(playerInitialization.player_goal, /bounded next step/);
  assert.equal(playerInitialization.player_not_expected_to_know.includes("hidden stakeholder thresholds"), true);
  assert.equal(playerInitialization.start_signal_examples.includes("Start"), true);
});

test("player prompt preparation includes initialization and opening guidance", () => {
  const roomState = createInitialRoomState("player-turn-test");
  roomState.exchange_state.initiating_actor_id = "exec";
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

  const preparedTurn = prepareNextTurn(roomState);

  assert.equal(preparedTurn.decision.owner, "player");
  assert.match(preparedTurn.prompt_text, /Session purpose:/);
  assert.match(preparedTurn.prompt_text, /Opening guidance:/);
  assert.match(preparedTurn.prompt_text, /do not know hidden thresholds/i);
});

test("actor prompt includes stakeholder working context and pressure background", () => {
  const roomState = createInitialRoomState("actor-context-test");
  roomState.scene_phase = "discussion";
  roomState.exchange_state.awaiting_reaction_from = "platform";

  const preparedTurn = prepareNextTurn(roomState);

  assert.equal(preparedTurn.decision.speaker_id, "platform");
  assert.match(preparedTurn.prompt_text, /Working context:/);
  assert.match(preparedTurn.prompt_text, /Day-to-day pressure:/);
  assert.match(preparedTurn.prompt_text, /actual workload, team reality, or delivery context/i);
  assert.match(preparedTurn.prompt_text, /Session role focus:/);
  assert.match(preparedTurn.prompt_text, /Current pressure seed:/);
});

test("voice separation fixtures select platform and delivery as distinct next speakers", () => {
  const platformTurn = prepareNextTurn(createPlatformPressureInitialState());
  const deliveryTurn = prepareNextTurn(createDeliveryPressureInitialState());

  assert.equal(platformTurn.decision.speaker_id, "platform");
  assert.equal(deliveryTurn.decision.speaker_id, "delivery");
  assert.match(platformTurn.prompt_text, /capacity is thin/i);
  assert.match(deliveryTurn.prompt_text, /roadmap pressure/i);
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

  assert.equal(facilitatorOveruse(facilitatorTurns), true);

  const topicSignalCount = countDistinctTopicSignals(topicDriftTurns);
  assert.equal(hasTopicSprawl(topicSignalCount), true);

  assert.equal(
    actorLeakageTurns.some((turn: { text: string }) => hasActorKnowledgeLeakage(turn.text) || hasScoringLeakage(turn.text)),
    true,
  );
});

test("initialization brief exposes player-facing start guidance without spoiler logic", () => {
  const roomState = createInitialRoomState("initialization-brief-test");
  const brief = buildInitializationBrief(roomState);
  const formatted = formatInitializationBrief(brief);

  assert.match(formatted, /Session Initialization/);
  assert.match(formatted, /Workshop Goal:/);
  assert.match(formatted, /You Are Not Expected To Know:/);
  assert.equal(formatted.includes("hidden stakeholder thresholds"), true);
  assert.equal(isStartSignal("Start", roomState), true);
  assert.equal(isStartSignal("Let's start", roomState), true);
  assert.equal(isStartSignal("Go ahead", roomState), false);
});

test("session driver blocks live execution until a valid start signal appears", async () => {
  const roomState = createInitialRoomState("session-driver-reject-test");
  const responder = new AdapterBackedResponder(new MockModelAdapter());

  const result = await runSessionFromPlayerStart(roomState, "Go ahead", responder, 2);

  assert.equal(result.accepted, false);
  assert.equal(result.rejection_reason, "start-signal-required");
  assert.equal(result.live_results.length, 0);
  assert.match(result.initialization_brief, /Session Initialization/);
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
  assert.ok(["local-opening", "responder"].includes(String(result.live_results[0]?.turn_log.agent_output_summary.delivery_mode)));
});

test("initial opening turn is owned by the facilitator before player articulation", () => {
  const roomState = createInitialRoomState("opening-turn-test");
  const preparedTurn = prepareNextTurn(roomState);

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
  assert.match(formatted, /## 2\. Evaluation Summary/);
  assert.match(formatted, /Structural Progress: `\d\/5`/);
  assert.match(formatted, /## 7\. Suggested Next Steps/);
});
