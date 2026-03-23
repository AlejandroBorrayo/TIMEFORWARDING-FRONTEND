"use client";
import SupplierSelect from "./supplierSelect";
import EditableField from "./editableField";
import { Find as FindSupplier } from "../services/supplier";
import { Create as CreateSupplier } from "../services/supplier";
import { Find as FindCustomer } from "../services/customer";
import { FindAll as FindAllNotes } from "../services/note";
import { Create as CreateCustomer } from "../services/customer";
import { Update as UpdateCustomer } from "../services/customer";
import { useEffect, useState } from "react";
import { ConvertCurrency } from "../services/currency";
import ModalCreateSupplier from "./createSupplierModal";
import { SupplierCollectionInterface } from "@/type/supplier.interface";
import CustomerSelect from "./customers";
import ContactSelect from "./contacts";
import NotesSelect from "./notes";
import CurrencySelect from "./currencySelect";
import { formatDateDMY } from "@/app/utils";
import ModalCrearCliente from "./createCustomerModal";
import ModalCrearContacto from "./createContactModal";
import { FindAll as FindAllTax } from "../services/tax";
import TaxSelect from "./taxes";

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
  type,
  currentFolio,
  currentCost,
  currentQuote,
  setCustomer,
  customer,
  contact,
  setContact,
}) {
  const [openContactModal, setOpenContactModal] = useState(false);
  const [openNewCustomer, setOpenNewCustomer] = useState(false);
  const [refreshCustomers, setRefreshCustomers] = useState(true);
  const [openNewSupplier, setOpenNewSupplier] = useState(false);
  const [refreshSupplier, setRefreshSupplier] = useState(true);
  const [refreshTax, setRefreshTax] = useState(false);
  const [showTotalUSD, setShowTotalUSD] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState<{ name: string; amount: number }[]>([]);
  const [impuestos, setImpuestos] = useState<
    { name: string; amount: number; _id?: string }[]
  >([]);
  const [currentNotes, setCurrentNotes] = useState<
    { note: string; _id?: string }[]
  >([]);

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

  useEffect(() => {
    const hasUSDItem = items.some((item) => item?.currency === "USD");
    setShowTotalUSD(hasUSDItem);
  }, [items]);

  useEffect(() => {
    const impMap = new Map<string, number>();
    items.map((i) => {
      if (!i?.tax?.name || i.tax.name === "sin impuesto") return null;
      const currentAmount = impMap.get(i.tax.name) || 0;
      const taxAmount = Number(i?.tax?.amount || 0) / 100;

      if (showTotalUSD) {
        impMap.set(i.tax.name, currentAmount + i.quantity * i.usd_amount * taxAmount);
        return;
      }
      impMap.set(i.tax.name, currentAmount + i.quantity * i.amount * taxAmount);
    });
    const imp = Array.from(impMap.entries()).map(([name, amount]) => ({
      name,
      amount,
    }));

    const hasItems = (items?.length || 0) > 0;
    const hasUSDItem = items.some((item) => item?.currency === "USD");
    const allItemsAreMXN = hasItems
      ? items.every((item) => item?.currency === "MXN")
      : false;

    if (hasUSDItem) {
      setCurrency("USD");
    } else if (allItemsAreMXN) {
      setCurrency("MXN");
    }
    if (showTotalUSD) {
      setSubtotal(items.reduce((a, i) => a + i.quantity * i.usd_amount, 0));
      setTax(imp);
      setTotal(
        items.reduce((a, i) => {
          const impuesto =
            i.quantity * i.usd_amount * (Number(i?.tax?.amount || 0) / 100);
          return a + i.quantity * i.usd_amount + impuesto;
        }, 0)
      );
      return;
    }

    if (!showTotalUSD) {
      setSubtotal(items.reduce((a, i) => a + i.quantity * i.amount, 0));
      setTax(imp);
      setTotal(
        items.reduce((a, i) => {
          const impuesto =
            i.quantity * i.amount * (Number(i?.tax?.amount || 0) / 100);
          return a + i.quantity * i.amount + impuesto;
        }, 0)
      );
      return;
    }
  }, [items, showTotalUSD, impuestos, setCurrency]);

  const handleCreateSupplier = async (
    supplier: SupplierCollectionInterface
  ) => {
    try {
      await CreateSupplier(supplier);
      setRefreshSupplier(true);
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
    updateItem(i, "supplier.name", find?.name);
    updateItem(i, "supplier._id", find?._id);
  };

  const onChangeContact = async (contactEmail: string) => {
    const contactFind = customer.contacts.find(
      (cont) => cont.email === contactEmail
    );
    setContact(contactFind);
  };

  const handleChangeAmount = async (data: number, i: number) => {
    updateItem(i, "amount", data);
    const findItem = items?.[i];
    if (findItem?.currency === "MXN") {
      const res = await ConvertCurrency(data, "MXN", "USD");
      if (res?.rates) {
        updateItem(i, "usd_amount", data / res?.rates?.["MXN"]);
      }
    }
    if (findItem?.currency === "EUR") {
      const res = await ConvertCurrency(data, "EUR", "USD");
      if (res?.rates) {
        updateItem(i, "usd_amount", data / res?.rates?.["EUR"]);
      }
    }
    if (findItem?.currency === "USD") {
      updateItem(i, "usd_amount", data);
    }
    return;
  };

  const handleChangeCurrency = async (data: string, i: number) => {
    updateItem(i, "currency", data);
    if (data === "MXN") {
      const findItem = items?.[i];
      const res = await ConvertCurrency(findItem.amount, "MXN", "USD");
      if (res?.rates) {
        updateItem(i, "usd_amount", findItem.amount / res?.rates?.["MXN"]);
      }
    }

    if (data === "EUR") {
      const findItemEUR = items.some((item) => item?.currency === "USD");
      if (findItemEUR) {
        const findItem = items?.[i];
        const res = await ConvertCurrency(findItem.amount, "EUR", "USD");
        if (res?.rates) {
          updateItem(i, "usd_amount", findItem.amount / res?.rates?.["EUR"]);
        }
      }
    }
    if (data === "USD") {
      const findItem = items?.[i];
      updateItem(i, "usd_amount", findItem?.amount);
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
          <h1
            style={{ marginBottom: "12px" }}
            className="text-xl text-[#02101d]"
          >
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
                          : null
                      )
                    }
                    className=" px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#02101d] focus:border-[#02101d]"
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
        <thead className="bg-[#02101d] text-white">
          <tr>
            <th className="p-3 text-center ">Producto o servicio</th>
            {type !== "quote" && <th className="p-3 text-center ">Provedor</th>}
            <th className="p-3 text-center ">Moneda</th>
            <th className="p-3 text-center ">Precio</th>
            <th className="p-2 text-center ">Cantidad</th>
            <th className="p-2 text-center ">Impuesto</th>
            <th className="p-3 text-center ">Total</th>
            {showTotalUSD && <th className="p-3 text-center ">Total USD</th>}
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

            const usd_subtotal = it.quantity * it.usd_amount;

            const usd_impuesto_monto = usd_subtotal * (porcentaje / 100);

            const usd_amount = usd_subtotal + usd_impuesto_monto;

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
                      onChange={(value) => {
                        const findImpuestos = impuestos.find(
                          (imp) => imp?._id === value
                        );
                        if (value === "none") {
                          updateItem(i, "tax.name", "sin impuesto");
                          updateItem(i, "tax.amount", 0);
                          return;
                        }
                        updateItem(i, "tax.name", findImpuestos?.name);
                        updateItem(i, "tax.amount", findImpuestos?.amount);
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
                    focus:outline-none focus:ring-1 focus:ring-[#02101d]
                    focus:border-[#02101d]
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
                {showTotalUSD && (
                  <td className="p-3 text-center align-top font-semibold whitespace-nowrap">
                    {formatCurrency(usd_amount, "USD")}
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
          <span style={{ minWidth: "120px" }}>{formatCurrency(subtotal)}</span>
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
                {formatCurrency(imp.amount)}
              </span>
            </div>
          );
        })}

        {/* Total */}
        <div className="grid grid-cols-[140px_auto] gap-x-8 text-right pt-1 ">
          <span className="font-semibold text-lg">Total</span>
          <span style={{ minWidth: "120px" }} className="font-bold text-lg">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {type === "quote" &&
        (mode === "edit" || (mode !== "edit" && notes?.length > 0)) && (
          <div className="mt-10 border-t border-gray-300 py-8 my-8">
            {(mode === "edit" || notes?.length > 0) && (
              <h3 className="font-semibold mb-2">Notas</h3>
            )}

            {notes?.length > 0 &&
              notes.map((n, i) => (
                <div key={i} className="mb-3">
                  {mode === "edit" ? (
                    <NotesSelect
                      value={n}
                      onChange={updateNote}
                      mode={"edit"}
                      index={i}
                    ></NotesSelect>
                  ) : (
                    <p>{n}</p>
                  )}

                  {mode === "edit" && (
                    <button
                      onClick={() => removeNote(i)}
                      className="text-red-500 text-sm mt-1 cursor-pointer"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ))}

            {mode === "edit" && (
              <button
                onClick={addNote}
                className="text-green-600 mt-2 cursor-pointer"
              >
                + Agregar nota
              </button>
            )}
          </div>
        )}

      <ModalCreateSupplier
        visible={openNewSupplier}
        onClose={() => setOpenNewSupplier(false)}
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
