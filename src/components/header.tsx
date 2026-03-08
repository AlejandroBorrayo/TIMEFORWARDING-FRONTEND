"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import Breadcrumb from "./breadcrumb";
import { useParams, usePathname } from "next/navigation";
import { getBreadcrumbItems } from "@/app/utils";

interface HeaderProps {
  onOpenSidebar: () => void;
  session: Session | null;
}

export default function Header({ onOpenSidebar, session }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const name = session?.user?.name ?? "";
  const pathname = usePathname();
  const params = useParams<Record<string, string | string[]>>();
  const items = getBreadcrumbItems(pathname, params);


  return (
    <header
      className={`
        bg-white shadow-sm flex justify-between items-center border-b border-gray-200
        fixed top-0 right-0 w-full z-40
        lg:ml-60 lg:w-[calc(100%-15rem)]
        h-[56px] lg:h-[64px]
        px-4
      `}
    >
      {/* Botón hamburguesa solo visible en mobile */}
      <button
        className="lg:hidden text-gray-700 text-2xl mr-2"
        onClick={onOpenSidebar}
      >
        <FiMenu />
      </button>

      <div className="w-full flex justify-end lg:justify-between items-center gap-4 px-4 py-2">
        {/* Wallet */}
        <Breadcrumb
          items={items}
        />
        

        {/* Perfil con dropdown */}
        <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <div className="relative">
            <DropdownMenu.Trigger className="flex items-center gap-2 cursor-pointer focus:outline-none select-none">
              <span className="text-gray-700 font-medium">{name}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              sideOffset={5}
              align="end"
              className="mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slide-fade overflow-hidden"
            >
              <DropdownMenu.Item asChild className="w-full">
                <Link
                  href="/cuenta/perfil"
                  className="block w-full px-4 py-2 text-gray-700 cursor-pointer text-base hover:bg-gray-100 select-none focus:outline-none"
                >
                  Perfil
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className="w-full px-4 py-2 text-gray-700 cursor-pointer text-base hover:bg-gray-100 select-none focus:outline-none"
                onSelect={() =>
                  signOut({ callbackUrl: "/auth/iniciar-sesion" })
                }
              >
                Cerrar sesión
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </div>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
