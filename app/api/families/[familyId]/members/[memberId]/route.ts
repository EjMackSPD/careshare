import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

type RouteContext = {
  params: Promise<{
    familyId: string;
    memberId: string;
  }>;
};

// DELETE - Remove a member from a family
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { familyId, memberId } = await context.params;

    // Check if user is admin
    const isAdmin =
      user.email === "admin@careshare.app" ||
      user.email === "demo@careshare.app";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Check if member exists
    const existingMember = await prisma.familyMember.findUnique({
      where: { id: memberId },
    });

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Delete member
    await prisma.familyMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Error removing family member:", error);
    return NextResponse.json(
      { error: "Failed to remove family member" },
      { status: 500 }
    );
  }
}
