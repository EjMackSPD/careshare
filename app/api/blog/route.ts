import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/blog - Get all published blog posts or a specific post by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const limit = searchParams.get("limit");

    // If fetching by ID, return single post
    if (id) {
      const post = await prisma.blogPost.findUnique({
        where: { id },
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

      if (!post || !post.publishedAt) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 }
        );
      }

      return NextResponse.json([post]); // Return as array for consistency
    }

    // Otherwise, fetch multiple posts
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
