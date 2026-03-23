import type { RuntimeResponder } from "../execution/runtime-responder.ts";
import type { TurnOutcome } from "../state/types.ts";
import { buildLocalActorResponseMetadata, renderLocalActorText } from "./local-actor-rendering.ts";

function inferSpeakerName(
  roomState: { participant_states: Array<{ participant_id: string; display_name: string }> },
  speakerId: string,
): string {
  const participant = roomState.participant_states.find((item) => item.participant_id === speakerId);
  return participant?.display_name ?? speakerId;
}

export class LocalActorResponder implements RuntimeResponder {
  respond(params: Parameters<RuntimeResponder["respond"]>[0]): TurnOutcome {
    const { roomState, preparedTurn } = params;
    const request = {
      session_id: roomState.session_id,
      speaker_id: preparedTurn.decision.speaker_id,
      turn_owner: preparedTurn.decision.owner,
      selection_reason: preparedTurn.decision.selection_reason,
      prompt_input: preparedTurn.prompt_input,
      prompt_text: preparedTurn.prompt_text,
    };

    return {
      speaker_id: preparedTurn.decision.speaker_id,
      speaker_name: inferSpeakerName(roomState, preparedTurn.decision.speaker_id),
      turn_owner: preparedTurn.decision.owner,
      text: renderLocalActorText(request),
      response_metadata: buildLocalActorResponseMetadata(
        request,
        "verification-local-actor-responder",
        "verification-local-actor-rendering",
      ),
    };
  }
}
