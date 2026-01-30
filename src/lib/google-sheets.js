import { google } from "googleapis";
import { normalizeDriveImageUrl } from "./google-drive";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

async function getAuthClient() {
  // Handle private key with escaped newlines (\n) or actual newlines
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  )?.trim();

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });
  return auth;
}

export async function getItems() {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Catalogo!A:F", // Updated to include whatsappAction column
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    const headers = rows[0];
    return rows.slice(1).map((row, index) => {
      const item = {};
      headers.forEach((header, i) => {
        item[header] = row[i];
      });
      item.rowIndex = index + 2; // 1-based, skipping header

      // Normalize Google Drive image URLs for reliable display
      if (item.image) {
        item.image = normalizeDriveImageUrl(item.image);
      }

      // Set default action if not provided
      if (!item.action) {
        item.action = "https://wa.me/522225230942";
      }

      return item;
    });
  } catch (error) {
    console.error("Error fetching sheets data:", error);
    throw error;
  }
}

export async function addItem(item) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });
    const action = item.action || "https://wa.me/522225230942";
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Catalogo!A:F", // Updated to include action column
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            item.id,
            item.name,
            item.description,
            item.price,
            item.image,
            action,
          ],
        ],
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding item:", error);
    throw error;
  }
}

export async function updateItem(rowIndex, item) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });
    const action = item.action || "https://wa.me/522225230942";
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `Catalogo!A${rowIndex}:F${rowIndex}`, // Updated to include action column
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            item.id,
            item.name,
            item.description,
            item.price,
            item.image,
            action,
          ],
        ],
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
}

export async function deleteItem(rowIndex) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    // First, get the sheet ID to ensure we're deleting from the correct sheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
    });

    // Find the sheet named 'Catalogo' or use the first sheet
    const catalogSheet =
      spreadsheet.data.sheets.find(
        (sheet) => sheet.properties.title === "Catalogo"
      ) || spreadsheet.data.sheets[0];

    const sheetId = catalogSheet.properties.sheetId;

    // Delete the row (rowIndex is 1-based, but deleteDimension uses 0-based)
    // rowIndex 2 = row 2 in Sheets = index 1 in 0-based
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: rowIndex - 1, // Convert 1-based to 0-based
                endIndex: rowIndex, // Exclusive end index
              },
            },
          },
        ],
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
}

// --- Home content (sheet "Inicio") ---
// Ranges: Carousel A1:B4, Features A6:D10, Stats A12:C15, Sections/Footer key-value A17:B35

const HOME_SHEET = "Inicio";
const HOME_KEYS_ORDER = [
  "whyUsTitle",
  "catalogTitle",
  "catalogSubtitle",
  "navBrand",
  "footerBrand",
  "footerTagline",
  "avisoLegalLabel",
  "avisoLegalUrl",
  "politicaPrivacidadLabel",
  "politicaPrivacidadUrl",
  "terminosLabel",
  "terminosUrl",
  "copyright",
  "copyrightLine",
];

function defaultHomeContent() {
  return {
    carousel: [
      {
        src: "/Banner1_Azura.png",
        alt: "Banner promocional de Azura Beauty & Nails",
      },
      {
        src: "/Banner2_Azura.png",
        alt: "Banner promocional: Cuidado de Profesionales",
      },
      {
        src: "/Banner3_Azura.png",
        alt: "Banner promocional: Cuidado de Manos",
      },
    ],
    features: [
      {
        icon: "RiShieldCheckLine",
        title: "Seguridad",
        description:
          "Nuestro compromiso por ser una empresa responsable y confiable nos respalda",
      },
      {
        icon: "RiTimeLine",
        title: "Tiempo de Entrega",
        description:
          "Comprometidos con cumplir en tiempo y forma con tu pedido",
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
    ],
    stats: [
      { value: "+2,500", label: "Pedidos Completados" },
      { value: "98%", label: "Satisfacción del Cliente" },
      { value: "+3", label: "Años de Experiencia" },
    ],
    sections: {
      whyUsTitle: "¿POR QUÉ ELEGIRNOS?",
      catalogTitle: "Explora nuestro Catálogo",
      catalogSubtitle:
        "Descubre nuestra amplia variedad de productos de calidad",
      navBrand: "Catálogo Pro",
    },
    footer: {
      brand: "Catálogo Pro",
      tagline:
        "Tu socio de confianza para productos de calidad y servicio excepcional",
      avisoLegalLabel: "Aviso Legal",
      avisoLegalUrl: "#",
      politicaPrivacidadLabel: "Política de Privacidad",
      politicaPrivacidadUrl: "#",
      terminosLabel: "Términos y Condiciones",
      terminosUrl: "#",
      copyright: "© 2026 Catálogo Pro",
      copyrightLine:
        "Copyright © 2026 Catálogo Pro. Todos los derechos reservados.",
    },
  };
}

function parseCarousel(rows) {
  if (!rows || rows.length < 2) return null;
  const data = rows
    .slice(1)
    .map((row) => {
      const src = row[0] || "";
      return { src: src ? normalizeDriveImageUrl(src) : "", alt: row[1] || "" };
    })
    .filter((item) => item.src);
  return data.length ? data : null;
}

function parseFeatures(rows) {
  if (!rows || rows.length < 2) return null;
  const data = rows
    .slice(1)
    .map((row) => ({
      icon: row[0] || "",
      title: row[1] || "",
      description: row[2] || "",
    }))
    .filter((item) => item.icon || item.title);
  return data.length ? data : null;
}

function parseStats(rows) {
  if (!rows || rows.length < 2) return null;
  const data = rows
    .slice(1)
    .map((row) => ({
      value: row[0] || "",
      label: row[1] || "",
    }))
    .filter((item) => item.value || item.label);
  return data.length ? data : null;
}

export async function getHomeContent() {
  const defaults = defaultHomeContent();
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) return defaults;

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: [
        `${HOME_SHEET}!A1:B4`,
        `${HOME_SHEET}!A6:D10`,
        `${HOME_SHEET}!A12:C15`,
        `${HOME_SHEET}!A17:B35`,
      ],
    });

    const valueRanges = response.data.valueRanges || [];
    const carousel = parseCarousel(valueRanges[0]?.values) ?? defaults.carousel;
    const features = parseFeatures(valueRanges[1]?.values) ?? defaults.features;
    const stats = parseStats(valueRanges[2]?.values) ?? defaults.stats;

    const kvRows = valueRanges[3]?.values;
    const sections = { ...defaults.sections };
    const footer = { ...defaults.footer };
    if (kvRows && kvRows.length >= 2) {
      const kv = {};
      kvRows.slice(1).forEach((row) => {
        const k = row[0];
        const v = row[1];
        if (k) kv[k] = v ?? "";
      });
      if (kv.whyUsTitle !== undefined) sections.whyUsTitle = kv.whyUsTitle;
      if (kv.catalogTitle !== undefined)
        sections.catalogTitle = kv.catalogTitle;
      if (kv.catalogSubtitle !== undefined)
        sections.catalogSubtitle = kv.catalogSubtitle;
      if (kv.navBrand !== undefined) sections.navBrand = kv.navBrand;
      if (kv.footerBrand !== undefined) footer.brand = kv.footerBrand;
      if (kv.footerTagline !== undefined) footer.tagline = kv.footerTagline;
      if (kv.avisoLegalLabel !== undefined)
        footer.avisoLegalLabel = kv.avisoLegalLabel;
      if (kv.avisoLegalUrl !== undefined)
        footer.avisoLegalUrl = kv.avisoLegalUrl;
      if (kv.politicaPrivacidadLabel !== undefined)
        footer.politicaPrivacidadLabel = kv.politicaPrivacidadLabel;
      if (kv.politicaPrivacidadUrl !== undefined)
        footer.politicaPrivacidadUrl = kv.politicaPrivacidadUrl;
      if (kv.terminosLabel !== undefined)
        footer.terminosLabel = kv.terminosLabel;
      if (kv.terminosUrl !== undefined) footer.terminosUrl = kv.terminosUrl;
      if (kv.copyright !== undefined) footer.copyright = kv.copyright;
      if (kv.copyrightLine !== undefined)
        footer.copyrightLine = kv.copyrightLine;
    }

    return { carousel, features, stats, sections, footer };
  } catch (error) {
    console.error("Error fetching home content:", error);
    return defaults;
  }
}

export async function updateHomeContent(payload) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) throw new Error("SPREADSHEET_ID no configurado");

    const carousel = payload.carousel ?? [];
    const carouselValues = [
      ["imageUrl", "altText"],
      ...carousel.slice(0, 3).map((item) => [item.src || "", item.alt || ""]),
    ];
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${HOME_SHEET}!A1:B4`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: carouselValues },
    });

    const features = payload.features ?? [];
    const featureValues = [
      ["icon", "title", "description"],
      ...features
        .slice(0, 4)
        .map((item) => [
          item.icon || "",
          item.title || "",
          item.description || "",
        ]),
    ];
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${HOME_SHEET}!A6:D10`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: featureValues },
    });

    const stats = payload.stats ?? [];
    const statsValues = [
      ["value", "label"],
      ...stats.slice(0, 3).map((item) => [item.value || "", item.label || ""]),
    ];
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${HOME_SHEET}!A12:C15`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: statsValues },
    });

    const sections = payload.sections ?? {};
    const footer = payload.footer ?? {};
    const footerKeyToProp = { footerBrand: "brand", footerTagline: "tagline" };
    const kvValues = [
      ["key", "value"],
      ...HOME_KEYS_ORDER.map((key) => {
        const v =
          sections[key] ??
          (footerKeyToProp[key] ? footer[footerKeyToProp[key]] : footer[key]) ??
          "";
        return [key, String(v ?? "")];
      }),
    ];
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${HOME_SHEET}!A17:B35`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: kvValues },
    });

    return { ok: true };
  } catch (error) {
    console.error("Error updating home content:", error);
    throw error;
  }
}
