"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { recordPayment } from "./actions";

interface Props {
  purchaseOrders: { id: string; poNumber: string; totalAmount: any; paidAmount: any; currency: string }[];
}

export function PaymentForm({ purchaseOrders }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await recordPayment(formData);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="purchaseOrderId">Purchase Order</Label>
        <Select id="purchaseOrderId" name="purchaseOrderId" required>
          <option value="">Select PO</option>
          {purchaseOrders.map((po) => (
            <option key={po.id} value={po.id}>
              {po.poNumber} (Balance: {(Number(po.totalAmount) - Number(po.paidAmount)).toFixed(2)} {po.currency})
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
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
        <Label htmlFor="reference">Reference</Label>
        <Input id="reference" name="reference" placeholder="e.g. Wire transfer #123" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Recording..." : "Record Payment"}
      </Button>
    </form>
  );
}
