"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { useAuth } from "./authProvider";

export default function ClientLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { session } = useAuth();


  return (
    <>
      <Sidebar session={session} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header session={session} onOpenSidebar={() => setSidebarOpen(true)} />

      <div className="flex-1 flex flex-col lg:ml-60 transition-all duration-300">
        <main
          className={`
            flex-1 overflow-y-auto
            pt-[64px]       /* espacio para header mobile */
            lg:pt-[64px]    /* espacio para header desktop >=1024px */
          `}
        >
          {children}
        </main>
      </div>
    </>
  );
}
