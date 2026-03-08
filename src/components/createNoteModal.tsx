"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SupplierCollectionInterface } from "@/type/supplier.interface";

interface ModalCreateSupplierProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (contact: SupplierCollectionInterface) => void;
}

export default function ModalCreateSupplier({
  visible,
  onClose,
  onCreate,
}: ModalCreateSupplierProps) {
  const [form, setForm] = useState<SupplierCollectionInterface>({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const validateEmail = (email: string) => {
    if (!email.trim()) return ""; // email opcional
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) ? "" : "Correo inválido";
  };

  const validatePhone = (phone: string) => {
    if (!phone) return "";
    return /^[0-9]+$/.test(phone) ? "" : "El teléfono debe ser numérico";
  };

  const handleSubmit = async () => {
    const newErrors = {
      name: form.name.trim() ? "" : "El nombre es obligatorio",
      email: validateEmail(form.email),
      phone: validatePhone(form.phone || ""),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err !== "")) return;

    try {
      setLoading(true);
      await onCreate(form);

      onClose();
      setForm({ name: "", email: "", phone: "" });
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
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-black hover:text-gray-700 text-lg"
            >
              ×
            </button>

            <h3 className="text-xl font-semibold text-center text-[#02101d]">
              Nuevo Proveedor
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

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">Email (opcional)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`px-4 py-2 border rounded-lg w-full ${
                  errors.email ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Teléfono */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">Teléfono (opcional)</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`px-4 py-2 border rounded-lg w-full ${
                  errors.phone ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="Solo números"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
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
