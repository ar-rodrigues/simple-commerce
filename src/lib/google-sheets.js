import { google } from 'googleapis';
import { normalizeDriveImageUrl } from './google-drive';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

async function getAuthClient() {
  // Handle private key with escaped newlines (\n) or actual newlines
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    ?.replace(/\\n/g, '\n')
    ?.trim();

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
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Catalogo!A:F', // Updated to include whatsappAction column
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
        item.action = 'https://wa.me/522225230942';
      }
      
      return item;
    });
  } catch (error) {
    console.error('Error fetching sheets data:', error);
    throw error;
  }
}

export async function addItem(item) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const action = item.action || 'https://wa.me/522225230942';
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Catalogo!A:F', // Updated to include action column
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[item.id, item.name, item.description, item.price, item.image, action]],
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding item:', error);
    throw error;
  }
}

export async function updateItem(rowIndex, item) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const action = item.action || 'https://wa.me/522225230942';
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `Catalogo!A${rowIndex}:F${rowIndex}`, // Updated to include action column
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[item.id, item.name, item.description, item.price, item.image, action]],
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
}

export async function deleteItem(rowIndex) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    // First, get the sheet ID to ensure we're deleting from the correct sheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
    });
    
    // Find the sheet named 'Catalogo' or use the first sheet
    const catalogSheet = spreadsheet.data.sheets.find(
      sheet => sheet.properties.title === 'Catalogo'
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
                dimension: 'ROWS',
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
    console.error('Error deleting item:', error);
    throw error;
  }
}
