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
    if (roomState.close_readiness.reason === "loop-threshold-reached") {
      return isJapanese(roomState)
        ? "同じ論点を少し回り始めているので、今日はここで時間を切りましょう。未解決は残りますが、次に誰がどこを詰めるかだけ置いて終えます。"
        : "We are starting to loop on the same point, so let’s time-box it here. We can leave it unresolved and just name who needs to tighten the next piece.";
    }

    if (roomState.close_readiness.reason === "hard-turn-limit-reached") {
      return isJapanese(roomState)
        ? "ここで一度ハードストップにします。合意まで持っていくより、残った論点と次の確認先を明確にして切ります。"
        : "We are at the hard stop for this session. Rather than force agreement, let’s stop with the remaining open points and the next place to check them.";
    }

    return isJapanese(roomState)
      ? "ここまでで、ひとまず区切るだけの材料は揃いました。オーナーと次の確認ポイントを明確にして、この論点はいったん閉じましょう。"
      : "We have enough to lock a bounded checkpoint. Let’s close this topic with the owner and next review point made explicit.";
  }

  if (interventionReason === "exchange-settled") {
    return isJapanese(roomState)
      ? "この論点はいったん整理できたと思います。もし重要な未解決が一つだけ残っているならそれを挙げてください。なければ次に進みましょう。"
      : "That gives us enough to mark this point as tentatively settled. If something material is still open, name that one item; otherwise we can move on.";
  }

  if (interventionReason === "trigger-alignment") {
    return isJapanese(roomState)
      ? [
          "はい、先に背景を短く揃えます。",
          "この活動が始まったきっかけは、案件ごとに立ち上げ方や支援依頼がばらつき、Platform 側がその都度個別対応していたことです。",
          "背景の問題は、何を共通化し、どこまでを支援範囲にするのかが曖昧なまま、Platform が中央支援窓口のように見られやすかったことです。",
          "この前提を踏まえて、どこから始めるのがよいかを置いていきましょう。",
        ].join("")
      : [
          "Yes, let me align the background first.",
          "This started because teams were repeatedly asking for similar setup and support, but each case was being handled ad hoc.",
          "The underlying issue was that the shared platform boundary stayed unclear, so the platform group was drifting toward a central help desk role.",
          "With that framing in place, let's come back to where the first usable move should be.",
        ].join(" ");
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
