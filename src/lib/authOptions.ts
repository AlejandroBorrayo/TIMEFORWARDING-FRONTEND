import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { login } from "@/services/auth";
import {jwtDecode} from "jwt-decode"; // npm i jwt-decode
import { getUser } from "@/services/user";

export type DecodedUser = {
  name: string;
  email: string;
  sub: string;
  role?: string;
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXT_PUBLIC_NEXTAUTH_URL,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Correo", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        try {
          const result = await login(credentials.email, credentials.password);
          if (!result?.access_token) return null;

          // 🔹 decodificamos el JWT
          const decoded = jwtDecode<DecodedUser>(result.access_token);

          // 🔹 retornamos usuario + accessToken
          return {
            id: decoded.sub,
            sub: decoded.sub,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
            accessToken: result.access_token,
          };
        } catch (error) {
          console.error("Error authorize:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/iniciar-sesion",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.sub = user.sub;
        token.accessToken = user.accessToken;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      } else {
        const updatedUser = await getUser(token.sub);
        if (updatedUser) {
          token.name = updatedUser.full_name;
          token.email = updatedUser.email;
          token.role = updatedUser.role;
        }
      }
      return token;
    },
    async session({ session, token }: {session: any, token: any}) {
      if (session.user) {
        session.user.sub = token.sub as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }

      session.accessToken = token.accessToken as string;

      return session;
    },
  },
};
