"use client";

import * as Select from "@radix-ui/react-select";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  Loader2,
  PlusIcon,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef, use } from "react";
import { FindAll as FindTax, Create as CreateTax } from "@/services/tax";
import { taxCollectionInterface } from "@/type/tax.interface";
import TaxModal from "./taxModal";

interface Props {
  value?: taxCollectionInterface;
  onChange: (val: string) => void;
  error?: boolean;
  mode: string;
  setRefreshTax: (val: boolean) => void;
}

export default function TaxSelect({
  value,
  onChange,
  error,
  mode,
  setRefreshTax,
}: Props) {
  /* ---------------- PREVIEW MODE ---------------- */
  if (mode === "preview") {
    return (
      <span className="font-semibold">
        {value?.name ? `${value.name} (${value.amount}%)` : "Sin impuesto"}
      </span>
    );
  }

  /* ---------------- STATE ---------------- */
  const [openNewNote, setOpenNewNote] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<taxCollectionInterface[]>([]);
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

        const result = await FindTax(
          {
            page: pageNumber,
            perpage: 10000,
          },
          search
        );

        const items: taxCollectionInterface[] =
          result?.records?.map((tax) => ({
            _id: tax._id,
            name: tax.name,
            amount: tax.amount,
          })) ?? [];

        setHasMore(items.length === 10000);

        setData((prev) => {
          const map = new Map<string, taxCollectionInterface>();

          const source = append ? [...prev, ...items] : items;

          source.forEach((item) => {
            map.set(item._id, item);
          });

          return Array.from(map.values());
        });
      } catch (err) {
        console.error("Error cargando impuestos:", err);
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

  /* ---------------- SCROLL PAGINATION ---------------- */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(searchTerm, nextPage, true);
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Select.Root
        value={value?._id}
        onValueChange={onChange}
        open={open}
        onOpenChange={setOpen}
      >
        <Select.Trigger
          className={`px-4 py-2 border border-gray-300 rounded-xl flex justify-between items-center bg-white
            ${error ? "border-red-500" : ""}
            focus:outline-none focus:ring-1 focus:ring-[#02101d] focus:border-[#02101d] cursor-pointer`}
        >
          <Select.Value placeholder="Impuesto">
            <span className="truncate text-ellipsis overflow-hidden whitespace-nowrap flex-1 text-left">
              {value?.name
                ? `${value?.name} (${value?.amount}%)`
                : "Sin impuesto"}
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
                {/* Opción fija: Sin impuesto */}
                <Select.Item
                  value="no-tax"
                  className="relative flex items-start px-8 py-2 text-sm rounded-md cursor-pointer select-none 
    hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <Select.ItemText>
                    <span className="block whitespace-normal break-words text-left">
                      Sin impuesto
                    </span>
                  </Select.ItemText>
                  <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                    <CheckIcon className="w-3 h-3 text-gray-500" />
                  </Select.ItemIndicator>
                </Select.Item>

                {/* Items dinámicos */}
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
                            {`${item.name} (${item.amount}%)`}
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
                    setOpenNewNote(true);
                  }}
                  className="flex items-center gap-2 px-4 hover:bg-gray-100 focus:bg-gray-100 py-2 text-sm font-medium cursor-pointer select-none"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Agregar tax</span>
                </div>
              </div>
            </div>

            <Select.ScrollDownButton className="flex items-center justify-center text-gray-500 py-1">
              <ChevronDownIcon className="w-4 h-4" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <TaxModal
        visible={openNewNote}
        onClose={() => {
          setOpenNewNote(false);
        }}
        onSubmit={async (data) => {
          await CreateTax(data);
          setPage(1);
          setHasMore(true);
          await fetchData(searchTerm, 1, false);
          setRefreshTax(true);
        }}
      />
    </div>
  );
}
