"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { taxCollectionInterface } from "@/type/tax.interface";

interface ModalCreateImpuestoProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (tax: taxCollectionInterface) => void;
}

export default function ModalTaxSupplier({
  visible,
  onClose,
  onCreate,
}: ModalCreateImpuestoProps) {
  const [form, setForm] = useState<taxCollectionInterface>({
    name: "",
    amount: 0,
  });

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    amount: "",
  });

  const handleSubmit = async () => {
    const newErrors = {
      name: form.name.trim() ? "" : "El nombre es obligatorio",
      amount: form.amount >= 0 ? "" : "El monto debe ser mayor a 0",
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err !== "")) return;

    try {
      setLoading(true);
      await onCreate(form);

      onClose();
      setForm({ name: "", amount: 0 });
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
            className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full flex flex-col gap-6 relative"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-black hover:text-gray-700 text-lg"
            >
              ×
            </button>

            <h3 className="text-xl font-semibold text-center text-[#02101d]">
              Nuevo IMpuesto
            </h3>

            {/* Nombre */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`px-4 py-2 border rounded-lg w-full ${
                  errors.name ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="Nombre del provedor"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            {/* Monto */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">Monto</label>
              <input
                type="text"
                value={form.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  const numberValue = Number(value);
                  if (!isNaN(numberValue)) {
                    setForm({ ...form, amount: numberValue });
                  }
                }}
                className={`px-4 py-2 border rounded-lg w-full ${
                  errors.amount ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="Solo números"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm">{errors.amount}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-4 py-2 rounded-lg bg-[#02101d] text-white hover:bg-[#0e1b32] flex items-center gap-2 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? "Guardando..." : "Guardar provedor"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
