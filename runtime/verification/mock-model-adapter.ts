import type { ModelAdapter, ModelAdapterRequest, ModelAdapterResponse } from "../execution/runtime-responder.ts";
import { buildLocalActorResponseMetadata, renderLocalActorText } from "./local-actor-rendering.ts";

export class MockModelAdapter implements ModelAdapter {
  generate(request: ModelAdapterRequest): ModelAdapterResponse {
    return {
      text: renderLocalActorText(request),
      metadata: buildLocalActorResponseMetadata(
        request,
        "mock-model-adapter",
        "mock-backed-local-actor-rendering",
      ),
    };
  }
}
