import { NextResponse, type NextRequest } from "next/server";
import { isValidSessionValue, SESSION_COOKIE } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const isAdminRoute = url.pathname.startsWith("/app") && url.pathname !== "/app/login";

  if (!isAdminRoute && url.pathname !== "/app/login") {
    return NextResponse.next();
  }

  const sessionValid = isValidSessionValue(request.cookies.get(SESSION_COOKIE)?.value);

  if (isAdminRoute && !sessionValid) {
    const redirectUrl = url.clone();
    redirectUrl.pathname = "/app/login";
    redirectUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (url.pathname === "/app/login" && sessionValid) {
    const redirectUrl = url.clone();
    redirectUrl.pathname = "/app";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
