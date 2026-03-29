"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ItemDetail } from "@/type/supplier-history";
import { CancelPaymentSupplier } from "../services/folio";

interface ModalConfirmCancelPaymentProps {
  visible: boolean;
  onClose: () => void;
  refresh: () => void;
  item: ItemDetail;
  selectedHistoryId: string;
  setSelectedHistoryId: (value: string) => void;
}

export default function ModalConfirmCancelPayment({
  visible,
  onClose,
  refresh,
  item,
  selectedHistoryId,
  setSelectedHistoryId,
}: ModalConfirmCancelPaymentProps) {
  const [loading, setLoading] = useState(false);

  const handleCancelPayment = async () => {
    if (!selectedHistoryId || !item) return;

    try {
      setLoading(true);

      await CancelPaymentSupplier({
        historyid: selectedHistoryId,
        itemid: item._id,
      });

      refresh();
      setSelectedHistoryId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl flex flex-col gap-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold text-brand">
              ¿Cancelar pago?
            </h4>

            <p className="text-sm text-gray-600 leading-relaxed">
              Esta acción{" "}
              <span className="font-medium text-red-600">
                no se puede revertir
              </span>
              .
              <br />
              El monto será descontado del total pagado al proveedor.
            </p>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100  cursor-pointer"
              >
                Volver
              </button>

              <button
                onClick={handleCancelPayment}
                disabled={loading}
                className={`px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }  cursor-pointer`}
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Sí, cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
