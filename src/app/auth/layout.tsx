import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/authProvider";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import "../globals.css";

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
  if (session) {
    redirect("/cuenta/folios");
  }
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
        <AuthProvider session={session}>{children}</AuthProvider>
      </body>
    </html>
  );
}
