"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/services/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // Token recibido desde el correo

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.password || !form.confirm) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, form.password);
      setSuccess(true);
      // Redirigir a login después de unos segundos
      setTimeout(() => {
        router.push("/auth/iniciar-sesion");
        setLoading(false);
      }, 2500);
    } catch (err) {
      console.log(err);
      setError("Ocurrió un error al restablecer tu contraseña");
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Lado izquierdo con logo */}
      <div
        className="w-full md:w-1/4 bg-brand flex justify-center items-center py-8 cursor-pointer"
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
          <h1 className="text-2xl font-semibold text-center mb-4">
            Restablecer contraseña
          </h1>

          <p className="text-gray-600 text-sm text-center mb-6">
            Crea una nueva contraseña segura para tu cuenta.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">
                Nueva contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">
                Confirmar contraseña
              </label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
              />
            </div>

            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
            {success && (
              <div className="text-green-500 text-sm mt-1 text-center">
                ¡Tu contraseña ha sido actualizada con éxito!
                <br />
                Serás redirigido al inicio de sesión...
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 btn btn-md btn-primary w-full max-w-md"
            >
              {loading ? (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
              ) : (
                "Actualizar contraseña"
              )}
            </button>
          </form>

          {/* Botón volver al login */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push("/auth/iniciar-sesion")}
              className="text-brand text-sm hover:underline font-medium transition-all"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
