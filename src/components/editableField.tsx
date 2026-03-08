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
  if (mode === "preview") {
    return <span className={className}>{value || ""}</span>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;

    if (kind === "number") {
      // permite borrar
      if (v === "") {
        onChange?.(0);
        return;
      }

      const n = Number(v);
      if (!Number.isNaN(n)) {
        onChange?.(n);
      }
      return;
    }

    onChange?.(v);
  };

  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
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
