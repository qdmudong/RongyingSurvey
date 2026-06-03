import type { NextRequest } from "next/server";
import { headers } from "next/headers";

export function publicBaseUrl() {
  return process.env.PUBLIC_BASE_URL?.replace(/\/$/, "");
}

export async function getPublicOrigin() {
  const configuredUrl = publicBaseUrl();
  if (configuredUrl) return configuredUrl;

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}

export function redirectUrl(request: NextRequest, path: string) {
  const configuredUrl = publicBaseUrl();
  if (configuredUrl) return new URL(path, configuredUrl);

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";

  if (host && host !== "0.0.0.0:3000" && !host.startsWith("0.0.0.0")) {
    return new URL(path, `${protocol}://${host}`);
  }

  return new URL(path, request.url);
}
