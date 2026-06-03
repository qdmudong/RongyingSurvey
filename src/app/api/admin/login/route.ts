import { NextRequest, NextResponse } from "next/server";
import { setAdminCookie, verifyAdminPassword } from "@/lib/auth";
import { redirectUrl } from "@/lib/url";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!verifyAdminPassword(password)) {
    return NextResponse.redirect(redirectUrl(request, "/admin?error=1"), { status: 303 });
  }

  await setAdminCookie();
  return NextResponse.redirect(redirectUrl(request, "/admin"), { status: 303 });
}
