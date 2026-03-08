"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createUser } from "./actions";

const userRoles = ["ADMIN", "FINANCE", "CFO", "DEPARTMENT_HEAD", "TEAM_HEAD", "REQUESTER"];

interface Props {
  departments: { id: string; name: string }[];
  managers: { id: string; name: string }[];
}

export function UserForm({ departments, managers }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createUser(formData);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" minLength={6} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select id="role" name="role" required>
          {userRoles.map((r) => <option key={r} value={r}>{r}</option>)}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="departmentId">Department</Label>
        <Select id="departmentId" name="departmentId">
          <option value="">None</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="managerId">Manager</Label>
        <Select id="managerId" name="managerId">
          <option value="">None</option>
          {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
}
