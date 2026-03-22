import type { RoomState, TurnOutcome } from "../state/types.ts";

function extractPlayerName(roomState: RoomState): string {
  const player = roomState.participant_states.find((participant) => participant.participant_id === "player");
  return player?.display_name ?? "Player";
}

function isJapanese(roomState: RoomState): boolean {
  return roomState.language.startsWith("ja");
}

export function createLocalOpeningOutcome(roomState: RoomState): TurnOutcome {
  const facilitator = roomState.participant_states.find((participant) => participant.participant_id === "mika");
  const facilitatorName = facilitator?.display_name ?? "Mika";
  const playerName = extractPlayerName(roomState);

  return {
    speaker_id: "mika",
    speaker_name: facilitatorName,
    turn_owner: "facilitator",
    text: isJapanese(roomState)
      ? [
          `今日はありがとうございます。${roomState.session_setup.facilitator_opening_frame}。`,
          `今日のゴールは、${roomState.session_setup.meeting_goal}ことです。`,
          `${playerName}さん、どこから始めるのがよさそうか、まず考えを共有してもらえますか。そこから皆で反応していきましょう。`,
        ].join("")
      : [
          `Thanks everyone for making time. ${roomState.session_setup.facilitator_opening_frame}.`,
          `Today's goal is to ${roomState.session_setup.meeting_goal}.`,
          `${playerName}, could you share where you think we should start, and we can react from there?`,
        ].join(" "),
  };
}
