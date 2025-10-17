import { PrismaAdapter } from "@auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { Logger } from "@/server/utils/logger";
import type { Adapter } from "next-auth/adapters";
import { CredentialsSignin } from "next-auth";

// Clases de error personalizadas
class NoneExistentUserError extends CredentialsSignin {
  constructor() {
    super("No existe un usuario con este email");
  }
}

class InvalidCredentialsLoginError extends CredentialsSignin {
  constructor() {
    super("Credenciales inválidas");
  }
}

class InactiveUserError extends CredentialsSignin {
  constructor() {
    super("Usuario inactivo");
  }
}

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
      type: string;
      clientId: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    type: string;
    clientId: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  adapter: PrismaAdapter(db) as Adapter,
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

        if (!user) throw new NoneExistentUserError();

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password!,
        );

        if (!isValidPassword)
          throw new InvalidCredentialsLoginError()

        if (!user.active) throw new InactiveUserError()
        
        Logger.auth("User authenticated successfully", { userId: user.id, email: user.email })
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          clientId: user.clientId ?? "",
          image: user.image,
          type: user.type as string,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.type = user.type;
        token.clientId = user.clientId ?? "";
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
      session.user.type = token.type as string;
      session.user.clientId = token.clientId as string;
      return session;
    },
    async signIn({user, account, credentials, email, profile}) {
      Logger.auth("Sign in attempt", { 
        userId: user?.id, 
        email: user?.email, 
        type: user?.type,
        hasCredentials: !!credentials,
        hasAccount: !!account
      })
      return true
    }
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthOptions;
