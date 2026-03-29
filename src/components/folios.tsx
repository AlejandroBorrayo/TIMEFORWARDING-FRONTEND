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
import { FindAll as FindServiceCost } from "@/services/folio";
import { FolioCollectionInterface } from "@/type/folio.interface";

interface Quote {
  _id: string;
  folio: string;
}

const NEW_FOLIO_VALUE = "TIME12345";

export default function FolioSelect({
  value,
  onChange,
  error,
  mode,
  isNewFolio,
}: {
  value?: FolioCollectionInterface;
  onChange: (val: string) => void;
  error?: boolean;
  mode: string;
  isNewFolio: boolean;
}) {
  /* ================= PREVIEW MODE ================= */
  if (mode === "preview") {
    if (value?.folio) {
      return <span className="font-semibold">{value?.folio || "—"}</span>;
    }
    return <span className="font-semibold">{NEW_FOLIO_VALUE || "—"}</span>;
  }

  /* ================= STATE ================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= FETCH ================= */
  const fetchData = useCallback(
    async (newSearch: string, newPage = 1, append = false) => {
      try {
        setLoading(true);
        const result = await FindServiceCost(
          { page: newPage, perpage: 20 },
          newSearch
        );

        const items: Quote[] =
          result?.records?.map((item: any) => ({
            _id: item._id,
            folio: item.folio,
          })) || [];

        setData((prev) => (append ? [...prev, ...items] : items));
        setHasMore(items.length === 20);
      } catch (err) {
        console.error("Error cargando folios:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ================= SEARCH DEBOUNCE ================= */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchData(searchTerm);
    }, 500);
  }, [searchTerm, fetchData]);

  /* ================= INFINITE SCROLL ================= */
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

  /* ================= RENDER ================= */
  return (
    <Select.Root
      value={isNewFolio ? NEW_FOLIO_VALUE : value?._id}
      open={open}
      onOpenChange={setOpen}
      onValueChange={(val) => {
        if (val === NEW_FOLIO_VALUE) {
          setOpen(false);
        }

        onChange(val);
      }}
    >
      {/* ============ TRIGGER ============ */}
      <Select.Trigger
        className={`w-full px-4 py-2 border rounded-xl flex justify-between items-center bg-white
            ${error ? "border-red-500" : "border-gray-300"}
            focus:outline-none focus:ring-1 focus:ring-brand`}
      >
        <Select.Value placeholder="Selecciona un folio">
          <span className="truncate flex-1 text-left">
            {isNewFolio
              ? NEW_FOLIO_VALUE
              : value?.folio || "Selecciona un folio"}
          </span>
        </Select.Value>
        <Select.Icon>
          <ChevronDownIcon className="w-4 h-4 text-gray-600" />
        </Select.Icon>
      </Select.Trigger>

      {/* ============ CONTENT ============ */}
      <Select.Portal>
        <Select.Content
          position="popper"
          className="
              bg-white rounded-xl shadow-lg z-50
              border border-gray-200
              w-[420px] min-w-[var(--radix-select-trigger-width)] max-w-[95vw]
              overflow-hidden
            "
        >
          <Select.ScrollUpButton className="flex justify-center py-1">
            <ChevronUpIcon className="w-4 h-4 text-gray-500" />
          </Select.ScrollUpButton>

          {/* ===== SEARCH ===== */}
          <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
            <input
              type="text"
              placeholder="Buscar folio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none"
            />
          </div>

          {/* ===== LIST ===== */}
          <div
            className="max-h-[280px] overflow-y-auto"
            onScroll={handleScroll}
          >
            <Select.Viewport className="p-1">
              {data.length > 0 ? (
                data.map((item) => (
                  <Select.Item
                    key={item._id}
                    value={item._id}
                    className="
                        relative flex items-center px-8 py-2 text-sm
                        rounded-md cursor-pointer select-none
                        hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                      "
                  >
                    <Select.ItemText>{item.folio}</Select.ItemText>
                    <Select.ItemIndicator className="absolute left-2">
                      <CheckIcon className="w-3 h-3 text-gray-500" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))
              ) : !loading ? (
                <div className="px-4 py-2 text-sm text-gray-400">
                  Sin resultados
                </div>
              ) : null}

              {loading && (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                </div>
              )}
            </Select.Viewport>
          </div>

          {/* ===== STICKY NUEVO FOLIO ===== */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 z-20">
            <Select.Item
              value={NEW_FOLIO_VALUE}
              className="
                  flex items-center gap-2 px-4 py-3
                  text-sm font-semibold text-brand
                  cursor-pointer select-none
                  hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                "
            >
              <PlusIcon className="w-4 h-4" />
              <Select.ItemText>Nuevo folio</Select.ItemText>
            </Select.Item>
          </div>


          

          <Select.ScrollDownButton className="flex justify-center py-1">
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
