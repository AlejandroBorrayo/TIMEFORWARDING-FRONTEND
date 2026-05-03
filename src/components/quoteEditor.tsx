"use client";
import SupplierSelect from "./supplierSelect";
import EditableField from "./editableField";
import { Find as FindSupplier } from "../services/supplier";
import { Create as CreateSupplier } from "../services/supplier";
import { Find as FindCustomer } from "../services/customer";
import { FindAll as FindAllNotes } from "../services/note";
import { Create as CreateCustomer } from "../services/customer";
import { Update as UpdateCustomer } from "../services/customer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConvertCurrency } from "../services/currency";
import ModalCreateSupplier from "./createSupplierModal";
import { SupplierCollectionInterface } from "@/type/supplier.interface";
import CustomerSelect from "./customers";
import ContactSelect from "./contacts";
import NotesSelect from "./notes";
import CurrencySelect from "./currencySelect";
import {
  formatDateDMY,
  isValidMongoObjectId,
  normalizeSupplierDocumentId,
} from "@/app/utils";
import { resolveDocumentCurrencyFromItems } from "@/app/utils/documentCurrency";
import ModalCrearCliente from "./createCustomerModal";
import ModalCrearContacto from "./createContactModal";
import { FindAll as FindAllTax } from "../services/tax";
import TaxSelect from "./taxes";

type QuoteEditorProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- props legacy del editor
  [key: string]: any;
};

export default function QuoteEditor({
  setCurrency,
  mode,
  items,
  notes,
  currency,
  validUntil,
  setValidUntil,
  updateItem,
  addItem,
  removeItem,
  updateNote,
  addNote,
  removeNote,
  /** Añade texto del catálogo: llena el primer hueco vacío o agrega una nota nueva. */
  pickCatalogNote,
  type,
  currentFolio,
  currentCost,
  currentQuote,
  setCustomer,
  customer,
  contact,
  setContact,
}: QuoteEditorProps) {
  const [openContactModal, setOpenContactModal] = useState(false);
  const [openNewCustomer, setOpenNewCustomer] = useState(false);
  const [refreshCustomers, setRefreshCustomers] = useState(true);
  const [openNewSupplier, setOpenNewSupplier] = useState(false);
  /** Índice de fila que abrió "Agregar proveedor" (asignar _id al guardar). */
  const [supplierModalRowIndex, setSupplierModalRowIndex] = useState<
    number | null
  >(null);
  /** Fila que abrió "Agregar impuesto" (ref: evita cierre obsoleto tras await Create). */
  const taxModalRowIndexRef = useRef<number | null>(null);
  const [refreshSupplier, setRefreshSupplier] = useState(true);
  const [refreshTax, setRefreshTax] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  /** Precio unitario en EUR solo en vista previa (sin `updateItem`). */
  const [previewEurByIndex, setPreviewEurByIndex] = useState<
    Record<number, number>
  >({});
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState<{ name: string; amount: number }[]>([]);
  const [impuestos, setImpuestos] = useState<
    { name: string; amount: number; _id?: string }[]
  >([]);
  const [currentNotes, setCurrentNotes] = useState<
    { note: string; _id?: string }[]
  >([]);

  const noteEntryText = (n: unknown) =>
    typeof n === "string" ? n : ((n as { note?: string })?.note ?? "");

  const noteEntryKey = (n: unknown, i: number) => {
    const id = (n as { _id?: string })?._id;
    return id ?? `note-${i}`;
  };

  /** Reinicia el select de notas tras elegir (no muestra la selección en el trigger). */
  const [catalogNotesPickKey, setCatalogNotesPickKey] = useState(0);

  useEffect(() => {
    setDate(new Date().toLocaleDateString());
    const fetchnotes = async () => {
      const imp = await FindAllTax({ page: 1, perpage: 1000 });
      const not = await FindAllNotes({ page: 1, perpage: 1000 });
      setImpuestos(imp?.records);
      setCurrentNotes(not?.records);
    };
    fetchnotes();
  }, []);

  useEffect(() => {
    const fetchTax = async () => {
      const imp = await FindAllTax({ page: 1, perpage: 1000 });
      setImpuestos(imp?.records);
    };
    if (refreshTax) {
      fetchTax();
      setRefreshTax(false);
    }
  }, [refreshTax]);

  const formatCurrency = (v: number, priority?: string) => {
    const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: priority ? priority : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  };

  /** Moneda del resumen (misma prioridad que subtotal/impuestos/total). Derivada de `items` para no desfasarse un render del estado. */
  const summaryCurrency = items.some((it) => it?.currency === "USD")
    ? "USD"
    : items.some((it) => it?.currency === "EUR")
      ? "EUR"
      : currency;

  const hasUsdLine = items.some((it) => it?.currency === "USD");
  const hasEurLine = items.some((it) => it?.currency === "EUR");
  const canMutateItems = typeof updateItem === "function";

  const itemsEurFingerprint = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return list
      .map(
        (it, idx) =>
          `${idx}:${it?.currency ?? ""}:${it?.amount ?? ""}:${it?.quantity ?? ""}:${it?.eur_amount ?? ""}`,
      )
      .join("|");
  }, [items]);

  /** Precio unitario en USD y EUR (el API a veces omite `eur_amount`). */
  const syncUsdEurFromUnitPrice = useCallback(
    async (rowIndex: number, unitAmount: number, lineCurrency: string) => {
      if (!canMutateItems) return;
      const amount = Number(unitAmount);
      if (!Number.isFinite(amount) || !lineCurrency) return;

      if (lineCurrency === "MXN") {
        const resUsd = await ConvertCurrency(amount, "MXN", "USD");
        if (resUsd?.rates?.["MXN"]) {
          updateItem(rowIndex, "usd_amount", amount / resUsd.rates["MXN"]);
        }
        const resEur = await ConvertCurrency(amount, "MXN", "EUR");
        if (resEur?.rates?.["MXN"]) {
          updateItem(rowIndex, "eur_amount", amount / resEur.rates["MXN"]);
        }
      } else if (lineCurrency === "EUR") {
        updateItem(rowIndex, "eur_amount", amount);
        const resUsd = await ConvertCurrency(amount, "EUR", "USD");
        if (resUsd?.rates?.["EUR"]) {
          updateItem(rowIndex, "usd_amount", amount / resUsd.rates["EUR"]);
        }
      } else if (lineCurrency === "USD") {
        updateItem(rowIndex, "usd_amount", amount);
        const resEur = await ConvertCurrency(amount, "USD", "EUR");
        if (resEur?.rates?.["USD"]) {
          updateItem(rowIndex, "eur_amount", amount / resEur.rates["USD"]);
        }
      }
    },
    [canMutateItems, updateItem],
  );

  /** Rellenar `eur_amount` al cargar ítems del backend sin ese campo (solo modo edición). */
  useEffect(() => {
    if (!canMutateItems || !items?.length || !hasEurLine) return;

    const needsHydration = (row: (typeof items)[0]) => {
      const amt = Number(row?.amount);
      if (!Number.isFinite(amt) || amt <= 0 || !row?.currency) return false;
      const eur = Number(row.eur_amount);
      if (row.currency === "EUR") {
        return !Number.isFinite(eur) || eur !== amt;
      }
      return !Number.isFinite(eur) || eur === 0;
    };

    let cancelled = false;
    (async () => {
      for (let i = 0; i < items.length; i++) {
        if (cancelled) return;
        const row = items[i];
        if (!needsHydration(row)) continue;
        await syncUsdEurFromUnitPrice(i, Number(row.amount), row.currency);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canMutateItems, hasEurLine, itemsEurFingerprint, syncUsdEurFromUnitPrice]);

  /** Vista previa sin `updateItem`: EUR por fila vía API (misma lógica que hidratar). */
  useEffect(() => {
    if (canMutateItems) {
      setPreviewEurByIndex({});
      return;
    }
    if (!items?.length || !hasEurLine) {
      setPreviewEurByIndex({});
      return;
    }

    let cancelled = false;
    (async () => {
      const next: Record<number, number> = {};
      for (let i = 0; i < items.length; i++) {
        if (cancelled) return;
        const row = items[i];
        const amt = Number(row?.amount);
        if (!Number.isFinite(amt) || amt <= 0 || !row?.currency) continue;

        if (row.currency === "EUR") {
          next[i] = amt;
          continue;
        }
        if (row.currency === "MXN") {
          const res = await ConvertCurrency(amt, "MXN", "EUR");
          if (res?.rates?.["MXN"]) {
            next[i] = amt / res.rates["MXN"];
          }
        } else if (row.currency === "USD") {
          const res = await ConvertCurrency(amt, "USD", "EUR");
          if (res?.rates?.["USD"]) {
            next[i] = amt / res.rates["USD"];
          }
        }
      }
      if (!cancelled) setPreviewEurByIndex(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [canMutateItems, hasEurLine, itemsEurFingerprint]);

  useEffect(() => {
    const eurUnitForRow = (row: (typeof items)[0], idx: number) =>
      Number(row?.eur_amount ?? 0) ||
      previewEurByIndex[idx] ||
      (row?.currency === "EUR" ? Number(row?.amount ?? 0) : 0);

    const unitForTax = (row: (typeof items)[0], idx: number) => {
      if (hasUsdLine) return Number(row?.usd_amount ?? 0);
      if (hasEurLine) return eurUnitForRow(row, idx);
      return Number(row?.amount ?? 0);
    };

    const impMap = new Map<string, number>();
    items.forEach((row, idx) => {
      if (!row?.tax?.name || row.tax.name === "sin impuesto") return;
      const currentAmount = impMap.get(row.tax.name) || 0;
      const taxAmount = Number(row?.tax?.amount || 0) / 100;
      const u = unitForTax(row, idx);
      impMap.set(row.tax.name, currentAmount + row.quantity * u * taxAmount);
    });
    const imp = Array.from(impMap.entries()).map(([name, amount]) => ({
      name,
      amount,
    }));

    const hasItems = (items?.length || 0) > 0;
    if (hasItems) {
      const docCurrency = resolveDocumentCurrencyFromItems(items, currency);
      if (docCurrency !== currency) {
        setCurrency(docCurrency);
      }
    }
    if (hasUsdLine) {
      setSubtotal(
        items.reduce((a, i) => a + i.quantity * Number(i?.usd_amount ?? 0), 0),
      );
      setTax(imp);
      setTotal(
        items.reduce((a, i) => {
          const u = Number(i?.usd_amount ?? 0);
          const impuesto =
            i.quantity * u * (Number(i?.tax?.amount || 0) / 100);
          return a + i.quantity * u + impuesto;
        }, 0),
      );
      return;
    }

    if (hasEurLine) {
      setSubtotal(
        items.reduce(
          (a, row, idx) => a + row.quantity * eurUnitForRow(row, idx),
          0,
        ),
      );
      setTax(imp);
      setTotal(
        items.reduce((a, row, idx) => {
          const u = eurUnitForRow(row, idx);
          const impuesto =
            row.quantity * u * (Number(row?.tax?.amount || 0) / 100);
          return a + row.quantity * u + impuesto;
        }, 0),
      );
      return;
    }

    setSubtotal(items.reduce((a, i) => a + i.quantity * i.amount, 0));
    setTax(imp);
    setTotal(
      items.reduce((a, i) => {
        const impuesto =
          i.quantity * i.amount * (Number(i?.tax?.amount || 0) / 100);
        return a + i.quantity * i.amount + impuesto;
      }, 0),
    );
  }, [
    items,
    hasUsdLine,
    hasEurLine,
    impuestos,
    setCurrency,
    currency,
    previewEurByIndex,
  ]);

  const handleCreateSupplier = async (
    supplier: SupplierCollectionInterface,
  ) => {
    try {
      const created = await CreateSupplier(supplier);
      setRefreshSupplier(true);
      if (supplierModalRowIndex !== null) {
        const id = normalizeSupplierDocumentId(created);
        if (isValidMongoObjectId(id)) {
          updateItem(supplierModalRowIndex, "supplier", {
            name: created?.name ?? supplier.name,
            _id: id,
          });
        }
      }
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  const handleChangeCustomer = async (val: string) => {
    const customerFind = await FindCustomer(val);
    setCustomer(customerFind);
  };

  const handleChangeSupplier = async (data: string, i: number) => {
    const find = await FindSupplier(data);
    const id = normalizeSupplierDocumentId(find);
    updateItem(i, "supplier", {
      name: find?.name ?? "",
      _id: id,
    });
  };

  const onChangeContact = async (contactEmail: string) => {
    const contactFind = customer.contacts.find(
      (cont) => cont.email === contactEmail,
    );
    setContact(contactFind);
  };

  const handleChangeAmount = async (data: number, i: number) => {
    updateItem(i, "amount", data);
    const row = items?.[i];
    if (row?.currency) {
      await syncUsdEurFromUnitPrice(i, data, row.currency);
    }
  };

  const handleChangeCurrency = async (data: string, i: number) => {
    updateItem(i, "currency", data);
    const row = items?.[i];
    if (row && data) {
      await syncUsdEurFromUnitPrice(i, row.amount, data);
    }
  };

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const hanldeCreateCustomer = async (customer) => {
    const new_customer = await CreateCustomer(customer);
    setRefreshCustomers(true);
    setCustomer(new_customer);
  };

  const hanldeCreateContact = async (contact) => {
    customer.contacts.push(contact);
    await UpdateCustomer(customer?._id, customer);
    setRefreshCustomers(true);
    setContact(contact);
  };

  return (
    <div className="">
      {/* LOGO + INFO EMPRESA */}
      <div className="flex items-start gap-6 ">
        <img
          src="https://i.postimg.cc/tRx2S91P/Captura-de-pantalla-2025-12-05-a-la(s)-3-46-29-p-m.png"
          alt="TimeForwarding Logo"
          className="w-34 object-contain"
        />

        <div className="text-left">
          <h1 style={{ marginBottom: "12px" }} className="text-xl text-brand">
            Time Forwarding
          </h1>
          <p className="text-gray-700 mb-1 last:mb-0">
            235 Periférico Boulevard Manuel Ávila Camacho, Ciudad de México
          </p>
          <p className="text-gray-700 mb-1 last:mb-0">
            contabilidad@timeforwarding.com.mx
          </p>
          <p className="text-gray-700 mb-1 last:mb-0">5552542235</p>
        </div>
      </div>
      {((type === "quote" && mode === "edit") ||
        (type === "quote" &&
          mode !== "edit" &&
          (customer || contact?.name))) && (
        <div className="my-8 flex flex-col gap-[12px]">
          <div className="flex items-center gap-4">
            <p className="font-medium w-[170px]">Nombre/Razón social:</p>
            <div className="flex-1">
              <CustomerSelect
                mode={mode}
                setRefreshCustomers={setRefreshCustomers}
                refreshCustomers={refreshCustomers}
                setOpenNewCustomer={setOpenNewCustomer}
                onChange={handleChangeCustomer}
                value={customer}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p className="font-medium w-[170px]">Correo Electrónico:</p>
            <div className="flex-1">
              <ContactSelect
                mode={mode}
                setRefreshCustomers={setRefreshCustomers}
                refreshCustomers={refreshCustomers}
                setOpenNewContact={() => setOpenContactModal(true)}
                onChange={onChangeContact}
                value={contact}
                customer={customer}
              />
            </div>
          </div>
        </div>
      )}

      <div className={"border-y border-gray-300 py-8 my-8"}>
        <div className="flex items-start gap-8 w-full">
          {/* DERECHA */}
          <div className={"space-y-2 flex-1"}>
            {/* ROW 1 */}
            <div className="flex items-center gap-4">
              <p className="font-medium whitespace-nowrap">Folio:</p>
              <span className="font-semibold">{currentFolio}</span>
            </div>

            <div className="flex items-center gap-4">
              <p className="font-medium whitespace-nowrap">
                {type === "quote" ? "No. Cotización:" : "No. de costo:"}
              </p>
              <span className="font-semibold">
                {type === "quote" ? currentQuote : currentCost}
              </span>
            </div>

            {/* ROW 2 */}
            <div className="flex items-center gap-4">
              <p className="font-medium whitespace-nowrap">Fecha:</p>
              <span className={"font-semibold"}>{date}</span>
            </div>

            {(mode === "preview" && !validUntil) || type !== "quote" ? null : (
              <div className="flex items-center gap-4">
                <p className="font-medium whitespace-nowrap">Vigencia:</p>
                {mode !== "preview" ? (
                  <input
                    type="date"
                    value={formatDateForInput(validUntil)}
                    onChange={(e) =>
                      setValidUntil(
                        e.target.value
                          ? new Date(e.target.value + "T00:00:00")
                          : null,
                      )
                    }
                    className=" px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                  />
                ) : (
                  <span className={"font-semibold"}>
                    {formatDateDMY(validUntil) || "—"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead className="bg-brand text-white">
          <tr>
            <th className="p-3 text-center ">Producto o servicio</th>
            {type !== "quote" && <th className="p-3 text-center ">Provedor</th>}
            <th className="p-3 text-center ">Moneda</th>
            <th className="p-3 text-center ">Precio</th>
            <th className="p-2 text-center ">Cantidad</th>
            <th className="p-2 text-center ">Impuesto</th>
            <th className="p-3 text-center ">Total</th>
            {hasUsdLine && <th className="p-3 text-center ">Total USD</th>}
            {hasEurLine && <th className="p-3 text-center ">Total EUR</th>}
            <th className="p-3 text-center"></th>
          </tr>
        </thead>

        <tbody>
          {items.map((it, i) => {
            const porcentaje = Number(it?.tax?.amount || 0);
            const impuestoNombre = it?.tax?.name;

            const subtotal = it.quantity * it.amount;
            const impuestoMonto = subtotal * (porcentaje / 100);
            const total = subtotal + impuestoMonto;

            const usdUnit = Number(it?.usd_amount ?? 0);
            const usd_subtotal = it.quantity * usdUnit;
            const usd_impuesto_monto = usd_subtotal * (porcentaje / 100);
            const usd_amount = usd_subtotal + usd_impuesto_monto;

            const eurUnit =
              Number(it?.eur_amount ?? 0) ||
              previewEurByIndex[i] ||
              (it?.currency === "EUR" ? Number(it?.amount ?? 0) : 0);
            const eur_subtotal = it.quantity * eurUnit;
            const eur_impuesto_monto = eur_subtotal * (porcentaje / 100);
            const eurLineTotal = eur_subtotal + eur_impuesto_monto;

            return (
              <tr
                key={i}
                className="
            align-top
            border-b border-[#d0d0d0] border-b-[1px]
            even:bg-[#f4f6f9]
          "
              >
                {/* PRODUCTO */}
                <td className="p-3 text-center align-top">
                  <div className="flex flex-col gap-1">
                    <EditableField
                      mode={mode}
                      value={it.name}
                      placeholder="Nombre"
                      onChange={(v) => updateItem(i, "name", v)}
                      className="w-full text-center font-semibold"
                    />
                    <EditableField
                      mode={mode}
                      value={it.description}
                      placeholder="Descripción"
                      onChange={(v) => updateItem(i, "description", v)}
                      className="w-full text-center text-gray-600 text-sm"
                    />
                  </div>
                </td>
                {type !== "quote" && (
                  <td className="p-4 align-top  text-center">
                    <SupplierSelect
                      setRefreshSupplier={setRefreshSupplier}
                      refreshSupplier={refreshSupplier}
                      setOpenNewSupplier={setOpenNewSupplier}
                      onBeforeOpenNewSupplier={() =>
                        setSupplierModalRowIndex(i)
                      }
                      onChange={(v) => handleChangeSupplier(v, i)}
                      value={it?.supplier}
                      mode={mode}
                    />
                  </td>
                )}

                <td className="p-4 align-top  text-center">
                  {/* MONEDA */}
                  <CurrencySelect
                    handleChangeCurrency={handleChangeCurrency}
                    mode={mode}
                    it={it}
                    index={i}
                  ></CurrencySelect>
                </td>

                {/* PRECIO */}
                <td className="p-3 text-center align-top">
                  <EditableField
                    kind="number"
                    mode={mode}
                    value={it.amount}
                    onChange={(v) => handleChangeAmount(Number(v), i)}
                    className="w-[80px] text-center"
                  />
                </td>

                {/* CANTIDAD */}
                <td className="p-3 text-center align-top">
                  <EditableField
                    kind="number"
                    mode={mode}
                    value={it.quantity}
                    onChange={(v) => updateItem(i, "quantity", Number(v))}
                    className="w-[80px] text-center"
                  />
                </td>

                {/* IMPUESTO */}
                <td className="p-3 text-center align-top">
                  {mode === "edit" ? (
                    <TaxSelect
                      setRefreshTax={setRefreshTax}
                      value={it?.tax}
                      onBeforeOpenNewTax={() => {
                        taxModalRowIndexRef.current = i;
                      }}
                      onTaxModalDismiss={() => {
                        taxModalRowIndexRef.current = null;
                      }}
                      onTaxCreated={(created) => {
                        const row = taxModalRowIndexRef.current;
                        if (row === null) return;
                        const id = normalizeSupplierDocumentId(created);
                        updateItem(row, "tax", {
                          name: created.name,
                          amount: created.amount,
                          ...(isValidMongoObjectId(id) ? { _id: id } : {}),
                        });
                      }}
                      onChange={(value) => {
                        if (value === "no-tax" || value === "none") {
                          updateItem(i, "tax", {
                            name: "sin impuesto",
                            amount: 0,
                          });
                          return;
                        }
                        const findImpuestos = impuestos.find(
                          (imp) => imp?._id === value,
                        );
                        if (!findImpuestos) return;
                        updateItem(i, "tax", {
                          name: findImpuestos.name,
                          amount: findImpuestos.amount,
                          _id: findImpuestos._id,
                        });
                      }}
                      mode={"edit"}
                    ></TaxSelect>
                  ) : (
                    /*     <Select.Root
                      value={
                        it?.tax?.name === "sin impuesto"
                          ? "none"
                          : it?.tax?.name
                      }
                      onValueChange={(value) => {
                        if (value === "none") {
                          updateItem(i, "tax.name", "sin impuesto");
                          updateItem(i, "tax.amount", 0);
                          return;
                        }

                        const imp = impuestos.find((x) => x.name === value);

                        updateItem(i, "tax.name", imp.name);
                        updateItem(i, "tax.amount", imp.amount);
                      }}
                    >
                      <Select.Trigger
                        className="
                    w-full px-3 py-2 text-sm border border-gray-300 rounded-md
                    focus:outline-none focus:ring-1 focus:ring-brand
                    focus:border-brand
                    flex justify-between items-center bg-white text-gray-700
                  "
                      >
                        <Select.Value placeholder="Sin impuesto" />
                        <Select.Icon>
                          <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                        </Select.Icon>
                      </Select.Trigger>

                      <Select.Portal>
                        <Select.Content
                          position="popper"
                          className="
                      overflow-hidden bg-white rounded-lg shadow-lg z-50
                      border border-gray-200
                      min-w-[var(--radix-select-trigger-width)]
                    "
                        >
                          <Select.Viewport className="p-1">
                            <Select.Item
                              value="none"
                              className="
                          relative flex items-center px-8 py-2 text-sm rounded-md
                          cursor-pointer select-none
                          hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                        "
                            >
                              <Select.ItemText>Sin impuesto</Select.ItemText>
                              <Select.ItemIndicator className="absolute left-2">
                                <CheckIcon className="w-3 h-3 text-gray-500" />
                              </Select.ItemIndicator>
                            </Select.Item>

                            {impuestos.map((imp) => (
                              <Select.Item
                                key={imp._id}
                                value={imp.name}
                                className="
                            relative flex items-center px-8 py-2 text-sm rounded-md
                            cursor-pointer select-none
                            hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                          "
                              >
                                <Select.ItemText>
                                  {imp.name} ({imp.amount}%)
                                </Select.ItemText>
                                <Select.ItemIndicator className="absolute left-2">
                                  <CheckIcon className="w-3 h-3 text-gray-500" />
                                </Select.ItemIndicator>
                              </Select.Item>
                            ))}
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root> */
                    <span>
                      {impuestoNombre && impuestoNombre !== "sin impuesto"
                        ? `${impuestoNombre} (${porcentaje}%)`
                        : "Sin impuesto"}
                    </span>
                  )}
                </td>

                {/* TOTAL */}
                <td className="p-3 text-center align-top font-semibold whitespace-nowrap">
                  {formatCurrency(total, it.currency)}
                </td>
                {hasUsdLine && (
                  <td className="p-3 text-center align-top font-semibold whitespace-nowrap">
                    {formatCurrency(usd_amount, "USD")}
                  </td>
                )}
                {hasEurLine && (
                  <td className="p-3 text-center align-top font-semibold whitespace-nowrap">
                    {formatCurrency(eurLineTotal, "EUR")}
                  </td>
                )}
                {mode !== "edit" && <td className="p-3"></td>}

                {/* REMOVE */}
                {mode === "edit" && (
                  <td className="p-3 text-center align-top">
                    <button
                      onClick={() => removeItem(i)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {mode === "edit" && (
        <button
          onClick={addItem}
          className="mt-4 text-green-600 cursor-pointer"
        >
          + Agregar concepto
        </button>
      )}

      <div className="mt-10 flex flex-col items-end space-y-1">
        {/* Subtotal */}
        <div className="grid grid-cols-[140px_auto] gap-x-8 text-right">
          <span className="text-gray-600">Subtotal</span>
          <span style={{ minWidth: "120px" }}>
            {formatCurrency(subtotal, summaryCurrency)}
          </span>
        </div>

        {/* Impuestos */}
        {tax.map((imp, index) => {
          if (!imp?.name || imp?.amount === 0) return null;
          return (
            <div
              key={index}
              className="grid grid-cols-[140px_auto] gap-x-8 text-right"
            >
              <span className="text-gray-600">{imp.name}</span>
              <span style={{ minWidth: "120px" }}>
                {formatCurrency(imp.amount, summaryCurrency)}
              </span>
            </div>
          );
        })}

        {/* Total */}
        <div className="grid grid-cols-[140px_auto] gap-x-8 text-right pt-1 ">
          <span className="font-semibold text-lg">Total</span>
          <span style={{ minWidth: "120px" }} className="font-bold text-lg">
            {formatCurrency(total, summaryCurrency)}
          </span>
        </div>
      </div>

      {type === "quote" &&
        (mode === "edit" || (mode !== "edit" && notes?.length > 0)) && (
          <div className="mt-10 w-full min-w-0 max-w-full border-t border-gray-300 py-8 my-8">
            {(mode === "edit" || notes?.length > 0) && (
              <h3 className="font-semibold mb-4">Notas</h3>
            )}

            {mode === "edit" && pickCatalogNote && addNote && removeNote ? (
              <div className="w-full max-w-none space-y-8">
                <p className="text-xs text-gray-500 max-w-3xl">
                  Cada elección del catálogo se añade abajo; el select vuelve a
                  “Selecciona una nota”. <strong>Agregar nota</strong> crea un
                  espacio vacío para completar con la siguiente elección.
                </p>
                <div className="w-full min-w-0 max-w-3xl">
                  <NotesSelect
                    key={catalogNotesPickKey}
                    className="w-full min-w-0"
                    value={undefined}
                    onChange={(val) => {
                      if (!val?.trim()) return;
                      pickCatalogNote(val);
                      setCatalogNotesPickKey((k) => k + 1);
                    }}
                    mode={"edit"}
                    index={0}
                  />
                </div>

                <div className="w-full space-y-10 pt-2">
                  {(notes?.length ? notes : []).map((n, i) => (
                    <div
                      key={noteEntryKey(n, i)}
                      className="w-full border-b border-gray-100 pb-10 last:border-0 last:pb-0"
                    >
                      <div
                        className="w-full text-sm leading-relaxed text-gray-800 whitespace-pre-wrap break-words"
                        aria-live="polite"
                      >
                        {noteEntryText(n).trim() ? (
                          noteEntryText(n)
                        ) : (
                          <span className="text-gray-400">
                            Pendiente: elige una nota del catálogo para rellenar
                            este espacio.
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNote(i)}
                        className="mt-3 text-sm font-medium text-red-600 hover:underline"
                      >
                        Eliminar nota
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : mode === "edit" &&
              updateNote &&
              addNote &&
              removeNote &&
              !pickCatalogNote ? (
              <div className="w-full space-y-10">
                {(notes?.length ? notes : []).map((n, i) => (
                  <div
                    key={noteEntryKey(n, i)}
                    className="w-full border-b border-gray-100 pb-10 last:border-b-0 last:pb-0"
                  >
                    <div className="w-full min-w-0">
                      <NotesSelect
                        className="w-full min-w-0"
                        value={n}
                        onChange={updateNote}
                        mode={"edit"}
                        index={i}
                      />
                    </div>
                    <div className="mt-4 w-full text-sm leading-relaxed text-gray-800 whitespace-pre-wrap break-words">
                      {noteEntryText(n).trim() ? (
                        noteEntryText(n)
                      ) : (
                        <span className="text-gray-400">
                          Elige una nota en el catálogo.
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNote(i)}
                      className="mt-3 text-sm font-medium text-red-600 hover:underline"
                    >
                      Eliminar nota
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {mode !== "edit" && notes?.length > 0 && (
              <div className="w-full space-y-8">
                {notes
                  .filter((n) => noteEntryText(n).trim())
                  .map((n, i) => (
                    <div
                      key={noteEntryKey(n, i)}
                      className="w-full text-sm leading-relaxed text-gray-800 whitespace-pre-wrap break-words border-b border-gray-100 pb-8 last:border-0 last:pb-0"
                    >
                      {noteEntryText(n)}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

      <ModalCreateSupplier
        visible={openNewSupplier}
        onClose={() => {
          setOpenNewSupplier(false);
          setSupplierModalRowIndex(null);
        }}
        onCreate={handleCreateSupplier}
      />
      <ModalCrearCliente
        onCreate={hanldeCreateCustomer}
        visible={openNewCustomer}
        onClose={() => setOpenNewCustomer(false)}
      ></ModalCrearCliente>
      <ModalCrearContacto
        onCreate={hanldeCreateContact}
        visible={openContactModal}
        onClose={() => setOpenContactModal(false)}
      ></ModalCrearContacto>
    </div>
  );
}
