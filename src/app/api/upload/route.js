import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadFileToDrive } from '@/lib/google-drive';

export async function POST(request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get access token from session
    const accessToken = session.accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de acceso no disponible. Por favor, inicia sesión nuevamente.' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get file metadata
    const fileName = file.name;
    const mimeType = file.type;

    // Upload to Google Drive using OAuth
    const driveFile = await uploadFileToDrive(buffer, fileName, mimeType, accessToken);

    return NextResponse.json({
      success: true,
      url: driveFile.publicUrl,
      fileId: driveFile.id,
    });
  } catch (error) {
    console.error('Error in upload API:', error);
    
    // If it's a scope error, return 403 to trigger re-authentication
    if (error.message?.includes('SCOPE_ERROR')) {
      return NextResponse.json(
        { 
          error: 'Por favor, cierra sesión y vuelve a iniciar sesión para otorgar permisos de Google Drive.',
          requiresReauth: true 
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}
