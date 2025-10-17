import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = [
  "/login",
  "/home",
  "/pricing",
  "/industrias",
  "/trial",
  "/prueba-gratis"
];

const dashboardRoutes = [
  "/dashboard",
  "/saas"
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  console.log("🔍 Middleware ejecutándose para:", pathname);

  // Intenta ambos nombres de cookie de Auth.js v5
  let token;
  try {
    token =
      (await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: "__Secure-authjs.session-token",
      })) ??
      (await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: "authjs.session-token",
      }));
  } catch (error) {
    console.error("❌ Error obteniendo token:", error);
    token = null;
  }

  console.log("🔑 TOKEN encontrado:", !!token, "Path:", pathname);


  let isPublicRoute = false;
  for (const route of publicRoutes) {
    isPublicRoute = pathname.startsWith(route);
    if (isPublicRoute) {
      break;
    }
  }

  console.log("🌐 Es ruta pública:", isPublicRoute);

  // Si no hay token y la ruta no es pública, redirige a '/home'
  if (!token && !isPublicRoute) {
    console.log("🚫 Sin token y ruta protegida - Redirigiendo a /home");
    const redirectUrl = new URL("/home", req.url);
    console.log("📍 URL de redirección:", redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  }

  // Protección de Dashboard

  // Verificar el type para rutas de dashboard
  if (token) {
    let isRoute = false;
    for (const dashboardRoute of dashboardRoutes) {
      isRoute = pathname.startsWith(dashboardRoute);
      if (isRoute) {
        const type = token.type;
        console.log("👤 Tipo de usuario:", type);

        if (type === "CUSTOMER") {
          console.log("🚫 Cliente intentando acceder a dashboard - Redirigiendo a /home");
          return NextResponse.redirect(new URL("/home", req.url));
        }
        break;
      }
    }
  }

  console.log("✅ Acceso permitido para:", pathname);
  // Si hay un token o la ruta es pública, continúa con la solicitud
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
