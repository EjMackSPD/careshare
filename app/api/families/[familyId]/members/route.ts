import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

// GET - Fetch all members for a family
export async function GET(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await requireAuth();
    const { familyId } = await params;

    // Check if user is admin or a member of this family
    const isAdmin =
      user.email === "admin@careshare.app" ||
      user.email === "demo@careshare.app";

    if (!isAdmin) {
      const familyMember = await prisma.familyMember.findUnique({
        where: {
          familyId_userId: {
            familyId,
            userId: user.id,
          },
        },
      });

      if (!familyMember) {
        return NextResponse.json(
          { error: "Not authorized to view members for this family" },
          { status: 403 }
        );
      }
    }

    // Fetch all family members
    const members = await prisma.familyMember.findMany({
      where: { familyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching family members:", error);
    return NextResponse.json(
      { error: "Failed to fetch family members" },
      { status: 500 }
    );
  }
}

// POST - Add a member to a family
export async function POST(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await requireAuth();
    const { familyId } = await params;

    // Check if user is admin
    const isAdmin =
      user.email === "admin@careshare.app" ||
      user.email === "demo@careshare.app";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role } = body;

    // Check if user already is a member of this family
    const existingMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this family" },
        { status: 400 }
      );
    }

    // Add member to family
    const newMember = await prisma.familyMember.create({
      data: {
        familyId,
        userId,
        role: role || "FAMILY_MEMBER",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Error adding family member:", error);
    return NextResponse.json(
      { error: "Failed to add family member" },
      { status: 500 }
    );
  }
}
