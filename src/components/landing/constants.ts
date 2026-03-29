/** Logo usado en la landing y páginas legales públicas. */
export const LANDING_LOGO_URL =
  "https://i.postimg.cc/MHnXrNG4/Captura-de-pantalla-2025-12-05-a-la(s)-3-46-29-p-m-(1).webp";

/** Logos del ecosistema Time Group (sección landing). */
export const TIME_WHEELS_LOGO_URL =
  "https://i.postimg.cc/qRX9HvNX/TIMEWHEELS.png";
export const TIME_TREK_LOGO_URL =
  "https://i.postimg.cc/wTD5g4HN/unnamed.jpg";

/** Teléfono con formato legible (landing, aviso de privacidad). */
export const CONTACT_PHONE_DISPLAY =
  process.env.NEXT_PUBLIC_CONTACT_PHONE_DISPLAY?.trim() ??
  "+52 55 2713 3107";

/** Mismo número sin espacios para enlaces `tel:`. */
export const CONTACT_PHONE_TEL =
  process.env.NEXT_PUBLIC_CONTACT_PHONE_TEL?.trim() ?? "+525527133107";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ??
  "mx.operaciones@timeforwarding.com.mx";
