"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Find as FindFolio } from "@/services/folio";
import { FolioCollectionInterface } from "@/type/folio.interface";
import { BRAND_PRIMARY } from "@/lib/brand";

const formatMoney = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

const normalizeCurrency = (currency?: string) =>
  currency?.toUpperCase() === "USD" ? "USD" : "MXN";

export default function FolioResumenPage() {
  const { folio } = useParams<{ folio: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [folioData, setFolioData] = useState<FolioCollectionInterface | null>(null);

  useEffect(() => {
    if (!folio) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await FindFolio(folio);
        setFolioData(data);
      } catch (err) {
        console.error("Error loading folio summary:", err);
        setError("No fue posible cargar el resumen del folio.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [folio]);

  const activeData = useMemo(() => {
    const activeCost = folioData?.service_cost?.find((cost) => cost.active) ?? null;
    const activeQuote = activeCost?.quotes?.find((quote) => quote.active) ?? null;

    return { activeCost, activeQuote };
  }, [folioData]);
  const sellerData = folioData?.seller_userid;

  const financial = useMemo(() => {
    const costTotal = activeData.activeCost?.total ?? 0;
    const saleTotal = activeData.activeQuote?.total ?? 0;
    const costWithoutTax = activeData.activeCost?.subtotal ?? 0;
    const saleWithoutTax = activeData.activeQuote?.subtotal ?? 0;
    const gp = saleWithoutTax - costWithoutTax;
    const commissionBase = gp;

    const commissionValue = Number(sellerData?.commission ?? 0);
    const commissionType = sellerData?.type_commission ?? "percentage";
    const rawSellerCommission =
      commissionType === "percentage"
        ? commissionBase * (commissionValue / 100)
        : commissionValue;
    const sellerCommission = Math.max(0, Math.round(rawSellerCommission));
    const utility = gp - sellerCommission;

    return {
      costTotal,
      saleTotal,
      costWithoutTax,
      saleWithoutTax,
      gp,
      commissionBase,
      commissionValue,
      commissionType,
      sellerCommission,
      utility,
    };
  }, [activeData.activeCost, activeData.activeQuote, sellerData]);

  const currency = normalizeCurrency(
    activeData.activeQuote?.currency ?? activeData.activeCost?.currency
  );

  const summaryColumns = useMemo(
    () => [
      { label: "Costo", value: financial.costTotal },
      { label: "Venta", value: financial.saleTotal },
      { label: "Costo sin IVA", value: financial.costWithoutTax },
      { label: "Venta sin IVA", value: financial.saleWithoutTax },
      { label: "GP", value: financial.gp },
      { label: "Comisión del vendedor", value: financial.sellerCommission },
      { label: "Utilidad", value: financial.utility },
    ],
    [financial],
  );

  const showUsdChart = currency === "USD";
  const showMxnChart = currency === "MXN";
  const hasBothCharts = showUsdChart && showMxnChart;
  const chartData = useMemo(
    () => [
      { name: "Costo s/IVA", value: financial.costWithoutTax },
      { name: "Venta s/IVA", value: financial.saleWithoutTax },
      { name: "GP", value: financial.gp },
      { name: "Comisión", value: financial.sellerCommission },
      { name: "Utilidad", value: financial.utility },
    ],
    [financial]
  );

  if (loading) return <p className="p-6">Cargando resumen...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!folioData) return <p className="p-6">No se encontró el folio.</p>;

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Resumen Folio {folioData.folio}</h1>
          <p className="text-sm text-gray-500">Montos activos y comisión del vendedor</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeData.activeCost ? (
            <Link
              href={`/cuenta/folios/${folioData.folio}/costo/${activeData.activeCost.no_service_cost}`}
              className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-medium"
            >
              Ver costo
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-xl border border-gray-200 text-gray-400 text-sm font-medium cursor-not-allowed">
              Ver costo
            </span>
          )}

          {activeData.activeCost && activeData.activeQuote ? (
            <Link
              href={`/cuenta/folios/${folioData.folio}/costo/${activeData.activeCost.no_service_cost}/cotizacion/${activeData.activeQuote.no_quote}`}
              className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-medium"
            >
              Ver cotización
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-xl border border-gray-200 text-gray-400 text-sm font-medium cursor-not-allowed">
              Ver cotización
            </span>
          )}

          <Link
            href={`/cuenta/folios/${folioData.folio}/proveedores`}
            className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-medium"
          >
            Dashboard proveedores
          </Link>

          {activeData.activeQuote?.customer_id && activeData.activeQuote?._id ? (
            <Link
              href={`/cuenta/cliente/${activeData.activeQuote.customer_id}/cotizacion/${activeData.activeQuote._id}`}
              className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-medium"
            >
              Dashboard cotización
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-xl border border-gray-200 text-gray-400 text-sm font-medium cursor-not-allowed">
              Dashboard cotización
            </span>
          )}

          <Link
            href="/cuenta/folios"
            className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-medium"
          >
            Volver a folios
          </Link>
        </div>
      </div>

      {!activeData.activeCost || !activeData.activeQuote ? (
        <div className="bg-white border border-gray-300 rounded-2xl p-6">
          <p className="text-gray-600">
            Este folio necesita un costo activo y una cotización activa para mostrar el resumen.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-300 rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Tabla de resumen</h2>
            <p className="text-sm text-gray-500 mt-1">
              GP = Venta sin IVA - Costo sin IVA.
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm min-w-[820px]">
                <thead>
                  <tr className="border-b border-gray-300 text-left text-gray-500">
                    {summaryColumns.map((column) => (
                      <th key={column.label} className="py-3 px-3 font-medium">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    {summaryColumns.map((column) => (
                      <td key={column.label} className="py-3 px-3 font-semibold">
                        {formatMoney(column.value, currency)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <p className="bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-500">Vendedor:</span>{" "}
                <span className="font-medium">
                  {folioData.seller_userid?.full_name ?? "Sin asignar"}
                </span>
              </p>
              <p className="bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-500">Tipo de comisión:</span>{" "}
                <span className="font-medium">
                  {financial.commissionType === "percentage"
                    ? `${financial.commissionValue}%`
                    : "Monto fijo"}
                </span>
              </p>
              <p className="bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-500">
                  Base comisión (venta sin IVA - costo sin IVA):
                </span>{" "}
                <span className="font-medium">
                  {formatMoney(financial.commissionBase, currency)}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-300 rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Gráficas comparativas por moneda</h2>
            <p className="text-sm text-gray-500 mt-1">
              Visual rápido de montos sin IVA, GP y comisión en USD y MXN.
            </p>

            <div className={`mt-5 ${hasBothCharts ? "grid grid-cols-1 xl:grid-cols-2 gap-6" : ""}`}>
              {showUsdChart && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Dólares (USD)</p>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatMoney(Number(value), "USD")} />
                        <Bar dataKey="value" fill={BRAND_PRIMARY} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {showMxnChart && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Pesos (MXN)</p>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatMoney(Number(value), "MXN")} />
                        <Bar dataKey="value" fill={BRAND_PRIMARY} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
