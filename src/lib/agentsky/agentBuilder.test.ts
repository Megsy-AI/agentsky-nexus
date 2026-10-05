import { describe, expect, it } from "vitest";
import { parseAgentProposal, hideAgentProposal } from "./agentBuilder";
import { buildTranscript, cleanText } from "./transcript";

const draft = { name: "Travel researcher", description: "Researches trips", prompt: "Ask about budget and dates. Compare destinations." };
const envelope = `<!--megsy:agent-proposal ${JSON.stringify(draft)} -->`;
describe("conversational agent proposals", () => {
  it("accepts a complete proposal with neutral identity", () => expect(parseAgentProposal(envelope)).toEqual({ ...draft, color: "mono" }));
  it("rejects malformed, missing and oversized instructions", () => {
    expect(parseAgentProposal("<!--megsy:agent-proposal nope -->")).toBeNull();
    expect(parseAgentProposal(`<!--megsy:agent-proposal ${JSON.stringify({ name: "A" })} -->`)).toBeNull();
    expect(parseAgentProposal(`<!--megsy:agent-proposal ${JSON.stringify({ ...draft, prompt: "x".repeat(6001) })} -->`)).toBeNull();
  });
  it("hides partial and complete internal proposals while streaming", () => {
    expect(hideAgentProposal(`Review this. ${envelope}`)).toBe("Review this. ");
    expect(cleanText('Review this. <!--megsy:agent-proposal {"name":')).toBe("Review this.");
  });
  it("persists a review card in the transcript without exposing JSON", () => {
    const turns = buildTranscript([{ id: "run", type: "session.status_running" }, { id: "reply", type: "agent.message", parts: [{ type: "text", text: `Please review your agent. ${envelope}` }] }, { id: "end", type: "session.status_idle" }], "en", false);
    const turn = turns.find(t => t.type === "agent");
    expect(turn?.type === "agent" && turn.text).toBe("Please review your agent.");
    expect(turn?.type === "agent" && turn.cards).toEqual([{ kind: "agent-proposal", id: "proposal:a0", proposal: { ...draft, color: "mono" } }]);
  });
});