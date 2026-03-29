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

const transportServices = [
  {
    title: "Transporte marítimo",
    description:
      "Coordinación de embarques, consolidación y contenedores completos con enfoque en rutas y tiempos competitivos.",
  },
  {
    title: "Transporte aéreo",
    description:
      "Opciones ágiles para cargas sensibles al tiempo, con selección de tarifas y conexiones adecuadas a tu mercancía.",
  },
  {
    title: "Transporte terrestre",
    description:
      "Desde un pallet hasta volúmenes mayores: enlaces confiables y visibilidad en el movimiento de tu carga.",
  },
  {
    title: "Valores agregados",
    description:
      "Servicios complementarios que fortalecen tu cadena: almacén, distribución, seguros y más, según tu operación.",
  },
];

const integralSolutions = [
  "Servicios door to door",
  "Coordinación con agencias aduanales",
  "Previos en origen",
  "Almacén y distribución",
];

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

export default function LandingPage() {
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
          <nav className="flex flex-wrap items-center justify-end gap-0.5 text-sm font-semibold text-slate-600">
            <a
              href="#quienes-somos"
              className="rounded-lg px-2.5 py-2 transition hover:bg-slate-100 hover:text-brand sm:px-3"
            >
              Quiénes somos
            </a>
            <a
              href="#servicios"
              className="rounded-lg px-2.5 py-2 transition hover:bg-slate-100 hover:text-brand sm:px-3"
            >
              Servicios
            </a>
            <a
              href="#time-group"
              className="rounded-lg px-2.5 py-2 transition hover:bg-slate-100 hover:text-brand sm:px-3"
            >
              Time Group
            </a>
            <a
              href="#contacto"
              className="rounded-lg px-2.5 py-2 transition hover:bg-slate-100 hover:text-brand sm:px-3"
            >
              Contacto
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-brand text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(135deg, #0c4a6e 0%, transparent 50%), radial-gradient(ellipse 80% 50% at 100% 0%, #38bdf8 0%, transparent 55%)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M60%200H0v60%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-opacity%3D%22.04%22%2F%3E%3C%2Fsvg%3E')] opacity-60" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/90 sm:text-sm">
              Logística internacional · México y el mundo
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Especialistas en logística internacional
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-200 sm:text-xl">
              Como agente de carga, gestionamos y coordinamos cargas aéreas, marítimas y
              terrestres: desde un pallet hasta contenedores completos, eligiendo rutas, tarifas y
              proveedores para que tu mercancía llegue a tiempo y en forma.
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <a
                href="#contacto"
                className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-brand shadow-lg shadow-black/20 transition hover:bg-sky-50"
              >
                Hablemos de tu carga
              </a>
              <a
                href="#servicios"
                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
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

        {/* Servicios */}
        <section
          id="servicios"
          className="scroll-mt-20 py-20 sm:py-24"
        >
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
            <ul className="mt-14 grid gap-6 sm:grid-cols-2">
              {transportServices.map((s) => (
                <li
                  key={s.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm transition duration-300 hover:border-slate-300 hover:shadow-lg"
                >
                  <div className="absolute right-6 top-6 h-16 w-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 opacity-80 transition group-hover:from-sky-50 group-hover:to-slate-100" />
                  <h3 className="relative text-xl font-bold text-slate-900">{s.title}</h3>
                  <p className="relative mt-4 leading-relaxed text-slate-600">{s.description}</p>
                </li>
              ))}
            </ul>
          </div>
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
    </div>
  );
}
