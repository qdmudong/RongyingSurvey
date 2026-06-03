import { NextRequest, NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/auth";
import { redirectUrl } from "@/lib/url";

export async function POST(request: NextRequest) {
  await clearAdminCookie();
  return NextResponse.redirect(redirectUrl(request, "/admin"), { status: 303 });
}
