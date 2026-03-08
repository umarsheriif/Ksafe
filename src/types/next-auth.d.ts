import { UserRole } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      departmentId: string | null;
      image?: string | null;
    };
  }

  interface User {
    role: UserRole;
    departmentId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    departmentId: string | null;
  }
}
