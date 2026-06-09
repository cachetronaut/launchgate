import type { Approval, ApprovalChannel, PendingStore } from "@launchgate/core";

export class InMemoryPendingStore implements PendingStore {
  private readonly approvals = new Map<string, Approval>();

  async put(approval: Approval): Promise<void> {
    this.approvals.set(approval.id, approval);
  }

  async get(id: string): Promise<Approval | undefined> {
    return this.approvals.get(id);
  }

  async listPending(runId: string): Promise<readonly Approval[]> {
    return [...this.approvals.values()].filter(
      (approval) => approval.runId === runId && approval.status === "pending",
    );
  }
}

export class RecordingApprovalChannel implements ApprovalChannel {
  readonly sent: Approval[] = [];

  async notify(approval: Approval): Promise<void> {
    this.sent.push(approval);
  }
}
