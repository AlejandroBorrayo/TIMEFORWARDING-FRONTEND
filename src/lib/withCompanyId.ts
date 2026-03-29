/** localStorage key for active company (must match selectedCompanyContext). */
export const SELECTED_COMPANY_STORAGE_KEY = "tf_selected_company_id";

/** Usuario de la sesión (NextAuth `user.sub`), sincronizado desde AuthProvider. */
export const CREATOR_USER_STORAGE_KEY = "tf_creator_userid";

export function getStoredCompanyId(): string | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(SELECTED_COMPANY_STORAGE_KEY);
  const t = v?.trim();
  return t || null;
}

export function setStoredCompanyId(id: string | null): void {
  if (typeof window === "undefined") return;
  const t = id?.trim();
  if (t) localStorage.setItem(SELECTED_COMPANY_STORAGE_KEY, t);
  else localStorage.removeItem(SELECTED_COMPANY_STORAGE_KEY);
}

export function getStoredCreatorUserId(): string | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(CREATOR_USER_STORAGE_KEY);
  const t = v?.trim();
  return t || null;
}

export function setStoredCreatorUserId(id: string | null): void {
  if (typeof window === "undefined") return;
  const t = id?.trim();
  if (t) localStorage.setItem(CREATOR_USER_STORAGE_KEY, t);
  else localStorage.removeItem(CREATOR_USER_STORAGE_KEY);
}

type TenantFields = { company_id?: string; creator_userid?: string };

function mergeTenantFields<T extends object>(body: T): T & TenantFields {
  const company_id = getStoredCompanyId();
  const creator_userid = getStoredCreatorUserId();
  const out = { ...body } as T & TenantFields;
  if (company_id) out.company_id = company_id;
  if (creator_userid) out.creator_userid = creator_userid;
  return out;
}

/** Añade `company_id` y `creator_userid` al body (cliente). */
export function withCompanyId<T extends object>(body: T): T & TenantFields {
  return mergeTenantFields(body);
}

/**
 * Query string para GET (y cualquier request con `params`):
 * fusiona `base` con `company_id` y `creator_userid` si existen.
 */
export function withCompanyQuery(
  base?: Record<string, string | number | boolean | undefined | null>,
): Record<string, string | number | boolean> {
  const company_id = getStoredCompanyId();
  const creator_userid = getStoredCreatorUserId();
  const out: Record<string, string | number | boolean> = {};
  if (base) {
    for (const [k, v] of Object.entries(base)) {
      if (v === undefined || v === null) continue;
      out[k] = v as string | number | boolean;
    }
  }
  if (company_id) out.company_id = company_id;
  if (creator_userid) out.creator_userid = creator_userid;
  return out;
}
