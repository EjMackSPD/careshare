import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_BLOB_HOST = /\.blob\.vercel-storage\.com$/;

function copyHeaders(source: { forEach: (callback: (value: string, key: string) => void) => void }): Headers {
  const headers = new Headers();

  source.forEach((value, key) => {
    headers.set(key, value);
  });

  return headers;
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("url");

  if (!source) {
    return NextResponse.json({ error: "Missing blob URL" }, { status: 400 });
  }

  let blobURL: URL;

  try {
    blobURL = new URL(source);
  } catch {
    return NextResponse.json({ error: "Invalid blob URL" }, { status: 400 });
  }

  if (blobURL.protocol !== "https:" || !ALLOWED_BLOB_HOST.test(blobURL.hostname)) {
    return NextResponse.json({ error: "Unsupported blob URL" }, { status: 400 });
  }

  const blob = await get(blobURL.toString(), {
    access: "private",
    ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
  });

  if (!blob) {
    return NextResponse.json({ error: "Blob not found" }, { status: 404 });
  }

  if (blob.statusCode === 304) {
    return new Response(null, { status: 304, headers: copyHeaders(blob.headers) });
  }

  const headers = copyHeaders(blob.headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Content-Type", blob.blob.contentType);

  return new Response(blob.stream, {
    status: 200,
    headers,
  });
}
