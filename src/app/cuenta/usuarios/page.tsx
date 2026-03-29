"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { findAllUsers, inviteUser, updateUser } from "@/services/user";
import { UserCollectionInterface } from "@/type/user.interface";
import { Toast } from "@/components/toast";
import { useAuth } from "@/components/authProvider";
import { createPortal } from "react-dom";
import Link from "next/link";
/* import ModalDetalleUsuario from "@/components/userDetailModal"; */

const PAGE_SIZE = 10;

const formatCommission = (user: UserCollectionInterface) => {
  const commissionValue = Number(user.commission ?? 0);
  if (user.type_commission === "percentage") {
    return `${commissionValue}%`;
  }
  return `$${commissionValue.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function UsersPage() {
  const { session } = useAuth();

  const userid = session?.user?.sub;
  const isAdmin = session?.user?.role === "admin";

  const [users, setUsers] = useState<UserCollectionInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  const fetchUsers = useCallback(async () => {
    if (!userid) return;
    setLoading(true);
    try {
      const pagination = { page, perpage: PAGE_SIZE };
      const res = await findAllUsers(userid, pagination, search);
      setUsers(res.records);
      setTotalPages(res.totalpages);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, userid]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
  }, [fetchUsers, isAdmin]);

  // Cerrar modal con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowInviteModal(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (!isAdmin)
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
        </motion.div>
      </div>
    );

  const handleInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setToast({
        visible: true,
        message: "Por favor completa todos los campos.",
        type: "error",
      });
      return;
    }

    setSendingInvite(true);
    try {
      await inviteUser(inviteName, inviteEmail);
      setToast({
        visible: true,
        message: "Invitación enviada correctamente ✔",
        type: "success",
      });
      setInviteName("");
      setInviteEmail("");
      setShowInviteModal(false);
    } catch (error) {
      console.error(error);
      setToast({
        visible: true,
        message: "Error al enviar invitación",
        type: "error",
      });
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ===================== HEADER ===================== */}
      <div className="flex justify-between items-center mb-6">
        <motion.h1
          className="text-2xl font-semibold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Usuarios
        </motion.h1>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-[#02101d] text-white rounded-xl cursor-pointer"
        >
          Nuevo usuario
        </button>
      </div>

      {/* ===================== SEARCH BAR ===================== */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#02101d] focus:border-[#02101d]"
        />
      </div>

      <section className="bg-white border border-gray-300 rounded-xl p-4">
        {/* ===================== TABLE DESKTOP ===================== */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-left text-sm text-gray-500">
                <th className="px-4 py-2 w-[20%]">Nombre</th>
                <th className="px-4 py-2 w-[25%]">Correo</th>
                <th className="px-4 py-2 w-[15%]">Teléfono</th>
                <th className="px-4 py-2 w-[10%]">Rol</th>
                <th className="px-4 py-2 w-[20%]">Comisión</th>
                <th className="px-4 py-2 w-[10%]"></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-400">
                    Sin usuarios registrados
                  </td>
                </tr>
              ) : (
                users.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="border-b border-gray-300 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {user?.full_name}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.email}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.phone || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.role || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatCommission(user)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <UserActionsModal
                        fetchUsers={fetchUsers}
                        adminUserid={userid}
                        setToast={setToast}
                        user={user}
                      />
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===================== MOBILE ===================== */}
        <div className="md:hidden flex flex-col gap-4">
          <AnimatePresence>
            {loading ? (
              <div className="text-center py-4 text-gray-500">Cargando...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                Sin usuarios registrados
              </div>
            ) : (
              users.map((user, i) => (
                <motion.div
                  key={user._id}
                  className="bg-white border rounded-xl p-4 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-lg">
                      {user.full_name}
                    </p>
                    <UserActionsModal
                      fetchUsers={fetchUsers}
                      adminUserid={userid!}
                      setToast={setToast}
                      user={user}
                    />
                  </div>

                  <p className="text-sm text-gray-500 mb-1">{user.email}</p>

                  <p className="text-sm text-gray-500 mb-1">
                    {user.phone || "Sin teléfono"}
                  </p>

                  <p className="text-sm text-gray-500">
                    Comisión: {formatCommission(user)}
                  </p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* ===================== PAGINATION ===================== */}
        <div className="flex justify-end items-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-xl disabled:opacity-50 cursor-pointer"
          >
            Anterior
          </button>
          <span className="text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-xl disabled:opacity-50 cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </section>

      {/* Modal de invitación */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full flex flex-col gap-6 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowInviteModal(false)}
                className="absolute top-4 right-4 text-black hover:text-gray-700 font-bold text-lg"
              >
                ×
              </button>

              <h3 className="text-xl font-semibold text-center text-[#02101d]">
                Invitar usuario
              </h3>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#02101d]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Correo</label>
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#02101d]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
                  disabled={sendingInvite}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleInvite}
                  disabled={sendingInvite}
                  className={`px-6 py-2 rounded-xl text-white flex items-center justify-center transition-all cursor-pointer ${
                    sendingInvite
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#02101d] hover:bg-[#0e1b32]"
                  }`}
                >
                  {sendingInvite ? "Enviando..." : "Aceptar"}
                </button>
              </div>
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

/* ===============================
   Modal de acciones de usuario con Portal
   =============================== */
function UserActionsModal({
  user,
  fetchUsers,
  setToast,
}: {
  fetchUsers: () => Promise<void>;
  adminUserid: string;
  setToast: (value: {
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }) => void;
  user: UserCollectionInterface;
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionType, setCommissionType] = useState<"percentage" | "amount">(
    user.type_commission ?? "percentage",
  );
  const [commissionValue, setCommissionValue] = useState(
    String(user.commission ?? 0),
  );
  const [savingCommission, setSavingCommission] = useState(false);

  const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showCommissionModal) return;
    setCommissionType(user.type_commission ?? "percentage");
    setCommissionValue(String(user.commission ?? 0));
  }, [showCommissionModal, user.type_commission, user.commission]);

  const handleSaveCommission = async () => {
    if (!user._id) {
      setToast({
        visible: true,
        message: "No se pudo identificar al usuario",
        type: "error",
      });
      return;
    }

    const parsedCommission = Number(commissionValue);
    if (Number.isNaN(parsedCommission) || parsedCommission < 0) {
      setToast({
        visible: true,
        message: "Ingresa una comisión válida",
        type: "error",
      });
      return;
    }

    if (commissionType === "percentage" && parsedCommission > 100) {
      setToast({
        visible: true,
        message: "El porcentaje no puede ser mayor a 100",
        type: "error",
      });
      return;
    }

    setSavingCommission(true);
    try {
      await updateUser(user._id, {
        commission: parsedCommission,
        type_commission: commissionType,
      });
      await fetchUsers();
      setShowCommissionModal(false);
      setShowPopup(false);
      setToast({
        visible: true,
        message: "Comisión actualizada correctamente",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      setToast({
        visible: true,
        message: "Error al actualizar la comisión",
        type: "error",
      });
    } finally {
      setSavingCommission(false);
    }
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={(e) => {
            const rect = (
              e.currentTarget as HTMLElement
            ).getBoundingClientRect();
            setPopupPos({
              top: rect.bottom + window.scrollY,
              left: rect.left + window.scrollX - 120,
            });
            setShowPopup(!showPopup);
          }}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 cursor-pointer"
        >
          <DotsVerticalIcon className="w-5 h-5" />
        </button>

        {/* Popup con portal */}
        {showPopup &&
          createPortal(
            <AnimatePresence>
              <motion.div
                ref={popupRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: "absolute",
                  top: popupPos.top,
                  left: popupPos.left,
                  width: 180,
                }}
                className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col"
              >
                <button
                  onClick={() => {
                    setShowPopup(false);
                    setShowCommissionModal(true);
                  }}
                  className="px-4 py-2 text-left hover:bg-gray-100 w-full cursor-pointer"
                >
                  Comisión
                </button>
                <Link
                  href={`/cuenta/folios/?usuario=${user.full_name}`}
                  className="px-4 py-2 text-left hover:bg-gray-100 w-full cursor-pointer"
                >
                  Folios de usuario
                </Link>
              </motion.div>
            </AnimatePresence>,
            document.body,
          )}
      </div>

      <AnimatePresence>
        {showCommissionModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCommissionModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full flex flex-col gap-4 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowCommissionModal(false)}
                className="absolute top-4 right-4 text-black hover:text-gray-700 font-bold text-lg cursor-pointer"
              >
                ×
              </button>

              <h3 className="text-xl font-semibold text-[#02101d]">
                Actualizar comisión
              </h3>

              <p className="text-sm text-gray-500">{user.full_name}</p>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={commissionType}
                  onChange={(e) =>
                    setCommissionType(
                      e.target.value as "percentage" | "amount",
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#02101d]"
                >
                  <option value="percentage">Porcentaje</option>
                  <option value="amount">Monto fijo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {commissionType === "percentage"
                    ? "Comisión (%)"
                    : "Comisión ($)"}
                </label>
                <input
                  type="number"
                  min="0"
                  step={commissionType === "percentage" ? "0.1" : "0.01"}
                  value={commissionValue}
                  onChange={(e) => setCommissionValue(e.target.value)}
                  placeholder={
                    commissionType === "percentage" ? "Ej. 10" : "Ej. 1500"
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#02101d]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => setShowCommissionModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
                  disabled={savingCommission}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCommission}
                  disabled={savingCommission}
                  className={`px-6 py-2 rounded-xl text-white transition-all cursor-pointer ${
                    savingCommission
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#02101d] hover:bg-[#0e1b32]"
                  }`}
                >
                  {savingCommission ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
