"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createVendor } from "./actions";

export function VendorForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createVendor(formData);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Vendor Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="taxId">Tax ID</Label>
        <Input id="taxId" name="taxId" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bankName">Bank Name</Label>
        <Input id="bankName" name="bankName" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bankAccountNo">Account Number</Label>
        <Input id="bankAccountNo" name="bankAccountNo" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bankRoutingNo">Routing Number</Label>
        <Input id="bankRoutingNo" name="bankRoutingNo" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bankSwiftCode">SWIFT Code</Label>
        <Input id="bankSwiftCode" name="bankSwiftCode" />
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
        {isPending ? "Creating..." : "Create Vendor"}
      </Button>
    </form>
  );
}
