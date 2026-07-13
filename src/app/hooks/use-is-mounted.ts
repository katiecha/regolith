import { useSyncExternalStore } from "react";

function subscribeNever() {
  return () => {};
}

// Distinguishes client-only render passes (e.g. widgets whose output can
// differ from the server, or that own a WebGL canvas) from the server/first
// paint, without introducing a hydration-mismatching state update.
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
}
