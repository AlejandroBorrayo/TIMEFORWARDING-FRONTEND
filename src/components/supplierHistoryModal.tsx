"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ItemDetail } from "@/type/supplier-history";
import { CancelPaymentSupplier } from "../services/folio";
import ModalConfirmCancelPayment from "./cancelPaymentSupplierModal";

interface ModalSupplierHistoryProps {
  visible: boolean;
  item: ItemDetail | null;
  onClose: () => void;
  refresh: () => void;
}

export default function ModalSupplierHistory({
  visible,
  item,
  onClose,
  refresh
}: ModalSupplierHistoryProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null
  );

  /**
   * Total pagado (solo status paid)
   */
  const totalPaid = useMemo(() => {
    if (!item) return 0;

    return item.supplier.history
      .filter((h) => h.status === "paid")
      .reduce((acc, curr) => acc + curr.payment, 0);
  }, [item]);

  // Cerrar con ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!item) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col gap-6 relative"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-black hover:text-gray-700 text-lg"
            >
              ×
            </button>

            <h3 className="text-xl font-semibold text-center text-brand">
              Historial de pagos
            </h3>

            {/* Info del item */}
            <div className="border border-gray-300 rounded-xl p-4 flex flex-col gap-2">
              <p className="font-medium text-brand">{item.name}</p>
              {item.description && (
                <p className="text-sm text-gray-500">{item.description}</p>
              )}

              <div className="flex justify-between text-sm mt-2">
                <span>Proveedor</span>
                <span className="font-medium">{item.supplier.name}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Total del item</span>
                <span className="font-medium">
                  {item.currency} ${item.total.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Total pagado</span>
                <span className="font-medium text-green-600">
                  {item.currency} ${totalPaid.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Historial */}
            <div className="border border-gray-300 rounded-xl overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 text-sm font-medium">
                Movimientos
              </div>

              {item.supplier.history.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">
                  No hay pagos registrados
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Monto</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.supplier.history.map((h, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 last:border-none"
                      >
                        <td className="px-4 py-3">
                          {h.created_at
                            ? new Date(h.created_at).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {h.currency} ${h.payment.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              h.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {h.status === "paid" ? "Pagado" : "Cancelado"}
                          </span>
                        </td>
                        <td>
                          {h?.status === "paid" && (
                            <button
                              onClick={() => {
                                setSelectedHistoryId(h?._id);
                                setShowCancelModal(true);
                              }}
                              className="px-3 py-1 bg-red-600 text-white rounded-xl hover:bg-red-700 cursor-pointer transition-colors"
                            >
                              Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
            <ModalConfirmCancelPayment
              visible={showCancelModal}
              setSelectedHistoryId={setSelectedHistoryId}
              item={item}
              selectedHistoryId={selectedHistoryId}
              onClose={()=>{
                setShowCancelModal(false);
                setSelectedHistoryId(null);
              }}
              refresh={() => {
                setShowCancelModal(false);
                setSelectedHistoryId(null);
                refresh()
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
