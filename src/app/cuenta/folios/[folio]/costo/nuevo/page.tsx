"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import QuoteEditor from "./../../../../../../components/quoteEditor";
import {  useRouter, useParams } from "next/navigation";
import { Create as CreateFolio } from "../../../../../../services/folio";
import { useAuth } from "@/components/authProvider";
import { FolioDtoInterface } from "@/type/folio.dto";
import { Toast } from "@/components/toast";
import { isValidMongoObjectId } from "@/app/utils";
import { resolveDocumentCurrencyFromItems } from "@/app/utils/documentCurrency";

export default function QuoteCreatePage() {
  const router = useRouter();
  const params = useParams();
  const currentFolio = params.folio as string;
  const { session } = useAuth();
  const userid = session?.user?.sub;
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [loadingQuote, setLoadingServiceCost] = useState(false);
  const [currency, setCurrency] = useState("MXN");


  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });
  const [items, setItems] = useState<
    {
      name: string;
      description?: string;
      amount: number;
      usd_amount: number;
      eur_amount: number;
      currency: string;
      quantity: number;
      tax: { name: string; amount: number; _id?: string };
      supplier: { name: string; _id: string };
    }[]
  >([
    {
      name: "",
      description: "",
      quantity: 1,
      amount: 0,
      currency: "MXN",
      usd_amount: 0,
      eur_amount: 0,
      supplier: { name: "", _id: "" },
      tax: { name: "sin impuesto", amount: 0 },
    },
  ]);
  const addItem = () =>
    setItems([
      ...items,
      {
        name: "",
        description: "",
        quantity: 1,
        currency: "MXN",
        usd_amount: 0,
        eur_amount: 0,
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
      const missingSupplier = items?.some(
        (item) => !isValidMongoObjectId(item?.supplier?._id),
      );
      if (missingSupplier) {
        setToast({
          visible: true,
          message:
            "Cada concepto debe tener un proveedor válido. Selecciona uno en todas las filas o vuelve a elegirlo si acabas de crear uno.",
          type: "error",
        });
        return;
      }
      const serviceCostCurrency = resolveDocumentCurrencyFromItems(
        items,
        currency,
      );

      const serviceCosteData: FolioDtoInterface = {
        seller_userid: userid,
        current_folio: currentFolio,
        currency: serviceCostCurrency,
        items: items?.map((item) => {
          return {
            name: item.name,
            currency: item.currency,
            description: item.description,
            amount: item.amount,
            usd_amount: item.usd_amount,
            eur_amount: Number(item.eur_amount ?? 0),
            quantity: item.quantity,
            tax: item.tax,
            supplier_id: item.supplier?._id || "",
          };
        }),
      };

      const folio = await CreateFolio(serviceCosteData);
      setToast({
        visible: true,
        message: "Se creó el costo correctamente",
        type: "success",
      });
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      await sleep(4000);
      const last_service_cost =
        folio?.service_cost?.[folio.service_cost.length - 1];
      router.push(
        "/cuenta/folios/" +
          folio?.folio +
          "/costo/" +
          last_service_cost?.no_service_cost
      );
    } catch (err) {
      console.error(err);
      setToast({
        visible: true,
        message: "Ocurrió un error al crear el costo",
        type: "error",
      });
    } finally {
      setLoadingServiceCost(false);
    }
  };

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <QuoteEditor
        setCurrency={setCurrency}
        currentFolio={currentFolio}
        type={"cost"}
        currentCost={""}
        mode={mode}
        items={items}
        notes={null}
        currency={currency}
        validUntil={null}
        setValidUntil={null}
        updateItem={updateItem}
        addItem={addItem}
        removeItem={removeItem}
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
        <button
          onClick={handleCreateQuote}
          disabled={loadingQuote}
          className={`btn btn-lg ${
            loadingQuote
              ? "cursor-not-allowed bg-gray-400 text-white shadow-none hover:bg-gray-400"
              : "btn-primary"
          }`}
        >
          {loadingQuote ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin border-2 border-white border-t-transparent w-4 h-4 rounded-full"></span>
              Creando...
            </div>
          ) : (
            "Crear Costo"
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
