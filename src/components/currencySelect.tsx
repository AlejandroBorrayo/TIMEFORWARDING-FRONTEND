"use client";

import * as Select from "@radix-ui/react-select";
import {
  ChevronDownIcon,
  CheckIcon,
} from "lucide-react";
import { ItemInterface } from "@/type/folio.interface";

export default function CurrencySelect({
  handleChangeCurrency,
  mode,
  it,
  index
}: {
  handleChangeCurrency: (val: string, index: number) => void;

  mode: string;
  it:ItemInterface
  index:number

}) {
  if (mode === "preview") {
   return <p className="font-semibold">{it?.currency === "USD" ? "🇺🇸 USD" : "🇲🇽 MXN"}</p>;
  }

  return (
<div className="flex justify-center">

    <Select.Root
      value={it.currency}
      onValueChange={(v) => handleChangeCurrency(v,index)}
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

            {/* USD */}
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
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
</div>
  );
}
