import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/contributions - Get all contributions for a family
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

    // Get all contributions for the family
    const contributions = await prisma.familyContribution.findMany({
      where: { familyId },
      orderBy: { amount: "desc" },
    });

    return NextResponse.json(contributions);
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributions" },
      { status: 500 }
    );
  }
}

// PATCH /api/contributions - Update all contributions for a family
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { familyId, contributions } = body;

    if (!familyId || !contributions || !Array.isArray(contributions)) {
      return NextResponse.json(
        { error: "Family ID and contributions array required" },
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

    // Update each contribution
    const updatePromises = contributions.map((contrib: any) =>
      prisma.familyContribution.update({
        where: { id: contrib.id },
        data: {
          amount: parseFloat(contrib.amount),
          percentage: parseInt(contrib.percentage),
        },
      })
    );

    await Promise.all(updatePromises);

    // Fetch updated contributions
    const updatedContributions = await prisma.familyContribution.findMany({
      where: { familyId },
      orderBy: { amount: "desc" },
    });

    return NextResponse.json(updatedContributions);
  } catch (error) {
    console.error("Error updating contributions:", error);
    return NextResponse.json(
      { error: "Failed to update contributions" },
      { status: 500 }
    );
  }
}
