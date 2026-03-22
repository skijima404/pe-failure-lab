import type { RoomState } from "../../state/types.ts";

export interface EvaluatorPromptInput {
  final_structural_state: RoomState["structural_state"];
  transcript: RoomState["recent_transcript"];
  output_contract: "x/5-primary-structural-result";
}

export interface EvaluatorPrompt {
  input: EvaluatorPromptInput;
  prompt_text: string;
}

export function buildEvaluatorPromptInput(roomState: RoomState): EvaluatorPromptInput {
  return {
    final_structural_state: roomState.structural_state,
    transcript: roomState.recent_transcript,
    output_contract: "x/5-primary-structural-result",
  };
}

export function renderEvaluatorPrompt(input: EvaluatorPromptInput): string {
  const transcript = input.transcript.map((turn) => `Turn ${turn.turn_index} - ${turn.speaker_name}: ${turn.text}`).join("\n");

  return [
    "You are the post-game evaluator.",
    "You are not part of the live meeting.",
    "Evaluate the session relative to an early workshop phase, not a final operating-model review.",
    "",
    "Output requirements:",
    "- Primary structural result must be shown as x/5.",
    "- Draft progress should be workshop-oriented.",
    "- Reward surfacing meaningful failure signals and advancing the active strategic topic.",
    "- Do not punish the session just because later-phase detail is still open.",
    "",
    `Structural state: ${JSON.stringify(input.final_structural_state)}`,
    "",
    "Transcript:",
    transcript || "(none)",
  ].join("\n");
}

export function buildEvaluatorPrompt(roomState: RoomState): EvaluatorPrompt {
  const input = buildEvaluatorPromptInput(roomState);
  return {
    input,
    prompt_text: renderEvaluatorPrompt(input),
  };
}
