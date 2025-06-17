import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "@/server/db";
import { env } from "@/env";
import type { Adapter } from "next-auth/adapters";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
      userType: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userType: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  adapter: PrismaAdapter(db) as Adapter,
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.userType = user.userType;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.name = token.name!;
      session.user.email = token.email!;
      session.user.userType = token.userType as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, _req) => {
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) throw new Error("Usuario inexistente.");

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password!,
        );

        if (!isValidPassword)
          throw new Error("Credenciales incorrectas.");

        if (!user.active) throw new Error("El usuario no se encuentra activo.");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          userType: user.type as string,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;
