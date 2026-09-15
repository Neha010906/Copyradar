import { NextResponse } from "next/server";
import { simulateScan } from "@/lib/simulate-scan";
import type { ContentType } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const contentType = (body.contentType ?? "image") as ContentType;
  const seed = String(body.seed ?? "copyradar");
  const matches = simulateScan(contentType, seed);
  return NextResponse.json({
    provider: "next-mock",
    note: "Swap NEXT_PUBLIC_API_URL to a FastAPI service — see /backend",
    pinecone: {
      index: "copyradar-prod",
      upserted: true,
      namespace: contentType,
    },
    matches,
  });
}
