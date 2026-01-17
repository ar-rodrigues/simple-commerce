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
      // Después de iniciar sesión exitosamente, siempre redirigir al panel de admin
      // No redirigir si es una ruta de API o signout
      if (url.startsWith('/api/auth/signout') || url.startsWith(`${baseUrl}/api/auth/signout`)) {
        return url
      }
      // Si la URL ya es una URL completa y apunta a admin, usarla
      if (url.startsWith('http') && url.includes('/admin')) {
        return url
      }
      // Redirigir a admin después de cualquier inicio de sesión exitoso
      // Usar baseUrl para asegurar la URL correcta en producción
      const adminUrl = url.startsWith('/admin') ? url : '/admin'
      return `${baseUrl}${adminUrl.startsWith('/') ? '' : '/'}${adminUrl}`
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
