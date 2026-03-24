export type PlayReadSurfaceMode = "broad" | "narrow";

export function resolvePlayReadSurfaceMode(): PlayReadSurfaceMode {
  const value = process.env.PLAY_NARROW_CONTEXT?.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes" ? "narrow" : "broad";
}
