import type { ModelAdapter, ModelAdapterRequest, ModelAdapterResponse } from "./runtime-responder.ts";

interface SidecarReactionCandidateLike {
  stance?: unknown;
  what_is_good?: unknown;
  what_is_risky?: unknown;
  what_is_missing?: unknown;
  suggested_next_question?: unknown;
}

export class MockModelAdapter implements ModelAdapter {
  generate(request: ModelAdapterRequest): ModelAdapterResponse {
    const prompt = request.prompt_input as Record<string, unknown>;
    const runtimePersona =
      prompt && typeof prompt === "object" && "runtime_persona" in prompt
        ? (prompt.runtime_persona as Record<string, unknown> | null)
        : null;

    const voiceCues = Array.isArray(runtimePersona?.voice_cues) ? runtimePersona.voice_cues.join(", ") : "neutral";
    const coreConcern =
      typeof runtimePersona?.core_concern === "string" ? runtimePersona.core_concern : "the current topic";
    const activeTopic =
      prompt && typeof prompt === "object" && "active_topic" in prompt
        ? extractTopicLabel(prompt.active_topic)
        : "the active topic";
    const sidecarReactionCandidate =
      prompt && typeof prompt === "object" && "sidecar_reaction_candidate" in prompt
        ? (prompt.sidecar_reaction_candidate as SidecarReactionCandidateLike | null)
        : null;

    if (sidecarReactionCandidate) {
      const rendered = renderSidecarCandidateResponse(request.speaker_id, sidecarReactionCandidate);
      if (rendered) {
        return {
          text: rendered,
          metadata: {
            mock: true,
            runtime_transport: "mock-model-adapter",
            rendering_mode: "sidecar-aware-local-rendering",
          },
        };
      }
    }

    return {
      text: `Mock response from ${request.speaker_id} on ${activeTopic}. Concern: ${coreConcern}. Voice cues: ${voiceCues}.`,
      metadata: {
        mock: true,
        runtime_transport: "mock-model-adapter",
        rendering_mode: "generic-mock-rendering",
      },
    };
  }
}

function renderSidecarCandidateResponse(
  speakerId: string,
  candidate: SidecarReactionCandidateLike,
): string | null {
  const stance = typeof candidate.stance === "string" ? candidate.stance : null;
  const good = typeof candidate.what_is_good === "string" ? candidate.what_is_good : null;
  const risky = typeof candidate.what_is_risky === "string" ? candidate.what_is_risky : null;
  const missing = typeof candidate.what_is_missing === "string" ? candidate.what_is_missing : null;
  const nextQuestion = typeof candidate.suggested_next_question === "string" ? candidate.suggested_next_question : null;

  if (speakerId === "platform") {
    return [
      "I can work with that direction if we keep it tight.",
      risky ? `The risk is ${risky}.` : null,
      missing ? `What I still need is ${missing}.` : null,
      nextQuestion,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (speakerId === "delivery") {
    return [
      good ? `That helps if ${good}.` : "That could help if the first step is usable quickly.",
      risky ? `The delivery risk is ${risky}.` : null,
      nextQuestion,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (speakerId === "exec") {
    return [
      good ? `That sounds credible if ${good}.` : "That sounds credible enough for a first move.",
      missing ? `What I still need is ${missing}.` : null,
      nextQuestion,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (stance || good || risky || missing || nextQuestion) {
    return [good, risky, missing, nextQuestion].filter((value): value is string => Boolean(value)).join(" ");
  }

  return null;
}

function extractTopicLabel(activeTopic: unknown): string {
  if (typeof activeTopic === "string") {
    return activeTopic;
  }

  if (activeTopic && typeof activeTopic === "object") {
    const record = activeTopic as Record<string, unknown>;
    if (typeof record.label === "string") {
      return record.label;
    }
  }

  return "the active topic";
}
