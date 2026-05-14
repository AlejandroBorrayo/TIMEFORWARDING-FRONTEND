/**
 * Totales de línea y de documento por moneda, usando `amount` en la moneda
 * de la línea y equivalentes `usd_amount` / `eur_amount`.
 */

export type ItemLikeForCurrencyTotals = {
  quantity?: number;
  amount?: number;
  currency?: string;
  usd_amount?: number;
  eur_amount?: number;
  tax?: { amount?: number; name?: string };
  total_mxn?: number;
  total_usd?: number;
  total_eur?: number;
};

function normCcy(c: unknown): string {
  if (typeof c !== "string") return "";
  return c.trim().toUpperCase();
}

/**
 * Totales de línea (importe × cantidad, con IVA de la fila) por moneda.
 */
export function buildItemCurrencyTotalsPayload(item: ItemLikeForCurrencyTotals): {
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

  const out: { total_mxn?: number; total_usd?: number; total_eur?: number } = {};

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

/**
 * Calcula subtotal y total del documento en la moneda resuelta (`docCurrency`).
 *
 * Cuando hay mezcla de monedas (ej. MXN + EUR → docCurrency="EUR"), cada ítem
 * aporta su equivalente en la moneda de conversión usando:
 *   1. total_eur / total_usd ya calculados por `buildItemCurrencyTotalsPayload`
 *   2. eur_amount / usd_amount (precio unitario convertido) × quantity
 *   3. amount nativo si la moneda del ítem ya coincide con docCurrency
 *
 * Esto evita que el backend sume importes en monedas distintas (500 MXN + 100 EUR = 600 ❌).
 */
export function resolveDocumentTotalsFromItems(
  items: ItemLikeForCurrencyTotals[],
  docCurrency: string,
): { subtotal: number; total: number } {
  const ccy = normCcy(docCurrency);
  let subtotal = 0;
  let total = 0;

  for (const item of items) {
    const itemCcy = normCcy(item.currency);
    const q = Number(item.quantity) || 0;
    const taxp = Number(item?.tax?.amount || 0) / 100;
    const amt = Number(item.amount) || 0;

    if (ccy === "EUR") {
      if (itemCcy === "EUR") {
        subtotal += q * amt;
        total += q * amt * (1 + taxp);
      } else if ((item.total_eur ?? 0) > 0) {
        total += item.total_eur!;
        subtotal += item.total_eur! / (1 + taxp);
      } else {
        const unitEur = Number(item.eur_amount ?? 0);
        subtotal += q * unitEur;
        total += q * unitEur * (1 + taxp);
      }
    } else if (ccy === "USD") {
      if (itemCcy === "USD") {
        subtotal += q * amt;
        total += q * amt * (1 + taxp);
      } else if ((item.total_usd ?? 0) > 0) {
        total += item.total_usd!;
        subtotal += item.total_usd! / (1 + taxp);
      } else {
        const unitUsd = Number(item.usd_amount ?? 0);
        subtotal += q * unitUsd;
        total += q * unitUsd * (1 + taxp);
      }
    } else {
      if ((item.total_mxn ?? 0) > 0) {
        total += item.total_mxn!;
        subtotal += item.total_mxn! / (1 + taxp);
      } else {
        subtotal += q * amt;
        total += q * amt * (1 + taxp);
      }
    }
  }

  return { subtotal, total };
}
