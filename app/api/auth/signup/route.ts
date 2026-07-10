import { NextResponse } from "next/server";
import { OnboardingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { upsertPayloadUser } from "@/lib/payload-users";
import { requestLoginEmail } from "@/lib/login-flow";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const user = await upsertPayloadUser({
      email,
      name,
      password,
      roles: ["family-member"],
      onboardingStatus: OnboardingStatus.IN_PROGRESS,
      onboardingStep: 1,
      mustResetPassword: false,
    });

    // New accounts start unverified; send the magic link + code so they can
    // confirm their email. The welcome email follows on first verification.
    await requestLoginEmail(email);

    return NextResponse.json(
      {
        message: "User created successfully",
        requiresVerification: true,
        user: {
          id: String((user as { id: string | number }).id),
          name,
          email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
