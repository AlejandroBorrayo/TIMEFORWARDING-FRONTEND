"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageOptionsDto } from "@/type/general";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/app/cuenta/folios/page";

/* ===================== SUPPLIERS ===================== */
import {
  FindAll as FindSuppliers, Create as CreateSupplier
} from "@/services/supplier";
import { SupplierCollectionInterface } from "@/type/supplier.interface";
import ModalCreateSupplier from "@/components/createSupplierModal";
import Link from "next/link";

const PAGE_SIZE = 10;

export default function SuppliersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ===================== STATE ===================== */
  const [suppliers, setSuppliers] = useState<SupplierCollectionInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openNewSupplier, setOpenNewSupplier] = useState(false);
  const [supplier_name, setSupplier_name] = useState(searchParams.get("proveedor") ?? "");
  const debouncedSupplierName = useDebounce(supplier_name, 500);

  /* ===================== FETCH ===================== */
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const pagination: PageOptionsDto = {
        page,
        perpage: PAGE_SIZE,
      };

      const res = await FindSuppliers(pagination, debouncedSupplierName);
      setSuppliers(res.records);
      setTotalPages(res.totalpages);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSupplierName]);

  const handleCreateSupplier = async (
    supplier: SupplierCollectionInterface
  ) => {
    try {
      await CreateSupplier(supplier);
      await fetchSuppliers()
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [supplier_name]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSupplierName) {
      params.set("proveedor", debouncedSupplierName);
    } else {
      params.delete("proveedor");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [debouncedSupplierName, router, searchParams]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ===================== HEADER ===================== */}
      <motion.h1
        className="text-2xl font-semibold mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Proveedores
      </motion.h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <input
          type="text"
          placeholder="Buscar proveedor"
          value={supplier_name}
          onChange={(e) => setSupplier_name(e.target.value)}
          className="flex-1 min-w-[220px] px-4 py-2 border border-gray-300 rounded-xl
                     focus:ring-1 focus:ring-[#02101d]"
        />

        <button
          onClick={() => setOpenNewSupplier(true)}
          className="px-4 py-2 bg-[#02101d] text-white rounded-xl cursor-pointer hover:bg-[#0e1b32]"
        >
          Nuevo proveedor
        </button>
      </div>

      <section className="bg-white border border-gray-300 rounded-xl p-4">
        {/* ===================== TABLE DESKTOP ===================== */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-left text-sm text-gray-500">
                <th className="px-4 py-2 w-1/4">Proveedor</th>
                <th className="px-4 py-2 w-1/4">Email</th>
                <th className="px-4 py-2 w-1/4">Teléfono</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-400">
                    Sin proveedores registrados
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier, i) => (
                  <motion.tr
                    key={supplier._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="border-b border-gray-300 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {supplier.name}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {supplier.email || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {supplier.phone || "—"}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/cuenta/proveedores/${supplier._id}`}
                        className="px-4 py-2 rounded-xl
                        transition border hover:bg-[#02101d]/5 text-sm font-medium cursor-pointer"
                      >
                        Ver histórico
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===================== MOBILE ===================== */}
        <div className="md:hidden flex flex-col gap-4">
          <AnimatePresence>
            {suppliers.map((supplier) => (
              <motion.div
                key={supplier._id}
                className="bg-white border rounded-xl p-4 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-semibold text-lg">
                  {supplier.name}
                </p>

                {supplier.email && (
                  <p className="text-sm text-gray-500">
                    {supplier.email}
                  </p>
                )}

                {supplier.phone && (
                  <p className="text-sm text-gray-500">
                    {supplier.phone}
                  </p>
                )}

                <button
                  onClick={() =>
                    router.push(
                      `/cuenta/proveedores/${supplier._id}`
                    )
                  }
                  className="mt-4 w-full px-4 py-2 text-sm bg-[#02101d] text-white rounded-lg hover:bg-[#0e1b32] transition cursor-pointer"
                >
                  Ver histórico
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ===================== PAGINATION ===================== */}
        <div className="flex justify-end items-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-xl disabled:opacity-50 cursor-pointer"
          >
            Anterior
          </button>
          <span className="text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-xl disabled:opacity-50 cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </section>
      <ModalCreateSupplier
        visible={openNewSupplier}
        onClose={() => setOpenNewSupplier(false)}
        onCreate={handleCreateSupplier}
      />
    </motion.div>
  );
}
