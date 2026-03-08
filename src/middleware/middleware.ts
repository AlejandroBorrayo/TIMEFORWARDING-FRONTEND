// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/iniciar-sesion", // si no hay sesión, redirige acá
  },
});

export const config = {
  matcher: [
    // protege TODO excepto el login y assets públicos
    "/((?!iniciar-sesion|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
