import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/cms";

const fallbackContent = {
  eyebrow: "Guided setup",
  title: "Build the right care workspace from the start",
  body:
    "CareShare adapts setup around your role, the people involved, and the decisions that need to stay organized.",
  bullets: [
    "Choose the path that matches how you support care today",
    "Capture the details your family or care team needs first",
    "Leave with a workspace ready for tasks, bills, events, and updates",
  ],
  note: "You can refine everything later from your dashboard.",
};

type PayloadBlock = Record<string, any>;

export async function GET() {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "pages",
      depth: 1,
      limit: 1,
      overrideAccess: false,
      where: {
        slug: {
          equals: "onboarding",
        },
      },
    });

    const page = result.docs[0];
    const block = (page?.layout as PayloadBlock[] | undefined)?.find(
      (item) => item.blockType === "content" && item.sectionId === "onboarding-info",
    );

    if (!block) {
      return NextResponse.json({ content: fallbackContent });
    }

    return NextResponse.json({
      content: {
        eyebrow: block.prose || fallbackContent.eyebrow,
        title: block.title || fallbackContent.title,
        body: block.intro || fallbackContent.body,
        bullets: Array.isArray(block.bullets)
          ? block.bullets.map((item) => item.text).filter(Boolean)
          : fallbackContent.bullets,
        note: block.aside?.body || fallbackContent.note,
      },
    });
  } catch {
    return NextResponse.json({ content: fallbackContent });
  }
}
