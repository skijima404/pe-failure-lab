import type { RoomState } from "../state/types.ts";
import type {
  ProposalReactionCandidate,
  ProposalSidecarContext,
  ProposalSidecarPacket,
  ProposalSidecarResult,
} from "./types.ts";

function scoreParticipant(packet: ProposalSidecarPacket, participantId: string): number {
  const text = packet.player_utterance.toLowerCase();
  let score = 0;

  if (participantId === "platform" && /support|onboarding|boundary|exception|platform/i.test(text)) {
    score += 3;
  }
  if (participantId === "delivery" && /delivery|workflow|team|adopt|roadmap|sprint/i.test(text)) {
    score += 3;
  }
  if (participantId === "exec" && /business|launch|investment|scope|v0\.1|line/i.test(text)) {
    score += 3;
  }

  if (packet.active_topic_type === "support-model" && participantId === "platform") {
    score += 2;
  }
  if (packet.active_topic_type === "delivery-shape" && participantId === "delivery") {
    score += 2;
  }
  if ((packet.active_topic_type === "scope-boundary" || packet.active_topic_type === "problem-framing") && participantId === "exec") {
    score += 2;
  }

  return score;
}

function buildCandidate(packet: ProposalSidecarPacket, participantId: string): ProposalReactionCandidate {
  if (participantId === "platform") {
    return {
      participant_id: participantId,
      stance: "conditional-support",
      what_is_good: "the proposal stays bounded enough to discuss as an initial platform move",
      what_is_risky: "support and exception handling may still expand invisibly if the boundary stays vague",
      what_is_missing: "the first support boundary the platform side is actually committing to",
      suggested_next_question: "What exactly does the platform side provide first, and what stays outside the offer?",
      speaker_fit: "high",
    };
  }

  if (participantId === "delivery") {
    return {
      participant_id: participantId,
      stance: "conditional-support",
      what_is_good: "the proposal sounds small enough that a team might actually try it soon",
      what_is_risky: "adoption may stall if teams still need to translate too much on their own",
      what_is_missing: "what becomes simpler for the first delivery team right away",
      suggested_next_question: "What becomes easier for one delivery squad on day one if this v0.1 exists?",
      speaker_fit: "high",
    };
  }

  return {
    participant_id: "exec",
    stance: "conditional-support",
    what_is_good: "the proposal sounds bounded enough to fund and explain as a first move",
    what_is_risky: "the issue and target scope may still be too loose to justify as a launch-protecting action",
    what_is_missing: "the business line, first outcome, and reason this v0.1 matters now",
    suggested_next_question: "Which business line and visible outcome make this first move worth doing now?",
    speaker_fit: "high",
  };
}

export function generateLocalProposalSidecarResult(packet: ProposalSidecarPacket): ProposalSidecarResult {
  const orderedParticipantIds = [...packet.target_participant_ids].sort(
    (left, right) => scoreParticipant(packet, right) - scoreParticipant(packet, left),
  );

  return {
    packet_id: packet.packet_id,
    candidates: orderedParticipantIds.map((participantId) => buildCandidate(packet, participantId)),
  };
}

export function selectProposalReactionCandidate(
  roomState: RoomState,
  result: ProposalSidecarResult,
): ProposalReactionCandidate | null {
  const availableParticipants = new Set(
    roomState.participant_states.filter((participant) => participant.role_type === "stakeholder").map((participant) => participant.participant_id),
  );
  const previousStakeholderSpeaker = [...roomState.recent_transcript]
    .reverse()
    .find((turn) => turn.speaker_id !== "player" && turn.speaker_id !== "mika")?.speaker_id;
  const availableCandidates = result.candidates.filter((candidate) => availableParticipants.has(candidate.participant_id));

  if (roomState.main_session_judgment.multi_perspective_needed && previousStakeholderSpeaker) {
    const alternativeCandidate = availableCandidates.find((candidate) => candidate.participant_id !== previousStakeholderSpeaker);

    if (alternativeCandidate) {
      return alternativeCandidate;
    }
  }

  return availableCandidates[0] ?? null;
}

export function buildLocalProposalSidecarContext(
  roomState: RoomState,
  packet: ProposalSidecarPacket,
): ProposalSidecarContext {
  const result = generateLocalProposalSidecarResult(packet);
  const selectedCandidate = selectProposalReactionCandidate(roomState, result);

  return {
    packet,
    result,
    selected_candidate_participant_id: selectedCandidate?.participant_id ?? null,
  };
}
