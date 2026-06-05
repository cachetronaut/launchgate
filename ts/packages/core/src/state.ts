import { canonicalize } from "./canonical.js";
import type { Approval, ApprovalDecision, ApprovalSpec } from "./types.js";

export function request(spec: ApprovalSpec, id = approvalId(spec)): Approval {
  if (Date.parse(spec.expiresAt) <= 0 || Number.isNaN(Date.parse(spec.expiresAt))) {
    throw new Error("Approval expiresAt must be a valid timestamp");
  }
  return {
    ...spec,
    id,
    status: "pending",
  };
}

export function resolve(
  approval: Approval,
  by: string,
  decision: ApprovalDecision,
  now: string,
  note?: string,
): Approval {
  if (approval.status !== "pending") {
    return approval;
  }
  if (
    approval.approvers !== undefined &&
    approval.approvers.length > 0 &&
    !approval.approvers.includes(by)
  ) {
    throw new Error("Principal is not an allowed approver");
  }
  return {
    ...approval,
    status: decision === "approve" ? "approved" : "denied",
    resolvedBy: by,
    resolvedAt: now,
    decisionNote: note,
  };
}

export function expireIfDue(approval: Approval, now: string): Approval {
  if (approval.status !== "pending") {
    return approval;
  }
  if (Date.parse(now) < Date.parse(approval.expiresAt)) {
    return approval;
  }
  return {
    ...approval,
    status: "expired",
    resolvedAt: now,
  };
}

function approvalId(spec: ApprovalSpec): string {
  let hash = 0;
  for (const char of canonicalize(spec)) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return `approval_${hash.toString(16)}`;
}
