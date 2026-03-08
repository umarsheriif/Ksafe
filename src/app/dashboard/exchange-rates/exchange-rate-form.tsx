"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { upsertExchangeRate } from "./actions";

const currencies = ["USD", "EUR", "GBP", "AED", "SAR", "INR"];

interface Props {
  fiscalYears: { id: string; name: string }[];
}

export function ExchangeRateForm({ fiscalYears }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await upsertExchangeRate(formData);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fromCurrency">From Currency</Label>
        <Select id="fromCurrency" name="fromCurrency" required>
          {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="toCurrency">To Currency</Label>
        <Select id="toCurrency" name="toCurrency" required defaultValue="USD">
          {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="rate">Rate</Label>
        <Input id="rate" name="rate" type="number" step="0.00000001" min="0" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fiscalYearId">Fiscal Year</Label>
        <Select id="fiscalYearId" name="fiscalYearId" required>
          <option value="">Select</option>
          {fiscalYears.map((fy) => <option key={fy.id} value={fy.id}>{fy.name}</option>)}
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : "Save Rate"}
      </Button>
    </form>
  );
}
