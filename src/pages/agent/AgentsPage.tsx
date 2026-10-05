/** English agent directory; new agents are designed with Megsy in the original chat. */
import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Plus, Trash2, Loader2, ArrowUpRight, Search, Lock, Bot, Image, RefreshCw } from "lucide-react";
import { agentApi, type AgentInfo } from "@/lib/agentsky/client";
import { loadWorkspace, useWorkspaceStore, workspace } from "@/lib/agentsky/store";
import { AgentShell } from "@/components/agent/AgentShell";
import { AgentOrb } from "@/components/agent/AgentOrb";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import SEOHead from "@/components/common/SEOHead";

export function AgentsPage() {
  const nav = useNavigate();
  const { agents, ready, error, sessions, tier } = useWorkspaceStore();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "personal" | "media">("all");
  const [pendingDelete, setPendingDelete] = useState<AgentInfo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const filtered = useMemo(() => agents.filter((a) =>
    `${a.name} ${a.description}`.toLowerCase().includes(query.toLowerCase()) &&
    (tab === "all" || (tab === "media" ? a.mediaOnly : !a.isDefault && !a.isTemplate && !a.mediaOnly)),
  ).sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || Number(Boolean(a.mediaOnly)) - Number(Boolean(b.mediaOnly)) || a.name.localeCompare(b.name)), [agents, query, tab]);
  const remove = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true); setDeleteError(null);
    try { await agentApi.deleteAgent(pendingDelete.id); workspace.removeAgent(pendingDelete.id); setPendingDelete(null); }
    catch (e) { setDeleteError(e instanceof Error ? e.message : "Could not delete agent. Please try again."); }
    finally { setDeleting(false); }
  };
  return <AgentShell lang="en" title="Workspace / Agents">
    <SEOHead path="/agents" title="Agents — Megsy AI" description="Your personal agents, Megsy and Higgsfield. Create a new agent with Megsy and approve it in your conversation." />
    <main className="flex-1 overflow-y-auto px-5 py-8 md:px-10 md:py-12" dir="ltr">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-5">
          <div><h1 className="text-3xl font-semibold leading-tight">Agents</h1><p className="mt-2 text-sm text-muted-foreground">{agents.length} agents<span className="mx-2">·</span>{sessions.filter((s) => s.status === "running").length} working now</p></div>
          <Button onClick={() => nav("/chat?create-agent=1")}><Plus />New agent</Button>
        </div>
        <div className="mb-5 flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
          <div className="flex gap-1" role="tablist" aria-label="Agent categories">
            {([['all', 'All agents'], ['personal', 'Personal'], ['media', 'Media']] as const).map(([value, label]) => <Button key={value} role="tab" aria-selected={tab === value} variant={tab === value ? "secondary" : "ghost"} size="sm" onClick={() => setTab(value)}>{label}</Button>)}
          </div>
          <label className="flex h-9 items-center gap-2 rounded-md border border-border px-3 sm:w-60"><Search className="h-4 w-4 shrink-0 text-muted-foreground" /><input aria-label="Search agents" placeholder="Search agents…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full min-w-0 bg-transparent text-sm outline-none" /></label>
        </div>
        {(error || deleteError) && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border py-3 text-sm"><p>{error || deleteError}</p>{error && <Button variant="outline" size="sm" onClick={() => void loadWorkspace(true)}><RefreshCw />Try again</Button>}</div>}
        {!ready ? <div className="flex items-center gap-3 py-16" role="status"><Loader2 className="h-5 w-5 animate-spin" /><span className="text-sm text-muted-foreground">Loading agents…</span></div> : <>
          <div className="mb-2 hidden grid-cols-[1fr_120px_140px] px-4 text-xs font-medium text-muted-foreground md:grid"><span>AGENT</span><span>STATUS</span><span className="text-end">ACTIONS</span></div>
          <ul className="divide-y divide-border">
            {filtered.map((a) => {
              const active = sessions.filter((s) => s.agentId === a.id && s.status === "running").length;
              const locked = !a.isDefault && tier !== "pro";
              return <li key={a.id} className="grid items-center gap-x-4 gap-y-4 py-6 md:grid-cols-[1fr_120px_140px] md:px-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">{a.isDefault ? <AgentOrb size={32} color={a.color} state={active ? "tool" : "idle"} /> : a.mediaOnly ? <Image className="h-5 w-5 text-foreground" /> : <Bot className="h-5 w-5 text-foreground" />}</div>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="break-words text-base font-medium">{a.name}</h2><span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{a.isDefault ? "PRIMARY" : a.mediaOnly ? "IMAGES & VIDEO" : a.isTemplate ? "TEMPLATE" : "PERSONAL"}</span></div><p className="mt-1 max-w-lg break-words text-sm leading-relaxed text-muted-foreground">{a.description || (a.isDefault ? "Your everyday assistant" : a.mediaOnly ? "Image and video creation" : "Personal assistant")}</p></div>
                </div>
                <span className="ps-16 text-xs text-muted-foreground md:ps-0">{active ? `${active} working` : "Ready"}</span>
                <div className="flex items-center justify-end gap-2">
                  {!a.isDefault && !a.isTemplate && !a.mediaOnly && <Button variant="ghost" size="icon-sm" title={`Delete ${a.name}`} aria-label={`Delete ${a.name}`} onClick={() => { setDeleteError(null); setPendingDelete(a); }}><Trash2 /></Button>}
                  <Button variant="outline" size="sm" onClick={() => nav(locked ? "/pricing" : `/chat?agent=${encodeURIComponent(a.id)}`)}>{locked ? <><Lock />Pro</> : <>Open<ArrowUpRight /></>}</Button>
                </div>
              </li>;
            })}
          </ul>
          {!filtered.length && !error && <div className="flex flex-col items-center gap-3 border-b border-border py-16 text-center"><Bot className="h-8 w-8 text-muted-foreground" /><h2 className="text-base font-medium">{query ? "No matching agents" : "No agents here yet"}</h2><Button variant="outline" onClick={() => query ? setQuery("") : nav("/chat?create-agent=1")}>{query ? "Clear search" : "New agent"}</Button></div>}
        </>}
      </div>
    </main>
    <ConfirmDialog open={Boolean(pendingDelete)} title={`Delete ${pendingDelete?.name ?? "agent"}?`} description={deleteError || "This agent will be removed from your workspace."} confirmLabel="Delete agent" cancelLabel="Cancel" tone="neutral" loading={deleting} onCancel={() => { if (!deleting) setPendingDelete(null); }} onConfirm={() => void remove()} />
  </AgentShell>;
}

export function AgentNewPage() { return <Navigate to="/chat?create-agent=1" replace />; }
