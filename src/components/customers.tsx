"use client";

import * as Select from "@radix-ui/react-select";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  Loader2,
  PlusIcon,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef, useMemo, memo } from "react";
import { FindAll as FindCustomers } from "@/services/customer";
import { CustomerInterface } from "@/type/customer.interface";

interface Props {
  value?: CustomerInterface;
  onChange: (val: string) => void;
  error?: boolean;
  setOpenNewCustomer: (open: boolean) => void;
  refreshCustomers: boolean;
  setRefreshCustomers: (refresh: boolean) => void;
  mode: string;
}

function isValidCustomerId(id: unknown): id is string {
  return typeof id === "string" && id.trim() !== "";
}

/** Evita re-render del Select cuando solo cambian callbacks (onChange es capturado en ref)
 *  o props no relacionados con la selección (Radix + updates rápidos → max depth). */
function customerSelectPropsEqual(a: Props, b: Props): boolean {
  return (
    a.mode === b.mode &&
    a.error === b.error &&
    a.refreshCustomers === b.refreshCustomers &&
    a.value?._id === b.value?._id &&
    a.value?.company === b.value?.company
  );
}

const CustomerSelectFieldMemo = memo(CustomerSelectField, customerSelectPropsEqual);

export default function CustomerSelect(props: Props) {
  if (props.mode === "preview") {
    return (
      <span className="font-semibold">{props.value?.company || "—"}</span>
    );
  }
  return <CustomerSelectFieldMemo {...props} />;
}

function CustomerSelectField({
  value,
  onChange,
  error,
  setOpenNewCustomer,
  refreshCustomers,
  setRefreshCustomers,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const searchTermRef = useRef(searchTerm);
  searchTermRef.current = searchTerm;

  const [data, setData] = useState<CustomerInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const refreshDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const selectedValueRef = useRef<string | undefined>(undefined);
  const handleValueChange = useCallback((v: string) => {
    if (v === selectedValueRef.current) return;
    onChangeRef.current(v);
  }, []);

  const fetchData = useCallback(
    async (search: string, pageNumber = 1, append = false) => {
      try {
        setLoading(true);

        const result = await FindCustomers(
          { page: pageNumber, perpage: 20 },
          search
        );

        const items = result?.records || [];

        setData((prev) => (append ? [...prev, ...items] : items));
        setHasMore(items.length === 20);
      } catch (error) {
        console.error("Error cargando clientes:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const skipSearchDebounceOnce = useRef(true);
  useEffect(() => {
    if (skipSearchDebounceOnce.current) {
      skipSearchDebounceOnce.current = false;
      return;
    }
    const t = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      fetchData(searchTerm, 1, false);
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm, fetchData]);

  useEffect(() => {
    if (!refreshCustomers) return;
    setRefreshCustomers(false);
    if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current);
    refreshDebounceRef.current = setTimeout(() => {
      refreshDebounceRef.current = null;
      setPage(1);
      setHasMore(true);
      fetchData(searchTermRef.current, 1, false);
    }, 500);
  }, [refreshCustomers, setRefreshCustomers, fetchData]);

  useEffect(() => {
    fetchData("", 1, false);
  }, [fetchData]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (
      scrollTop + clientHeight >= scrollHeight - 10 &&
      !loading &&
      hasMore
    ) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(searchTerm, nextPage, true);
    }
  };

  const selectable = useMemo(
    () => data.filter((item) => isValidCustomerId(item._id)),
    [data],
  );

  const itemsForSelect = useMemo(() => {
    const id = value?._id;
    if (!isValidCustomerId(id)) return selectable;
    if (selectable.some((c) => c._id === id)) return selectable;
    const company =
      value?.company && String(value.company).trim() !== ""
        ? value.company
        : "—";
    return [{ ...value, _id: id, company } as CustomerInterface, ...selectable];
  }, [selectable, value]);

  /** Debe coincidir con `Select.Item` (`_id`), no con `company` (evita bucles en Radix). */
  const selectedValue = isValidCustomerId(value?._id)
    ? String(value._id).trim()
    : undefined;
  selectedValueRef.current = selectedValue;

  return (
    <div>
      <Select.Root
        value={selectedValue}
        onValueChange={handleValueChange}
      >
        <Select.Trigger
          className={`px-4 py-2 border border-gray-300 rounded-xl flex justify-between items-center bg-white
            ${error ? "border-red-500" : ""}
            focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand`}
        >
          <Select.Value placeholder="Selecciona una empresa" />
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
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-0 text-sm"
              />
            </div>

            <div className="relative max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <Select.Viewport onScroll={handleScroll} className="p-1">
                {itemsForSelect.length > 0
                  ? itemsForSelect.map((item) => (
                      <Select.Item
                        key={item._id}
                        value={item._id}
                        className="relative flex items-start px-8 py-2 text-sm rounded-md cursor-pointer select-none 
                        hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        <Select.ItemText>
                          <span className="block whitespace-normal break-words text-left">
                            {item.company}
                          </span>
                        </Select.ItemText>
                        <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                          <CheckIcon className="w-3 h-3 text-gray-500" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))
                  : !loading && (
                      <div className="px-4 py-2 text-gray-400 text-sm">
                        Sin resultados
                      </div>
                    )}

                {loading && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="animate-spin text-gray-500 w-4 h-4" />
                  </div>
                )}
              </Select.Viewport>

              <div className="sticky bottom-0 bg-white border-t border-gray-200">
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenNewCustomer(true);
                    }
                  }}
                  onClick={() => {
                    setOpenNewCustomer(true);
                  }}
                  className="flex items-center gap-2 px-4 hover:bg-gray-100 focus:bg-gray-100 py-2 text-sm font-medium cursor-pointer select-none"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Agregar empresa</span>
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
