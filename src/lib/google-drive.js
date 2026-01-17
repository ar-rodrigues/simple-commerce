import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * Creates an OAuth2 client using the user's access token
 * @param {string} accessToken - OAuth access token from the user session
 * @returns {google.auth.OAuth2Client}
 */
function getOAuthClient(accessToken) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

/**
 * Validates if the file is an image
 * @param {string} mimeType - MIME type of the file
 * @returns {boolean}
 */
export function isValidImageType(mimeType) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(mimeType);
}

/**
 * Validates file size (max 10MB)
 * @param {number} size - File size in bytes
 * @returns {boolean}
 */
export function isValidFileSize(size) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return size <= maxSize;
}

/**
 * Uploads a file to Google Drive folder using OAuth
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Name of the file
 * @param {string} mimeType - MIME type of the file
 * @param {string} accessToken - OAuth access token from user session
 * @returns {Promise<{id: string, webViewLink: string, webContentLink: string, publicUrl: string}>}
 */
export async function uploadFileToDrive(fileBuffer, fileName, mimeType, accessToken) {
  try {
    // Validate file type
    if (!isValidImageType(mimeType)) {
      throw new Error('Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)');
    }

    // Validate file size
    if (!isValidFileSize(fileBuffer.length)) {
      throw new Error('El archivo es demasiado grande. Tamaño máximo: 10MB');
    }

    if (!accessToken) {
      throw new Error('Token de acceso no disponible. Por favor, inicia sesión nuevamente.');
    }

    // Create OAuth client with user's access token
    const auth = getOAuthClient(accessToken);
    const drive = google.drive({ version: 'v3', auth });

    // Get folder ID (optional - if not provided, uploads to root)
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    // Convert Buffer to Stream (required by Google Drive API)
    const stream = Readable.from(fileBuffer);

    // Prepare file metadata
    const fileMetadata = {
      name: fileName,
    };

    // Add parent folder if specified
    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    // Upload file to Drive
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: mimeType,
        body: stream,
      },
      fields: 'id, webViewLink, webContentLink',
    });

    const fileId = response.data.id;

    // Make the file publicly viewable
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permError) {
      // If permission already exists, that's okay
      if (permError.code !== 409) {
        console.warn('Warning: Could not set public permission:', permError.message);
      }
    }

    // Get updated file info to ensure we have the latest webContentLink
    const fileInfo = await drive.files.get({
      fileId: fileId,
      fields: 'id, webViewLink, webContentLink, thumbnailLink',
    });

    // Generate direct image URL for Google Drive
    // Use the thumbnail service which is more reliable for embedding
    // Format: https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
    // This format works well for public images and doesn't require authentication
    const publicUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    
    // Alternative: uc?export=view format (fallback)
    const alternativeUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    return {
      id: fileId,
      webViewLink: fileInfo.data.webViewLink,
      webContentLink: fileInfo.data.webContentLink,
      publicUrl: publicUrl,
      alternativeUrl: alternativeUrl,
    };
  } catch (error) {
    console.error('Error uploading file to Drive:', error);
    
    // Provide more helpful error messages
    if (error.code === 401 || error.message?.includes('Invalid Credentials')) {
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    if (error.code === 403) {
      // Check if it's a scope issue
      if (error.message?.includes('insufficient authentication scopes') || 
          error.message?.includes('Request had insufficient authentication scopes')) {
        throw new Error('SCOPE_ERROR: Por favor, cierra sesión y vuelve a iniciar sesión para otorgar permisos de Google Drive.');
      }
      throw new Error('No tienes permisos para subir archivos. Verifica que la API de Google Drive esté habilitada.');
    }
    
    throw new Error(error.message || 'Error al subir el archivo a Google Drive');
  }
}

/**
 * Extracts file ID from Google Drive URL
 * @param {string} url - Google Drive URL
 * @returns {string|null} - File ID or null if not found
 */
export function extractFileIdFromUrl(url) {
  if (!url) return null;
  
  // Match various Google Drive URL formats
  const patterns = [
    /[?&]id=([a-zA-Z0-9_-]+)/,  // uc?id=FILE_ID or uc?export=view&id=FILE_ID
    /\/d\/([a-zA-Z0-9_-]+)/,    // /d/FILE_ID
    /\/file\/d\/([a-zA-Z0-9_-]+)/, // /file/d/FILE_ID
    /\/thumbnail\?id=([a-zA-Z0-9_-]+)/, // thumbnail?id=FILE_ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Normalizes a Google Drive URL to use the thumbnail format for reliable image display
 * @param {string} url - Google Drive URL (any format)
 * @returns {string} - Normalized URL using thumbnail format, or original URL if not a Drive URL
 */
export function normalizeDriveImageUrl(url) {
  if (!url) return url;
  
  // If it's already a thumbnail URL, return as is
  if (url.includes('drive.google.com/thumbnail')) {
    return url;
  }
  
  // Extract file ID from the URL
  const fileId = extractFileIdFromUrl(url);
  
  // If we found a file ID and it's a Google Drive URL, convert to thumbnail format
  if (fileId && url.includes('drive.google.com')) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  
  // If it's not a Google Drive URL, return as is
  return url;
}

/**
 * Deletes a file from Google Drive using OAuth
 * @param {string} fileId - Google Drive file ID
 * @param {string} accessToken - OAuth access token from user session
 * @returns {Promise<void>}
 */
export async function deleteFileFromDrive(fileId, accessToken) {
  try {
    if (!fileId || !accessToken) {
      console.warn('Cannot delete file from Drive: missing fileId or accessToken');
      return;
    }

    const auth = getOAuthClient(accessToken);
    const drive = google.drive({ version: 'v3', auth });

    await drive.files.delete({
      fileId: fileId,
    });
    
    console.log(`Successfully deleted file ${fileId} from Drive`);
  } catch (error) {
    // Log error details for debugging
    console.error('Error deleting file from Drive:', {
      fileId,
      errorCode: error.code,
      errorMessage: error.message,
      errorDetails: error.response?.data,
    });
    // Don't throw - deletion of Drive file is optional, spreadsheet deletion should still succeed
  }
}
