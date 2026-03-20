import type { PreparedTurn } from "./run-turn.ts";
import type { RoomState, ScriptedTurnOutcome, TurnOutcome } from "../state/types.ts";

export interface RuntimeResponder {
  respond(params: { roomState: RoomState; preparedTurn: PreparedTurn }): Promise<TurnOutcome> | TurnOutcome;
}

export interface ModelAdapterRequest {
  session_id: string;
  speaker_id: string;
  turn_owner: PreparedTurn["decision"]["owner"];
  selection_reason: PreparedTurn["decision"]["selection_reason"];
  prompt_input: PreparedTurn["prompt_input"];
  prompt_text: string;
}

export interface ModelAdapterResponse {
  text: string;
  metadata?: Record<string, unknown>;
}

export interface ModelAdapter {
  generate(request: ModelAdapterRequest): Promise<ModelAdapterResponse> | ModelAdapterResponse;
}

export class ScriptedResponder implements RuntimeResponder {
  private readonly scriptedOutcomes: ScriptedTurnOutcome[];

  constructor(scriptedOutcomes: ScriptedTurnOutcome[]) {
    this.scriptedOutcomes = [...scriptedOutcomes];
  }

  respond(): TurnOutcome {
    const next = this.scriptedOutcomes.shift();
    if (!next) {
      throw new Error("No scripted turn outcome available.");
    }

    return next;
  }
}

export class AdapterBackedResponder implements RuntimeResponder {
  private readonly adapter: ModelAdapter;

  constructor(adapter: ModelAdapter) {
    this.adapter = adapter;
  }

  async respond(params: { roomState: RoomState; preparedTurn: PreparedTurn }): Promise<TurnOutcome> {
    const { roomState, preparedTurn } = params;
    const request: ModelAdapterRequest = {
      session_id: roomState.session_id,
      speaker_id: preparedTurn.decision.speaker_id,
      turn_owner: preparedTurn.decision.owner,
      selection_reason: preparedTurn.decision.selection_reason,
      prompt_input: preparedTurn.prompt_input,
      prompt_text: preparedTurn.prompt_text,
    };

    const response = await this.adapter.generate(request);
    const speakerName = inferSpeakerName(roomState, preparedTurn.decision.speaker_id);

    return {
      speaker_id: preparedTurn.decision.speaker_id,
      speaker_name: speakerName,
      turn_owner: preparedTurn.decision.owner,
      text: response.text,
    };
  }
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

    return {
      text: `Mock response from ${request.speaker_id} on ${activeTopic}. Concern: ${coreConcern}. Voice cues: ${voiceCues}.`,
      metadata: {
        mock: true,
      },
    };
  }
}

export interface OpenAIResponsesAdapterOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  reasoningEffort?: "low" | "medium" | "high";
}

export class OpenAIResponsesAdapter implements ModelAdapter {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly reasoningEffort?: "low" | "medium" | "high";

  constructor(options: OpenAIResponsesAdapterOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model ?? "gpt-5";
    this.baseUrl = options.baseUrl ?? "https://api.openai.com/v1";
    this.reasoningEffort = options.reasoningEffort;
  }

  async generate(request: ModelAdapterRequest): Promise<ModelAdapterResponse> {
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAIResponsesAdapter request failed: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as {
      output_text?: string;
      id?: string;
      usage?: Record<string, unknown>;
    };

    if (!payload.output_text) {
      throw new Error("OpenAIResponsesAdapter response did not include output_text.");
    }

    return {
      text: payload.output_text,
      metadata: {
        response_id: payload.id ?? null,
        usage: payload.usage ?? null,
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

function inferSpeakerName(roomState: RoomState, speakerId: string): string {
  const participant = roomState.participant_states.find((item) => item.participant_id === speakerId);
  return participant?.display_name ?? speakerId;
}
