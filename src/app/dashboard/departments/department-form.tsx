"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDepartment } from "./actions";

export function DepartmentForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createDepartment(formData);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">Department Code</Label>
        <Input id="code" name="code" placeholder="e.g. ENG" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Department Name</Label>
        <Input id="name" name="name" placeholder="e.g. Engineering" required />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create Department"}
      </Button>
    </form>
  );
}
