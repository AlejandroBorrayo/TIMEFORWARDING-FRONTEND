"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CustomerPaymentHistoryInterface } from "@/type/folio.interface";
import ModalConfirmCancelCustomerPayment from "./cancelPaymentCustomerModal";

interface ModalCustomerHistoryProps {
  visible: boolean;
  quoteid: string;
  quoteCurrency: string;
  quoteTotal: number;
  history: CustomerPaymentHistoryInterface[];
  onClose: () => void;
  refresh: () => void;
}

export default function ModalCustomerHistory({
  visible,
  quoteid,
  quoteCurrency,
  quoteTotal,
  history,
  onClose,
  refresh,
}: ModalCustomerHistoryProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  const totalPaid = useMemo(() => {
    return history
      .filter((h) => h.status === "paid")
      .reduce((acc, curr) => acc + curr.payment, 0);
  }, [history]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

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
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-black hover:text-gray-700 text-lg"
            >
              ×
            </button>

            <h3 className="text-xl font-semibold text-center text-[#02101d]">
              Historial de cobros
            </h3>

            <div className="border border-gray-300 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span>Total cotización</span>
                <span className="font-medium">
                  {quoteCurrency} ${quoteTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total cobrado</span>
                <span className="font-medium text-green-600">
                  {quoteCurrency} ${totalPaid.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pendiente</span>
                <span className="font-medium text-yellow-600">
                  {quoteCurrency} ${Math.max(quoteTotal - totalPaid, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="border border-gray-300 rounded-xl overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 text-sm font-medium">
                Movimientos
              </div>

              {history.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">
                  No hay cobros registrados
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
                    {history.map((h, index) => (
                      <tr
                        key={h._id || index}
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
                            {h.status === "paid" ? "Cobrado" : "Cancelado"}
                          </span>
                        </td>
                        <td>
                          {h.status === "paid" && (
                            <button
                              onClick={() => {
                                setSelectedHistoryId(h._id ?? null);
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

            <div className="flex justify-end mt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <ModalConfirmCancelCustomerPayment
              visible={showCancelModal}
              quoteid={quoteid}
              selectedHistoryId={selectedHistoryId}
              onClose={() => {
                setShowCancelModal(false);
                setSelectedHistoryId(null);
              }}
              refresh={() => {
                setShowCancelModal(false);
                setSelectedHistoryId(null);
                refresh();
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
