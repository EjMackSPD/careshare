import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";

// GET /api/admin/users - Get all users (admin only)
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

    // Fetch all users with family count
    const users = await prisma.user.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format response with role and status (placeholder values for now)
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      role:
        user.email === "admin@careshare.app" ||
        user.email === "demo@careshare.app"
          ? "admin"
          : "user",
      status: user.emailVerified ? "active" : "inactive",
      familiesCount: user._count.familyMembers,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user (admin only)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, email, role, status } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create new user with a default password
    const defaultPassword = "ChangeMe123!";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: status === "active" ? new Date() : null,
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
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      emailVerified: newUser.emailVerified,
      createdAt: newUser.createdAt,
      role: role || "user",
      status: status || "active",
      familiesCount: newUser._count.familyMembers,
    };

    return NextResponse.json(formattedUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
