/** English agent directory; setup happens in the original main-agent conversation. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowUpRight, Search, Lock, RotateCw } from "lucide-react";
import { agentApi, type AgentInfo } from "@/lib/agentsky/client";
import { useWorkspaceStore, workspace, loadWorkspace } from "@/lib/agentsky/store";
import { AgentShell } from "@/components/agent/AgentShell";
import { AgentOrb } from "@/components/agent/AgentOrb";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/common/SEOHead";
import { canUseAgent, isOctoberOfferActive, OCTOBER_OFFER_END } from "@/lib/octoberOffer";

export function AgentsPage() {
  const nav = useNavigate();
  const { agents, ready, error, sessions, tier } = useWorkspaceStore();
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);
  const setup = () => nav("/chat", { state: { agentCreation: true } });
  const filtered = agents.filter(a => `${a.name} ${a.description}`.toLowerCase().includes(query.toLowerCase()));
  const personal = filtered.filter(a => !a.isTemplate);
  const catalogue = filtered.filter(a => a.isTemplate && !a.mediaOnly);
  const media = filtered.filter(a => a.mediaOnly);
  const item = (a: AgentInfo) => {
    const active = sessions.filter(s => s.agentId === a.id && s.status === "running").length;
    const locked = !a.isDefault && !canUseAgent(tier, !!a.mediaOnly, now);
    return <li key={a.id} className="flex min-h-28 flex-wrap items-center gap-4 border-b border-border py-5 last:border-0 sm:flex-nowrap">
      <AgentOrb size={48} color={a.color} state={active ? "tool" : "idle"} />
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-semibold break-words">{a.name}</h3>{a.isDefault && <span className="text-xs text-muted-foreground">Main agent</span>}</div><p className="mt-1 max-w-lg text-sm leading-relaxed text-muted-foreground">{a.mediaOnly ? "Image and video creation" : a.description || (a.isDefault ? "Your everyday partner for research, writing and getting work done." : "Personal AI agent")}</p>{active > 0 && <p className="mt-2 text-xs text-muted-foreground">{active} active conversation{active > 1 ? "s" : ""}</p>}</div>
      <div className="ms-auto flex shrink-0 items-center gap-2">{!a.isDefault && !a.isTemplate && <Button variant="ghost" size="icon-sm" aria-label={`Delete ${a.name}`} title={`Delete ${a.name}`} disabled={deleting === a.id} onClick={async () => { if (!confirm(`Delete ${a.name}? Your conversations will not be deleted.`)) return; setDeleting(a.id); setDeleteError(null); try { await agentApi.deleteAgent(a.id); workspace.removeAgent(a.id); } catch(e) { setDeleteError(e instanceof Error ? e.message : "Could not delete agent"); } finally { setDeleting(null); } }}><Trash2 size={16} /></Button>}<Button variant="neutral" size="sm" onClick={() => nav(locked ? "/pricing" : `/chat?agent=${encodeURIComponent(a.id)}`)}>{locked ? <><Lock size={14} />Pro</> : <>Open chat<ArrowUpRight size={14} /></>}</Button></div>
    </li>;
  };
  return <div data-no-translate dir="ltr"><AgentShell lang="en" title="Agents" actions={<Button variant="neutral" size="sm" onClick={setup}><Plus size={16} />Add agent</Button>}>
    <SEOHead locale="en" path="/agents" title="Your agents" description="Your personal Megsy AI agents, specialist agents and conversations." />
    <div className="flex-1 overflow-y-auto px-5 py-8 md:px-12 md:py-12"><div className="mx-auto max-w-4xl">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-xs font-medium uppercase text-muted-foreground">Your workspace</p><h1 className="mt-3 text-3xl font-semibold">Meet your agents.</h1><p className="mt-3 text-sm text-muted-foreground">{agents.length} agents · {sessions.filter(s => s.status === "running").length} working now</p></div><label className="flex h-10 items-center gap-3 border-b border-border sm:w-60"><Search size={16} className="text-muted-foreground" /><input aria-label="Search agents" placeholder="Search agents" value={query} onChange={e => setQuery(e.target.value)} className="min-w-0 w-full bg-transparent text-sm outline-none" /></label></div>
      {isOctoberOfferActive(now) && <div className="mt-8 border-y border-border py-3 text-sm text-muted-foreground">October 6 celebration — non-media agents are free until {new Date(OCTOBER_OFFER_END).toLocaleTimeString("en-GB", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit" })} Cairo time, October 7.</div>}
      {(error || deleteError) && <div className="mt-6 flex items-center gap-3" role="alert"><p className="text-sm text-destructive">{error || deleteError}</p><Button variant="ghost" size="icon-sm" aria-label="Retry loading agents" onClick={() => void loadWorkspace(true)}><RotateCw size={16} /></Button></div>}
      {!ready && <div className="flex items-center gap-3 py-16" role="status"><AgentOrb size={36} state="awakening" /><span className="text-sm text-muted-foreground">Loading your agents…</span></div>}
      {[{ title: "Your agents", list: personal }, { title: "Specialists", list: catalogue }, { title: "Images & video", list: media }].map(group => group.list.length ? <section key={group.title} className="mt-10"><h2 className="border-b border-border pb-3 text-xs font-semibold uppercase text-muted-foreground">{group.title}</h2><ul>{group.list.map(item)}</ul></section> : null)}
      {ready && !filtered.length && !error && <div className="py-16 text-center"><p className="text-sm text-muted-foreground">{query ? "No matching agents." : "Your next agent starts with a conversation."}</p><Button variant="neutral" className="mt-5" onClick={setup}><Plus size={16} />Add agent</Button></div>}
    </div></div>
  </AgentShell></div>;
}
export function AgentNewPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/chat", { replace: true, state: { agentCreation: true } }); }, [navigate]);
  return null;
}
