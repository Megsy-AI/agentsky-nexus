export type AgentProposal = { name: string; description: string; prompt: string; color: "mono" };

export const AGENT_BUILDER_START = "Help me create a new agent. Ask me what you need to understand its purpose before proposing it.";
export const AGENT_BUILDER_INSTRUCTIONS = `Help the user design a reusable personal Megsy agent, not execute its future job. Ask relevant questions about purpose, inputs, outputs, tone and constraints when unclear; ask more than one question if needed. Once clear, explain the proposed agent and ask the user to approve using the Create agent button. Never create an agent yourself or claim it is created. Finish a complete proposal with this exact hidden UI envelope: <!--megsy:agent-proposal {"name":"short name (2-40 chars)","description":"one line (max 140 chars)","prompt":"complete reusable instructions (max 6000 chars)"} -->. Emit the envelope only when you have enough information. It renders a review card and Create agent button. Do not show JSON or the envelope in visible prose. If revisions are requested, issue an updated proposal. Do not generate media while designing the agent. Reply in the user's language.`;

export function parseAgentProposal(text: string): AgentProposal | null {
  const match = /<!--megsy:agent-proposal\s+([\s\S]*?)-->/.exec(text);
  if (!match) return null;
  try {
    const value = JSON.parse(match[1]);
    if (typeof value.name !== "string" || typeof value.description !== "string" || typeof value.prompt !== "string") return null;
    const name = value.name.trim(), description = value.description.trim(), prompt = value.prompt.trim();
    if (name.length < 2 || name.length > 40 || description.length > 140 || !prompt || prompt.length > 6000) return null;
    return { name, description, prompt, color: "mono" };
  } catch { return null; }
}

export function hideAgentProposal(text: string): string {
  return text.replace(/<!--megsy:agent-proposal[\s\S]*?(-->|$)/g, "");
}