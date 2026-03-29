import { AuthProvider } from "@/components/authProvider";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/cuenta/folios");
  }

  return (
    <AuthProvider session={session}>
      <div className="min-h-screen bg-gray-50 text-gray-900">{children}</div>
    </AuthProvider>
  );
}
