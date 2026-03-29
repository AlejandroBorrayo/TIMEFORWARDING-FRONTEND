"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import {
  CreateFolioWithoutCost,
  FindAll as FindAllFolios,
  SetQuoteActive,
  SetServiceCostActive,
} from "@/services/folio";
import {
  FolioCollectionInterface,
  QuoteInterface,
} from "@/type/folio.interface";
import { formatDateDMY } from "@/app/utils";
import { PageOptionsDto } from "@/type/general";
import { useAuth } from "@/components/authProvider";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";
import { Toast } from "@/components/toast";

const PAGE_SIZE = 5;
/** Tamaño de página al barrer todos los folios para calcular el siguiente código. */
const SUGGEST_FOLIO_PER_PAGE = 500;
/** Límite de seguridad por si el API devolviera totalpages incorrecto. */
const SUGGEST_FOLIO_MAX_PAGES = 2000;

/** Prefijo fijo del folio; el conteo numérico va después (TIME0001, TIME00000134, …). */
const FOLIO_SLUG_PREFIX = "TIME";
const FOLIO_SLUG_PAD = 4;

type SlugSeqAccumulator = {
  maxSeq: number;
  hasSlug: boolean;
  maxDigitLen: number;
};

function parseSlugSequenceDetail(
  folio: string,
): { value: number; digitLen: number } | null {
  const m = String(folio ?? "")
    .trim()
    .match(new RegExp(`^${FOLIO_SLUG_PREFIX}(\\d+)$`, "i"));
  if (!m) return null;
  const digits = m[1];
  const n = parseInt(digits, 10);
  if (Number.isNaN(n)) return null;
  return { value: n, digitLen: digits.length };
}

function accumulateSlugSequences(
  records: FolioCollectionInterface[],
  acc: SlugSeqAccumulator,
): void {
  for (const f of records) {
    const d = parseSlugSequenceDetail(f.folio ?? "");
    if (d) {
      acc.hasSlug = true;
      acc.maxSeq = Math.max(acc.maxSeq, d.value);
      acc.maxDigitLen = Math.max(acc.maxDigitLen, d.digitLen);
    }
  }
}

/** Siguiente código: max secuencia numérica en TIME* + 1; padding al mayor ancho visto (mín. 4). */
function formatNextSlugFromAccumulator(acc: SlugSeqAccumulator): string {
  if (!acc.hasSlug) {
    return `${FOLIO_SLUG_PREFIX}${String(1).padStart(FOLIO_SLUG_PAD, "0")}`;
  }
  const next = acc.maxSeq + 1;
  const pad = Math.max(
    FOLIO_SLUG_PAD,
    acc.maxDigitLen,
    String(next).length,
  );
  return `${FOLIO_SLUG_PREFIX}${String(next).padStart(pad, "0")}`;
}

export default function FoliosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const userid = session?.user?.sub;
  const is_admin = session?.user?.role === "admin";
  const [folioSearch, setFolioSearch] = useState(
    searchParams.get("folio") ?? "",
  );
  const [seller_name, setSeller_name] = useState(
    searchParams.get("usuario") ?? "",
  );
  const debouncedFolioSearch = useDebounce(folioSearch, 500);
  const debouncedSellerName = useDebounce(seller_name, 500);
  const [loading, setLoading] = useState(true);
  const [folios, setFolios] = useState<FolioCollectionInterface[]>([]);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  const [visibleQuotesModal, setVisibleQuotesModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  /** 👇 estados para dropdown */
  const [openFolios, setOpenFolios] = useState<Record<string, boolean>>({});
  const [openCosts, setOpenCosts] = useState<Record<string, boolean>>({});

  const [createFolioModalOpen, setCreateFolioModalOpen] = useState(false);
  const [suggestedFolio, setSuggestedFolio] = useState("");
  const [preparingSuggestedFolio, setPreparingSuggestedFolio] = useState(false);
  const [creatingFolio, setCreatingFolio] = useState(false);

  const fetchFolios = useCallback(async () => {
    setLoading(true);
    try {
      const pagination: PageOptionsDto = {
        page,
        perpage: PAGE_SIZE,
      };

      const res = await FindAllFolios(
        pagination,
        !is_admin ? userid : null,
        debouncedSellerName,
        debouncedFolioSearch,
      );
      const records = res.records?.map((folios) => {
        folios.service_cost = folios.service_cost?.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        );
        folios.service_cost.map((services) => {
          services.quotes.sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime(),
          );
        });
        return folios;
      });
      setFolios(records);
      setTotalPages(res.totalpages);
    } catch (err) {
      console.error("Error cargando folios:", err);
    } finally {
      setLoading(false);
    }
  }, [page, userid, debouncedSellerName, debouncedFolioSearch]);

  const handleViewQuote = (folio: FolioCollectionInterface) => {
    folio.service_cost.map((service) => {
      if (service.active) {
        service.quotes.map((quote) => {
          if (quote.active) {
            router.push(
              `/cuenta/folios/${folio.folio}/costo/${service.no_service_cost}/cotizacion/${quote.no_quote}`,
            );
          }
        });
      }
    });
  };

  const handleSetActiveCost = async (
    folio: string,
    no_service_cost: string,
  ) => {
    try {
      await SetServiceCostActive({ folio, no_service_cost });
      await fetchFolios();
    } catch (error) {
      console.log("Error activating service cost:", error);
    }
  };

  const handleSetActiveQuote = async (folio: string, quote: string) => {
    try {
      await SetQuoteActive({ folio, quote });
      await fetchFolios();
    } catch (error) {
      console.log("Error activating service cost:", error);
    }
  };

  const openCreateFolioModal = useCallback(async () => {
    setCreateFolioModalOpen(true);
    setPreparingSuggestedFolio(true);
    setSuggestedFolio("");
    const acc: SlugSeqAccumulator = {
      maxSeq: 0,
      hasSlug: false,
      maxDigitLen: 0,
    };
    if (!is_admin && !userid) {
      setSuggestedFolio(
        `${FOLIO_SLUG_PREFIX}${String(1).padStart(FOLIO_SLUG_PAD, "0")}`,
      );
      setPreparingSuggestedFolio(false);
      return;
    }
    try {
      let page = 1;
      let totalPages = 1;
      do {
        const res = await FindAllFolios(
          { page, perpage: SUGGEST_FOLIO_PER_PAGE },
          !is_admin ? userid : null,
          undefined,
          undefined,
        );
        totalPages = Math.max(1, res.totalpages ?? 1);
        accumulateSlugSequences(res.records ?? [], acc);
        page += 1;
      } while (page <= totalPages && page <= SUGGEST_FOLIO_MAX_PAGES);

      setSuggestedFolio(formatNextSlugFromAccumulator(acc));
    } catch {
      setSuggestedFolio(`${FOLIO_SLUG_PREFIX}${String(1).padStart(FOLIO_SLUG_PAD, "0")}`);
      setToast({
        visible: true,
        message: `No se pudo calcular el folio sugerido; se usará ${FOLIO_SLUG_PREFIX}${String(1).padStart(FOLIO_SLUG_PAD, "0")}.`,
        type: "error",
      });
    } finally {
      setPreparingSuggestedFolio(false);
    }
  }, [is_admin, userid]);

  const confirmCreateFolio = async () => {
    const folio = suggestedFolio.trim();
    if (!folio || preparingSuggestedFolio || !userid) return;
    setCreatingFolio(true);
    try {
      await CreateFolioWithoutCost({
        seller_userid: userid,
        folio,
      });
      setToast({
        visible: true,
        message: `Folio ${folio} creado correctamente`,
        type: "success",
      });
      setCreateFolioModalOpen(false);
      await fetchFolios();
    } catch (e) {
      const msg =
        e instanceof Error && e.message.includes("empresa")
          ? e.message
          : "No se pudo crear el folio. Intenta de nuevo.";
      setToast({
        visible: true,
        message: msg,
        type: "error",
      });
    } finally {
      setCreatingFolio(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedFolioSearch, debouncedSellerName]);

  useEffect(() => {
    fetchFolios();
  }, [fetchFolios]);

  useEffect(() => {
    setPage(1);
  }, [folioSearch, seller_name]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedFolioSearch) {
      params.set("folio", debouncedFolioSearch);
    } else {
      params.delete("folio");
    }

    if (debouncedSellerName) {
      params.set("usuario", debouncedSellerName);
    } else {
      params.delete("usuario");
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [debouncedFolioSearch, debouncedSellerName, router, searchParams]);

  useEffect(() => {
    const close = () => setOpenMenus({});
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  if (!userid) return <p className="p-6">No estás logueado</p>;

  return (
    <div className="p-6 mx-auto">
      {/* ===================== */}
      {/* FILTROS */}
      {/* ===================== */}
      <div className="flex flex-wrap gap-2 mb-6">
        <input
          type="text"
          placeholder="Buscar por folio"
          value={folioSearch}
          onChange={(e) => setFolioSearch(e.target.value)}
          className="flex-1 min-w-[220px] px-4 py-2 border border-gray-300 rounded-xl
                     focus:ring-1 focus:ring-brand"
        />

        {is_admin && (
          <input
            type="text"
            placeholder="Buscar por creador"
            value={seller_name}
            onChange={(e) => setSeller_name(e.target.value)}
            className="flex-1 min-w-[220px] px-4 py-2 border border-gray-300 rounded-xl
                       focus:ring-1 focus:ring-brand"
          />
        )}

        <button
          type="button"
          onClick={() => void openCreateFolioModal()}
          className="btn btn-sm btn-primary"
        >
          Crear folio
        </button>
        {is_admin && (
          <Link
            href="/cuenta/folios/dashboard"
            className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
          >
            Dashboard general
          </Link>
        )}
      </div>

      {loading ? (
        <motion.div
          key="loading"
          className="flex flex-col items-center justify-center py-12 gap-4 bg-gray-50 border border-gray-200 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.p
            className="text-gray-700 font-medium text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Cargando folios...
          </motion.p>
        </motion.div>
      ) : folios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-200 rounded-2xl">
          <p className="text-xl text-gray-500 font-medium">
            📂 No se encontraron folios
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      ) : (
        folios.map((folio) => {
          {
            /* ===================== */
          }
          {
            /* LISTA DE FOLIOS */
          }
          {
            /* ===================== */
          }
          let quote: QuoteInterface | null = null;
          folio?.service_cost?.map((cost) => {
            if (cost.active) {
              quote = cost.quotes.find((quote) => quote.active);
            }
          });
          const isFolioOpen = openFolios[folio._id];
          const num_qoutes =
            folio.service_cost?.reduce(
              (acc, cost) => acc + (cost.quotes?.length || 0),
              0,
            ) || 0;
          return (
            <div key={folio._id} className="mt-6">
              {/* ---------- FOLIO CARD ---------- */}
              <div
                className="bg-white border border-gray-300 rounded-2xl p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() =>
                  setOpenFolios((prev) => ({
                    ...prev,
                    [folio._id]: !prev[folio._id],
                  }))
                }
              >
                {/* Header con información del folio */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Folio {folio.folio}
                    </h2>

                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      {folio?.service_cost?.length > 0 && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
                          {folio.service_cost.length} costo(s)
                        </span>
                      )}

                      {num_qoutes > 0 && (
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full font-medium">
                          {num_qoutes} cotización(es)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {folio.seller_userid && (
                      <p className="text-sm font-medium text-gray-700">
                        {folio.seller_userid.full_name}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      {formatDateDMY(folio.created_at?.toString())}
                    </p>
                  </div>
                </div>

                {/* Botones de acción organizados */}
                <div
                  className="flex flex-wrap gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    href={`/cuenta/folios/${folio.folio}/resumen`}
                    className="px-4 py-2 rounded-xl transition border border-gray-300 hover:bg-gray-50 text-sm font-medium"
                  >
                    📑 Resumen
                  </Link>

                  <Link
                    href={`/cuenta/folios/${folio.folio}/proveedores`}
                    className="px-4 py-2 rounded-xl transition border border-gray-300 hover:bg-gray-50 text-sm font-medium"
                  >
                    📊 Dashboard proveedores
                  </Link>

                  {quote?.customer_id && (
                    <Link
                      href={`/cuenta/cliente/${quote?.customer_id}/cotizacion/${quote?._id}`}
                      className="px-4 py-2 rounded-xl transition border border-gray-300 hover:bg-gray-50 text-sm font-medium"
                    >
                      📊 Dashboard cotización
                    </Link>
                  )}

                  {folio?.service_cost?.map((item) => {
                    if (item.active) {
                      return (
                        <Link
                          key={`${item._id}-ver-costo`}
                          href={`/cuenta/folios/${folio.folio}/costo/${item.no_service_cost}`}
                          className="px-4 py-2 rounded-xl transition border border-gray-300 hover:bg-gray-50 text-sm font-medium"
                        >
                          💰 Ver costo
                        </Link>
                      );
                    }
                    return null;
                  })}

                  {folio?.service_cost?.map((item) => {
                    if (item.active) {
                      return item.quotes.map((quote) => {
                        if (quote.active) {
                          return (
                            <button
                              key={`${item._id}-${quote.no_quote}`}
                              onClick={() => handleViewQuote(folio)}
                              className="px-4 py-2 rounded-xl transition border border-gray-300 hover:bg-gray-50 text-sm font-medium cursor-pointer"
                            >
                              📄 Ver cotización
                            </button>
                          );
                        }
                        return null;
                      });
                    }
                    return null;
                  })}

                  {folio?.service_cost?.map((item) => {
                    if (item.active) {
                      return (
                        <Link
                          key={`${item._id}-nuevo-cotizacion`}
                          href={`/cuenta/folios/${folio.folio}/costo/${item.no_service_cost}/cotizacion/nuevo`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium"
                        >
                          ➕ Nueva cotización
                        </Link>
                      );
                    }
                    return null;
                  })}

                  <Link
                    href={`/cuenta/folios/${folio.folio}/costo/nuevo`}
                    className="btn btn-sm btn-primary text-sm font-medium"
                  >
                    ➕ Nuevo costo
                  </Link>
                </div>
              </div>

              {/* ===================== */}
              {/* DROPDOWN COSTOS */}
              {/* ===================== */}
              <div
                className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isFolioOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}
          `}
              >
                <div>
                  {folio.service_cost?.length > 0 ? (
                    folio.service_cost.map((serviceCost, index) => {
                      const costKey = `${folio._id}-${index}`;
                      const isCostOpen = openCosts[costKey];

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="pt-6 relative pl-6 border-l border-gray-200"
                        >
                          {/* ---------- COSTO CARD ---------- */}
                          <div
                            className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-5 cursor-pointer hover:shadow-sm transition-all"
                            onClick={() =>
                              setOpenCosts((prev) => ({
                                ...prev,
                                [costKey]: !prev[costKey],
                              }))
                            }
                          >
                            <div className="flex justify-between items-start gap-4">
                              {/* Información principal */}
                              <div className="flex-1 space-y-3">
                                {/* Primera fila - Info destacada */}
                                <div className="flex items-center gap-4 flex-wrap">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-500 uppercase">
                                      Costo #
                                    </span>
                                    <span className="text-lg font-bold text-gray-800">
                                      {serviceCost.no_service_cost}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-500 uppercase">
                                      Total
                                    </span>
                                    <span className="text-lg font-bold text-blue-600">
                                      {serviceCost.currency}{" "}
                                      {serviceCost.total.toFixed(2)}
                                    </span>
                                  </div>

                                  {serviceCost?.active ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                      ✓ Activo
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                                      Inactivo
                                    </span>
                                  )}
                                </div>

                                {/* Segunda fila - Info adicional */}
                                <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                                  <span>
                                    📦 {serviceCost.items.length} item(s)
                                  </span>
                                  <span>
                                    📋 {serviceCost.quotes.length}{" "}
                                    cotización(es)
                                  </span>
                                  <span>
                                    📅{" "}
                                    {formatDateDMY(
                                      serviceCost.created_at?.toString(),
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Menú de acciones */}
                              <div className="relative flex-shrink-0">
                                <DropdownMenu.Root>
                                  <DropdownMenu.Trigger asChild>
                                    <button
                                      onClick={(e) => e.stopPropagation()}
                                      className="p-2 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                                    >
                                      <DotsVerticalIcon className="w-5 h-5 text-gray-600" />
                                    </button>
                                  </DropdownMenu.Trigger>

                                  <DropdownMenu.Content
                                    side="bottom"
                                    align="end"
                                    sideOffset={8}
                                    onClick={(e) => e.stopPropagation()}
                                    className="z-50 w-52 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-lg"
                                  >
                                    <DropdownMenu.Item asChild>
                                      <Link
                                        href={`/cuenta/folios/${folio.folio}/costo/${serviceCost.no_service_cost}/nuevo`}
                                        className="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                      >
                                        Duplicar
                                      </Link>
                                    </DropdownMenu.Item>

                                    <DropdownMenu.Item
                                      onSelect={() =>
                                        window.open(
                                          serviceCost?.pdf_url,
                                          "_blank",
                                        )
                                      }
                                      className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                    >
                                      Descargar PDF
                                    </DropdownMenu.Item>

                                    <DropdownMenu.Item asChild>
                                      <Link
                                        href={`/cuenta/folios/${folio.folio}/costo/${serviceCost.no_service_cost}/cotizacion/nuevo`}
                                        className="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                      >
                                        Nueva cotización
                                      </Link>
                                    </DropdownMenu.Item>
                                    {!serviceCost?.active && (
                                      <DropdownMenu.Item
                                        onClick={() => {
                                          handleSetActiveCost(
                                            folio?.folio,
                                            serviceCost?.no_service_cost,
                                          );
                                        }}
                                        className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                      >
                                        Activar costo
                                      </DropdownMenu.Item>
                                    )}
                                  </DropdownMenu.Content>
                                </DropdownMenu.Root>
                              </div>
                            </div>
                          </div>

                          {/* ===================== */}
                          {/* DROPDOWN COTIZACIONES */}
                          {/* ===================== */}
                          <div
                            className={`
                        ml-6 overflow-hidden transition-all duration-300 ease-in-out
                        ${
                          isCostOpen
                            ? "max-h-[800px] opacity-100"
                            : "max-h-0 opacity-0"
                        }
                      `}
                          >
                            {serviceCost.quotes?.length > 0 ? (
                              <div className="space-y-3">
                                {serviceCost.quotes.map((quote, qIndex) => (
                                  <div
                                    key={qIndex}
                                    className="mt-6 bg-white border-2 border-dashed border-gray-300 rounded-2xl p-5 hover:border-gray-400 transition-all"
                                  >
                                    <div className="flex justify-between items-start gap-4">
                                      {/* Información de la cotización */}
                                      <div className="flex-1 space-y-3">
                                        {/* Primera fila - Info destacada */}
                                        <div className="flex items-center gap-4 flex-wrap">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-500 uppercase">
                                              Cotización
                                            </span>
                                            <span className="text-base font-bold text-gray-800">
                                              #{quote.no_quote}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-500 uppercase">
                                              Total
                                            </span>
                                            <span className="text-base font-bold text-green-600">
                                              {quote.currency}{" "}
                                              {quote.total.toFixed(2)}
                                            </span>
                                          </div>

                                          {quote?.active ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                              ✓ Activo
                                            </span>
                                          ) : (
                                            <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                                              Inactivo
                                            </span>
                                          )}
                                        </div>

                                        {/* Segunda fila - Info adicional */}
                                        <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                                          <span>
                                            🏢{" "}
                                            {quote.customer?.company ??
                                              "Sin cliente"}
                                          </span>
                                          <span>
                                            📦 {quote.items.length} item(s)
                                          </span>
                                          <span>
                                            📅 Creación:{" "}
                                            {formatDateDMY(
                                              quote.created_at?.toString(),
                                            )}
                                          </span>
                                          {quote?.period_end_date && (
                                            <span>
                                              ⏰ Vigencia:{" "}
                                              {formatDateDMY(
                                                quote.period_end_date.toString(),
                                              )}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Menú de acciones */}
                                      <div className="relative flex-shrink-0">
                                        <DropdownMenu.Root>
                                          <DropdownMenu.Trigger asChild>
                                            <button
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                              className="p-2 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                                            >
                                              <DotsVerticalIcon className="w-5 h-5 text-gray-600" />
                                            </button>
                                          </DropdownMenu.Trigger>

                                          <DropdownMenu.Content
                                            side="bottom"
                                            align="end"
                                            sideOffset={8}
                                            onClick={(e) => e.stopPropagation()}
                                            className="z-50 w-52 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-lg"
                                          >
                                            <DropdownMenu.Item asChild>
                                              <Link
                                                href={`/cuenta/folios/${folio.folio}/costo/${serviceCost.no_service_cost}/cotizacion/${quote.no_quote}`}
                                                className="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                              >
                                                Ver cotización
                                              </Link>
                                            </DropdownMenu.Item>

                                            <DropdownMenu.Item
                                              onSelect={() =>
                                                window.open(
                                                  quote?.pdf_url,
                                                  "_blank",
                                                )
                                              }
                                              className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                            >
                                              Descargar PDF
                                            </DropdownMenu.Item>

                                            {!quote?.active && (
                                              <DropdownMenu.Item
                                                onClick={() =>
                                                  handleSetActiveQuote(
                                                    folio?.folio,
                                                    quote?.no_quote,
                                                  )
                                                }
                                                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                              >
                                                Activar
                                              </DropdownMenu.Item>
                                            )}
                                          </DropdownMenu.Content>
                                        </DropdownMenu.Root>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-4 text-sm text-gray-400 italic ml-2">
                                Sin cotizaciones asociadas
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="mt-6 ml-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <p className="text-sm text-gray-500 italic text-center">
                        📋 Este folio no tiene costos registrados
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Pagination */}

      <div className="flex justify-end gap-2 mt-4 flex-wrap">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded-xl border border-gray-300 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span className="px-3 py-1">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded-xl border border-gray-300 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>

      <AnimatePresence>
        {createFolioModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!creatingFolio && !preparingSuggestedFolio) {
                setCreateFolioModalOpen(false);
              }
            }}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full flex flex-col gap-4 relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                disabled={creatingFolio || preparingSuggestedFolio}
                onClick={() => setCreateFolioModalOpen(false)}
                className="absolute top-4 right-4 text-black hover:text-gray-700 text-lg disabled:opacity-50"
              >
                ×
              </button>
              <h3 className="text-xl font-semibold text-brand pr-8">
                Confirmar nuevo folio
              </h3>
              <p className="text-sm text-gray-600">
                Se creará un folio <strong>sin costo de servicio</strong>. Por
                defecto el identificador sigue el formato{" "}
                <strong>
                  {FOLIO_SLUG_PREFIX}
                  {String(1).padStart(FOLIO_SLUG_PAD, "0")}
                </strong>
                ,{" "}
                <strong>
                  {FOLIO_SLUG_PREFIX}
                  {String(2).padStart(FOLIO_SLUG_PAD, "0")}
                </strong>
                , …: recorremos <strong>todos</strong> los folios de la empresa
                (paginando en lotes de {SUGGEST_FOLIO_PER_PAGE}), tomamos el mayor
                número entre los que empiezan por{" "}
                <code className="text-xs bg-gray-100 px-1 rounded">{FOLIO_SLUG_PREFIX}</code>{" "}
                y sumamos 1. Si no hay
                ninguno, se sugiere{" "}
                <strong>
                  {FOLIO_SLUG_PREFIX}
                  {String(1).padStart(FOLIO_SLUG_PAD, "0")}
                </strong>
                . Necesitas <strong>empresa activa</strong> en el menú superior.
              </p>
              {!userid && (
                <p className="text-sm text-amber-700">
                  No hay sesión de usuario; no se puede crear el folio.
                </p>
              )}
              {preparingSuggestedFolio ? (
                <p className="text-sm text-gray-500">Calculando folio…</p>
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Slug del folio (ej. {FOLIO_SLUG_PREFIX}
                    {String(1).padStart(FOLIO_SLUG_PAD, "0")})
                  </label>
                  <input
                    type="text"
                    value={suggestedFolio}
                    onChange={(e) => setSuggestedFolio(e.target.value)}
                    disabled={creatingFolio}
                    className="px-4 py-2 border border-gray-300 rounded-lg w-full font-mono"
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={creatingFolio || preparingSuggestedFolio}
                  onClick={() => setCreateFolioModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={
                    creatingFolio ||
                    preparingSuggestedFolio ||
                    !suggestedFolio.trim() ||
                    !userid
                  }
                  onClick={() => void confirmCreateFolio()}
                  className="btn btn-sm btn-primary disabled:opacity-50"
                >
                  {creatingFolio ? "Creando…" : "Confirmar y crear"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </div>
  );
}

export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
