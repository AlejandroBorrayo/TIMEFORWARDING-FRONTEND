"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ServiceCostInterface } from "@/type/folio.interface";
import { formatDateDMY } from "@/app/utils";

type ModalCreateCustomerProps = {
  visible: boolean;
  onClose: () => void;
  folio: string;
  service_cost: ServiceCostInterface;
};

export default function ModalViewQuotes({
  visible,
  onClose,
  folio,
  service_cost,
}: ModalCreateCustomerProps) {
  // ESC para cerrar
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
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
            className="bg-white p-8 rounded-xl shadow-2xl max-w-3xl w-full flex flex-col gap-6 relative"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-black hover:text-gray-700 font-bold text-lg cursor-pointer"
            >
              ×
            </button>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="relative"
            >
              {/* Punto timeline */}
              <span className="absolute -left-[11px] top-7 w-5 h-5 bg-[#02101d] rounded-full ring-4 ring-[#02101d]/20" />

              {/* Card costo */}
              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-5 ">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#02101d]/10 text-[#02101d]">
                      Costo #{service_cost?.no_service_cost}
                    </span>

                    <p className="text-sm text-gray-500">
                      {formatDateDMY(
                        service_cost?.created_at?.toString()
                      )}
                    </p>

                    {service_cost?.quotes?.length > 0 && (
                      <span className="text-xs text-gray-400">
                        · {service_cost.quotes.length} cotización(es)
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">


                    <Link
                      href={`/cuenta/folios/${folio}/costo/${service_cost?.no_service_cost}/cotizacion/nuevo`}
                      className="px-4 py-2 rounded-xl bg-[#02101d] text-white text-sm hover:bg-[#0e1b32] transition"
                    >
                      Crear cotización
                    </Link>
                  </div>
                </div>

                {/* Info principal */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-semibold">
                      {service_cost?.currency} {service_cost?.total}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Items</p>
                    <p className="text-lg font-medium">
                      {service_cost?.items.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cotizaciones - SIEMPRE VISIBLES */}
              <div className="mt-4 ml-6 space-y-3">
                {service_cost?.quotes && service_cost.quotes.length > 0 ? (
                  service_cost.quotes.map((quote, qIndex) => (
                    <div
                      key={qIndex}
                      className="bg-white border border-dashed border-gray-300 rounded-2xl p-4 hover:border-[#02101d] transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold">
                          Cotización #{quote.no_quote}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDateDMY(
                            quote.created_at?.toString()
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Cliente</p>
                          <p className="font-medium">
                            {quote.customer?.company ?? "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">Items</p>
                          <p className="font-medium">
                            {quote.items.length}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">Total</p>
                          <p className="font-semibold">
                            {quote.currency} {quote.total.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex items-end">
                          <Link
                            href={`/cuenta/folios/${folio}/costo/${service_cost?.no_service_cost}/cotizacion/${quote.no_quote}`}
                            className="text-sm text-[#02101d] hover:underline"
                          >
                            Ver cotización →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Sin cotizaciones asociadas
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
