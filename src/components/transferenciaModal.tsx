"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";

type RechargeModalProps = {
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  bank?: string;
  clabe?: string;
  beneficiary?: string;
  whatsapp?: string;
};

export default function RechargeModal({
  showModal,
  setShowModal,
  bank = process.env.NEXT_BANK_NAME,
  clabe = process.env.NEXT_BANK_CLABE,
  beneficiary = process.env.NEXT_BANK_PLACEHODER,
  whatsapp = process.env.NEXT_WHATSAPP_TIME_TREK
}: RechargeModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedField) return;
    const t = setTimeout(() => setCopiedField(null), 1800);
    return () => clearTimeout(t);
  }, [copiedField]);

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
    } catch {
      const input = document.createElement("input");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedField(label);
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowModal(false)}
        >
          <motion.div
            className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full flex flex-col gap-6 relative"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-center">
              Recarga a wallet
            </h3>

            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Realiza una transferencia bancaria utilizando los datos
              proporcionados. Una vez realizado el depósito, envía el
              comprobante al {" "}
              <span className="font-semibold text-green-600">
                WhatsApp {whatsapp}
              </span>
              .<br />
              Tu saldo será acreditado en tu wallet en un máximo de 10 minutos.
            </p>

            <div className="flex flex-col gap-3">
              <div className="p-4 border rounded-xl flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-500">Banco</div>
                  <div className="font-medium">{bank}</div>
                </div>
                <button
                  onClick={() => copy("Banco", bank)}
                  className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50 cursor-pointer transition inline-flex items-center gap-2"
                >
                  <ClipboardIcon className="w-4 h-4" />
                  Copiar
                </button>
              </div>

              <div className="p-4 border rounded-xl flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-500">CLABE</div>
                  <div className="font-mono text-sm">{clabe}</div>
                </div>
                <button
                  onClick={() => copy("CLABE", clabe)}
                  className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50 cursor-pointer transition inline-flex items-center gap-2"
                >
                  <ClipboardIcon className="w-4 h-4" />
                  Copiar
                </button>
              </div>

              <div className="p-4 border rounded-xl flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-500">Beneficiario</div>
                  <div className="font-medium">{beneficiary}</div>
                </div>
                <button
                  onClick={() => copy("Beneficiario", beneficiary)}
                  className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50 cursor-pointer transition inline-flex items-center gap-2"
                >
                  <ClipboardIcon className="w-4 h-4" />
                  Copiar
                </button>
              </div>
            </div>


              {copiedField && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                  <CheckIcon className="w-4 h-4" />
                  {copiedField} copiado
                </div>
              )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
