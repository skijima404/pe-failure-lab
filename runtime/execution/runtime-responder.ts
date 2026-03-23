import type { PreparedRuntimeTurn } from "./prepare-runtime-turn.ts";
import type { RoomState, ScriptedTurnOutcome, TurnOutcome } from "../state/types.ts";
export { OpenAIResponsesAdapter, type OpenAIResponsesAdapterOptions } from "./openai-responses-adapter.ts";

export interface RuntimeResponder {
  respond(params: { roomState: RoomState; preparedTurn: PreparedRuntimeTurn }): Promise<TurnOutcome> | TurnOutcome;
}

export interface ModelAdapterRequest {
  session_id: string;
  speaker_id: string;
  turn_owner: PreparedRuntimeTurn["decision"]["owner"];
  selection_reason: PreparedRuntimeTurn["decision"]["selection_reason"];
  prompt_input: PreparedRuntimeTurn["prompt_input"];
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

  async respond(params: { roomState: RoomState; preparedTurn: PreparedRuntimeTurn }): Promise<TurnOutcome> {
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
      response_metadata: response.metadata,
    };
  }
}

function inferSpeakerName(roomState: RoomState, speakerId: string): string {
  const participant = roomState.participant_states.find((item) => item.participant_id === speakerId);
  return participant?.display_name ?? speakerId;
}
