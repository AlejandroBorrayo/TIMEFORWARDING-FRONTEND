"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FindAll as FindAllFolios } from "@/services/folio";
import { PageOptionsDto } from "@/type/general";
import { formatDateDMY } from "@/app/utils";
import { useAuth } from "@/components/authProvider";

const PAGE_SIZE = 5;

export default function OrdersPage() {
  const [folios, setFolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [folioSearch, setFolioSearch] = useState("");
  const [seller_name, setSeller_name] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { session } = useAuth();
  const userid = session?.user?.sub;
  const is_admin = session?.user?.role === "admin";

  if (!userid) return <p>No estás logueado</p>;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const pagination: PageOptionsDto = { page, perpage: PAGE_SIZE };

      const res = await FindAllFolios(
        pagination,
        userid,
        seller_name,
        folioSearch
      );

      setFolios(res.records);
      setTotalPages(res.totalpages);
    } catch (err) {
      console.error("Error cargando folios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, folioSearch, seller_name]);

  useEffect(() => {
    setPage(1);
  }, [folioSearch, seller_name]);

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h1
        className="text-2xl font-semibold mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Folios
      </motion.h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        <input
          type="text"
          placeholder="Buscar por folio"
          value={folioSearch}
          onChange={(e) => setFolioSearch(e.target.value)}
          className="flex-1 min-w-[220px] px-4 py-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-brand"
        />

        {is_admin && (
          <input
            type="text"
            placeholder="Buscar por creador"
            value={seller_name}
            onChange={(e) => setSeller_name(e.target.value)}
            className="flex-1 min-w-[220px] px-4 py-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-brand"
          />
        )}

        <Link
          href="/cuenta/folios/nuevo"
          className="btn btn-sm btn-primary"
        >
          Crear folio
        </Link>
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-fixed text-left border-collapse">
          <colgroup>
            <col className="w-1/3" />
            {is_admin && <col className="w-1/3" />}
            <col className="w-1/3" />
            <col className="w-1/6" />
          </colgroup>
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Folio</th>
              {is_admin && <th className="px-4 py-2">Creador</th>}

              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2 ">Ver detalle</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  Cargando...z
                </td>
              </tr>
            ) : (
              folios.map((folio, i) => (
                <motion.tr
                  key={folio._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium">{folio?.folio}</td>
                  {is_admin && (
                    <td className="px-4 py-3">{folio?.seller_userid?.full_name}</td>
                  )}
                  <td className="px-4 py-3">
                    {formatDateDMY(folio?.created_at)}
                  </td>
                  <td className="px-4 py-3 ">
                    {" "}
                    <Link
                      href={`/cuenta/folios/${folio.folio}`}
                      className="btn btn-xs btn-primary inline-block text-center"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="md:hidden flex flex-col gap-4">
        <AnimatePresence>
          {loading ? (
            <motion.div
              className="text-center py-6 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Cargando...
            </motion.div>
          ) : (
            folios.map((folio) => (
              <motion.div
                key={folio._id}
                className="bg-white border rounded-xl p-4 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="font-semibold">{folio.folio}</p>
                    {is_admin && (
                      <p className="text-xs text-gray-500">
                        {folio?.seller_userid?.full_name}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/cuenta/envios/${folio._id}`}
                    className="btn btn-xs btn-primary"
                  >
                    Ver
                  </Link>
                </div>

                <p className="text-xs text-gray-500">
                  Fecha: {formatDateDMY(folio.created_at)}
                </p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Paginación */}
      <div className="flex justify-end items-center gap-2 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded-xl disabled:opacity-50"
        >
          Anterior
        </button>

        <span className="text-sm">
          {page} / {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded-xl disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </motion.div>
  );
}
