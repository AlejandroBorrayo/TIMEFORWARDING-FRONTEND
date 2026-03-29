"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import QuoteEditor from "./../../../../../../components/quoteEditor";
import { useParams, useRouter } from "next/navigation";
import { Create as CreateServiceCost } from "../../../../../../services/folio";
import { Find as FindFolio } from "../../../../../../services/folio";
import { useAuth } from "@/components/authProvider";
import ModalViewQuotes from "@/components/viewQuotesModal";
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

  const [pdf, setPdf] = useState("");
  const [visibleQuotesModal, setVisibleQuotesModal] = useState(false);
  let isMounted = false;
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (currentFolio) {
      if (isMounted) return;
      const loadFolio = async () => {
        try {
          const folio = await FindFolio(currentFolio);
          const find_service_cost = folio?.service_cost.find(
            (cost) => cost.no_service_cost === currentCost,
          );
          setPdf(find_service_cost?.pdf_url);
          setCurrency(find_service_cost?.currency);
          setItems(find_service_cost?.items);
          setServiceCost(find_service_cost);
        } catch (error) {
          console.error("Error loading folio:", error);
        }
      };
      isMounted = true;
      loadFolio();
    }
  }, [currentFolio]);

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
      />

      <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-300">
        {/* Descargar PDF */}
        <button
          onClick={() => window.open(pdf, "_blank")}
          disabled={!pdf || loadingQuote}
          className={`btn btn-lg font-medium ${
            !pdf || loadingQuote
              ? "cursor-not-allowed border border-gray-300 bg-white text-gray-400 shadow-none"
              : "btn-soft-brand"
          }`}
        >
          Descargar PDF
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
    </motion.div>
  );
}
