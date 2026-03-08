"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";
import { register } from "@/services/user";

interface InvitePayload {
  email: string;
  [key: string]: any;
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!invite) {
      setAllowed(false);
      return;
    }

    try {
      const decoded = jwtDecode<InvitePayload>(invite);
      if (decoded?.email) {
        setForm((prev) => ({ ...prev, email: decoded.email }));
        setAllowed(true);
      } else {
        setAllowed(false);
      }
    } catch (err) {
      console.error("Token inválido", err);
      setAllowed(false);
    }
  }, [invite]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (
      !form.full_name ||
      !form.email ||
      !form.telefono ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await register(invite, {
        full_name: form.full_name,
        email: form.email,
        phone: form.telefono,
        password: form.password,
      });
      
      setSuccess(true);
      setTimeout(() => router.push("/auth/iniciar-sesion"), 1500);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al registrar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <span className="animate-spin border-4 border-gray-400 border-t-transparent rounded-full w-8 h-8"></span>
      </div>
    );
  }

  if (allowed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-lg rounded-xl p-8 text-center"
        >
          <h1 className="text-2xl font-semibold text-red-600 mb-2">
            Acceso denegado
          </h1>
          <p className="text-gray-600">
            El enlace de invitación no es válido o ha expirado.
          </p>
          <div className="mt-4">
            <button
              onClick={() => router.push("/auth/iniciar-sesion")}
              className="text-[#02101d] hover:underline font-medium"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Lado izquierdo azul con logo */}
      <div
        className="w-full md:w-1/4 bg-[#02101d] flex justify-center items-center py-8 cursor-pointer"
        onClick={() => router.push("/auth/iniciar-sesion")}
      >
        <Image
          src="https://i.postimg.cc/tRx2S91P/Captura-de-pantalla-2025-12-05-a-la(s)-3-46-29-p-m.png"
          alt="Logo empresa"
          width={200}
          height={200}
          className="transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Lado derecho con formulario */}
      <div className="w-full md:w-3/4 flex justify-center items-center bg-gray-100 py-8">
        <motion.div
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-semibold text-center mb-6">
            Registro de usuario
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">Nombre completo</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#02101d]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                readOnly={!!invite}
                required
                className={`mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#02101d] ${
                  invite ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                required
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#02101d]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#02101d]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">
                Confirmar contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#02101d]"
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && (
              <div className="text-green-500 text-sm text-center">
                Registro exitoso. Redirigiendo...
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-6 py-2 bg-[#02101d] text-white rounded-xl hover:bg-[#0e1b32] transition-all duration-300 font-medium flex justify-center items-center gap-2"
            >
              {loading ? (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
              ) : (
                "Registrarme"
              )}
            </button>
          </form>

          {/* Botón volver al login */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push("/auth/iniciar-sesion")}
              className="text-[#02101d] text-sm hover:underline font-medium transition-all cursor-pointer"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
