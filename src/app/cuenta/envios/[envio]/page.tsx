"use client";

import Image from "next/image";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FindShipment } from "@/services/shipping"; // tu servicio
import { ShipmentCollectionInterface } from "@/type/shipment.interface";
import { formatDate, statusMap } from "@/app/utils";
import RechargeModal from "@/components/transferenciaModal";

export default function OrderDetailPage() {
  const searchParams = useSearchParams();
  const origen = searchParams.get("origen");
  const params = useParams();
  const _id = params.envio as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [shipment, setShipment] = useState<ShipmentCollectionInterface | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);

  const guiaUrl = shipment?.packages?.[0]?.label_url ?? "";
  const trackingUrl = shipment?.packages?.[0]?.tracking_url_provider ?? null;
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowModal(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        setLoading(true);
        const res = await FindShipment(_id);
        setShipment(res);
      } catch (err) {
        console.error("Error cargando shipment:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [_id]);

  if (loading || !shipment) {
    return (
      <div className="p-6 flex flex-col gap-6 animate-pulse">
        {/* Skeleton igual que tenías */}
        <div className="h-10 w-32 bg-gray-300 rounded-xl"></div>
      </div>
    );
  }

  // --- Mapear datos ---
  const remitente = shipment.address_from;
  const destinatario = shipment.address_to;
  const pieces = shipment.packages.map((p) => ({
    description: `${p.package_type}`,
    dimensions: `${p.length} x ${p.width} x ${p.height} cm`,
    weight: Number(p.weight),
    volumetricWeight: Math.max(
      (Number(p.length) * Number(p.width) * Number(p.height)) / 5000,
      Number(p.weight)
    ), // ejemplo de cálculo volumétrico
    total: shipment.total,
    cartaPorte: p.consignment_note,
    trackingNumber: p.tracking_number ?? "-",
    carrier: shipment?.carrier_name,
  }));

  const trackingHistory =
    shipment.history?.map((h) => ({
      datetime: h.created_at ?? "",
      status: h.status ?? "",
      description: h.description ?? "",
    })) ?? [];

  // --- Botón de regresar dinámico ---
  const handleBackClick = () => {
    if (origen) {
      router.push(`/cuenta/${origen}`);
    } else {
      router.push("/cuenta/envios");
    }
  };

  return (
    <motion.div
      className="p-6 flex flex-col gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } },
      }}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="flex gap-2 items-center">
          <button
            onClick={handleBackClick}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
          >
            ← Regresar
          </button>
          {!origen || !origen.includes("usuarios") && (
            <Link
              href="/cuenta/cotizador"
              className="px-4 py-2 bg-[#02101d] text-white rounded-xl hover:bg-[#0e1b32] transition-colors cursor-pointer"
            >
              Nuevo envío
            </Link>
          )}
        </div>
        <div className="flex gap-4 items-center text-gray-600 flex-wrap">
          <span>
            Número de envío: <b>{shipment._id}</b>
          </span>
          <span>
            Fecha/Hora:{" "}
            <b>{new Date(shipment.created_at || "").toLocaleString()}</b>
          </span>
          <span className="text-green-600">
            <b>{statusMap[shipment?.status || ""] || shipment?.status}</b>
          </span>
        </div>
      </motion.div>

      {/* Botones en fila */}
      <motion.div className="flex gap-4 mt-4 justify-end">
        {guiaUrl && (
          <a
            href={guiaUrl}
            download="guia.png"
            className="bg-white text-black border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100"
          >
            Descargar Guía
          </a>
        )}

        {trackingUrl && (
          <a
            target="_blank"
            href={trackingUrl}
            className="bg-white text-black border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100"
          >
            Tracking paqueteria
          </a>
        )}
      </motion.div>

      {/* Remitente y Destinatario */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h3 className="font-semibold mb-2">Remitente</h3>
          <div className="text-sm space-y-1">
            <div>
              <b>Nombre:</b> {remitente.name}
            </div>
            <div>
              <b>Correo:</b> {remitente.email}
            </div>
            <div>
              <b>Teléfono:</b> {remitente.phone}
            </div>
            <div>
              <b>Empresa:</b> {remitente.company}
            </div>
            <div>
              <b>Dirección:</b> {remitente.address.street1},{" "}
              {remitente.address.area_level2}, {remitente.address.postal_code}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h3 className="font-semibold mb-2">Destinatario</h3>
          <div className="text-sm space-y-1">
            <div>
              <b>Nombre:</b> {destinatario.name}
            </div>
            <div>
              <b>Correo:</b> {destinatario.email}
            </div>
            <div>
              <b>Teléfono:</b> {destinatario.phone}
            </div>
            <div>
              <b>Empresa:</b> {destinatario.company}
            </div>
            <div>
              <b>Dirección:</b> {destinatario.address.street1},{" "}
              {destinatario.address.area_level2},{" "}
              {destinatario.address.postal_code}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de piezas */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Paqueteria</th>
              <th className="px-4 py-2">Dimensiones</th>
              <th className="px-4 py-2">Peso Masa</th>
              <th className="px-4 py-2">Peso Volumétrico</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Carta Porte</th>
              <th className="px-4 py-2">Tracking</th>
            </tr>
          </thead>
          <tbody>
            {pieces.map((p, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="px-4 py-2">{p.carrier.toUpperCase()}</td>
                <td className="px-4 py-2">{p.dimensions}</td>
                <td className="px-4 py-2">{p.weight} Kg</td>
                <td className="px-4 py-2">
                  {p.volumetricWeight.toFixed(2)} Kg
                </td>
                <td className="px-4 py-2">${p.total}</td>
                <td className="px-4 py-2">{p.cartaPorte || "-"}</td>
                <td className="px-4 py-2">{p.trackingNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Historial */}
      <div className="p-4 bg-white rounded-xl mt-6">
        <h3 className="font-semibold mb-6 text-lg">Historial de Rastreo</h3>
        <div className="relative pl-10">
          <span className="absolute left-3 top-0 bottom-0 border-l-2 border-gray-300"></span>
          {trackingHistory.map((event, idx) => (
            <div key={idx} className="mb-5 relative flex items-start">
              <div className="ml-3 bg-gray-50 p-3 rounded-xl border border-gray-100 flex-1">
                <div className="text-gray-500 text-sm">
                  {formatDate(event.datetime)}
                </div>
                <div className="mt-1 text-gray-700">
                  <span>{event.description}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de guía */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full flex flex-col gap-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-black font-bold text-lg"
              >
                ×
              </button>
              <h3 className="text-xl font-semibold mb-4">
                Vista previa de la Guía
              </h3>
              <div className="overflow-auto max-h-[70vh] flex justify-center">
                {guiaUrl && (
                  <Image src={guiaUrl} alt="Guía" width={500} height={500} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
