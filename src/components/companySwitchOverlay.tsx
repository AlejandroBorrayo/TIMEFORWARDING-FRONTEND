"use client";

import { ArrowLongRightIcon } from "@heroicons/react/24/solid";

export type CompanySwitchOverlayProps = {
  fromName: string;
  toName: string;
  fromLogoUrl: string | null;
  toLogoUrl: string | null;
};

function LogoTile({
  url,
  label,
}: {
  url: string | null;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/35 bg-white/10 p-3 shadow-lg sm:h-36 sm:w-36 md:h-40 md:w-40">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-center text-sm font-medium text-white/50">
            Sin logo
          </span>
        )}
      </div>
      <p className="max-w-[10rem] text-center text-base font-semibold leading-snug text-white sm:max-w-[12rem] sm:text-lg">
        {label}
      </p>
    </div>
  );
}

export default function CompanySwitchOverlay({
  fromName,
  toName,
  fromLogoUrl,
  toLogoUrl,
}: CompanySwitchOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-brand/96 px-4 py-10 text-center text-white backdrop-blur-md sm:px-8"
      role="alertdialog"
      aria-busy="true"
      aria-live="polite"
      aria-label="Cambio de empresa en curso"
    >
      <div
        className="mb-10 h-16 w-16 rounded-full border-4 border-white/25 border-t-white animate-spin sm:h-20 sm:w-20"
        aria-hidden
      />

      <p className="text-2xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        Cambiando de empresa
      </p>

      <div className="mt-10 flex w-full max-w-3xl flex-col items-center justify-center gap-8 sm:mt-12 sm:flex-row sm:gap-6 md:gap-10">
        <LogoTile url={fromLogoUrl} label={fromName} />
        <div className="flex shrink-0 items-center justify-center py-2 sm:py-0">
          <ArrowLongRightIcon
            className="h-14 w-14 text-white/90 sm:h-16 sm:w-16 md:h-20 md:w-20"
            aria-hidden
          />
        </div>
        <LogoTile url={toLogoUrl} label={toName} />
      </div>

      <p className="mt-10 max-w-xl text-lg leading-relaxed text-white/90 sm:mt-12 sm:text-xl md:text-2xl">
        Desde <span className="font-bold text-white">{fromName}</span> a{" "}
        <span className="font-bold text-white">{toName}</span>
      </p>

      <p className="mt-8 text-base text-white/65 sm:text-lg">
        Actualizando datos de la cuenta…
      </p>
    </div>
  );
}
