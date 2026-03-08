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

export default function CustomerSelect({
  value,
  onChange,
  error,
  setOpenNewCustomer,
  refreshCustomers,
  setRefreshCustomers,
  mode,
}: Props) {
  /* ---------------- PREVIEW MODE ---------------- */
  if (mode === "preview") {
    return <span className="font-semibold">{value?.company || "—"}</span>;
  }

  /* ---------------- STATE ---------------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<CustomerInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [open, setOpen] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /* ---------------- FETCH ---------------- */
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

  /* ---------------- SEARCH (DEBOUNCE) ---------------- */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      fetchData(searchTerm, 1, false);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, fetchData]);

  /* ---------------- EXTERNAL REFRESH ---------------- */
  useEffect(() => {
    if (refreshCustomers) {
      setRefreshCustomers(false);
      setPage(1);
      setHasMore(true);
      fetchData(searchTerm, 1, false);
    }
  }, [refreshCustomers, fetchData, searchTerm, setRefreshCustomers]);

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    fetchData("", 1, false);
  }, [fetchData]);

  /* ---------------- SCROLL PAGINATION ---------------- */
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

  /* ---------------- RENDER ---------------- */
  return (
    <div>
      <Select.Root
        value={value?.company}
        onValueChange={onChange}
        open={open}
        onOpenChange={setOpen}
      >
        <Select.Trigger
          className={`px-4 py-2 border border-gray-300 rounded-xl flex justify-between items-center bg-white
            ${error ? "border-red-500" : ""}
            focus:outline-none focus:ring-1 focus:ring-[#02101d] focus:border-[#02101d]`}
        >
          <Select.Value placeholder="Selecciona una empresa">
            <span className="truncate text-ellipsis overflow-hidden whitespace-nowrap flex-1 text-left">
              {data.find((item) => item._id === value?._id)?.company ||
                "Selecciona una empresa"}
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
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-0 text-sm"
              />
            </div>

            <div className="relative max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <Select.Viewport onScroll={handleScroll} className="p-1">
                {data.length > 0
                  ? data.map((item) => (
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

              {/* Sticky Footer: Agregar empresa */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200">
                <div
                  onClick={() => {
                    setOpen(false);
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
