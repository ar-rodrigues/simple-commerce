import { NextResponse } from 'next/server';
import { getItems, addItem, updateItem, deleteItem } from '@/lib/google-sheets';
import { extractFileIdFromUrl, deleteFileFromDrive } from '@/lib/google-drive';
import { auth } from '@/auth';

export async function GET() {
  try {
    const items = await getItems();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener los datos' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    await addItem(body);
    return NextResponse.json({ message: 'Ítem agregado correctamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al agregar el ítem' }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { rowIndex, ...item } = body;
    await updateItem(rowIndex, item);
    return NextResponse.json({ message: 'Ítem actualizado correctamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar el ítem' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const rowIndex = parseInt(searchParams.get('rowIndex'));
    
    // Get the item before deleting to extract image file ID
    const items = await getItems();
    const itemToDelete = items.find(item => item.rowIndex === rowIndex);
    
    // Extract file ID from image URL before deleting from spreadsheet
    let fileIdToDelete = null;
    if (itemToDelete?.image && session.accessToken) {
      fileIdToDelete = extractFileIdFromUrl(itemToDelete.image);
    }
    
    // Delete from spreadsheet first
    await deleteItem(rowIndex);
    
    // Also delete the image from Drive if it's a Google Drive URL
    if (fileIdToDelete && session.accessToken) {
      try {
        await deleteFileFromDrive(fileIdToDelete, session.accessToken);
      } catch (error) {
        // Log but don't fail the request - spreadsheet deletion already succeeded
        console.error('Failed to delete file from Drive, but spreadsheet deletion succeeded:', error);
      }
    }
    
    return NextResponse.json({ message: 'Ítem eliminado correctamente' });
  } catch (error) {
    console.error('Error in DELETE:', error);
    return NextResponse.json({ error: 'Error al eliminar el ítem' }, { status: 500 });
  }
}
