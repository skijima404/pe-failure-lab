import {
  buildInitializationBrief,
  formatInitializationBrief,
  isStartSignal,
} from "../../runtime/execution/initialization.ts";
import { createInitialRoomState } from "../../runtime/state/schema.ts";

async function main() {
  const roomState = createInitialRoomState("initialization-brief-session");
  const brief = buildInitializationBrief(roomState);

  console.log(formatInitializationBrief(brief));
  console.log("");
  console.log("Start Signal Check");
  console.log("------------------");
  console.log(`\"Start\" -> ${isStartSignal("Start", roomState)}`);
  console.log(`\"Let's start\" -> ${isStartSignal("Let's start", roomState)}`);
  console.log(`\"Go ahead\" -> ${isStartSignal("Go ahead", roomState)}`);
}

main().catch((error) => {
  console.error("Initialization brief harness failed.");
  console.error(error?.stack ?? error);
  process.exitCode = 1;
});
