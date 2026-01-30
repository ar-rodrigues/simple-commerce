"use client";
import { useState, useMemo } from "react";
import {
  Layout,
  Card,
  Col,
  Row,
  Alert,
  Typography,
  Divider,
  Button,
} from "antd";
import Link from "next/link";
import useCatalog from "@/hooks/useCatalog";
import useHomeContent from "@/hooks/useHomeContent";
import FeatureCard from "@/components/FeatureCard";
import StatCard from "@/components/StatCard";
import Navbar from "@/components/Navbar";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import CarouselWithSkeleton from "@/components/CarouselWithSkeleton";
import ImageWithPlaceholder from "@/components/ImageWithPlaceholder";
import { getIconComponent } from "@/lib/iconRegistry";
import { RiWhatsappFill } from "react-icons/ri";

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const DEFAULT_CAROUSEL = [
  {
    src: "/Banner1_Azura.png",
    alt: "Banner promocional de Azura Beauty & Nails",
  },
  {
    src: "/Banner2_Azura.png",
    alt: "Banner promocional: Cuidado de Profesionales",
  },
  { src: "/Banner3_Azura.png", alt: "Banner promocional: Cuidado de Manos" },
];

const DEFAULT_FEATURES = [
  {
    icon: "RiShieldCheckLine",
    title: "Seguridad",
    description:
      "Nuestro compromiso por ser una empresa responsable y confiable nos respalda",
  },
  {
    icon: "RiTimeLine",
    title: "Tiempo de Entrega",
    description: "Comprometidos con cumplir en tiempo y forma con tu pedido",
  },
  {
    icon: "RiCustomerService2Line",
    title: "Servicio",
    description:
      "Comprueba por ti mismo nuestro monitoreo y servicio durante y post venta",
  },
  {
    icon: "RiLightbulbFlashLine",
    title: "Propuesta",
    description: "Contamos con propuesta e innovación difícil de superar",
  },
];

const DEFAULT_STATS = [
  { value: "+2,500", label: "Pedidos Completados" },
  { value: "98%", label: "Satisfacción del Cliente" },
  { value: "+3", label: "Años de Experiencia" },
];

export default function Home() {
  const { data: items, loading, error } = useCatalog();
  const { data: homeData, loading: homeLoading } = useHomeContent();
  const [isHovering, setIsHovering] = useState(false);

  const carouselImages = useMemo(() => {
    const list = homeData?.carousel?.length
      ? homeData.carousel
      : DEFAULT_CAROUSEL;
    return list.slice(0, 3);
  }, [homeData?.carousel]);

  const features = useMemo(() => {
    const list = homeData?.features?.length
      ? homeData.features
      : DEFAULT_FEATURES;
    return list.slice(0, 4).map((f) => {
      const Icon = getIconComponent(f.icon);
      return {
        icon: <Icon />,
        title: f.title || "",
        description: f.description || "",
      };
    });
  }, [homeData?.features]);

  const stats = useMemo(() => {
    const list = homeData?.stats?.length ? homeData.stats : DEFAULT_STATS;
    return list.slice(0, 3);
  }, [homeData?.stats]);

  const sections = homeData?.sections ?? {};
  const footer = homeData?.footer ?? {};
  const whyUsTitle = sections.whyUsTitle ?? "¿POR QUÉ ELEGIRNOS?";
  const catalogTitle = sections.catalogTitle ?? "Explora nuestro Catálogo";
  const catalogSubtitle =
    sections.catalogSubtitle ??
    "Descubre nuestra amplia variedad de productos de calidad";
  const navBrand = sections.navBrand ?? "Catálogo Pro";

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar brandName={navBrand} />
      <div className="h-40 md:h-36"></div>{" "}
      {/* Spacer for fixed navbar with top padding */}
      <Content>
        {/* Hero Section with Carousel */}
        <section className="bg-linear-to-br from-green-50 to-white">
          <CarouselWithSkeleton
            images={carouselImages}
            autoplay={true}
            autoplaySpeed={2000}
            onHoverChange={setIsHovering}
          />
        </section>

        {/* Why Choose Us Section */}
        <section id="nosotros" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <Title
                level={2}
                className="text-3xl md:text-4xl font-bold text-gray-800 mb-2"
              >
                {whyUsTitle}
              </Title>
            </div>
            <Row gutter={[24, 24]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <FeatureCard {...feature} delay={index * 80} />
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Statistics Section */}
        <section id="estadisticas" className="py-16 bg-green-50">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <Row gutter={[32, 32]} justify="center">
              {stats.map((stat, index) => (
                <Col xs={24} sm={8} key={index}>
                  <StatCard
                    value={stat.value}
                    label={stat.label}
                    delay={index * 100}
                  />
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Products Catalog Section */}
        <section id="productos" className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <Title
                level={1}
                className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
              >
                {catalogTitle}
              </Title>
              <Text className="text-lg text-gray-600 mb-6 block">
                {catalogSubtitle}
              </Text>
            </div>

            {error && (
              <Alert
                title="Error"
                description={error}
                type="error"
                showIcon
                className="mb-8"
              />
            )}

            {loading ? (
              <Row gutter={[24, 24]}>
                {[...Array(8)].map((_, index) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={index}>
                    <ProductCardSkeleton />
                  </Col>
                ))}
              </Row>
            ) : (
              <Row gutter={[24, 24]}>
                {items.map((item) => {
                  const actionUrl = item.action || "https://wa.me/522225230942";
                  const message = `¡Hola! Me interesa obtener más información sobre: *${item.name}*\n\n¿Podrían proporcionarme detalles adicionales y disponibilidad?`;
                  const encodedMessage = encodeURIComponent(message);
                  const actionLink = `${actionUrl}?text=${encodedMessage}`;

                  return (
                    <Col
                      xs={24}
                      sm={12}
                      md={8}
                      lg={6}
                      key={item.id || item.rowIndex}
                    >
                      <Card
                        hoverable
                        cover={
                          item.image ? (
                            <div className="h-48 relative overflow-hidden group">
                              <ImageWithPlaceholder
                                alt={item.name}
                                src={item.image}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                placeholderClassName="h-48"
                              />
                            </div>
                          ) : (
                            <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                              Sin imagen
                            </div>
                          )
                        }
                        className="h-full flex flex-col shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 rounded-lg overflow-hidden"
                        actions={[
                          <a
                            key="action"
                            href={actionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="flex items-center justify-center h-full w-full px-4 py-3"
                          >
                            <Button
                              type="primary"
                              icon={<RiWhatsappFill />}
                              className="w-full shadow-md hover:shadow-lg transition-all px-6"
                              size="large"
                              style={{
                                backgroundColor: "#16a34a",
                                borderColor: "#16a34a",
                                color: "#ffffff",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#15803d";
                                e.currentTarget.style.borderColor = "#15803d";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#16a34a";
                                e.currentTarget.style.borderColor = "#16a34a";
                              }}
                            >
                              Contactar
                            </Button>
                          </a>,
                        ]}
                      >
                        <Card.Meta
                          title={
                            <span className="font-semibold text-gray-800 text-lg">
                              {item.name}
                            </span>
                          }
                          description={
                            <div className="flex flex-col gap-3 mt-2 grow">
                              <Paragraph
                                type="secondary"
                                ellipsis={{ rows: 2 }}
                                className="mb-0! text-gray-600 min-h-12"
                              >
                                {item.description}
                              </Paragraph>
                              <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
                                <Text
                                  strong
                                  className="text-xl text-green-600 font-bold"
                                >
                                  MX${item.price}
                                </Text>
                              </div>
                            </div>
                          }
                        />
                      </Card>
                    </Col>
                  );
                })}
                {items.length === 0 && (
                  <Col span={24}>
                    <div className="text-center p-12 bg-white rounded-lg border border-dashed">
                      <Text type="secondary">
                        No hay productos disponibles por ahora.
                      </Text>
                    </div>
                  </Col>
                )}
              </Row>
            )}
          </div>
        </section>
      </Content>
      <Footer id="contacto" className="bg-gray-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Title level={4} className="text-white mb-4">
                {footer.brand ?? "Catálogo Pro"}
              </Title>
              <Text className="text-white">
                {footer.tagline ??
                  "Tu socio de confianza para productos de calidad y servicio excepcional"}
              </Text>
            </Col>
            <Col xs={24} md={8}>
              <Title level={5} className="text-white mb-4">
                Legal
              </Title>
              <div className="flex flex-col gap-2">
                <Link
                  href={footer.avisoLegalUrl ?? "#"}
                  className="text-white hover:text-green-300 transition-colors"
                >
                  {footer.avisoLegalLabel ?? "Aviso Legal"}
                </Link>
                <Link
                  href={footer.politicaPrivacidadUrl ?? "#"}
                  className="text-white hover:text-green-300 transition-colors"
                >
                  {footer.politicaPrivacidadLabel ?? "Política de Privacidad"}
                </Link>
                <Link
                  href={footer.terminosUrl ?? "#"}
                  className="text-white hover:text-green-300 transition-colors"
                >
                  {footer.terminosLabel ?? "Términos y Condiciones"}
                </Link>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <Title level={5} className="text-white mb-4">
                Contacto
              </Title>
              <div className="flex flex-col gap-2 text-white">
                <Text className="text-white">
                  {footer.copyright ?? "© 2026 Catálogo Pro"}
                </Text>
                <Text className="text-white">
                  Todos los derechos reservados
                </Text>
              </div>
            </Col>
          </Row>
          <Divider className="bg-gray-500 my-8" />
          <div className="text-center text-white">
            <Text className="text-white">
              {footer.copyrightLine ??
                "Copyright © 2026 Catálogo Pro. Todos los derechos reservados."}
            </Text>
          </div>
        </div>
      </Footer>
    </Layout>
  );
}
