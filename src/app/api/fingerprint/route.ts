import { NextResponse } from "next/server";
import { generateFingerprint } from "@/lib/fingerprint";
import type { ContentType } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const contentType = (body.contentType ?? "image") as ContentType;
  const seed = String(body.seed ?? "asset");
  return NextResponse.json({
    fingerprint: generateFingerprint(contentType, seed),
    s3: {
      bucket: "copyradar-demo",
      key: `works/${seed}`,
    },
  });
}
