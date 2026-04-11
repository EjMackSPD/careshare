import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireFamilyCapability, requireFamilyMembership } from "@/lib/auth-utils";

// PATCH /api/families/[familyId] - Update family settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params;

    try {
      await requireFamilyCapability(familyId, "sensitive.write");
    } catch (error) {
      return NextResponse.json(
        { error: "You do not have permission to update family settings" },
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
      include: {
        careRecipient: true,
      },
    });

    if (
      elderName !== undefined ||
      elderPhone !== undefined ||
      elderAddress !== undefined ||
      elderBirthday !== undefined ||
      medicalNotes !== undefined
    ) {
      await prisma.careRecipient.upsert({
        where: {
          familyId,
        },
        update: {
          name: elderName || updatedFamily.elderName || "Care Recipient",
          phone: elderPhone || null,
          address: elderAddress || null,
          birthDate: elderBirthday ? new Date(elderBirthday) : null,
          medicalNotes: medicalNotes || null,
        },
        create: {
          familyId,
          name: elderName || updatedFamily.elderName || "Care Recipient",
          phone: elderPhone || null,
          address: elderAddress || null,
          birthDate: elderBirthday ? new Date(elderBirthday) : null,
          medicalNotes: medicalNotes || null,
        },
      });
    }

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
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await requireAuth();
    const { familyId } = await params;

    try {
      await requireFamilyMembership(familyId);
    } catch (error) {
      return NextResponse.json(
        { error: "You are not a member of this family" },
        { status: 403 }
      );
    }

    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        careRecipient: true,
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
