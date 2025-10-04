import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/care-plan - Get care plan for a family
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

    // Get care plan for the family (create if doesn't exist)
    let carePlan = await prisma.carePlan.findUnique({
      where: { familyId },
    });

    // Create default care plan if it doesn't exist
    if (!carePlan) {
      carePlan = await prisma.carePlan.create({
        data: {
          familyId,
          careLevel: "MODERATE",
        },
      });
    }

    return NextResponse.json(carePlan);
  } catch (error) {
    console.error("Error fetching care plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch care plan" },
      { status: 500 }
    );
  }
}

// PATCH /api/care-plan - Update care plan
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const {
      familyId,
      careLevel,
      careLevelDescription,
      estimatedCostMin,
      estimatedCostMax,
      careNotes,
    } = body;

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

    // Update or create care plan
    const carePlan = await prisma.carePlan.upsert({
      where: { familyId },
      update: {
        careLevel,
        careLevelDescription,
        estimatedCostMin: estimatedCostMin ? parseInt(estimatedCostMin) : null,
        estimatedCostMax: estimatedCostMax ? parseInt(estimatedCostMax) : null,
        careNotes,
      },
      create: {
        familyId,
        careLevel,
        careLevelDescription,
        estimatedCostMin: estimatedCostMin ? parseInt(estimatedCostMin) : null,
        estimatedCostMax: estimatedCostMax ? parseInt(estimatedCostMax) : null,
        careNotes,
      },
    });

    return NextResponse.json(carePlan);
  } catch (error) {
    console.error("Error updating care plan:", error);
    return NextResponse.json(
      { error: "Failed to update care plan" },
      { status: 500 }
    );
  }
}
