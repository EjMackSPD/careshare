import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

// GET - Fetch all messages for a family
export async function GET(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await requireAuth();
    const { familyId } = await params;

    // Verify user is a member of this family
    const familyMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: user.id,
        },
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: "Not authorized to view messages for this family" },
        { status: 403 }
      );
    }

    // Fetch messages with user information (newest first)
    const messages = await prisma.message.findMany({
      where: { familyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to last 100 messages
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await requireAuth();
    const { familyId } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    // Verify user is a member of this family
    const familyMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: user.id,
        },
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: "Not authorized to send messages to this family" },
        { status: 403 }
      );
    }

    // Create the message
    const newMessage = await prisma.message.create({
      data: {
        familyId,
        userId: user.id,
        message: message.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
