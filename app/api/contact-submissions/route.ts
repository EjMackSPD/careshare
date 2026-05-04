import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/cms";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, type, subject, message } = body;

    if (!name || !email || !type || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const payload = await getPayloadClient();
    await payload.create({
      collection: "contact-submissions",
      data: {
        name,
        email,
        type,
        subject,
        message,
        status: "new",
      },
      overrideAccess: false,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
