// src/types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      sub: string;
      name?: string | null;
      email?: string | null;
      role?: string | null;
    };
  }
  

  interface JWT {
    sub?: string;
  }
}
