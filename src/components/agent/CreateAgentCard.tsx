import { useEffect, useState } from "react";
import { Check, Loader2, Plus, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { agentApi } from "@/lib/agentsky/client";
import { workspace } from "@/lib/agentsky/store";
import type { AgentProposal } from "@/lib/agentsky/agentBuilder";

export function CreateAgentCard({ proposal, proposalKey, disabled = false }: { proposal: AgentProposal; proposalKey: string; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    try { setCreated(localStorage.getItem(`megsy:created-agent:${proposalKey}`)); } catch { /* storage unavailable */ }
  }, [proposalKey]);
  const create = async () => {
    if (busy || created || disabled) return;
    setBusy(true); setError(null);
    try {
      const result = await agentApi.createAgent(proposal);
      workspace.addAgent(result.agent);
      setCreated(result.agent.id);
      try { localStorage.setItem(`megsy:created-agent:${proposalKey}`, result.agent.id); } catch { /* creation still succeeded */ }
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create your agent. Please try again."); }
    finally { setBusy(false); }
  };
  return <section className="max-w-[560px] rounded-lg border border-border bg-card p-5" dir="ltr" aria-label="Agent proposal">
    <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">{created ? <Check size={14} /> : <Plus size={14} />}{created ? "Agent created" : "Ready for your approval"}</div>
    <h3 className="break-words text-lg font-semibold">{proposal.name}</h3>
    <p className="mt-1 break-words text-sm text-muted-foreground">{proposal.description}</p>
    <details className="my-4 text-sm"><summary className="cursor-pointer text-muted-foreground">Instructions</summary><p className="mt-3 whitespace-pre-wrap break-words leading-relaxed">{proposal.prompt}</p></details>
    {error && <p role="alert" className="mb-3 text-sm text-foreground">{error}</p>}
    {created ? <Button variant="outline" onClick={() => navigate(`/chat?agent=${encodeURIComponent(created)}`)}>Chat with agent<ArrowUpRight /></Button> : <Button disabled={busy || disabled} onClick={() => void create()}>{busy ? <Loader2 className="animate-spin" /> : <Plus />}Create agent</Button>}
  </section>;
}