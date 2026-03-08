"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createApprovalThreshold } from "./actions";
import { Plus, Trash2 } from "lucide-react";

const roles = ["DEPARTMENT_HEAD", "FINANCE", "CFO", "ADMIN"];

export function ThresholdForm() {
  const [isPending, startTransition] = useTransition();
  const [approvalRoles, setApprovalRoles] = useState([{ role: "DEPARTMENT_HEAD", stepOrder: 1 }]);

  function addRole() {
    setApprovalRoles([...approvalRoles, { role: "FINANCE", stepOrder: approvalRoles.length + 1 }]);
  }

  function removeRole(index: number) {
    if (approvalRoles.length === 1) return;
    setApprovalRoles(approvalRoles.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      await createApprovalThreshold({
        name: form.get("name") as string,
        minAmount: form.get("minAmount") as string,
        maxAmount: form.get("maxAmount") as string,
        currency: form.get("currency") as string,
        roles: approvalRoles,
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="e.g. Small Purchase" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="minAmount">Min Amount</Label>
        <Input id="minAmount" name="minAmount" type="number" step="0.01" min="0" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxAmount">Max Amount</Label>
        <Input id="maxAmount" name="maxAmount" type="number" step="0.01" min="0" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select id="currency" name="currency" required>
          {["USD", "EUR", "GBP", "AED", "SAR", "INR"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Approval Chain</Label>
          <Button type="button" variant="outline" size="sm" onClick={addRole}>
            <Plus className="mr-1 h-3 w-3" /> Add Step
          </Button>
        </div>
        {approvalRoles.map((ar, index) => (
          <div key={index} className="flex gap-2">
            <span className="flex items-center text-sm text-muted-foreground w-6">{index + 1}.</span>
            <Select
              value={ar.role}
              onChange={(e) => {
                const updated = [...approvalRoles];
                updated[index] = { ...updated[index], role: e.target.value };
                setApprovalRoles(updated);
              }}
              className="flex-1"
            >
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
            {approvalRoles.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removeRole(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create Threshold"}
      </Button>
    </form>
  );
}
