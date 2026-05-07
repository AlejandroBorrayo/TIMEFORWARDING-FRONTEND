import axios from "axios";

const FRANKFURTER_LATEST_BASE =
  "https://api.frankfurter.dev/v1/latest?base=USD";

const RATES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const LS_PREFIX = "tf:fx:frankfurter:usdbase:";

function lsKey(symbols: string): string {
  return `${LS_PREFIX}${symbols}`;
}

function readFromLocalStorage(symbols: string): CacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(lsKey(symbols));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts?: unknown; data?: unknown };
    const ts = Number(parsed?.ts);
    const data = parsed?.data as RatesPayload | undefined;
    if (!Number.isFinite(ts) || !data || typeof data !== "object") return null;
    return { ts, data };
  } catch {
    return null;
  }
}

function writeToLocalStorage(symbols: string, entry: CacheEntry): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      lsKey(symbols),
      JSON.stringify({ ts: entry.ts, data: entry.data }),
    );
  } catch {
    // ignore quota / privacy mode
  }
}

export type RatesPayload = {
  amount?: number;
  base?: string;
  date?: string;
  rates?: Record<string, string | number>;
};

type CacheEntry = { data: RatesPayload; ts: number };

const ratesCache = new Map<string, CacheEntry>();
const ratesInflight = new Map<string, Promise<RatesPayload>>();

function normCcy(c: string): string {
  return c.trim().toUpperCase();
}

/**
 * Símbolos que Frankfurter debe devolver (todas las monedas del par distintas de USD).
 * Con base USD, `rates` incluye solo esas claves.
 */
export function frankfurterSymbolsForPair(from: string, to: string): string | null {
  const f = normCcy(from);
  const t = normCcy(to);
  if (!f || !t) return null;
  if (f === t) return null;

  const need = new Set<string>();
  if (f !== "USD") need.add(f);
  if (t !== "USD") need.add(t);
  if (need.size === 0) return null;

  return [...need].sort().join(",");
}

/** Todas las monedas distintas de USD presentes en las líneas (una sola petición). */
export function frankfurterSymbolsForItems(
  items: { currency?: string }[],
): string | null {
  const need = new Set<string>();
  for (const row of items) {
    const c = normCcy(row?.currency ?? "");
    if (c && c !== "USD") need.add(c);
  }
  if (need.size === 0) return null;
  return [...need].sort().join(",");
}

function usdOnlyPayload(): RatesPayload {
  return { base: "USD", amount: 1, rates: {} };
}

async function fetchFrankfurterLatest(symbols: string): Promise<RatesPayload> {
  const url = `${FRANKFURTER_LATEST_BASE}&symbols=${encodeURIComponent(symbols)}`;
  const { data } = await axios.get<RatesPayload>(url);
  return data;
}

/**
 * Tasas para un conjunto fijo de `symbols` (p. ej. `EUR` o `EUR,MXN`).
 */
export async function getRatesForSymbolSet(
  symbols: string | null,
): Promise<RatesPayload> {
  if (symbols == null || symbols === "") {
    return usdOnlyPayload();
  }

  const sym = symbols;
  const now = Date.now();
  const cached = ratesCache.get(sym);
  if (cached != null && now - cached.ts < RATES_CACHE_TTL_MS) {
    return cached.data;
  }

  const persisted = readFromLocalStorage(sym);
  if (persisted != null && now - persisted.ts < RATES_CACHE_TTL_MS) {
    ratesCache.set(sym, persisted);
    return persisted.data;
  }

  const pending = ratesInflight.get(sym);
  if (pending != null) {
    return pending;
  }

  const promise = (async () => {
    try {
      const data = await fetchFrankfurterLatest(sym);
      const entry: CacheEntry = { data, ts: Date.now() };
      ratesCache.set(sym, entry);
      writeToLocalStorage(sym, entry);
      return data;
    } catch (e) {
      const stale = ratesCache.get(sym);
      if (stale != null) {
        return stale.data;
      }
      const stalePersisted = readFromLocalStorage(sym);
      if (stalePersisted != null) {
        ratesCache.set(sym, stalePersisted);
        return stalePersisted.data;
      }
      throw e;
    } finally {
      ratesInflight.delete(sym);
    }
  })();

  ratesInflight.set(sym, promise);
  return promise;
}

/** Una petición con todas las monedas no-USD del documento (columna Total USD alineada al total nativo). */
export async function getUsdBaseRatesForDocumentItems(
  items: { currency?: string }[],
): Promise<RatesPayload> {
  return getRatesForSymbolSet(frankfurterSymbolsForItems(items));
}

/**
 * Tasas ECB (Frankfurter) para convertir entre `from` y `to` (base USD en la API).
 * Caché y deduplicación por conjunto de `symbols`.
 */
export async function getUsdBaseRatesForCurrencies(
  from: string,
  to: string,
): Promise<RatesPayload> {
  const sym = frankfurterSymbolsForPair(from, to);
  return getRatesForSymbolSet(sym);
}

/**
 * Una sola petición con MXN y EUR (útil si necesitas ambas tasas sin un par concreto).
 */
export async function getLatestUsdBaseRates(): Promise<RatesPayload> {
  return getUsdBaseRatesForCurrencies("MXN", "EUR");
}

/**
 * Obtiene las tasas necesarias para convertir `from` → `to` (misma convención que Frankfurter).
 */
export const ConvertCurrency = async (
  amount: number,
  from: string,
  to: string,
): Promise<RatesPayload | null> => {
  void amount;
  try {
    return await getUsdBaseRatesForCurrencies(from, to);
  } catch (error) {
    console.error("Frankfurter rates:", error);
    return null;
  }
};

/**
 * Convierte usando respuesta con `base: "USD"`.
 * `rates[X]` = unidades de X por 1 USD (p. ej. MXN ~17.26, EUR ~0.85).
 * Fórmula cruzada: (importe_en_from / rate[from]) * rate[to].
 */
export function convertAmountWithUsdBaseRates(
  amount: number,
  from: string,
  to: string,
  data: { rates?: Record<string, string | number> } | null | undefined,
): number | null {
  const rates = data?.rates;
  if (!rates || !Number.isFinite(amount)) return null;

  const fromC = normCcy(from);
  const toC = normCcy(to);
  if (fromC === toC) return amount;

  const num = (c: string): number | null => {
    const upper = c.toUpperCase();
    const key =
      Object.keys(rates).find((k) => k.toUpperCase() === upper) ?? c;
    const raw = rates[key];
    const n = typeof raw === "string" ? parseFloat(raw) : Number(raw);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  };

  const rFrom = num(fromC);
  const rTo = num(toC);

  if (fromC === "USD") {
    if (rTo == null) return null;
    return amount * rTo;
  }
  if (toC === "USD") {
    if (rFrom == null) return null;
    return amount / rFrom;
  }
  if (rFrom == null || rTo == null) return null;
  return (amount / rFrom) * rTo;
}
