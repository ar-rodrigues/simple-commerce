import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/SessionProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "Catálogo Pro",
  description:
    "Catálogo de productos con gestión vía CMS. Tu socio de confianza para productos de calidad y servicio excepcional",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Catálogo Pro",
    description:
      "Catálogo de productos con gestión vía CMS. Tu socio de confianza para productos de calidad y servicio excepcional",
    type: "website",
    images: [
      {
        url: "/logo.jpeg",
        width: 1200,
        height: 630,
        alt: "Catálogo Pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catálogo Pro",
    description:
      "Catálogo de productos con gestión vía CMS. Tu socio de confianza para productos de calidad y servicio excepcional",
    images: ["/logo.jpeg"],
  },
};

export const viewport = {
  themeColor: "#16a34a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ServiceWorkerRegistration />
          <AntdRegistry>{children}</AntdRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
