"use client";

import * as Select from "@radix-ui/react-select";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  Loader2,
  PlusIcon,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { CustomerInterface, ContactInterface } from "@/type/customer.interface";

export default function ContactSelect({
  customer,
  value,
  onChange,
  error,
  setOpenNewContact,
  refreshCustomers,
  setRefreshCustomers,
  mode
}: {
  customer?: CustomerInterface;
  value?: ContactInterface;
  onChange: (val: string) => void;
  error?: boolean;
  setOpenNewContact: (open: boolean) => void;
  refreshCustomers:boolean
  setRefreshCustomers: (refresh: boolean) => void;
  mode:string
}) {
  if (mode === "preview") {
    return <span className={"font-semibold"}>{value?.email || "—"}</span>;
  }
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<ContactInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar contactos del customer
  const fetchData = useCallback(
    (term = "") => {
      if (!customer) {
        setData([]);
        return;
      }

      setLoading(true);
      // Filtrar contactos por nombre o email
      const filtered = customer.contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(term.toLowerCase()) ||
          c.email.toLowerCase().includes(term.toLowerCase())
      );
      setData(filtered);
      setLoading(false);
    },
    [customer]
  );

  // Debounce búsqueda
  useEffect(() => {
    if(!refreshCustomers){
      setRefreshCustomers(false)
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchData(searchTerm);
      }, 300);
    }

  }, [searchTerm, fetchData,refreshCustomers]);

  // Actualizar lista cuando cambie el customer
  useEffect(() => {
    setSearchTerm("");
    fetchData("");
  }, [customer, fetchData]);

  return (
    <div>
      <Select.Root value={value?.email} onValueChange={onChange} open={open}  onOpenChange={setOpen}  /* onOpenChange={(isOpen) => {
    if (!currentQuote) setOpen(isOpen);
  }} */>
        <Select.Trigger
          className={` px-4 py-2 border border-gray-300 rounded-xl flex justify-between items-center bg-white
            ${error ? "border-red-500" : ""}
            focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand`}
        >
          <Select.Value placeholder="Seleccionar contacto">
            <span className="truncate text-ellipsis overflow-hidden whitespace-nowrap flex-1 text-left">
              {data.find((c) => c.email === value?.email)
                ? `${value?.name} - ${value?.email}`
                : "Selecciona un contacto"}
            </span>
          </Select.Value>
          <Select.Icon className="flex-shrink-0 ml-2">
            <ChevronDownIcon className="w-4 h-4 text-gray-600" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            className="
              overflow-hidden bg-white rounded-lg shadow-lg z-50 
              animate-in fade-in slide-in-from-top-1 border border-gray-200
              w-[420px] min-w-[var(--radix-select-trigger-width)] max-w-[95vw]
            "
          >
            <Select.ScrollUpButton className="flex items-center justify-center text-gray-500 py-1">
              <ChevronUpIcon className="w-4 h-4" />
            </Select.ScrollUpButton>

            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-0 text-sm"
              />
            </div>

            <div className="relative max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <Select.Viewport className="p-1">
                {data.length > 0 ? (
                  data.map((c, idx) => (
                    <Select.Item
                      key={idx}
                      value={c.email}
                      className="relative flex items-start px-8 py-2 text-sm rounded-md cursor-pointer select-none 
                        hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      <Select.ItemText>
                        <span className="block whitespace-normal break-words text-left">
                          {c.name} - {c.email}
                        </span>
                      </Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                        <CheckIcon className="w-3 h-3 text-gray-500" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))
                ) : (
                  !loading && (
                    <div className="px-4 py-2 text-gray-400 text-sm">Sin resultados</div>
                  )
                )}

                {loading && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="animate-spin text-gray-500 w-4 h-4" />
                  </div>
                )}
              </Select.Viewport>

              {/* Sticky Footer: Agregar contacto */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200">
                <div
                  onClick={() => {
                    setOpen(false);
                    setOpenNewContact(true);
                  }}
                  className="flex items-center gap-2 px-4 hover:bg-gray-100 focus:bg-gray-100 py-2 text-sm font-medium cursor-pointer select-none"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Agregar contacto</span>
                </div>
              </div>
            </div>

            <Select.ScrollDownButton className="flex items-center justify-center text-gray-500 py-1">
              <ChevronDownIcon className="w-4 h-4" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
