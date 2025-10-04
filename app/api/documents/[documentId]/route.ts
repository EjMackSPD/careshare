import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

// PATCH /api/documents/[documentId] - Update a document
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();

    const { documentId } = await context.params;
    const body = await request.json();

    // Get document and verify access
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
      include: { family: true },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this family
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        familyId: existingDocument.familyId,
        userId: (user as any).id,
      },
    });

    if (!familyMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        name: body.name,
        category: body.category,
        notes: body.notes,
        fileUrl: body.fileUrl,
        fileName: body.fileName,
        fileSize: body.fileSize,
        mimeType: body.mimeType,
      },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[documentId] - Delete a document
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();

    const { documentId } = await context.params;

    // Get document and verify access
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
      include: { family: true },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this family
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        familyId: existingDocument.familyId,
        userId: (user as any).id,
      },
    });

    if (!familyMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
