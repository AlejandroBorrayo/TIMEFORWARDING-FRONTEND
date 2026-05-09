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
import {
  FindAll as FindNotes,
  Update as UpdateNotes,
  Create as CreateNotes,
} from "@/services/note";

import { NoteCollectionInterface } from "@/type/note.interface";
import ModalNote from "./noteModal";

interface Props {
  value?: NoteCollectionInterface | string;
  onChange: (val: string, index: number) => void;
  error?: boolean;
  mode: string;
  index?: number;
  /** Contenedor (p. ej. `w-full`) para que el trigger use todo el ancho y el elipsis funcione. */
  className?: string;
}

/** Radix Select exige `value` único por ítem; el texto de la nota puede repetirse en el catálogo. */
function noteTextFromValue(
  value: NoteCollectionInterface | string | undefined,
): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value.note ?? "";
}

function resolveSelectRootValue(
  value: NoteCollectionInterface | string | undefined,
  data: NoteCollectionInterface[],
): string | undefined {
  const text = noteTextFromValue(value)?.trim();
  if (!text) return undefined;
  const match = data.find((x) => (x?.note ?? "").trim() === text);
  if (match?._id != null && String(match._id).length > 0) {
    return String(match._id);
  }
  return undefined;
}

/** Evita re-render cuando solo cambian callbacks o props no relacionados con
 *  la selección (Radix + updates rápidos de FX → max depth). */
function notesSelectPropsEqual(a: Props, b: Props): boolean {
  return (
    a.mode === b.mode &&
    a.error === b.error &&
    a.index === b.index &&
    a.className === b.className &&
    noteTextFromValue(a.value) === noteTextFromValue(b.value)
  );
}

function NotesSelectField({
  value,
  onChange,
  error,
  index,
  className,
}: Props) {
  const [openNewNote, setOpenNewNote] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<{
    note: string;
    _id: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const searchTermRef = useRef(searchTerm);
  searchTermRef.current = searchTerm;

  const [data, setData] = useState<NoteCollectionInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [open, setOpen] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /** Refs para acceder a los valores más recientes sin recrear handlers. */
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const dataRef = useRef(data);
  dataRef.current = data;

  const indexRef = useRef(index ?? 0);
  indexRef.current = index ?? 0;

  /* ---------------- FETCH ---------------- */
  const fetchData = useCallback(
    async (search: string, pageNumber = 1, append = false) => {
      try {
        setLoading(true);

        const result = await FindNotes(
          { page: pageNumber, perpage: 20 },
          search,
        );

        const items = result?.records?.map((note) => ({
          _id: note?._id,
          note: note?.note,
        }));

        setData((prev) => {
          if (!append) return items;
          const merged = [...prev, ...items];
          return merged.filter(
            (item, i, array) =>
              array.findIndex(
                (c) => c?._id === item?._id && c?.note === item?.note,
              ) === i,
          );
        });
        setHasMore(items.length === 20);
      } catch (err) {
        console.error("Error cargando notas:", err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /** Carga inicial. */
  useEffect(() => {
    fetchData("", 1, false);
  }, [fetchData]);

  /* ---------------- SEARCH (DEBOUNCE) ---------------- */
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

  /* ---------------- SCROLL PAGINATION ---------------- */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(searchTermRef.current, nextPage, true);
    }
  };

  /* ---------------- VALUE CHANGE (stable, sin recrearse en cada render) ---------------- */
  const handleValueChange = useCallback((selectedId: string) => {
    const fallback = /^__note_fallback_(\d+)__$/.exec(selectedId);
    if (fallback) {
      const row = dataRef.current[Number(fallback[1])];
      onChangeRef.current(row?.note ?? "", indexRef.current);
      return;
    }
    const item = dataRef.current.find(
      (x) => String(x?._id) === String(selectedId),
    );
    onChangeRef.current(item?.note ?? "", indexRef.current);
  }, []);

  /* ---------------- RENDER ---------------- */
  const displayNote = noteTextFromValue(value);
  const rootValue = resolveSelectRootValue(value, data);

  return (
    <div className={className ?? ""}>
      <Select.Root
        value={rootValue}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={setOpen}
      >
        <Select.Trigger
          className={`w-full min-w-0 max-w-full px-4 py-2 border border-gray-300 rounded-xl flex justify-between items-center gap-2 bg-white
            ${error ? "border-red-500" : ""}
            focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand`}
        >
          <Select.Value
            placeholder="Selecciona una nota"
            className="block min-w-0 flex-1 truncate text-left text-sm"
          >
            {displayNote.trim() ? displayNote : "Selecciona una nota"}
          </Select.Value>
          <Select.Icon className="shrink-0">
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
                  ? data.map((item, i) => (
                      <Select.Item
                        key={item?._id || `note-row-${i}`}
                        value={
                          item?._id != null && String(item._id).trim() !== ""
                            ? String(item._id)
                            : `__note_fallback_${i}__`
                        }
                        className="relative flex items-start px-8 py-2 text-sm rounded-md cursor-pointer select-none 
                        hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        <Select.ItemText>
                          <span className="block whitespace-normal break-words text-left">
                            {item?.note}
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
                  onClick={() => {
                    setOpen(false);
                    setOpenNewNote(true);
                  }}
                  className="flex items-center gap-2 px-4 hover:bg-gray-100 focus:bg-gray-100 py-2 text-sm font-medium cursor-pointer select-none"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Agregar nota</span>
                </div>
              </div>
            </div>

            <Select.ScrollDownButton className="flex items-center justify-center text-gray-500 py-1">
              <ChevronDownIcon className="w-4 h-4" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <ModalNote
        visible={openNewNote}
        onClose={() => {
          setOpenNewNote(false);
          setEditingNote(null);
        }}
        initialData={editingNote}
        onSubmit={async (formData) => {
          if (editingNote) {
            await UpdateNotes(editingNote._id, formData?.note);
          } else {
            await CreateNotes(formData?.note);
          }
          fetchData(searchTermRef.current, 1, false);
        }}
      />
    </div>
  );
}

const NotesSelectFieldMemo = memo(NotesSelectField, notesSelectPropsEqual);

export default function NotesSelect(props: Props) {
  if (props.mode === "preview") {
    const t = noteTextFromValue(props.value);
    return <span className="font-semibold">{t.trim() ? t : "—"}</span>;
  }
  return <NotesSelectFieldMemo {...props} />;
}
