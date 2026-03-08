"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface NoteForm {
  note: string;
  _id: string;
}

interface ModalNoteProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: NoteForm) => Promise<void>;
  initialData?: NoteForm;
}

export default function ModalNote({
  visible,
  onClose,
  onSubmit,
  initialData,
}: ModalNoteProps) {
  const [form, setForm] = useState<NoteForm>({
    note: "",
    _id: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    note: "",
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
    if (!initialData) setForm({ note: "", _id: "" });
  }, [initialData]);

  // ESC para cerrar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async () => {
    const newErrors = {
      note: form.note.trim() ? "" : "La nota es obligatoria",
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    try {
      setLoading(true);
      await onSubmit(form);
      onClose();
      setForm({ note: "", _id: "" });
    } finally {
      setLoading(false);
    }
  };

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
              className="absolute top-4 right-4 text-black hover:text-gray-700"
            >
              ×
            </button>

            <h3 className="text-xl font-semibold text-center text-[#02101d]">
              {initialData ? "Editar nota" : "Nueva nota"}
            </h3>

            {/* Contenido */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">Nota *</label>
              <textarea
                rows={4}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg resize-none"
              />
              {errors.note && (
                <p className="text-red-500 text-sm">{errors.note}</p>
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
                className={`px-4 py-2 rounded-lg bg-[#02101d] text-white hover:bg-[#0e1b32] ${
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
