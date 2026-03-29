"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons";

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
}

export interface CustomerForm {
  company: string;
  company_rfc?: string;
  contacts: ContactForm[];
}

interface ModalCreateCustomerProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (customer: CustomerForm) => Promise<void> | void;
}

export default function ModalCrearCliente({
  visible,
  onClose,
  onCreate,
}: ModalCreateCustomerProps) {
  const [company, setCompany] = useState("");
  const [companyRfc, setCompanyRfc] = useState("");
  const [contacts, setContacts] = useState<ContactForm[]>([]);

  const [errors, setErrors] = useState<{ email?: string; phone?: string }[]>(
    [{ email: "", phone: "" }]
  );

  const [loading, setLoading] = useState(false);

  const addContact = () => {
    setContacts([...contacts, { name: "", email: "", phone: "" }]);
    setErrors([...errors, { email: "", phone: "" }]);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
    setErrors(errors.filter((_, i) => i !== index));
  };

  const validateEmail = (email: string) => {
    if (!email) return "";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) ? "" : "Correo inválido";
  };

  const validatePhone = (phone: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 10 ? "" : "El teléfono debe tener 10 dígitos";
  };

  const updateContact = (index: number, field: string, value: string) => {
    const updated = [...contacts];
    // @ts-ignore
    updated[index][field] = value;
    setContacts(updated);

    const updatedErrors = [...errors];
    if (field === "email") {
      updatedErrors[index].email = validateEmail(value);
    }
    if (field === "phone") {
      updatedErrors[index].phone = validatePhone(value);
    }
    setErrors(updatedErrors);
  };

  const createCustomer = async () => {
    if (!company.trim()) {
      alert("El nombre de la empresa es obligatorio");
      return;
    }

    // Validar todos los contactos al guardar
    const newErrors = contacts.map((c) => ({
      email: validateEmail(c.email),
      phone: validatePhone(c.phone || ""),
    }));

    setErrors(newErrors);

    // Si hay cualquier error → detener
    const hasErrors = newErrors.some(
      (e) => e.email !== "" || e.phone !== ""
    );
    if (hasErrors) return;

    setLoading(true);

    try {
      await onCreate({
        company,
        company_rfc: companyRfc || undefined,
        contacts,
      });

      // limpiar
      setCompany("");
      setCompanyRfc("");
      setContacts([]);
      setErrors([{ email: "", phone: "" }]);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // ESC para cerrar
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white p-8 rounded-xl shadow-2xl max-w-3xl w-full flex flex-col gap-6 relative"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-black hover:text-gray-700 font-bold text-lg cursor-pointer"
            >
              ×
            </button>

            <h3 className="text-xl font-semibold text-center text-brand">
              Nuevo Cliente
            </h3>

            {/* Empresa */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">Empresa *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Nombre de la empresa"
              />
            </div>

            {/* RFC */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">RFC (opcional)</label>
              <input
                type="text"
                value={companyRfc}
                onChange={(e) => setCompanyRfc(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="RFC"
              />
            </div>

            {/* Contactos */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <label className="font-medium text-brand">Contactos</label>
                <button
                  onClick={addContact}
                  className="bg-green-500 hover:bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {contacts.map((c, index) => (
                  <div
                    key={index}
                    className="relative border border-gray-200 rounded-xl p-3 bg-gray-50"
                  >
                    {contacts.length > 1 && (
                      <button
                        onClick={() => removeContact(index)}
                        className="absolute -right-2 -top-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                      >
                        <Cross2Icon className="w-4 h-4" />
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Nombre */}
                      <div className="flex flex-col">
                        <input
                          type="text"
                          placeholder="Nombre"
                          value={c.name}
                          onChange={(e) =>
                            updateContact(index, "name", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col">
                        <input
                          type="email"
                          placeholder="Correo"
                          value={c.email}
                          onChange={(e) =>
                            updateContact(index, "email", e.target.value)
                          }
                          className={`px-3 py-2 border rounded-lg ${
                            errors[index]?.email
                              ? "border-red-400"
                              : "border-gray-300"
                          }`}
                        />
                        {errors[index]?.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[index].email}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="flex flex-col">
                        <input
                          type="text"
                          placeholder="Teléfono (10 dígitos)"
                          value={c.phone}
                          onChange={(e) =>
                            updateContact(index, "phone", e.target.value)
                          }
                          className={`px-3 py-2 border rounded-lg ${
                            errors[index]?.phone
                              ? "border-red-400"
                              : "border-gray-300"
                          }`}
                        />
                        {errors[index]?.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[index].phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={createCustomer}
                disabled={loading}
                className={`btn btn-sm btn-primary${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {loading ? "Guardando..." : "Guardar Cliente"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
