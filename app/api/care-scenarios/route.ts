import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/care-scenarios - Get all care scenarios for a family
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

    // Get all scenarios for the family
    const scenarios = await prisma.careScenario.findMany({
      where: { familyId },
      orderBy: { type: "asc" },
    });

    return NextResponse.json(scenarios);
  } catch (error) {
    console.error("Error fetching care scenarios:", error);
    return NextResponse.json(
      { error: "Failed to fetch care scenarios" },
      { status: 500 }
    );
  }
}
