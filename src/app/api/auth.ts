import { SESS_NAME } from "@/config";
import { FLARE_APP_ID, FLARE_SERVER_URL, refreshAuthSession } from "@/flare";
import { FlareAuthSession } from "@zuzjs/flare";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function getCookies() : Promise<{
    accessToken: string | null,
    refreshToken: string | null,
    csrfToken: string | null,
    accessTokenName: string,
    refreshTokenName: string,
    csrfTokenName: string,
}> {
    
    const cooko = await cookies()
    const conf = cooko.get(SESS_NAME)

    let accessTokenName: string = `__flare_access_${FLARE_APP_ID}`;
    let refreshTokenName: string = `__flare_refresh_${FLARE_APP_ID}`;
    let csrfTokenName: string = `__flare_csrf_${FLARE_APP_ID}`;

    if ( conf ){
      const co = JSON.parse(conf.value)
      accessTokenName = co.accessTokenName || `__flare_access_${FLARE_APP_ID}`;
      refreshTokenName = co.refreshTokenName || `__flare_refresh_${FLARE_APP_ID}`;
      csrfTokenName = co.csrfTokenName || `__flare_csrf_${FLARE_APP_ID}`;
    }

    return {
      accessToken: cooko.get(accessTokenName!)?.value || null,
      refreshToken: cooko.get(refreshTokenName!)?.value || null,
      csrfToken: cooko.get(csrfTokenName!)?.value || null,
      accessTokenName: accessTokenName!,
      refreshTokenName: refreshTokenName!,
      csrfTokenName: csrfTokenName!,
    }
}

// Replace this with your real auth/session integration.
export async function getCurrentUser(): Promise<FlareAuthSession | null> {
  const cooko = await getCookies()
  return cooko.refreshToken ? 
    await refreshAuthSession(cooko.refreshToken).catch(() => null) : null
}

export async function callFlareSystemApps(
  path: string,
  init: RequestInit,
  flareToken: string
) {
  const res = await fetch(`${FLARE_SERVER_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${flareToken}`,
      "x-flare-auth-app-id": FLARE_APP_ID,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const payload = await res.json().catch(() => ({}));
  return { res, payload };
}

export async function requireUser() {
  const user = await getCurrentUser();
  
  if (!user?.uid || !user?.accessToken) {
    return {
      kind: false as const,
      response: NextResponse.json(
        { error: "oauth", message: "That was nice. But you need to Sign in" },
        { status: 401 }
      ),
    };
  }
  return { kind: true as const, user };
}