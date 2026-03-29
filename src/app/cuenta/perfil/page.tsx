"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getUser, updateUser } from "@/services/user";
import type { UserCollectionInterface } from "@/type/user.interface";
import { useAuth } from "@/components/authProvider";
import { Toast } from "@/components/toast";

export default function MiCuentaPage() {
  const { session, setSession } = useAuth();
  const [user, setUser] = useState<UserCollectionInterface | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
  });
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [changed, setChanged] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);

  const phoneRegex = /^\d{10}$/;

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.sub) return;
      try {
        setLoadingUser(true);
        const data = await getUser(session.user.sub);
        setUser(data);
        setForm({
          full_name: data.full_name || "",
          phone: data.phone || "",
          email: data.email || "",
        });
      } catch (err) {
        console.error("Error al obtener el usuario", err);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [session?.user?.sub]);

  useEffect(() => {
    if (!user) return;
    const hasChanges =
      form.full_name !== (user.full_name || "") ||
      form.phone !== (user.phone || "");
    setChanged(hasChanges);
  }, [form, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "full_name") {
      const filteredValue = value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, "");
      setForm((prev) => ({ ...prev, [name]: filteredValue }));
    } else if (name === "phone") {
      const filteredValue = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: filteredValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changed || !user) return;

    const newErrors: { [key: string]: string } = {};
    if (!form.full_name) newErrors.full_name = "Requerido";
    if (!phoneRegex.test(form.phone))
      newErrors.phone = "Debe tener 10 dígitos numéricos";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoadingSave(true);
    try {
      const updatedUser = await updateUser(session!.user!.sub, form);
      setSession({
        ...session,
        user: {
          ...session.user,
          name: updatedUser?.full_name,
          email: updatedUser?.email,
        },
      });
      setUser(updatedUser);
      setChanged(false);
      setToast({
        visible: true,
        message: "Datos actualizados correctamente",
        type: "success",
      });
    } catch (err) {
      console.error("Error al actualizar usuario", err);
      setToast({
        visible: true,
        message: "Error al actualizar usuario",
        type: "error",
      });
    } finally {
      setLoadingSave(false);
    }
  };

  const handleReset = () => {
    if (!user) return;
    setForm({
      full_name: user.full_name || "",
      phone: user.phone || "",
      email: user.email || "",
    });
    setErrors({});
  };

  if (loadingUser) return <p>Cargando...</p>;
  if (!user) return <p>Error cargando usuario</p>;

  const fields = [
    { label: "Nombre completo*", name: "full_name" },
    { label: "Teléfono*", name: "phone", type: "tel" },
    { label: "Correo*", name: "email", type: "email", readOnly: true },
  ];

  return (
    <motion.div
      className="p-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.h1 className="text-2xl font-semibold mb-6">Mi Cuenta</motion.h1>

      <motion.form
        onSubmit={handleSave}
        className="flex flex-wrap gap-6 items-end w-full mb-10"
      >
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col flex-1 min-w-[260px]">
            <label className="text-base font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type={field.type || "text"}
              name={field.name}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              required={!field.readOnly}
              placeholder={field.label}
              maxLength={field.name === "phone" ? 10 : undefined}
              readOnly={field.readOnly || false}
              className={`mt-1 w-full px-3 py-2 text-base border rounded-md focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand ${
                field.readOnly
                  ? "bg-gray-100 cursor-not-allowed"
                  : "border-gray-300"
              }`}
            />
            {errors[field.name] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <div className="flex gap-4 mt-2">
          <button
            type="submit"
            disabled={!changed || loadingSave}
            className={`btn btn-md btn-primary ${
              !changed || loadingSave ? "opacity-50" : ""
            }`}
          >
            Guardar
            {loadingSave && (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="btn btn-md border border-gray-400 bg-transparent font-medium text-gray-700 shadow-none hover:bg-gray-100"
          >
            Limpiar
          </button>
        </div>
      </motion.form>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </motion.div>
  );
}
