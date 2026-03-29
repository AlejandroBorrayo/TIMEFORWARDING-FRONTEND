"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loadMercadoPago } from "@mercadopago/sdk-js";
import { FindAll, Create } from "@/services/transactions";
import { ShuffleIcon, CardStackIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useAuth } from "@/components/authProvider";
import { Toast } from "@/components/toast";
import "react-day-picker/dist/style.css";
import { getUser } from "@/services/user";
import RechargeModal from "@/components/transferenciaModal";

interface Movimiento {
  id: string;
  fecha: string;
  monto: number;
  razon: string;
  shipping: string;
}

const PAGE_SIZE = 5;

export default function MovimientosPage() {
  const { session, setSession } = useAuth();
  const userid = session?.user?.sub;
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState<any | undefined>(undefined);
  const [openModalTransferencia, seOpenModalTransferencia] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });
  const [rangeOpen, setRangeOpen] = useState(false);

  // Modal Nueva Transacción - Estados
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cardBrand, setCardBrand] = useState<
    "VISA" | "MASTERCARD" | "AMEX" | "UNKNOWN"
  >("UNKNOWN");
  const [errors, setErrors] = useState<{
    cardNumber?: string;
    cardHolder?: string;
    expiry?: string;
    cvv?: string;
    amount?: string;
  }>({});
  const [showModal, setShowModal] = useState(false);

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#02101d] focus:border-[#02101d]";

  // --------------------------------------------
  // FETCH MOVIMIENTOS
  // --------------------------------------------
  const fetchMovimientos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await FindAll(
        userid,
        {
          page,
          perpage: PAGE_SIZE,
        },
        dateFilter?.from,
        dateFilter?.to
      );

      const data = res.records.map((r: any) => ({
        id: r._id || "",
        fecha: r.created_at
          ? new Date(r.created_at).toISOString().split("T")[0]
          : "",
        monto: r.amount || 0,
        razon: r.reason || "",
        shipping: r.shipping || null,
      }));

      setMovimientos(data);
      setTotalPages(res.totalpages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, dateFilter, userid]);

  useEffect(() => {
    fetchMovimientos();
  }, [fetchMovimientos]);

  useEffect(() => {
    setPage(1);
  }, [dateFilter]);

  // --------------------------------------------
  // DETECTAR TARJETA
  // --------------------------------------------
  const detectCardBrand = (number: string) => {
    const n = number.replace(/\s/g, "");
    if (/^4[0-9]{0,}$/.test(n)) return "VISA";
    if (/^5[1-5][0-9]{0,}$/.test(n)) return "MASTERCARD";
    if (/^3[47][0-9]{0,}$/.test(n)) return "AMEX";
    return "UNKNOWN";
  };

  // --------------------------------------------
  // VALIDACIÓN FORMULARIO
  // --------------------------------------------
  const validateForm = () => {
    const newErrors: typeof errors = {};
    const num = cardNumber.replace(/\s/g, "");
    if (!num) newErrors.cardNumber = "Número de tarjeta es requerido";
    else if (!/^\d{13,16}$/.test(num)) newErrors.cardNumber = "Número inválido";

    if (!cardHolder.trim())
      newErrors.cardHolder = "Nombre del titular es requerido";

    if (!expiry) newErrors.expiry = "Fecha de expiración requerida";
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry))
      newErrors.expiry = "Formato inválido MM/AA";

    if (!cvv) newErrors.cvv = "CVV requerido";
    else if (!/^\d{3,4}$/.test(cvv)) newErrors.cvv = "CVV inválido";

    if (!amount || parseFloat(amount) <= 0)
      newErrors.amount = "Monto debe ser mayor a 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      await loadMercadoPago();
      /*@ts-ignore*/
      const mp = new window.MercadoPago(process.env.NEXT_MERCADOPAGO_KEY, {
        locale: "en-US",
      });
      const [month, year] = expiry.split("/");
      const fullYear = `20${year}`;
      const cleanCardNumber = cardNumber?.replace(/\s+/g, "");
      const cardToken = await mp.createCardToken({
        cardNumber: cleanCardNumber,
        cardholderName: cardHolder,
        cardExpirationMonth: month,
        cardExpirationYear: fullYear,
        securityCode: cvv,
      });

      await Create(userid, {
        amount: parseFloat(amount),
        token: cardToken?.id,
        userid,
        type: "add",
        reason: "Recarga a wallet",
      });
      const user = await getUser(userid);
      setSession({
        ...session,
        user: {
          ...session.user,
          name: user?.full_name,
          email: user?.email,
        },
      });
      setToast({
        visible: true,
        message: "Recarga a wallet ✔",
        type: "success",
      });
      setShowModal(false);
      fetchMovimientos();
    } catch (err) {
      console.error(err);
      setToast({
        visible: true,
        message: "Error al recargar wallet ❌",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------
  // CERRAR MODAL CON ESC
  // --------------------------------------------
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // --------------------------------------------
  // TRANSFERENCIA (placeholder)
  // --------------------------------------------
  const handleTransferencia = () => seOpenModalTransferencia(true);

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-semibold mb-4">Movimientos</h1>

      <div className="flex flex-wrap items-center justify-end gap-4 mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-2"
          >
            <CardStackIcon /> Nueva Transacción
          </button>
          <button
            onClick={handleTransferencia}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-2"
          >
            <ShuffleIcon /> Transferencia
          </button>
        </div>
      </div>

      {/* MODAL NUEVA TRANSACCIÓN */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full flex flex-col gap-6 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-black hover:text-gray-700 font-bold text-lg"
              >
                ×
              </button>
              <h3 className="text-xl font-semibold text-center">
                Pagar con Tarjeta
              </h3>

              {/* TARJETA */}
              <div className="bg-gradient-to-r from-[#02101d] to-[#1a2b4c] text-white rounded-xl p-4 relative">
                <div className="flex justify-between mb-6">
                  <span className="text-sm uppercase">Tarjeta de crédito</span>
                  {cardBrand && (
                    <span className="text-sm">
                      {cardBrand === "UNKNOWN" ? "" : cardBrand}
                    </span>
                  )}
                </div>
                <div className="text-xl font-mono tracking-widest mb-2">
                  {cardNumber || "•••• •••• •••• ••••"}
                </div>
                <div className="flex justify-between text-xs">
                  <span>{cardHolder || "NOMBRE DEL TITULAR"}</span>
                  <span>{expiry || "MM/AA"}</span>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Número de tarjeta
                  </label>
                  <input
                    type="text"
                    maxLength={19}
                    className={
                      inputClass + (errors.cardNumber ? " border-red-500" : "")
                    }
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      val = val.match(/.{1,4}/g)?.join(" ") || "";
                      setCardNumber(val);
                      const brand = detectCardBrand(val);
                      setCardBrand(brand !== "UNKNOWN" ? brand : "UNKNOWN");
                    }}
                    required
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.cardNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre del titular
                  </label>
                  <input
                    type="text"
                    className={
                      inputClass + (errors.cardHolder ? " border-red-500" : "")
                    }
                    placeholder="Juan Pérez"
                    value={cardHolder}
                    onChange={(e) =>
                      setCardHolder(e.target.value.toUpperCase())
                    }
                    required
                  />
                  {errors.cardHolder && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.cardHolder}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Fecha de expiración
                    </label>
                    <input
                      type="text"
                      className={
                        inputClass + (errors.expiry ? " border-red-500" : "")
                      }
                      placeholder="MM/AA"
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length > 2)
                          val = val.slice(0, 2) + "/" + val.slice(2, 4);
                        setExpiry(val);
                      }}
                      required
                    />
                    {errors.expiry && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.expiry}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      className={
                        inputClass + (errors.cvv ? " border-red-500" : "")
                      }
                      maxLength={4}
                      placeholder="123"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, ""))
                      }
                      required
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Monto
                  </label>
                  <input
                    type="number"
                    className={
                      inputClass + (errors.amount ? " border-red-500" : "")
                    }
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#02101d] text-white rounded-xl hover:bg-[#0e1b32] hover:shadow-2xl cursor-pointer transition-all duration-300 font-medium flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    Pagar
                    {isLoading && (
                      <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABLA DESKTOP */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-fixed text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left w-[20%]">Folio</th>
              <th className="px-4 py-2 text-left w-[10%]">Razón</th>
              <th className="px-4 py-2 text-left w-[10%]">Monto</th>
              <th className="px-4 py-2 text-left w-[10%]">Fecha</th>
              <th className="px-4 py-2 text-center w-[10%]"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : movimientos.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No hay movimientos
                </td>
              </tr>
            ) : (
              movimientos.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-left font-medium truncate">
                    {m.id}
                  </td>
                  <td className="px-4 py-3 text-left truncate">{m.razon}</td>
                  <td className="px-4 py-3 text-left">${m.monto.toFixed(2)}</td>
                  <td className="px-4 py-3 text-left">{m.fecha}</td>

                  {m?.shipping ? (
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/cuenta/envios/${m.shipping}`}
                        className="px-3 py-1 bg-[#02101d] text-white rounded-xl hover:bg-[#0e1b32] cursor-pointer transition-colors inline-block text-center"
                      >
                        Ver envío
                      </Link>
                    </td>
                  ) : (
                    <td className="px-4 py-3 text-center text-gray-400 italic">
                      —
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CARDS MOBILE */}
      <div className="md:hidden flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-6 text-gray-500">Cargando...</div>
        ) : movimientos.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No hay movimientos
          </div>
        ) : (
          movimientos.map((m, i) => (
            <motion.div
              key={m.id}
              className="bg-white shadow-md rounded-xl p-4 border border-gray-200 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="flex justify-between mb-2">
                <span className="font-medium">{m.id}</span>
                <span className="text-lg font-semibold">
                  ${m.monto.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>{m.razon}</span>
                <span>{m.fecha}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* PAGINACIÓN */}
      <div className="flex justify-end gap-2 mt-4 flex-wrap">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span className="px-3 py-1">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
      />
      <RechargeModal
        showModal={openModalTransferencia}
        setShowModal={seOpenModalTransferencia}
        bank={process.env.NEXT_BANK_NAME}
        clabe={process.env.NEXT_BANK_CLABE}
        beneficiary={process.env.NEXT_BANK_PLACEHODER}
        whatsapp={process.env.NEXT_WHATSAPP_TIME_TREK}

        // qrUrl="/path/to/qr.png" // opcional
      />
    </motion.div>
  );
}
