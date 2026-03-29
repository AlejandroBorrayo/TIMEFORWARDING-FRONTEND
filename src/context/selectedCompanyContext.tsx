"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as CompanyService from "@/services/company";
import type { CompanyInterface } from "@/type/company.interface";
import {
  getStoredCompanyId,
  setStoredCompanyId,
} from "@/lib/withCompanyId";
import CompanySwitchOverlay from "@/components/companySwitchOverlay";

/** Tiempo mínimo del overlay al cambiar de empresa (experiencia de usuario). */
const COMPANY_SWITCH_OVERLAY_MS = 3000;

type SelectedCompanyContextValue = {
  companies: CompanyInterface[];
  companyId: string | null;
  activeCompany: CompanyInterface | null;
  loading: boolean;
  error: string | null;
  /** Cambia empresa activa y recarga la app para refrescar datos. */
  setCompanyId: (id: string | null) => void;
  refreshCompanies: () => Promise<void>;
};

const SelectedCompanyContext =
  createContext<SelectedCompanyContextValue | null>(null);

export function SelectedCompanyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [companies, setCompanies] = useState<CompanyInterface[]>([]);
  const [companyId, setCompanyIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companySwitchOverlay, setCompanySwitchOverlay] = useState<{
    fromName: string;
    toName: string;
    fromLogoUrl: string | null;
    toLogoUrl: string | null;
  } | null>(null);
  const companySwitchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const refreshCompanies = useCallback(async () => {
    try {
      setError(null);
      const res = await CompanyService.FindAll({ page: 1, perpage: 500 });
      setCompanies(res.records ?? []);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar las empresas");
      setCompanies([]);
    }
  }, []);

  useEffect(() => {
    setCompanyIdState(getStoredCompanyId());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await refreshCompanies();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshCompanies]);

  /**
   * Sincroniza empresa activa con localStorage y el listado:
   * - Si el id guardado sigue existiendo en el array, se mantiene.
   * - Si no hay id válido (primera visita, sesión nueva, id obsoleto), se usa la primera empresa.
   */
  useEffect(() => {
    if (loading || companies.length === 0) return;
    const stored = getStoredCompanyId();
    const validStored =
      stored != null && companies.some((c) => c._id === stored);

    if (validStored && stored) {
      setCompanyIdState((prev) => (prev === stored ? prev : stored));
      return;
    }

    if (stored && !validStored) {
      setStoredCompanyId(null);
    }

    const first = companies[0];
    if (first?._id) {
      setStoredCompanyId(first._id);
      setCompanyIdState(first._id);
    }
  }, [loading, companies]);

  useEffect(() => {
    if (!companySwitchOverlay) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [companySwitchOverlay]);

  useEffect(() => {
    return () => {
      if (companySwitchTimeoutRef.current) {
        clearTimeout(companySwitchTimeoutRef.current);
      }
    };
  }, []);

  const setCompanyId = useCallback(
    (id: string | null) => {
      const next = id?.trim() || null;
      const current = getStoredCompanyId();
      if (next === current) return;

      const fromCo = current
        ? companies.find((c) => c._id === current)
        : undefined;
      const toCo = next ? companies.find((c) => c._id === next) : undefined;

      const fromName = fromCo?.name ?? (current ? "Empresa anterior" : "Sin empresa");
      const toName = toCo?.name ?? (next ? "Nueva empresa" : "Sin empresa");
      const fromLogoUrl = fromCo?.logo?.trim() || null;
      const toLogoUrl = toCo?.logo?.trim() || null;

      if (companySwitchTimeoutRef.current) {
        clearTimeout(companySwitchTimeoutRef.current);
        companySwitchTimeoutRef.current = null;
      }

      setCompanySwitchOverlay({
        fromName,
        toName,
        fromLogoUrl,
        toLogoUrl,
      });

      companySwitchTimeoutRef.current = setTimeout(() => {
        companySwitchTimeoutRef.current = null;
        setStoredCompanyId(next);
        setCompanyIdState(next);
        setCompanySwitchOverlay(null);
        window.location.assign("/cuenta/folios");
      }, COMPANY_SWITCH_OVERLAY_MS);
    },
    [companies],
  );

  const activeCompany = useMemo(
    () => companies.find((c) => c._id === companyId) ?? null,
    [companies, companyId],
  );

  const value = useMemo(
    () => ({
      companies,
      companyId,
      activeCompany,
      loading,
      error,
      setCompanyId,
      refreshCompanies,
    }),
    [
      companies,
      companyId,
      activeCompany,
      loading,
      error,
      setCompanyId,
      refreshCompanies,
    ],
  );

  return (
    <SelectedCompanyContext.Provider value={value}>
      {children}
      {companySwitchOverlay ? (
        <CompanySwitchOverlay
          fromName={companySwitchOverlay.fromName}
          toName={companySwitchOverlay.toName}
          fromLogoUrl={companySwitchOverlay.fromLogoUrl}
          toLogoUrl={companySwitchOverlay.toLogoUrl}
        />
      ) : null}
    </SelectedCompanyContext.Provider>
  );
}

export function useSelectedCompany(): SelectedCompanyContextValue {
  const ctx = useContext(SelectedCompanyContext);
  if (!ctx) {
    throw new Error(
      "useSelectedCompany debe usarse dentro de SelectedCompanyProvider",
    );
  }
  return ctx;
}
