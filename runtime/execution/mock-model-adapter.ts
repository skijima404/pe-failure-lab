import type { ModelAdapter, ModelAdapterRequest, ModelAdapterResponse } from "./runtime-responder.ts";

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

    return {
      text: `Mock response from ${request.speaker_id} on ${activeTopic}. Concern: ${coreConcern}. Voice cues: ${voiceCues}.`,
      metadata: {
        mock: true,
        runtime_transport: "mock-model-adapter",
      },
    };
  }
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
