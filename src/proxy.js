import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  try {
    const { pathname } = req.nextUrl
    const session = req.auth

    // Proteger rutas de admin
    if (pathname.startsWith("/admin")) {
      if (!session) {
        // Redirigir a la página principal si no está autenticado
        return NextResponse.redirect(new URL("/", req.url))
      }
      
      // Verificación adicional: asegurar que el email está en la lista permitida
      const allowedEmailsStr = process.env.ALLOWED_EMAILS || ''
      const allowedEmails = allowedEmailsStr
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0)
      
      if (allowedEmails.length > 0 && !allowedEmails.includes(session?.user?.email)) {
        // Si el email no está en la lista permitida, redirigir y cerrar sesión
        return NextResponse.redirect(new URL("/api/auth/signout", req.url))
      }
    }

    // Permitir que todas las demás rutas pasen sin problemas
    return NextResponse.next()
  } catch (error) {
    // En caso de error, permitir que la petición continúe
    // Esto evita que errores en el proxy bloqueen toda la aplicación
    console.error("Error en proxy:", error)
    return NextResponse.next()
  }
})

export const config = {
  matcher: [
    "/admin/:path*",
  ],
}
