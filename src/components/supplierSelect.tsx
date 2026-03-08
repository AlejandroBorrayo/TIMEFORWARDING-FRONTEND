"use client";

import * as Select from "@radix-ui/react-select";
import {
  ChevronDownIcon,
  CheckIcon,
  Loader2,
  PlusIcon,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { FindAll as FindSupplier } from "@/services/supplier";
import { CustomerInterface } from "@/type/customer.interface";
import { SupplierCollectionInterface } from "@/type/supplier.interface";
import { SupplierInterface } from "@/type/folio.interface";

export default function SupplierSelect({
  value,
  onChange,
  error,
  setOpenNewSupplier,
  refreshSupplier,
  setRefreshSupplier,
  mode,
}: {
  value?: SupplierInterface;
  onChange: (val: string) => void;
  error?: boolean;
  setOpenNewSupplier: (open: boolean) => void;
  refreshSupplier: boolean;
  setRefreshSupplier: (refresh: boolean) => void;
  mode: string;
}) {
  if (mode === "preview") {
    return <span className={"font-semibold text-center"}>{value?.name || "—"}</span>;
  }
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<SupplierCollectionInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(
    async (newSearch: string, newPage = 1, append = false) => {
      try {
        setLoading(true);
        const result = await FindSupplier(
          { page: newPage, perpage: 20 },
          newSearch
        );
        const items = result?.records || [];
        setData((prev) => (append ? [...prev, ...items] : items));
        setHasMore(items.length === 20);
      } catch (err) {
        console.error("Error cargando clientes:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (refreshSupplier) {
      setRefreshSupplier(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setPage(1);
        fetchData(searchTerm);
      }, 500);
    }
  }, [searchTerm, fetchData, refreshSupplier]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(searchTerm, nextPage, true);
    }
  };

  useEffect(() => {
    fetchData("");
  }, [fetchData]);

  return (
    <div>
<Select.Root
  value={value?._id}
  onValueChange={onChange}
  open={open}
  onOpenChange={setOpen}
>
  <Select.Trigger
    className={`text-center
      px-3 py-2 text-sm border border-gray-300 rounded-md
      focus:outline-none focus:ring-1 focus:ring-[#02101d]
      focus:border-[#02101d]
      flex justify-between items-center bg-white text-gray-700
      w-full
      ${error ? "border-red-500" : ""}
    `}
  >
    <Select.Value placeholder="Proveedor">
      <span className="truncate flex-1 text-center">
        {data.find((item) => item._id === value?._id)?.name ||
          "Proveedor"}
      </span>
    </Select.Value>

    <Select.Icon className="ml-2">
      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
    </Select.Icon>
  </Select.Trigger>

  <Select.Portal>
    <Select.Content
      position="popper"
      className="
        overflow-hidden bg-white rounded-lg shadow-lg z-50
        border border-gray-200
        min-w-[var(--radix-select-trigger-width)]
        max-w-[95vw]
      "
    >
      {/* Buscador */}
      <div className="p-2 border-b border-gray-200 bg-white sticky top-0 z-10">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          className="
            w-full px-2 py-1 text-sm
            border border-gray-300 rounded-md
            focus:outline-none focus:ring-0
          "
        />
      </div>

      <Select.Viewport className="p-1 max-h-[280px] overflow-y-auto">
        {data.length > 0 ? (
          data.map((item) => (
            <Select.Item
              key={item._id}
              value={item._id}
              className="
                relative flex items-start px-8 py-2 text-sm rounded-md
                cursor-pointer select-none
                hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
              "
            >
              <Select.ItemText className="whitespace-normal break-words">
                {item.name}
              </Select.ItemText>

              <Select.ItemIndicator className="absolute left-2">
                <CheckIcon className="w-3 h-3 text-gray-500" />
              </Select.ItemIndicator>
            </Select.Item>
          ))
        ) : (
          !loading && (
            <div className="px-4 py-2 text-sm text-gray-400">
              Sin resultados
            </div>
          )
        )}

        {loading && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          </div>
        )}
      </Select.Viewport>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200">
        <div
          onClick={() => {
            setOpen(false);
            setOpenNewSupplier(true);
          }}
          className="
            flex items-center gap-2 px-4 py-2 text-sm font-medium
            cursor-pointer select-none
            hover:bg-gray-100
          "
        >
          <PlusIcon className="w-4 h-4" />
          <span>Agregar proveedor</span>
        </div>
      </div>
    </Select.Content>
  </Select.Portal>
</Select.Root>

    </div>
  );
}
