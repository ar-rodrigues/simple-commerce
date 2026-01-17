'use client'
import { useState, useEffect } from 'react';
import { Layout, Table, Button, Modal, Form, Input, InputNumber, Space, Typography, message, Popconfirm, Image, Upload, Tabs, Spin, Tag, Row, Col, Tooltip } from 'antd';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RiAddLine, RiEditLine, RiDeleteBin7Line, RiArrowLeftLine, RiUploadCloud2Line, RiLink, RiLogoutBoxRLine, RiLoginBoxLine, RiWhatsappFill, RiShoppingBagLine, RiCheckboxCircleLine } from 'react-icons/ri';
import Link from 'next/link';
import useCatalog from '@/hooks/useCatalog';
import useAdminActions from '@/hooks/useAdminActions';
import PageLoader from '@/components/PageLoader';
import StatCard from '@/components/StatCard';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: items, loading: fetching, refetch } = useCatalog();
  const { addItem, updateItem, deleteItem, loading: actionLoading } = useAdminActions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState('upload'); // 'upload' or 'url'

  // Redirigir si no está autenticado
  // La verificación del email se hace en el middleware y auth.js
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Sincronizar el formulario cuando el modal se abre
  useEffect(() => {
    if (isModalOpen) {
      if (editingItem) {
        form.setFieldsValue(editingItem);
        setImageMode(editingItem.image ? 'url' : 'upload');
      } else {
        form.resetFields();
        form.setFieldsValue({ action: 'https://wa.me/522225230942', price: 0 });
        setImageMode('upload');
      }
    }
  }, [isModalOpen, editingItem, form]);

  const showModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // If it requires re-authentication, show a more helpful message
        if (data.requiresReauth || data.error?.includes('inicia sesión')) {
          message.error({
            content: data.error || 'Por favor, cierra sesión y vuelve a iniciar sesión para otorgar permisos de Google Drive.',
            duration: 8,
          });
        } else {
          throw new Error(data.error || 'Error al subir la imagen');
        }
        return false;
      }

      // Set the image URL in the form
      if (data.url) {
        // Use setFieldsValue to set the URL
        form.setFieldsValue({ image: data.url });
        // Also trigger form update to ensure the value is saved
        form.setFieldValue('image', data.url);
        // Force form validation to update preview
        await form.validateFields(['image']).catch(() => {});
        message.success('Imagen subida correctamente');
      } else {
        throw new Error('No se recibió la URL de la imagen');
      }
      return false; // Prevent default upload behavior - this stops Ant Design from processing the file
    } catch (error) {
      message.error(error.message || 'Error al subir la imagen');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUrlChange = (e) => {
    form.setFieldsValue({ image: e.target.value });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await updateItem({ ...values, rowIndex: editingItem.rowIndex });
        message.success('Ítem actualizado');
      } else {
        await addItem({ ...values, id: Date.now().toString() });
        message.success('Ítem creado');
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      message.error(error.message || 'Error en la operación');
    }
  };

  const handleDelete = async (rowIndex) => {
    try {
      await deleteItem(rowIndex);
      message.success('Ítem eliminado');
      refetch();
    } catch (error) {
      message.error(error.message || 'Error al eliminar');
    }
  };

  const columns = [
    { 
      title: <span className="font-semibold text-gray-700">Imagen</span>, 
      dataIndex: 'image', 
      key: 'image', 
      width: 100,
      responsive: ['md'],
      render: (text) => (
        <div className="py-2">
          <Image 
            src={text} 
            alt="Producto" 
            width={60} 
            height={60} 
            className="object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow" 
            fallback="https://via.placeholder.com/60" 
          />
        </div>
      ) 
    },
    { 
      title: <span className="font-semibold text-gray-700">Nombre</span>, 
      dataIndex: 'name', 
      key: 'name',
      ellipsis: true,
      render: (text) => (
        <span className="font-semibold text-gray-800 text-base">{text}</span>
      )
    },
    { 
      title: <span className="font-semibold text-gray-700">Precio</span>, 
      dataIndex: 'price', 
      key: 'price', 
      width: 120,
      responsive: ['sm'],
      render: (val) => (
        <span className="inline-block px-3 py-1 bg-green-50 text-green-600 font-bold rounded-full text-sm">
          MX${val}
        </span>
      ) 
    },
    { 
      title: <span className="font-semibold text-gray-700">Descripción</span>, 
      dataIndex: 'description', 
      key: 'description', 
      ellipsis: false,
      responsive: ['lg'],
      render: (text) => (
        <div className="text-gray-600 text-sm whitespace-normal wrap-break-word max-w-md">
          {text}
        </div>
      )
    },
    {
      title: <span className="font-semibold text-gray-700">WhatsApp</span>,
      dataIndex: 'action',
      key: 'action',
      width: 140,
      responsive: ['md'],
      render: (url) => url ? (
        <Tag icon={<RiWhatsappFill />} color="success" className="px-3 py-1 text-sm font-medium rounded-full">
          Configurado
        </Tag>
      ) : (
        <Tag color="default" className="px-3 py-1 text-sm rounded-full">Sin configurar</Tag>
      ),
    },
    {
      title: <span className="font-semibold text-gray-700">Acciones</span>,
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar">
            <Button 
              type="primary" 
              icon={<RiEditLine />} 
              onClick={() => showModal(record)}
              className="bg-green-600 hover:bg-green-700 transition-all flex items-center justify-center"
              shape="circle"
            />
          </Tooltip>
          <Popconfirm 
            title={
              <div className="max-w-xs">
                <p className="font-semibold text-gray-800 mb-1">¿Eliminar producto?</p>
                <p className="text-gray-600 text-sm">Esta acción no se puede deshacer</p>
              </div>
            }
            onConfirm={() => handleDelete(record.rowIndex)} 
            okText="Eliminar" 
            cancelText="Cancelar"
            okButtonProps={{ danger: true, className: "bg-red-600 hover:bg-red-700" }}
          >
            <Tooltip title="Eliminar">
              <Button 
                danger 
                icon={<RiDeleteBin7Line />}
                className="hover:bg-red-50 transition-all flex items-center justify-center"
                shape="circle"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Mostrar loading mientras se verifica la sesión
  if (status === 'loading') {
    return <PageLoader message="Verificando sesión..." />;
  }

  return (
    <Layout className="admin-page min-h-screen bg-gray-50">
      {/* Header with gradient */}
      <Header 
        className="admin-header shadow-lg sticky top-0 z-50 h-auto p-0"
        style={{ 
          borderBottom: 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                type="text" 
                icon={<RiArrowLeftLine className="text-white" />}
                className="hover:bg-white/20 border-0"
                size="large"
                onClick={() => router.push('/')}
              />
              <div className="flex items-center gap-3">
                <RiShoppingBagLine className="text-white text-2xl" style={{ color: '#ffffff', display: 'block' }} />
                <Link href="/" className="flex items-center">
                  <Title level={3} className="m-0! text-white font-bold hidden sm:block" style={{ color: '#ffffff' }}>
                    Panel de Administración
                  </Title>
                  <Title level={3} className="m-0! text-white font-bold sm:hidden" style={{ color: '#ffffff' }}>
                    Admin
                  </Title>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {session ? (
                <>
                  <Button 
                    type="default" 
                    icon={<RiAddLine className="text-green-600" />} 
                    onClick={() => showModal()}
                    className="bg-white text-green-600 hover:bg-green-50 border-0 shadow-md hover:shadow-lg transition-all"
                    size="large"
                  >
                    <span className="hidden md:inline text-green-600">Nuevo Producto</span>
                    <span className="md:hidden text-green-600">Nuevo</span>
                  </Button>
                  <Button 
                    onClick={() => signOut()} 
                    icon={<RiLogoutBoxRLine />}
                    className="bg-white/10 text-white hover:bg-white/20 border-white/30 hover:border-white/50 transition-all"
                    size="large"
                  >
                    <span className="hidden sm:inline">Salir</span>
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => signIn('google', { callbackUrl: '/admin' })} 
                  type="default" 
                  icon={<RiLoginBoxLine className="text-green-600" />}
                  className="bg-white text-green-600 hover:bg-green-50 border-0 shadow-md"
                  size="large"
                >
                  <span className="hidden sm:inline text-green-600">Iniciar Sesión</span>
                  <span className="sm:hidden text-green-600">Entrar</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Header>

      <Content className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {!session ? (
          <div className="max-w-2xl mx-auto bg-white p-12 rounded-xl shadow-lg text-center border border-gray-100">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <RiLoginBoxLine className="text-4xl text-green-600" />
              </div>
              <Title level={3} className="mb-4 text-gray-800">Acceso Restringido</Title>
              <Text type="secondary" className="mb-6 block text-gray-600">
                Debes iniciar sesión para acceder al panel de administración
              </Text>
            </div>
            <Button 
              type="primary" 
              size="large" 
              icon={<RiLoginBoxLine />} 
              onClick={() => signIn('google', { callbackUrl: '/admin' })}
              className="shadow-md hover:shadow-lg transition-all px-8 h-12"
              style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', color: '#ffffff' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#15803d'; e.currentTarget.style.borderColor = '#15803d'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#16a34a'; e.currentTarget.style.borderColor = '#16a34a'; }}
            >
              Iniciar Sesión con Google
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Statistics Section */}
            <section className="mb-8">
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12}>
                  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text type="secondary" className="text-sm">Total de Productos</Text>
                        <div className="text-3xl font-bold text-green-600 mt-2">
                          {items?.length || 0}
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                        <RiShoppingBagLine className="text-2xl text-green-600" />
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text type="secondary" className="text-sm">Con WhatsApp</Text>
                        <div className="text-3xl font-bold text-green-600 mt-2">
                          {items?.filter(item => item.action).length || 0}
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                        <RiCheckboxCircleLine className="text-2xl text-green-600" />
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </section>

            {/* Products Section */}
            <section>
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-linear-to-r from-green-600 to-green-700 px-6 py-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <RiShoppingBagLine className="text-white text-xl" />
                      </div>
                      <div>
                        <Title level={4} className="m-0! text-white font-semibold">
                          Gestión de Productos
                        </Title>
                        <Text className="text-white/80 text-sm">
                          Administra tu catálogo de productos
                        </Text>
                      </div>
                    </div>
                    <Button 
                      type="default" 
                      icon={<RiAddLine className="text-green-600" />} 
                      onClick={() => showModal()}
                      className="bg-white text-green-600 hover:bg-green-50 border-0 shadow-md hover:shadow-lg transition-all sm:hidden"
                      size="large"
                    >
                      <span className="text-green-600">Nuevo Producto</span>
                    </Button>
                  </div>
                </div>
                <div className="p-6 overflow-x-auto">
                  <Table
                    columns={columns}
                    dataSource={items}
                    loading={fetching}
                    rowKey={(record) => record.rowIndex}
                    pagination={{ 
                      pageSize: 10,
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '20', '50'],
                      showTotal: (total) => (
                        <span className="text-gray-600 font-medium">
                          Total: <span className="text-green-600">{total}</span> productos
                        </span>
                      ),
                      className: "mt-6",
                      responsive: true,
                      showQuickJumper: true,
                    }}
                    scroll={{ x: 'max-content' }}
                    className="admin-table"
                    size="middle"
                  />
                </div>
              </div>
            </section>
          </div>
        )}
      </Content>

      <Modal
        title={
          <>
            <div className="bg-linear-to-r from-green-600 to-green-700 -mx-6 -mt-5 px-6 py-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  {editingItem ? <RiEditLine className="text-white text-2xl" /> : <RiAddLine className="text-white text-2xl" />}
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
                  </div>
                  <div className="text-sm text-white/80">
                    {editingItem ? 'Actualiza la información del producto' : 'Completa los datos para agregar un producto'}
                  </div>
                </div>
              </div>
            </div>
          </>
        }
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => {
          setIsModalOpen(false);
          setImageMode('upload');
          form.resetFields();
        }}
        confirmLoading={actionLoading}
        okText={
          <span className="font-medium">
            {editingItem ? '💾 Guardar Cambios' : '✨ Crear Producto'}
          </span>
        }
        cancelText="Cancelar"
        okButtonProps={{ 
          className: "border-0 shadow-md hover:shadow-lg transition-all h-10",
          size: "large",
          style: { backgroundColor: '#16a34a', borderColor: '#16a34a', color: '#ffffff' }
        }}
        cancelButtonProps={{ 
          size: "large",
          className: "h-10 hover:border-gray-400"
        }}
        width={750}
        className="admin-modal"
        destroyOnHidden
        forceRender
      >
        <Form 
          form={form} 
          layout="vertical" 
          initialValues={{ price: 0, action: 'https://wa.me/522225230942' }}
          preserve={false}
          className="pt-2"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item 
                name="name" 
                label={<span className="font-semibold text-gray-800 text-base">Nombre del Producto</span>} 
                rules={[{ required: true, message: 'El nombre es obligatorio' }]}
                className="mb-4"
              >
                <Input 
                  placeholder="Ej: Smartphone Samsung Galaxy S23" 
                  size="large"
                  className="rounded-xl border-gray-300 hover:border-green-400 focus:border-green-500"
                />
              </Form.Item>

              <Form.Item 
                name="price" 
                label={<span className="font-semibold text-gray-800 text-base">Precio</span>} 
                rules={[{ required: true, message: 'El precio es obligatorio' }]}
                className="mb-4"
              >
                <InputNumber 
                  className="w-full rounded-xl" 
                  prefix="MX$" 
                  precision={2} 
                  size="large"
                  min={0}
                  controls={false}
                  placeholder="0.00"
                />
              </Form.Item>
            </div>

            <Form.Item 
              name="description" 
              label={<span className="font-semibold text-gray-800 text-base">Descripción</span>} 
              rules={[{ required: true, message: 'La descripción es obligatoria' }]}
              className="mb-4"
            >
              <Input.TextArea 
                placeholder="Describe las características principales del producto..." 
                rows={4}
                className="rounded-xl border-gray-300 hover:border-green-400 focus:border-green-500"
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item 
              name="action" 
              label={
                <span className="font-semibold text-gray-800 text-base flex items-center gap-2">
                  <RiWhatsappFill className="text-green-600 text-lg" />
                  Enlace de WhatsApp
                </span>
              }
              rules={[
                { required: true, message: 'El enlace es obligatorio' },
                { type: 'url', message: 'Debe ser una URL válida' }
              ]}
              tooltip="El enlace de WhatsApp donde los clientes pueden contactarte. El nombre del producto se agregará automáticamente al mensaje."
              className="mb-4"
            >
              <Input 
                placeholder="https://wa.me/522225230942" 
                size="large"
                className="rounded-xl border-gray-300 hover:border-green-400 focus:border-green-500"
                prefix={<RiWhatsappFill className="text-green-600 text-lg" />}
              />
            </Form.Item>

            <Form.Item 
              name="image" 
              label={<span className="font-semibold text-gray-800 text-base">Imagen del Producto</span>}
              rules={[{ required: true, message: 'La imagen es obligatoria' }]}
              getValueFromEvent={(e) => {
                if (typeof e === 'string') {
                  return e;
                }
                if (e?.target?.files) {
                  return form.getFieldValue('image') || '';
                }
                return form.getFieldValue('image') || '';
              }}
            >
              <div>
                <Tabs
                  activeKey={imageMode}
                  onChange={setImageMode}
                  className="modal-image-tabs"
                  items={[
                    {
                      key: 'upload',
                      label: (
                        <Space className="px-2">
                          <RiUploadCloud2Line className="text-lg" />
                          <span className="font-medium">Subir Archivo</span>
                        </Space>
                      ),
                      children: (
                        <div className="py-4">
                          <Upload
                            name="file"
                            listType="picture-card"
                            showUploadList={false}
                            beforeUpload={handleImageUpload}
                            accept="image/*"
                            disabled={uploading}
                            customRequest={() => {}}
                            className="upload-modern"
                          >
                            {uploading ? (
                              <div className="flex flex-col items-center justify-center p-4">
                                <Spin size="large" />
                                <div className="mt-3 text-sm font-medium text-gray-600">Subiendo imagen...</div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                  <RiUploadCloud2Line className="text-3xl text-green-600" />
                                </div>
                                <div className="text-base font-medium text-gray-800">Haz clic para subir</div>
                                <div className="text-sm text-gray-500 mt-1">o arrastra la imagen aquí</div>
                              </div>
                            )}
                          </Upload>
                          <div className="mt-3 px-1">
                            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <span className="font-semibold">Formatos:</span> JPEG, PNG, GIF, WebP • 
                              <span className="font-semibold"> Tamaño máximo:</span> 10MB
                            </div>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'url',
                      label: (
                        <Space className="px-2">
                          <RiLink className="text-lg" />
                          <span className="font-medium">URL de Imagen</span>
                        </Space>
                      ),
                      children: (
                        <div className="py-4">
                          <Input 
                            placeholder="https://ejemplo.com/mi-imagen.jpg" 
                            value={form.getFieldValue('image') || ''}
                            onChange={handleImageUrlChange}
                            size="large"
                            className="rounded-xl"
                            prefix={<RiLink className="text-gray-400" />}
                          />
                          <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-200">
                            Pega la URL completa de una imagen alojada en internet
                          </div>
                        </div>
                      ),
                    },
                  ]}
                />
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.image !== currentValues.image}>
                  {({ getFieldValue }) => {
                    const imageUrl = getFieldValue('image');
                    return imageUrl ? (
                      <div className="mt-6 p-4 bg-linear-to-br from-gray-50 to-green-50/30 rounded-xl border border-gray-200">
                        <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Vista previa de la imagen
                        </div>
                        <div className="bg-white rounded-lg p-2 shadow-sm">
                          <Image
                            src={imageUrl}
                            alt="Preview"
                            className="max-w-full rounded-lg"
                            style={{ maxHeight: '250px', objectFit: 'contain' }}
                            fallback="https://via.placeholder.com/250?text=Imagen+no+disponible"
                          />
                        </div>
                      </div>
                    ) : null;
                  }}
                </Form.Item>
              </div>
            </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
