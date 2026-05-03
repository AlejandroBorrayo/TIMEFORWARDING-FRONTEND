/**
 * Moneda del documento (cotización / costo de servicio) según las líneas.
 * Prioridad: USD si hay alguna línea en USD; si todas son MXN → MXN;
 * si hay alguna línea en EUR (sin USD) → EUR (subtotales en EUR al unificar);
 * en otro caso `fallback`.
 */
export function resolveDocumentCurrencyFromItems(
  items: { currency?: string }[],
  fallback: string,
): string {
  const hasItems = (items?.length ?? 0) > 0;
  if (!hasItems) return fallback;

  const hasUSD = items.some((item) => item?.currency === "USD");
  if (hasUSD) return "USD";

  const allMXN = items.every((item) => item?.currency === "MXN");
  if (allMXN) return "MXN";

  const hasEUR = items.some((item) => item?.currency === "EUR");
  if (hasEUR) return "EUR";

  return fallback;
}
