import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "@/components/clientLayout";
import "../globals.css";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/authProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/iniciar-sesion");
  }

  // Traemos los datos del usuario usando su ID de la sesión
  /*  const user = await getUser(session?.user?.sub as string); */

  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Timetrek - aplicación de envíos y logística"
        />
        <link rel="icon" href="/favicon.ico" />
        <title>Timetrek couriers</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-gray-50 text-gray-900`}
      >
        <AuthProvider session={session}>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
