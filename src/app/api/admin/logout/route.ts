import { NextRequest, NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await clearAdminCookie();
  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
}
