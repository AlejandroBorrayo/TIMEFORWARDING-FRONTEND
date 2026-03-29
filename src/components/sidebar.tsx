"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Session } from "next-auth";
import type { ReactNode } from "react";

import {
  HiOutlineBuildingOffice2,
  HiOutlineCalculator,
  HiOutlineChartBarSquare,
  HiOutlineDocumentText,
  HiOutlineUserCircle,
  HiOutlineUsers,
  HiOutlineTruck,
} from "react-icons/hi2";

import { useSelectedCompany } from "@/context/selectedCompanyContext";
import {
  DEFAULT_SIDEBAR_COLORS,
  getSidebarColorsFromLogoUrl,
  type SidebarColorsFromLogo,
} from "@/lib/logoPrimaryColor";

const DEFAULT_TIMETREK_LOGO =
  "https://i.postimg.cc/tRx2S91P/Captura-de-pantalla-2025-12-05-a-la(s)-3-46-29-p-m.png";

interface SidebarProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

function SidebarNavLink({
  href,
  onClose,
  brand,
  children,
}: {
  href: string;
  onClose: () => void;
  brand: SidebarColorsFromLogo;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors"
      style={{ color: brand.foreground }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = brand.hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {children}
    </Link>
  );
}

export default function Sidebar({ session, isOpen, onClose }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const admin = session?.user?.role === "admin";
  const { activeCompany } = useSelectedCompany();
  const [brand, setBrand] = useState<SidebarColorsFromLogo>(DEFAULT_SIDEBAR_COLORS);

  const logoUrl = activeCompany?.logo?.trim();
  const logoSrc = logoUrl || DEFAULT_TIMETREK_LOGO;
  const logoAlt = activeCompany?.name?.trim() || "Logo";

  useEffect(() => {
    let cancelled = false;
    void getSidebarColorsFromLogoUrl(logoUrl || null).then((c) => {
      if (!cancelled) setBrand(c);
    });
    return () => {
      cancelled = true;
    };
  }, [logoUrl]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const iconClass = "w-6 h-6 shrink-0 opacity-90";

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
      )}

      <aside
        ref={sidebarRef}
        style={{
          backgroundColor: brand.background,
          color: brand.foreground,
        }}
        className={`
          fixed top-0 left-0 h-full w-60 flex flex-col
          shadow-lg overflow-auto transform transition-transform duration-300 ease-in-out
          max-[1024px]:-translate-x-full
          ${isOpen ? "max-[1024px]:translate-x-0 z-50" : ""}
        `}
      >
        <div className="p-6 flex justify-center items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt={logoAlt}
            width={176}
            height={176}
            className="max-h-44 w-auto max-w-full rounded-xl object-contain"
          />
        </div>

        <nav className="flex-1 px-4 py-6">
          <p
            className="px-3 mb-4 text-xs uppercase tracking-wider"
            style={{ color: brand.muted }}
          >
            Administración
          </p>

          <ul className="space-y-2">
            {admin && (
              <li>
                <SidebarNavLink
                  href="/cuenta/folios/dashboard"
                  onClose={onClose}
                  brand={brand}
                >
                  <HiOutlineChartBarSquare className={iconClass} />
                  <span>Dashboard general</span>
                </SidebarNavLink>
              </li>
            )}
            <li>
              <SidebarNavLink
                href="/cuenta/folios"
                onClose={onClose}
                brand={brand}
              >
                <HiOutlineDocumentText className={iconClass} />
                <span>Gestión de folios</span>
              </SidebarNavLink>
            </li>

            <li>
              <SidebarNavLink
                href="/cuenta/empresas"
                onClose={onClose}
                brand={brand}
              >
                <HiOutlineBuildingOffice2 className={iconClass} />
                <span>Empresas</span>
              </SidebarNavLink>
            </li>

            <li>
              <SidebarNavLink
                href="/cuenta/utilidades"
                onClose={onClose}
                brand={brand}
              >
                <HiOutlineCalculator className={iconClass} />
                <span>Impuestos y notas</span>
              </SidebarNavLink>
            </li>

            <li>
              <SidebarNavLink
                href="/cuenta/clientes"
                onClose={onClose}
                brand={brand}
              >
                <HiOutlineUsers className={iconClass} />
                <span>Clientes</span>
              </SidebarNavLink>
            </li>

            <li>
              <SidebarNavLink
                href="/cuenta/proveedores"
                onClose={onClose}
                brand={brand}
              >
                <HiOutlineTruck className={iconClass} />
                <span>Proveedores</span>
              </SidebarNavLink>
            </li>

            {admin && (
              <li>
                <SidebarNavLink
                  href="/cuenta/usuarios"
                  onClose={onClose}
                  brand={brand}
                >
                  <HiOutlineUserCircle className={iconClass} />
                  <span>Usuarios</span>
                </SidebarNavLink>
              </li>
            )}
          </ul>
        </nav>

        <div
          className="px-4 py-4 border-t text-xs"
          style={{ borderColor: brand.border, color: brand.muted }}
        >
          © {new Date().getFullYear()} · Panel de control
        </div>
      </aside>
    </>
  );
}
