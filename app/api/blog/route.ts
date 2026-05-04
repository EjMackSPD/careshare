import { NextRequest, NextResponse } from "next/server";
import { getPayloadClient, mapPostForList } from "@/lib/cms";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const limit = Number(searchParams.get("limit") ?? "12");

    const payload = await getPayloadClient();

    if (id) {
      const post = await payload.findByID({
        collection: "posts",
        id,
        depth: 2,
        overrideAccess: false,
      });

      return NextResponse.json([mapPostForList(post)]);
    }

    const result = await payload.find({
      collection: "posts",
      depth: 2,
      limit,
      overrideAccess: false,
      sort: "-publishedAt",
      where: {
        and: [
          { _status: { equals: "published" } },
          ...(category ? [{ category: { equals: category } }] : []),
        ],
      },
    });

    return NextResponse.json(result.docs.map(mapPostForList));
  } catch (error) {
    console.error("Error in blog API:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
