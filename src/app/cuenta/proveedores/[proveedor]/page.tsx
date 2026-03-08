"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useParams } from "next/navigation";
import ModalPaySupplierItem from "@/components/paymentSupplierModal";

/* ===================== SERVICES ===================== */
import {
  SupplierHistory as FetchSupplierHistory,
  PaymentSupplier,
} from "../../../../services/folio";

/* ===================== TYPES ===================== */
import { SupplierHistoryItem, ItemDetail } from "@/type/supplier-history";
import ModalSupplierHistory from "@/components/supplierHistoryModal";

/* ===================== COLORS ===================== */
const COLORS = ["#16a34a", "#f59e0b"];

/* ===================== PAGE ===================== */
export default function SupplierDashboardPage() {
  const params = useParams();
  const supplierId = params.proveedor as string;

  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemDetail | null>(null);
  const [records, setRecords] = useState<SupplierHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  

  /* ===================== FETCH ===================== */
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await FetchSupplierHistory(supplierId);
      setRecords(res ?? []);
    } catch (error) {
      console.error("Error fetching supplier history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supplierId) return;
    fetchHistory();
  }, [supplierId]);

  const handlePaymentSupplier = async (data: {
    payment: number;
    currency: string;
    itemid: string;
  }) => {
    await PaymentSupplier(data);
    fetchHistory();
  };

  /* ===================== CALCULATIONS ===================== */
  const calculations = useMemo(() => {
    const totals: Record<string, number> = {};
    const paid: Record<string, number> = {};

    records.forEach((r) => {
      const currency = r.item.currency;

      // TOTAL por moneda
      totals[currency] = (totals[currency] ?? 0) + r.item.total;

      // PAGADO por moneda (desde el history del item)
      r.item.supplier.history
        ?.filter((h) => h.status === "paid" && h.currency === currency)
        .forEach((h) => {
          paid[currency] = (paid[currency] ?? 0) + h.payment;
        });
    });

    const pending: Record<string, number> = {};
    Object.keys(totals).forEach((currency) => {
      pending[currency] = Math.max(totals[currency] - (paid[currency] ?? 0), 0);
    });

    return { totals, paid, pending };
  }, [records]);

  const currencies = Object.keys(calculations.totals);
  const supplierName = records[0]?.item?.supplier?.name;

  /* ===================== STATES ===================== */
  if (loading) return <p className="p-6">Cargando proveedor...</p>;
  if (!records.length) return <p className="p-6">Proveedor sin información</p>;

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ===================== HEADER ===================== */}
      <div>
        <h1 className="text-2xl font-semibold">{supplierName}</h1>
        <p className="text-sm text-gray-500">Dashboard del proveedor</p>
      </div>

      {/* ===================== CHARTS ===================== */}
      <div
        className={`grid gap-6 ${
          currencies.length === 1
            ? "grid-cols-1 place-items-center"
            : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {currencies.map((currency) => {
          const pieData = [
            { name: "Pagado", value: calculations.paid[currency] ?? 0 },
            {
              name: "Pendiente",
              value: calculations.pending[currency] ?? 0,
            },
          ];

          return (
            <div
              key={currency}
              className="bg-white border border-gray-300 rounded-2xl p-6 w-full max-w-xl"
            >
              <h2 className="font-semibold mb-4">
                Resumen financiero ({currency})
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
          );
        })}
      </div>

      {/* ===================== ITEMS ===================== */}
      <div className="bg-white border border-gray-300 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Items facturados</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="border-b border-gray-300 text-left text-gray-500">
                <th className="px-4 py-2 w-1/6">Item</th>
                <th className="px-4 py-2 w-1/4">Orden</th>
                <th className="px-4 py-2 w-1/8">Moneda</th>
                <th className="px-4 py-2 w-1/6">Total</th>
                <th className="px-4 py-2 w-1/8">Pagado</th>
                <th className="px-4 py-2 w-1/6">Pendiente</th>
                <th className="px-4 py-2 w-1/5">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {records.map((r, i) => {
                const currency = r.item.currency;
                const total = r.item.total;

                const paid =
                  r.item.supplier.history
                    ?.filter(
                      (h) => h.status === "paid" && h.currency === currency
                    )
                    ?.reduce((acc, h) => acc + h.payment, 0) ?? 0;

                const pending = Math.max(total - paid, 0);

                return (
                  <tr
                    key={i}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">{r.item.name}</td>
                    <td className="px-4 py-3 font-medium">{r.no_service_cost}</td>

                    <td className="px-4 py-3">{currency}</td>

                    <td className="px-4 py-3 font-medium">
                      {currency} {total.toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-green-700">
                      {currency} {paid.toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-yellow-700">
                      {currency} {pending.toFixed(2)}
                    </td>

                    <td className="px-3 py-3 flex items-center gap-2">
                      <p
                        className={`cursor-pointer text-blue-600 hover:underline ${
                          pending === 0 && "opacity-40 pointer-events-none"
                        }`}
                        onClick={() => {
                          setSelectedItem(r.item);
                          setShowPayModal(true);
                        }}
                      >
                        Realizar pago
                      </p>

                      <span className="text-gray-400">|</span>

                      <p
                        onClick={() => {
                          setSelectedItem(r.item);
                          setShowHistory(true);
                        }}
                        className="cursor-pointer text-blue-600 hover:underline"
                      >
                        Histórico
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== MODAL ===================== */}
      <ModalPaySupplierItem
        visible={showPayModal}
        item={selectedItem}
        onClose={() => setShowPayModal(false)}
        onPay={handlePaymentSupplier}
      />

      <ModalSupplierHistory
        visible={showHistory}
        item={selectedItem}
        onClose={() => setShowHistory(false)}
        refresh={()=>{
          setShowHistory(false)
          fetchHistory()
        }}
      />
    </motion.div>
  );
}
