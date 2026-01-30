import { NextResponse } from "next/server";
import { getHomeContent, updateHomeContent } from "@/lib/google-sheets";
import { auth } from "@/auth";

export async function GET() {
  try {
    const data = await getHomeContent();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/home:", error);
    return NextResponse.json(
      { error: "Error al obtener el contenido del inicio" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await updateHomeContent(body);
    return NextResponse.json({
      message: "Contenido del inicio actualizado correctamente",
    });
  } catch (error) {
    console.error("Error in PUT /api/home:", error);
    return NextResponse.json(
      { error: "Error al actualizar el contenido del inicio" },
      { status: 500 }
    );
  }
}
