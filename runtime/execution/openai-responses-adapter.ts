import type { ModelAdapter, ModelAdapterRequest, ModelAdapterResponse } from "./runtime-responder.ts";

export interface OpenAIResponsesAdapterOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  reasoningEffort?: "low" | "medium" | "high";
  conversationMode?: "stateless" | "per-speaker-response-chain";
}

export class OpenAIResponsesAdapter implements ModelAdapter {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly reasoningEffort?: "low" | "medium" | "high";
  private readonly conversationMode: "stateless" | "per-speaker-response-chain";
  private readonly previousResponseIds = new Map<string, string>();

  constructor(options: OpenAIResponsesAdapterOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model ?? "gpt-5";
    this.baseUrl = options.baseUrl ?? "https://api.openai.com/v1";
    this.reasoningEffort = options.reasoningEffort;
    this.conversationMode = options.conversationMode ?? "stateless";
  }

  async generate(request: ModelAdapterRequest): Promise<ModelAdapterResponse> {
    const conversationKey = `${request.session_id}:${request.speaker_id}`;
    const previousResponseId =
      this.conversationMode === "per-speaker-response-chain"
        ? this.previousResponseIds.get(conversationKey) ?? null
        : null;
    const response = await fetch(`${this.baseUrl}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: request.prompt_text,
        reasoning: this.reasoningEffort ? { effort: this.reasoningEffort } : undefined,
        previous_response_id: previousResponseId ?? undefined,
        metadata: {
          runtime_session_id: request.session_id,
          runtime_speaker_id: request.speaker_id,
          runtime_turn_owner: request.turn_owner,
          runtime_selection_reason: request.selection_reason,
          runtime_conversation_mode: this.conversationMode,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAIResponsesAdapter request failed: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as {
      output_text?: string;
      output?: Array<{
        type?: string;
        content?: Array<{
          type?: string;
          text?: string;
        }>;
      }>;
      id?: string;
      usage?: Record<string, unknown>;
      status?: string;
    };
    const text = extractOpenAIResponseText(payload);

    if (!text) {
      throw new Error(
        `OpenAIResponsesAdapter response did not include readable text. status=${payload.status ?? "unknown"} id=${payload.id ?? "unknown"}`,
      );
    }

    if (this.conversationMode === "per-speaker-response-chain" && typeof payload.id === "string" && payload.id) {
      this.previousResponseIds.set(conversationKey, payload.id);
    }

    return {
      text,
      metadata: {
        runtime_transport: "openai-responses",
        response_id: payload.id ?? null,
        usage: payload.usage ?? null,
        status: payload.status ?? null,
        conversation_mode: this.conversationMode,
        previous_response_id: previousResponseId,
        response_chain_key: conversationKey,
      },
    };
  }
}

function extractOpenAIResponseText(payload: {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}): string | null {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  if (!Array.isArray(payload.output)) {
    return null;
  }

  const textParts = payload.output.flatMap((item) => {
    if (!Array.isArray(item.content)) {
      return [];
    }

    return item.content
      .filter((part) => part?.type === "output_text" || part?.type === "text" || typeof part?.text === "string")
      .map((part) => part.text?.trim() ?? "")
      .filter(Boolean);
  });

  return textParts.length > 0 ? textParts.join("\n").trim() : null;
}
