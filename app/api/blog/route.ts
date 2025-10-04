import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/blog - Get all published blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = searchParams.get("limit");

    const where: any = {
      published: true,
    };

    if (category && category !== "all") {
      where.category = category;
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: {
        publishedAt: "desc",
      },
      take: limit ? parseInt(limit) : undefined,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        author: true,
        authorTitle: true,
        coverImage: true,
        readTime: true,
        publishedAt: true,
        views: true,
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
