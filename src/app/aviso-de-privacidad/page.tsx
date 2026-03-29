import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";

import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  LANDING_LOGO_URL,
} from "@/components/landing/constants";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description:
    "Aviso de privacidad de Time Forwarding S.A. de C.V. conforme a la LFPDPPP.",
};

export default function AvisoPrivacidadPage() {
  return (
    <div
      className={`${jakarta.className} min-h-screen bg-[#f4f6f9] text-slate-900 antialiased`}
    >
      <header className="border-b border-slate-200/90 bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-5 sm:px-6 sm:py-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={LANDING_LOGO_URL}
              alt="Time Forwarding"
              width={320}
              height={96}
              className="h-14 w-auto rounded-sm object-contain sm:h-[4.5rem] md:h-20"
            />
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-brand hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Aviso de privacidad
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Time Forwarding S.A. de C.V.
        </p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-slate-700">
          <p>
            En <strong className="font-semibold text-slate-900">Time Forwarding S.A. de C.V.</strong>
            , estamos comprometidos con la protección de tu privacidad y el cumplimiento de la{" "}
            <strong className="font-semibold text-slate-900">
              Ley Federal de Protección de Datos Personales en Posesión de los Particulares
              (LFPDPPP)
            </strong>{" "}
            de México. Este aviso de privacidad explica cómo recopilamos, utilizamos y protegemos la
            información personal que obtenemos a través de nuestra página web.
          </p>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Información recopilada</h2>
            <p className="mt-3">
              En nuestro sitio web, podemos recopilar información personal que nos proporcionas
              voluntariamente a través de formularios de contacto o interacciones similares. Esto
              puede incluir tu nombre, dirección de correo electrónico, número de teléfono y
              cualquier otro dato que decidas compartir con nosotros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Uso de la información</h2>
            <p className="mt-3">Utilizamos la información personal recopilada para:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Responder a tus consultas, solicitudes de información o comentarios.</li>
              <li>
                Proporcionarte información sobre nuestros servicios, promociones u otras
                comunicaciones relacionadas con Time Forwarding S.A. de C.V.
              </li>
              <li>Mejorar nuestro sitio web, servicios y productos.</li>
              <li>Cumplir con nuestras obligaciones legales y reglamentarias.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Divulgación de la información</h2>
            <p className="mt-3">
              No compartimos tu información personal con terceros sin tu consentimiento, excepto:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Con nuestros proveedores de servicios confiables que nos asisten en la operación de
                nuestro negocio y nos brindan servicios relacionados con el sitio web.
              </li>
              <li>
                Cuando sea requerido por ley, por una autoridad competente o para proteger nuestros
                derechos legales.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Seguridad de la información</h2>
            <p className="mt-3">
              Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger
              la información personal contra pérdida, robo, acceso no autorizado, divulgación,
              alteración y destrucción. Solo el personal autorizado tiene acceso a la información
              personal y se les exige mantener la confidencialidad de dicha información.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Derechos ARCO</h2>
            <p className="mt-3">
              Tienes derecho a acceder, rectificar, cancelar u oponerte al uso de tus datos
              personales. Si deseas ejercer estos derechos, comunícate con nosotros a través de los
              siguientes medios:
            </p>
            <ul className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-white p-5 text-slate-800">
              <li>
                <span className="font-semibold text-slate-900">Teléfono: </span>
                <a
                  href={`tel:${CONTACT_PHONE_TEL}`}
                  className="text-brand underline-offset-2 hover:underline"
                >
                  {CONTACT_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <span className="font-semibold text-slate-900">Correo electrónico: </span>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="break-all text-brand underline-offset-2 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Cambios en el aviso de privacidad</h2>
            <p className="mt-3">
              Nos reservamos el derecho de realizar cambios en este aviso de privacidad en cualquier
              momento. Los cambios serán publicados en nuestro sitio web. Te recomendamos revisar
              este aviso de privacidad periódicamente para estar informado sobre cómo protegemos tu
              información personal.
            </p>
          </section>

          <p>
            Al utilizar nuestro sitio web, aceptas los términos de este aviso de privacidad y el
            procesamiento de tu información personal de acuerdo con lo establecido aquí.
          </p>

          <p>
            Si tienes alguna pregunta, solicitud o inquietud relacionada con nuestro aviso de
            privacidad, no dudes en comunicarte con nosotros a través de los datos de contacto
            proporcionados anteriormente.
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-3xl px-4 text-center text-sm text-slate-500 sm:px-6">
          <Link href="/" className="font-medium text-brand hover:underline">
            ← Inicio
          </Link>
          <p className="mt-4 text-xs">
            © {new Date().getFullYear()} Time Forwarding S.A. de C.V.
          </p>
        </div>
      </footer>
    </div>
  );
}
