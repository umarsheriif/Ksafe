"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createSafeLimit } from "./actions";

interface Props {
  users: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  categories: { id: string; name: string; department: { name: string } }[];
  fiscalYears: { id: string; name: string }[];
}

export function SafeLimitForm({ users, departments, categories, fiscalYears }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createSafeLimit(formData);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ownerId">Owner</Label>
        <Select id="ownerId" name="ownerId" required>
          <option value="">Select user</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </Select>
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
        <Label htmlFor="budgetCategoryId">Budget Category</Label>
        <Select id="budgetCategoryId" name="budgetCategoryId" required>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.department.name})</option>
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
        <Label htmlFor="limitAmount">Limit Amount</Label>
        <Input id="limitAmount" name="limitAmount" type="number" step="0.01" min="0" required />
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
        {isPending ? "Creating..." : "Assign Safe Limit"}
      </Button>
    </form>
  );
}
