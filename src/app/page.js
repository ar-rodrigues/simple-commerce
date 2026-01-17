'use client'
import { useState } from 'react';
import { Layout, Card, Col, Row, Alert, Typography, Divider, Button } from 'antd';
import Link from 'next/link';
import useCatalog from '@/hooks/useCatalog';
import FeatureCard from '@/components/FeatureCard';
import StatCard from '@/components/StatCard';
import Navbar from '@/components/Navbar';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import CarouselWithSkeleton from '@/components/CarouselWithSkeleton';
import ImageWithPlaceholder from '@/components/ImageWithPlaceholder';
import { 
  RiShieldCheckLine,
  RiTimeLine,
  RiCustomerService2Line,
  RiLightbulbFlashLine,
  RiWhatsappFill
} from 'react-icons/ri';

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function Home() {
  const { data: items, loading, error } = useCatalog();
  const [isHovering, setIsHovering] = useState(false);

  const features = [
    {
      icon: <RiShieldCheckLine />,
      title: 'Seguridad',
      description: 'Nuestro compromiso por ser una empresa responsable y confiable nos respalda'
    },
    {
      icon: <RiTimeLine />,
      title: 'Tiempo de Entrega',
      description: 'Comprometidos con cumplir en tiempo y forma con tu pedido'
    },
    {
      icon: <RiCustomerService2Line />,
      title: 'Servicio',
      description: 'Comprueba por ti mismo nuestro monitoreo y servicio durante y post venta'
    },
    {
      icon: <RiLightbulbFlashLine />,
      title: 'Propuesta',
      description: 'Contamos con propuesta e innovación difícil de superar'
    }
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-40 md:h-36"></div> {/* Spacer for fixed navbar with top padding */}

      <Content>
        {/* Hero Section with Carousel */}
        <section className="bg-gradient-to-br from-green-50 to-white">
          <CarouselWithSkeleton
            images={[
              {
                src: "https://boxfoodmexico.com/cdn/shop/files/bannercito_24_oct.jpg?v=1761343838",
                alt: "Banner promocional"
              },
              {
                src: "https://boxfoodmexico.com/cdn/shop/files/BANNER_1_JPG.jpg?v=1759991544",
                alt: "Banner promocional"
              },
              {
                src: "https://boxfoodmexico.com/cdn/shop/files/BANNER_1_v2.jpg?v=1760812941",
                alt: "Banner promocional"
              }
            ]}
            autoplay={true}
            autoplaySpeed={2000}
            onHoverChange={setIsHovering}
          />
        </section>

        {/* Why Choose Us Section */}
        <section id="nosotros" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <Title level={2} className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                ¿POR QUÉ ELEGIRNOS?
              </Title>
            </div>
            <Row gutter={[24, 24]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <FeatureCard {...feature} />
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-green-50">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <Row gutter={[32, 32]} justify="center">
              <Col xs={24} sm={8}>
                <StatCard value="+2,500" label="Pedidos Completados" />
              </Col>
              <Col xs={24} sm={8}>
                <StatCard value="98%" label="Satisfacción del Cliente" />
              </Col>
              <Col xs={24} sm={8}>
                <StatCard value="+3" label="Años de Experiencia" />
              </Col>
            </Row>
          </div>
        </section>

        {/* Products Catalog Section */}
        <section id="productos" className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <Title level={1} className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Explora nuestro Catálogo
              </Title>
              <Text className="text-lg text-gray-600 mb-6 block">
                Descubre nuestra amplia variedad de productos de calidad
              </Text>
            </div>

            {error && <Alert title="Error" description={error} type="error" showIcon className="mb-8" />}

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
                  const actionUrl = item.action || 'https://wa.me/522225230942';
                  const message = `¡Hola! Me interesa obtener más información sobre: *${item.name}*\n\n¿Podrían proporcionarme detalles adicionales y disponibilidad?`;
                  const encodedMessage = encodeURIComponent(message);
                  const actionLink = `${actionUrl}?text=${encodedMessage}`;
                  
                  return (
                    <Col xs={24} sm={12} md={8} lg={6} key={item.id || item.rowIndex}>
                      <Card
                        hoverable
                        cover={item.image ? (
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
                          <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">Sin imagen</div>
                        )}
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
                              style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', color: '#ffffff' }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#15803d'; e.currentTarget.style.borderColor = '#15803d'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#16a34a'; e.currentTarget.style.borderColor = '#16a34a'; }}
                            >
                              Contactar
                            </Button>
                          </a>
                        ]}
                      >
                        <Card.Meta
                          title={<span className="font-semibold text-gray-800 text-lg">{item.name}</span>}
                          description={
                            <div className="flex flex-col gap-3 mt-2">
                              <Paragraph type="secondary" ellipsis={{ rows: 2 }} className="mb-0! text-gray-600">
                                {item.description}
                              </Paragraph>
                              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <Text strong className="text-xl text-green-600 font-bold">
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
                      <Text type="secondary">No hay productos disponibles por ahora.</Text>
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
              <Title level={4} className="text-white mb-4">Catálogo Pro</Title>
              <Text className="text-white">
                Tu socio de confianza para productos de calidad y servicio excepcional
              </Text>
            </Col>
            <Col xs={24} md={8}>
              <Title level={5} className="text-white mb-4">Legal</Title>
              <div className="flex flex-col gap-2">
                <Link href="#" className="text-white hover:text-green-300 transition-colors">Aviso Legal</Link>
                <Link href="#" className="text-white hover:text-green-300 transition-colors">Política de Privacidad</Link>
                <Link href="#" className="text-white hover:text-green-300 transition-colors">Términos y Condiciones</Link>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <Title level={5} className="text-white mb-4">Contacto</Title>
              <div className="flex flex-col gap-2 text-white">
                <Text className="text-white">© 2026 Catálogo Pro</Text>
                <Text className="text-white">Todos los derechos reservados</Text>
              </div>
            </Col>
          </Row>
          <Divider className="bg-gray-500 my-8" />
          <div className="text-center text-white">
            <Text className="text-white">Copyright © 2026 Catálogo Pro. Todos los derechos reservados.</Text>
          </div>
        </div>
      </Footer>
    </Layout>
  );
}
