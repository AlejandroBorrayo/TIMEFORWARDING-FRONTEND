"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ModalConfirmDeleteNoteProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  type: string;
}

export default function ModalConfirmDeleteNote({
  visible,
  onClose,
  onConfirm,
  type,
}: ModalConfirmDeleteNoteProps) {
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
            className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full flex flex-col gap-6 relative"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Título */}
            <h3 className="text-xl font-semibold text-center text-brand">
              {type === "note" ? "Eliminar nota" : "Eliminar impuesto"}
            </h3>

            {/* Copy de confirmación */}
            <p className="text-center text-gray-700">
              {type === "note"
                ? "¿Estás seguro de que deseas eliminar esta nota?"
                : "¿Estás seguro de que deseas eliminar este impuesto?"}
              <br />
              <span className="text-sm text-gray-500">
                Esta acción no se puede deshacer.
              </span>
            </p>

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
