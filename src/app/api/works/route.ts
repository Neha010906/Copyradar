import { NextResponse } from "next/server";

/** Persistence lives in the browser (localStorage) for this prototype. */
export async function GET() {
  return NextResponse.json({
    store: "localStorage",
    message: "Works are persisted client-side. FastAPI + SQLite lives in /backend.",
  });
}
