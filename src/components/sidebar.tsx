"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Session } from "next-auth";

import {
  HiOutlineCalculator,
  HiOutlineChartBarSquare,
  HiOutlineDocumentText,
  HiOutlineUserCircle,
  HiOutlineUsers,
  HiOutlineTruck,
} from "react-icons/hi2";

interface SidebarProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ session, isOpen, onClose }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const admin = session?.user?.role === "admin";

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

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
      )}

      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-full w-60 bg-[#02101d] text-gray-100 flex flex-col
          shadow-lg overflow-auto transform transition-transform duration-300 ease-in-out
          max-[1024px]:-translate-x-full
          ${isOpen ? "max-[1024px]:translate-x-0 z-50" : ""}
        `}
      >
        {/* Logo */}
        <div className="p-6 flex justify-center items-center">
          <Image
            src="https://i.postimg.cc/tRx2S91P/Captura-de-pantalla-2025-12-05-a-la(s)-3-46-29-p-m.png"
            alt="Logo empresa"
            width={176}
            height={176}
            className="rounded-xl"
            priority
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <p className="px-3 mb-4 text-xs uppercase tracking-wider text-gray-400">
            Administración
          </p>

          <ul className="space-y-2">
          {admin && (
              <li>
                <Link
                  href="/cuenta/folios/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-800 transition"
                >
                  <HiOutlineChartBarSquare className="w-6 h-6 text-gray-300" />
                  <span>Dashboard general</span>
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/cuenta/folios"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-800 transition"
              >
                <HiOutlineDocumentText className="w-6 h-6 text-gray-300" />
                <span>Gestión de folios</span>
              </Link>
            </li>


            <li>
              <Link
                href="/cuenta/utilidades"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-800 transition"
              >
                <HiOutlineCalculator className="w-6 h-6 text-gray-300" />
                <span>Impuestos y notas</span>
              </Link>
            </li>

            <li>
              <Link
                href="/cuenta/clientes"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-800 transition"
              >
                <HiOutlineUsers className="w-6 h-6 text-gray-300" />
                <span>Clientes</span>
              </Link>
            </li>

            <li>
              <Link
                href="/cuenta/proveedores"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-800 transition"
              >
                <HiOutlineTruck className="w-6 h-6 text-gray-300" />
                <span>Proveedores</span>
              </Link>
            </li>

            {
              admin &&             <li>
              <Link
                href="/cuenta/usuarios"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-800 transition"
              >
                <HiOutlineUserCircle className="w-6 h-6 text-gray-300" />
                <span>Usuarios</span>
              </Link>
            </li>
            }

      {/*       {admin && (
              <>
                <hr className="my-4 border-gray-700" />

                <li>
                  <Link
                    href="/cuenta/usuarios"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-800 transition text-amber-400"
                  >
                    <span className="text-lg">★</span>
                    <span>Usuarios</span>
                  </Link>
                </li>
              </>
            )} */}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-800 text-xs text-gray-400">
          © {new Date().getFullYear()} · Panel de control
        </div>
      </aside>
    </>
  );
}
