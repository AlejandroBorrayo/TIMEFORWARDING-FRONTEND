"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDownIcon, CheckIcon } from "@radix-ui/react-icons";
import { FindAllShipment } from "@/services/shipping";
import { ShipmentCollectionInterface } from "@/type/shipment.interface";
import { PageOptionsDto } from "@/type/general";
import { useAuth } from "@/components/authProvider";
import {
  LogoDHL,
  LogoFedex,
  LogoEstafeta,
  LogoPaqueteExpress,
  STATUS_OPTIONS_SOLOENVIOS as STATUS_OPTIONS,
  statusMap,
  LogoUps,
} from "@/app/utils";
const PAGE_SIZE = 5;

export default function OrdersPage() {
  const [orders, setOrders] = useState<ShipmentCollectionInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const { session } = useAuth();

  const userid = session?.user?.sub;
  if (!userid) return <p>No estás logueado</p>;

  const toggleStatus = (status: string) => {
    if (statuses.includes(status)) {
      setStatuses(statuses.filter((s) => s !== status));
    } else {
      setStatuses([...statuses, status]);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const statusReverseMap: Record<string, string> = Object.fromEntries(
        Object.entries(statusMap).map(([key, value]) => [value, key])
      );
      const status = statuses
        .map((spanish) => statusReverseMap[spanish])
        .filter(Boolean);
      const pagination: PageOptionsDto = { page, perpage: PAGE_SIZE };
      const res = await FindAllShipment(
        userid,
        pagination,
        null,
        null,
        status,
        search
      );

      setOrders(res.records);
      setTotalPages(res.totalpages);
    } catch (err) {
      console.error("Error cargando envíos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, statuses]);

  // Reset página al cambiar filtros o búsqueda
  useEffect(() => {
    setPage(1);
  }, [search, statuses]);

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-2xl font-semibold mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Envíos
      </motion.h1>

      {/* Subheader */}
      <motion.div
        className="flex flex-wrap items-center justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Filtro de status */}
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer flex-wrap">
              {statuses.length === 0
                ? "Todos los estatus"
                : statuses.map((s) => statusMap[s] || s).join(", ")}
              <ChevronDownIcon />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content className="bg-white shadow-lg rounded-xl p-3 border border-gray-200 z-50 w-60">
              <div className="flex flex-col gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                      ${
                        statuses.includes(status)
                          ? "bg-[#02101d] text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    {statusMap[status] || status}
                    {statuses.includes(status) && (
                      <CheckIcon className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between">
                <button
                  onClick={() => {
                    setStatuses([]);
                    setOpen(false);
                  }}
                  className="text-sm text-[#02101d] hover:underline cursor-pointer"
                >
                  Limpiar filtros
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-sm text-gray-500 hover:underline cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Buscar */}
        <div className="flex gap-2 flex-1 min-w-[300px]">
          <input
            type="text"
            placeholder="Buscar por número de orden o rastreo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#02101d] focus:border-[#02101d]"
          />
          <Link
            href="/cuenta/folios"
            className="px-4 py-2 bg-[#02101d] text-white rounded-xl hover:bg-[#0e1b32] transition-colors cursor-pointer inline-block text-center"
          >
            Crear envío
          </Link>
        </div>
      </motion.div>

      {/* Tabla desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-fixed text-left border-collapse">
          <colgroup>
            <col className="w-1/6" />
            <col className="w-1/3" />
            <col className="w-1/3" />
            <col className="w-1/4" />
            <col className="w-1/6" />
            <col className="w-1/6" />
          </colgroup>
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Paquetería</th>
              <th className="px-4 py-2">Número de Orden</th>
              <th className="px-4 py-2">Dirección</th>
              <th className="px-4 py-2">Paquete</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : (
              orders.map((order, i) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium">
                    {order?.carrier_name === "dhl" && (
                      <img width={"60px"} src={LogoDHL} alt="DHL"></img>
                    )}
                    {order?.carrier_name === "paquetexpress" && (
                      <img
                        width={"60px"}
                        src={LogoPaqueteExpress}
                        alt="paquetexpress"
                      ></img>
                    )}
                    {order?.carrier_name === "fedex" && (
                      <img width={"60px"} src={LogoFedex} alt="Fedex"></img>
                    )}
                    {order?.carrier_name === "estafeta" && (
                      <img width={"60px"} src={LogoEstafeta} alt="Fedex"></img>
                    )}
                    {order?.carrier_name === "ups" && (
                      <img width={"60px"} src={LogoUps} alt="UPS"></img>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{order._id}</td>
                  <td className="px-4 py-3">
                    <div>
                      {order.address_from.address.street1} →{" "}
                      {order.address_to.address.street1}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {order.address_from.address.postal_code} →{" "}
                      {order.address_to.address.postal_code}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {order.packages.map((pkg) => (
                      <div key={pkg.id} className="mb-1">
                        <div className="text-gray-500 text-sm">
                          {pkg.length} x {pkg.height} x {pkg.width} CM
                        </div>
                        <div className="text-gray-500 text-sm">
                          {pkg.weight} Kg
                        </div>
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium`}>
                      {statusMap[order.status] || order.status}
                    </span>
                    {order.api_tracking_number && (
                      <div className="text-gray-500 text-sm">
                        {order.carrier_name.toUpperCase()} -{" "}
                        {order.api_tracking_number}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/cuenta/envios/${order._id}`}
                      className="px-3 py-1 bg-[#02101d] text-white rounded-xl hover:bg-[#0e1b32] cursor-pointer transition-colors inline-block text-center"
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
            orders.map((order) => (
              <motion.div
                key={order._id}
                className="bg-white shadow-md rounded-xl p-4 border border-gray-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{order._id}</span>
                  <Link
                    href={`/cuenta/envios/${order._id}`}
                    className="px-3 py-1 bg-[#02101d] text-white rounded-xl hover:bg-[#0e1b32] cursor-pointer transition-colors inline-block text-center"
                  >
                    Ver envío
                  </Link>
                </div>
                <div className="text-gray-500 text-sm mb-1">
                  {order.address_from.address.street1} →{" "}
                  {order.address_to.address.street1} (
                  {order.address_from.address.postal_code} →{" "}
                  {order.address_to.address.postal_code})
                </div>
                <div className="text-gray-500 text-sm mb-1">
                  {order.packages.map((pkg) => (
                    <div key={pkg.id}>
                      {pkg.package_type} - {pkg.length} x {pkg.height} x{" "}
                      {pkg.width} CM, {pkg.weight} Kg
                    </div>
                  ))}
                </div>
                <div className="text-gray-500 text-sm">
                  <span
                    className={`font-medium ${
                      order.status === "in_progress"
                        ? "text-orange-500"
                        : "text-green-600"
                    }`}
                  >
                    {statusMap[order.status] || order.status}
                  </span>
                  {order.api_tracking_number && (
                    <div className="text-gray-500 text-sm">
                      {order.carrier_name.toUpperCase()} -{" "}
                      {order.api_tracking_number}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Paginación */}
      <div className="flex justify-end gap-2 mt-4 flex-wrap">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span className="px-3 py-1">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </motion.div>
  );
}
