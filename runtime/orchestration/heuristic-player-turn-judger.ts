import type { RoomState } from "../state/types.ts";
import type { MeetingLayer, PlayerUtteranceType } from "../sidecars/types.ts";
import { analyzeLocalizedPlayerTurn } from "../localization/player-turn-analysis-patches.ts";

export function classifyPlayerUtteranceHeuristically(text: string, language = "en"): PlayerUtteranceType {
  const localized = analyzeLocalizedPlayerTurn(text, language);
  if (localized.utterance_type) {
    return localized.utterance_type;
  }

  const normalized = text.toLowerCase();

  if (normalized.includes("?")) {
    if (/do you mean|are you saying|to confirm|am i right/i.test(text)) {
      return "confirmation";
    }

    return "question";
  }

  if (/that is not the issue|that’s not the issue|that's not the issue|we are not there yet|not there yet/i.test(text)) {
    return "correction";
  }

  if (/i disagree|that does not work|that won't work|we should not/i.test(text)) {
    return "objection";
  }

  if (/i think we should|we should|let'?s|i propose|my proposal|start with|first move/i.test(text)) {
    return "proposal";
  }

  return "clarification";
}

export function inferMeetingLayerHeuristically(roomState: RoomState, playerText: string): MeetingLayer {
  const localized = analyzeLocalizedPlayerTurn(playerText, roomState.language);
  if (localized.meeting_layer) {
    return localized.meeting_layer;
  }

  const normalized = playerText.toLowerCase();

  if (/why now|why are we doing this|what triggered|why this initiative/i.test(normalized)) {
    return "why";
  }

  if (/how do we|how would we|implementation|roll out|deliver this|build this/i.test(normalized)) {
    return "how";
  }

  if (roomState.active_topic.topic_type === "problem-framing") {
    return "why";
  }

  if (roomState.active_topic.topic_type === "delivery-shape") {
    return "how";
  }

  return "what";
}

export function inferPlayerIntentHeuristically(
  playerText: string,
  utteranceType: PlayerUtteranceType,
  language = "en",
): string {
  const localized = analyzeLocalizedPlayerTurn(playerText, language);
  if (localized.player_intent) {
    return localized.player_intent;
  }

  const normalized = playerText.toLowerCase();

  if (utteranceType === "question" && /why now|what triggered|why this initiative/i.test(normalized)) {
    return "request-trigger-alignment";
  }

  if (utteranceType === "correction" && /issue|problem/i.test(normalized)) {
    return "reframe-the-issue";
  }

  if (utteranceType === "proposal" && /start with|first move|v0\.1|narrow/i.test(normalized)) {
    return "propose-bounded-first-move";
  }

  if (utteranceType === "confirmation") {
    return "confirm-current-understanding";
  }

  if (utteranceType === "objection") {
    return "challenge-current-direction";
  }

  if (utteranceType === "question") {
    return "request-role-specific-explanation";
  }

  return "clarify-current-layer";
}

export function inferMultiPerspectiveNeededHeuristically(
  playerText: string,
  utteranceType: PlayerUtteranceType,
  language = "en",
): boolean {
  const localized = analyzeLocalizedPlayerTurn(playerText, language);
  if (localized.multi_perspective_needed !== undefined) {
    return localized.multi_perspective_needed;
  }

  const normalized = playerText.toLowerCase();

  if (
    /(instead|rather|alternative|another option|what about|why not|wouldn'?t it be better|call it|recommend|suggest)/i.test(
      normalized,
    )
  ) {
    return true;
  }

  if (
    utteranceType === "proposal" &&
    /(v0\.1|first move|start with|bounded|narrow|pilot|in\/out|scope|boundary|owner|ownership|support|exception|business line)/i.test(
      normalized,
    )
  ) {
    return true;
  }

  if (
    (utteranceType === "objection" || utteranceType === "correction" || utteranceType === "question") &&
    /(devops|platform engineering|support model|scope|boundary|owner|ownership)/i.test(normalized)
  ) {
    return true;
  }

  return false;
}
