"use client";

import * as Select from "@radix-ui/react-select";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  Loader2,
  PlusIcon,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef, memo } from "react";
import { CustomerInterface, ContactInterface } from "@/type/customer.interface";

interface Props {
  customer?: CustomerInterface;
  value?: ContactInterface;
  onChange: (val: string) => void;
  error?: boolean;
  setOpenNewContact: (open: boolean) => void;
  refreshCustomers: boolean;
  setRefreshCustomers: (refresh: boolean) => void;
  mode: string;
}

/** Solo re-renderiza cuando cambia el cliente, el contacto seleccionado, el modo o el flag de refresh.
 *  Evita bucles infinitos cuando los efectos FX actualizan importes rápidamente (Radix + updates rápidos → max depth). */
function contactSelectPropsEqual(a: Props, b: Props): boolean {
  return (
    a.mode === b.mode &&
    a.error === b.error &&
    a.refreshCustomers === b.refreshCustomers &&
    a.customer?._id === b.customer?._id &&
    a.value?.email === b.value?.email
  );
}

function ContactSelectField({
  customer,
  value,
  onChange,
  error,
  setOpenNewContact,
  refreshCustomers,
  setRefreshCustomers,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const searchTermRef = useRef(searchTerm);
  searchTermRef.current = searchTerm;

  const [data, setData] = useState<ContactInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /** Mantiene siempre la referencia al customer más reciente sin recrear fetchData. */
  const customerRef = useRef(customer);
  customerRef.current = customer;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const selectedRef = useRef<string | undefined>(undefined);
  const selectedValue = value?.email;
  selectedRef.current = selectedValue;

  /** handleValueChange con guard para evitar llamadas redundantes a onChange. */
  const handleValueChange = useCallback((v: string) => {
    if (v === selectedRef.current) return;
    onChangeRef.current(v);
  }, []);

  /**
   * fetchData depende de `customer?._id` (primitivo estable) y accede a los
   * contactos via ref para evitar recrarse cuando solo cambia la referencia
   * del objeto customer sin cambiar el cliente seleccionado.
   */
  const fetchData = useCallback(
    (term = "") => {
      const c = customerRef.current;
      if (!c) {
        setData([]);
        return;
      }
      setLoading(true);
      const contacts = c.contacts ?? [];
      const lower = term.toLowerCase();
      const filtered = lower
        ? contacts.filter(
            (ct) =>
              ct.name.toLowerCase().includes(lower) ||
              ct.email.toLowerCase().includes(lower),
          )
        : contacts;
      setData(filtered);
      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customer?._id],
  );

  /** Recarga la lista cuando cambia el cliente seleccionado. */
  useEffect(() => {
    setSearchTerm("");
    fetchData("");
  }, [fetchData]);

  /** Recarga la lista cuando se crea un nuevo contacto (refreshCustomers → true). */
  useEffect(() => {
    if (!refreshCustomers) return;
    setRefreshCustomers(false);
    setSearchTerm("");
    fetchData("");
  }, [refreshCustomers, setRefreshCustomers, fetchData]);

  /** Búsqueda con debounce. */
  const skipSearchDebounceOnce = useRef(true);
  useEffect(() => {
    if (skipSearchDebounceOnce.current) {
      skipSearchDebounceOnce.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      fetchData(searchTermRef.current);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, fetchData]);

  return (
    <div>
      <Select.Root
        value={selectedValue}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={setOpen}
      >
        <Select.Trigger
          className={`px-4 py-2 border border-gray-300 rounded-xl flex justify-between items-center bg-white
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
                    <div className="px-4 py-2 text-gray-400 text-sm">
                      Sin resultados
                    </div>
                  )
                )}

                {loading && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="animate-spin text-gray-500 w-4 h-4" />
                  </div>
                )}
              </Select.Viewport>

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

const ContactSelectFieldMemo = memo(ContactSelectField, contactSelectPropsEqual);

export default function ContactSelect(props: Props) {
  if (props.mode === "preview") {
    return <span className="font-semibold">{props.value?.email || "—"}</span>;
  }
  return <ContactSelectFieldMemo {...props} />;
}
