"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import CompanyModal from "@/components/companyModal";
import { Toast } from "@/components/toast";
import * as CompanyService from "@/services/company";
import type { CompanyFormPayload, CompanyInterface } from "@/type/company.interface";
import { useSelectedCompany } from "@/context/selectedCompanyContext";
import type { PageOptionsDto } from "@/type/general";
import { useDebounce } from "@/app/cuenta/folios/page";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

/** Pocas empresas por cuenta; una página suele alcanzar. */
const PAGE_SIZE = 20;

export default function EmpresasPage() {
  const { refreshCompanies, setCompanyId, companyId } = useSelectedCompany();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyInterface | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({ visible: false, message: "" });

  const [list, setList] = useState<CompanyInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const pagination: PageOptionsDto = {
        page,
        perpage: PAGE_SIZE,
      };
      const res = await CompanyService.FindAll(pagination, debouncedSearch);
      setList(res.records ?? []);
      setTotalPages(Math.max(1, res.totalpages ?? 1));
    } catch {
      setToast({
        visible: true,
        message: "Error al cargar empresas",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (c: CompanyInterface) => {
    setEditing(c);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: CompanyFormPayload) => {
    setSaving(true);
    try {
      if (editing?._id) {
        await CompanyService.Update(editing._id, payload);
        setToast({
          visible: true,
          message: "Empresa actualizada",
          type: "success",
        });
      } else {
        await CompanyService.Create(payload);
        setToast({
          visible: true,
          message: "Empresa creada",
          type: "success",
        });
      }
      setModalOpen(false);
      setEditing(null);
      await load();
      await refreshCompanies();
    } catch {
      setToast({
        visible: true,
        message: "No se pudo guardar la empresa",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="w-full min-w-0 px-4 md:px-8 py-4 md:py-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 max-w-none">
        <div>
          <h1 className="text-2xl font-semibold text-[#02101d]">Empresas</h1>
          <p className="text-gray-600 text-sm mt-1">
            Haz clic en una tarjeta para activar esa empresa. El lápiz arriba a
            la derecha abre la edición.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="shrink-0 px-4 py-2 bg-[#02101d] text-white rounded-xl hover:bg-[#0e1b32] cursor-pointer"
        >
          Nueva empresa
        </button>
      </div>

      <div className="mb-8 w-full">
        <input
          type="search"
          placeholder="Buscar empresa…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-md px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[#02101d] focus:outline-none"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando…</p>
      ) : (
        <>
          {list.length === 0 ? (
            <p className="text-gray-500 mb-6">
              {debouncedSearch || page > 1
                ? "Sin resultados en esta página."
                : "No hay empresas registradas."}
            </p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
              {list.map((c) => {
                const active = companyId === c._id;
                return (
                  <li
                    key={c._id}
                    className={`relative rounded-3xl border bg-white shadow-sm transition-all ${
                      active
                        ? "border-green-600/50 ring-2 ring-green-600/25 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="absolute top-4 right-4 z-20 rounded-xl p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#02101d] cursor-pointer"
                      aria-label={`Editar ${c.name}`}
                    >
                      <PencilSquareIcon className="h-6 w-6" aria-hidden />
                    </button>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-pressed={active}
                      aria-label={
                        active
                          ? `Empresa activa: ${c.name}`
                          : `Activar empresa ${c.name}`
                      }
                      onClick={() => setCompanyId(c._id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setCompanyId(c._id);
                        }
                      }}
                      className={`flex w-full flex-col rounded-3xl p-6 pt-14 md:p-8 md:pt-16 outline-none focus-visible:ring-2 focus-visible:ring-[#02101d] focus-visible:ring-offset-2 ${
                        active ? "cursor-default" : "cursor-pointer"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`flex h-44 w-44 sm:h-52 sm:w-52 md:h-56 md:w-56 items-center justify-center overflow-hidden rounded-2xl border bg-gray-50 ${
                            active ? "border-green-200/80" : "border-gray-100"
                          }`}
                        >
                          {c.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.logo}
                              alt=""
                              className="max-h-full max-w-full object-contain p-3"
                            />
                          ) : (
                            <div
                              className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200"
                              aria-hidden
                            />
                          )}
                        </div>
                        <h2 className="mt-6 font-semibold text-xl md:text-2xl text-[#02101d] leading-tight break-words px-1">
                          {c.name}
                        </h2>
                        {active && (
                          <span className="inline-flex mt-3 items-center rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-800">
                            Empresa activa
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-2 mt-8">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || loading}
                className="px-3 py-1 border rounded-xl disabled:opacity-50 cursor-pointer"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages || loading}
                className="px-3 py-1 border rounded-xl disabled:opacity-50 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      <CompanyModal
        visible={modalOpen}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
            setEditing(null);
          }
        }}
        initial={editing}
        onSubmit={handleSubmit}
        saving={saving}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </motion.div>
  );
}
