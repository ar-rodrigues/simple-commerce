"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Button,
  Collapse,
  Input,
  Space,
  Typography,
  message,
  Image,
  Upload,
  Select,
} from "antd";
import {
  RiImageLine,
  RiText,
  RiBarChartBoxLine,
  RiHeading,
  RiLayoutBottomLine,
  RiMenuLine,
  RiUploadCloud2Line,
} from "react-icons/ri";
import useHomeContent from "@/hooks/useHomeContent";
import { getIconOptions } from "@/lib/iconRegistry";
import Loading from "@/components/Loading";

const { Text } = Typography;

const COLLAPSE_STORAGE_KEY = "admin-inicio-collapse";
const VALID_PANEL_KEYS = [
  "carousel",
  "features",
  "stats",
  "sections",
  "footer",
  "navbar",
];

function getStoredActiveKey() {
  if (typeof window === "undefined") return "carousel";
  try {
    const raw = localStorage.getItem(COLLAPSE_STORAGE_KEY);
    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : [];
    const filtered = arr.filter((k) => VALID_PANEL_KEYS.includes(k));
    return filtered[0] || "carousel";
  } catch {
    return "carousel";
  }
}

function persistActiveKey(key) {
  try {
    localStorage.setItem(
      COLLAPSE_STORAGE_KEY,
      JSON.stringify(key ? [key] : [])
    );
  } catch {
    // ignore
  }
}

const emptyHomeContent = () => ({
  carousel: [
    { src: "", alt: "" },
    { src: "", alt: "" },
    { src: "", alt: "" },
  ],
  features: Array(4)
    .fill(null)
    .map(() => ({ icon: "RiShieldCheckLine", title: "", description: "" })),
  stats: [
    { value: "", label: "" },
    { value: "", label: "" },
    { value: "", label: "" },
  ],
  sections: {
    whyUsTitle: "",
    catalogTitle: "",
    catalogSubtitle: "",
    navBrand: "",
  },
  footer: {
    brand: "",
    tagline: "",
    avisoLegalLabel: "",
    avisoLegalUrl: "",
    politicaPrivacidadLabel: "",
    politicaPrivacidadUrl: "",
    terminosLabel: "",
    terminosUrl: "",
    copyright: "",
    copyrightLine: "",
  },
});

export default function AdminInicioPage() {
  const {
    data: homeData,
    loading: homeLoading,
    refetch: refetchHome,
  } = useHomeContent();
  // #region agent log
  fetch("http://127.0.0.1:7245/ingest/e2b57d71-ad74-49a4-be83-7acb96ee4d98", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "AdminInicioPage:103",
      message: "Home data status",
      data: { homeLoading, hasData: !!homeData },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "H3",
    }),
  }).catch(() => {});
  // #endregion
  const [homeEdit, setHomeEdit] = useState(emptyHomeContent);
  const [homeSaving, setHomeSaving] = useState(false);
  const [carouselUploading, setCarouselUploading] = useState(null);
  const [collapseActiveKey, setCollapseActiveKey] =
    useState(getStoredActiveKey);

  useEffect(() => {
    setCollapseActiveKey(getStoredActiveKey());
  }, []);

  useEffect(() => {
    if (!homeData) return;
    setHomeEdit({
      carousel: [
        ...(homeData.carousel?.slice(0, 3) ?? []),
        ...Array(3).fill({ src: "", alt: "" }),
      ]
        .slice(0, 3)
        .map((item) => ({ src: item.src || "", alt: item.alt || "" })),
      features: (homeData.features?.slice(0, 4) ?? [])
        .concat(
          Array(4)
            .fill(null)
            .map(() => ({
              icon: "RiShieldCheckLine",
              title: "",
              description: "",
            }))
        )
        .slice(0, 4),
      stats: (homeData.stats?.slice(0, 3) ?? [])
        .concat(
          Array(3)
            .fill(null)
            .map(() => ({ value: "", label: "" }))
        )
        .slice(0, 3),
      sections: { ...emptyHomeContent().sections, ...homeData.sections },
      footer: { ...emptyHomeContent().footer, ...homeData.footer },
    });
  }, [homeData]);

  const handleSaveHomeContent = async () => {
    // Validaciones mínimas
    for (let i = 0; i < homeEdit.features.length; i++) {
      const f = homeEdit.features[i];
      if (f.title && f.title.length < 3) {
        message.warning(
          `El título de la tarjeta ${i + 1} es muy corto (mín. 3 carac.)`
        );
        return;
      }
      if (f.description && f.description.length < 20) {
        message.warning(
          `La descripción de la tarjeta ${i + 1} es muy corta (mín. 20 carac.)`
        );
        return;
      }
    }

    setHomeSaving(true);
    try {
      const payload = {
        carousel: homeEdit.carousel,
        features: homeEdit.features,
        stats: homeEdit.stats,
        sections: homeEdit.sections,
        footer: homeEdit.footer,
      };
      const res = await fetch("/api/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      message.success("Contenido del inicio guardado correctamente");
      refetchHome();
    } catch (err) {
      message.error(err.message || "Error al guardar");
    } finally {
      setHomeSaving(false);
    }
  };

  const handleCarouselImageUpload = async (file, index) => {
    setCarouselUploading(index);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.requiresReauth || data.error?.includes("inicia sesión")) {
          message.error({
            content:
              data.error ||
              "Por favor, cierra sesión y vuelve a iniciar sesión para otorgar permisos de Google Drive.",
            duration: 8,
          });
        } else {
          throw new Error(data.error || "Error al subir");
        }
        return false;
      }
      if (data.url) {
        setHomeEdit((prev) => {
          const next = { ...prev, carousel: [...prev.carousel] };
          next.carousel[index] = { ...next.carousel[index], src: data.url };
          return next;
        });
        message.success("Imagen subida correctamente");
      }
      return false;
    } catch (err) {
      message.error(err.message || "Error al subir");
      return false;
    } finally {
      setCarouselUploading(null);
    }
  };

  const handleCollapseChange = (key) => {
    setCollapseActiveKey(key);
    persistActiveKey(key);
  };

  const iconOptions = useMemo(() => getIconOptions(), []);

  const collapseItems = [
    {
      key: "carousel",
      label: (
        <span className="flex items-center gap-2 font-semibold">
          <RiImageLine /> Carrusel (banners)
        </span>
      ),
      children: (
        <div className="grid gap-6">
          {homeEdit.carousel.map((slide, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <Text strong className="block mb-2">
                Slide {index + 1}
              </Text>
              <Space orientation="vertical" className="w-full" size="small">
                <Upload
                  beforeUpload={(file) =>
                    handleCarouselImageUpload(file, index)
                  }
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button
                    icon={<RiUploadCloud2Line />}
                    loading={carouselUploading === index}
                  >
                    Subir imagen
                  </Button>
                </Upload>
                <Input
                  placeholder="URL de imagen"
                  value={slide.src}
                  onChange={(e) =>
                    setHomeEdit((prev) => {
                      const n = {
                        ...prev,
                        carousel: [...prev.carousel],
                      };
                      n.carousel[index] = {
                        ...n.carousel[index],
                        src: e.target.value,
                      };
                      return n;
                    })
                  }
                />
                <Input
                  placeholder="Texto alternativo (alt)"
                  value={slide.alt}
                  onChange={(e) =>
                    setHomeEdit((prev) => {
                      const n = {
                        ...prev,
                        carousel: [...prev.carousel],
                      };
                      n.carousel[index] = {
                        ...n.carousel[index],
                        alt: e.target.value,
                      };
                      return n;
                    })
                  }
                />
                {slide.src && (
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    width={120}
                    height={60}
                    className="object-cover rounded"
                    fallback="https://via.placeholder.com/120x60"
                  />
                )}
              </Space>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "features",
      label: (
        <span className="flex items-center gap-2 font-semibold">
          <RiText /> Por qué elegirnos (4 tarjetas)
        </span>
      ),
      children: (
        <div className="grid gap-4">
          {homeEdit.features.map((f, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Select
                options={iconOptions}
                value={f.icon}
                onChange={(v) =>
                  setHomeEdit((prev) => {
                    const n = {
                      ...prev,
                      features: [...prev.features],
                    };
                    n.features[index] = {
                      ...n.features[index],
                      icon: v,
                    };
                    return n;
                  })
                }
                placeholder="Icono"
                className="w-full"
                optionLabelProp="label"
                showSearch
                optionFilterProp="searchLabel"
              />
              <Input
                placeholder="Título"
                value={f.title}
                onChange={(e) =>
                  setHomeEdit((prev) => {
                    const n = {
                      ...prev,
                      features: [...prev.features],
                    };
                    n.features[index] = {
                      ...n.features[index],
                      title: e.target.value,
                    };
                    return n;
                  })
                }
              />
              <Input.TextArea
                placeholder="Descripción"
                value={f.description}
                onChange={(e) =>
                  setHomeEdit((prev) => {
                    const n = {
                      ...prev,
                      features: [...prev.features],
                    };
                    n.features[index] = {
                      ...n.features[index],
                      description: e.target.value,
                    };
                    return n;
                  })
                }
                rows={2}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "stats",
      label: (
        <span className="flex items-center gap-2 font-semibold">
          <RiBarChartBoxLine /> Estadísticas (3 tarjetas)
        </span>
      ),
      children: (
        <div className="grid gap-4">
          {homeEdit.stats.map((s, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg flex flex-wrap gap-4"
            >
              <Input
                placeholder="Valor (ej. +2,500)"
                value={s.value}
                maxLength={10}
                showCount
                onChange={(e) =>
                  setHomeEdit((prev) => {
                    const n = { ...prev, stats: [...prev.stats] };
                    n.stats[index] = {
                      ...n.stats[index],
                      value: e.target.value,
                    };
                    return n;
                  })
                }
                style={{ width: 160 }}
              />
              <Input
                placeholder="Etiqueta"
                value={s.label}
                maxLength={30}
                showCount
                onChange={(e) =>
                  setHomeEdit((prev) => {
                    const n = { ...prev, stats: [...prev.stats] };
                    n.stats[index] = {
                      ...n.stats[index],
                      label: e.target.value,
                    };
                    return n;
                  })
                }
                style={{ flex: 1, minWidth: 200 }}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "sections",
      label: (
        <span className="flex items-center gap-2 font-semibold">
          <RiHeading /> Títulos de secciones
        </span>
      ),
      children: (
        <div className="grid gap-4 max-w-xl">
          <Input
            placeholder="Título ¿Por qué elegirnos?"
            value={homeEdit.sections.whyUsTitle}
            onChange={(e) =>
              setHomeEdit((prev) => ({
                ...prev,
                sections: {
                  ...prev.sections,
                  whyUsTitle: e.target.value,
                },
              }))
            }
          />
          <Input
            placeholder="Título del catálogo"
            value={homeEdit.sections.catalogTitle}
            onChange={(e) =>
              setHomeEdit((prev) => ({
                ...prev,
                sections: {
                  ...prev.sections,
                  catalogTitle: e.target.value,
                },
              }))
            }
          />
          <Input
            placeholder="Subtítulo del catálogo"
            value={homeEdit.sections.catalogSubtitle}
            onChange={(e) =>
              setHomeEdit((prev) => ({
                ...prev,
                sections: {
                  ...prev.sections,
                  catalogSubtitle: e.target.value,
                },
              }))
            }
          />
        </div>
      ),
    },
    {
      key: "footer",
      label: (
        <span className="flex items-center gap-2 font-semibold">
          <RiLayoutBottomLine /> Footer
        </span>
      ),
      children: (
        <div className="grid gap-4 max-w-2xl">
          <Input
            placeholder="Marca (footer)"
            value={homeEdit.footer.brand}
            onChange={(e) =>
              setHomeEdit((prev) => ({
                ...prev,
                footer: { ...prev.footer, brand: e.target.value },
              }))
            }
          />
          <Input.TextArea
            placeholder="Frase / tagline"
            value={homeEdit.footer.tagline}
            onChange={(e) =>
              setHomeEdit((prev) => ({
                ...prev,
                footer: { ...prev.footer, tagline: e.target.value },
              }))
            }
            rows={2}
          />
          <Input
            placeholder="Aviso Legal (etiqueta)"
            value={homeEdit.footer.avisoLegalLabel}
            onChange={(e) =>
              setHomeEdit((prev) => ({
                ...prev,
                footer: {
                  ...prev.footer,
                  avisoLegalLabel: e.target.value,
                },
              }))
            }
          />
          <Input
            placeholder="Aviso Legal (URL)"
            value={homeEdit.footer.avisoLegalUrl}
            onChange={(e) =>
              setHomeEdit((prev) => ({
                ...prev,
                footer: {
                  ...prev.footer,
                  avisoLegalUrl: e.target.value,
                },
              }))
            }
          />
          <Input
            placeholder="Política de Privacidad (etiqueta)"
            value={homeEdit.footer.politicaPrivacidadLabel}
            onChange={(e) =>
              setHomeEdit((prev) => ({
                ...prev,
                footer: {
                  ...prev.footer,
                  politicaPrivacidadLabel: e.target.value,
                },
              }))
            }
          />
          <Input
            placeholder="Política de Privacidad (URL)"
            value={homeEdit.footer.politicaPrivacidadUrl}
            onChange={(e) =>
              setHomeEdit((prev) => ({
                ...prev,
                footer: {
                  ...prev.footer,
                  politicaPrivacidadUrl: e.target.value,
                },
              }))
            }
          />
          <Input
            placeholder="Términos (etiqueta)"
            value={homeEdit.footer.terminosLabel}
            onChange={(e) =>
              setHomeEdit((prev) => ({
                ...prev,
                footer: {
                  ...prev.footer,
                  terminosLabel: e.target.value,
                },
              }))
            }
          />
          <Input
            placeholder="Términos (URL)"
            value={homeEdit.footer.terminosUrl}
            onChange={(e) =>
              setHomeEdit((prev) => ({
                ...prev,
                footer: {
                  ...prev.footer,
                  terminosUrl: e.target.value,
                },
              }))
            }
          />
          <Input
            placeholder="Copyright"
            value={homeEdit.footer.copyright}
            onChange={(e) =>
              setHomeEdit((prev) => ({
                ...prev,
                footer: {
                  ...prev.footer,
                  copyright: e.target.value,
                },
              }))
            }
          />
          <Input
            placeholder="Línea de copyright completa"
            value={homeEdit.footer.copyrightLine}
            onChange={(e) =>
              setHomeEdit((prev) => ({
                ...prev,
                footer: {
                  ...prev.footer,
                  copyrightLine: e.target.value,
                },
              }))
            }
          />
        </div>
      ),
    },
    {
      key: "navbar",
      label: (
        <span className="flex items-center gap-2 font-semibold">
          <RiMenuLine /> Navbar
        </span>
      ),
      children: (
        <div className="max-w-xl">
          <Input
            placeholder="Nombre del sitio en la barra de navegación"
            value={homeEdit.sections.navBrand}
            onChange={(e) =>
              setHomeEdit((prev) => ({
                ...prev,
                sections: {
                  ...prev.sections,
                  navBrand: e.target.value,
                },
              }))
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-800 m-0">
          Contenido del inicio
        </h2>
        <Button
          type="primary"
          loading={homeSaving}
          onClick={handleSaveHomeContent}
          className="bg-green-600 hover:bg-green-700"
          size="large"
        >
          Guardar cambios
        </Button>
      </div>

      {homeLoading ? (
        <Loading message="Cargando contenido..." size="large" />
      ) : (
        <Collapse
          accordion
          activeKey={collapseActiveKey}
          onChange={handleCollapseChange}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden admin-inicio-collapse"
          items={collapseItems}
        />
      )}
    </div>
  );
}
