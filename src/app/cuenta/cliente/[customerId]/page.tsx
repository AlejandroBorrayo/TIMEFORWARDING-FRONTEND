"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/authProvider";
import { Find as FindCustomer } from "@/services/customer";
import { FindByCustomer } from "@/services/quote";
import { CustomerInterface } from "@/type/customer.interface";
import type { QuoteByCustomerItem } from "@/type/folio.interface";
import { formatDateDMY } from "@/app/utils";

export default function CustomerDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const customerId = params.customerId as string;
  const userid = session?.user?.sub;
  const isAdmin = session?.user?.role === "admin";

  const [customer, setCustomer] = useState<CustomerInterface | null>(null);
  const [items, setItems] = useState<QuoteByCustomerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const [customerData, quotesData] = await Promise.all([
        FindCustomer(customerId),
        FindByCustomer(customerId, !isAdmin ? userid : undefined),
      ]);
      setCustomer(customerData);
      setItems(
        (quotesData ?? []).sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        ),
      );
    } catch (err) {
      console.error("Error cargando datos del cliente:", err);
    } finally {
      setLoading(false);
    }
  }, [customerId, isAdmin, userid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!userid) return <p className="p-6">No estás logueado</p>;

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.h1
          className="text-2xl font-semibold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Histórico de cotizaciones
        </motion.h1>
      </div>

      {loading ? (
        <motion.div
          className="flex flex-col items-center justify-center py-12 gap-4 bg-gray-50 border border-gray-200 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.p
            className="text-gray-700 font-medium text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Cargando información...
          </motion.p>
        </motion.div>
      ) : (
        <>
          {customer && (
            <motion.div
              className="bg-white border border-gray-300 rounded-2xl p-6 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {customer.company}
                  </h2>
                  {customer.company_rfc && (
                    <p className="text-sm text-gray-500 mt-1">
                      RFC: {customer.company_rfc}
                    </p>
                  )}
                  {customer.contacts?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {customer.contacts.map((c, idx) => (
                        <p key={idx} className="text-sm text-gray-600">
                          <span className="font-medium">{c.name}</span>
                          {c.email && (
                            <span className="text-gray-500"> · {c.email}</span>
                          )}
                          {c.phone && (
                            <span className="text-gray-400"> · {c.phone}</span>
                          )}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-4 py-2 bg-green-50 rounded-xl text-center min-w-[80px]">
                  <p className="text-2xl font-bold text-green-600">
                    {items.length}
                  </p>
                  <p className="text-xs text-green-500">Cotizaciones</p>
                </div>
              </div>
            </motion.div>
          )}

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-200 rounded-2xl">
              <p className="text-xl text-gray-500 font-medium">
                No se encontraron cotizaciones para este cliente
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Aún no hay folios asociados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((entry, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white border border-gray-300 rounded-2xl p-6 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  {/* Folio + Costo + Seller row */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        Folio
                      </span>
                      <span className="font-bold text-gray-800">
                        {entry.folio}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        Costo #
                      </span>
                      <span className="font-semibold text-gray-700">
                        {entry.service_cost.no_service_cost}
                      </span>
                      {entry.service_cost.active ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                          Inactivo
                        </span>
                      )}
                    </div>

                    {entry.seller && (
                      <span className="text-gray-500">
                        {entry.seller.full_name}
                      </span>
                    )}

                    <span className="text-gray-400">
                      {formatDateDMY(entry.created_at)}
                    </span>
                  </div>

                  {/* Quote details */}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            Cotización
                          </span>
                          <span className="text-base font-bold text-gray-800">
                            #{entry.quote.no_quote}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            Total
                          </span>
                          <span className="text-base font-bold text-green-600">
                            {entry.quote.currency}{" "}
                            {entry.quote.total?.toFixed(2)}
                          </span>
                        </div>

                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                        <span>
                          {entry.quote.items?.length || 0} item(s)
                        </span>
                        <span>
                          Subtotal: {entry.quote.currency}{" "}
                          {entry.quote.subtotal?.toFixed(2)}
                        </span>
                        <span>
                          Impuesto: {entry.quote.currency}{" "}
                          {entry.quote.tax?.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500 flex-wrap">
                        <span>
                          Creación:{" "}
                          {formatDateDMY(entry.quote.created_at?.toString())}
                        </span>
                        {entry.quote.period_end_date && (
                          <span>
                            Vigencia:{" "}
                            {formatDateDMY(
                              entry.quote.period_end_date.toString(),
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0 flex-wrap">
                      <Link
                        href={`/cuenta/cliente/${customerId}/cotizacion/${entry.quote._id || entry.quote.no_quote}`}
                        className="btn btn-xs btn-primary font-medium"
                      >
                        Ver dashboard
                      </Link>
                      <Link
                        href={`/cuenta/folios/${entry.folio}/costo/${entry.service_cost.no_service_cost}/cotizacion/${entry.quote.no_quote}`}
                        className="px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-medium transition"
                      >
                        Ver cotización
                      </Link>
                      <Link
                        href={`/cuenta/folios/${entry.folio}/costo/${entry.service_cost.no_service_cost}`}
                        className="px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-medium transition"
                      >
                        Ver costo
                      </Link>
                      {entry.quote.pdf_url && (
                        <button
                          onClick={() =>
                            window.open(entry.quote.pdf_url, "_blank")
                          }
                          className="px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-medium transition cursor-pointer"
                        >
                          PDF
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
