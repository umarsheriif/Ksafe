"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createBudgetCategory } from "./actions";

interface Props {
  departments: { id: string; name: string }[];
  fiscalYears: { id: string; name: string }[];
}

export function BudgetCategoryForm({ departments, fiscalYears }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createBudgetCategory(formData);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="glCode">GL Code</Label>
        <Input id="glCode" name="glCode" placeholder="Optional" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="departmentId">Department</Label>
        <Select id="departmentId" name="departmentId" required>
          <option value="">Select department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fiscalYearId">Fiscal Year</Label>
        <Select id="fiscalYearId" name="fiscalYearId" required>
          <option value="">Select fiscal year</option>
          {fiscalYears.map((fy) => (
            <option key={fy.id} value={fy.id}>{fy.name}</option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="totalBudget">Total Budget</Label>
        <Input id="totalBudget" name="totalBudget" type="number" step="0.01" min="0" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select id="currency" name="currency" required>
          {["USD", "EUR", "GBP", "AED", "SAR", "INR"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create Category"}
      </Button>
    </form>
  );
}
