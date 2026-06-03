import { NextRequest, NextResponse } from "next/server";
import { setAdminCookie, verifyAdminPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!verifyAdminPassword(password)) {
    return NextResponse.redirect(new URL("/admin?error=1", request.url), { status: 303 });
  }

  await setAdminCookie();
  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
}
