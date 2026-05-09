"use client";

import * as Select from "@radix-ui/react-select";
import {
  ChevronDownIcon,
  CheckIcon,
  Loader2,
  PlusIcon,
} from "lucide-react";
import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  memo,
} from "react";
import { FindAll as FindSupplier } from "@/services/supplier";
import { SupplierCollectionInterface } from "@/type/supplier.interface";
import { SupplierInterface } from "@/type/folio.interface";

type SupplierSelectProps = {
  value?: SupplierInterface;
  onChange: (val: string) => void;
  error?: boolean;
  setOpenNewSupplier: (open: boolean) => void;
  onBeforeOpenNewSupplier?: () => void;
  refreshSupplier: boolean;
  setRefreshSupplier: (refresh: boolean) => void;
  mode: string;
};

function isValidSupplierId(id: unknown): id is string {
  return typeof id === "string" && id.trim() !== "";
}

/** Evita re-render del Select al cambiar monto/cantidad/FX de la fila (Radix + updates rápidos = bucles). */
function supplierSelectPropsEqual(
  a: SupplierSelectProps,
  b: SupplierSelectProps,
): boolean {
  return (
    a.mode === b.mode &&
    a.error === b.error &&
    a.refreshSupplier === b.refreshSupplier &&
    a.value?._id === b.value?._id &&
    a.value?.name === b.value?.name
  );
}

function SupplierSelectField({
  value,
  onChange,
  error,
  setOpenNewSupplier,
  onBeforeOpenNewSupplier,
  refreshSupplier,
  setRefreshSupplier,
}: SupplierSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const searchTermRef = useRef(searchTerm);
  searchTermRef.current = searchTerm;

  const [data, setData] = useState<SupplierCollectionInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const selectedValueRef = useRef<string | undefined>(undefined);
  const handleValueChange = useCallback((v: string) => {
    if (v === selectedValueRef.current) return;
    onChangeRef.current(v);
  }, []);

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

  /** Solo al pedir refresco explícito (no en cada tecla del buscador). */
  useEffect(() => {
    if (!refreshSupplier) return;
    setRefreshSupplier(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setPage(1);
      fetchData(searchTermRef.current);
    }, 500);
  }, [refreshSupplier, setRefreshSupplier, fetchData]);

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

  const skipSearchDebounceOnce = useRef(true);
  useEffect(() => {
    if (skipSearchDebounceOnce.current) {
      skipSearchDebounceOnce.current = false;
      return;
    }
    const t = setTimeout(() => {
      setPage(1);
      fetchData(searchTerm);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, fetchData]);

  const selectable = useMemo(
    () => data.filter((item) => isValidSupplierId(item._id)),
    [data],
  );

  /** Incluye el proveedor seleccionado si no está en la página cargada (Radix necesita el ítem para el valor controlado). */
  const itemsForSelect = useMemo(() => {
    const id = value?._id;
    if (!isValidSupplierId(id)) return selectable;
    if (selectable.some((s) => s._id === id)) return selectable;
    const label =
      value?.name && String(value.name).trim() !== ""
        ? value.name
        : "Proveedor";
    return [
      { _id: id, name: label } as SupplierCollectionInterface,
      ...selectable,
    ];
  }, [selectable, value?._id, value?.name]);

  const selectedValue = isValidSupplierId(value?._id)
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
          className={`text-center
      px-3 py-2 text-sm border border-gray-300 rounded-md
      focus:outline-none focus:ring-1 focus:ring-brand
      focus:border-brand
      flex justify-between items-center bg-white text-gray-700
      w-full
      ${error ? "border-red-500" : ""}
    `}
        >
          {/* Sin hijos personalizados: evita ciclos de layout/context en Radix al re-renderizar. */}
          <Select.Value placeholder="Proveedor" />

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

            <Select.Viewport
              className="p-1 max-h-[280px] overflow-y-auto"
              onScroll={handleScroll}
            >
              {itemsForSelect.length > 0 ? (
                itemsForSelect.map((item) => (
                  <Select.Item
                    key={item._id}
                    value={item._id as string}
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

            <div className="sticky bottom-0 bg-white border-t border-gray-200">
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onBeforeOpenNewSupplier?.();
                    setOpenNewSupplier(true);
                  }
                }}
                onClick={() => {
                  onBeforeOpenNewSupplier?.();
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

const SupplierSelectFieldMemo = memo(
  SupplierSelectField,
  supplierSelectPropsEqual,
);

export default function SupplierSelect(props: SupplierSelectProps) {
  if (props.mode === "preview") {
    return (
      <span className={"font-semibold text-center"}>
        {props.value?.name || "—"}
      </span>
    );
  }
  return <SupplierSelectFieldMemo {...props} />;
}
