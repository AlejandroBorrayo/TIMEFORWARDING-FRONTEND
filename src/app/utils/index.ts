import { ResponseFindAddressByCP } from "@/type/dipomex";
import type {
  Parcel,
  Quotation,
  RateSoloenvios,
  QuotationSoloenviosRequest,
} from "@/type/soloenvios-quote";
import { ShipmentSoloenviosRequest } from "@/type/soloenvios-shipment";

export const capitalizeFirstLetter = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatDateDMY = (dateStr?: string) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/** ObjectId de MongoDB en hex (24 caracteres). */
export const isValidMongoObjectId = (
  value: string | undefined | null,
): boolean =>
  typeof value === "string" && /^[a-f0-9]{24}$/i.test(value.trim());

/** Algunas respuestas del API usan `_id` y otras `id`. */
export const normalizeSupplierDocumentId = (
  doc: { _id?: string; id?: string } | null | undefined,
): string => {
  const raw = doc?._id ?? doc?.id;
  return typeof raw === "string" ? raw.trim() : "";
};

export const STATUS_OPTIONS_SOLOENVIOS = [
  "Guía creada",
  "Excepción",
  "Recogido",
  "En tránsito",
  "Última milla",
  "Intento de entrega",
  "Entregado",
  "Entregado en sucursal",
  "En devolución",
  "Cancelado",
  "En proceso",
];

export const STATUS_FOLIO = ["Completada", "En proceso"];

export const statusMap: Record<string, string> = {
  created: "Guía creada",
  exception: "Excepción",
  picked_up: "Recogido",
  in_transit: "En tránsito",
  last_mile: "Última milla",
  delivery_attempt: "Intento de entrega",
  delivered: "Entregado",
  delivered_to_branch: "Entregado en sucursal",
  in_return: "En devolución",
  in_progress: "En proceso",
  cancelled: "Cancelado",
};

export const LogoFedex =
  "https://i.postimg.cc/nhMzktLM/CITYPNG-COM-Fed-Ex-Delivery-Company-Logo-HD-PNG-5000x5000.png";

export const LogoDHL =
  "https://i.postimg.cc/9XsFPv5v/Captura-de-pantalla-2025-11-09-a-la-s-7-27-42-p-m.png";

export const LogoEstafeta = "https://i.postimg.cc/t4G0mrQH/Logo-Estafeta.png";

export const LogoPaqueteExpress =
  "https://i.postimg.cc/hGG4sSdR/Paquetexpress.png";

export const LogoUps =
  "https://i.postimg.cc/90Jqg7n0/Captura-de-pantalla-2025-11-07-a-la-s-4-34-36-p-m-removebg-preview.png";

// Opcionalmente, puedes definir la interfaz para un mejor tipado en TypeScript:
/*
  export interface ProductoCartaPorte {
    clave: string;
    descripcion: string;
  }
  */

type Crumb = {
  label: string;
  href?: string;
};

type BreadcrumbContext = Record<string, string | undefined>;

const ACCOUNT_HOME = "/cuenta/folios";

const staticSegmentLabels: Record<string, string> = {
  cuenta: "Cuenta",
  folios: "Folios",
  clientes: "Clientes",
  cliente: "Cliente",
  cotizacion: "Cotización",
  usuarios: "Usuarios",
  proveedores: "Proveedores",
  movimientos: "Movimientos",
  utilidades: "Utilidades",
  envios: "Envíos",
  notas: "Notas",
  tax: "Impuestos",
  directorio: "Directorio",
  perfil: "Perfil",
  recolecciones: "Recolecciones",
  resumen: "Resumen",
  dashboard: "Dashboard",
  empresas: "Empresas",
  costo: "Costos",
  nuevo: "Nuevo",
};

const getSegmentLabel = (segment: string) =>
  staticSegmentLabels[segment] ?? capitalizeFirstLetter(segment);

const getDynamicLabel = (key: string, value: string) => {
  switch (key) {
    case "folio":
      return `Folio ${value}`;
    case "costo":
      return `Costo ${value}`;
    case "cotizacion":
      return `Cotización ${value}`;
    case "customerId":
      return `Cliente ${value}`;
    case "quoteId":
      return `Cotización ${value}`;
    case "proveedor":
      return `Proveedor ${value}`;
    case "envio":
      return `Envío ${value}`;
    default:
      return value;
  }
};

export const getRoutePattern = (
  pathname: string,
  params: Record<string, string | string[] | undefined>,
) => {
  let pattern = pathname;

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        pattern = pattern.replace(v, `[${key}]`);
      });
      return;
    }

    if (value) {
      pattern = pattern.replace(value, `[${key}]`);
    }
  });

  return pattern;
};

export const BREADCRUMB_MAP: Record<
  string,
  (ctx: BreadcrumbContext) => Crumb[]
> = {
  "/cuenta/folios": () => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Folios" },
  ],

  "/cuenta/folios/nuevo": () => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Folios", href: "/cuenta/folios" },
    { label: "Nuevo folio" },
  ],

  "/cuenta/folios/[folio]": ({ folio }) => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Folios", href: "/cuenta/folios" },
    { label: `Folio ${folio}` },
  ],

  "/cuenta/folios/[folio]/proveedores": ({ folio }) => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Folios", href: "/cuenta/folios" },
    { label: `Folio ${folio}`, href: `/cuenta/folios/${folio}/resumen` },
    { label: "Proveedores" },
  ],

  "/cuenta/folios/[folio]/resumen": ({ folio }) => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Folios", href: "/cuenta/folios" },
    { label: `Folio ${folio}` },
    { label: "Resumen" },
  ],

  "/cuenta/folios/dashboard": () => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Folios", href: "/cuenta/folios" },
    { label: "Dashboard" },
  ],

  "/cuenta/folios/[folio]/costo": ({ folio }) => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Folios", href: "/cuenta/folios" },
    { label: `Folio ${folio}`, href: `/cuenta/folios/${folio}/resumen` },
    { label: "Costos" },
  ],

  "/cuenta/folios/[folio]/costo/[costo]": ({ folio, costo }) => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Folios", href: "/cuenta/folios" },
    { label: `Folio ${folio}`, href: `/cuenta/folios/${folio}/resumen` },
    { label: `Costo ${costo}` },
  ],

  "/cuenta/folios/[folio]/costo/[costo]/nuevo": ({ folio, costo }) => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Folios", href: "/cuenta/folios" },
    { label: `Folio ${folio}`, href: `/cuenta/folios/${folio}/resumen` },
    { label: `Costo ${costo}`, href: `/cuenta/folios/${folio}/costo/${costo}` },
    { label: "Nuevo costo" },
  ],

  "/cuenta/folios/[folio]/costo/[costo]/cotizacion/nuevo": ({
    folio,
    costo,
  }) => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Folios", href: "/cuenta/folios" },
    { label: `Folio ${folio}`, href: `/cuenta/folios/${folio}/resumen` },
    { label: `Costo ${costo}`, href: `/cuenta/folios/${folio}/costo/${costo}` },
    { label: "Nueva cotización" },
  ],
  "/cuenta/folios/[folio]/costo/nuevo": ({ folio }) => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Folios", href: "/cuenta/folios" },
    { label: `Folio ${folio}`, href: `/cuenta/folios/${folio}/resumen` },
    { label: "Nuevo costo" },
  ],

  "/cuenta/folios/[folio]/costo/[costo]/cotizacion/[cotizacion]": ({
    folio,
    costo,
    cotizacion,
  }) => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Folios", href: "/cuenta/folios" },
    { label: `Folio ${folio}`, href: `/cuenta/folios/${folio}/resumen` },
    {
      label: `Costo ${costo}`,
      href: `/cuenta/folios/${folio}/costo/${costo}`,
    },
    { label: `Cotización ${cotizacion}` },
  ],

  "/cuenta/clientes": () => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Clientes" },
  ],

  "/cuenta/cliente/[customerId]": ({ customerId }) => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Clientes", href: "/cuenta/clientes" },
    { label: `Cliente ${customerId}` },
  ],

  "/cuenta/cliente/[customerId]/cotizacion/[quoteId]": ({
    customerId,
    quoteId,
  }) => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Clientes", href: "/cuenta/clientes" },
    { label: `Cliente ${customerId}`, href: `/cuenta/cliente/${customerId}` },
    { label: `Cotización ${quoteId}` },
  ],

  "/cuenta/usuarios": () => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Usuarios" },
  ],

  "/cuenta/proveedores": () => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Proveedores" },
  ],

  "/cuenta/proveedores/[proveedor]": ({ proveedor }) => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Proveedores", href: "/cuenta/proveedores" },
    { label: `Proveedor ${proveedor}` },
  ],

  "/cuenta/envios": () => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Envíos" },
  ],

  "/cuenta/envios/[envio]": ({ envio }) => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Envíos", href: "/cuenta/envios" },
    { label: `Envío ${envio}` },
  ],

  "/cuenta/perfil": () => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Perfil" },
  ],

  "/cuenta/movimientos": () => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Movimientos" },
  ],

  "/cuenta/utilidades": () => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Utilidades" },
  ],

  "/cuenta/notas": () => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Notas" },
  ],

  "/cuenta/tax": () => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Impuestos" },
  ],

  "/cuenta/directorio": () => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Directorio" },
  ],

  "/cuenta/recolecciones": () => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Recolecciones" },
  ],

  "/cuenta/empresas": () => [
    { label: "Cuenta", href: ACCOUNT_HOME },
    { label: "Empresas" },
  ],
};

const buildFallbackBreadcrumbs = (
  pathname: string,
  pattern: string,
  ctx: BreadcrumbContext,
) => {
  if (!pathname.startsWith("/cuenta")) return [];

  const pathSegments = pathname.split("/").filter(Boolean);
  const patternSegments = pattern.split("/").filter(Boolean);

  const crumbs: Crumb[] = [{ label: "Cuenta", href: ACCOUNT_HOME }];

  for (let i = 1; i < pathSegments.length; i += 1) {
    const segment = pathSegments[i];
    const patternSegment = patternSegments[i] ?? segment;
    const isLast = i === pathSegments.length - 1;
    const href = `/${pathSegments.slice(0, i + 1).join("/")}`;

    let label = getSegmentLabel(segment);

    if (
      patternSegment.startsWith("[") &&
      patternSegment.endsWith("]") &&
      segment
    ) {
      const key = patternSegment.slice(1, -1);
      label = getDynamicLabel(key, ctx[key] ?? segment);
    }

    crumbs.push({
      label,
      href: isLast ? undefined : href,
    });
  }

  return crumbs;
};

export const getBreadcrumbItems = (
  pathname: string,
  params: Record<string, string | string[] | undefined>,
) => {
  const ctx: BreadcrumbContext = {};

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      ctx[key] = value[0];
      return;
    }
    ctx[key] = value;
  });

  const pattern = getRoutePattern(pathname, params);
  const builder = BREADCRUMB_MAP[pattern];
  return builder ? builder(ctx) : buildFallbackBreadcrumbs(pathname, pattern, ctx);
};
