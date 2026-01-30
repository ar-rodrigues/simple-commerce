"use client";
import { useEffect } from "react";
import { Layout, Button, Typography } from "antd";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiLogoutBoxRLine,
  RiLoginBoxLine,
  RiShoppingBagLine,
  RiImageLine,
} from "react-icons/ri";
import PageLoader from "@/components/PageLoader";

const { Header, Content } = Layout;
const { Title } = Typography;

const SIDEBAR_LINKS = [
  {
    href: "/admin/productos",
    label: "Gestión de Productos",
    icon: RiShoppingBagLine,
  },
  { href: "/admin/inicio", label: "Contenido del inicio", icon: RiImageLine },
];

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Force light background in admin so no black bar shows during loading (avoids body dark mode)
  useEffect(() => {
    document.body.classList.add("admin-panel-active");
    return () => document.body.classList.remove("admin-panel-active");
  }, []);

  if (status === "loading") {
    return <PageLoader message="Verificando sesión..." />;
  }

  return (
    <Layout className="admin-page min-h-screen bg-gray-50 flex flex-col">
      <Header
        className="admin-header shadow-lg sticky top-0 z-50 h-auto p-0"
        style={{ borderBottom: "none" }}
      >
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="text"
                icon={<RiArrowLeftLine style={{ color: "#ffffff" }} />}
                className="hover:bg-white/20 border-0"
                size="large"
                onClick={() => router.push("/")}
                style={{ color: "#ffffff" }}
              />
              <div className="flex items-center gap-3">
                <RiShoppingBagLine
                  className="text-white text-2xl"
                  style={{ color: "#ffffff", display: "block" }}
                />
                <Link href="/admin/productos" className="flex items-center">
                  <Title
                    level={3}
                    className="m-0! text-white font-bold hidden sm:block"
                    style={{ color: "#ffffff" }}
                  >
                    Panel de Administración
                  </Title>
                  <Title
                    level={3}
                    className="m-0! text-white font-bold sm:hidden"
                    style={{ color: "#ffffff" }}
                  >
                    Admin
                  </Title>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {session ? (
                <Button
                  onClick={() => signOut()}
                  icon={<RiLogoutBoxRLine style={{ color: "#ffffff" }} />}
                  className="bg-white/10 hover:bg-white/20 border-white/30 hover:border-white/50 transition-all admin-header-logout"
                  size="large"
                  style={{
                    color: "#ffffff",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <span
                    className="hidden sm:inline"
                    style={{ color: "#ffffff" }}
                  >
                    Salir
                  </span>
                </Button>
              ) : (
                <Button
                  onClick={() => signIn("google", { callbackUrl: "/admin" })}
                  type="default"
                  icon={<RiLoginBoxLine className="text-green-600" />}
                  className="bg-white text-green-600 hover:bg-green-50 border-0 shadow-md"
                  size="large"
                >
                  <span className="hidden sm:inline text-green-600">
                    Iniciar Sesión
                  </span>
                  <span className="sm:hidden text-green-600">Entrar</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Header>

      {!session ? (
        <Content className="flex-1 flex items-center justify-center p-4 md:p-8 min-h-[70vh]">
          <div className="max-w-2xl w-full bg-white p-12 rounded-xl shadow-lg text-center border border-gray-100">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <RiLoginBoxLine className="text-4xl text-green-600" />
              </div>
              <Title level={3} className="mb-4 text-gray-800">
                Acceso Restringido
              </Title>
              <p className="mb-6 text-gray-600">
                Debes iniciar sesión para acceder al panel de administración
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<RiLoginBoxLine />}
              onClick={() => signIn("google", { callbackUrl: "/admin" })}
              className="shadow-md hover:shadow-lg transition-all px-8 h-12 bg-green-600 hover:bg-green-700 border-0"
            >
              Iniciar Sesión con Google
            </Button>
          </div>
        </Content>
      ) : (
        <div className="flex flex-1 min-h-0 w-full overflow-hidden">
          <aside className="admin-sidebar hidden md:flex md:flex-col w-[260px] shrink-0 border-r border-gray-200 shadow-[4px_0_12px_rgba(0,0,0,0.03)] bg-white">
            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
              {SIDEBAR_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-green-600 text-white shadow-md shadow-green-200 scale-[1.02]"
                        : "text-green-700 hover:bg-green-100 bg-green-50/50"
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: "#16a34a", color: "#ffffff" }
                        : { backgroundColor: "#f0fdf4", color: "#15803d" }
                    }
                  >
                    <Icon
                      className={`text-xl shrink-0 ${
                        isActive ? "text-white" : "text-green-600"
                      }`}
                      style={
                        isActive ? { color: "#ffffff" } : { color: "#16a34a" }
                      }
                    />
                    <span
                      style={
                        isActive ? { color: "#ffffff" } : { color: "#15803d" }
                      }
                    >
                      {label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </aside>
          <Content className="flex-1 overflow-auto min-h-0 px-4 md:px-8 py-6 md:py-8 bg-gray-50 admin-content">
            {children}
          </Content>
        </div>
      )}
    </Layout>
  );
}
