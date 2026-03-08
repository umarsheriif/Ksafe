"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPurchaseOrder } from "../actions";
import { Plus, Trash2 } from "lucide-react";

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
  budgetLineItemId: string;
}

interface Props {
  vendors: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  fiscalYears: { id: string; name: string }[];
  budgetLineItems: { id: string; name: string; budgetCategory: { name: string; department: { name: string } } }[];
}

export function POCreateForm({ vendors, departments, fiscalYears, budgetLineItems }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: "1", unitPrice: "0", budgetLineItemId: "" },
  ]);

  function addLineItem() {
    setLineItems([...lineItems, { description: "", quantity: "1", unitPrice: "0", budgetLineItemId: "" }]);
  }

  function removeLineItem(index: number) {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  }

  function updateLineItem(index: number, field: keyof LineItem, value: string) {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      await createPurchaseOrder({
        description: form.get("description") as string || undefined,
        currency: form.get("currency") as string,
        vendorId: form.get("vendorId") as string,
        departmentId: form.get("departmentId") as string,
        fiscalYearId: form.get("fiscalYearId") as string,
        lineItems,
      });
      router.push("/dashboard/purchase-orders");
    });
  }

  const total = lineItems.reduce((sum, item) => {
    return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
  }, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vendorId">Vendor</Label>
          <Select id="vendorId" name="vendorId" required>
            <option value="">Select vendor</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
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
          <Label htmlFor="fiscalYearId">Fiscal Year</Label>
          <Select id="fiscalYearId" name="fiscalYearId" required>
            <option value="">Select fiscal year</option>
            {fiscalYears.map((fy) => (
              <option key={fy.id} value={fy.id}>{fy.name}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select id="currency" name="currency" required>
            {["USD", "EUR", "GBP", "AED", "SAR", "INR"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Line Items</h3>
          <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="mr-1 h-4 w-4" /> Add Item
          </Button>
        </div>

        {lineItems.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-lg border p-4 md:grid-cols-5">
            <div className="md:col-span-2 space-y-1">
              <Label>Description</Label>
              <Input
                value={item.description}
                onChange={(e) => updateLineItem(index, "description", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Budget Line</Label>
              <Select
                value={item.budgetLineItemId}
                onChange={(e) => updateLineItem(index, "budgetLineItemId", e.target.value)}
                required
              >
                <option value="">Select</option>
                {budgetLineItems.map((bl) => (
                  <option key={bl.id} value={bl.id}>
                    {bl.name} ({bl.budgetCategory.department.name})
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Qty</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={item.quantity}
                onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                required
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label>Unit Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
                  required
                />
              </div>
              {lineItems.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLineItem(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        ))}

        <div className="text-right text-lg font-semibold">
          Total: ${total.toFixed(2)}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create Purchase Order"}
      </Button>
    </form>
  );
}
