"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, CheckIcon } from "lucide-react";
import { useCallback, useRef, memo } from "react";
import { ItemInterface } from "@/type/folio.interface";

const CURRENCY_CODES = ["MXN", "USD", "EUR"] as const;

function normalizeLineCurrency(c: unknown): string | undefined {
  if (c === null || c === undefined) return undefined;
  const u = String(c).trim().toUpperCase();
  if (u === "") return undefined;
  return (CURRENCY_CODES as readonly string[]).includes(u) ? u : undefined;
}

type CurrencySelectProps = {
  handleChangeCurrency: (val: string, index: number) => void;
  mode: string;
  it: ItemInterface;
  index: number;
};

const previewLabel: Record<string, string> = {
  MXN: "🇲🇽 MXN",
  USD: "🇺🇸 USD",
  EUR: "🇪🇺 EUR",
};

/** Evita re-render del Select cuando solo cambian monto/cantidad/FX (Radix + updates rápidos → max depth). */
function currencySelectPropsEqual(
  a: CurrencySelectProps,
  b: CurrencySelectProps,
): boolean {
  return (
    a.mode === b.mode &&
    a.index === b.index &&
    normalizeLineCurrency(a.it.currency) ===
      normalizeLineCurrency(b.it.currency)
  );
}

function CurrencySelectField({
  handleChangeCurrency,
  it,
  index,
}: CurrencySelectProps) {
  const handlerRef = useRef(handleChangeCurrency);
  handlerRef.current = handleChangeCurrency;

  const selectedRef = useRef<string | undefined>(undefined);
  const selectedValue = normalizeLineCurrency(it.currency);
  selectedRef.current = selectedValue;

  const onValueChange = useCallback(
    (v: string) => {
      if (v === selectedRef.current) return;
      handlerRef.current(v, index);
    },
    [index],
  );

  return (
    <div className="flex justify-center">
      <Select.Root
        key={`${index}-${selectedValue ?? "unset"}`}
        value={selectedValue}
        onValueChange={onValueChange}
      >
        <Select.Trigger
          className="
px-3 py-2 text-sm border border-gray-300 rounded-md
focus:outline-none focus:ring-1 focus:ring-brand
focus:border-brand
flex justify-between items-center bg-white text-gray-700
min-w-[100px]
"
        >
          <Select.Value placeholder="Moneda" />
          <Select.Icon>
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
"
          >
            <Select.Viewport className="p-1">
              <Select.Item
                value="MXN"
                className="
relative flex items-center gap-2 px-8 py-2 text-sm rounded-md
cursor-pointer select-none
hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
"
              >
                <Select.ItemText>🇲🇽 MXN</Select.ItemText>
                <Select.ItemIndicator className="absolute left-2">
                  <CheckIcon className="w-3 h-3 text-gray-500" />
                </Select.ItemIndicator>
              </Select.Item>

              <Select.Item
                value="USD"
                className="
relative flex items-center gap-2 px-8 py-2 text-sm rounded-md
cursor-pointer select-none
hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
"
              >
                <Select.ItemText>🇺🇸 USD</Select.ItemText>
                <Select.ItemIndicator className="absolute left-2">
                  <CheckIcon className="w-3 h-3 text-gray-500" />
                </Select.ItemIndicator>
              </Select.Item>

              <Select.Item
                value="EUR"
                className="
relative flex items-center gap-2 px-8 py-2 text-sm rounded-md
cursor-pointer select-none
hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
"
              >
                <Select.ItemText>🇪🇺 EUR</Select.ItemText>
                <Select.ItemIndicator className="absolute left-2">
                  <CheckIcon className="w-3 h-3 text-gray-500" />
                </Select.ItemIndicator>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

const CurrencySelectFieldMemo = memo(
  CurrencySelectField,
  currencySelectPropsEqual,
);

export default function CurrencySelect(props: CurrencySelectProps) {
  if (props.mode === "preview") {
    const code = normalizeLineCurrency(props.it?.currency);
    const label =
      (code && previewLabel[code]) ??
      (typeof props.it?.currency === "string"
        ? props.it.currency
        : undefined) ??
      "—";
    return <p className="font-semibold">{label}</p>;
  }

  return <CurrencySelectFieldMemo {...props} />;
}
