// AuthProvider.tsx
"use client";

import { Session } from "next-auth";
import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { setStoredCreatorUserId } from "@/lib/withCompanyId";

type AuthContextType = {
  session: Session | null;
  setSession: (session: Session | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  session: initialSession,
  children,
}: {
  session: Session | null;
  children: ReactNode;
}) {
  const [session, setSession] = useState(initialSession);

  useEffect(() => {
    const sub = session?.user?.sub?.trim();
    setStoredCreatorUserId(sub || null);
  }, [session]);

  return (
    <AuthContext.Provider value={{ session, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
