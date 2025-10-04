import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

type RouteContext = {
  params: Promise<{
    familyId: string;
  }>;
};

// PUT /api/admin/families/[familyId] - Update a family (admin only)
export async function PUT(request: NextRequest, context: RouteContext) {
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

    const { familyId } = await context.params;
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Family name is required" },
        { status: 400 }
      );
    }

    // Check if family exists
    const existingFamily = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!existingFamily) {
      return NextResponse.json({ error: "Family not found" }, { status: 404 });
    }

    // Update family
    const updatedFamily = await prisma.family.update({
      where: { id: familyId },
      data: {
        name,
        description: description || null,
      },
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
    });

    const formattedFamily = {
      id: updatedFamily.id,
      name: updatedFamily.name,
      description: updatedFamily.description,
      createdAt: updatedFamily.createdAt,
      membersCount: updatedFamily._count.members,
      tasksCount: updatedFamily._count.tasks,
      eventsCount: updatedFamily._count.events,
    };

    return NextResponse.json(formattedFamily);
  } catch (error) {
    console.error("Error updating family:", error);
    return NextResponse.json(
      { error: "Failed to update family" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/families/[familyId] - Delete a family (admin only)
export async function DELETE(request: NextRequest, context: RouteContext) {
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

    const { familyId } = await context.params;

    // Check if family exists
    const existingFamily = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!existingFamily) {
      return NextResponse.json({ error: "Family not found" }, { status: 404 });
    }

    // Delete family (cascading delete will handle all related records)
    // This includes: members, tasks, events, messages, medications, etc.
    await prisma.family.delete({
      where: { id: familyId },
    });

    return NextResponse.json({
      success: true,
      message: "Family deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting family:", error);
    return NextResponse.json(
      { error: "Failed to delete family" },
      { status: 500 }
    );
  }
}
