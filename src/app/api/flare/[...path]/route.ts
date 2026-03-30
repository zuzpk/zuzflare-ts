/**
 * Catch-all proxy: routes all FlareClient auth HTTP calls through Next.js
 * so CSRF is handled entirely server-side.
 *
 * - Reads CSRF from the proxy cookie set by middleware (prefers) OR the
 *   x-flare-csrf header sent by FlareClient (in-memory token fallback).
 * - Injects both `Cookie: __flare_csrf_<appId>=<token>` AND
 *   `x-flare-csrf: <token>` into the upstream Flare request, satisfying
 *   Flare's double-submit cookie validation without the browser ever needing
 *   a Flare-domain cookie.
 * - For /auth/config responses: extracts CSRF from Flare's Set-Cookie and
 *   re-emits it as `x-flare-csrf` so FlareClient can capture the token in
 *   memory for subsequent requests.
 *
 * Static route /api/flare/csrf takes priority over this catch-all ✓
 */

import { FLARE_API_KEY, FLARE_APP_ID, FLARE_SERVER_URL } from "@/flare";
import { extractCsrfFromRequest } from "@zuzjs/flare";
import { NextRequest } from "next/server";
import { getCurrentUser } from "../../auth";

export const dynamic = "force-dynamic";

// The HttpOnly cookie Flare sets on its own domain for double-submit validation.
const FLARE_CSRF_COOKIE_NAME = `__flare_csrf_${FLARE_APP_ID}`;

type Context = { params: Promise<{ path: string[] }> };

function upsertCookie(header: string, name: string, value: string): string {
    const encodedName = encodeURIComponent(name);
    const encodedValue = encodeURIComponent(value);
    const parts = header
        .split(";")
        .map((p) => p.trim())
        .filter(Boolean)
        .filter((p) => {
            const eqIdx = p.indexOf("=");
            if (eqIdx <= 0) return true;
            const key = p.slice(0, eqIdx).trim();
            return key !== name && key !== encodedName;
        });
    parts.push(`${encodedName}=${encodedValue}`);
    return parts.join("; ");
}

async function handle(req: NextRequest, { params }: Context): Promise<Response> {
    const { path } = await params;

    // Build the upstream Flare URL, forwarding all query params.
    const flareUrl = new URL(`/${path.join("/")}`, FLARE_SERVER_URL);
    req.nextUrl.searchParams.forEach((value, key) => {
        flareUrl.searchParams.set(key, value);
    });

    // CSRF: proxy cookie set by middleware is preferred; fell back to the
    // x-flare-csrf header that FlareClient sends from its in-memory token.
    const csrfFromCookie = extractCsrfFromRequest(req, FLARE_APP_ID);
    const csrfFromHeader = req.headers.get("x-flare-csrf");
    const csrfToken = csrfFromCookie ?? csrfFromHeader ?? null;

    // Build upstream headers.
    const flareHeaders: Record<string, string> = {};

    const contentType = req.headers.get("content-type");
    if (contentType) flareHeaders["content-type"] = contentType;

    if (FLARE_API_KEY) flareHeaders["x-flare-api-key"] = FLARE_API_KEY;

    const auth = req.headers.get("authorization");
    if (auth) flareHeaders["authorization"] = auth;

    const incomingCookieHeader = req.headers.get("cookie") ?? "";
    if (incomingCookieHeader) {
        // Forward browser cookies (sid/refresh/etc.) so auth endpoints like
        // /auth/logout can invalidate the real server session.
        flareHeaders["cookie"] = incomingCookieHeader;
    }

    if (csrfToken) {
        // Satisfy Flare's double-submit CSRF check from the server side.
        // The browser never needs to hold the Flare-domain cookie.
        flareHeaders["x-flare-csrf"] = csrfToken;
        flareHeaders["cookie"] = upsertCookie(
            flareHeaders["cookie"] ?? "",
            FLARE_CSRF_COOKIE_NAME,
            csrfToken,
        );
    }

    const body =
        req.method !== "GET" && req.method !== "HEAD"
            ? await req.text().catch(() => undefined)
            : undefined;

    if ( !flareHeaders.authorization && path[0] === "auth" ) {
        const user = await getCurrentUser()
        if ( user ){
            flareHeaders["authorization"] = `Bearer ${user.accessToken}`
        }
    }
    // console.log(`[Flare Proxy] ${req.method}`, path, csrfToken, flareHeaders)

    const flareRes = await fetch(flareUrl.toString(), {
        method: req.method,
        headers: flareHeaders,
        body,
    });

    const responseBody = await flareRes.text();

    const responseHeaders = new Headers();
    responseHeaders.set(
        "content-type",
        flareRes.headers.get("content-type") ?? "application/json",
    );

    // Relay upstream Set-Cookie so browser session cookies are kept in sync
    // (notably important for /auth/logout session invalidation).
    const upstreamSetCookieValues: string[] =
        typeof (flareRes.headers as unknown as { getSetCookie?(): string[] }).getSetCookie ===
        "function"
            ? (flareRes.headers as unknown as { getSetCookie(): string[] }).getSetCookie()
            : [flareRes.headers.get("set-cookie") ?? ""].filter(Boolean);

    for (const setCookieValue of upstreamSetCookieValues) {
        responseHeaders.append("set-cookie", setCookieValue);
    }

    // Always forward x-flare-csrf when Flare includes it in the response.
    const xFlareCsrfFromFlare = flareRes.headers.get("x-flare-csrf");
    if (xFlareCsrfFromFlare) {
        responseHeaders.set("x-flare-csrf", xFlareCsrfFromFlare);
    } else if (!csrfToken) {
        // /auth/config returns the CSRF token only in a Set-Cookie header.
        // Extract it and re-emit as x-flare-csrf so FlareClient captures it
        // in memory without needing document.cookie access.
        for (const sc of upstreamSetCookieValues) {
            const pair = sc.split(";")[0]?.trim() ?? "";
            const eqIdx = pair.indexOf("=");
            if (eqIdx <= 0) continue;
            const name = decodeURIComponent(pair.slice(0, eqIdx).trim());
            if (name === FLARE_CSRF_COOKIE_NAME) {
                responseHeaders.set(
                    "x-flare-csrf",
                    decodeURIComponent(pair.slice(eqIdx + 1).trim()),
                );
                break;
            }
        }
    }

    return new Response(responseBody, {
        status: flareRes.status,
        headers: responseHeaders,
    });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
