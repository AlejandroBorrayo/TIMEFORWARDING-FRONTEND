"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, CheckIcon } from "@radix-ui/react-icons";

import type { AddressCollectionInterface } from "@/type/address.interface";
import type { PageOptionsDto } from "@/type/general";
import { FindAll, Update, Delete, Create } from "@/services/address";
import { Toast } from "@/components/toast";
import { FindAddress } from "@/services/dipomex";
import { useAuth } from "@/components/authProvider";
const PAGE_SIZE = 5;

const countries = [{ code: "MX", name: "México", emoji: "🇲🇽" }];

export default function AddressBookPage() {
  const { session } = useAuth();
  const userid = session?.user?.sub;
  const [addresses, setAddresses] = useState<AddressCollectionInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] =
    useState<AddressCollectionInterface | null>(null);

  // Form
  const [recipient, setRecipient] = useState<AddressCollectionInterface>({
    name: "",
    email: "",
    phone: "",
    company: "",
    country: "México",
    postal_code: "",
    state: "",
    municipality: "",
    neighborhood: "",
    street: "",
    number_ext: "",
    number_int: "",
    references: "",
  });

  useEffect(() => {
    const fetchAddressByCP = async () => {
      if (recipient?.postal_code?.length === 5) {
        try {
          const res = await FindAddress(recipient.postal_code?.toString());
          if (!res.error && res.codigo_postal) {
            setRecipient((prev) => ({
              ...prev,
              state: res.codigo_postal.estado,
              municipality: res.codigo_postal.municipio,
              neighborhood: res.codigo_postal?.colonias?.[0],
            }));
          }
        } catch (err) {
          console.error("Error buscando CP:", err);
        } finally {
        }
      }
    };

    fetchAddressByCP();
  }, [recipient.postal_code]);

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });
  const [loadingSave, setLoadingSave] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputClass =
    "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#02101d] focus:border-[#02101d]";

  // ---------------- Fetch Addresses ----------------
  const fetchAddresses = async (page: number, search: string) => {
    setLoading(true);
    try {
      const filters: PageOptionsDto = {
        page,
        perpage: PAGE_SIZE,
      };

      const data = await FindAll(userid, filters, search);

      setAddresses(data.records || []);
      setTotalPages(data.totalpages || 1);
      setPage(data.page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses(page, debouncedSearch);
  }, [page, debouncedSearch]);

  // ---------------- Modal ----------------
  const handleOpenModal = (addr: AddressCollectionInterface | null = null) => {
    if (addr) {
      setSelectedAddress(addr);
      setRecipient({ ...addr });
    } else {
      setSelectedAddress(null);
      setRecipient({
        name: "",
        email: "",
        phone: "",
        company: "",
        country: "México",
        postal_code: "",
        state: "",
        municipality: "",
        neighborhood: "",
        street: "",
        number_ext: "",
        number_int: "",
        references: "",
      });
    }
    setErrors({});
    setModalOpen(true);
  };

  // ---------------- Validaciones ----------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, maxLength } = e.target;
  
    if (maxLength > 0 && value.length > maxLength) return;
  
    if (name === "name" && value.length > 30) return;
  
    if (name === "phone" || name === "postal_code") {
      const numericValue = value.replace(/\D/g, "");
      setRecipient((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }
  
    // 🔹 Solo letras y espacios para ciertos campos
    const textOnlyFields = [
      "name",
      "state",
      "municipality",
      "neighborhood",
    ];
  
    if (textOnlyFields.includes(name)) {
      const textValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
      setRecipient((prev) => ({ ...prev, [name]: textValue }));
      return;
    }
  
    // 🔹 Otros campos normales
    setRecipient((prev) => ({ ...prev, [name]: value }));
  };
  

  const handleCountryChange = (value: string) => {
    setRecipient((prev) => ({ ...prev, country: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Nombre, Estado, Municipio, Colonia, Calle: solo letras y espacios
    const textFields = [
      "name",
      "state",
      "municipality",
      "neighborhood",
    ];
    const textRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    textFields.forEach((field) => {
      const value = recipient[field as keyof AddressCollectionInterface];
      if (!value) {
        newErrors[field] = "Requerido";
      } else if (!textRegex.test(value as string)) {
        newErrors[field] = "Solo se permiten letras y espacios";
      }
    });

    // Email
    if (!recipient.email) {
      newErrors.email = "Email requerido";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(recipient.email)
    ) {
      newErrors.email = "Formato de email inválido";
    }

    // Teléfono: 10 dígitos
    if (!recipient.phone) {
      newErrors.phone = "Teléfono requerido";
    } else if (!/^\d{10}$/.test(recipient.phone)) {
      newErrors.phone = "Debe contener 10 dígitos numéricos";
    }

    // Código postal: México (5 dígitos)
    if (!recipient.postal_code) {
      newErrors.postal_code = "Código postal requerido";
    } else if (!/^\d{5}$/.test(recipient.postal_code)) {
      newErrors.postal_code = "Código postal inválido (5 dígitos)";
    }

    // Número exterior obligatorio
    if (!recipient.number_ext) {
      newErrors.number_ext = "Número exterior requerido";
    }

    // Referencias obligatorias
    if (!recipient.references) {
      newErrors.references = "Referencias requeridas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------- Submit ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoadingSave(true);
    try {
      if (selectedAddress?._id) {
        await Update(selectedAddress._id, recipient);
        setToast({
          visible: true,
          message: "Datos actualizados ✔",
          type: "success",
        });
      } else {
        await Create(userid, recipient);
        setToast({
          visible: true,
          message: "Dirección creada ✔",
          type: "success",
        });
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      setToast({
        visible: true,
        message: "Ocurrió un error al procesar la solicitud ❌",
        type: "error",
      });
    } finally {
      setLoadingSave(false);
      await fetchAddresses(page, search);
    }
  };

  const handleDelete = async (_id: string | null) => {
    if (!_id) return;
    setLoading(true);
    try {
      await Delete(_id);
      setModalOpen(false);
      setToast({
        visible: true,
        message: "Dirección eliminada ✔",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setToast({
        visible: true,
        message: "Ocurrió un error al procesar la solicitud ❌",
        type: "success",
      });
    } finally {
      setLoading(false);
      await fetchAddresses(page, search);
    }
  };

  // ---------------- Cerrar modal con ESC ----------------
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    if (modalOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [modalOpen]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // Espera 500ms después de que el usuario deja de escribir

    return () => clearTimeout(handler);
  }, [search]);

  // ---------------- Render ----------------
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-2xl font-semibold mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Directorio
      </motion.h1>

      {/* Subheader */}
      <motion.div
        className="flex flex-wrap items-center justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex gap-2 flex-1 min-w-[300px]">
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#02101d] focus:border-[#02101d]"
          />
          <button
            onClick={() => handleOpenModal(null)}
            className="px-4 py-2 bg-[#02101d] text-white rounded-xl hover:bg-[#0e1b32] cursor-pointer transition-colors"
          >
            Agregar
          </button>
        </div>
      </motion.div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="min-w-full table-fixed border-collapse text-left">
          <colgroup>
            <col style={{ width: "15%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Teléfono</th>
              <th className="px-4 py-2">Ciudad / Estado</th>
              <th className="px-4 py-2">Dirección</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : addresses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No hay registros
                </td>
              </tr>
            ) : (
              addresses.map((addr, i) => (
                <motion.tr
                key={addr._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td
                    className="px-4 py-3 font-medium text-left max-w-[180px] truncate whitespace-nowrap overflow-hidden"
                    title={addr.name}
                  >
                    {addr.name}
                  </td>
                  <td
                    className="px-4 py-3 text-left max-w-[200px] truncate"
                    title={addr.email}
                  >
                    {addr.email}
                  </td>
                  <td className="px-4 py-3 text-left">{addr.phone}</td>
                  <td className="px-4 py-3 text-left">
                    {addr.municipality} / {addr.state}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {addr.street} {addr.number_ext}{" "}
                    {addr.number_int && `Int ${addr.number_int}`},{" "}
                    {addr.neighborhood}, {addr.postal_code}, {addr.country}
                  </td>
                  <td className="px-4 py-3 flex gap-1">
                    <button
                      onClick={() => handleOpenModal(addr)}
                      className="px-3 py-1 bg-[#02101d] text-white rounded-xl hover:bg-[#0e1b32] cursor-pointer transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAddress(addr);
                        handleDelete(addr?._id ?? null);
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded-xl hover:bg-red-700 cursor-pointer transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

{/* Mobile cards */}
<div className="md:hidden flex flex-col gap-4">
  {loading ? (
    <div className="text-center py-6 text-gray-500">
      Cargando...
    </div>
  ) : addresses.length === 0 ? (
    <div className="text-center py-6 text-gray-500">
      No hay directorio
    </div>
  ) : (
    addresses.map((addr, index) => (
      <motion.div
        key={addr._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer p-3 rounded-xl"
      >
        <div className="flex justify-between mb-2">
          <span className="font-medium">{addr.name}</span>
          <button
            onClick={() => handleOpenModal(addr)}
            className="px-3 py-1 bg-[#02101d] text-white rounded-xl hover:bg-[#0e1b32] cursor-pointer transition-colors"
          >
            Ver
          </button>
        </div>
        <div className="text-gray-500 text-sm mb-1">{addr.email}</div>
        <div className="text-gray-500 text-sm mb-1">{addr.phone}</div>
        <div className="text-gray-500 text-sm mb-1">
          {addr.municipality} / {addr.state}
        </div>
        <div className="text-gray-500 text-sm">
          {addr.street} {addr.number_ext}{" "}
          {addr.number_int && `Int ${addr.number_int}`},{" "}
          {addr.neighborhood}, {addr.postal_code}, {addr.country}
        </div>
      </motion.div>
    ))
  )}
</div>


      {/* Pagination */}
      <div className="flex justify-end gap-2 mt-4 flex-wrap">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded-xl border border-gray-300 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span className="px-3 py-1">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded-xl border border-gray-300 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-2xl max-w-3xl w-full flex flex-col gap-6 relative overflow-y-auto max-h-[90vh]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setModalOpen(false)}
                className=" cursor-pointer absolute top-4 right-4 text-black hover:text-gray-700 font-bold text-lg "
              >
                ×
              </button>

              <h3 className="text-xl font-semibold text-center">
                {selectedAddress
                  ? "Editar Destinatario"
                  : "Agregar Destinatario"}
              </h3>

{/* Form */}
<form onSubmit={handleSubmit} className="space-y-4">
  <div className="flex flex-wrap gap-4">
    {[
      { name: "name", label: "Nombre", maxLength: 30 },
      { name: "email", label: "Email" },
      { name: "phone", label: "Teléfono" },
      { name: "company", label: "Compañía (Opcional)" },
      { name: "postal_code", label: "Código Postal" },
      { name: "state", label: "Estado" },
      { name: "municipality", label: "Municipio" },
      { name: "neighborhood", label: "Colonia" },
      { name: "street", label: "Calle" },
      { name: "number_ext", label: "Número Ext." },
      { name: "number_int", label: "Número Int. (Opcional)" },
      { name: "references", label: "Referencias", maxLength: 30 },
    ].map((field) => {
      const value =
        recipient[field.name as keyof AddressCollectionInterface] !== undefined
          ? String(
              recipient[field.name as keyof AddressCollectionInterface]
            )
          : "";

      return (
        <div
          key={field.name}
          className="flex flex-col flex-1 min-w-[170px]"
        >
          <label className="text-gray-700 mb-1 font-medium">
            {field.label}
          </label>

          <input
            type="text"
            name={field.name}
            maxLength={field.maxLength}
            value={value}
            onChange={handleChange}
            className={`${inputClass} ${
              errors[field.name] ? "border-red-500" : ""
            }`}
          />

          {errors[field.name] && (
            <span className="text-red-500 text-sm mt-1">
              {errors[field.name]}
            </span>
          )}

          {field.maxLength && (
            <span className="text-gray-400 text-xs mt-1">
              {value.length} / {field.maxLength} caracteres
            </span>
          )}
        </div>
      );
    })}

    <div className="flex flex-col flex-1 min-w-[170px]">
      <label className="text-gray-700 mb-1 font-medium">
        País
      </label>
      <Select.Root
        value={recipient.country}
        onValueChange={handleCountryChange}
      >
        <Select.Trigger className="w-full px-3 py-2 cursor-pointer border border-gray-300 rounded-md flex justify-between items-center bg-white focus:outline-none focus:ring-1 focus:ring-[#02101d] focus:border-[#02101d]">
          <Select.Value>
            <span className="flex items-center gap-2">
              {
                countries.find(
                  (c) => c.name === recipient.country
                )?.emoji
              }{" "}
              {recipient.country}
            </span>
          </Select.Value>
          <Select.Icon>
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>
        <Select.Content className="absolute z-50 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <Select.Viewport>
            {countries.map((c) => (
              <Select.Item
                key={c.code}
                value={c.name}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              >
                <span>{c.emoji}</span>
                <span>{c.name}</span>
                <Select.ItemIndicator>
                  <CheckIcon />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Root>
    </div>
  </div>

  {/* Botones */}
  <div className="flex justify-end gap-3 mt-4">
    <button
      type="button"
      onClick={() => setModalOpen(false)}
      className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
    >
      Cancelar
    </button>
    <button
      type="submit"
      disabled={loadingSave}
      className="px-6 py-2 bg-[#02101d] text-white rounded-xl hover:bg-[#0e1b32] hover:shadow-2xl cursor-pointer transition-all duration-300 font-medium flex items-center justify-center gap-2"
    >
      Guardar
      {loadingSave && (
        <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
      )}
    </button>
  </div>
</form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </motion.div>
  );
}
