import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

// PUT /api/admin/users/[userId] - Update a user (admin only)
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

    const { userId } = await context.params;
    const body = await request.json();
    const { name, email, role, status } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If email is being changed, check if new email is already taken
    if (email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      });

      if (emailTaken) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        emailVerified:
          status === "active" ? existingUser.emailVerified || new Date() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            familyMembers: true,
          },
        },
      },
    });

    const formattedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      emailVerified: updatedUser.emailVerified,
      createdAt: updatedUser.createdAt,
      role: role || "user",
      status: status || "active",
      familiesCount: updatedUser._count.familyMembers,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[userId] - Delete a user (admin only)
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

    const { userId } = await context.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting admin users
    if (
      existingUser.email === "admin@careshare.app" ||
      existingUser.email === "demo@careshare.app"
    ) {
      return NextResponse.json(
        { error: "Cannot delete admin users" },
        { status: 400 }
      );
    }

    // Delete user (cascading delete will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
