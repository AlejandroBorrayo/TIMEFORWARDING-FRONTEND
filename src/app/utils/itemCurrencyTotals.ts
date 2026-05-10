/**
 * Totales de línea (importe × cantidad, con IVA de la fila) por moneda,
 * usando `amount` en la moneda de la línea y equivalentes `usd_amount` / `eur_amount`.
 */
export type ItemLikeForCurrencyTotals = {
  quantity?: number;
  amount?: number;
  currency?: string;
  usd_amount?: number;
  eur_amount?: number;
  tax?: { amount?: number; name?: string };
};

function normCcy(c: unknown): string {
  if (typeof c !== "string") return "";
  return c.trim().toUpperCase();
}

export function buildItemCurrencyTotalsPayload(
  item: ItemLikeForCurrencyTotals,
): {
  total_mxn?: number;
  total_usd?: number;
  total_eur?: number;
} {
  const q = Number(item.quantity) || 0;
  const taxp = Number(item?.tax?.amount || 0) / 100;
  const mult = 1 + taxp;
  const ccy = normCcy(item.currency);
  const amt = Number(item.amount) || 0;
  const usdStore = Number(item.usd_amount ?? 0);
  const eurStore = Number(item.eur_amount ?? 0);

  const out: {
    total_mxn?: number;
    total_usd?: number;
    total_eur?: number;
  } = {};

  if (ccy === "MXN") {
    out.total_mxn = q * amt * mult;
  }
  if (ccy === "USD") {
    out.total_usd = q * amt * mult;
  } else if (usdStore > 0) {
    out.total_usd = q * usdStore * mult;
  }
  if (ccy === "EUR") {
    out.total_eur = q * amt * mult;
  } else if (eurStore > 0) {
    out.total_eur = q * eurStore * mult;
  }

  return out;
}
