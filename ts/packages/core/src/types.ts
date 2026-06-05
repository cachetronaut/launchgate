export type ApprovalStatus = "pending" | "approved" | "denied" | "expired";
export type ApprovalDecision = "approve" | "deny";

export interface Scope {
  readonly action: string;
  readonly resource: string;
  readonly qualifier?: unknown;
}

export interface ApprovalSpec {
  readonly runId: string;
  readonly taskId?: string;
  readonly action: {
    readonly scope: Scope;
    readonly summary: string;
  };
  readonly requestedBy: string;
  readonly approvers?: readonly string[];
  readonly reason: string;
  readonly expiresAt: string;
}

export interface Approval extends ApprovalSpec {
  readonly id: string;
  readonly status: ApprovalStatus;
  readonly resolvedBy?: string;
  readonly resolvedAt?: string;
  readonly decisionNote?: string;
}

export interface PendingStore {
  put(approval: Approval): Promise<void>;
  get(id: string): Promise<Approval | undefined>;
  listPending(runId: string): Promise<readonly Approval[]>;
}

export interface ApprovalChannel {
  notify(approval: Approval): Promise<void>;
}
