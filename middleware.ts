// middleware.ts (raíz del proyecto)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Rutas públicas (no requieren login)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health"
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return;   // deja pasar rutas públicas
  auth().protect();                 // protege el resto
});

export const config = {
  matcher: [
    // Ejecuta el middleware en todo salvo assets estáticos y _next
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
