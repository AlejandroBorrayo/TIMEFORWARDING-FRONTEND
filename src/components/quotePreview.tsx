"use client";

import { formatDateDMY } from "@/app/utils";
import React from "react";

export default function QuotePreview({
  customer,
  contact,
  items,
  notes,
  currency = "MXN",
  validUntil,
}) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const subtotal = items.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.amount || 0),
    0
  );
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  return (
    <div className="mt-16 p-10 bg-white shadow-lg border border-gray-200 rounded-xl max-w-5xl mx-auto">
      {/* =======================
          HEADER
      ======================== */}
      <div className="flex justify-between items-start mb-10 w-full">
        {/* LOGO + INFO EMPRESA */}
        <div className="flex items-start gap-6">
          <img
            src="https://i.postimg.cc/tRx2S91P/Captura-de-pantalla-2025-12-05-a-la(s)-3-46-29-p-m.png"
            alt="TimeForwarding Logo"
            className="w-40 object-contain"
          />

          <div className="text-left">
            <h1
              style={{ marginBottom: "12px" }}
              className="text-xl text-[#02101d]"
            >
              Time Forwarding
            </h1>
            <p className="text-gray-700">
              235 Periférico Boulevard Manuel Ávila Camacho
            </p>
            <p className="text-gray-700">Ciudad de México</p>
            <p className="text-gray-700">contabilidad@timeforwarding.com.mx</p>
            <p className="text-gray-700">Teléfono: 5552542235</p>
          </div>
        </div>

        {/* FOLIO / FECHAS */}
        <div className="text-right" style={{ marginBottom: "36px" }}>
          <p style={{ marginBottom: "42px" }}></p>
          <p className="text-gray-700">
            <span className="text-gray-700">Folio: </span>TIME284729
          </p>
          <p className="text-gray-700">
            <span className="text-gray-700">No. de Cotización: </span>1
          </p>
          <p className="text-gray-700">
            <span className="text-gray-700">Fecha de emisión: </span>{" "}
            {new Date().toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
          <p className="text-gray-700">
            <span className="text-gray-700">Vigencia: </span>
            {formatDateDMY(validUntil)}
          </p>
        </div>
      </div>

      {/* =======================
          TABLA DE ITEMS
      ======================== */}
      <table className="w-full table-fixed border-collapse mb-6">
        <thead>
          <tr className="bg-[#02101d] text-white border-y">
            <th className="text-left p-3 font-semibold w-[55%]">
              Producto o servicio
            </th>
            <th className="text-center p-3 font-semibold w-[20%]">Cantidad</th>
            <th className="text-center p-3 font-semibold w-[30%]">Precio</th>
            <th className="text-center p-3 font-semibold w-[25%] pr-30">
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((it, i) => (
            <tr
              key={i}
              className={`border-b border-gray-300 ${
                i % 2 === 0 ? "bg-[#f4f6f9]" : "bg-white"
              }`}
            >
              <td className="p-3 align-top break-words whitespace-pre-line">
                <p className="font-semibold">{it.name || "—"}</p>
                <p className="text-gray-600">{it.description || ""}</p>
              </td>

              <td className="p-3 text-center align-middle">
                {it.quantity || 0}
              </td>

              <td className="p-3 text-center align-middle">
                {formatCurrency(it.amount)}
              </td>

              <td className="p-3 text-center align-middle pr-30">
                {formatCurrency((it.quantity || 0) * (it.amount || 0))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* =======================
          TOTALES
      ======================== */}
      <div className="flex justify-end my-[48px]">
        <div className="w-120 text-right space-y-1">
          <p className="text-gray-700">
            <span className="font-semibold mr-[200px]">Subtotal:</span>
            {formatCurrency(subtotal)}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold mr-[200px]">IVA (16%):</span>
            {formatCurrency(iva)}
          </p>
          <p className="text-gray-900 font-bold text-lg">
            <span className="mr-[200px]">Total:</span>
            {formatCurrency(total)}
          </p>
        </div>
      </div>

      {/* LÍNEA DE SEPARACIÓN SOLO SI HAY NOTAS */}
      {notes.length > 0 && notes?.[0] !== "" && (
        <div className="border-t border-gray-300 my-8"></div>
      )}

      {/* =======================
          NOTAS
      ======================== */}
      {notes.length > 0 && notes?.[0] !== "" && (
        <div className="mt-10">
          <h3 className="font-semibold text-xl text-[#02101d] mb-2">Notas:</h3>
          <div className="space-y-2 text-gray-700 whitespace-pre-line">
            {notes.map((n, i) => (
              <div key={i}>{n}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
