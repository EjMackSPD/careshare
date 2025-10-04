import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/documents - Get all documents for a family
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get("familyId");

    if (!familyId) {
      return NextResponse.json(
        { error: "Family ID required" },
        { status: 400 }
      );
    }

    // Verify user has access to this family
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: (user as any).id,
      },
    });

    if (!familyMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all documents for the family
    const documents = await prisma.document.findMany({
      where: { familyId },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create a new document
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const {
      familyId,
      name,
      category,
      notes,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
    } = body;

    if (!familyId || !name || !category) {
      return NextResponse.json(
        { error: "Family ID, name, and category are required" },
        { status: 400 }
      );
    }

    // Verify user has access to this family
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: (user as any).id,
      },
    });

    if (!familyMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const document = await prisma.document.create({
      data: {
        familyId,
        name,
        category,
        notes,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        uploadedBy: (user as any).id,
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

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
