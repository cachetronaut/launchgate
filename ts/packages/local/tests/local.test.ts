import { request } from "@launchgate/core";
import { describe, expect, it } from "vitest";
import { InMemoryPendingStore, RecordingApprovalChannel } from "../src/index";

describe("approval local adapters", () => {
  it("stores pending approvals by run", async () => {
    const store = new InMemoryPendingStore();
    const approval = request({
      runId: "run_1",
      action: { scope: { action: "write", resource: "artifact.report" }, summary: "Publish" },
      requestedBy: "agent_1",
      reason: "approval required",
      expiresAt: "2026-06-04T13:00:00.000Z",
    });

    await store.put(approval);

    await expect(store.get(approval.id)).resolves.toEqual(approval);
    await expect(store.listPending("run_1")).resolves.toEqual([approval]);
  });

  it("records notifications for tests and laptop demos", async () => {
    const channel = new RecordingApprovalChannel();
    const approval = request({
      runId: "run_1",
      action: { scope: { action: "write", resource: "artifact.report" }, summary: "Publish" },
      requestedBy: "agent_1",
      reason: "approval required",
      expiresAt: "2026-06-04T13:00:00.000Z",
    });

    await channel.notify(approval);

    expect(channel.sent).toEqual([approval]);
  });
});
