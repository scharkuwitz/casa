import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // single admin, created by instrumentation.ts
  },
  plugins: [nextCookies()], // keep last
});
