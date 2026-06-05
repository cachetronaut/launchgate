from __future__ import annotations

import json
from dataclasses import dataclass, replace
from datetime import datetime
from typing import Any, Literal

ApprovalStatus = Literal["pending", "approved", "denied", "expired"]
ApprovalDecision = Literal["approve", "deny"]


@dataclass(frozen=True)
class ApprovalSpec:
    run_id: str
    action: dict[str, Any]
    requested_by: str
    reason: str
    expires_at: str
    task_id: str | None = None
    approvers: list[str] | None = None


@dataclass(frozen=True)
class Approval(ApprovalSpec):
    id: str = ""
    status: ApprovalStatus = "pending"
    resolved_by: str | None = None
    resolved_at: str | None = None
    decision_note: str | None = None


class InMemoryPendingStore:
    def __init__(self) -> None:
        self._approvals: dict[str, Approval] = {}

    async def put(self, approval: Approval) -> None:
        self._approvals[approval.id] = approval

    async def get(self, approval_id: str) -> Approval | None:
        return self._approvals.get(approval_id)

    async def list_pending(self, run_id: str) -> list[Approval]:
        return [
            approval
            for approval in self._approvals.values()
            if approval.run_id == run_id and approval.status == "pending"
        ]


class RecordingApprovalChannel:
    def __init__(self) -> None:
        self.sent: list[Approval] = []

    async def notify(self, approval: Approval) -> None:
        self.sent.append(approval)


def request(spec: ApprovalSpec, approval_id: str | None = None) -> Approval:
    _parse(spec.expires_at)
    return Approval(
        id=approval_id or _approval_id(spec),
        status="pending",
        run_id=spec.run_id,
        task_id=spec.task_id,
        action=dict(spec.action),
        requested_by=spec.requested_by,
        approvers=list(spec.approvers) if spec.approvers is not None else None,
        reason=spec.reason,
        expires_at=spec.expires_at,
    )


def resolve(
    approval: Approval,
    by: str,
    decision: ApprovalDecision,
    now: str,
    note: str | None = None,
) -> Approval:
    if approval.status != "pending":
        return approval
    if approval.approvers and by not in approval.approvers:
        raise ValueError("Principal is not an allowed approver")
    return replace(
        approval,
        status="approved" if decision == "approve" else "denied",
        resolved_by=by,
        resolved_at=now,
        decision_note=note,
    )


def expire_if_due(approval: Approval, now: str) -> Approval:
    if approval.status != "pending":
        return approval
    if _parse(now) < _parse(approval.expires_at):
        return approval
    return replace(approval, status="expired", resolved_at=now)


def canonicalize(value: object) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), default=_json_default)


def _approval_id(spec: ApprovalSpec) -> str:
    value = 0
    for char in canonicalize(spec):
        value = ((value * 31) + ord(char)) & 0xFFFFFFFF
    return f"approval_{value:x}"


def _parse(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _json_default(value: object) -> object:
    if hasattr(value, "__dict__"):
        return value.__dict__
    raise TypeError(f"Cannot serialize {type(value)!r}")
