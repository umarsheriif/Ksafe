"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createBudgetLineItem } from "./actions";

interface Props {
  categories: { id: string; name: string; department: { name: string }; fiscalYear: { name: string } }[];
}

export function BudgetLineItemForm({ categories }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createBudgetLineItem(formData);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="budgetCategoryId">Budget Category</Label>
        <Select id="budgetCategoryId" name="budgetCategoryId" required>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} - {c.department.name} ({c.fiscalYear.name})
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="allocatedAmount">Allocated Amount</Label>
        <Input id="allocatedAmount" name="allocatedAmount" type="number" step="0.01" min="0" required />
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
        {isPending ? "Creating..." : "Create Line Item"}
      </Button>
    </form>
  );
}
