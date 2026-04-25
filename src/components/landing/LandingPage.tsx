import Image from "next/image";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";

import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  LANDING_LOGO_URL,
  TIME_TREK_LOGO_URL,
  TIME_WHEELS_LOGO_URL,
} from "@/components/landing/constants";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-landing",
});

const LANDING_IMG_MARITIMO_SHIP =
  "https://i.postimg.cc/rwpxyP0L/dendoktoor-container-ship-6631117.jpg";
const LANDING_IMG_MARITIMO_PORT =
  "https://i.postimg.cc/7PM23k07/yamu-jay-ai-generated-9087011.jpg";
const LANDING_IMG_AEREO =
  "https://i.postimg.cc/x1W8rxLX/tobiasrehbein-airplane-4974678.jpg";
const LANDING_IMG_TERRESTRE =
  "https://i.postimg.cc/B6CnKJkZ/tungart7-trucks-8656643.jpg";
const LANDING_IMG_ALMACEN =
  "https://i.postimg.cc/FKRMZNYS/pexels-ryank-27111449.jpg";

/** Fondo del hero principal (impacto visual + coherencia con logística marítima). */
const LANDING_HERO_BG = LANDING_IMG_MARITIMO_PORT;

const transportServices: {
  title: string;
  description: string;
  /** Imágenes de fondo: una franja por imagen; marítimo usa dos en panel dividido. */
  backgrounds: { src: string; alt: string }[];
}[] = [
  {
    title: "Transporte marítimo",
    description:
      "Coordinación de embarques, consolidación y contenedores completos con enfoque en rutas y tiempos competitivos.",
    backgrounds: [
      {
        src: LANDING_IMG_MARITIMO_SHIP,
        alt: "Buque portacontenedores en mar abierto bajo cielo despejado",
      },
      {
        src: LANDING_IMG_MARITIMO_PORT,
        alt: "Puerto marítimo con grúas y contenedores al atardecer",
      },
    ],
  },
  {
    title: "Transporte aéreo",
    description:
      "Opciones ágiles para cargas sensibles al tiempo, con selección de tarifas y conexiones adecuadas a tu mercancía.",
    backgrounds: [
      {
        src: LANDING_IMG_AEREO,
        alt: "Avión de carga en pista de aeropuerto al amanecer o atardecer",
      },
    ],
  },
  {
    title: "Transporte terrestre",
    description:
      "Desde un pallet hasta volúmenes mayores: enlaces confiables y visibilidad en el movimiento de tu carga.",
    backgrounds: [
      {
        src: LANDING_IMG_TERRESTRE,
        alt: "Camión articulado con contenedor en terminal logística",
      },
    ],
  },
  {
    title: "Valores agregados",
    description:
      "Servicios complementarios que fortalecen tu cadena: almacén, distribución, seguros y más, según tu operación.",
    backgrounds: [
      {
        src: LANDING_IMG_ALMACEN,
        alt: "Interior de almacén con racks, pallets y cajas embaladas",
      },
    ],
  },
];

const integralSolutions = [
  "Servicios door to door",
  "Coordinación con agencias aduanales",
  "Previos en origen",
  "Almacén y distribución",
];

/** URL de chat WhatsApp (wa.me) a partir de NEXT_TIME_WHATS_APP (ej. +52 55 1234 5678). */
function buildWhatsAppHref(raw: string | undefined): string | null {
  const s = raw?.trim();
  if (!s) return null;
  const digits = s.replace(/\D/g, "");
  return digits.length > 0 ? `https://wa.me/${digits}` : null;
}

const timeGroup = [
  {
    name: "Time Forwarding",
    role: "Freight forwarder internacional",
    detail: "Gestión y coordinación de cargas multimodales con visión global.",
    logoUrl: LANDING_LOGO_URL,
    logoAlt: "Time Forwarding",
    logoWidth: 220,
    logoHeight: 64,
  },
  {
    name: "Time Wheels",
    role: "Línea de transporte",
    detail: "Capacidad terrestre alineada a tus requerimientos de movimiento.",
    logoUrl: TIME_WHEELS_LOGO_URL,
    logoAlt: "Time Wheels",
    logoWidth: 200,
    logoHeight: 72,
  },
  {
    name: "Time Trek Couriers",
    role: "Mensajería y paquetería express",
    detail: "Plataforma para envíos express y operaciones de última milla.",
    logoUrl: TIME_TREK_LOGO_URL,
    logoAlt: "Time Trek Couriers",
    logoWidth: 200,
    logoHeight: 72,
  },
];

type LandingPageProps = {
  /** Teléfono WhatsApp (cualquier formato); prioridad sobre variables de entorno. */
  whatsAppPhoneRaw?: string;
};

export default function LandingPage({ whatsAppPhoneRaw }: LandingPageProps) {
  const whatsAppHref = buildWhatsAppHref(
    whatsAppPhoneRaw?.trim() ||
      process.env.NEXT_TIME_WHATS_APP?.trim() ||
      process.env.NEXT_PUBLIC_NEXT_TIME_WHATS_APP?.trim(),
  );

  return (
    <div
      className={`${jakarta.className} min-h-screen bg-[#f4f6f9] text-slate-900 antialiased`}
    >
      <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image
              src={LANDING_LOGO_URL}
              alt="Time Forwarding"
              width={320}
              height={96}
              className="h-14 w-auto rounded-sm object-contain sm:h-[4.5rem] md:h-20"
              priority
            />
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-1 text-base font-semibold text-slate-600 sm:gap-1.5 sm:text-lg">
            <a
              href="#quienes-somos"
              className="rounded-lg px-3 py-2.5 transition hover:bg-slate-100 hover:text-brand sm:px-4 sm:py-3"
            >
              Quiénes somos
            </a>
            <a
              href="#servicios"
              className="rounded-lg px-3 py-2.5 transition hover:bg-slate-100 hover:text-brand sm:px-4 sm:py-3"
            >
              Servicios
            </a>
            <a
              href="#time-group"
              className="rounded-lg px-3 py-2.5 transition hover:bg-slate-100 hover:text-brand sm:px-4 sm:py-3"
            >
              Time Group
            </a>
            <a
              href="#contacto"
              className="rounded-lg px-3 py-2.5 transition hover:bg-slate-100 hover:text-brand sm:px-4 sm:py-3"
            >
              Contacto
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero: imagen de fondo + capas para legibilidad */}
        <section className="relative flex min-h-[min(100dvh,920px)] flex-col justify-center overflow-hidden text-white">
          <div className="absolute inset-0">
            <Image
              src={LANDING_HERO_BG}
              alt="Puerto y operaciones marítimas al atardecer"
              fill
              priority
              className="object-cover object-[center_35%] sm:object-center"
              sizes="100vw"
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950/92 via-[#0c4a6e]/82 to-slate-900/55"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(ellipse 90% 60% at 20% 20%, rgba(56, 189, 248, 0.22), transparent 55%)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M60%200H0v60%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-opacity%3D%22.05%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/95 sm:text-sm drop-shadow-sm">
              Logística internacional · México y el mundo
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight drop-shadow-md sm:text-5xl lg:text-6xl">
              Especialistas en logística internacional
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/90 drop-shadow sm:text-xl">
              Como agente de carga, gestionamos y coordinamos cargas aéreas, marítimas y
              terrestres: desde un pallet hasta contenedores completos, eligiendo rutas, tarifas y
              proveedores para que tu mercancía llegue a tiempo y en forma.
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <a
                href="#contacto"
                className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-brand shadow-lg shadow-black/25 transition hover:bg-sky-50"
              >
                Hablemos de tu carga
              </a>
              <a
                href="#servicios"
                className="inline-flex items-center justify-center rounded-xl border border-white/35 bg-white/10 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-md transition hover:bg-white/15"
              >
                Ver servicios
              </a>
            </div>
          </div>
        </section>

        {/* Quiénes somos */}
        <section
          id="quienes-somos"
          className="scroll-mt-20 border-b border-slate-200/80 bg-white py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
                  Quiénes somos
                </h2>
                <p className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                  Experiencia, know-how y alcance global con atención cercana.
                </p>
              </div>
              <div className="space-y-6 text-lg leading-relaxed text-slate-600 lg:col-span-7">
                <p>
                  Contamos con la experiencia para manejar carga sobredimensionada, refrigerada y
                  peligrosa, así como mercancías de sectores automotriz, manufactura, consumo,
                  bebidas y licores, pharma y medical devices.
                </p>
                <p>
                  Ofrecemos soluciones integrales que incluyen servicios door to door, coordinación
                  con agencias aduanales, previos en origen, almacén y distribución, asegurando que
                  cada etapa de la cadena logística esté bajo control. Nuestro objetivo es que tus
                  operaciones sean más simples, seguras y eficientes.
                </p>
                <p className="font-medium text-slate-800">
                  Somos una empresa mexicana con orgullo y visión global. Oficinas y agentes aliados
                  en todo el mundo nos permiten dar soporte global con atención personalizada.
                </p>
              </div>
            </div>

            <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {integralSolutions.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-[#f8fafc] px-5 py-4 text-sm font-medium text-slate-800"
                >
                  <span
                    className="flex h-2 w-2 shrink-0 rounded-full bg-brand"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Servicios: franjas a ancho completo con imagen de fondo */}
        <section id="servicios" className="scroll-mt-20 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
                Servicios
              </h2>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Modos de transporte y capacidades alineadas a tu cadena
              </p>
              <p className="mt-4 text-lg text-slate-600">
                La misma rigurosidad con la que evaluamos rutas y proveedores, aplicada a cada
                modalidad.
              </p>
            </div>
          </div>

          <ul className="mt-12 w-full space-y-0">
            {transportServices.map((s, serviceIndex) => {
              const n = s.backgrounds.length;
              const isSplit = n >= 2;
              const isPhotoBand = n === 1;
              const isGradientOnly = n === 0;
              const textOnRight = serviceIndex % 2 === 1;

              return (
                <li key={s.title} className="relative w-full overflow-hidden">
                  {isGradientOnly ? (
                    <div className="relative min-h-[260px] bg-gradient-to-br from-slate-900 via-brand to-slate-800">
                      <div
                        className="pointer-events-none absolute inset-0 opacity-30"
                        aria-hidden
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12), transparent 45%)",
                        }}
                      />
                      <div className="relative z-10 mx-auto flex min-h-[260px] max-w-6xl flex-col justify-center px-4 py-14 sm:px-6 lg:px-8">
                        <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                          {s.title}
                        </h3>
                        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
                          {s.description}
                        </p>
                      </div>
                    </div>
                  ) : isSplit ? (
                    <div className="relative min-h-[min(72vw,420px)] sm:min-h-[380px] lg:min-h-[400px]">
                      <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2">
                        {s.backgrounds.slice(0, 2).map((bg, idx) => (
                          <div
                            key={`${bg.src}-${idx}`}
                            className="relative min-h-[220px] lg:min-h-0"
                          >
                            <Image
                              src={bg.src}
                              alt={bg.alt}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                          </div>
                        ))}
                      </div>
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/88 via-slate-950/45 to-slate-950/25 lg:bg-gradient-to-r lg:from-slate-950/90 lg:via-slate-950/35 lg:to-slate-950/15"
                        aria-hidden
                      />
                      <div
                        className={`relative z-10 mx-auto flex min-h-[min(72vw,420px)] max-w-6xl flex-col justify-end px-4 py-12 sm:min-h-[380px] sm:px-6 sm:py-16 lg:min-h-[400px] lg:justify-center lg:py-20 ${
                          textOnRight ? "lg:items-end lg:text-right" : ""
                        }`}
                      >
                        <div className={textOnRight ? "lg:max-w-2xl" : "max-w-3xl"}>
                          <h3 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm sm:text-4xl">
                            {s.title}
                          </h3>
                          <p className="mt-5 text-lg leading-relaxed text-white/90 sm:text-xl">
                            {s.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : isPhotoBand ? (
                    <div className="relative min-h-[min(85vw,440px)] sm:min-h-[400px] lg:min-h-[420px]">
                      <Image
                        src={s.backgrounds[0].src}
                        alt={s.backgrounds[0].alt}
                        fill
                        className="object-cover object-center"
                        sizes="100vw"
                      />
                      <div
                        className={
                          textOnRight
                            ? "pointer-events-none absolute inset-0 bg-gradient-to-l from-slate-950/20 via-slate-950/55 to-slate-950/88"
                            : "pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/55 to-slate-950/20"
                        }
                        aria-hidden
                      />
                      <div
                        className={`relative z-10 mx-auto flex min-h-[min(85vw,440px)] max-w-6xl flex-col justify-center px-4 py-14 sm:min-h-[400px] sm:px-6 sm:py-16 lg:min-h-[420px] lg:py-20 ${
                          textOnRight ? "items-end text-right" : ""
                        }`}
                      >
                        <div className={textOnRight ? "max-w-2xl" : "max-w-3xl"}>
                          <h3 className="text-3xl font-bold tracking-tight text-white drop-shadow sm:text-4xl">
                            {s.title}
                          </h3>
                          <p className="mt-5 text-lg leading-relaxed text-white/90 sm:text-xl">
                            {s.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Time Group */}
        <section
          id="time-group"
          className="scroll-mt-20 border-y border-slate-200/80 bg-white py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
                Time Group
              </h2>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Un ecosistema logístico integrado
              </p>
              <p className="mt-4 text-lg text-slate-600">
                Pertenecemos a <strong className="font-semibold text-slate-800">Time Group</strong>,
                que integra tres empresas complementarias para cubrir distintas necesidades de
                movilidad de mercancías.
              </p>
              <p className="mt-3 text-sm font-medium text-slate-500">
                Tres marcas · Una visión operativa
              </p>
            </div>

            <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {timeGroup.map((c) => (
                <li key={c.name} className="flex min-h-full flex-col">
                  <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/40 transition duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-xl hover:shadow-slate-300/50">
                    <div className="relative flex min-h-[9.5rem] items-center justify-center border-b border-slate-100 bg-gradient-to-b from-slate-50/90 to-white px-6 py-8 sm:min-h-[10.5rem]">
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-brand/15 to-transparent" />
                      <Image
                        src={c.logoUrl}
                        alt={c.logoAlt}
                        width={c.logoWidth}
                        height={c.logoHeight}
                        className="max-h-20 w-auto max-w-[min(100%,220px)] rounded-sm object-contain sm:max-h-24"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6 sm:p-7">
                      <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
                      <p className="mt-1.5 text-xs font-bold uppercase tracking-[0.12em] text-brand">
                        {c.role}
                      </p>
                      <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                        {c.detail}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Contacto */}
        <section
          id="contacto"
          className="scroll-mt-20 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-brand px-8 py-16 text-center text-white sm:px-12 sm:py-20">
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/5 blur-3xl"
                aria-hidden
              />
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  ¿Tu próximo envío empieza aquí?
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
                  Cuéntanos origen, destino, tipo de mercancía y ventanas de tiempo. Nuestro equipo
                  te orienta con rutas y alternativas acordes a tu operación.
                </p>
                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
                  <a
                    href={`tel:${CONTACT_PHONE_TEL}`}
                    className="inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-brand shadow-lg transition hover:bg-sky-50 sm:w-auto"
                  >
                    Llamar: {CONTACT_PHONE_DISPLAY}
                  </a>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="inline-flex w-full max-w-xs items-center justify-center rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto"
                  >
                    Escribir por correo
                  </a>
                </div>
                <p className="mt-8 text-sm text-white/60">
                  <a
                    href="/aviso-de-privacidad"
                    className="underline-offset-2 hover:text-white hover:underline"
                  >
                    Aviso de privacidad
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-4 py-12 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:items-start">
            <Image
              src={LANDING_LOGO_URL}
              alt="Time Forwarding"
              width={280}
              height={84}
              className="h-14 w-auto rounded-sm object-contain sm:h-16 md:h-[4.5rem]"
            />
            <p className="max-w-xs text-center text-sm text-slate-500 sm:text-left">
              Agente de carga · Logística internacional · México
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 text-sm text-slate-600 sm:items-end">
            <a
              href={`tel:${CONTACT_PHONE_TEL}`}
              className="font-medium text-brand hover:underline"
            >
              {CONTACT_PHONE_DISPLAY}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="break-all text-slate-600 hover:text-brand hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            <Link
              href="/aviso-de-privacidad"
              className="mt-1 text-slate-500 hover:text-slate-800"
            >
              Aviso de privacidad
            </Link>
            <p className="mt-2 text-xs text-slate-400">
              © {new Date().getFullYear()} Time Forwarding S.A. de C.V. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>

      {whatsAppHref ? (
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-[#20bd5a] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#25D366] sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
          aria-label="Contactar por WhatsApp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8 sm:h-9 sm:w-9"
            aria-hidden
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}
