import type { TurnOutcome } from "../state/types.ts";

export type TurnDeliveryMode = "local-opening" | "local-facilitator" | "responder";

export function summarizePromptInput(
  promptInput: unknown,
  promptText: string,
  deliveryMode: TurnDeliveryMode,
): Record<string, unknown> {
  const promptLines = promptText.split("\n").map((line) => line.trim()).filter(Boolean);
  const promptExcerpt = promptLines.slice(0, 14).join("\n");

  if (!promptInput || typeof promptInput !== "object") {
    return {
      kind: "unknown",
      delivery_mode: deliveryMode,
      prompt_text_preview: promptText.slice(0, 180),
      prompt_text_excerpt: promptExcerpt,
    };
  }

  const record = promptInput as Record<string, unknown>;
  return {
    delivery_mode: deliveryMode,
    speaker_id: record.speaker_id ?? null,
    turn_role: record.turn_role ?? null,
    active_topic:
      typeof record.active_topic === "object" && record.active_topic
        ? (record.active_topic as Record<string, unknown>).label ?? null
        : record.active_topic ?? null,
    transition_goal: record.transition_goal ?? null,
    runtime_persona_core_concern:
      record.runtime_persona && typeof record.runtime_persona === "object"
        ? ((record.runtime_persona as Record<string, unknown>).core_concern ?? null)
        : null,
    prompt_focus:
      record.runtime_persona && typeof record.runtime_persona === "object"
        ? {
            tone_summary: (record.runtime_persona as Record<string, unknown>).tone_summary ?? null,
            core_concern: (record.runtime_persona as Record<string, unknown>).core_concern ?? null,
            default_move: (record.runtime_persona as Record<string, unknown>).default_move ?? null,
            trust_threshold: (record.runtime_persona as Record<string, unknown>).trust_threshold ?? null,
          }
        : null,
    prompt_text_preview: promptText.slice(0, 180),
    prompt_text_excerpt: promptExcerpt,
  };
}

export function summarizeTurnOutcome(
  selectedSpeakerId: string,
  outcome: TurnOutcome,
  deliveryMode: TurnDeliveryMode,
): Record<string, unknown> {
  const responseMetadata =
    outcome.response_metadata && typeof outcome.response_metadata === "object" ? outcome.response_metadata : null;

  return {
    delivery_mode: deliveryMode,
    speaker_id: outcome.speaker_id,
    speaker_layer: outcome.speaker_id === "player" ? "player" : "runtime-actor",
    selected_speaker_id: selectedSpeakerId,
    text_preview: outcome.text.slice(0, 140),
    response_transport:
      typeof responseMetadata?.runtime_transport === "string"
        ? responseMetadata.runtime_transport
        : deliveryMode === "local-opening"
          ? "local-opening"
          : deliveryMode === "local-facilitator"
            ? "local-facilitator"
          : "unknown",
    response_chain:
      deliveryMode === "responder"
        ? {
            mode: responseMetadata?.conversation_mode ?? "unknown",
            previous_response_id: responseMetadata?.previous_response_id ?? null,
            response_id: responseMetadata?.response_id ?? null,
            response_chain_key: responseMetadata?.response_chain_key ?? null,
          }
        : null,
    response_metadata: responseMetadata,
  };
}
