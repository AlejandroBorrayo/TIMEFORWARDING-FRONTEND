"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageOptionsDto } from "@/type/general";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/app/cuenta/folios/page";

/* ===================== CUSTOMERS ===================== */
import {
  FindAll as FindCustomers,
  Create as CreateCustomer,
} from "@/services/customer";
import { CustomerInterface } from "@/type/customer.interface";
import ModalCrearCliente from "@/components/createCustomerModal";
import Link from "next/link";

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ===================== STATE ===================== */
  const [customers, setCustomers] = useState<CustomerInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openNewCustomer, setOpenNewCustomer] = useState(false);
  const [customerSearch, setCustomerSearch] = useState(searchParams.get("cliente") ?? "");
  const debouncedCustomerSearch = useDebounce(customerSearch, 500);

  /* ===================== FETCH ===================== */
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const pagination: PageOptionsDto = {
        page,
        perpage: PAGE_SIZE,
      };

      const res = await FindCustomers(pagination, debouncedCustomerSearch);
      setCustomers(res.records);
      setTotalPages(res.totalpages);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedCustomerSearch]);

  const hanldeCreateCustomer = async (customer) => {
    await CreateCustomer(customer);
    await fetchCustomers();
  };

  useEffect(() => {
    setPage(1);
  }, [customerSearch]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedCustomerSearch) {
      params.set("cliente", debouncedCustomerSearch);
    } else {
      params.delete("cliente");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [debouncedCustomerSearch, router, searchParams]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.h1
        className="text-2xl font-semibold mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Cartera de clientes
      </motion.h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <input
          type="text"
          placeholder="Buscar cliente"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          className="flex-1 min-w-[220px] px-4 py-2 border border-gray-300 rounded-xl
                     focus:ring-1 focus:ring-brand"
        />

        <button
          onClick={() => setOpenNewCustomer(true)}
          className="btn btn-sm btn-primary"
        >
          Nuevo cliente
        </button>
      </div>

      <section className="bg-white border border-gray-300 rounded-xl p-4">
  {/* ===================== TABLE DESKTOP ===================== */}
  <div className="hidden md:block overflow-x-auto">
    <table className="w-full table-fixed border-collapse">
      <thead>
        <tr className="border-b border-gray-300 text-left text-sm text-gray-500">
          <th className="px-4 py-2 w-1/4">Empresa</th>
          <th className="px-4 py-2 w-1/4">RFC</th>
          <th className="px-4 py-2 w-1/4">Contactos</th>
          <th className="px-4 py-2 w-1/4"></th>
        </tr>
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td colSpan={4} className="text-center py-4 text-gray-500">
              Cargando...
            </td>
          </tr>
        ) : customers.length === 0 ? (
          <tr>
            <td colSpan={4} className="text-center py-4 text-gray-400">
              Sin clientes registrados
            </td>
          </tr>
        ) : (
          customers.map((customer, i) => (
            <motion.tr
              key={customer._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="border-b border-gray-300 hover:bg-gray-50"
            >
              <td className="px-4 py-3 font-medium">
                {customer.company}
              </td>

              <td className="px-4 py-3 text-sm text-gray-600">
                {customer.company_rfc || "—"}
              </td>

              <td className="px-4 py-3 text-sm">
                {customer.contacts.length > 0 ? (
                  <ul className="space-y-1">
                    {customer.contacts.map((c, idx) => (
                      <li key={idx}>
                        <span className="font-medium">{c.name}</span>
                        <span className="text-gray-500">
                          {" "}
                          · {c.email}
                        </span>
                        {c.phone && (
                          <span className="text-gray-400">
                            {" "}
                            · {c.phone}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400">
                    Sin contactos
                  </span>
                )}
              </td>

              <td className="px-4 py-3 text-center">
                <Link
                  href={`/cuenta/cliente/${customer._id}`}
                  className="btn btn-sm btn-outline-primary"
                >
                  Ver histórico
                </Link>
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
      {customers.map((customer) => (
        <motion.div
          key={customer._id}
          className="bg-white border rounded-xl p-4 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-semibold text-lg">
            {customer.company}
          </p>

          {customer.company_rfc && (
            <p className="text-sm text-gray-500">
              RFC: {customer.company_rfc}
            </p>
          )}

          <div className="mt-3">
            <p className="text-sm font-medium mb-1">
              Contactos
            </p>

            {customer.contacts.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {customer.contacts.map((c, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{c.name}</span> ·{" "}
                    {c.email}
                    {c.phone && ` · ${c.phone}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">
                Sin contactos
              </p>
            )}

            <button
              onClick={() =>
                (window.location.href = `/cuenta/cliente/${customer._id}`)
              }
              className="btn btn-sm btn-outline-primary mt-4 w-full text-sm font-semibold"
            >
              Ver histórico
            </button>
          </div>
        </motion.div>
      ))}
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

      <ModalCrearCliente
        onCreate={hanldeCreateCustomer}
        visible={openNewCustomer}
        onClose={() => setOpenNewCustomer(false)}
      ></ModalCrearCliente>
    </motion.div>
  );
}
