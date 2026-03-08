"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import QuoteEditor from "./../../../../../../../../components/quoteEditor";
import type { CustomerInterface } from "@/type/folio.interface";
import { useParams } from "next/navigation";
import { Create as CreateQuote } from "../../../../../../../../services/quote";
import { Find as FindFolio } from "../../../../../../../../services/folio";
import { useAuth } from "@/components/authProvider";
import { QuoteDto } from "@/type/quote.dto";
import { ContactInterface } from "@/type/customer.interface";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/toast";

export default function QuoteCreatePage() {
  const router = useRouter();
  const params = useParams();
  const currentFolio = params.folio as string;
  const currentCost = params.costo as string;
  const { session } = useAuth();
  const userid = session?.user?.sub;
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [loadingQuote, setLoadingServiceCost] = useState(false);
  const [currency, setCurrency] = useState("MXN");
  const [customer, setCustomer] = useState<CustomerInterface | null>(null);
  const [contact, setContact] = useState<ContactInterface | null>(null);
  const [validUntil, setValidUntil] = useState<Date | null>(null);
  const [notes, setNotes] = useState<{ note: string; _id: string }[]>([]);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });
  let isMounted = false;
  const [items, setItems] = useState([]);
  const addItem = () =>
    setItems([
      ...items,
      {
        name: "",
        description: "",
        quantity: 1,
        currency: "MXN",
        usd_amount: 0,
        amount: 0,
        supplier: { name: "", _id: "" },
        tax: { name: "sin impuesto", amount: 0 },
      },
    ]);
  const removeItem = (i) => setItems(items.filter((_, index) => index !== i));
  const updateItem = async (index, field, value) => {
    const updated = [...items];
    const keys = field.split(".");

    let obj = updated[index];

    keys.forEach((key, i) => {
      if (i === keys.length - 1) {
        obj[key] = value;
      } else {
        obj[key] = obj[key] ?? {};
        obj = obj[key];
      }
    });

    setItems(updated);
  };

  const handleCreateQuote = async () => {
    try {
      setLoadingServiceCost(true);
      const folio = await FindFolio(currentFolio);
      const cost_service = folio?.service_cost?.find(
        (cost) => cost.no_service_cost === currentCost
      );
      const hasItems = (items?.length || 0) > 0;
      const hasUSDItem = items?.some((item) => item?.currency === "USD");
      const allItemsAreMXN = hasItems
        ? items.every((item) => item?.currency === "MXN")
        : false;
      const quoteCurrency = hasUSDItem
        ? "USD"
        : allItemsAreMXN
        ? "MXN"
        : currency;
      const quote: QuoteDto = {
        seller_userid: userid,
        customer_id: customer?._id,
        currency: quoteCurrency,
        notes: notes.map((n) => n.note),
        period_end_date: validUntil,
        contact_id: contact?._id,
        folio: currentFolio,
        service_cost: cost_service?._id,
        items: items?.map((item) => {
          return {
            name: item.name,
            currency: item.currency,
            description: item.description,
            amount: item.amount,
            usd_amount: item.usd_amount,
            quantity: item.quantity,
            tax: item.tax,
            supplier_id: item.supplier?._id || "",
          };
        }),
      };

      const quote_create = await CreateQuote(quote);
      console.log("lfkflh")
      setToast({
        visible: true,
        message: "Se creó la cotización correctamente",
        type: "success",
      });
      const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(4000);
      console.log("quote_createquote_createquote_create",JSON.stringify(quote_create))
      console.log("currentCostcurrentCost",currentCost)
      const find_service_cost = quote_create?.service_cost.find(
        (service) => service.no_service_cost === currentCost
      );
      router.push(
        `/cuenta/folios/${currentFolio}/costo/${
          find_service_cost?.no_service_cost
        }/cotizacion/${
          find_service_cost?.quotes?.[find_service_cost?.quotes.length - 1]
            ?.no_quote
        }`
      );
    } catch (err) {
      console.error(err);
      setToast({
        visible: true,
        message: "Ocurrió un error al crear la cotización",
        type: "error",
      });
    } finally {
      setLoadingServiceCost(false);
    }
  };

  const addNote = () => {
    setNotes((prev) => [
      ...prev,
      {
        _id: crypto.randomUUID(),
        note: "",
      },
    ]);
  };

  const updateNote = (value: string, index: number) => {
    setNotes((prev) =>
      prev.map((n, i) =>
        i === index
          ? {
              ...n,
              note: value,
            }
          : n
      )
    );
  };

  const removeNote = (index: number) => {
    setNotes((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (currentFolio) {
      if (isMounted) return;
      const loadFolio = async () => {
        try {
          const folio = await FindFolio(currentFolio);
          const find_service_cost = folio?.service_cost.find(
            (cost) => cost.no_service_cost === currentCost
          );
          setCurrency(find_service_cost?.currency);
          setItems(find_service_cost?.items);
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
        setCustomer={setCustomer}
        customer={customer}
        setCurrency={setCurrency}
        currentFolio={currentFolio}
        currentCost={currentCost}
        currentQuote={"1"}
        type={"quote"}
        mode={mode}
        items={items}
        notes={notes}
        currency={currency}
        validUntil={validUntil}
        setValidUntil={setValidUntil}
        updateItem={updateItem}
        addItem={addItem}
        removeItem={removeItem}
        updateNote={updateNote}
        addNote={addNote}
        removeNote={removeNote}
        setContact={setContact}
        contact={contact}
      />
      <div className="flex justify-end mt-10">
        <button
          onClick={handleCreateQuote}
          disabled={loadingQuote}
          className={`cursor-pointer px-6 py-3 rounded-xl text-white font-medium shadow transition ${
            loadingQuote
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#02101d] hover:bg-[#032037]"
          }`}
        >
          {loadingQuote ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin border-2 border-white border-t-transparent w-4 h-4 rounded-full"></span>
              Creando...
            </div>
          ) : (
            "Crear Cotización"
          )}
        </button>
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
