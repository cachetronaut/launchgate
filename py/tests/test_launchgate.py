from __future__ import annotations

import asyncio

from launchgate import (
    ApprovalSpec,
    InMemoryPendingStore,
    RecordingApprovalChannel,
    canonicalize,
    expire_if_due,
    request,
    resolve,
)


def test_request_resolve_and_expire() -> None:
    pending = request(_spec(), "approval_1")

    assert pending.status == "pending"

    approved = resolve(pending, "human_1", "approve", "2026-06-04T12:05:00Z", "ok")
    assert approved.status == "approved"
    assert approved.resolved_by == "human_1"
    assert approved.decision_note == "ok"
    assert resolve(approved, "human_2", "deny", "2026-06-04T12:06:00Z") is approved

    assert expire_if_due(pending, "2026-06-04T12:00:00Z") is pending
    assert expire_if_due(pending, "2026-06-04T13:00:00Z").status == "expired"


def test_blocks_unlisted_approver() -> None:
    pending = request(_spec(), "approval_1")

    try:
        resolve(pending, "human_2", "approve", "2026-06-04T12:05:00Z")
    except ValueError as error:
        assert "allowed approver" in str(error)
    else:
        raise AssertionError("expected resolve to reject unlisted approver")


def test_store_and_channel() -> None:
    async def run() -> None:
        approval = request(_spec(), "approval_1")
        store = InMemoryPendingStore()
        channel = RecordingApprovalChannel()

        await store.put(approval)
        await channel.notify(approval)

        assert await store.get("approval_1") == approval
        assert await store.list_pending("run_1") == [approval]
        assert channel.sent == [approval]

    asyncio.run(run())


def test_canonicalize() -> None:
    assert canonicalize({"b": 2, "a": 1}) == '{"a":1,"b":2}'


def _spec() -> ApprovalSpec:
    return ApprovalSpec(
        run_id="run_1",
        task_id="task_1",
        action={
            "scope": {"action": "write", "resource": "artifact.report"},
            "summary": "Publish report",
        },
        requested_by="agent_1",
        approvers=["human_1"],
        reason="requires human approval",
        expires_at="2026-06-04T13:00:00Z",
    )
