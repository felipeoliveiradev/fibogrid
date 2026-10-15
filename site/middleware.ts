import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale, locales } from "@/lib/i18n/config";

function pickLocale(request: NextRequest): string {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && isLocale(cookie)) return cookie;

  const header = request.headers.get("accept-language") ?? "";
  const preferred = header
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean);

  for (const tag of preferred) {
    const base = tag.slice(0, 2);
    if (isLocale(base)) return base;
    if (tag.startsWith("zh")) return "zh";
    if (tag.startsWith("pt")) return "pt";
    if (tag.startsWith("es")) return "es";
    if (tag.startsWith("en")) return "en";
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // public assets
  ) {
    return NextResponse.next();
  }

  const segment = pathname.split("/")[1] ?? "";
  if (isLocale(segment)) {
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", segment, { path: "/" });
    return response;
  }

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set("NEXT_LOCALE", locale, { path: "/" });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
