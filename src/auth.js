import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

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
