"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CompanyFormPayload, CompanyInterface } from "@/type/company.interface";

type CompanyModalProps = {
  visible: boolean;
  onClose: () => void;
  initial?: CompanyInterface | null;
  onSubmit: (payload: CompanyFormPayload) => Promise<void>;
  saving?: boolean;
};

export default function CompanyModal({
  visible,
  onClose,
  initial,
  onSubmit,
  saving = false,
}: CompanyModalProps) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!visible) return;
    setErr("");
    if (initial) {
      setName(initial.name ?? "");
      setLogo(initial.logo ?? "");
    } else {
      setName("");
      setLogo("");
    }
  }, [visible, initial]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, saving]);

  const handleSave = async () => {
    const n = name.trim();
    if (!n) {
      setErr("El nombre es obligatorio");
      return;
    }
    setErr("");
    await onSubmit({
      name: n,
      logo: logo.trim() || undefined,
    });
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
            className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full flex flex-col gap-5 relative"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="absolute top-4 right-4 text-black hover:text-gray-700 disabled:opacity-50 text-lg"
            >
              ×
            </button>

            <h3 className="text-xl font-semibold text-center text-[#02101d]">
              {initial ? "Editar empresa" : "Nueva empresa"}
            </h3>

            <div className="flex flex-col gap-2">
              <label className="font-medium">Nombre *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg w-full"
                placeholder="Nombre comercial"
                disabled={saving}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium">Logo (URL)</label>
              <input
                type="url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg w-full"
                placeholder="https://..."
                disabled={saving}
              />
            </div>

            {err && <p className="text-red-500 text-sm">{err}</p>}

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-[#02101d] text-white hover:bg-[#0e1b32] disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
