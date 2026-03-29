"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { recoveryPassword } from "@/services/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [isRecovering, setIsRecovering] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email o contraseña incorrectos");
    } else {
      router.push("/cuenta/folios");
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    if (!form.email) {
      setError("Debes ingresar tu correo electrónico");
      return;
    }

    try {
      // Simulación de envío de correo
      await recoveryPassword(form.email);
      setSuccess(true);
    } catch (err) {
      console.log("errerr", err);
      setError("Ocurrió un error. Intenta de nuevo más tarde.");
    } finally {
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
      {/* Lado izquierdo azul con logo */}
      <div className="w-full md:w-1/4 bg-brand flex justify-center items-center py-8">
        <Image
          src="https://i.postimg.cc/tRx2S91P/Captura-de-pantalla-2025-12-05-a-la(s)-3-46-29-p-m.png"
          alt="Logo empresa"
          width={200}
          height={200}
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
          {!isRecovering ? (
            <>
              <h1 className="text-2xl font-semibold text-center mb-6">
                Iniciar sesión
              </h1>

              <form
                onSubmit={handleLoginSubmit}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    required
                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium">
                    Contraseña
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

                {error && (
                  <div className="text-red-500 text-sm mt-1">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 btn btn-md btn-primary w-full max-w-md"
                >
                  {loading ? (
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                  ) : (
                    "Ingresar"
                  )}
                </button>
              </form>

              <div className="mt-4 text-center text-brand text-sm">
                <button
                  className="hover:underline cursor-pointer"
                  onClick={() => setIsRecovering(true)}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-center mb-4">
                Recuperar contraseña
              </h1>
              <p className="text-gray-600 text-sm text-center mb-6">
                Ingresa tu correo electrónico y te enviaremos un enlace para
                recuperar tu contraseña.
              </p>

              <form
                onSubmit={handleRecoverSubmit}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    required
                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm mt-1">{error}</div>
                )}
                {success && (
                  <div className="text-green-500 text-sm mt-1">
                    ¡Revisa tu correo! Te hemos enviado un enlace para recuperar
                    tu contraseña.
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
                    "Recuperar contraseña"
                  )}
                </button>
              </form>

              <div className="mt-4 text-center text-brand text-sm">
                <button
                  className="hover:underline cursor-pointer"
                  onClick={() => {
                    setIsRecovering(false);
                    setError("");
                    setSuccess(false);
                  }}
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
