import { NextRequest, NextResponse } from "next/server";
import { getPublishedPostBySlug, mapPostForList } from "@/lib/cms";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const post = await getPublishedPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    const listPost = mapPostForList(post);

    return NextResponse.json({
      ...listPost,
      content: post.content,
      views: 0,
      relatedPostIds: Array.isArray(post.relatedPosts)
        ? post.relatedPosts.map((related: any) =>
            typeof related === "object" && related !== null ? related.id : related
          )
        : [],
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}
