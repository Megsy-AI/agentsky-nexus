import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateAgentCard } from "./CreateAgentCard";
const mocks = vi.hoisted(() => ({ create: vi.fn(), add: vi.fn() }));
vi.mock("@/lib/agentsky/client", () => ({ agentApi: { createAgent: mocks.create } }));
vi.mock("@/lib/agentsky/store", () => ({ workspace: { addAgent: mocks.add } }));
const proposal = { name: "Researcher", description: "Research assistant", prompt: "Compare reliable sources", color: "mono" as const };
describe("explicit agent creation", () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });
  it("creates only after approval and switches to the created state", async () => {
    mocks.create.mockResolvedValue({ agent: { id: "new-agent", ...proposal } });
    render(<MemoryRouter><CreateAgentCard proposal={proposal} proposalKey="review-1" /></MemoryRouter>);
    expect(mocks.create).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Create agent" }));
    await waitFor(() => expect(screen.getByText("Agent created")).toBeTruthy());
    expect(mocks.create).toHaveBeenCalledWith(proposal);
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Chat with agent" })).toBeTruthy();
  });
  it("shows an error and allows a retry without claiming success", async () => {
    mocks.create.mockRejectedValue(new Error("Please upgrade your plan"));
    render(<MemoryRouter><CreateAgentCard proposal={proposal} proposalKey="review-2" /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Create agent" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Please upgrade"));
    expect(screen.getByRole("button", { name: "Create agent" }).hasAttribute("disabled")).toBe(false);
  });
});