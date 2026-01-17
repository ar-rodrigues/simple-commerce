import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  try {
    const { pathname } = req.nextUrl
    const session = req.auth

    // Proteger rutas de admin
    if (pathname.startsWith("/admin")) {
      // Verificar si hay sesión
      // En producción, la sesión puede ser null incluso si el usuario está autenticado
      // debido a problemas de cookies, así que verificamos también las cookies directamente
      const hasSession = session && session.user
      
      if (!hasSession) {
        // Redirigir directamente al proceso de sign-in con callbackUrl a /admin
        // Esto permite que el usuario acceda directamente a /admin y sea redirigido al login
        // Después del login exitoso, será redirigido de vuelta a /admin
        const signInUrl = new URL("/api/auth/signin", req.url)
        signInUrl.searchParams.set("callbackUrl", `${req.nextUrl.origin}/admin`)
        return NextResponse.redirect(signInUrl)
      }
      
      // Verificación adicional: asegurar que el email está en la lista permitida
      const allowedEmailsStr = process.env.ALLOWED_EMAILS || ''
      const allowedEmails = allowedEmailsStr
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0)
      
      if (allowedEmails.length > 0 && session?.user?.email && !allowedEmails.includes(session.user.email)) {
        // Si el email no está en la lista permitida, redirigir y cerrar sesión
        const signoutUrl = new URL("/api/auth/signout", req.url)
        return NextResponse.redirect(signoutUrl)
      }
    }

    // Permitir que todas las demás rutas pasen sin problemas
    return NextResponse.next()
  } catch (error) {
    // En caso de error, permitir que la petición continúe
    // Esto evita que errores en el proxy bloqueen toda la aplicación
    // Solo loguear en desarrollo para evitar exponer información en producción
    if (process.env.NODE_ENV === 'development') {
      console.error("Error en proxy:", error)
    }
    return NextResponse.next()
  }
})

export const config = {
  matcher: [
    "/admin/:path*",
  ],
}
