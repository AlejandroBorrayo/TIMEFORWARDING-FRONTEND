"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { HiCheck } from "react-icons/hi2";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import Breadcrumb from "./breadcrumb";
import { useParams, usePathname } from "next/navigation";
import { getBreadcrumbItems } from "@/app/utils";
import { useSelectedCompany } from "@/context/selectedCompanyContext";

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

  const {
    companies,
    activeCompany,
    loading: companiesLoading,
    setCompanyId,
    companyId,
    error,
  } = useSelectedCompany();

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
      <button
        className="lg:hidden text-gray-700 text-2xl mr-2"
        onClick={onOpenSidebar}
        type="button"
      >
        <FiMenu />
      </button>

      <div className="w-full flex justify-end lg:justify-between items-center gap-4 px-4 py-2 min-w-0">
        <Breadcrumb items={items} />

        <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <div className="relative shrink-0">
            <DropdownMenu.Trigger
              type="button"
              className="flex items-center gap-2 cursor-pointer focus:outline-none select-none max-w-[min(100%,220px)]"
            >
              {companiesLoading ? (
                <span className="h-9 w-28 bg-gray-200 animate-pulse rounded-lg" />
              ) : (
                <>
                  {activeCompany?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeCompany.logo}
                      alt=""
                      className="w-9 h-9 rounded-lg object-cover bg-gray-100 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gray-200 shrink-0 flex items-center justify-center text-gray-500 text-xs">
                      —
                    </div>
                  )}
                  <div className="text-left min-w-0 hidden sm:block">
                    <p className="text-xs text-gray-500 leading-tight">Empresa</p>
                    <p className="text-gray-800 font-medium text-sm truncate max-w-[140px]">
                      {activeCompany?.name ?? "Sin empresa"}
                    </p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ${
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
                </>
              )}
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              sideOffset={5}
              align="end"
              className="mt-2 min-w-[260px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slide-fade overflow-hidden flex flex-col max-h-[min(80vh,480px)]"
            >
              <div className="px-3 py-2 border-b border-gray-100 shrink-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Mis empresas
                </p>
              </div>
              <div className="overflow-y-auto flex-1 min-h-0">
                {error && (
                  <p className="px-3 py-2 text-xs text-red-600">{error}</p>
                )}
                {!companiesLoading &&
                  companies.length === 0 &&
                  !error && (
                    <p className="px-3 py-2 text-sm text-gray-500">
                      No hay empresas
                    </p>
                  )}
                {companies.map((c) => (
                  <DropdownMenu.Item
                    key={c._id}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer outline-none text-sm ${
                      companyId === c._id
                        ? "bg-emerald-50"
                        : "hover:bg-gray-100 focus:bg-gray-100"
                    }`}
                    onSelect={() => setCompanyId(c._id)}
                  >
                    {c.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.logo}
                        alt=""
                        className="w-8 h-8 rounded-md object-cover shrink-0 bg-gray-100"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-gray-200 shrink-0" />
                    )}
                    <span className="flex-1 truncate font-medium text-gray-800">
                      {c.name}
                    </span>
                    {companyId === c._id && (
                      <span className="flex items-center gap-0.5 text-emerald-700 text-xs font-semibold shrink-0">
                        <HiCheck className="w-4 h-4" />
                        Activa
                      </span>
                    )}
                  </DropdownMenu.Item>
                ))}
              </div>

              <DropdownMenu.Separator className="h-px bg-gray-200 shrink-0" />

              <DropdownMenu.Item asChild className="outline-none">
                <Link
                  href="/cuenta/empresas"
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Gestionar empresas
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Item asChild className="outline-none">
                <Link
                  href="/cuenta/perfil"
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <span>Mi perfil</span>
                  {name ? (
                    <span className="block text-xs text-gray-500 truncate">
                      {name}
                    </span>
                  ) : null}
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-gray-200" />

              <DropdownMenu.Item
                className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 outline-none"
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
