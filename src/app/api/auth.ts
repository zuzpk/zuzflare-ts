import { AUTH_USER_HEADER, SESS_NAME } from "@/config";
import {
  FLARE_API_KEY,
  FLARE_APP_ID,
  FLARE_INTERNAL_SERVER_URL,
  FLARE_INTERNAL_USER_TOKEN,
  FLARE_SERVER_URL,
  refreshAuthSession,
} from "@/flare";
import { AuthUser, User } from "@/types";
import { dynamic } from "@zuzjs/core";
import { AuthConfigResponse, FlareAuthSession } from "@zuzjs/flare";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type CookieSourceRequest = Pick<NextRequest, "headers"> | Request;
type UserSession = { session: FlareAuthSession, refreshed: string | null } | null

function parseCookieHeader(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of header.split(";")) {
    const part = pair.trim();
    if (!part) continue;
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const key = decodeURIComponent(part.slice(0, idx).trim());
    const value = decodeURIComponent(part.slice(idx + 1).trim());
    out[key] = value;
  }
  return out;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = String(token || "").split(".");
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, "=");
    const payload = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function refreshAuthSessionServer(refreshToken: string): Promise<FlareAuthSession | null> {
  const sdkResult = await refreshAuthSession(refreshToken).catch(() => null);
  if (sdkResult?.accessToken) {
    return sdkResult;
  }

  // Fallback: call Flare auth_refresh directly to avoid proxy/bootstrap recursion edge-cases.
  const upstreamBase = FLARE_INTERNAL_SERVER_URL || FLARE_SERVER_URL;
  const url = new URL("/auth/refresh", upstreamBase);
  url.searchParams.set("appId", FLARE_APP_ID);
  if (FLARE_API_KEY) {
    url.searchParams.set("apiKey", FLARE_API_KEY);
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(FLARE_API_KEY ? { "x-flare-api-key": FLARE_API_KEY } : {}),
      },
      body: JSON.stringify({
        appId: FLARE_APP_ID,
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!res.ok) {
    return null;
  }

  const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  const accessToken = typeof payload?.access_token === "string" ? payload.access_token : null;
  if (!accessToken) {
    return null;
  }

  const decoded = decodeJwtPayload(accessToken) || {};
  const uid =
    (typeof decoded.uid === "string" && decoded.uid) ||
    (typeof decoded.sub === "string" && decoded.sub) ||
    null;

  return {
    uid,
    accessToken,
    refreshToken: (typeof payload?.refresh_token === "string" && payload.refresh_token) || refreshToken,
    provider: typeof decoded.provider === "string" ? decoded.provider : undefined,
    email: typeof decoded.email === "string" ? decoded.email : null,
    emailVerified: typeof decoded.emailVerified === "boolean" ? decoded.emailVerified : undefined,
  } as FlareAuthSession;
}

export async function getCookies(request?: CookieSourceRequest) : Promise<{
    accessToken: string | null,
    refreshToken: string | null,
    csrfToken: string | null,
    accessTokenName: string,
    refreshTokenName: string,
    csrfTokenName: string,
}> {
    
    const reqCookies = request
      ? parseCookieHeader(request.headers.get("cookie") ?? "")
      : null;
    const cooko = request ? null : await cookies();
    const confValue = reqCookies ? reqCookies[SESS_NAME] : cooko?.get(SESS_NAME)?.value;

    let accessTokenName: string = `__flare_access_${FLARE_APP_ID}`;
    let refreshTokenName: string = `__flare_refresh_${FLARE_APP_ID}`;
    let csrfTokenName: string = `__flare_csrf_${FLARE_APP_ID}`;

    if ( confValue ){
      try {
        const co = JSON.parse(confValue)
        accessTokenName = co.accessTokenName
        refreshTokenName = co.refreshTokenName
        csrfTokenName = co.csrfTokenName
      } catch {
        // Keep defaults when session cookie payload is malformed.
      }
    }

    return {
      accessToken: reqCookies ? reqCookies[accessTokenName] ?? null : cooko?.get(accessTokenName)?.value || null,
      refreshToken: reqCookies ? reqCookies[refreshTokenName] ?? null : cooko?.get(refreshTokenName)?.value || null,
      csrfToken: reqCookies ? reqCookies[csrfTokenName] ?? null : cooko?.get(csrfTokenName)?.value || null,
      accessTokenName: accessTokenName!,
      refreshTokenName: refreshTokenName!,
      csrfTokenName: csrfTokenName!,
    }
}

// Replace this with your real auth/session integration.
export async function getCurrentUser(request?: CookieSourceRequest): Promise<UserSession> {

  const cooko = await getCookies(request)

  if ( !cooko.refreshToken ){
    // console.log(`No refresh token found in request cookies.`)
    return null
  }
  
  if ( !cooko.accessToken ) {
    // console.log(`No access token found in request cookies.`)
    const refreshed = await refreshAuthSessionServer(cooko.refreshToken)

    // console.log(`--- Attempted to refresh session using refresh token, got:`, refreshed)

    if (refreshed?.uid && refreshed?.accessToken){ 
      return { 
        session: refreshed, 
        refreshed: `${cooko.accessTokenName}=${refreshed.accessToken};Max-Age=86400;Path=/;HttpOnly;SameSite=None;Secure` 
      }
    }
  }

  try{

    const { 
      email,
      emailVerified,
      provider, 
      uid, sub, iat, exp 
    } = decodeJwtPayload(cooko.accessToken || "") || { } as dynamic

    const expSec = Number(exp)
    const nowSec = Math.floor(Date.now() / 1000)
    const isExpired = Number.isFinite(expSec) && expSec <= nowSec

    if ( isExpired ) {
      const refreshed = await refreshAuthSessionServer(cooko.refreshToken)
      if (refreshed?.uid && refreshed?.accessToken){ 
        return { 
          session: refreshed, 
          refreshed: `${cooko.accessTokenName}=${refreshed.accessToken};Max-Age=86400;Path=/;HttpOnly;SameSite=None;Secure` 
        }
      }
    }

    const _uid = typeof uid === "string" && uid != `-`
      ? uid
      : (typeof sub === "string" && sub != `-` ? sub : null)

    if (_uid) {
      return {
        refreshed: null, //`${cooko.accessTokenName}=${cooko.accessToken};Max-Age=86400;Path: /;HttpOnly;SameSite=None;Secure`,
        session: {
          uid: _uid,
          accessToken: cooko.accessToken!,
          refreshToken: cooko.refreshToken!,
          provider: typeof provider === "string" ? provider : undefined,
          email: typeof email === "string" ? email : null,
          emailVerified: typeof emailVerified === "boolean" ? emailVerified : undefined,
        }
      }
    }

    return null

  }
  catch(e){
    console.log(`--- Failed to decode access token, treating as invalid ---`, e)
    return null
  }

}

export async function callFlareSystemApps(
  path: string,
  init: RequestInit,
  flareToken: string,
  options?: { internalUserToken?: string | null; useAdminKey?: boolean }
) {
  const upstreamBase = FLARE_INTERNAL_SERVER_URL || FLARE_SERVER_URL;
  const internalUserToken = options?.internalUserToken ?? FLARE_INTERNAL_USER_TOKEN;
  const authToken = internalUserToken || flareToken;
  const url = new URL(path, upstreamBase);

  if (!url.searchParams.has("appId")) {
    url.searchParams.set("appId", FLARE_APP_ID);
  }
  if (options?.useAdminKey && process.env.FLARE_INTERNAL_ADMIN_KEY && !url.searchParams.has("adminKey")) {
    url.searchParams.set("adminKey", process.env.FLARE_INTERNAL_ADMIN_KEY);
  } else if (!url.searchParams.has("apiKey")) {
    url.searchParams.set("apiKey", FLARE_API_KEY);
  }

  const res = await fetch(url.toString(), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
      "x-flare-auth-app-id": FLARE_APP_ID,
      ...(internalUserToken ? { "x-flare-actor-token": flareToken } : {}),
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const raw = await res.text();
  const payload = (() => {
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {
        error: "upstream_non_json",
        status: res.status,
        body: raw,
      };
    }
  })();

  return { res, payload };
}

export async function requireUser(request?: CookieSourceRequest) : Promise<{ hasSession: true, user: UserSession } | { hasSession: false, response: NextResponse }> {

  const user = await getCurrentUser(request);
  
  if (!user?.session.uid || !user?.session.accessToken) {
    return {
      hasSession: false,
      response: NextResponse.json(
        { error: "oauth", message: "That was nice. But you need to Sign in" },
        { status: 401 }
      ),
    };
  }
  return { hasSession: true, user };
}

export const fetchCurrentUser = async (): Promise<AuthUser> => {
  const headerStore = await headers()
  const authUserHeader = headerStore.get(AUTH_USER_HEADER)

  if (!authUserHeader) {
    return {
      loading: false,
      id: null,
      name: undefined,
      email: undefined,
      provider: undefined,
    }
  }

  try {
    const authUser = JSON.parse(decodeURIComponent(authUserHeader)) as Partial<User> & {
      uid?: string | null,
      provider?: string;
    }
    const uid = authUser.uid ?? authUser.id ?? null

    return {
      loading: false,
      uid,
      id: uid,
      ...authUser
      // name: authUser.name,
      // email: authUser.email,
      // emailVerified: authUser.emailVerified,
      // picture: authUser.picture,
      // color: authUser.color,
      // provider: authUser.provider,

    }

  }
  catch {
    return {
      loading: false,
      id: null,
      name: undefined,
      email: undefined,
      provider: undefined,
    }
  }
}

export const fetchAuthConfig = async (): Promise<Omit<AuthConfigResponse, `csrfToken`>> => {
  const headerStore = await headers()
  const authConfigHeader = headerStore.get(`x-flare-auth-config`)

  if (!authConfigHeader) {
    return {} as Omit<AuthConfigResponse, `csrfToken`>
  }

  try {

    const authConfig = JSON.parse(decodeURIComponent(authConfigHeader)) as Partial<AuthConfigResponse>
    if ( authConfig.csrfToken ) delete authConfig.csrfToken
    return {
      ...authConfig,
    } as any

  }
  catch {
    return {} as Omit<AuthConfigResponse, `csrfToken`>
  }
}