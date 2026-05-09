"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import QuoteEditor from "./../../../../../../../../components/quoteEditor";
import { useParams, useRouter } from "next/navigation";
import { Create as CreateServiceCost } from "../../../../../../../../services/folio";
import {
  Find as FindFolio,
  RegenerateQuotePdf,
} from "../../../../../../../../services/folio";
import { useAuth } from "@/components/authProvider";
import { Toast } from "@/components/toast";
import { FolioDtoInterface } from "@/type/folio.dto";
import { ContactInterface, CustomerInterface } from "@/type/customer.interface";

export default function QuoteCreatePage() {
  const params = useParams();
  const currentFolio = params.folio as string;
  const currentCost = params.costo as string;
  const currentCotizacion = params.cotizacion as string;
  const { session } = useAuth();
  const router = useRouter();
  const userid = session?.user?.sub;
  const [mode, setMode] = useState<"edit" | "preview">("preview");
  const [loadingQuote, setLoadingServiceCost] = useState(false);
  const [currency, setCurrency] = useState("MXN");
  const [notes, setNotes] = useState([]);
  const [validUntil, setValidUntil] = useState<Date | null>(null);
  const [customer, setCustomer] = useState<
    | {
        contact_name: string;
        contact_email: string;
        contact_phone: string;
        company: string;
        company_rfc: string;
      }
    | any
  >(null);

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({ visible: false, message: "", type: "error" });
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
            (cost) => cost.no_service_cost === currentCost
          );
          const find_quote = find_service_cost?.quotes.find(
            (quote) => quote.no_quote === currentCotizacion
          );
          setCurrency(find_quote?.currency);
          setItems(find_quote?.items);
          setNotes(find_quote?.notes);
          setValidUntil(find_quote?.period_end_date);
          setCustomer(find_quote?.customer);
          if (find_quote != null) {
            setDocumentTotalsFromDb({
              subtotal: Number(find_quote.subtotal ?? 0),
              total: Number(find_quote.total ?? 0),
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
    if (!currentCotizacion?.trim() || downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      await RegenerateQuotePdf(currentCotizacion.trim());
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo generar el PDF.";
      setToast({ visible: true, message: msg, type: "error" });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const downloadBlocked =
    !currentCotizacion?.trim() || loadingQuote || downloadingPdf;

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
        type={"quote"}
        mode={mode}
        items={items}
        notes={notes}
        currency={currency}
        validUntil={validUntil}
        setValidUntil={null}
        updateItem={null}
        addItem={null}
        removeItem={null}
        updateNote={null}
        addNote={null}
        removeNote={null}
        currentQuote={currentCotizacion}
        setCustomer={undefined}
        customer={customer}
        contact={
          {
            name: customer?.contact_name,
            email: customer?.contact_email,
          } as ContactInterface
        }
        setContact={undefined}
        documentTotalsFromDb={documentTotalsFromDb}
      />

      <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-300">
        <Link
          href={`/cuenta/folios/${currentFolio}/costo/${currentCost}`}
          className="btn btn-lg btn-soft-brand font-medium"
        >
          Ver costo
        </Link>
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
      </div>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </motion.div>
  );
}
