"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ===================== TYPES ===================== */
import { OrderSupplierGroup, OrderItem } from "@/type/OrderSupplierGroup.interface";
import { ItemDetail } from "@/type/supplier-history";

/* ===================== SERVICES ===================== */
import { GetOrderSuppliers, PaymentSupplier } from "@/services/folio";

/* ===================== MODALS ===================== */
import ModalPaySupplierItem from "@/components/paymentSupplierModal";
import ModalSupplierHistory from "@/components/supplierHistoryModal";

/* ===================== COLORS ===================== */
const COLORS = ["#16a34a", "#f59e0b"];

export default function OrderDashboardPage() {
  const { folio } = useParams<{ folio: string }>();

  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<OrderSupplierGroup[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemDetail | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  /* ===================== FETCH ===================== */

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await GetOrderSuppliers(folio);
      setGroups(res ?? []);
    } catch (error) {
      console.error("Error fetching order suppliers", error);
    } finally {
      setLoading(false);
    }
  }, [folio]);

  useEffect(() => {
    if (!folio) return;
    fetchOrder();
  }, [folio, fetchOrder]);

  /* ===================== PAYMENT HANDLER ===================== */
  const handlePaymentSupplier = async (data: {
    payment: number;
    currency: string;
    itemid: string;
  }) => {
    await PaymentSupplier(data);
    fetchOrder();
  };

  /* ===================== FLATTEN ===================== */

  const allItems: OrderItem[] = useMemo(() => {
    return groups.flatMap((g) => g.items);
  }, [groups]);

  /* ===================== CALCULATIONS ===================== */

  const calculations = useMemo(() => {
    const totals: Record<string, number> = {};
    const paid: Record<string, number> = {};

    allItems.forEach((item) => {
      const currency = item.currency;

      totals[currency] = (totals[currency] ?? 0) + item.total;

      item.supplier.history
        ?.filter((h) => h.status === "paid" && h.currency === currency)
        .forEach((h) => {
          paid[currency] = (paid[currency] ?? 0) + h.payment;
        });
    });

    const pending: Record<string, number> = {};
    Object.keys(totals).forEach((c) => {
      pending[c] = Math.max(totals[c] - (paid[c] ?? 0), 0);
    });

    return { totals, paid, pending };
  }, [allItems]);

  const currencies = Object.keys(calculations.totals);

  /* ===================== STATES ===================== */
  if (loading) return <p className="p-6">Cargando orden...</p>;
  if (!groups.length) return <p className="p-6">Orden sin información</p>;

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ===================== HEADER ===================== */}
      <div>
        <h1 className="text-2xl font-semibold">Orden {folio}</h1>
        <p className="text-sm text-gray-500">Dashboard de proveedores</p>
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

      {/* ===================== ITEMS TABLE ===================== */}
      <div className="bg-white border border-gray-300 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Items de la orden</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="border-b border-gray-300 text-left text-gray-500">
                <th className="px-4 py-2 w-1/6">Item</th>
                <th className="px-4 py-2 w-1/6">Proveedor</th>
                <th className="px-4 py-2 w-1/12">Moneda</th>
                <th className="px-4 py-2 w-1/8">Total</th>
                <th className="px-4 py-2 w-1/8">Pagado</th>
                <th className="px-4 py-2 w-1/8">Pendiente</th>
                <th className="px-4 py-2 w-1/5">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {allItems.map((item) => {
                const currency = item.currency;
                const total = item.total;

                const paid =
                  item.supplier.history
                    ?.filter(
                      (h) => h.status === "paid" && h.currency === currency
                    )
                    ?.reduce((acc, h) => acc + h.payment, 0) ?? 0;

                const pending = Math.max(total - paid, 0);
                return (
                  <tr
                    key={item._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">{item.name}</td>

                    <td className="px-4 py-3 font-medium">{item.supplier.name}</td>

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
                          setSelectedItem(item as unknown as ItemDetail);
                          setShowPayModal(true);
                        }}
                      >
                        Realizar pago
                      </p>

                      <span className="text-gray-400">|</span>

                      <p
                        onClick={() => {
                          setSelectedItem(item as unknown as ItemDetail);
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
        refresh={() => {
          setShowHistory(false);
          fetchOrder();
        }}
      />
    </motion.div>
  );
}
