"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import QuoteEditor from "./../../../../../../components/quoteEditor";
import { useParams, useRouter } from "next/navigation";
import { Create as CreateServiceCost } from "../../../../../../services/folio";
import { Find as FindFolio, RegenerateServiceCostPdf } from "../../../../../../services/folio";
import { useAuth } from "@/components/authProvider";
import ModalViewQuotes from "@/components/viewQuotesModal";
import { Toast } from "@/components/toast";
import { FolioDtoInterface } from "@/type/folio.dto";

export default function QuoteCreatePage() {
  const params = useParams();
  const currentFolio = params.folio as string;
  const currentCost = params.costo as string;
  const { session } = useAuth();
  const router = useRouter();
  const userid = session?.user?.sub;
  const [mode, setMode] = useState<"edit" | "preview">("preview");
  const [loadingQuote, setLoadingServiceCost] = useState(false);
  const [currency, setCurrency] = useState("MXN");
  const [serviceCost, setServiceCost] = useState(null);

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({ visible: false, message: "", type: "error" });
  const [visibleQuotesModal, setVisibleQuotesModal] = useState(false);
  let isMounted = false;
  const [items, setItems] = useState([]);
  const [documentTotalsFromDb, setDocumentTotalsFromDb] = useState<{
    subtotal: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (currentFolio) {
      if (isMounted) return;
      const loadFolio = async () => {
        try {
          const folio = await FindFolio(currentFolio);
          const find_service_cost = folio?.service_cost.find(
            (cost) => cost.no_service_cost === currentCost,
          );
          setCurrency(find_service_cost?.currency);
          setItems(find_service_cost?.items);
          setServiceCost(find_service_cost);
          if (find_service_cost != null) {
            setDocumentTotalsFromDb({
              subtotal: Number(find_service_cost.subtotal ?? 0),
              total: Number(find_service_cost.total ?? 0),
            });
          } else {
            setDocumentTotalsFromDb(null);
          }
        } catch (error) {
          console.error("Error loading folio:", error);
        }
      };
      isMounted = true;
      loadFolio();
    }
  }, [currentFolio]);

  const handleDownloadPdf = async () => {
    if (!serviceCost?._id?.trim() || downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      await RegenerateServiceCostPdf(serviceCost?._id);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo generar el PDF.";
      setToast({ visible: true, message: msg, type: "error" });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const downloadBlocked =
    !currentCost?.trim() || loadingQuote || downloadingPdf;

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <QuoteEditor
        setCurrency={setCurrency}
        currentFolio={currentFolio}
        currentCost={currentCost}
        type={"cost"}
        mode={mode}
        items={items}
        notes={null}
        currency={currency}
        validUntil={null}
        setValidUntil={null}
        updateItem={null}
        addItem={null}
        removeItem={null}
        updateNote={null}
        addNote={null}
        removeNote={null}
        currentQuote={undefined}
        setCustomer={undefined}
        customer={undefined}
        contact={undefined}
        setContact={undefined}
        documentTotalsFromDb={documentTotalsFromDb}
      />

      <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-300">
        {/* Descargar PDF */}
        <button
          type="button"
          onClick={() => void handleDownloadPdf()}
          disabled={downloadBlocked}
          className={`btn btn-lg font-medium ${
            downloadBlocked
              ? "cursor-not-allowed border border-gray-300 bg-white text-gray-400 shadow-none"
              : "btn-soft-brand"
          }`}
        >
          {downloadingPdf ? "Generando PDF…" : "Descargar PDF"}
        </button>

        {/* Duplicar costo */}
        <Link
          href={`/cuenta/folios/${currentFolio}/costo/${currentCost}/nuevo`}
          className={`btn btn-lg ${
            loadingQuote
              ? "pointer-events-none border border-gray-300 bg-white text-gray-400 shadow-none"
              : "btn-soft-brand font-medium"
          }`}
        >
          Duplicar costo
        </Link>


        {/* Crear cotización */}
        <Link
          href={`/cuenta/folios/${currentFolio}/costo/${currentCost}/cotizacion/nuevo`}
          className={`btn btn-lg ${
            loadingQuote
              ? "pointer-events-none bg-gray-400 text-white shadow-none hover:bg-gray-400"
              : "btn-primary"
          }`}
        >
          Crear cotización
        </Link>
      </div>
      <ModalViewQuotes
        visible={visibleQuotesModal}
        onClose={() => setVisibleQuotesModal(false)}
        folio={currentFolio}
        service_cost={serviceCost}
      ></ModalViewQuotes>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </motion.div>
  );
}
