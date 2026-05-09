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
import { FindAll as FindTax, Create as CreateTax } from "@/services/tax";
import { taxCollectionInterface } from "@/type/tax.interface";
import TaxModal from "./taxModal";

interface Props {
  value?: taxCollectionInterface;
  /** `selected` es el registro del listado del propio select (útil si el padre aún no cargó el catálogo). */
  onChange: (val: string, selected?: taxCollectionInterface) => void;
  error?: boolean;
  mode: string;
  setRefreshTax: (val: boolean) => void;
  onBeforeOpenNewTax?: () => void;
  onTaxCreated?: (tax: taxCollectionInterface) => void;
  onTaxModalDismiss?: () => void;
}

function isValidTaxItemId(id: unknown): id is string {
  return typeof id === "string" && id.trim() !== "";
}

/** Valor del Radix Select: debe coincidir con un `Select.Item` (`no-tax` o `_id`). */
function selectRootValue(value?: taxCollectionInterface): string | undefined {
  if (!value) return undefined;
  if (value.name === "sin impuesto") return "no-tax";
  if (isValidTaxItemId(value._id)) return String(value._id).trim();
  return undefined;
}

function taxSelectPropsEqual(a: Props, b: Props): boolean {
  return (
    a.mode === b.mode &&
    a.error === b.error &&
    a.value?._id === b.value?._id &&
    a.value?.name === b.value?.name &&
    Number(a.value?.amount ?? 0) === Number(b.value?.amount ?? 0)
  );
}

export default function TaxSelect(props: Props) {
  if (props.mode === "preview") {
    return (
      <span className="font-semibold">
        {props.value?.name
          ? `${props.value.name} (${props.value.amount}%)`
          : "Sin impuesto"}
      </span>
    );
  }
  return <TaxSelectFieldMemo {...props} />;
}

function TaxSelectField({
  value,
  onChange,
  error,
  setRefreshTax,
  onBeforeOpenNewTax,
  onTaxCreated,
  onTaxModalDismiss,
}: Props) {
  const [openNewNote, setOpenNewNote] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchTermRef = useRef(searchTerm);
  searchTermRef.current = searchTerm;

  const [data, setData] = useState<taxCollectionInterface[]>([]);
  const dataRef = useRef<taxCollectionInterface[]>([]);
  dataRef.current = data;
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const selectedRef = useRef<string | undefined>(undefined);

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
            if (isValidTaxItemId(item._id)) {
              map.set(String(item._id).trim(), item);
            }
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

  useEffect(() => {
    fetchData("", 1, false);
  }, [fetchData]);

  const skipSearchDebounceOnce = useRef(true);
  useEffect(() => {
    if (skipSearchDebounceOnce.current) {
      skipSearchDebounceOnce.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setPage(1);
      setHasMore(true);
      fetchData(searchTermRef.current, 1, false);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, fetchData]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(searchTerm, nextPage, true);
    }
  };

  const selectable = useMemo(
    () => data.filter((item) => isValidTaxItemId(item._id)),
    [data],
  );

  const itemsForSelect = useMemo(() => {
    const root = selectRootValue(value);
    if (!root || root === "no-tax") return selectable;
    if (selectable.some((t) => String(t._id).trim() === root)) return selectable;
    if (value && isValidTaxItemId(value._id)) {
      return [
        {
          _id: String(value._id).trim(),
          name: value.name,
          amount: value.amount,
        } as taxCollectionInterface,
        ...selectable,
      ];
    }
    return selectable;
  }, [selectable, value]);

  const selectedValue = selectRootValue(value);
  selectedRef.current = selectedValue;

  const handleValueChange = useCallback((v: string) => {
    if (v === selectedRef.current) return;
    let selectedRow: taxCollectionInterface | undefined;
    if (v !== "no-tax") {
      selectedRow = dataRef.current.find(
        (t) =>
          isValidTaxItemId(t._id) && String(t._id).trim() === String(v).trim(),
      );
    }
    onChangeRef.current(v, selectedRow);
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Select.Root value={selectedValue} onValueChange={handleValueChange}>
        <Select.Trigger
          className={`px-4 py-2 border border-gray-300 rounded-xl flex justify-between items-center bg-white
            ${error ? "border-red-500" : ""}
            focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand cursor-pointer`}
        >
          <Select.Value placeholder="Impuesto" />
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

                {itemsForSelect.length > 0
                  ? itemsForSelect.map((item) => (
                      <Select.Item
                        key={item._id}
                        value={String(item._id).trim()}
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

              <div className="sticky bottom-0 bg-white border-t border-gray-200">
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onBeforeOpenNewTax?.();
                      setOpenNewNote(true);
                    }
                  }}
                  onClick={() => {
                    onBeforeOpenNewTax?.();
                    setOpenNewNote(true);
                  }}
                  className="flex items-center gap-2 px-4 hover:bg-gray-100 focus:bg-gray-100 py-2 text-sm font-medium cursor-pointer select-none"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Agregar impuesto</span>
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
          onTaxModalDismiss?.();
        }}
        onSubmit={async (data) => {
          const created = await CreateTax(data);
          setPage(1);
          setHasMore(true);
          await fetchData(searchTerm, 1, false);
          setRefreshTax(true);
          onTaxCreated?.(created);
        }}
      />
    </div>
  );
}

const TaxSelectFieldMemo = memo(TaxSelectField, taxSelectPropsEqual);
