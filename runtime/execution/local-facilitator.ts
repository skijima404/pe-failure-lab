import type { PreparedRuntimeTurn } from "./prepare-runtime-turn.ts";
import type { RoomState, TurnOutcome } from "../state/types.ts";

function extractPlayerName(roomState: RoomState): string {
  const player = roomState.participant_states.find((participant) => participant.participant_id === "player");
  return player?.display_name ?? "Player";
}

function isJapanese(roomState: RoomState): boolean {
  return roomState.language.startsWith("ja");
}

export function createLocalFacilitatorOutcome(
  roomState: RoomState,
  preparedTurn: PreparedRuntimeTurn,
): TurnOutcome {
  const facilitator = roomState.participant_states.find((participant) => participant.participant_id === "mika");
  const facilitatorName = facilitator?.display_name ?? "Mika";
  const playerName = extractPlayerName(roomState);
  const interventionReason = preparedTurn.decision.intervention_reason ?? "turn-ownership-unclear";

  return {
    speaker_id: "mika",
    speaker_name: facilitatorName,
    turn_owner: "facilitator",
    text: renderLocalFacilitatorText(roomState, interventionReason, playerName),
    response_metadata: {
      runtime_transport: "local-facilitator",
      intervention_reason: interventionReason,
    },
  };
}

function renderLocalFacilitatorText(
  roomState: RoomState,
  interventionReason: string,
  playerName: string,
): string {
  if (interventionReason === "session-opening") {
    return isJapanese(roomState)
      ? [
          `今日はありがとうございます。${roomState.session_setup.facilitator_opening_frame}。`,
          `今日のゴールは、${roomState.session_setup.meeting_goal}ことです。`,
          `${playerName}さん、どこから始めるのがよさそうか、まず考えを共有してもらえますか。そこから皆で反応していきましょう。`,
        ].join("")
      : [
          `Thanks everyone for making time. ${roomState.session_setup.facilitator_opening_frame}.`,
          `Today's goal is to ${roomState.session_setup.meeting_goal}.`,
          `${playerName}, could you share where you think we should start, and we can react from there?`,
        ].join(" ");
  }

  if (interventionReason === "closing-transition") {
    return isJapanese(roomState)
      ? "ここまでで、ひとまず区切るだけの材料は揃いました。オーナーと次の確認ポイントを明確にして、この論点はいったん閉じましょう。"
      : "We have enough to lock a bounded checkpoint. Let’s close this topic with the owner and next review point made explicit.";
  }

  if (interventionReason === "exchange-settled") {
    return isJapanese(roomState)
      ? "この論点はいったん整理できたと思います。もし重要な未解決が一つだけ残っているならそれを挙げてください。なければ次に進みましょう。"
      : "That gives us enough to mark this point as tentatively settled. If something material is still open, name that one item; otherwise we can move on.";
  }

  if (interventionReason === "pile-on-risk") {
    return isJapanese(roomState)
      ? "いったん反応は一つずつにしましょう。論点を積み増す前に、まず一つ明確な応答を確認したいです。"
      : "Let’s keep this to one reaction at a time. I want one clear response before we stack more concerns.";
  }

  if (interventionReason === "topic-drift-risk") {
    return isJapanese(roomState)
      ? "少し論点が広がってきています。次の判断境界が使える形になるまでは、いまの話題に留まりましょう。"
      : "We’re starting to drift. Let’s stay with the current topic long enough to make the next decision boundary usable.";
  }

  return isJapanese(roomState)
    ? "論点をはっきりさせたいので、まずは一人が直接答えてから広げましょう。"
    : "Let’s keep the thread clear. I want one person to answer directly before we widen this.";
}
