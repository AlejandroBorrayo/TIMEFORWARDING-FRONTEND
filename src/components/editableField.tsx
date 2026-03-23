"use client";

import { useState } from "react";

type EditableFieldProps = {
  value: any;
  onChange?: (value: any) => void;
  mode: "edit" | "preview";
  className?: string;
  placeholder?: string;
  kind?: "text" | "number";
};

export default function EditableField({
  value,
  onChange,
  mode,
  className = "",
  placeholder = "",
  kind = "text",
}: EditableFieldProps) {
  const [numberDraft, setNumberDraft] = useState<string | null>(null);

  if (mode === "preview") {
    return <span className={className}>{value ?? ""}</span>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;

    if (kind === "number") {
      if (v === "") {
        setNumberDraft("");
        onChange?.(0);
        return;
      }
      if (!/^\d*\.?\d*$/.test(v)) {
        return;
      }
      setNumberDraft(v);
      if (v.endsWith(".")) {
        return;
      }
      const n = parseFloat(v);
      if (!Number.isNaN(n)) {
        onChange?.(n);
      }
      return;
    }

    onChange?.(v);
  };

  const handleNumberFocus = () => {
    if (kind !== "number") return;
    const s =
      value === "" || value === undefined || value === null
        ? ""
        : String(value);
    setNumberDraft(s);
  };

  const handleNumberBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (kind !== "number") return;
    const raw = e.currentTarget.value;
    setNumberDraft(null);
    if (raw === "" || raw === ".") {
      const prev =
        value === "" || value === undefined || value === null
          ? null
          : Number(value);
      if (prev === null || prev !== 0) {
        onChange?.(0);
      }
      return;
    }
    const n = parseFloat(raw);
    if (Number.isNaN(n)) return;
    const prevNum =
      value === "" || value === undefined || value === null
        ? null
        : Number(value);
    if (prevNum === null || !Object.is(n, prevNum)) {
      onChange?.(n);
    }
  };

  const inputValue =
    kind === "number"
      ? numberDraft !== null
        ? numberDraft
        : value === "" || value === undefined || value === null
          ? ""
          : String(value)
      : value;

  return (
    <input
      type="text"
      value={inputValue}
      placeholder={placeholder}
      onChange={handleChange}
      onFocus={handleNumberFocus}
      onBlur={handleNumberBlur}
      className={`
    bg-transparent
    border-b border-gray-300
    outline-none
    ring-0
    shadow-none
    focus:outline-none
    focus:ring-0
    focus:shadow-none
    focus:border-gray-300
    appearance-none
    ${className}
  `}
    />
  );
}
