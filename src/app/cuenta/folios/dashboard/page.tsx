"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FindAll as FindAllFolios,
  ReportCsv as ReportFoliosCsv,
} from "@/services/folio";
import { useAuth } from "@/components/authProvider";
import { Toast } from "@/components/toast";
import { FolioCollectionInterface } from "@/type/folio.interface";
import { PageOptionsDto } from "@/type/general";
import { formatDateDMY } from "@/app/utils";

const PAGE_SIZE = 10;

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

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultDateRange = () => {
  const today = new Date();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(today.getMonth() - 6);

  return {
    startDate: toDateInputValue(sixMonthsAgo),
    endDate: toDateInputValue(today),
  };
};

type DashboardRow = {
  id: string;
  folio: string;
  createdAt?: Date;
  seller: string;
  currency: string;
  costTotal: number;
  saleTotal: number;
  costWithoutTax: number;
  saleWithoutTax: number;
  gp: number;
  sellerCommission: number;
  utility: number;
};

const getRowFinancialData = (folio: FolioCollectionInterface): DashboardRow => {
  const activeCost = folio.service_cost?.find((cost) => cost.active) ?? null;
  const activeQuote = activeCost?.quotes?.find((quote) => quote.active) ?? null;

  const costTotal = activeCost?.total ?? 0;
  const saleTotal = activeQuote?.total ?? 0;
  const costWithoutTax = activeCost?.subtotal ?? 0;
  const saleWithoutTax = activeQuote?.subtotal ?? 0;
  const gp = saleWithoutTax - costWithoutTax;

  const commissionBase = gp;
  const commissionValue = Number(folio.seller_userid?.commission ?? 0);
  const commissionType = folio.seller_userid?.type_commission ?? "percentage";
  const rawSellerCommission =
    commissionType === "percentage"
      ? commissionBase * (commissionValue / 100)
      : commissionValue;
  const sellerCommission = Math.max(0, Math.round(rawSellerCommission));
  const utility = gp - sellerCommission;

  return {
    id: folio._id ?? folio.folio,
    folio: folio.folio,
    createdAt: folio.created_at,
    seller: folio.seller_userid?.full_name ?? "Sin asignar",
    currency: normalizeCurrency(activeQuote?.currency ?? activeCost?.currency),
    costTotal,
    saleTotal,
    costWithoutTax,
    saleWithoutTax,
    gp,
    sellerCommission,
    utility,
  };
};

export default function FoliosDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const userid = session?.user?.sub;
  const isAdmin = session?.user?.role === "admin";
  const defaultRange = useMemo(() => getDefaultDateRange(), []);

  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });
  const [folios, setFolios] = useState<FolioCollectionInterface[]>([]);
  const [folioFilter, setFolioFilter] = useState(
    () => searchParams.get("folio") ?? "",
  );
  const [sellerNameFilter, setSellerNameFilter] = useState(
    () => searchParams.get("vendedor") ?? "",
  );
  const [startDateFilter, setStartDateFilter] = useState(
    () => searchParams.get("fecha_inicio") ?? defaultRange.startDate,
  );
  const [endDateFilter, setEndDateFilter] = useState(
    () => searchParams.get("fecha_fin") ?? defaultRange.endDate,
  );

  const debouncedFolioFilter = useDebounce(folioFilter, 500);
  const debouncedSellerNameFilter = useDebounce(sellerNameFilter, 500);

  const fetchFolios = useCallback(async () => {
    if (!userid || !isAdmin) return;

    setLoading(true);
    setError("");
    try {
      const pagination: PageOptionsDto = { page: 1, perpage: PAGE_SIZE };
      const firstPage = await FindAllFolios(
        pagination,
        null,
        debouncedSellerNameFilter || undefined,
        debouncedFolioFilter || undefined,
        {
          start_date: startDateFilter || undefined,
          end_date: endDateFilter || undefined,
        },
      );

      const totalPages = firstPage.totalpages || 1;
      const allRecords = [...(firstPage.records ?? [])];

      if (totalPages > 1) {
        const remainingPages = Array.from(
          { length: totalPages - 1 },
          (_, index) => index + 2,
        );
        const responses = await Promise.all(
          remainingPages.map((pageNumber) =>
            FindAllFolios(
              { page: pageNumber, perpage: PAGE_SIZE },
              userid,
              debouncedSellerNameFilter || undefined,
              debouncedFolioFilter || undefined,
              {
                start_date: startDateFilter || undefined,
                end_date: endDateFilter || undefined,
              },
            ),
          ),
        );

        responses.forEach((response) => {
          allRecords.push(...(response.records ?? []));
        });
      }

      setFolios(allRecords);
    } catch (err) {
      console.error("Error cargando dashboard de folios:", err);
      setError("No fue posible cargar el dashboard general.");
    } finally {
      setLoading(false);
    }
  }, [
    debouncedFolioFilter,
    debouncedSellerNameFilter,
    endDateFilter,
    isAdmin,
    startDateFilter,
    userid,
  ]);

  const handleDownloadReport = useCallback(async () => {
    const userEmail = session?.user?.email;
    if (!userid || !userEmail) {
      setToast({
        visible: true,
        message: "No se encontró un correo en la sesión activa.",
        type: "error",
      });
      return;
    }

    setReportLoading(true);
    try {
      const response = await ReportFoliosCsv(
        { page: 1, perpage: PAGE_SIZE },
        !isAdmin ? userid : null,
        /* userEmail */ "alexborrayo21@hotmail.com",
        debouncedSellerNameFilter || undefined,
        debouncedFolioFilter || undefined,
        {
          start_date: startDateFilter || undefined,
          end_date: endDateFilter || undefined,
        },
      );
      setToast({
        visible: true,
        message: response.message || "Reporte solicitado.",
        type: "success",
      });
    } catch (reportError) {
      console.error("Error solicitando reporte CSV:", reportError);
      setToast({
        visible: true,
        message: "No fue posible solicitar el reporte.",
        type: "error",
      });
    } finally {
      setReportLoading(false);
    }
  }, [
    debouncedFolioFilter,
    debouncedSellerNameFilter,
    endDateFilter,
    session?.user?.email,
    startDateFilter,
    userid,
  ]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedFolioFilter) {
      params.set("folio", debouncedFolioFilter);
    } else {
      params.delete("folio");
    }

    if (debouncedSellerNameFilter) {
      params.set("vendedor", debouncedSellerNameFilter);
    } else {
      params.delete("vendedor");
    }

    params.set("fecha_inicio", startDateFilter || defaultRange.startDate);
    params.set("fecha_fin", endDateFilter || defaultRange.endDate);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [
    debouncedFolioFilter,
    debouncedSellerNameFilter,
    defaultRange.endDate,
    defaultRange.startDate,
    endDateFilter,
    router,
    searchParams,
    startDateFilter,
  ]);

  useEffect(() => {
    fetchFolios();
  }, [fetchFolios]);

  const rows = useMemo(() => folios.map(getRowFinancialData), [folios]);
  const chartDataByCurrency = useMemo(() => {
    const totals = rows.reduce(
      (acc, row) => {
        const currency = normalizeCurrency(row.currency);
        acc[currency].costWithoutTax += row.costWithoutTax;
        acc[currency].saleWithoutTax += row.saleWithoutTax;
        acc[currency].gp += row.gp;
        acc[currency].sellerCommission += row.sellerCommission;
        acc[currency].utility += row.utility;
        return acc;
      },
      {
        USD: {
          costWithoutTax: 0,
          saleWithoutTax: 0,
          gp: 0,
          sellerCommission: 0,
          utility: 0,
        },
        MXN: {
          costWithoutTax: 0,
          saleWithoutTax: 0,
          gp: 0,
          sellerCommission: 0,
          utility: 0,
        },
      },
    );

    return {
      USD: [
        { name: "Costo s/IVA", value: totals.USD.costWithoutTax },
        { name: "Venta s/IVA", value: totals.USD.saleWithoutTax },
        { name: "GP", value: totals.USD.gp },
        { name: "Comisión", value: totals.USD.sellerCommission },
        { name: "Utilidad", value: totals.USD.utility },
      ],
      MXN: [
        { name: "Costo s/IVA", value: totals.MXN.costWithoutTax },
        { name: "Venta s/IVA", value: totals.MXN.saleWithoutTax },
        { name: "GP", value: totals.MXN.gp },
        { name: "Comisión", value: totals.MXN.sellerCommission },
        { name: "Utilidad", value: totals.MXN.utility },
      ],
    };
  }, [rows]);
  const showUsdChart = useMemo(
    () => rows.some((row) => normalizeCurrency(row.currency) === "USD"),
    [rows],
  );
  const showMxnChart = useMemo(
    () => rows.some((row) => normalizeCurrency(row.currency) === "MXN"),
    [rows],
  );
  const hasBothCharts = showUsdChart && showMxnChart;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-lg rounded-xl p-8 text-center"
        >
          <h1 className="text-2xl font-semibold text-red-600 mb-2">
            Acceso denegado
          </h1>
          <p className="text-gray-600">
            Esta sección solo está disponible para administradores.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!userid) return <p className="p-6">No estás logueado</p>;

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            Dashboard General de Folios
          </h1>
          <p className="text-sm text-gray-500">
            Resumen financiero de costos, ventas, GP y comisión.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-2xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <input
            type="text"
            placeholder="Folio"
            value={folioFilter}
            onChange={(e) => setFolioFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[#02101d]"
          />
          <input
            type="text"
            placeholder="Vendedor"
            value={sellerNameFilter}
            onChange={(e) => setSellerNameFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[#02101d]"
          />
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[#02101d]"
          />
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[#02101d]"
          />
        </div>

        <div className="flex items-center justify-end mb-5 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadReport}
              disabled={reportLoading}
              className="px-3 py-1 rounded-xl bg-[#02101d] text-white hover:bg-[#0e1b32] text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reportLoading ? "Solicitando reporte..." : "Descargar reporte"}
            </button>
            <button
              onClick={() => {
                setFolioFilter("");
                setSellerNameFilter("");
                setStartDateFilter(defaultRange.startDate);
                setEndDateFilter(defaultRange.endDate);
              }}
              className="px-3 py-1 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <h2 className="text-lg font-semibold">Tabla de resumen</h2>
        <p className="text-sm text-gray-500 mt-1">
          GP = Venta sin IVA - Costo sin IVA.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm min-w-[1250px]">
            <thead>
              <tr className="border-b border-gray-300 text-left text-gray-500">
                <th className="py-3 px-3 font-medium">Folio</th>
                <th className="py-3 px-3 font-medium">Fecha</th>
                <th className="py-3 px-3 font-medium">Vendedor</th>
                <th className="py-3 px-3 font-medium">Costo</th>
                <th className="py-3 px-3 font-medium">Venta</th>
                <th className="py-3 px-3 font-medium">Costo sin IVA</th>
                <th className="py-3 px-3 font-medium">Venta sin IVA</th>
                <th className="py-3 px-3 font-medium">GP</th>
                <th className="py-3 px-3 font-medium">Comisión del vendedor</th>
                <th className="py-3 px-3 font-medium">Utilidad</th>
                <th className="py-3 px-3 font-medium">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-6 px-3 text-center text-gray-500"
                  >
                    Cargando dashboard...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-6 px-3 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-6 px-3 text-center text-gray-500"
                  >
                    No hay folios para mostrar.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100">
                    <td className="py-3 px-3 font-medium">{row.folio}</td>
                    <td className="py-3 px-3">
                      {row.createdAt
                        ? formatDateDMY(row.createdAt.toString())
                        : "-"}
                    </td>
                    <td className="py-3 px-3">{row.seller}</td>
                    <td className="py-3 px-3 font-semibold">
                      {formatMoney(row.costTotal, row.currency)}
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {formatMoney(row.saleTotal, row.currency)}
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {formatMoney(row.costWithoutTax, row.currency)}
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {formatMoney(row.saleWithoutTax, row.currency)}
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {formatMoney(row.gp, row.currency)}
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {formatMoney(row.sellerCommission, row.currency)}
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {formatMoney(row.utility, row.currency)}
                    </td>
                    <td className="py-3 px-3">
                      <Link
                        href={`/cuenta/folios/${row.folio}/resumen`}
                        className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs font-medium inline-block"
                      >
                        Ver resumen
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">
            Gráficas comparativas por moneda
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Visual rápido de montos sin IVA, GP y comisión en USD y MXN.
          </p>

          <div
            className={`mt-4 ${hasBothCharts ? "grid grid-cols-1 xl:grid-cols-2 gap-6" : ""}`}
          >
            {showUsdChart && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Dólares (USD)
                </p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartDataByCurrency.USD}
                      margin={{ top: 12, right: 12, left: 12, bottom: 12 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) =>
                          formatMoney(Number(value), "USD")
                        }
                      />
                      <Bar
                        dataKey="value"
                        fill="#02101d"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {showMxnChart && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Pesos (MXN)
                </p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartDataByCurrency.MXN}
                      margin={{ top: 12, right: 12, left: 12, bottom: 12 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) =>
                          formatMoney(Number(value), "MXN")
                        }
                      />
                      <Bar
                        dataKey="value"
                        fill="#02101d"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </motion.div>
  );
}

function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, value]);

  return debouncedValue;
}
