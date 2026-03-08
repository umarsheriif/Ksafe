"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approveStep, rejectStep } from "../actions";

export function ApprovalActions({ stepId }: { stepId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [comment, setComment] = useState("");

  function handleApprove() {
    startTransition(async () => {
      await approveStep(stepId);
    });
  }

  function handleReject() {
    if (!comment.trim()) return;
    startTransition(async () => {
      await rejectStep(stepId, comment);
    });
  }

  if (showReject) {
    return (
      <div className="flex gap-2">
        <Input
          placeholder="Reason for rejection"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button variant="destructive" size="sm" onClick={handleReject} disabled={isPending}>
          Reject
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowReject(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={handleApprove} disabled={isPending}>
        Approve
      </Button>
      <Button variant="destructive" size="sm" onClick={() => setShowReject(true)} disabled={isPending}>
        Reject
      </Button>
    </div>
  );
}
