import type { ActorPromptInput } from "../agents/actor/prompt.ts";
import type { RuntimeResponder } from "./runtime-responder.ts";
import type { TurnOutcome } from "../state/types.ts";
import { renderLocalLiveActorTurn } from "./local-live-actor-rendering.ts";

export class LocalLiveActorResponder implements RuntimeResponder {
  respond(params: Parameters<RuntimeResponder["respond"]>[0]): TurnOutcome {
    const { roomState, preparedTurn } = params;

    if (preparedTurn.decision.owner !== "initiating_actor" && preparedTurn.decision.owner !== "reacting_actor") {
      throw new Error("LocalLiveActorResponder only supports stakeholder actor turns.");
    }

    return renderLocalLiveActorTurn({
      roomState,
      promptInput: preparedTurn.prompt_input as ActorPromptInput,
      speakerId: preparedTurn.decision.speaker_id,
      turnOwner: preparedTurn.decision.owner,
    });
  }
}
