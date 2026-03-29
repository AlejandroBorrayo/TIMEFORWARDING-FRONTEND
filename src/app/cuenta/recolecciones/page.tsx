"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/authProvider";
import { ShipmentCollectionInterface } from "@/type/shipment.interface";
import { Toast } from "../../../components/toast";

// Drawer
import { RecolectionDrawer } from "@/components/collectionDrawer";
import { CollectionCollectionInterface } from "@/type/collection";
import { FindAll } from "@/services/collection";
import { FindAllShipment } from "@/services/shipping";
import { Create } from "@/services/collection";
import {
  LogoDHL,
  LogoFedex,
  LogoEstafeta,
  LogoPaqueteExpress,
  LogoUps,
} from "@/app/utils";

// Interfaces

interface Pagination {
  page: number;
  perpage: number;
  total: number;
  totalpages: number;
}

const PAGE_SIZE = 6;

export default function RecoleccionesPage() {
  const router = useRouter();
  const { session } = useAuth();
  const userid = session?.user?.sub;

  const [collection, setCollection] = useState<CollectionCollectionInterface[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [loadingCreateCollection, setLoadingCreateCollection] = useState(false);
  const [collectionsAvailable, setCollectionsAvailable] = useState<
    ShipmentCollectionInterface[]
  >([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    perpage: 10,
    total: 0,
    totalpages: 0,
  });

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  const handleCreateCollection = async (
    shipment: ShipmentCollectionInterface,
    totalPackages: string,
    totalWeight: string,
    selectedDate: Date,
    selectedTime: string[]
  ) => {
    setLoadingCreateCollection(true);

    const payloadCollection = {
      pickup: {
        reference_shipment_id: shipment?.soloenvios_id ?? shipment?.skydropx_id,
        packages: Number(totalPackages),
        total_weight: Number(totalWeight)?.toFixed(1),
        scheduled_from: combineDateAndTime(
          selectedDate,
          selectedTime[0]
        ).toString(),
        scheduled_to: combineDateAndTime(
          selectedDate,
          selectedTime[1]
        ).toString(),
      },
    };

    try {
      await Create(userid, payloadCollection);
      await fetchCollection();
      return true;
    } catch (error) {
      return false;
    }
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  /*   const [dateFilter, setDateFilter] = useState<DateRange | undefined>(
    undefined
  ); */

  // 🔹 Fetch recolecciones (tabla principal)
  const fetchCollection = async (page = 1) => {
    if (!userid) return;
    setLoading(true);
    try {
      const res = await FindAll(
        userid,
        { page, perpage: PAGE_SIZE },
        null,
        null,
        []
      );
      if (res?.records) {
        setCollection(res.records);
        setPagination({
          page: res.page,
          perpage: res.perpage,
          total: res.total,
          totalpages: res.totalpages,
        });
      }
    } catch (err) {
      console.error("Error buscando Recolecciones:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch guías disponibles cuando se abre el Drawer
  const fetchShipments = async () => {
    if (!userid) return;
    try {
      const res = await FindAllShipment(
        userid,
        { page: 1, perpage: 500 },
        null,
        null,
        ["created"],
        null,
        true
      );
      if (res?.records) {
        setCollectionsAvailable(res.records);
      }
    } catch (err) {
      console.error("Error buscando guías disponibles:", err);
    }
  };

  // 🔹 Llamada inicial
  useEffect(() => {
    fetchCollection(1);
  }, [userid]);

  // 🔹 Cuando el Drawer se abre, obtener las guías
  useEffect(() => {
    if (drawerOpen) {
      fetchShipments();
    }
  }, [drawerOpen]);

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 🏷️ Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Recolecciones</h1>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Botón nueva recolección */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn btn-sm btn-primary"
          >
            Generar nueva recolección
          </button>
        </div>
      </div>

      {/* 🧱 Responsive Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {collection.map((r) => (
          <motion.div
            key={r._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">
                {r?.shipping_id?.carrier_name?.toUpperCase()}
              </h3>
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">
                {/* {r?.status} */}Programada
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1 mb-3">
              <p>
                <strong>Origen:</strong> {r?.postal_code} - {r?.municipality}{" "}
                {r?.state}
              </p>
              <p>
                <strong>Fecha programada:</strong>{" "}
                {new Date(r?.scheduled_from).toLocaleString()} -{" "}
                {new Date(r?.scheduled_to).toLocaleString()}
              </p>
              <p>
                <strong>Paquetes:</strong> {r?.packages} |{" "}
                <strong>Peso:</strong> {r?.total_weight} kg
              </p>
            </div>
            <button
              onClick={() =>
                router.push(
                  `/cuenta/envios/${r?.shipping_id}?origen=recolecciones`
                )
              }
              className="w-full btn btn-sm btn-primary"
            >
              Ver detalles
            </button>
          </motion.div>
        ))}
        {collection.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-6">
            No hay recolecciones
          </div>
        )}
        {loading && (
          <div className="text-center text-gray-400 py-6">Cargando...</div>
        )}
      </div>

      {/* 📊 Tabla Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 w-[10%]">Paquetería</th>
              <th className="px-4 py-2 w-[20%]">Origen</th>
              <th className="px-4 py-2 w-[20%]">Fecha programada</th>
              <th className="px-4 py-2 w-[8%] text-center">Paquetes</th>
              <th className="px-4 py-2 w-[10%] text-center">Peso</th>
              <th className="px-4 py-2 w-[13%]">Estatus</th>
              <th className="px-4 py-2 w-[12%] text-center"></th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              collection.map((r, i) => (
                <motion.tr
                  key={r._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 truncate">
                    {r?.shipping_id?.carrier_name === "dhl" && (
                      <img width={"60px"} src={LogoDHL} alt="DHL"></img>
                    )}
                    {r?.shipping_id?.carrier_name === "paquetexpress" && (
                      <img
                        width={"60px"}
                        src={LogoPaqueteExpress}
                        alt="paquetexpress"
                      ></img>
                    )}
                    {r?.shipping_id?.carrier_name === "fedex" && (
                      <img width={"60px"} src={LogoFedex} alt="Fedex"></img>
                    )}
                    {r?.shipping_id?.carrier_name === "estafeta" && (
                      <img width={"60px"} src={LogoEstafeta} alt="Fedex"></img>
                    )}
                    {r?.shipping_id?.carrier_name === "ups" && (
                      <img width={"60px"} src={LogoUps} alt="Ups"></img>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r?.postal_code} - {r?.municipality} {r?.state}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(r?.scheduled_from).toLocaleString()}{" "}
                    {new Date(r?.scheduled_to).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">{r?.packages}</td>
                  <td className="px-4 py-3 text-center">
                    {r?.total_weight} kg
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {/* {r?.status} */}Programada
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        router.push(
                          `/cuenta/envios/${r?.shipping_id?._id}?origen=recolecciones`
                        )
                      }
                      className="btn btn-xs btn-primary"
                    >
                      Ver guía
                    </button>
                  </td>
                </motion.tr>
              ))}
            {!loading && collection.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No hay recolecciones
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  Cargando...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📄 Paginación */}
      {pagination.totalpages > 1 && (
        <div className="flex justify-end mt-4 gap-2">
          <button
            disabled={pagination.page === 1}
            onClick={() => fetchCollection(pagination.page - 1)}
            className={`px-3 py-1 border rounded-xl ${
              pagination.page === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-brand border-gray-300 hover:bg-gray-100 cursor-pointer"
            }`}
          >
            Anterior
          </button>
          <span className="px-2 text-sm text-gray-600 self-center">
            Página {pagination.page} de {pagination.totalpages}
          </span>
          <button
            disabled={pagination.page === pagination.totalpages}
            onClick={() => fetchCollection(pagination.page + 1)}
            className={`px-3 py-1 border rounded-xl ${
              pagination.page === pagination.totalpages
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-brand border-gray-300 hover:bg-gray-100 cursor-pointer"
            }`}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* 🗂️ Drawer con guías */}
      <RecolectionDrawer
        setLoadingCreateCollection={setLoadingCreateCollection}
        loadingCreateCollection={loadingCreateCollection}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        shipments={collectionsAvailable}
        onCreate={(
          shipment,
          totalPackages,
          totalWeight,
          selectedDate,
          selectedTime
        ) =>
          handleCreateCollection(
            shipment,
            totalPackages,
            totalWeight,
            selectedDate,
            selectedTime
          )
        }
      />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </motion.div>
  );

  function combineDateAndTime(date: Date, time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);

    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0"); // meses 0-11
    const day = String(newDate.getDate()).padStart(2, "0");
    const hour = String(newDate.getHours()).padStart(2, "0");
    const minute = String(newDate.getMinutes()).padStart(2, "0");
    const second = String(newDate.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
}
