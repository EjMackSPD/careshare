import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/admin/families - Get all families (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Check if user is admin
    if (
      user.email !== "admin@careshare.app" &&
      user.email !== "demo@careshare.app"
    ) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all families with counts
    const families = await prisma.family.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            members: true,
            tasks: true,
            events: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format response
    const formattedFamilies = families.map((family) => ({
      id: family.id,
      name: family.name,
      description: family.description,
      createdAt: family.createdAt,
      membersCount: family._count.members,
      tasksCount: family._count.tasks,
      eventsCount: family._count.events,
    }));

    return NextResponse.json(formattedFamilies);
  } catch (error) {
    console.error("Error fetching families:", error);
    return NextResponse.json(
      { error: "Failed to fetch families" },
      { status: 500 }
    );
  }
}
