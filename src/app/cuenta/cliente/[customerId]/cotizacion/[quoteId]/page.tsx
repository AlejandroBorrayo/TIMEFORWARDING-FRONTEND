"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useAuth } from "@/components/authProvider";
import { Find as FindCustomer } from "@/services/customer";
import { FindByCustomer, CustomerPayment } from "@/services/quote";
import { CustomerInterface } from "@/type/customer.interface";
import type {
  QuoteByCustomerItem,
  CustomerPaymentHistoryInterface,
} from "@/type/folio.interface";
import { formatDateDMY } from "@/app/utils";

import ModalPayCustomer from "@/components/paymentCustomerModal";
import ModalCustomerHistory from "@/components/customerHistoryModal";

const COLORS = ["#16a34a", "#f59e0b"];

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();

  const customerId = params.customerId as string;
  const quoteId = params.quoteId as string;
  const userid = session?.user?.sub;
  const isAdmin = session?.user?.role === "admin";

  const [customer, setCustomer] = useState<CustomerInterface | null>(null);
  const [entry, setEntry] = useState<QuoteByCustomerItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [showPayModal, setShowPayModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  /* ===================== FETCH ===================== */

  const fetchData = useCallback(async () => {
    if (!customerId || !quoteId) return;
    setLoading(true);
    try {
      const [customerData, quotesData] = await Promise.all([
        FindCustomer(customerId),
        FindByCustomer(customerId, !isAdmin ? userid : undefined),
      ]);
      setCustomer(customerData);

      const found = (quotesData ?? []).find(
        (e) => e.quote._id === quoteId || e.quote.no_quote === quoteId,
      );
      setEntry(found ?? null);
    } catch (err) {
      console.error("Error cargando detalle:", err);
    } finally {
      setLoading(false);
    }
  }, [customerId, quoteId, isAdmin, userid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ===================== CALCULATIONS ===================== */

  const history: CustomerPaymentHistoryInterface[] = useMemo(
    () => entry?.quote?.history ?? [],
    [entry],
  );

  const totalPaid = useMemo(
    () =>
      history
        .filter((h) => h.status === "paid")
        .reduce((acc, h) => acc + h.payment, 0),
    [history],
  );

  const quoteTotal = entry?.quote?.total ?? 0;
  const pendingAmount = Math.max(quoteTotal - totalPaid, 0);
  const quoteCurrency = entry?.quote?.currency ?? "USD";

  const pieData = [
    { name: "Cobrado", value: totalPaid },
    { name: "Pendiente", value: pendingAmount },
  ];

  /* ===================== PAYMENT HANDLER ===================== */

  const handlePayment = async (data: {
    payment: number;
    currency: string;
  }) => {
    if (!entry?.quote?._id && !entry?.quote?.no_quote) return;
    await CustomerPayment({
      payment: data.payment,
      quoteid: entry.quote._id || entry.quote.no_quote,
      currency: data.currency,
    });
    fetchData();
  };

  /* ===================== STATES ===================== */

  if (!userid) return <p className="p-6">No estás logueado</p>;
  if (loading) return <p className="p-6">Cargando detalle...</p>;
  if (!entry) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Cotización no encontrada</p>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ===================== HEADER ===================== */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-semibold">
            Cotización #{entry.quote.no_quote}
          </h1>
        </div>
        <p className="text-sm text-gray-500 ml-14">
          Folio {entry.folio} · Costo {entry.service_cost.no_service_cost}
        </p>
      </div>

      {/* ===================== INFO + CHART (misma row) ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IZQUIERDA: Cliente + Cotización */}
        <div className="bg-white border border-gray-300 rounded-2xl p-6 space-y-6">
          {/* Cliente */}
          <div>
            <h2 className="font-semibold mb-3 text-gray-800">Cliente</h2>
            {customer && (
              <>
                <p className="text-lg font-bold text-gray-800">
                  {customer.company}
                </p>
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
              </>
            )}
          </div>

          <div className="border-t border-gray-200" />

          {/* Cotización */}
          <div>
            <h2 className="font-semibold mb-3 text-gray-800">
              Información de cotización
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Cotización</span>
                <span className="font-bold">#{entry.quote.no_quote}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Moneda</span>
                <span className="font-medium">{quoteCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">
                  {quoteCurrency} ${entry.quote.subtotal?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Impuesto</span>
                <span className="font-medium">
                  {quoteCurrency} ${entry.quote.tax?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-700 font-semibold">Total</span>
                <span className="font-bold text-green-600">
                  {quoteCurrency} ${quoteTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Creación</span>
                <span>
                  {formatDateDMY(entry.quote.created_at?.toString())}
                </span>
              </div>
              {entry.quote.period_end_date && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Vigencia</span>
                  <span>
                    {formatDateDMY(entry.quote.period_end_date.toString())}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Estado</span>
                {entry.quote.active ? (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Activo
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                    Inactivo
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DERECHA: Gráfica */}
        <div className="bg-white border border-gray-300 rounded-2xl p-6">
          <h2 className="font-semibold mb-4">
            Resumen financiero ({quoteCurrency})
          </h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  label
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===================== ACCIONES GENERALES ===================== */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setShowPayModal(true)}
          disabled={pendingAmount === 0}
          className={`btn btn-md btn-primary font-medium ${
            pendingAmount === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Registrar cobro
        </button>

        <button
          onClick={() => setShowHistory(true)}
          className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-medium transition cursor-pointer"
        >
          Histórico de cobros
        </button>

        {entry.quote.pdf_url && (
          <button
            onClick={() => window.open(entry.quote.pdf_url, "_blank")}
            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-medium transition cursor-pointer"
          >
            Ver PDF
          </button>
        )}
      </div>

      {/* ===================== ITEMS TABLE ===================== */}
      <div className="bg-white border border-gray-300 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Items de la cotización</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="border-b border-gray-300 text-left text-gray-500">
                <th className="px-4 py-2 w-1/4">Item</th>
                <th className="px-4 py-2 w-1/5">Descripción</th>
                <th className="px-4 py-2 w-1/8">Cantidad</th>
                <th className="px-4 py-2 w-1/6">Precio</th>
                <th className="px-4 py-2 w-1/6">Total</th>
              </tr>
            </thead>

            <tbody>
              {entry.quote.items?.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {item.description || "-"}
                  </td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">
                    {item.currency} ${item.amount?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {item.currency} ${item.total?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== MODALS ===================== */}
      <ModalPayCustomer
        visible={showPayModal}
        quoteCurrency={quoteCurrency}
        quoteTotal={quoteTotal}
        history={history}
        onClose={() => setShowPayModal(false)}
        onPay={handlePayment}
      />

      <ModalCustomerHistory
        visible={showHistory}
        quoteid={entry.quote._id || entry.quote.no_quote}
        quoteCurrency={quoteCurrency}
        quoteTotal={quoteTotal}
        history={history}
        onClose={() => setShowHistory(false)}
        refresh={() => {
          setShowHistory(false);
          fetchData();
        }}
      />
    </motion.div>
  );
}
