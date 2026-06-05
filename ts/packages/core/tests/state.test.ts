import { describe, expect, it } from "vitest";
import type { ApprovalSpec } from "../src/index";
import { canonicalize, expireIfDue, request, resolve } from "../src/index";

const spec: ApprovalSpec = {
  runId: "run_1",
  taskId: "task_1",
  action: {
    scope: { action: "write", resource: "artifact.report" },
    summary: "Publish report",
  },
  requestedBy: "agent_1",
  approvers: ["human_1"],
  reason: "requires human approval",
  expiresAt: "2026-06-04T13:00:00.000Z",
};

describe("approval state machine", () => {
  it("requests a pending approval", () => {
    expect(request(spec, "approval_1")).toMatchObject({
      id: "approval_1",
      status: "pending",
      runId: "run_1",
    });
  });

  it("resolves approve and deny decisions idempotently", () => {
    const pending = request(spec, "approval_1");
    const approved = resolve(pending, "human_1", "approve", "2026-06-04T12:05:00.000Z", "ok");

    expect(approved).toMatchObject({
      status: "approved",
      resolvedBy: "human_1",
      decisionNote: "ok",
    });
    expect(resolve(approved, "human_2", "deny", "2026-06-04T12:06:00.000Z")).toBe(approved);
  });

  it("expires only pending approvals after their ttl", () => {
    const pending = request(spec, "approval_1");

    expect(expireIfDue(pending, "2026-06-04T12:00:00.000Z")).toBe(pending);
    expect(expireIfDue(pending, "2026-06-04T13:00:00.000Z")).toMatchObject({
      status: "expired",
      resolvedAt: "2026-06-04T13:00:00.000Z",
    });
  });

  it("canonicalizes deterministically", () => {
    expect(canonicalize({ b: 2, a: 1 })).toBe('{"a":1,"b":2}');
  });
});
