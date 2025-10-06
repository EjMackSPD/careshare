import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { BlogCategory } from "@prisma/client";

// GET /api/admin/blog - Get all blog posts (admin only)
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

    // Blog system is not yet implemented - return empty array
    return NextResponse.json([], { 
      status: 200,
      headers: {
        'X-System-Status': 'Blog system coming soon'
      }
    });

    // TODO: Uncomment when BlogPost model is added to schema
    // const posts = await prisma.blogPost.findMany({
    //   orderBy: { createdAt: "desc" },
    // });
    // return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

// POST /api/admin/blog - Create a new blog post (admin only)
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
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      author,
      authorTitle,
      coverImage,
      readTime,
      published,
      publishedAt,
      relatedPostIds,
    } = body;

    // Validate required fields
    if (!title || !slug || !excerpt || !content || !category || !author) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Blog system is not yet implemented
    return NextResponse.json(
      { error: "Blog system coming soon" },
      { status: 503 }
    );

    // TODO: Uncomment when BlogPost model is added to schema
    // // Check if slug already exists
    // const existingPost = await prisma.blogPost.findUnique({
    //   where: { slug },
    // });
    //
    // if (existingPost) {
    //   return NextResponse.json(
    //     { error: "A post with this slug already exists" },
    //     { status: 400 }
    //   );
    // }
    //
    // // Create blog post
    // const newPost = await prisma.blogPost.create({
    //   data: {
    //     title,
    //     slug,
    //     excerpt,
    //     content,
    //     category: category as BlogCategory,
    //     author,
    //     authorTitle: authorTitle || null,
    //     coverImage: coverImage || null,
    //     readTime: readTime || 5,
    //     published: published || false,
    //     publishedAt:
    //       published && publishedAt
    //         ? new Date(publishedAt)
    //         : published
    //         ? new Date()
    //         : null,
    //     relatedPostIds: relatedPostIds || [],
    //   },
    // });
    //
    // return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
