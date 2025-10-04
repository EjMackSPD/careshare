import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

type RouteContext = {
  params: Promise<{
    scenarioId: string;
  }>;
};

// PATCH /api/care-scenarios/[scenarioId] - Update a scenario
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();

    const { scenarioId } = await context.params;
    const body = await request.json();

    // Get scenario and verify access
    const existingScenario = await prisma.careScenario.findUnique({
      where: { id: scenarioId },
      include: { family: true },
    });

    if (!existingScenario) {
      return NextResponse.json(
        { error: "Scenario not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this family
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        familyId: existingScenario.familyId,
        userId: (user as any).id,
      },
    });

    if (!familyMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const updatedScenario = await prisma.careScenario.update({
      where: { id: scenarioId },
      data: {
        title: body.title,
        icon: body.icon,
        content: body.content,
      },
    });

    return NextResponse.json(updatedScenario);
  } catch (error) {
    console.error("Error updating scenario:", error);
    return NextResponse.json(
      { error: "Failed to update scenario" },
      { status: 500 }
    );
  }
}
