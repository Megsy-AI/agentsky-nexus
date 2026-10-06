import { useEffect, useRef } from "react";
import type { Location, NavigateFunction } from "react-router-dom";
import { AGENT_CREATION_REQUEST } from "@/lib/agentsky/agentProposal";

/** Start the guided setup only after auth is ready, in the original chat. */
export function useAgentCreationEntry(userId: string | null, location: Location, navigate: NavigateFunction, send: (text: string) => void) {
  const consumed = useRef(false);
  useEffect(() => {
    if (!userId || consumed.current || !(location.state as { agentCreation?: boolean } | null)?.agentCreation) return;
    consumed.current = true;
    navigate("/chat", { replace: true, state: {} });
    send(AGENT_CREATION_REQUEST);
  }, [userId, location.state, navigate, send]);
}