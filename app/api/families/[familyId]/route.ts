import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

// PATCH /api/families/[familyId] - Update family settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: { familyId: string } }
) {
  try {
    const user = await requireAuth();
    const { familyId } = params;

    // Verify user is a member of this family
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: user.id,
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: "You are not a member of this family" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      elderName,
      elderPhone,
      elderAddress,
      elderBirthday,
      emergencyContact,
      medicalNotes,
      notificationPreferences,
    } = body;

    // Update family
    const updatedFamily = await prisma.family.update({
      where: { id: familyId },
      data: {
        name,
        description: description || null,
        elderName: elderName || null,
        elderPhone: elderPhone || null,
        elderAddress: elderAddress || null,
        elderBirthday: elderBirthday ? new Date(elderBirthday) : null,
        emergencyContact: emergencyContact || null,
        medicalNotes: medicalNotes || null,
        notificationPreferences: notificationPreferences || null,
      },
    });

    return NextResponse.json(updatedFamily);
  } catch (error) {
    console.error("Error updating family:", error);
    return NextResponse.json(
      { error: "Failed to update family settings" },
      { status: 500 }
    );
  }
}

// GET /api/families/[familyId] - Get single family details
export async function GET(
  request: NextRequest,
  { params }: { params: { familyId: string } }
) {
  try {
    const user = await requireAuth();
    const { familyId } = params;

    // Verify user is a member of this family
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: user.id,
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: "You are not a member of this family" },
        { status: 403 }
      );
    }

    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        _count: {
          select: {
            members: true,
            tasks: true,
            events: true,
          },
        },
      },
    });

    if (!family) {
      return NextResponse.json({ error: "Family not found" }, { status: 404 });
    }

    return NextResponse.json(family);
  } catch (error) {
    console.error("Error fetching family:", error);
    return NextResponse.json(
      { error: "Failed to fetch family" },
      { status: 500 }
    );
  }
}
