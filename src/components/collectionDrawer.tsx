"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import * as Select from "@radix-ui/react-select";
import "react-day-picker/dist/style.css";
import { ShipmentCollectionInterface } from "@/type/shipment.interface";
import {
  LogoFedex,
  LogoDHL,
  LogoPaqueteExpress,
  LogoEstafeta,
  LogoUps,
} from "../app/utils/index";
import {
  AvailableDatesSoloenvios,
  AvailableDatesSkydropx,
} from "@/services/collection";
import { Toast } from "./toast";

interface RecolectionDrawerProps {
  loadingCreateCollection: boolean;
  setLoadingCreateCollection: (value: boolean) => void;

  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipments: ShipmentCollectionInterface[];
  onCreate: (
    shipment: ShipmentCollectionInterface,
    totalPackages: string,
    totalWeight: string,
    selectedDate: Date,
    selectedTime: string[]
  ) => Promise<boolean>;
}

export function RecolectionDrawer({
  loadingCreateCollection,
  open,
  setLoadingCreateCollection,
  onOpenChange,
  shipments,
  onCreate,
}: RecolectionDrawerProps) {
  const [step, setStep] = useState(1);
  const [selectedShipment, setSelectedShipment] =
    useState<ShipmentCollectionInterface>(null);
  const [totalPackages, setTotalPackages] = useState<string>("");
  const [totalWeight, setTotalWeight] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(undefined);
  const [errors, setErrors] = useState<{ packages?: string; weight?: string }>(
    {}
  );

  const [availableDates, setAvailableDates] = useState<
    {
      date: Date;
      startHour: string;
      endHour: string;
      name: string;
      key: string;
    }[]
  >([]);
  const [availableHours, setAvailableHours] = useState<string[]>([]);

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  const drawerVariants: Variants = {
    hidden: { x: "100%" },
    visible: {
      x: "0%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      x: "100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.25 } },
  };

  // Selección de guía y fetch de fechas disponibles
  const handleSelectShipment = async (
    shipment: ShipmentCollectionInterface
  ) => {
    setSelectedShipment(shipment);
    setSelectedDate(undefined);
    setAvailableHours([]);
    setTotalPackages("1");
    setTotalWeight(shipment?.packages?.[0]?.weight?.toString() || "");
    if (shipment) {
      let response;
      if (shipment?.soloenvios_id) {
        response = await AvailableDatesSoloenvios(shipment?.soloenvios_id);
      } else {
        response = await AvailableDatesSkydropx(shipment?.skydropx_id);
      }
      if (response?.pickupDates) {
        const dates = response?.pickupDates.map((d, index) => {
          const [year, month, day] = d.date.split("-").map(Number);
          const [hours, minutes] = d.startHour.split(":").map(Number);

          // Nota: en JS los meses van de 0 a 11
          const date = new Date(year, month - 1, day, hours, minutes, 0);

          return {
            date,
            startHour: d.startHour,
            endHour: d.endHour,
            name: `${date.toISOString()} | ${d.startHour} - ${d.endHour}`,
            key: (index + Math.random()).toString(),
          };
        });

        setAvailableDates(dates);
      }
    } else {
      setAvailableDates([]);
    }
  };

  const validateStep2 = (): boolean => {
    let valid = true;
    const newErrors: typeof errors = {};
    if (!/^\d+$/.test(totalPackages)) {
      newErrors.packages = "Ingresa un número válido de paquetes";
      valid = false;
    }
    if (!/^\d+(\.\d+)?$/.test(totalWeight)) {
      newErrors.weight = "Ingresa un peso válido";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleNext = () => {
    if (step === 1 && !selectedShipment) {
      alert("Selecciona una guía");
      return;
    }
    if (step === 2 && !validateStep2()) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleCreate = async () => {
    if (!selectedDate) {
      setToast({
        visible: true,
        message: "Selecciona fecha",
        type: "error",
      });
      return;
    }
    const find = availableDates.find((item) => item.key === selectedDate);

    const resCollection = await onCreate(
      selectedShipment,
      totalPackages,
      totalWeight,
      find?.date,
      [find?.startHour, find?.endHour]
    );

    if (resCollection) {
      setToast({
        visible: true,
        message: "Recolección creada exitosamente",
        type: "success",
      });

      setTimeout(() => {
        setStep(1);
        setSelectedShipment(null);
        setTotalPackages("");
        setTotalWeight("");
        setSelectedDate(undefined);
        setAvailableDates([]);
        setAvailableHours([]);
        setErrors({});
        onOpenChange(false);
        setLoadingCreateCollection(false);
      }, 2500);
    } else {
      setToast({
        visible: true,
        message: "Error al crear la recolección",
        type: "error",
      });
      setLoadingCreateCollection(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 bg-black/40 z-40"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              />
            </Dialog.Overlay>
          )}
        </AnimatePresence>

        {open && (
          <Dialog.Content asChild forceMount>
            <motion.div
              className="fixed top-0 right-0 h-full w-full lg:w-[500px] bg-white shadow-2xl flex flex-col z-50"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* DialogTitle accesible */}
              <Dialog.Title asChild>
                <h2 className="sr-only">Nueva Recolección</h2>
              </Dialog.Title>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300">
                <h2 className="text-xl font-semibold">Nueva Recolección</h2>
                <button
                  onClick={() => onOpenChange(false)}
                  className="text-gray-500 hover:text-gray-700 font-bold cursor-pointer transition"
                >
                  X
                </button>
              </div>

              {/* Stepper Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/*           <div className="flex justify-evenly mb-4">
                    <span
                      className={`font-medium ${
                        step === 1 ? "text-brand" : "text-gray-400"
                      }`}
                    >
                      1. Guía
                    </span>
                    <span
                      className={`font-medium ${
                        step === 2 ? "text-brand" : "text-gray-400"
                      }`}
                    >
                      2. Paquetes
                    </span>
                    <span
                      className={`font-medium ${
                        step === 3 ? "text-brand" : "text-gray-400"
                      }`}
                    >
                      3. Fecha y hora
                    </span>
                  </div> */}

                {/* Step 1 - Guía */}
                {step === 1 && (
                  <div>
                    <h3
                      style={{ marginBottom: "24px" }}
                      className="font-semibold mb-2"
                    >
                      Selecciona la guía
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                      {shipments.map((g) => {
                        const isSelected = selectedShipment?._id === g?._id;
                        let carrierLogo = null;
                        if (g.carrier_name?.toUpperCase() === "DHL") {
                          carrierLogo = LogoDHL;
                        }
                        if (
                          g.carrier_name?.toUpperCase() === "PAQUETEXPRESS"
                        ) {
                          carrierLogo = LogoPaqueteExpress;
                        }
                        if (g.carrier_name?.toUpperCase() === "FEDEX") {
                          carrierLogo = LogoFedex;
                        }
                        if (g.carrier_name?.toUpperCase() === "ESTAFETA") {
                          carrierLogo = LogoEstafeta;
                        }
                        if (g.carrier_name?.toUpperCase() === "UPS") {
                          carrierLogo = LogoUps;
                        }

                        return (
                          <motion.button
                            key={g._id}
                            type="button"
                            onClick={() => handleSelectShipment(g)}
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className={`relative w-full p-4 text-left border rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center bg-white transition-all duration-50 cursor-pointer ${
                              isSelected
                                ? "border-brand shadow-md"
                                : "border-gray-200 hover:shadow-sm"
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-3 right-3 bg-brand text-white rounded-full p-1">
                                <CheckIcon className="w-4 h-4" />
                              </div>
                            )}
                            <img
                              src={carrierLogo}
                              alt={g.carrier_name}
                              className="w-16 h-auto self-center md:self-auto"
                            />
                            <div className="flex flex-col gap-1 text-sm text-gray-700 flex-1">
                              <p>
                                <span className="font-medium">Tracking:</span>{" "}
                                {g.packages?.[0]?.tracking_number || "N/A"}
                              </p>
                              <p>
                                <span className="font-medium">Fecha:</span>{" "}
                                {g.created_at
                                  ? new Date(g.created_at).toLocaleString(
                                      "es-MX",
                                      {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      }
                                    )
                                  : "N/A"}
                              </p>
                              <p>
                                <span className="font-medium">Origen:</span>{" "}
                                {g.address_from?.address.street1},{" "}
                                {g.address_from?.address.area_level2},{" "}
                                {g.address_from?.address.area_level1}
                              </p>
                              <p>
                                <span className="font-medium">Destino:</span>{" "}
                                {g.address_to?.address.street1},{" "}
                                {g.address_to?.address.area_level2},{" "}
                                {g.address_to?.address.area_level1}
                              </p>
                              <p className="text-gray-500">
                                {g.status === "delivered"
                                  ? "Entregado"
                                  : g.status}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                      {shipments.length === 0 && (
                        <p className="col-span-full text-gray-500 text-sm text-center py-4">
                          No hay guías disponibles
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2 - Paquetes */}
                {step === 2 && (
                  <div>
                    <h3
                      style={{ marginBottom: "24px" }}
                      className="font-semibold mb-2"
                    >
                      Selecciona el horario
                    </h3>
                    <motion.button
                      style={{ marginBottom: "24px" }}
                      key={selectedShipment._id}
                      type="button"
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`relative w-full p-4 text-left border rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center bg-white  ${"border-brand shadow-md"}`}
                    >
                      <div className="absolute top-3 right-3 bg-brand text-white rounded-full p-1">
                        <CheckIcon className="w-4 h-4" />
                      </div>
                      <img
                        src={
                          selectedShipment.carrier_name?.toUpperCase() === "DHL"
                            ? LogoDHL
                            : LogoFedex
                        }
                        alt={selectedShipment?.carrier_name}
                        className="w-16 h-auto self-center md:self-auto"
                      />
                      <div className="flex flex-col gap-1 text-sm text-gray-700 flex-1">
                        <p>
                          <span className="font-medium">Tracking:</span>{" "}
                          {selectedShipment.packages?.[0]?.tracking_number ||
                            "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Fecha:</span>{" "}
                          {selectedShipment.created_at
                            ? new Date(
                                selectedShipment.created_at
                              ).toLocaleString("es-MX", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Origen:</span>{" "}
                          {selectedShipment.address_from?.address.street1},{" "}
                          {selectedShipment.address_from?.address.area_level2},{" "}
                          {selectedShipment.address_from?.address.area_level1}
                        </p>
                        <p>
                          <span className="font-medium">Destino:</span>{" "}
                          {selectedShipment.address_to?.address.street1},{" "}
                          {selectedShipment.address_to?.address.area_level2},{" "}
                          {selectedShipment.address_to?.address.area_level1}
                        </p>
                        <p className="text-gray-500">
                          {selectedShipment.status === "delivered"
                            ? "Entregado"
                            : selectedShipment.status}
                        </p>
                      </div>
                    </motion.button>
                    {/*    <h3 className="font-semibold mb-4">
                        Información de paquetes
                      </h3> */}
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Total de paquetes
                        </label>
                        <input
                          type="text"
                          value={totalPackages}
                          onChange={(e) => setTotalPackages(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl p-2"
                        />
                        {errors.packages && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.packages}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Peso total aproximado (kg)
                        </label>
                        <input
                          type="text"
                          value={totalWeight}
                          onChange={(e) => setTotalWeight(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl p-2"
                        />
                        {errors.weight && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.weight}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Fecha y hora
                        </label>
                        <Select.Root
                          value={selectedDate}
                          onValueChange={(value) => setSelectedDate(value)}
                        >
                          {/* Trigger */}
                          <Select.Trigger className="w-full px-3 py-2 cursor-pointer border border-gray-300 rounded-md flex justify-between items-center bg-white focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand">
                            <Select.Value placeholder="Seleccionar fecha" />
                            <Select.Icon>
                              <ChevronDownIcon />
                            </Select.Icon>
                          </Select.Trigger>

                          {/* Content */}
                          <Select.Portal>
                            <Select.Content className="z-[9999] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                              <Select.Viewport className="p-2">
                                {availableDates.map((c) => {
                                  const localDate = new Date(c.date);
                                  const formattedDate =
                                    localDate.toLocaleDateString("es-MX", {
                                      weekday: "short",
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    });
                                  const value = c.key;

                                  return (
                                    <Select.Item
                                      key={value as unknown as string}
                                      value={value as unknown as string}
                                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between rounded-md"
                                    >
                                      <Select.ItemText>
                                        {formattedDate} | {c.startHour} -{" "}
                                        {c.endHour}
                                      </Select.ItemText>
                                      <Select.ItemIndicator>
                                        <CheckIcon />
                                      </Select.ItemIndicator>
                                    </Select.Item>
                                  );
                                })}
                              </Select.Viewport>
                            </Select.Content>
                          </Select.Portal>
                        </Select.Root>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3 - Fecha y hora */}
                {/*                   {step === 3 && (
                    <div>
                      <h3 className="font-semibold mb-2">
                        Selecciona fecha y rango de horas
                      </h3>
                      <div className="w-full border border-gray-300 rounded-xl shadow-sm p-4 space-y-4">
                        <DayPicker
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          locale={es}
                          className="w-full date-picker-collection"
                          disabled={(date) =>
                            !availableDates.some(
                              (d) =>
                                d.date.toDateString() === date.toDateString()
                            )
                          }
                        />
                      </div>
                    </div>
                  )} */}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-300 flex justify-between gap-2">
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className="btn btn-sm btn-secondary"
                  >
                    Atrás
                  </button>
                )}
                {step === 1 ? (
                  <button
                    onClick={handleNext}
                    className="btn btn-sm btn-primary flex-1"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={handleCreate}
                    disabled={loadingCreateCollection}
                    className={`btn btn-sm w-full text-white ${
                      !totalWeight ||
                      !totalPackages ||
                      loadingCreateCollection ||
                      !selectedDate
                        ? "cursor-not-allowed bg-gray-400 shadow-none hover:bg-gray-400"
                        : "btn-primary"
                    }`}
                  >
                    {loadingCreateCollection ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        Generando recolección...
                      </div>
                    ) : (
                      "Crear Recolección"
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </Dialog.Content>
        )}
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}
