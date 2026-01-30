import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

const FIVE_MINUTES_MS = 5 * 60 * 1000

/**
 * Refreshes the Google OAuth access token using the refresh token.
 * @param {string} refreshToken - Google OAuth refresh token
 * @returns {Promise<{ access_token: string, expires_in: number }>}
 */
async function refreshGoogleToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: process.env.AUTH_GOOGLE_ID ?? "",
    client_secret: process.env.AUTH_GOOGLE_SECRET ?? "",
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  })
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })
  const data = await res.json()
  if (!res.ok) {
    console.error("[Auth] Google token refresh failed:", data.error_description ?? data)
    throw new Error(data.error_description ?? "Failed to refresh token")
  }
  return { access_token: data.access_token, expires_in: data.expires_in ?? 3600 }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Configurar la URL base para Vercel
  trustHost: true,
  // Asegurar que el secret esté configurado
  secret: process.env.AUTH_SECRET,
  // Configurar cookies para producción
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/drive.file",
        },
      },
      // Ensure we request the drive scope
      checks: ["pkce"],
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Obtener lista de emails permitidos desde variable de entorno
      const allowedEmailsStr = process.env.ALLOWED_EMAILS || ''
      const allowedEmails = allowedEmailsStr
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0)
      
      // Si no hay emails configurados, bloquear todo
      if (allowedEmails.length === 0) {
        return false
      }
      
      // Verificar si el email del usuario está en la lista permitida
      if (user?.email && allowedEmails.includes(user.email)) {
        return true
      }
      
      // Bloquear cualquier otro email
      return false
    },
    async redirect({ url, baseUrl }) {
      // No redirigir si es una ruta de API o signout
      if (url.startsWith('/api/auth/signout') || url.startsWith(`${baseUrl}/api/auth/signout`)) {
        return url
      }
      
      // Si la URL es relativa y apunta a /admin, construir la URL completa
      if (url.startsWith('/admin')) {
        return `${baseUrl}${url}`
      }
      
      // Si la URL ya es una URL completa, usarla directamente
      if (url.startsWith('http')) {
        return url
      }
      
      // Si viene un callbackUrl (por ejemplo, desde el proxy), respetarlo
      // Si no, redirigir a admin por defecto
      if (url && url !== baseUrl && !url.startsWith('/')) {
        // Es una URL relativa que no empieza con /
        return `${baseUrl}/${url}`
      }
      
      // Por defecto, redirigir a admin
      return `${baseUrl}/admin`
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        const isDevTestRefresh =
          process.env.NODE_ENV === "development" && process.env.TEST_TOKEN_REFRESH === "1"
        if (isDevTestRefresh) {
          token.expiresAt = Date.now() + 60 * 1000
        } else if (account.expires_at) {
          token.expiresAt = account.expires_at * 1000
        } else {
          token.expiresAt = Date.now() + (account.expires_in ?? 3600) * 1000
        }
        return token
      }

      const isExpiredOrMissing =
        token.expiresAt == null || token.expiresAt < Date.now() + FIVE_MINUTES_MS
      if (token.refreshToken && isExpiredOrMissing) {
        try {
          const refreshed = await refreshGoogleToken(token.refreshToken)
          token.accessToken = refreshed.access_token
          token.expiresAt = Date.now() + (refreshed.expires_in ?? 3600) * 1000
          if (process.env.NODE_ENV === "development") {
            console.log("[Auth] Google access token refreshed")
          }
        } catch (err) {
          // Leave token unchanged; next Drive call will 401 and user must sign in again
        }
      }

      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      return session
    },
  },
})
