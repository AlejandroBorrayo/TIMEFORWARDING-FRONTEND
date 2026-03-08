"use client";

import { motion, AnimatePresence } from "framer-motion";

type ToastProps = {
  message: string;
  type?: "success" | "error";
  visible: boolean;
  onClose?: () => void;
  duration?: number; // ms
};

export const Toast = ({ message, type = "success", visible, onClose, duration = 3000 }: ToastProps) => {
  // Cerrar automáticamente después de `duration`
  if (visible && onClose) {
    setTimeout(onClose, duration);
  }

  const bgColor = type === "success" ? "bg-[#101f37]" : "bg-red-600";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`fixed bottom-6 right-6 ${bgColor} text-white px-5 py-3 rounded-xl shadow-lg z-50`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
