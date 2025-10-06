import { NextRequest, NextResponse } from "next/server";

// GET /api/blog - Blog coming soon
// TODO: Add BlogPost model to schema and implement full blog functionality
export async function GET(request: NextRequest) {
  try {
    // Blog system is not yet implemented - return empty array
    // This prevents 500 errors while blog feature is being developed
    return NextResponse.json([]);
  } catch (error) {
    console.error("Error in blog API:", error);
    return NextResponse.json(
      { error: "Blog system coming soon" },
      { status: 503 }
    );
  }
}
