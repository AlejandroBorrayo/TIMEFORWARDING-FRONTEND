// AuthProvider.tsx
"use client";

import { Session } from "next-auth";
import { useState, createContext, useContext, ReactNode } from "react";

type AuthContextType = {
  session: Session;
  setSession: (session: Session) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ session: initialSession, children }: { session: Session; children: ReactNode }) {
  const [session, setSession] = useState(initialSession);

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
