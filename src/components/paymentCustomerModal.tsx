"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CustomerPaymentHistoryInterface } from "@/type/folio.interface";

interface ModalPayCustomerProps {
  visible: boolean;
  quoteCurrency: string;
  quoteTotal: number;
  history: CustomerPaymentHistoryInterface[];
  onClose: () => void;
  onPay: (data: { payment: number; currency: string }) => Promise<void>;
}

export default function ModalPayCustomer({
  visible,
  quoteCurrency,
  quoteTotal,
  history,
  onClose,
  onPay,
}: ModalPayCustomerProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const totalPaid = useMemo(() => {
    return history
      .filter((h) => h.status === "paid")
      .reduce((acc, curr) => acc + curr.payment, 0);
  }, [history]);

  const pendingAmount = useMemo(() => {
    return Math.max(quoteTotal - totalPaid, 0);
  }, [quoteTotal, totalPaid]);

  const validateAmount = (value: string) => {
    if (!value) return "El monto es obligatorio";
    const numeric = Number(value);
    if (isNaN(numeric) || numeric <= 0) return "El monto debe ser mayor a 0";
    if (numeric > pendingAmount) return "El monto no puede ser mayor al pendiente";
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validateAmount(amount);
    setError(validationError);
    if (validationError) return;

    try {
      setLoading(true);
      await onPay({ payment: Number(amount), currency: quoteCurrency });
      setAmount("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

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
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-black hover:text-gray-700 text-lg"
            >
              ×
            </button>

            <h3 className="text-xl font-semibold text-center text-[#02101d]">
              Registrar cobro
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
            </div>

            <div className="border border-gray-300 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Monto pendiente</p>
              <p className="text-2xl font-semibold text-[#02101d]">
                {quoteCurrency} ${pendingAmount.toFixed(2)}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium">Monto del cobro *</label>
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
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {pendingAmount === 0
                  ? "Cobrado"
                  : loading
                  ? "Procesando..."
                  : "Confirmar cobro"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
