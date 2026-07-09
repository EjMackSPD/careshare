import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import configPromise from "@payload-config";
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes";
import { checkRateLimit, type RateLimitRule } from "@/lib/rate-limit";

const restGet = REST_GET(configPromise);
const restPost = REST_POST(configPromise);
const restDelete = REST_DELETE(configPromise);
const restPatch = REST_PATCH(configPromise);
const restPut = REST_PUT(configPromise);
const restOptions = REST_OPTIONS(configPromise);

type RouteContext = { params: Promise<{ slug: string[] }> };

const THROTTLED_POST_ENDPOINTS: Record<string, RateLimitRule> = {
  "users/login": { windowMs: 10 * 60 * 1000, max: 10 },
  "users/forgot-password": { windowMs: 60 * 60 * 1000, max: 3 },
};

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

async function getEmailFromBody(request: NextRequest): Promise<string | null> {
  try {
    const body = await request.clone().json();
    if (typeof body?.email === "string" && body.email.trim()) {
      return body.email.toLowerCase().trim();
    }
  } catch {
    // Non-JSON or unparsable body — nothing to key on.
  }
  return null;
}

function tooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      errors: [
        {
          message: "Too many attempts. Please wait a bit before trying again.",
        },
      ],
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  );
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const path = slug.join("/");
  const rule = THROTTLED_POST_ENDPOINTS[path];

  if (rule) {
    const ip = getClientIp(request);
    const email = await getEmailFromBody(request);

    const ipResult = await checkRateLimit(`${path}:ip:${ip}`, rule);
    if (!ipResult.allowed) {
      return tooManyRequests(ipResult.retryAfterSeconds);
    }

    if (email) {
      const emailResult = await checkRateLimit(`${path}:email:${email}`, rule);
      if (!emailResult.allowed) {
        return tooManyRequests(emailResult.retryAfterSeconds);
      }
    }
  }

  return restPost(request, context);
}

export const GET = restGet;
export const DELETE = restDelete;
export const PATCH = restPatch;
export const PUT = restPut;
export const OPTIONS = restOptions;
