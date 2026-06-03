import { createHash } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "rongying_admin";

function adminSecret() {
  return process.env.ADMIN_PASSWORD || "admin123";
}

function tokenForPassword(password: string) {
  return createHash("sha256").update(`rongying:${password}`).digest("hex");
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === tokenForPassword(adminSecret());
}

export async function setAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, tokenForPassword(adminSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function verifyAdminPassword(password: string) {
  return password === adminSecret();
}
