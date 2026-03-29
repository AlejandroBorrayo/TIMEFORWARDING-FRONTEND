"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface TaxForm {
  name: string;
  amount: number;
  _id?: string;
}

interface ModalNoteProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: TaxForm) => Promise<void>;
  initialData?: TaxForm;
}

export default function ModalNote({
  visible,
  onClose,
  onSubmit,
  initialData,
}: ModalNoteProps) {
  const [form, setForm] = useState<TaxForm>({
    name: "",
    amount: 0,
  });

  const [amountInput, setAmountInput] = useState(""); // 👈 valor visual

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    amount: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setAmountInput(
        initialData.amount ? initialData.amount.toString() : ""
      );
    } else {
      setForm({
        name: "",
        amount: 0,
      });
      setAmountInput("");
    }
  }, [initialData]);

  // Cerrar con ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleAmountChange = (value: string) => {
    // Solo números y un decimal
    const regex = /^\d*\.?\d*$/;
    if (!regex.test(value)) return;

    setAmountInput(value);

    const numericValue = Number(value);
    if (!isNaN(numericValue)) {
      setForm({ ...form, amount: numericValue });
    } else {
      setForm({ ...form, amount: 0 });
    }
  };

  const handleSubmit = async () => {
    const newErrors = {
      name: form.name.trim() ? "" : "El nombre del impuesto es obligatorio",
      amount: form.amount > 0 ? "" : "El monto debe ser mayor a 0",
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    try {
      setLoading(true);
      await onSubmit(form);
      onClose();
      setForm({ name: "", amount: 0});
      setAmountInput("");
    } finally {
      setLoading(false);
    }
  };

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
            {/* Cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-black hover:text-gray-700"
            >
              ×
            </button>

            <h3 className="text-xl font-semibold text-center text-brand">
              {initialData ? "Editar impuesto" : "Nuevo impuesto"}
            </h3>

            {/* Nombre */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">Nombre del impuesto *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            {/* Monto */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">Monto *</label>
              <input
                type="text"
                inputMode="decimal"
                value={amountInput}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm">{errors.amount}</p>
              )}
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
                disabled={loading}
                className={`btn btn-sm btn-primary ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                } cursor-pointer`}
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
