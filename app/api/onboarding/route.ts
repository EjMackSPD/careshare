import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const {
      role,
      relationship,
      recipientName,
      recipientAge,
      recipientConditions,
      familyMembers,
      notificationPreferences,
    } = body;

    // Find or create the user's family
    let family = await prisma.family.findFirst({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    if (!family) {
      // Create a new family
      family = await prisma.family.create({
        data: {
          name: `${recipientName || user.name}'s Care Family`,
          description: `Family coordinating care for ${
            recipientName || "loved one"
          }`,
          createdBy: user.id,
          elderName: recipientName || null,
          elderBirthday: recipientAge
            ? new Date(new Date().getFullYear() - parseInt(recipientAge), 0, 1)
            : null,
          medicalNotes: recipientConditions?.join(", ") || null,
          members: {
            create: {
              userId: user.id,
              role: role === "primary" ? "CARE_MANAGER" : "FAMILY_MEMBER",
            },
          },
        },
      });
    }

    // Add family members if provided
    if (familyMembers && familyMembers.length > 0) {
      for (const member of familyMembers) {
        // Check if user exists, if not, we'll just store the invitation
        const existingUser = await prisma.user.findUnique({
          where: { email: member.email },
        });

        if (existingUser) {
          // Add existing user to family
          await prisma.familyMember.create({
            data: {
              familyId: family.id,
              userId: existingUser.id,
              role: member.role || "FAMILY_MEMBER",
            },
          });
        }
        // TODO: Send invitation emails to non-existing users
      }
    }

    // Onboarding complete - family and members created
    return NextResponse.json({
      success: true,
      familyId: family.id,
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}

// GET - Check if user has completed onboarding
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Check if user has a family
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        family: true,
      },
    });

    const hasCompletedOnboarding = !!familyMember;

    return NextResponse.json({
      hasCompletedOnboarding,
      familyId: familyMember?.familyId,
    });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return NextResponse.json(
      { error: "Failed to check onboarding status" },
      { status: 500 }
    );
  }
}
