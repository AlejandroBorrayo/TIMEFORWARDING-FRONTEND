"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ItemDetail } from "@/type/supplier-history";

interface ModalPaySupplierItemProps {
  visible: boolean;
  item: ItemDetail | null;
  onClose: () => void;
  onPay: (data: {
    payment: number;
    currency: string;
    itemid: string;
  }) => Promise<void>;
}

export default function ModalPaySupplierItem({
  visible,
  item,
  onClose,
  onPay,
}: ModalPaySupplierItemProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Total ya pagado (solo pagos exitosos)
   */
  const totalPaid = useMemo(() => {
    if (!item) return 0;

    return item.supplier.history
      .filter((h) => h.status === "paid")
      .reduce((acc, curr) => acc + curr.payment, 0);
  }, [item]);

  /**
   * Pendiente por pagar
   */
  const pendingAmount = useMemo(() => {
    if (!item) return 0;
    return Math.max(item.total - totalPaid, 0);
  }, [item, totalPaid]);

  const validateAmount = (value: string) => {
    if (!value) return "El monto es obligatorio";

    const numeric = Number(value);

    if (isNaN(numeric) || numeric <= 0) {
      return "El monto debe ser mayor a 0";
    }

    if (numeric > pendingAmount) {
      return "El monto no puede ser mayor al pendiente";
    }

    return "";
  };

  const handleSubmit = async () => {
    const validationError = validateAmount(amount);
    setError(validationError);

    if (validationError) return;

    try {
      setLoading(true);
      await onPay({
        payment: Number(amount),
        currency: item?.currency,
        itemid: item?._id,
      });
      setAmount("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full flex flex-col gap-6 relative"
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

            <h3 className="text-xl font-semibold text-center text-[#02101d]">
              Pago a proveedor
            </h3>

            {/* Info del item */}
            <div className="border border-gray-300 rounded-xl p-4  flex flex-col gap-2">
              <p className="font-medium text-[#02101d]">{item.name}</p>
              <p className="text-sm text-gray-500">{item.description}</p>

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

            {/* Pendiente */}
            <div className=" border border-gray-300 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Monto pendiente</p>
              <p className="text-2xl font-semibold text-[#02101d]">
                {item.currency} ${pendingAmount.toFixed(2)}
              </p>
            </div>

            {/* Monto a pagar */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">Monto a pagar *</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                className={`px-4 py-2 border rounded-lg w-full ${
                  error ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="Ingresa el monto"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading || pendingAmount === 0}
                className={`px-4 py-2 rounded-lg bg-[#02101d] text-white hover:bg-[#0e1b32] flex items-center gap-2 ${
                  loading || pendingAmount === 0
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                } cursor-pointer`}
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin cursor-pointer" />
                )}
                {pendingAmount === 0
                  ? "Pagado"
                  : loading
                  ? "Procesando..."
                  : "Confirmar pago"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
